import { ASI1MiniClient } from "../clients/asi1mini";
import {
	PostProcessingInput,
	PostProcessingResponse,
	PostProcessingConfig,
} from "../interfaces/PostProcessingResponse";

/**
 * PostProcessingManager orchestrates the different post-processing clients
 * and handles fallback scenarios.
 */
export class PostProcessingManager {
	private asi1MiniClient: ASI1MiniClient;
	private config: PostProcessingConfig;
	private logger: Console;

	constructor(config: PostProcessingConfig) {
		this.config = config;
		this.logger = console;

		// Initialize ASI-1 mini client
		this.asi1MiniClient = new ASI1MiniClient(config.asi1Mini);
	}

	/**
	 * Process C2D output with automatic fallback handling
	 */
	async processC2DOutput(
		input: PostProcessingInput
	): Promise<PostProcessingResponse> {
		const startTime = Date.now();

		try {
			this.logger.log(
				`[PostProcessingManager] Starting processing for job: ${input.jobMetadata.jobId}`
			);

			// Try ASI-1 mini first
			const response = await this.tryASI1Mini(input);

			if (response.status === "success") {
				this.logger.log(
					`[PostProcessingManager] Successfully processed job: ${input.jobMetadata.jobId}`
				);
				return response;
			}

			// If ASI-1 mini fails and fallback is enabled, try fallback
			if (this.config.general.enableFallback) {
				this.logger.warn(
					`[PostProcessingManager] ASI-1 mini failed, attempting fallback for job: ${input.jobMetadata.jobId}`
				);
				return await this.tryFallback(input);
			}

			// Return the failed response if no fallback
			return response;
		} catch (error) {
			this.logger.error(
				`[PostProcessingManager] Critical error processing job ${input.jobMetadata.jobId}:`,
				error
			);

			return {
				jobId: input.jobMetadata.jobId,
				status: "error",
				timestamp: Date.now(),
				processingTimeMs: Date.now() - startTime,
				source: "manager",
				results: {
					summary: "",
					insights: [],
					metadata: {
						originalDataSize: 0,
						processingMethod: "manager",
						confidence: 0,
					},
				},
				error: {
					code: "CRITICAL_ERROR",
					message:
						error instanceof Error ? error.message : "Unknown critical error",
					details: error instanceof Error ? { stack: error.stack } : { error },
				},
			};
		}
	}

	/**
	 * Try processing with ASI-1 mini
	 */
	private async tryASI1Mini(
		input: PostProcessingInput
	): Promise<PostProcessingResponse> {
		try {
			return await this.asi1MiniClient.processC2DOutput(input);
		} catch (error) {
			this.logger.error(
				"[PostProcessingManager] ASI-1 mini processing failed:",
				error
			);

			return {
				jobId: input.jobMetadata.jobId,
				status: "error",
				timestamp: Date.now(),
				processingTimeMs: 0,
				source: "asi1mini",
				results: {
					summary: "",
					insights: [],
					metadata: {
						originalDataSize: 0,
						processingMethod: "asi1mini",
						confidence: 0,
					},
				},
				error: {
					code: "ASI1_MINI_ERROR",
					message:
						error instanceof Error
							? error.message
							: "ASI-1 mini processing failed",
					details: error instanceof Error ? { stack: error.stack } : { error },
				},
			};
		}
	}

	/**
	 * Try processing with fallback provider
	 */
	private async tryFallback(
		input: PostProcessingInput
	): Promise<PostProcessingResponse> {
		// TODO: Implement fallback providers
		this.logger.log(
			"[PostProcessingManager] Fallback processing not yet implemented"
		);

		return {
			jobId: input.jobMetadata.jobId,
			status: "error",
			timestamp: Date.now(),
			processingTimeMs: 0,
			source: "fallback",
			results: {
				summary: "",
				insights: [],
				metadata: {
					originalDataSize: 0,
					processingMethod: "fallback",
					confidence: 0,
				},
			},
			error: {
				code: "FALLBACK_NOT_IMPLEMENTED",
				message: "Fallback processing is not yet implemented",
				details: { provider: this.config.fallback?.provider || "unknown" },
			},
		};
	}

	/**
	 * Health check for all post-processing services
	 */
	async healthCheck(): Promise<{
		overall: "healthy" | "degraded" | "unhealthy";
		services: {
			asi1Mini: boolean;
			fallback: boolean;
		};
	}> {
		const asi1MiniHealth = await this.asi1MiniClient.healthCheck();
		const fallbackHealth = true; // TODO: Implement fallback health check

		let overall: "healthy" | "degraded" | "unhealthy" = "healthy";

		if (!asi1MiniHealth && !fallbackHealth) {
			overall = "unhealthy";
		} else if (!asi1MiniHealth || !fallbackHealth) {
			overall = "degraded";
		}

		return {
			overall,
			services: {
				asi1Mini: asi1MiniHealth,
				fallback: fallbackHealth,
			},
		};
	}

	/**
	 * Get configuration
	 */
	getConfig(): PostProcessingConfig {
		return { ...this.config };
	}

	/**
	 * Update configuration
	 */
	updateConfig(newConfig: Partial<PostProcessingConfig>): void {
		this.config = { ...this.config, ...newConfig };

		// Reinitialize clients if needed
		if (newConfig.asi1Mini) {
			this.asi1MiniClient = new ASI1MiniClient(this.config.asi1Mini);
		}
	}
}
