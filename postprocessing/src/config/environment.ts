/**
 * Environment configuration for ASI-1 mini integration
 */
export const getEnvironmentConfig = () => ({
	asi1Mini: {
		apiKey: process.env.ASI1_MINI_API_KEY || "",
		endpoint: process.env.ASI1_MINI_ENDPOINT || "https://api.asi1.ai/v1",
		timeout: parseInt(process.env.ASI1_MINI_TIMEOUT || "30000"),
		retryCount: parseInt(process.env.ASI1_MINI_RETRY_COUNT || "3"),
	},
	fallback: {
		provider: "asi1mini",
		apiKey: process.env.ASI1_MINI_API_KEY,
		model: "asi1mini",
		timeout: 20000,
	},
	general: {
		defaultTimeout: 30000,
		maxRetries: 3,
		enableFallback: true,
		logLevel: "info",
	},
});

/**
 * Get ASI-1 mini configuration for testing
 */
export const getTestConfig = () => ({
	asi1Mini: {
		apiKey: "test-api-key",
		endpoint: "https://api.asi1.ai/v1",
		timeout: 30000,
		retryCount: 3,
	},
	fallback: {
		provider: "asi1mini" as const,
		apiKey: "test-asi1mini-key",
		model: "asi1mini" as const,
		timeout: 20000,
	},
	general: {
		defaultTimeout: 30000,
		maxRetries: 3,
		enableFallback: true,
		logLevel: "info" as const,
	},
});
