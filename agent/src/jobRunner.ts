/**
 * Job runner module for orchestrating agent workflow with comprehensive timeout enforcement
 */

import { getDefaultConfig, type AgentConfig } from "./agentCore";
import {
	createSelfAttestationService,
	type AttestationResult,
	type ProofCriteria,
} from "./selfAttestation";
import { createOceanC2DService, type C2DJobStatus } from "./triggerC2D";
import {
	AttestationException,
	AttestationErrorCode,
	type AttestationError,
	type AttestationFailureDetails,
	ATTESTATION_ERROR_CATALOG,
} from "./attestationErrors";
import {
	createTimeoutManager,
	TimeoutManager,
	type TimeoutResult,
} from "./timeoutManager";
import {
	createJobMetadataLogger,
	type JobMetadata,
	type JobResult,
	type JobMetadataLogger,
} from "./jobMetadataLogger";

// JobResult and JobMetadata are now imported from jobMetadataLogger.ts
export { type JobResult, type JobMetadata } from "./jobMetadataLogger";

interface MutableJobMetadata {
	jobId: string;
	startTime: number;
	endTime?: number;
	status: "pending" | "running" | "completed" | "failed" | "timeout";
	retryCount?: number;
	lastError?: AttestationError;
	duration?: number;
	timedOut?: boolean;
	cancelled?: boolean;
	progress?: number;
	version: string;
	metadata?: {
		readonly configHash?: string;
		readonly environment?: string;
		readonly userAgent?: string;
		readonly platform?: string;
	};
}

export interface JobRetryConfig {
	readonly maxRetries: number;
	readonly retryDelayMs: number;
	readonly retryableErrorCategories: string[];
}

/**
 * Run the complete agent job workflow with comprehensive timeout enforcement
 * @param config Optional configuration overrides
 * @returns Promise that resolves with job result
 */
export async function runJob(
	config?: Partial<AgentConfig>
): Promise<JobResult> {
	const fullConfig = { ...getDefaultConfig(), ...config };
	const jobId = generateJobId();

	console.log(
		`🚀 Starting job ${jobId} with ${fullConfig.timeoutMs / 1000}s timeout...`
	);

	const metadata: MutableJobMetadata = {
		jobId,
		startTime: Date.now(),
		status: "running",
		retryCount: 0,
		version: "1.0.0",
	};

	// Initialize job metadata logger
	const logger = createJobMetadataLogger();
	await logger.initialize();

	const retryConfig: JobRetryConfig = {
		maxRetries: 3,
		retryDelayMs: 2000,
		retryableErrorCategories: ["verification", "authentication"],
	};

	// Create timeout manager
	const timeoutManager = createTimeoutManager({
		jobTimeoutMs: fullConfig.timeoutMs,
		enableTimeoutLogging: true,
	});

	try {
		// Execute job with comprehensive timeout enforcement
		const timeoutResult = await timeoutManager.executeJob(
			async (signal: AbortSignal) => {
				return await executeJobWithRetries(
					fullConfig,
					metadata,
					retryConfig,
					timeoutManager,
					signal
				);
			},
			jobId
		);

		// Handle timeout result
		if (!timeoutResult.success) {
			// Job timed out or was cancelled
			const finalMetadata: JobMetadata = {
				...metadata,
				status: timeoutResult.timedOut ? "timeout" : "failed",
				endTime: Date.now(),
				duration: timeoutResult.duration,
				timedOut: timeoutResult.timedOut,
			};

			const result: JobResult = {
				success: false,
				message: timeoutResult.error?.userMessage || "Job execution failed",
				timestamp: Date.now(),
				error: timeoutResult.error
					? {
							code: timeoutResult.error.errorCode,
							message: timeoutResult.error.message,
							userMessage: timeoutResult.error.userMessage,
							retryable: timeoutResult.error.retryable,
							category: timeoutResult.error.category as
								| "verification"
								| "authentication"
								| "authorization"
								| "configuration",
							suggestions: timeoutResult.error.suggestions,
					  }
					: undefined,
				duration: timeoutResult.duration,
				timedOut: timeoutResult.timedOut,
				cancelled: timeoutResult.cancelled,
			};

			// Log timeout information
			if (timeoutResult.timedOut) {
				console.error(
					`⏰ Job ${jobId} timed out after ${timeoutResult.duration}ms`
				);
				console.error(
					"💡 The job exceeded the 5-minute time limit and was automatically cancelled."
				);
				console.error("   You can try again with a fresh session.");
			}

			// Log and persist job data
			logger.logJobMetadata(finalMetadata, result);
			await logger.persistJobData(finalMetadata, result);

			return result;
		}

		// Job completed successfully
		const finalMetadata: JobMetadata = {
			...metadata,
			status: "completed",
			endTime: Date.now(),
			duration: timeoutResult.duration,
			timedOut: false,
		};

		const successResult = {
			...timeoutResult.result!,
			duration: timeoutResult.duration,
			timedOut: false,
			cancelled: false,
		};

		// Log and persist job data
		logger.logJobMetadata(finalMetadata, successResult);
		await logger.persistJobData(finalMetadata, successResult);

		return successResult;
	} catch (error) {
		// Unexpected error outside timeout system
		console.error("💥 Unexpected job execution error:", error);

		const finalMetadata: JobMetadata = {
			...metadata,
			status: "failed",
			endTime: Date.now(),
			duration: Date.now() - metadata.startTime,
		};

		const errorResult = {
			success: false,
			message: `Unexpected job failure: ${
				error instanceof Error ? error.message : "Unknown error"
			}`,
			timestamp: Date.now(),
			duration: Date.now() - metadata.startTime,
		};

		// Log and persist job data
		logger.logJobMetadata(finalMetadata, errorResult);
		await logger.persistJobData(finalMetadata, errorResult);

		return errorResult;
	} finally {
		// Ensure all operations are cancelled and cleaned up
		const activeOps = timeoutManager.getActiveOperationsCount();
		if (activeOps > 0) {
			console.log(`🧹 Cleaning up ${activeOps} remaining operations...`);
			timeoutManager.cancelAllOperations("Job completed or failed");
		}
	}
}

/**
 * Execute job with retry logic and timeout awareness
 * @param config Job configuration
 * @param metadata Job metadata
 * @param retryConfig Retry configuration
 * @param timeoutManager Timeout manager
 * @param signal Abort signal for cancellation
 * @returns Promise with job result
 */
async function executeJobWithRetries(
	config: AgentConfig,
	metadata: MutableJobMetadata,
	retryConfig: JobRetryConfig,
	timeoutManager: TimeoutManager,
	signal: AbortSignal
): Promise<JobResult> {
	// Main job execution with retry logic
	for (let attempt = 0; attempt <= retryConfig.maxRetries; attempt++) {
		try {
			const result = await executeJobAttempt(
				config,
				metadata,
				attempt,
				timeoutManager,
				signal
			);

			// Success - update metadata and return
			metadata.retryCount = attempt;
			return result;
		} catch (error) {
			console.error(`Job attempt ${attempt + 1} failed:`, error);

			// Handle attestation errors with detailed reporting
			if (error instanceof AttestationException) {
				const shouldRetry =
					attempt < retryConfig.maxRetries &&
					error.retryable &&
					retryConfig.retryableErrorCategories.includes(error.category);

				if (shouldRetry) {
					console.log(
						`⏱️  Retrying job in ${retryConfig.retryDelayMs}ms... (${error.userMessage})`
					);
					console.log(`💡 Suggestions: ${error.suggestions.join(", ")}`);

					// Use timeout-aware delay
					await TimeoutManager.delay(retryConfig.retryDelayMs, signal);

					// Update metadata for retry
					metadata.retryCount = attempt + 1;
					metadata.lastError = {
						code: error.errorCode,
						message: error.message,
						userMessage: error.userMessage,
						retryable: error.retryable,
						category: error.category as
							| "verification"
							| "authentication"
							| "authorization"
							| "configuration",
						suggestions: error.suggestions,
					};

					continue; // Try again
				} else {
					// Max retries reached or non-retryable error
					throw error; // Re-throw to be handled by timeout system
				}
			}

			// Handle other errors - re-throw to be handled by timeout system
			throw error;
		}
	}

	// This should never be reached due to the loop structure
	throw new Error("Unexpected job execution flow");
}

/**
 * Execute a single job attempt with timeout enforcement
 * @param config Job configuration
 * @param metadata Job metadata
 * @param attempt Attempt number
 * @param timeoutManager Timeout manager
 * @param signal Abort signal for cancellation
 * @returns Promise with job result
 */
async function executeJobAttempt(
	config: AgentConfig,
	metadata: JobMetadata,
	attempt: number,
	timeoutManager: TimeoutManager,
	signal: AbortSignal
): Promise<JobResult> {
	// Check if job should be cancelled before starting attempt
	TimeoutManager.checkAbortSignal(signal);

	// Step 1: Initialize and verify attestation with timeout
	console.log(`Attempt ${attempt + 1}: Verifying user attestation...`);

	const attestationResult = await timeoutManager.executeAttestation(
		async (attestationSignal: AbortSignal) => {
			return await executeAttestationStep(config, attempt, attestationSignal);
		},
		metadata.jobId
	);

	if (!attestationResult.success) {
		throw attestationResult.error!;
	}

	// Check cancellation before proceeding to C2D
	TimeoutManager.checkAbortSignal(signal);

	// Step 2: Execute C2D with timeout
	console.log(`Attempt ${attempt + 1}: Executing Compute-to-Data job...`);

	const c2dResult = await timeoutManager.executeC2D(
		async (c2dSignal: AbortSignal) => {
			return await executeC2DStep(config, attempt, c2dSignal);
		},
		metadata.jobId
	);

	if (!c2dResult.success) {
		throw c2dResult.error!;
	}

	// Job completed successfully
	const result: JobResult = {
		success: true,
		message:
			"Job completed successfully with verified attestation and C2D execution",
		timestamp: Date.now(),
		attestationResult: attestationResult.result!,
		c2dJobStatus: c2dResult.result!,
	};

	return result;
}

/**
 * Execute attestation step with timeout awareness
 * @param config Job configuration
 * @param attempt Attempt number
 * @param signal Abort signal
 * @returns Promise with attestation result
 */
async function executeAttestationStep(
	config: AgentConfig,
	attempt: number,
	signal: AbortSignal
): Promise<AttestationResult> {
	// Initialize Self Protocol attestation service
	console.log(
		`Attempt ${attempt + 1}: Initializing Self Protocol attestation service...`
	);

	const attestationService = createSelfAttestationService({
		selfApiKey: config.selfProtocolConfig.apiKey,
		selfEndpoint: config.selfProtocolConfig.endpoint,
		enableMockFailures: process.env.NODE_ENV === "development",
	});

	try {
		await attestationService.initialize();
	} catch (error) {
		if (error instanceof AttestationException) {
			// Add context about initialization failure
			if (error.errorCode === AttestationErrorCode.MISSING_API_KEY) {
				console.error(
					"❌ Self Protocol API key is missing. Please check your configuration."
				);
			} else if (
				error.errorCode === AttestationErrorCode.ATTESTATION_SERVICE_UNAVAILABLE
			) {
				console.error(
					"❌ Self Protocol service is unreachable. Please check your network connection."
				);
			}
		}
		throw error;
	}

	// Check cancellation after initialization
	TimeoutManager.checkAbortSignal(signal);

	// Verify Self Protocol attestation (age, residency, role)
	const userDid = process.env.USER_DID || "did:example:user123";

	const attestationCriteria: ProofCriteria = {
		requireAge: {
			minimumAge: 18,
			ageRangeOnly: true,
		},
		requireResidency: {
			allowedCountries: ["US", "CA", "GB", "AU"],
			blockedCountries: ["KP", "IR", "SY"],
		},
		requireRole: {
			requiredRoles: ["real_estate_professional", "data_analyst", "researcher"],
			minimumVerificationLevel: "basic",
		},
		requireIdentity: {
			requireHuman: true,
			requireUnique: true,
			maxRiskScore: 30,
		},
	};

	let attestationResult: AttestationResult;

	try {
		attestationResult = await attestationService.verifyComprehensive(
			userDid,
			attestationCriteria
		);
	} catch (error) {
		if (error instanceof AttestationException) {
			console.error(`❌ Attestation verification failed: ${error.userMessage}`);

			if (error.suggestions.length > 0) {
				console.log("💡 Suggestions:");
				error.suggestions.forEach((suggestion) => {
					console.log(`   • ${suggestion}`);
				});
			}

			if (error.details) {
				console.log("📋 Verification Details:");
				console.log(
					`   Failed checks: ${error.details.failedChecks.join(", ")}`
				);
				console.log(
					`   Recommendations: ${error.details.recommendations.join(", ")}`
				);
			}
		}
		throw error;
	}

	// Check cancellation after attestation verification
	TimeoutManager.checkAbortSignal(signal);

	// Validate attestation result
	if (!attestationResult.isValid) {
		const failureDetails = attestationResult.failureDetails;

		if (failureDetails) {
			console.error("❌ Attestation verification failed:");
			console.error(
				`   Failed checks: ${failureDetails.failedChecks.join(", ")}`
			);
			console.error(
				`   Recommendations: ${failureDetails.recommendations.join(", ")}`
			);

			const errorCode = determineErrorCodeFromFailures(
				failureDetails.failedChecks
			);

			throw new AttestationException(
				ATTESTATION_ERROR_CATALOG[errorCode],
				failureDetails
			);
		} else {
			throw new AttestationException(
				ATTESTATION_ERROR_CATALOG[
					AttestationErrorCode.IDENTITY_VERIFICATION_FAILED
				]
			);
		}
	}

	console.log("✅ Attestation verified successfully:", {
		age: attestationResult.verifiedClaims.age?.ageRange,
		country: attestationResult.verifiedClaims.residency?.country,
		role: attestationResult.verifiedClaims.role?.verificationLevel,
		riskScore: attestationResult.verifiedClaims.identity?.riskScore,
	});

	return attestationResult;
}

/**
 * Execute C2D step with timeout awareness
 * @param config Job configuration
 * @param attempt Attempt number
 * @param signal Abort signal
 * @returns Promise with C2D job status
 */
async function executeC2DStep(
	config: AgentConfig,
	attempt: number,
	signal: AbortSignal
): Promise<C2DJobStatus> {
	// Initialize Ocean Protocol C2D service
	console.log(
		`Attempt ${attempt + 1}: Initializing Ocean Protocol C2D service...`
	);

	const c2dService = createOceanC2DService({
		oceanNodeUrl: config.oceanProtocolConfig.endpoint,
		timeoutMs: config.timeoutMs - 60000, // Reserve 1 minute for job cleanup
	});

	await c2dService.initialize();

	// Check cancellation after C2D initialization
	TimeoutManager.checkAbortSignal(signal);

	// Start C2D job
	console.log(`Attempt ${attempt + 1}: Starting Compute-to-Data job...`);
	const c2dJobId = await c2dService.startC2DJob();

	// Check cancellation after job submission
	TimeoutManager.checkAbortSignal(signal);

	// Monitor job progress with timeout awareness
	console.log(`C2D job started with ID: ${c2dJobId}`);

	// Note: The C2D service already has its own timeout mechanisms,
	// but we still need to respect the abort signal for early cancellation
	const c2dJobStatus = await monitorC2DJobWithCancellation(
		c2dService,
		c2dJobId,
		signal
	);

	if (c2dJobStatus.status === "failed" || c2dJobStatus.status === "timeout") {
		throw new Error(`C2D job failed: ${c2dJobStatus.error || "Unknown error"}`);
	}

	console.log("✅ C2D job completed successfully:", {
		jobId: c2dJobStatus.jobId,
		status: c2dJobStatus.status,
		duration: c2dJobStatus.duration,
		progress: c2dJobStatus.progress,
	});

	return c2dJobStatus;
}

/**
 * Monitor C2D job with cancellation support
 * @param c2dService Ocean C2D service
 * @param jobId C2D job ID
 * @param signal Abort signal
 * @returns Promise with job status
 */
async function monitorC2DJobWithCancellation(
	c2dService: any,
	jobId: string,
	signal: AbortSignal
): Promise<C2DJobStatus> {
	// Create a promise that resolves when the signal is aborted
	const cancellationPromise = new Promise<never>((_, reject) => {
		if (signal.aborted) {
			reject(
				new AttestationException(
					ATTESTATION_ERROR_CATALOG[AttestationErrorCode.OPERATION_CANCELLED]
				)
			);
			return;
		}

		signal.addEventListener(
			"abort",
			() => {
				reject(
					new AttestationException(
						ATTESTATION_ERROR_CATALOG[AttestationErrorCode.OPERATION_CANCELLED]
					)
				);
			},
			{ once: true }
		);
	});

	// Race between C2D polling and cancellation
	try {
		return await Promise.race([
			c2dService.pollJobStatus(jobId),
			cancellationPromise,
		]);
	} catch (error) {
		if (signal.aborted) {
			console.log(`🚫 C2D job ${jobId} monitoring cancelled due to timeout`);
			// Note: In a real implementation, we might want to try to cancel the actual C2D job here
		}
		throw error;
	}
}

/**
 * Determine the most appropriate error code based on failed checks
 * @param failedChecks Array of failed check descriptions
 * @returns Appropriate error code
 */
function determineErrorCodeFromFailures(
	failedChecks: string[]
): AttestationErrorCode {
	const checks = failedChecks.map((check) => check.toLowerCase());

	// Check for specific failure patterns
	if (
		checks.some(
			(check) => check.includes("age") || check.includes("minimum age")
		)
	) {
		return AttestationErrorCode.UNDER_MINIMUM_AGE;
	}

	if (checks.some((check) => check.includes("country not allowed"))) {
		return AttestationErrorCode.COUNTRY_NOT_ALLOWED;
	}

	if (checks.some((check) => check.includes("country blocked"))) {
		return AttestationErrorCode.COUNTRY_BLOCKED;
	}

	if (
		checks.some(
			(check) =>
				check.includes("professional role") ||
				check.includes("invalid professional")
		)
	) {
		return AttestationErrorCode.INVALID_PROFESSIONAL_ROLE;
	}

	if (
		checks.some(
			(check) =>
				check.includes("verification level") || check.includes("insufficient")
		)
	) {
		return AttestationErrorCode.INSUFFICIENT_ROLE_LEVEL;
	}

	if (checks.some((check) => check.includes("human verification"))) {
		return AttestationErrorCode.NOT_HUMAN_VERIFIED;
	}

	if (
		checks.some(
			(check) => check.includes("uniqueness") || check.includes("duplicate")
		)
	) {
		return AttestationErrorCode.DUPLICATE_IDENTITY;
	}

	if (checks.some((check) => check.includes("risk score"))) {
		return AttestationErrorCode.HIGH_RISK_SCORE;
	}

	// Default to generic verification failure
	return AttestationErrorCode.IDENTITY_VERIFICATION_FAILED;
}

/**
 * Generate a unique job ID
 * @returns Job ID string
 */
function generateJobId(): string {
	return `job-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Job metadata logging is now handled by the JobMetadataLogger class
