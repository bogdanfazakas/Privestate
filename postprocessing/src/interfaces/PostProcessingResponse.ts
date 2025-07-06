/**
 * Common interface for post-processing responses
 * This ensures consistent data structure regardless of the underlying SDK
 */
export interface PostProcessingResponse {
	/** Unique identifier for the processing job */
	jobId: string;

	/** Status of the processing job */
	status: "success" | "error" | "processing";

	/** Processing timestamp */
	timestamp: number;

	/** Processing duration in milliseconds */
	processingTimeMs: number;

	/** Source of the processing (e.g., 'asi1mini', 'openai-fallback') */
	source: string;

	/** Processed data results */
	results: {
		/** Text summary of the C2D output */
		summary: string;

		/** Chart/visualization data */
		chart?: {
			type: "bar" | "line" | "pie" | "scatter";
			data: Array<{
				label: string;
				value: number;
				color?: string;
			}>;
			title?: string;
			xAxisLabel?: string;
			yAxisLabel?: string;
		};

		/** Key insights extracted from the data */
		insights: Array<{
			type: "trend" | "anomaly" | "pattern" | "recommendation";
			description: string;
			confidence: number; // 0-1 scale
			metadata?: Record<string, any>;
		}>;

		/** Metadata about the processing */
		metadata: {
			originalDataSize: number;
			processingMethod: string;
			confidence: number;
			[key: string]: any;
		};
	};

	/** Error information if status is 'error' */
	error?: {
		code: string;
		message: string;
		details?: Record<string, any>;
	};
}

/**
 * Input data structure for post-processing
 */
export interface PostProcessingInput {
	/** Raw C2D output data */
	c2dOutput: {
		data: any;
		format: string;
		timestamp: number;
	};

	/** Processing configuration */
	config: {
		/** Type of analysis to perform */
		analysisType: "summary" | "detailed" | "visualization" | "insights";

		/** Output format preferences */
		outputFormat: "json" | "markdown" | "html";

		/** Chart preferences */
		chartPreferences?: {
			type?: "bar" | "line" | "pie" | "scatter";
			theme?: "light" | "dark";
			showLegend?: boolean;
		};

		/** Additional processing options */
		options?: Record<string, any>;
	};

	/** Job metadata */
	jobMetadata: {
		jobId: string;
		userId?: string;
		sessionId?: string;
		datasetId?: string;
	};
}

/**
 * Configuration for post-processing clients
 */
export interface PostProcessingConfig {
	/** ASI-1 mini configuration */
	asi1Mini?: {
		apiKey?: string;
		endpoint?: string;
		timeout?: number;
		retryCount?: number;
		[key: string]: any;
	};

	/** Fallback configuration */
	fallback?: {
		provider: "asi1mini" | "local";
		apiKey?: string;
		model?: string;
		timeout?: number;
		[key: string]: any;
	};

	/** General configuration */
	general: {
		defaultTimeout: number;
		maxRetries: number;
		enableFallback: boolean;
		logLevel: "debug" | "info" | "warn" | "error";
	};
}
