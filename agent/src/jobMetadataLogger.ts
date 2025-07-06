/**
 * Job metadata logging and persistence system for UI consumption
 * Provides structured logging and JSON file persistence for job metadata
 */

import { promises as fs } from "fs";
import { join } from "path";
import { type AttestationResult } from "./selfAttestation";
import { type C2DJobStatus } from "./triggerC2D";
import { type AttestationError } from "./attestationErrors";

export interface JobMetadata {
	readonly jobId: string;
	readonly startTime: number;
	readonly endTime?: number;
	readonly status:
		| "pending"
		| "running"
		| "completed"
		| "failed"
		| "timeout"
		| "cancelled";
	readonly retryCount?: number;
	readonly lastError?: AttestationError;
	readonly duration?: number;
	readonly timedOut?: boolean;
	readonly cancelled?: boolean;
	readonly progress?: number;
	readonly version: string;
	readonly metadata?: {
		readonly configHash?: string;
		readonly environment?: string;
		readonly userAgent?: string;
		readonly platform?: string;
	};
}

export interface JobResult {
	readonly success: boolean;
	readonly message: string;
	readonly data?: unknown;
	readonly timestamp: number;
	readonly attestationResult?: AttestationResult;
	readonly c2dJobStatus?: C2DJobStatus;
	readonly error?: AttestationError;
	readonly duration?: number;
	readonly timedOut?: boolean;
	readonly cancelled?: boolean;
}

export interface JobLogEntry {
	readonly jobId: string;
	readonly timestamp: number;
	readonly level: "info" | "warn" | "error" | "debug";
	readonly message: string;
	readonly context?: Record<string, unknown>;
	readonly operation?: string;
	readonly duration?: number;
}

export interface JobDataForUI {
	readonly jobId: string;
	readonly metadata: JobMetadata;
	readonly result?: JobResult;
	readonly logs: JobLogEntry[];
	readonly timeline: Array<{
		readonly timestamp: number;
		readonly event: string;
		readonly details: string;
		readonly duration?: number;
	}>;
	readonly performance: {
		readonly totalDuration?: number;
		readonly attestationDuration?: number;
		readonly c2dDuration?: number;
		readonly retryCount: number;
		readonly errorCount: number;
	};
	readonly attestationDetails?: {
		readonly isValid: boolean;
		readonly attestationType: string;
		readonly verifiedClaims: Record<string, unknown>;
	};
	readonly c2dDetails?: {
		readonly jobId: string;
		readonly status: string;
		readonly progress: number;
		readonly output?: string;
		readonly metrics?: Record<string, unknown>;
	};
}

export interface JobHistoryEntry {
	readonly jobId: string;
	readonly timestamp: number;
	readonly status: string;
	readonly duration?: number;
	readonly success: boolean;
	readonly error?: string;
}

export interface JobHistory {
	readonly jobs: JobHistoryEntry[];
	readonly summary: {
		readonly totalJobs: number;
		readonly successfulJobs: number;
		readonly failedJobs: number;
		readonly averageDuration?: number;
		readonly lastUpdated: number;
	};
}

export class JobMetadataLogger {
	private readonly logsDir: string;
	private readonly jobLogs: Map<string, JobLogEntry[]> = new Map();
	private readonly jobTimelines: Map<
		string,
		Array<{
			timestamp: number;
			event: string;
			details: string;
			duration?: number;
		}>
	> = new Map();

	constructor(baseDir: string = process.cwd()) {
		this.logsDir = join(baseDir, "logs", "jobs");
	}

	/**
	 * Initialize the logging system
	 */
	async initialize(): Promise<void> {
		try {
			await fs.mkdir(this.logsDir, { recursive: true });
			console.log(`📁 Job metadata logging initialized: ${this.logsDir}`);
		} catch (error) {
			console.error("❌ Failed to initialize job metadata logging:", error);
			throw error;
		}
	}

	/**
	 * Log job metadata to console with structured formatting
	 * @param metadata Job metadata
	 * @param result Job result (optional)
	 */
	logJobMetadata(metadata: JobMetadata, result?: JobResult): void {
		const duration =
			metadata.duration ||
			(metadata.endTime && metadata.startTime
				? metadata.endTime - metadata.startTime
				: undefined);

		console.log("\n📊 ===== JOB METADATA =====");
		console.log(`🔍 Job ID: ${metadata.jobId}`);
		console.log(`📅 Start Time: ${new Date(metadata.startTime).toISOString()}`);
		console.log(
			`⏱️  Duration: ${duration ? `${(duration / 1000).toFixed(2)}s` : "N/A"}`
		);
		console.log(
			`📈 Status: ${this.getStatusEmoji(
				metadata.status
			)} ${metadata.status.toUpperCase()}`
		);

		if (metadata.retryCount && metadata.retryCount > 0) {
			console.log(`🔄 Retry Count: ${metadata.retryCount}`);
		}

		if (metadata.timedOut) {
			console.log("⏰ Timeout: YES");
		}

		if (metadata.cancelled) {
			console.log("🚫 Cancelled: YES");
		}

		if (result) {
			console.log("\n📋 ===== JOB RESULT =====");
			console.log(`✅ Success: ${result.success ? "YES" : "NO"}`);
			console.log(`💬 Message: ${result.message}`);

			if (result.attestationResult) {
				console.log("\n🔐 ===== ATTESTATION RESULT =====");
				console.log(
					`✅ Verified: ${result.attestationResult.isValid ? "YES" : "NO"}`
				);
				console.log(`📋 Type: ${result.attestationResult.attestationType}`);
				console.log(
					`📊 Claims: ${JSON.stringify(
						result.attestationResult.verifiedClaims,
						null,
						2
					)}`
				);
			}

			if (result.c2dJobStatus) {
				console.log("\n🌊 ===== C2D JOB STATUS =====");
				console.log(`🔍 Job ID: ${result.c2dJobStatus.jobId}`);
				console.log(
					`📈 Status: ${this.getStatusEmoji(
						result.c2dJobStatus.status
					)} ${result.c2dJobStatus.status.toUpperCase()}`
				);
				console.log(`📊 Progress: ${result.c2dJobStatus.progress}%`);
				if (result.c2dJobStatus.duration) {
					console.log(
						`⏱️  Duration: ${(result.c2dJobStatus.duration / 1000).toFixed(2)}s`
					);
				}
			}

			if (result.error) {
				console.log("\n❌ ===== ERROR DETAILS =====");
				console.log(`🔍 Code: ${result.error.code}`);
				console.log(`💬 Message: ${result.error.message}`);
				console.log(`👤 User Message: ${result.error.userMessage}`);
				console.log(`🔄 Retryable: ${result.error.retryable ? "YES" : "NO"}`);
				console.log(`🏷️  Category: ${result.error.category}`);
				if (result.error.suggestions && result.error.suggestions.length > 0) {
					console.log(`💡 Suggestions: ${result.error.suggestions.join(", ")}`);
				}
			}
		}

		console.log("📊 ========================\n");
	}

	/**
	 * Add a log entry for a job
	 * @param jobId Job identifier
	 * @param level Log level
	 * @param message Log message
	 * @param context Optional context data
	 * @param operation Optional operation name
	 * @param duration Optional duration
	 */
	addJobLog(
		jobId: string,
		level: "info" | "warn" | "error" | "debug",
		message: string,
		context?: Record<string, unknown>,
		operation?: string,
		duration?: number
	): void {
		const logEntry: JobLogEntry = {
			jobId,
			timestamp: Date.now(),
			level,
			message,
			context,
			operation,
			duration,
		};

		if (!this.jobLogs.has(jobId)) {
			this.jobLogs.set(jobId, []);
		}

		this.jobLogs.get(jobId)!.push(logEntry);

		// Also log to console with appropriate formatting
		const emoji = this.getLogLevelEmoji(level);
		const durationText = duration ? ` (${(duration / 1000).toFixed(2)}s)` : "";
		const operationText = operation ? ` [${operation}]` : "";

		console.log(`${emoji}${operationText} ${message}${durationText}`);

		if (context && Object.keys(context).length > 0) {
			console.log(`   Context: ${JSON.stringify(context, null, 2)}`);
		}
	}

	/**
	 * Add a timeline event for a job
	 * @param jobId Job identifier
	 * @param event Event name
	 * @param details Event details
	 * @param duration Optional duration
	 */
	addTimelineEvent(
		jobId: string,
		event: string,
		details: string,
		duration?: number
	): void {
		if (!this.jobTimelines.has(jobId)) {
			this.jobTimelines.set(jobId, []);
		}

		this.jobTimelines.get(jobId)!.push({
			timestamp: Date.now(),
			event,
			details,
			duration,
		});
	}

	/**
	 * Persist job metadata and related data to JSON files for UI consumption
	 * @param metadata Job metadata
	 * @param result Job result (optional)
	 */
	async persistJobData(
		metadata: JobMetadata,
		result?: JobResult
	): Promise<void> {
		try {
			const jobData: JobDataForUI = {
				jobId: metadata.jobId,
				metadata,
				result,
				logs: this.jobLogs.get(metadata.jobId) || [],
				timeline: this.jobTimelines.get(metadata.jobId) || [],
				performance: {
					totalDuration: metadata.duration,
					attestationDuration: this.calculateAttestationDuration(
						metadata.jobId
					),
					c2dDuration: this.calculateC2DDuration(metadata.jobId),
					retryCount: metadata.retryCount || 0,
					errorCount: this.countErrors(metadata.jobId),
				},
				attestationDetails: result?.attestationResult
					? {
							isValid: result.attestationResult.isValid,
							attestationType: result.attestationResult.attestationType,
							verifiedClaims: result.attestationResult.verifiedClaims as Record<
								string,
								unknown
							>,
					  }
					: undefined,
				c2dDetails: result?.c2dJobStatus
					? {
							jobId: result.c2dJobStatus.jobId,
							status: result.c2dJobStatus.status,
							progress: result.c2dJobStatus.progress,
							output: result.c2dJobStatus.result?.output,
							metrics: result.c2dJobStatus.result?.metrics as unknown as
								| Record<string, unknown>
								| undefined,
					  }
					: undefined,
			};

			// Write individual job file
			const jobFilePath = join(this.logsDir, `${metadata.jobId}.json`);
			await fs.writeFile(jobFilePath, JSON.stringify(jobData, null, 2));

			// Write latest job file (for easy UI access)
			const latestFilePath = join(this.logsDir, "latest.json");
			await fs.writeFile(latestFilePath, JSON.stringify(jobData, null, 2));

			// Update job history
			await this.updateJobHistory(metadata, result);

			console.log(`💾 Job data persisted: ${jobFilePath}`);
			console.log(`🔗 Latest job data: ${latestFilePath}`);
		} catch (error) {
			console.error("❌ Failed to persist job data:", error);
			throw error;
		}
	}

	/**
	 * Update job history with new job entry
	 * @param metadata Job metadata
	 * @param result Job result (optional)
	 */
	private async updateJobHistory(
		metadata: JobMetadata,
		result?: JobResult
	): Promise<void> {
		try {
			const historyFilePath = join(this.logsDir, "history.json");

			let history: JobHistory;
			try {
				const historyData = await fs.readFile(historyFilePath, "utf8");
				history = JSON.parse(historyData);
			} catch {
				// Initialize empty history if file doesn't exist
				history = {
					jobs: [],
					summary: {
						totalJobs: 0,
						successfulJobs: 0,
						failedJobs: 0,
						lastUpdated: Date.now(),
					},
				};
			}

			// Add new job entry
			const jobEntry: JobHistoryEntry = {
				jobId: metadata.jobId,
				timestamp: metadata.startTime,
				status: metadata.status,
				duration: metadata.duration,
				success: result?.success ?? false,
				error: result?.error?.userMessage,
			};

			// Create new jobs array with the new entry
			const newJobs = [jobEntry, ...history.jobs];

			// Keep only last 100 jobs
			const trimmedJobs =
				newJobs.length > 100 ? newJobs.slice(0, 100) : newJobs;

			// Create new history object
			history = {
				jobs: trimmedJobs,
				summary: {
					totalJobs: trimmedJobs.length,
					successfulJobs: trimmedJobs.filter((j) => j.success).length,
					failedJobs: trimmedJobs.filter((j) => !j.success).length,
					averageDuration: trimmedJobs
						.filter((j) => j.duration)
						.reduce((sum, j, _, arr) => sum + j.duration! / arr.length, 0),
					lastUpdated: Date.now(),
				},
			};

			await fs.writeFile(historyFilePath, JSON.stringify(history, null, 2));
		} catch (error) {
			console.error("❌ Failed to update job history:", error);
		}
	}

	/**
	 * Get status emoji for visual representation
	 * @param status Job status
	 * @returns Emoji string
	 */
	private getStatusEmoji(status: string): string {
		switch (status) {
			case "pending":
				return "⏳";
			case "running":
				return "🏃";
			case "completed":
				return "✅";
			case "failed":
				return "❌";
			case "timeout":
				return "⏰";
			case "cancelled":
				return "🚫";
			default:
				return "❓";
		}
	}

	/**
	 * Get log level emoji for visual representation
	 * @param level Log level
	 * @returns Emoji string
	 */
	private getLogLevelEmoji(level: string): string {
		switch (level) {
			case "info":
				return "ℹ️";
			case "warn":
				return "⚠️";
			case "error":
				return "❌";
			case "debug":
				return "🔍";
			default:
				return "📝";
		}
	}

	/**
	 * Calculate attestation duration from logs
	 * @param jobId Job identifier
	 * @returns Duration in milliseconds
	 */
	private calculateAttestationDuration(jobId: string): number | undefined {
		const logs = this.jobLogs.get(jobId) || [];
		const attestationLogs = logs.filter(
			(log) => log.operation === "attestation"
		);

		if (attestationLogs.length === 0) return undefined;

		const startTime = Math.min(...attestationLogs.map((log) => log.timestamp));
		const endTime = Math.max(...attestationLogs.map((log) => log.timestamp));

		return endTime - startTime;
	}

	/**
	 * Calculate C2D duration from logs
	 * @param jobId Job identifier
	 * @returns Duration in milliseconds
	 */
	private calculateC2DDuration(jobId: string): number | undefined {
		const logs = this.jobLogs.get(jobId) || [];
		const c2dLogs = logs.filter((log) => log.operation === "c2d");

		if (c2dLogs.length === 0) return undefined;

		const startTime = Math.min(...c2dLogs.map((log) => log.timestamp));
		const endTime = Math.max(...c2dLogs.map((log) => log.timestamp));

		return endTime - startTime;
	}

	/**
	 * Count errors in job logs
	 * @param jobId Job identifier
	 * @returns Number of errors
	 */
	private countErrors(jobId: string): number {
		const logs = this.jobLogs.get(jobId) || [];
		return logs.filter((log) => log.level === "error").length;
	}

	/**
	 * Clean up old job logs and data
	 * @param maxAgeMs Maximum age in milliseconds
	 */
	async cleanupOldJobs(
		maxAgeMs: number = 7 * 24 * 60 * 60 * 1000
	): Promise<void> {
		try {
			const files = await fs.readdir(this.logsDir);
			const cutoffTime = Date.now() - maxAgeMs;

			for (const file of files) {
				if (
					file.endsWith(".json") &&
					file !== "latest.json" &&
					file !== "history.json"
				) {
					const filePath = join(this.logsDir, file);
					const stats = await fs.stat(filePath);

					if (stats.mtime.getTime() < cutoffTime) {
						await fs.unlink(filePath);
						console.log(`🗑️  Cleaned up old job file: ${file}`);
					}
				}
			}
		} catch (error) {
			console.error("❌ Failed to cleanup old job files:", error);
		}
	}

	/**
	 * Get job data for UI consumption
	 * @param jobId Job identifier
	 * @returns Job data or undefined if not found
	 */
	async getJobData(jobId: string): Promise<JobDataForUI | undefined> {
		try {
			const jobFilePath = join(this.logsDir, `${jobId}.json`);
			const jobData = await fs.readFile(jobFilePath, "utf8");
			return JSON.parse(jobData);
		} catch {
			return undefined;
		}
	}

	/**
	 * Get latest job data for UI consumption
	 * @returns Latest job data or undefined if not found
	 */
	async getLatestJobData(): Promise<JobDataForUI | undefined> {
		try {
			const latestFilePath = join(this.logsDir, "latest.json");
			const jobData = await fs.readFile(latestFilePath, "utf8");
			return JSON.parse(jobData);
		} catch {
			return undefined;
		}
	}

	/**
	 * Get job history for UI consumption
	 * @returns Job history
	 */
	async getJobHistory(): Promise<JobHistory> {
		try {
			const historyFilePath = join(this.logsDir, "history.json");
			const historyData = await fs.readFile(historyFilePath, "utf8");
			return JSON.parse(historyData);
		} catch {
			return {
				jobs: [],
				summary: {
					totalJobs: 0,
					successfulJobs: 0,
					failedJobs: 0,
					lastUpdated: Date.now(),
				},
			};
		}
	}
}

/**
 * Create a job metadata logger instance
 * @param baseDir Base directory for logs
 * @returns JobMetadataLogger instance
 */
export function createJobMetadataLogger(baseDir?: string): JobMetadataLogger {
	return new JobMetadataLogger(baseDir);
}
