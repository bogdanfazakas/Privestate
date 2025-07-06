/**
 * AI Platform Agent - CLI Interface
 * Handles Self Protocol attestation and Ocean Protocol C2D orchestration
 */

import { runJob, type JobResult } from "./src/jobRunner";
import {
	initializeAgent,
	getDefaultConfig,
	type AgentConfig,
} from "./src/agentCore";
import {
	createTimeoutManager,
	type TimeoutManager,
} from "./src/timeoutManager";
import { createSelfAttestationService } from "./src/selfAttestation";
import { createOceanC2DService } from "./src/triggerC2D";
import * as fs from "fs";
import * as path from "path";

// Export main functions for programmatic use
export { runJob, initializeAgent };

/**
 * CLI Command definitions
 */
interface CLICommand {
	name: string;
	description: string;
	options: CLIOption[];
	handler: (args: CLIArgs) => Promise<void>;
}

interface CLIOption {
	flag: string;
	description: string;
	type: "string" | "number" | "boolean";
	required?: boolean;
	default?: string | number | boolean;
}

interface CLIArgs {
	[key: string]: string | number | boolean | undefined;
}

/**
 * Available CLI commands
 */
const commands: CLICommand[] = [
	{
		name: "run-job",
		description: "Execute a complete agent job with attestation and C2D",
		options: [
			{
				flag: "--timeout",
				description: "Job timeout in seconds (default: 300)",
				type: "number",
				default: 300,
			},
			{
				flag: "--self-api-key",
				description: "Self Protocol API key",
				type: "string",
			},
			{
				flag: "--self-endpoint",
				description: "Self Protocol endpoint URL",
				type: "string",
			},
			{
				flag: "--ocean-endpoint",
				description: "Ocean Node endpoint URL",
				type: "string",
			},
			{
				flag: "--user-did",
				description: "User DID for attestation",
				type: "string",
			},
			{
				flag: "--verbose",
				description: "Enable verbose logging",
				type: "boolean",
				default: false,
			},
			{
				flag: "--output",
				description: "Output format (json, pretty, minimal)",
				type: "string",
				default: "pretty",
			},
		],
		handler: handleRunJob,
	},
	{
		name: "test-attestation",
		description: "Test Self Protocol attestation only",
		options: [
			{
				flag: "--self-api-key",
				description: "Self Protocol API key",
				type: "string",
			},
			{
				flag: "--self-endpoint",
				description: "Self Protocol endpoint URL",
				type: "string",
			},
			{
				flag: "--user-did",
				description: "User DID for attestation",
				type: "string",
			},
			{
				flag: "--verbose",
				description: "Enable verbose logging",
				type: "boolean",
				default: false,
			},
		],
		handler: handleTestAttestation,
	},
	{
		name: "test-c2d",
		description: "Test Ocean Protocol C2D functionality only",
		options: [
			{
				flag: "--ocean-endpoint",
				description: "Ocean Node endpoint URL",
				type: "string",
			},
			{
				flag: "--timeout",
				description: "C2D timeout in seconds (default: 240)",
				type: "number",
				default: 240,
			},
			{
				flag: "--verbose",
				description: "Enable verbose logging",
				type: "boolean",
				default: false,
			},
		],
		handler: handleTestC2D,
	},
	{
		name: "health-check",
		description: "Check the health of all agent services",
		options: [
			{
				flag: "--verbose",
				description: "Enable verbose logging",
				type: "boolean",
				default: false,
			},
		],
		handler: handleHealthCheck,
	},
	{
		name: "config",
		description: "Show current agent configuration",
		options: [
			{
				flag: "--format",
				description: "Output format (json, yaml, env)",
				type: "string",
				default: "json",
			},
		],
		handler: handleShowConfig,
	},
];

/**
 * Main CLI entry point
 */
async function main(): Promise<void> {
	const args = process.argv.slice(2);

	// Handle version flag
	if (args.includes("--version") || args.includes("-v")) {
		console.log("AI Platform Agent v1.0.0");
		return;
	}

	// Handle help flag
	if (args.includes("--help") || args.includes("-h") || args.length === 0) {
		showHelp();
		return;
	}

	// Parse command
	const commandName = args[0];
	const command = commands.find((cmd) => cmd.name === commandName);

	if (!command) {
		console.error(`❌ Unknown command: ${commandName}`);
		console.error("Use --help to see available commands.");
		process.exit(1);
	}

	// Parse arguments
	const parsedArgs = parseArguments(args.slice(1), command.options);

	// Execute command
	try {
		await command.handler(parsedArgs);
	} catch (error) {
		console.error("❌ Command execution failed:", error);
		process.exit(1);
	}
}

/**
 * Parse command-line arguments
 */
function parseArguments(args: string[], options: CLIOption[]): CLIArgs {
	const parsed: CLIArgs = {};

	// Set defaults
	options.forEach((option) => {
		if (option.default !== undefined) {
			const key = option.flag.replace(/^--/, "");
			parsed[key] = option.default;
		}
	});

	// Parse provided arguments
	for (let i = 0; i < args.length; i++) {
		const arg = args[i];

		if (arg.startsWith("--")) {
			const option = options.find((opt) => opt.flag === arg);

			if (!option) {
				console.error(`❌ Unknown option: ${arg}`);
				process.exit(1);
			}

			const key = option.flag.replace(/^--/, "");

			if (option.type === "boolean") {
				parsed[key] = true;
			} else {
				if (i + 1 >= args.length) {
					console.error(`❌ Option ${arg} requires a value`);
					process.exit(1);
				}

				const value = args[i + 1];
				if (option.type === "number") {
					parsed[key] = parseFloat(value);
				} else {
					parsed[key] = value;
				}
				i++; // Skip the value
			}
		}
	}

	// Check required options
	options.forEach((option) => {
		if (option.required) {
			const key = option.flag.replace(/^--/, "");
			if (parsed[key] === undefined) {
				console.error(`❌ Required option ${option.flag} is missing`);
				process.exit(1);
			}
		}
	});

	return parsed;
}

/**
 * Show help information
 */
function showHelp(): void {
	console.log(`
🤖 AI Platform Agent CLI

USAGE:
  npm run agent -- <command> [options]

COMMANDS:
`);

	commands.forEach((command) => {
		console.log(`  ${command.name.padEnd(20)} ${command.description}`);
	});

	console.log(`
GLOBAL OPTIONS:
  --help, -h           Show this help message
  --version, -v        Show version information

EXAMPLES:
  npm run agent -- run-job --timeout 300 --verbose
  npm run agent -- test-attestation --self-api-key YOUR_KEY
  npm run agent -- health-check --verbose
  npm run agent -- config --format json

For detailed help on a specific command:
  npm run agent -- <command> --help
`);
}

/**
 * Handle run-job command
 */
async function handleRunJob(args: CLIArgs): Promise<void> {
	console.log("🚀 Starting AI Platform Agent job...\n");

	// Build configuration from arguments
	const config: any = {
		timeoutMs: (args.timeout as number) * 1000,
	};

	if (args["self-api-key"] || args["self-endpoint"]) {
		config.selfProtocolConfig = {
			apiKey:
				(args["self-api-key"] as string) ||
				process.env.SELF_PROTOCOL_API_KEY ||
				"",
			endpoint:
				(args["self-endpoint"] as string) ||
				process.env.SELF_PROTOCOL_ENDPOINT ||
				"https://api.self.id",
		};
	}

	if (args["ocean-endpoint"]) {
		config.oceanProtocolConfig = {
			endpoint: args["ocean-endpoint"] as string,
		};
	}

	// Set user DID if provided
	if (args["user-did"]) {
		process.env.USER_DID = args["user-did"] as string;
	}

	// Run the job
	const startTime = Date.now();
	const result = await runJob(config);
	const duration = Date.now() - startTime;

	// Output result
	const outputFormat = args.output as string;
	await outputJobResult(result, outputFormat, duration);

	// Exit with appropriate code
	process.exit(result.success ? 0 : 1);
}

/**
 * Handle test-attestation command
 */
async function handleTestAttestation(args: CLIArgs): Promise<void> {
	console.log("🔐 Testing Self Protocol attestation...\n");

	const apiKey =
		(args["self-api-key"] as string) || process.env.SELF_PROTOCOL_API_KEY || "";
	const endpoint =
		(args["self-endpoint"] as string) ||
		process.env.SELF_PROTOCOL_ENDPOINT ||
		"https://api.self.id";
	const userDid =
		(args["user-did"] as string) ||
		process.env.USER_DID ||
		"did:example:user123";

	if (!apiKey && !args.verbose) {
		console.log("⚠️  No API key provided, using mock mode");
	}

	const service = createSelfAttestationService({
		selfApiKey: apiKey,
		selfEndpoint: endpoint,
		enableMockFailures: false,
	});

	try {
		await service.initialize();
		console.log("✅ Self Protocol service initialized successfully");

		const result = await service.verifyComprehensive(userDid, {
			requireAge: { minimumAge: 18, ageRangeOnly: true },
			requireResidency: { allowedCountries: ["US", "CA", "GB", "AU"] },
			requireRole: {
				requiredRoles: [
					"real_estate_professional",
					"data_analyst",
					"researcher",
				],
			},
			requireIdentity: {
				requireHuman: true,
				requireUnique: true,
				maxRiskScore: 30,
			},
		});

		console.log("✅ Attestation verification completed:");
		console.log(`   Valid: ${result.isValid}`);
		console.log(`   Age: ${result.verifiedClaims.age?.ageRange || "N/A"}`);
		console.log(
			`   Country: ${result.verifiedClaims.residency?.country || "N/A"}`
		);
		console.log(
			`   Role: ${result.verifiedClaims.role?.verificationLevel || "N/A"}`
		);
		console.log(
			`   Risk Score: ${result.verifiedClaims.identity?.riskScore || "N/A"}`
		);
	} catch (error) {
		console.error("❌ Attestation test failed:", error);
		process.exit(1);
	}
}

/**
 * Handle test-c2d command
 */
async function handleTestC2D(args: CLIArgs): Promise<void> {
	console.log("🌊 Testing Ocean Protocol C2D...\n");

	const endpoint =
		(args["ocean-endpoint"] as string) ||
		process.env.OCEAN_ENDPOINT ||
		"https://ocean-node-ai-real-estate.fluence.network:8000";
	const timeout = (args.timeout as number) * 1000;

	const service = createOceanC2DService({
		oceanNodeUrl: endpoint,
		timeoutMs: timeout,
	});

	try {
		await service.initialize();
		console.log("✅ Ocean Protocol C2D service initialized successfully");

		const jobId = await service.startC2DJob();
		console.log(`✅ C2D job started: ${jobId}`);

		const result = await service.pollJobStatus(jobId);
		console.log("✅ C2D job completed:");
		console.log(`   Status: ${result.status}`);
		console.log(`   Progress: ${result.progress}%`);
		console.log(`   Duration: ${result.duration}ms`);
	} catch (error) {
		console.error("❌ C2D test failed:", error);
		process.exit(1);
	}
}

/**
 * Handle health-check command
 */
async function handleHealthCheck(args: CLIArgs): Promise<void> {
	console.log("🏥 Checking agent health...\n");

	const verbose = args.verbose as boolean;
	let allHealthy = true;

	// Check Self Protocol service
	try {
		const service = createSelfAttestationService({
			selfApiKey: process.env.SELF_PROTOCOL_API_KEY || "",
			selfEndpoint: process.env.SELF_PROTOCOL_ENDPOINT || "https://api.self.id",
		});
		await service.initialize();
		console.log("✅ Self Protocol service: Healthy");
	} catch (error) {
		console.log("❌ Self Protocol service: Unhealthy");
		if (verbose) {
			console.log(`   Error: ${error}`);
		}
		allHealthy = false;
	}

	// Check Ocean Protocol service
	try {
		const service = createOceanC2DService({
			oceanNodeUrl:
				process.env.OCEAN_ENDPOINT ||
				"https://ocean-node-ai-real-estate.fluence.network:8000",
		});
		await service.initialize();
		console.log("✅ Ocean Protocol service: Healthy");
	} catch (error) {
		console.log("❌ Ocean Protocol service: Unhealthy");
		if (verbose) {
			console.log(`   Error: ${error}`);
		}
		allHealthy = false;
	}

	// Check timeout manager
	try {
		const timeoutManager = createTimeoutManager();
		const activeOps = timeoutManager.getActiveOperationsCount();
		console.log(`✅ Timeout manager: Healthy (${activeOps} active operations)`);
	} catch (error) {
		console.log("❌ Timeout manager: Unhealthy");
		if (verbose) {
			console.log(`   Error: ${error}`);
		}
		allHealthy = false;
	}

	console.log(
		`\n🎯 Overall health: ${allHealthy ? "✅ Healthy" : "❌ Unhealthy"}`
	);
	process.exit(allHealthy ? 0 : 1);
}

/**
 * Handle config command
 */
async function handleShowConfig(args: CLIArgs): Promise<void> {
	console.log("⚙️  Agent Configuration:\n");

	const config = getDefaultConfig();
	const format = args.format as string;

	switch (format) {
		case "json":
			console.log(JSON.stringify(config, null, 2));
			break;
		case "yaml":
			console.log("selfProtocolConfig:");
			console.log(`  endpoint: ${config.selfProtocolConfig.endpoint}`);
			console.log(
				`  apiKey: ${config.selfProtocolConfig.apiKey ? "***" : "Not set"}`
			);
			console.log("oceanProtocolConfig:");
			console.log(`  endpoint: ${config.oceanProtocolConfig.endpoint}`);
			console.log(`timeoutMs: ${config.timeoutMs}`);
			break;
		case "env":
			console.log(
				`SELF_PROTOCOL_ENDPOINT=${config.selfProtocolConfig.endpoint}`
			);
			console.log(
				`SELF_PROTOCOL_API_KEY=${config.selfProtocolConfig.apiKey || "NOT_SET"}`
			);
			console.log(`OCEAN_ENDPOINT=${config.oceanProtocolConfig.endpoint}`);
			console.log(`AGENT_TIMEOUT_MS=${config.timeoutMs}`);
			break;
		default:
			console.log("Self Protocol:");
			console.log(`  Endpoint: ${config.selfProtocolConfig.endpoint}`);
			console.log(
				`  API Key: ${
					config.selfProtocolConfig.apiKey ? "✅ Set" : "❌ Not set"
				}`
			);
			console.log("Ocean Protocol:");
			console.log(`  Endpoint: ${config.oceanProtocolConfig.endpoint}`);
			console.log(`Timeout: ${config.timeoutMs / 1000}s`);
			break;
	}
}

/**
 * Output job result in the specified format
 */
async function outputJobResult(
	result: JobResult,
	format: string,
	duration: number
): Promise<void> {
	switch (format) {
		case "json":
			console.log(
				JSON.stringify({ ...result, totalDuration: duration }, null, 2)
			);
			break;
		case "minimal":
			console.log(`Result: ${result.success ? "SUCCESS" : "FAILED"}`);
			if (!result.success && result.error) {
				console.log(`Error: ${result.error.userMessage}`);
			}
			break;
		case "pretty":
		default:
			console.log("\n📊 Job Result Summary:");
			console.log(`Status: ${result.success ? "✅ SUCCESS" : "❌ FAILED"}`);
			console.log(`Duration: ${duration}ms`);

			if (result.timedOut) {
				console.log(`Timeout: ⏰ Yes (${result.duration}ms)`);
			}

			if (result.attestationResult) {
				console.log("\n🔐 Attestation:");
				console.log(`  Valid: ${result.attestationResult.isValid}`);
				console.log(
					`  Age: ${
						result.attestationResult.verifiedClaims.age?.ageRange || "N/A"
					}`
				);
				console.log(
					`  Country: ${
						result.attestationResult.verifiedClaims.residency?.country || "N/A"
					}`
				);
				console.log(
					`  Role: ${
						result.attestationResult.verifiedClaims.role?.verificationLevel ||
						"N/A"
					}`
				);
			}

			if (result.c2dJobStatus) {
				console.log("\n🌊 C2D Job:");
				console.log(`  Status: ${result.c2dJobStatus.status}`);
				console.log(`  Progress: ${result.c2dJobStatus.progress}%`);
				console.log(`  Duration: ${result.c2dJobStatus.duration}ms`);
			}

			if (result.error) {
				console.log("\n❌ Error Details:");
				console.log(`  Code: ${result.error.code}`);
				console.log(`  Message: ${result.error.userMessage}`);
				console.log(`  Retryable: ${result.error.retryable}`);

				if (result.error.suggestions && result.error.suggestions.length > 0) {
					console.log("  Suggestions:");
					result.error.suggestions.forEach((suggestion: string) => {
						console.log(`    • ${suggestion}`);
					});
				}
			}
			break;
	}
}

// Run CLI if this file is executed directly
if (require.main === module) {
	main().catch((error) => {
		console.error("❌ CLI execution failed:", error);
		process.exit(1);
	});
}
