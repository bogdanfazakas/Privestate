/**
 * Post-Processing Module for AI Platform
 *
 * This module provides post-processing capabilities for C2D output
 * using ASI-1 mini SDK and fallback providers.
 */

// Export interfaces
export {
	PostProcessingResponse,
	PostProcessingInput,
	PostProcessingConfig,
} from "./interfaces/PostProcessingResponse";

// Export clients
export { ASI1MiniClient } from "./clients/asi1mini";

// Export utilities and helpers
export { PostProcessingManager } from "./managers/PostProcessingManager";
export { getEnvironmentConfig, getTestConfig } from "./config/environment";

// Version and metadata
export const VERSION = "1.0.0";
export const SUPPORTED_PROVIDERS = ["asi1mini"] as const;
