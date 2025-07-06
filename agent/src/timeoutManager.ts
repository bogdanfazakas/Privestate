/**
 * Timeout management system for enforcing job-level timeouts
 * Provides comprehensive timeout enforcement with cancellation and cleanup
 */

import {
	AttestationErrorCode,
	AttestationException,
	createAttestationError,
} from "./attestationErrors";

export interface TimeoutConfig {
	readonly jobTimeoutMs: number;
	readonly attestationTimeoutMs: number;
	readonly c2dTimeoutMs: number;
	readonly enableTimeoutLogging: boolean;
}

export interface TimeoutResult<T> {
	readonly success: boolean;
	readonly result?: T;
	readonly error?: AttestationException;
	readonly duration: number;
	readonly timedOut: boolean;
	readonly cancelled: boolean;
}

export interface TimeoutMetadata {
	readonly operationType: string;
	readonly startTime: number;
	readonly timeoutMs: number;
	readonly jobId?: string;
}

/**
 * Timeout manager for orchestrating timeout enforcement across operations
 */
export class TimeoutManager {
	private readonly config: TimeoutConfig;
	private activeOperations = new Map<string, AbortController>();
	private operationMetadata = new Map<string, TimeoutMetadata>();

	constructor(config: Partial<TimeoutConfig> = {}) {
		this.config = {
			jobTimeoutMs: config.jobTimeoutMs || 5 * 60 * 1000, // 5 minutes
			attestationTimeoutMs: config.attestationTimeoutMs || 2 * 60 * 1000, // 2 minutes
			c2dTimeoutMs: config.c2dTimeoutMs || 4 * 60 * 1000, // 4 minutes (leave 1 minute for cleanup)
			enableTimeoutLogging: config.enableTimeoutLogging ?? true,
		};
	}

	/**
	 * Execute an operation with comprehensive timeout enforcement
	 * @param operation Function to execute
	 * @param operationType Type of operation for logging
	 * @param timeoutMs Custom timeout (optional)
	 * @param jobId Job identifier for tracking
	 * @returns Promise with timeout result
	 */
	public async executeWithTimeout<T>(
		operation: (signal: AbortSignal) => Promise<T>,
		operationType: string,
		timeoutMs?: number,
		jobId?: string
	): Promise<TimeoutResult<T>> {
		const effectiveTimeout = timeoutMs || this.getDefaultTimeout(operationType);
		const operationId = this.generateOperationId(operationType);
		const startTime = Date.now();

		// Create abort controller for cancellation
		const abortController = new AbortController();

		// Store operation metadata
		const metadata: TimeoutMetadata = {
			operationType,
			startTime,
			timeoutMs: effectiveTimeout,
			jobId,
		};

		this.activeOperations.set(operationId, abortController);
		this.operationMetadata.set(operationId, metadata);

		if (this.config.enableTimeoutLogging) {
			console.log(
				`⏰ Starting ${operationType} with ${
					effectiveTimeout / 1000
				}s timeout ${jobId ? `(Job: ${jobId})` : ""}`
			);
		}

		try {
			// Create timeout promise
			const timeoutPromise = new Promise<never>((_, reject) => {
				const timeoutId = setTimeout(() => {
					abortController.abort();
					reject(this.createTimeoutError(operationType, effectiveTimeout));
				}, effectiveTimeout);

				// Clear timeout if operation completes
				abortController.signal.addEventListener("abort", () => {
					clearTimeout(timeoutId);
				});
			});

			// Race between operation and timeout
			const result = await Promise.race([
				operation(abortController.signal),
				timeoutPromise,
			]);

			const duration = Date.now() - startTime;

			if (this.config.enableTimeoutLogging) {
				console.log(`✅ ${operationType} completed in ${duration}ms`);
			}

			return {
				success: true,
				result,
				duration,
				timedOut: false,
				cancelled: false,
			};
		} catch (error) {
			const duration = Date.now() - startTime;

			if (abortController.signal.aborted) {
				const timeoutError =
					error instanceof AttestationException
						? error
						: createAttestationError(AttestationErrorCode.OPERATION_CANCELLED);

				if (this.config.enableTimeoutLogging) {
					console.error(`⏰ ${operationType} timed out after ${duration}ms`);
				}

				return {
					success: false,
					error: timeoutError,
					duration,
					timedOut: true,
					cancelled: true,
				};
			}

			// Other errors
			const wrappedError =
				error instanceof AttestationException
					? error
					: createAttestationError(
							AttestationErrorCode.OPERATION_CANCELLED,
							`${operationType} failed: ${
								error instanceof Error ? error.message : "Unknown error"
							}`
					  );

			if (this.config.enableTimeoutLogging) {
				console.error(`❌ ${operationType} failed after ${duration}ms:`, error);
			}

			return {
				success: false,
				error: wrappedError,
				duration,
				timedOut: false,
				cancelled: false,
			};
		} finally {
			// Cleanup
			this.cleanupOperation(operationId);
		}
	}

	/**
	 * Execute job with comprehensive timeout and cancellation support
	 * @param jobOperation Job execution function
	 * @param jobId Job identifier
	 * @returns Promise with job result
	 */
	public async executeJob<T>(
		jobOperation: (signal: AbortSignal) => Promise<T>,
		jobId: string
	): Promise<TimeoutResult<T>> {
		const result = await this.executeWithTimeout(
			jobOperation,
			"job-execution",
			this.config.jobTimeoutMs,
			jobId
		);

		// Add specific job timeout handling
		if (result.timedOut) {
			const jobTimeoutError = createAttestationError(
				AttestationErrorCode.JOB_TIMEOUT,
				`Job ${jobId} exceeded the maximum execution time of ${
					this.config.jobTimeoutMs / 1000
				} seconds`
			);

			return {
				...result,
				error: jobTimeoutError,
			};
		}

		return result;
	}

	/**
	 * Execute attestation with timeout
	 * @param attestationOperation Attestation function
	 * @param jobId Job identifier
	 * @returns Promise with attestation result
	 */
	public async executeAttestation<T>(
		attestationOperation: (signal: AbortSignal) => Promise<T>,
		jobId?: string
	): Promise<TimeoutResult<T>> {
		const result = await this.executeWithTimeout(
			attestationOperation,
			"attestation",
			this.config.attestationTimeoutMs,
			jobId
		);

		// Add specific attestation timeout handling
		if (result.timedOut) {
			const attestationTimeoutError = createAttestationError(
				AttestationErrorCode.ATTESTATION_TIMEOUT,
				`Attestation verification exceeded the maximum time of ${
					this.config.attestationTimeoutMs / 1000
				} seconds`
			);

			return {
				...result,
				error: attestationTimeoutError,
			};
		}

		return result;
	}

	/**
	 * Execute C2D operation with timeout
	 * @param c2dOperation C2D function
	 * @param jobId Job identifier
	 * @returns Promise with C2D result
	 */
	public async executeC2D<T>(
		c2dOperation: (signal: AbortSignal) => Promise<T>,
		jobId?: string
	): Promise<TimeoutResult<T>> {
		const result = await this.executeWithTimeout(
			c2dOperation,
			"c2d-execution",
			this.config.c2dTimeoutMs,
			jobId
		);

		// Add specific C2D timeout handling
		if (result.timedOut) {
			const c2dTimeoutError = createAttestationError(
				AttestationErrorCode.C2D_TIMEOUT,
				`C2D execution exceeded the maximum time of ${
					this.config.c2dTimeoutMs / 1000
				} seconds`
			);

			return {
				...result,
				error: c2dTimeoutError,
			};
		}

		return result;
	}

	/**
	 * Cancel all active operations
	 * @param reason Cancellation reason
	 */
	public cancelAllOperations(reason: string = "Job cancelled"): void {
		console.log(
			`🚫 Cancelling ${this.activeOperations.size} active operations: ${reason}`
		);

		for (const [operationId, controller] of this.activeOperations) {
			const metadata = this.operationMetadata.get(operationId);
			if (metadata && this.config.enableTimeoutLogging) {
				const duration = Date.now() - metadata.startTime;
				console.log(
					`🚫 Cancelling ${metadata.operationType} after ${duration}ms`
				);
			}
			controller.abort();
		}

		this.cleanup();
	}

	/**
	 * Cancel specific operation by ID
	 * @param operationId Operation identifier
	 * @param reason Cancellation reason
	 */
	public cancelOperation(
		operationId: string,
		reason: string = "Operation cancelled"
	): void {
		const controller = this.activeOperations.get(operationId);
		const metadata = this.operationMetadata.get(operationId);

		if (controller && metadata) {
			const duration = Date.now() - metadata.startTime;
			console.log(
				`🚫 Cancelling ${metadata.operationType} after ${duration}ms: ${reason}`
			);
			controller.abort();
			this.cleanupOperation(operationId);
		}
	}

	/**
	 * Get active operations count
	 * @returns Number of active operations
	 */
	public getActiveOperationsCount(): number {
		return this.activeOperations.size;
	}

	/**
	 * Get active operations summary
	 * @returns Array of operation summaries
	 */
	public getActiveOperationsSummary(): Array<{
		operationType: string;
		duration: number;
		timeoutMs: number;
		jobId?: string;
	}> {
		const now = Date.now();
		const summary: Array<{
			operationType: string;
			duration: number;
			timeoutMs: number;
			jobId?: string;
		}> = [];

		for (const [operationId, metadata] of this.operationMetadata) {
			summary.push({
				operationType: metadata.operationType,
				duration: now - metadata.startTime,
				timeoutMs: metadata.timeoutMs,
				jobId: metadata.jobId,
			});
		}

		return summary;
	}

	/**
	 * Check if operation should be aborted due to external factors
	 * @param signal Abort signal to check
	 * @throws AttestationException if operation should be aborted
	 */
	public static checkAbortSignal(signal?: AbortSignal): void {
		if (signal?.aborted) {
			throw createAttestationError(
				AttestationErrorCode.OPERATION_CANCELLED,
				"Operation was cancelled"
			);
		}
	}

	/**
	 * Create a promise that resolves after specified delay or throws if aborted
	 * @param delayMs Delay in milliseconds
	 * @param signal Abort signal
	 * @returns Promise that resolves after delay
	 */
	public static async delay(
		delayMs: number,
		signal?: AbortSignal
	): Promise<void> {
		return new Promise((resolve, reject) => {
			const timeoutId = setTimeout(resolve, delayMs);

			if (signal) {
				const abortHandler = () => {
					clearTimeout(timeoutId);
					reject(
						createAttestationError(
							AttestationErrorCode.OPERATION_CANCELLED,
							"Delay was cancelled"
						)
					);
				};

				if (signal.aborted) {
					clearTimeout(timeoutId);
					reject(
						createAttestationError(
							AttestationErrorCode.OPERATION_CANCELLED,
							"Delay was cancelled"
						)
					);
					return;
				}

				signal.addEventListener("abort", abortHandler, { once: true });
			}
		});
	}

	/**
	 * Get default timeout for operation type
	 * @param operationType Type of operation
	 * @returns Timeout in milliseconds
	 */
	private getDefaultTimeout(operationType: string): number {
		switch (operationType) {
			case "attestation":
				return this.config.attestationTimeoutMs;
			case "c2d-execution":
				return this.config.c2dTimeoutMs;
			case "job-execution":
				return this.config.jobTimeoutMs;
			default:
				return this.config.jobTimeoutMs; // Default to job timeout
		}
	}

	/**
	 * Create timeout error for specific operation type
	 * @param operationType Type of operation
	 * @param timeoutMs Timeout value
	 * @returns Attestation exception
	 */
	private createTimeoutError(
		operationType: string,
		timeoutMs: number
	): AttestationException {
		switch (operationType) {
			case "attestation":
				return createAttestationError(
					AttestationErrorCode.ATTESTATION_TIMEOUT,
					`Attestation timed out after ${timeoutMs / 1000} seconds`
				);
			case "c2d-execution":
				return createAttestationError(
					AttestationErrorCode.C2D_TIMEOUT,
					`C2D execution timed out after ${timeoutMs / 1000} seconds`
				);
			case "job-execution":
				return createAttestationError(
					AttestationErrorCode.JOB_TIMEOUT,
					`Job timed out after ${timeoutMs / 1000} seconds`
				);
			default:
				return createAttestationError(
					AttestationErrorCode.OPERATION_CANCELLED,
					`Operation ${operationType} timed out after ${
						timeoutMs / 1000
					} seconds`
				);
		}
	}

	/**
	 * Generate unique operation ID
	 * @param operationType Type of operation
	 * @returns Unique operation identifier
	 */
	private generateOperationId(operationType: string): string {
		return `${operationType}-${Date.now()}-${Math.random()
			.toString(36)
			.substr(2, 8)}`;
	}

	/**
	 * Cleanup specific operation
	 * @param operationId Operation identifier
	 */
	private cleanupOperation(operationId: string): void {
		this.activeOperations.delete(operationId);
		this.operationMetadata.delete(operationId);
	}

	/**
	 * Cleanup all operations
	 */
	private cleanup(): void {
		this.activeOperations.clear();
		this.operationMetadata.clear();
	}
}

/**
 * Create timeout manager with default configuration
 * @param config Optional timeout configuration
 * @returns Configured timeout manager
 */
export function createTimeoutManager(
	config?: Partial<TimeoutConfig>
): TimeoutManager {
	return new TimeoutManager(config);
}
