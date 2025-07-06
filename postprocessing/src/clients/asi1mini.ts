import axios, { AxiosInstance } from "axios";
import {
	PostProcessingInput,
	PostProcessingResponse,
	PostProcessingConfig,
} from "../interfaces/PostProcessingResponse";

/**
 * ASI-1 Mini Client for post-processing C2D output
 *
 * NOTE: This is a placeholder implementation since ASI-1 mini SDK details
 * are not yet available. This structure can be easily adapted once we get
 * the actual SDK specifications.
 */
export class ASI1MiniClient {
	private httpClient: AxiosInstance;
	private config: NonNullable<PostProcessingConfig["asi1Mini"]>;
	private logger: Console;

	constructor(config: PostProcessingConfig["asi1Mini"] = {}) {
		this.config = {
			apiKey: config?.apiKey || process.env.ASI1_MINI_API_KEY,
			endpoint:
				config?.endpoint ||
				process.env.ASI1_MINI_ENDPOINT ||
				"https://api.asi1.ai/v1",
			timeout: config?.timeout || 30000,
			retryCount: config?.retryCount || 3,
			...config,
		};

		this.logger = console;
		this.httpClient = axios.create({
			baseURL: this.config.endpoint,
			timeout: this.config.timeout,
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${this.config.apiKey}`,
				"User-Agent": "AI-Platform-PostProcessing/1.0.0",
			},
		});

		this.setupInterceptors();
	}

	/**
	 * Process C2D output using ASI-1 mini
	 */
	async processC2DOutput(
		input: PostProcessingInput
	): Promise<PostProcessingResponse> {
		const startTime = Date.now();

		try {
			this.logger.log(
				`[ASI1Mini] Starting processing for job: ${input.jobMetadata.jobId}`
			);

			// Validate input
			this.validateInput(input);

			// Prepare request payload
			const payload = this.preparePayload(input);

			// Make API call to ASI-1 mini
			const response = await this.makeRequest(payload);

			// Transform response to normalized format
			const normalizedResponse = this.normalizeResponse(
				response,
				input,
				startTime
			);

			this.logger.log(
				`[ASI1Mini] Successfully processed job: ${input.jobMetadata.jobId}`
			);

			return normalizedResponse;
		} catch (error) {
			this.logger.error(
				`[ASI1Mini] Error processing job ${input.jobMetadata.jobId}:`,
				error
			);

			return {
				jobId: input.jobMetadata.jobId,
				status: "error",
				timestamp: Date.now(),
				processingTimeMs: Date.now() - startTime,
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
					code: "PROCESSING_ERROR",
					message:
						error instanceof Error ? error.message : "Unknown error occurred",
					details: error instanceof Error ? { stack: error.stack } : { error },
				},
			};
		}
	}

	/**
	 * Validate input data
	 */
	private validateInput(input: PostProcessingInput): void {
		if (!input.c2dOutput || !input.c2dOutput.data) {
			throw new Error("Invalid input: c2dOutput.data is required");
		}

		if (!input.jobMetadata || !input.jobMetadata.jobId) {
			throw new Error("Invalid input: jobMetadata.jobId is required");
		}

		if (!input.config) {
			throw new Error("Invalid input: config is required");
		}
	}

	/**
	 * Prepare payload for ASI-1 mini API (Chat Completion format)
	 */
	private preparePayload(input: PostProcessingInput): any {
		// Create a comprehensive prompt for real estate data analysis
		const dataString = JSON.stringify(input.c2dOutput.data, null, 2);
		const analysisType = input.config.analysisType || "summary";
		const chartType = input.config.chartPreferences?.type || "bar";

		const systemPrompt = `You are an expert real estate data analyst. Your task is to analyze C2D (Compute-to-Data) output from Ocean Protocol and provide comprehensive insights. Always respond with valid JSON in the exact format specified.`;

		const userPrompt = `Analyze the following real estate data from a C2D computation:

Data:
${dataString}

Analysis Requirements:
- Analysis type: ${analysisType}
- Chart type: ${chartType}
- Output format: ${input.config.outputFormat || "json"}

Please provide a comprehensive analysis in the following JSON format:
{
  "summary": "A detailed 2-3 sentence summary of the key findings",
  "chart": {
    "type": "${chartType}",
    "title": "Descriptive chart title",
    "xAxisLabel": "X-axis label",
    "yAxisLabel": "Y-axis label",
    "data": [
      {"label": "Category1", "value": 123456, "color": "#3498db"},
      {"label": "Category2", "value": 234567, "color": "#2ecc71"}
    ]
  },
  "insights": [
    {
      "type": "trend|anomaly|pattern|recommendation",
      "description": "Detailed insight description",
      "confidence": 0.85,
      "metadata": {"key": "value"}
    }
  ],
  "metadata": {
    "originalDataSize": ${JSON.stringify(input.c2dOutput.data).length},
    "processingMethod": "asi1mini",
    "confidence": 0.85
  }
}

Important: Respond ONLY with valid JSON. No additional text or explanations.`;

		return {
			model: "asi1-mini",
			messages: [
				{
					role: "system",
					content: systemPrompt,
				},
				{
					role: "user",
					content: userPrompt,
				},
			],
			temperature: 0.3,
			max_tokens: 2000,
			stream: false,
		};
	}

	/**
	 * Make API request to ASI-1 mini Chat Completion API
	 */
	private async makeRequest(payload: any): Promise<any> {
		// Use mock response in development if no API key is provided
		if (process.env.NODE_ENV === "development" && !this.config?.apiKey) {
			this.logger.log(
				"[ASI1Mini] Using mock response (no API key in development)"
			);
			return this.getMockResponse(payload);
		}

		if (!this.config?.apiKey) {
			throw new Error("ASI-1 mini API key is required");
		}

		try {
			this.logger.log("[ASI1Mini] Making request to ASI-1 mini API");
			const response = await this.httpClient.post("/chat/completions", payload);

			// Extract the content from the chat completion response
			const content = response.data.choices?.[0]?.message?.content;
			if (!content) {
				throw new Error("No content received from ASI-1 mini API");
			}

			// Parse the JSON response (strip markdown code blocks if present)
			try {
				let cleanContent = content.trim();

				// Remove markdown code blocks if present
				if (
					cleanContent.startsWith("```json") &&
					cleanContent.endsWith("```")
				) {
					cleanContent = cleanContent.slice(7, -3).trim();
				} else if (
					cleanContent.startsWith("```") &&
					cleanContent.endsWith("```")
				) {
					cleanContent = cleanContent.slice(3, -3).trim();
				}

				const parsedContent = JSON.parse(cleanContent);
				this.logger.log("[ASI1Mini] Successfully parsed ASI-1 mini response");
				return parsedContent;
			} catch (parseError) {
				this.logger.error("[ASI1Mini] Failed to parse JSON response:", content);
				throw new Error(
					`Invalid JSON response from ASI-1 mini: ${
						parseError instanceof Error
							? parseError.message
							: "Unknown parse error"
					}`
				);
			}
		} catch (error) {
			if (axios.isAxiosError(error) && error.response) {
				const errorMessage =
					error.response.data?.error?.message ||
					error.response.data?.message ||
					error.message;
				throw new Error(
					`ASI-1 mini API error: ${error.response.status} - ${errorMessage}`
				);
			}
			throw error;
		}
	}

	/**
	 * Mock response for development/testing
	 */
	private getMockResponse(payload: any): any {
		// Simulate processing delay
		return new Promise((resolve) => {
			setTimeout(() => {
				resolve({
					summary: this.generateMockSummary(payload),
					chart: this.generateMockChart(payload),
					insights: this.generateMockInsights(payload),
					metadata: {
						originalDataSize: JSON.stringify(
							payload.messages?.[1]?.content || ""
						).length,
						processingMethod: "asi1mini-mock",
						confidence: 0.85,
						model_version: "1.0.0",
					},
				});
			}, 1000 + Math.random() * 2000); // 1-3 seconds delay
		});
	}

	/**
	 * Generate mock summary for testing
	 */
	private generateMockSummary(payload: any): string {
		const userMessage = payload.messages?.[1]?.content || "";
		const dataSize = userMessage.length;

		return `Analysis Summary: The C2D computation has been successfully processed using ASI-1 mini. 
    The dataset contains ${dataSize} characters of data. 
    Key patterns and trends have been identified with high confidence.
    
    Processing completed with comprehensive real estate analysis.
    Results are optimized for visualization and insights extraction.`;
	}

	/**
	 * Generate mock chart for testing
	 */
	private generateMockChart(payload: any): any {
		// Extract chart type from the user message if possible
		const userMessage = payload.messages?.[1]?.content || "";
		const chartType = userMessage.includes("pie")
			? "pie"
			: userMessage.includes("line")
			? "line"
			: userMessage.includes("scatter")
			? "scatter"
			: "bar";

		return {
			type: chartType,
			title: "Real Estate Price Analysis",
			xAxisLabel: "Property Type",
			yAxisLabel: "Average Price ($)",
			data: [
				{ label: "Residential", value: 450000, color: "#3498db" },
				{ label: "Commercial", value: 750000, color: "#2ecc71" },
				{ label: "Industrial", value: 300000, color: "#f39c12" },
				{ label: "Land", value: 200000, color: "#e74c3c" },
			],
		};
	}

	/**
	 * Generate mock insights for testing
	 */
	private generateMockInsights(payload: any): any[] {
		return [
			{
				type: "trend",
				description:
					"Commercial properties show 15% higher average prices compared to last quarter",
				confidence: 0.89,
				metadata: { trend_direction: "upward", percentage_change: 15 },
			},
			{
				type: "anomaly",
				description:
					"Unusual price spike detected in residential sector during week 12",
				confidence: 0.76,
				metadata: { anomaly_type: "price_spike", affected_period: "week_12" },
			},
			{
				type: "recommendation",
				description:
					"Consider focusing investment on commercial properties in Q2",
				confidence: 0.82,
				metadata: { recommendation_type: "investment", target_quarter: "Q2" },
			},
		];
	}

	/**
	 * Normalize response to common format
	 */
	private normalizeResponse(
		response: any,
		input: PostProcessingInput,
		startTime: number
	): PostProcessingResponse {
		// Handle both successful API responses and potential errors
		if (response.summary && response.chart && response.insights) {
			return {
				jobId: input.jobMetadata.jobId,
				status: "success",
				timestamp: Date.now(),
				processingTimeMs: Date.now() - startTime,
				source: "asi1mini",
				results: {
					summary: response.summary,
					chart: response.chart,
					insights: response.insights,
					metadata: {
						originalDataSize: JSON.stringify(input.c2dOutput.data).length,
						processingMethod: "asi1mini",
						confidence: response.metadata?.confidence || 0.8,
						...response.metadata,
					},
				},
			};
		} else {
			// Handle case where response doesn't match expected format
			return {
				jobId: input.jobMetadata.jobId,
				status: "error",
				timestamp: Date.now(),
				processingTimeMs: Date.now() - startTime,
				source: "asi1mini",
				results: {
					summary: "",
					insights: [],
					metadata: {
						originalDataSize: JSON.stringify(input.c2dOutput.data).length,
						processingMethod: "asi1mini",
						confidence: 0,
					},
				},
				error: {
					code: "INVALID_RESPONSE_FORMAT",
					message: "ASI-1 mini response doesn't match expected format",
					details: { response },
				},
			};
		}
	}

	/**
	 * Setup HTTP interceptors for logging and error handling
	 */
	private setupInterceptors(): void {
		this.httpClient.interceptors.request.use(
			(config) => {
				this.logger.log(`[ASI1Mini] Making request to: ${config.url}`);
				return config;
			},
			(error) => {
				this.logger.error("[ASI1Mini] Request error:", error);
				return Promise.reject(error);
			}
		);

		this.httpClient.interceptors.response.use(
			(response) => {
				this.logger.log(`[ASI1Mini] Received response: ${response.status}`);
				return response;
			},
			(error) => {
				this.logger.error("[ASI1Mini] Response error:", error);
				return Promise.reject(error);
			}
		);
	}

	/**
	 * Health check for ASI-1 mini service
	 */
	async healthCheck(): Promise<boolean> {
		try {
			// Use a simple chat completion request to check if the service is available
			const healthPayload = {
				model: "asi1-mini",
				messages: [
					{
						role: "user",
						content: "Hello",
					},
				],
				max_tokens: 10,
				temperature: 0,
			};

			const response = await this.httpClient.post(
				"/chat/completions",
				healthPayload
			);
			return response.status === 200 && response.data.choices?.length > 0;
		} catch (error) {
			this.logger.error("[ASI1Mini] Health check failed:", error);
			return false;
		}
	}

	/**
	 * Get client configuration
	 */
	getConfig(): PostProcessingConfig["asi1Mini"] {
		return { ...this.config };
	}
}
