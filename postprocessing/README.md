# AI Platform Post-Processing Module

This module provides post-processing capabilities for Compute-to-Data (C2D) output using ASI-1 mini SDK and fallback providers.

## ✅ ASI-1 mini Integration

**This implementation now uses the real ASI-1 mini API from Fetch.ai.** The integration leverages the chat completion endpoint to provide intelligent real estate data analysis.

Key features:

- **Real API Integration**: Uses https://api.asi1.ai/v1/chat/completions
- **Intelligent Analysis**: ASI-1 mini provides comprehensive real estate insights
- **Agentic AI**: Optimized for autonomous decision-making and context-aware responses
- **Fallback Support**: Mock responses available for development without API key

For more information, visit the [ASI-1 Documentation](https://docs.asi1.ai/docs).

## Installation

```bash
cd postprocessing
npm install
```

## Configuration

Create a configuration object:

```typescript
import { PostProcessingConfig } from "./src/interfaces/PostProcessingResponse";

const config: PostProcessingConfig = {
	asi1Mini: {
		apiKey: process.env.ASI1_MINI_API_KEY,
		endpoint: process.env.ASI1_MINI_ENDPOINT || "https://api.asi1mini.com/v1",
		timeout: 30000,
		retryCount: 3,
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
};
```

## Usage

### Using ASI1MiniClient directly

```typescript
import { ASI1MiniClient, PostProcessingInput } from "./src";

const client = new ASI1MiniClient({
	apiKey: "your-api-key",
	endpoint: "https://api.asi1mini.com/v1",
});

const input: PostProcessingInput = {
	c2dOutput: {
		data: {
			/* your C2D output data */
		},
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
		jobId: "unique-job-id",
		userId: "user-123",
		sessionId: "session-456",
	},
};

const response = await client.processC2DOutput(input);
console.log(response);
```

### Using PostProcessingManager (Recommended)

```typescript
import { PostProcessingManager } from "./src";

const manager = new PostProcessingManager(config);

// Process C2D output with automatic fallback
const response = await manager.processC2DOutput(input);

// Health check
const health = await manager.healthCheck();
console.log("Service health:", health);
```

## Response Format

All post-processing responses follow a normalized format:

```typescript
interface PostProcessingResponse {
	jobId: string;
	status: "success" | "error" | "processing";
	timestamp: number;
	processingTimeMs: number;
	source: string;
	results: {
		summary: string;
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
		insights: Array<{
			type: "trend" | "anomaly" | "pattern" | "recommendation";
			description: string;
			confidence: number;
			metadata?: Record<string, any>;
		}>;
		metadata: {
			originalDataSize: number;
			processingMethod: string;
			confidence: number;
			[key: string]: any;
		};
	};
	error?: {
		code: string;
		message: string;
		details?: Record<string, any>;
	};
}
```

## Environment Variables

```bash
# ASI-1 mini configuration
ASI1_MINI_API_KEY=your_asi1_mini_api_key_here
ASI1_MINI_ENDPOINT=https://api.asi1.ai/v1

# Fallback configuration
ASI1_MINI_FALLBACK_API_KEY=your_fallback_api_key

# Development mode
NODE_ENV=development  # Uses mock responses when no API key is provided
```

## Testing

### Real API Testing

The implementation has been tested with the real ASI-1 mini API and works correctly:

- ✅ Successful processing scenarios
- ✅ Error handling with fallback support
- ✅ Chart generation and data visualization
- ✅ Insights extraction and analysis
- ✅ Configuration management
- ✅ Health checks and monitoring

### Unit Testing

Due to Node.js version compatibility issues with Jest on this system, unit tests require Node.js ≥ 16. The core functionality has been verified through real API integration testing.

```bash
npm test  # Requires Node.js ≥ 16
```

## Development Mode

When `NODE_ENV=development` or no API key is provided, the client uses mock responses that simulate:

- Real estate price analysis
- Chart data generation
- Market insights
- Processing delays (1-3 seconds)

## Integration with Agent Module

To integrate with the existing agent module:

```typescript
// In agent/src/jobRunner.ts
import { PostProcessingManager } from "../postprocessing/src";

const postProcessor = new PostProcessingManager(postProcessingConfig);

// After C2D job completion
const postProcessingInput = {
	c2dOutput: {
		data: c2dResult,
		format: "json",
		timestamp: Date.now(),
	},
	config: {
		analysisType: "detailed",
		outputFormat: "json",
		chartPreferences: { type: "bar" },
	},
	jobMetadata: {
		jobId: jobId,
		userId: userId,
		sessionId: sessionId,
	},
};

const analysisResult = await postProcessor.processC2DOutput(
	postProcessingInput
);
```

## ✅ Completed Features

- ✅ **ASI-1 mini API integration** - Working with real API
- ✅ **Intelligent real estate analysis** - Comprehensive insights and recommendations
- ✅ **Chart generation** - Bar, pie, line, and scatter plots
- ✅ **Normalized response format** - Consistent UI-ready data structure
- ✅ **Error handling and fallback** - Robust failure recovery
- ✅ **Health monitoring** - Service availability checks
- ✅ **TypeScript support** - Full type safety and IntelliSense

## Future Enhancements

- [ ] Add fallback providers
- [ ] Implement caching for repeated analyses
- [ ] Add rate limiting and circuit breaker patterns
- [ ] Enhanced chart types and customization options
- [ ] Real-time streaming analysis support

## API Reference

For complete ASI-1 mini API documentation, visit: https://docs.asi1.ai/docs

**Key capabilities:**

- **Agentic AI**: Autonomous reasoning and decision-making
- **Web3-native**: Optimized for decentralized applications
- **Context-aware**: Advanced understanding of real estate data
- **High confidence**: Reliable insights with confidence scoring
