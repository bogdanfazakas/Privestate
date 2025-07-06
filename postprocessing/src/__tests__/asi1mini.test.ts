import { ASI1MiniClient } from "../clients/asi1mini";
import { PostProcessingInput } from "../interfaces/PostProcessingResponse";
import { getTestConfig } from "../config/environment";

describe("ASI1MiniClient", () => {
	let client: ASI1MiniClient;

	beforeEach(() => {
		const config = getTestConfig();
		client = new ASI1MiniClient(config.asi1Mini);
	});

	describe("processC2DOutput", () => {
		it("should process C2D output successfully", async () => {
			const input: PostProcessingInput = {
				c2dOutput: {
					data: { test: "data", prices: [100, 200, 300] },
					format: "json",
					timestamp: Date.now(),
				},
				config: {
					analysisType: "summary",
					outputFormat: "json",
					chartPreferences: {
						type: "bar",
						theme: "light",
					},
				},
				jobMetadata: {
					jobId: "test-job-123",
					userId: "user-456",
					sessionId: "session-789",
					datasetId: "dataset-abc",
				},
			};

			const response = await client.processC2DOutput(input);

			expect(response).toBeDefined();
			expect(response.jobId).toBe("test-job-123");
			expect(response.status).toBe("success");
			expect(response.source).toBe("asi1mini");
			expect(response.results).toBeDefined();
			expect(response.results.summary).toBeTruthy();
			expect(response.results.chart).toBeDefined();
			expect(response.results.insights).toBeInstanceOf(Array);
			expect(response.processingTimeMs).toBeGreaterThan(0);
		});

		it("should handle invalid input gracefully", async () => {
			const invalidInput = {
				c2dOutput: {
					data: null,
					format: "json",
					timestamp: Date.now(),
				},
				config: {
					analysisType: "summary" as const,
					outputFormat: "json" as const,
				},
				jobMetadata: {
					jobId: "",
				},
			};

			const response = await client.processC2DOutput(invalidInput as any);

			expect(response.status).toBe("error");
			expect(response.error).toBeDefined();
			expect(response.error?.code).toBe("PROCESSING_ERROR");
		});

		it("should generate appropriate chart data", async () => {
			const input: PostProcessingInput = {
				c2dOutput: {
					data: { realEstate: { residential: 450000, commercial: 750000 } },
					format: "json",
					timestamp: Date.now(),
				},
				config: {
					analysisType: "visualization",
					outputFormat: "json",
					chartPreferences: {
						type: "pie",
						theme: "dark",
					},
				},
				jobMetadata: {
					jobId: "chart-test-123",
				},
			};

			const response = await client.processC2DOutput(input);

			expect(response.status).toBe("success");
			expect(response.results.chart).toBeDefined();
			expect(response.results.chart?.type).toBe("pie");
			expect(response.results.chart?.data).toBeInstanceOf(Array);
			expect(response.results.chart?.data.length).toBeGreaterThan(0);
		});

		it("should generate meaningful insights", async () => {
			const input: PostProcessingInput = {
				c2dOutput: {
					data: { trend: "upward", anomalies: ["spike_week_12"] },
					format: "json",
					timestamp: Date.now(),
				},
				config: {
					analysisType: "insights",
					outputFormat: "json",
				},
				jobMetadata: {
					jobId: "insights-test-123",
				},
			};

			const response = await client.processC2DOutput(input);

			expect(response.status).toBe("success");
			expect(response.results.insights).toBeInstanceOf(Array);
			expect(response.results.insights.length).toBeGreaterThan(0);

			const firstInsight = response.results.insights[0];
			expect(firstInsight).toHaveProperty("type");
			expect(firstInsight).toHaveProperty("description");
			expect(firstInsight).toHaveProperty("confidence");
			expect(firstInsight.confidence).toBeGreaterThanOrEqual(0);
			expect(firstInsight.confidence).toBeLessThanOrEqual(1);
		});
	});

	describe("healthCheck", () => {
		it("should return health status", async () => {
			const isHealthy = await client.healthCheck();
			expect(typeof isHealthy).toBe("boolean");
		});
	});

	describe("getConfig", () => {
		it("should return configuration", () => {
			const config = client.getConfig();
			expect(config).toBeDefined();
			expect(config?.apiKey).toBe("test-api-key");
			expect(config?.endpoint).toBe("https://api.asi1.ai/v1");
			expect(config?.timeout).toBe(30000);
		});
	});
});
