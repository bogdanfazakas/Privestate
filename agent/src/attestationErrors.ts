/**
 * Attestation error handling module
 * Defines specific error types and provides user-friendly error messages for attestation failures
 */

export enum AttestationErrorCode {
	// General errors
	ATTESTATION_SERVICE_UNAVAILABLE = "ATTESTATION_SERVICE_UNAVAILABLE",
	INVALID_DID = "INVALID_DID",
	EXPIRED_PROOF = "EXPIRED_PROOF",
	INVALID_SIGNATURE = "INVALID_SIGNATURE",

	// Age verification errors
	AGE_VERIFICATION_FAILED = "AGE_VERIFICATION_FAILED",
	UNDER_MINIMUM_AGE = "UNDER_MINIMUM_AGE",
	AGE_PROOF_MISSING = "AGE_PROOF_MISSING",

	// Residency verification errors
	RESIDENCY_VERIFICATION_FAILED = "RESIDENCY_VERIFICATION_FAILED",
	COUNTRY_NOT_ALLOWED = "COUNTRY_NOT_ALLOWED",
	COUNTRY_BLOCKED = "COUNTRY_BLOCKED",
	RESIDENCY_PROOF_MISSING = "RESIDENCY_PROOF_MISSING",

	// Role verification errors
	ROLE_VERIFICATION_FAILED = "ROLE_VERIFICATION_FAILED",
	INSUFFICIENT_ROLE_LEVEL = "INSUFFICIENT_ROLE_LEVEL",
	INVALID_PROFESSIONAL_ROLE = "INVALID_PROFESSIONAL_ROLE",
	ROLE_PROOF_MISSING = "ROLE_PROOF_MISSING",

	// Identity verification errors
	IDENTITY_VERIFICATION_FAILED = "IDENTITY_VERIFICATION_FAILED",
	NOT_HUMAN_VERIFIED = "NOT_HUMAN_VERIFIED",
	DUPLICATE_IDENTITY = "DUPLICATE_IDENTITY",
	HIGH_RISK_SCORE = "HIGH_RISK_SCORE",
	IDENTITY_PROOF_MISSING = "IDENTITY_PROOF_MISSING",

	// Configuration errors
	MISSING_API_KEY = "MISSING_API_KEY",
	INVALID_CONFIGURATION = "INVALID_CONFIGURATION",
	UNSUPPORTED_ATTESTATION_TYPE = "UNSUPPORTED_ATTESTATION_TYPE",

	// Timeout errors
	JOB_TIMEOUT = "JOB_TIMEOUT",
	ATTESTATION_TIMEOUT = "ATTESTATION_TIMEOUT",
	C2D_TIMEOUT = "C2D_TIMEOUT",
	OPERATION_CANCELLED = "OPERATION_CANCELLED",
}

export interface AttestationError {
	readonly code: AttestationErrorCode;
	readonly message: string;
	readonly details?: string;
	readonly userMessage: string;
	readonly retryable: boolean;
	readonly category:
		| "authentication"
		| "authorization"
		| "configuration"
		| "verification";
	readonly suggestions?: string[];
}

export interface AttestationFailureDetails {
	readonly failedChecks: string[];
	readonly requiredCriteria: Record<string, unknown>;
	readonly actualValues: Record<string, unknown>;
	readonly recommendations: string[];
}

export class AttestationException extends Error {
	public readonly errorCode: AttestationErrorCode;
	public readonly userMessage: string;
	public readonly retryable: boolean;
	public readonly category: string;
	public readonly suggestions: string[];
	public readonly details?: AttestationFailureDetails;

	constructor(error: AttestationError, details?: AttestationFailureDetails) {
		super(error.message);
		this.name = "AttestationException";
		this.errorCode = error.code;
		this.userMessage = error.userMessage;
		this.retryable = error.retryable;
		this.category = error.category;
		this.suggestions = error.suggestions || [];
		this.details = details;
	}
}

/**
 * Create attestation error with detailed information
 */
export function createAttestationError(
	code: AttestationErrorCode,
	customMessage?: string,
	details?: AttestationFailureDetails
): AttestationException {
	const errorInfo = ATTESTATION_ERROR_CATALOG[code];

	const error: AttestationError = {
		...errorInfo,
		message: customMessage || errorInfo.message,
	};

	return new AttestationException(error, details);
}

/**
 * Catalog of all attestation errors with user-friendly messages and suggestions
 */
export const ATTESTATION_ERROR_CATALOG: Record<
	AttestationErrorCode,
	AttestationError
> = {
	// General errors
	[AttestationErrorCode.ATTESTATION_SERVICE_UNAVAILABLE]: {
		code: AttestationErrorCode.ATTESTATION_SERVICE_UNAVAILABLE,
		message: "Self Protocol attestation service is currently unavailable",
		userMessage:
			"Identity verification service is temporarily unavailable. Please try again later.",
		retryable: true,
		category: "authentication",
		suggestions: [
			"Check your internet connection",
			"Try again in a few minutes",
			"Contact support if the problem persists",
		],
	},

	[AttestationErrorCode.INVALID_DID]: {
		code: AttestationErrorCode.INVALID_DID,
		message: "Invalid or malformed decentralized identifier (DID)",
		userMessage:
			"Your digital identity format is invalid. Please verify your wallet connection.",
		retryable: false,
		category: "authentication",
		suggestions: [
			"Reconnect your wallet",
			"Ensure you have a valid Self Protocol identity",
			"Contact support for identity setup assistance",
		],
	},

	[AttestationErrorCode.EXPIRED_PROOF]: {
		code: AttestationErrorCode.EXPIRED_PROOF,
		message: "Attestation proof has expired",
		userMessage:
			"Your identity verification has expired. Please complete verification again.",
		retryable: true,
		category: "verification",
		suggestions: [
			"Complete the identity verification process again",
			"Ensure verification is completed within the time limit",
		],
	},

	[AttestationErrorCode.INVALID_SIGNATURE]: {
		code: AttestationErrorCode.INVALID_SIGNATURE,
		message: "Invalid cryptographic signature on attestation proof",
		userMessage:
			"Identity verification signature is invalid. Please verify your identity again.",
		retryable: true,
		category: "verification",
		suggestions: [
			"Complete the verification process again",
			"Ensure your wallet is properly connected",
			"Check for any wallet software updates",
		],
	},

	// Age verification errors
	[AttestationErrorCode.AGE_VERIFICATION_FAILED]: {
		code: AttestationErrorCode.AGE_VERIFICATION_FAILED,
		message: "Age verification failed",
		userMessage:
			"Age verification could not be completed. Please ensure you meet the minimum age requirement.",
		retryable: true,
		category: "verification",
		suggestions: [
			"Verify you are at least 18 years old",
			"Complete age verification with valid documentation",
			"Contact support if you believe this is an error",
		],
	},

	[AttestationErrorCode.UNDER_MINIMUM_AGE]: {
		code: AttestationErrorCode.UNDER_MINIMUM_AGE,
		message: "User is under the minimum required age",
		userMessage:
			"You must be at least 18 years old to access real estate data.",
		retryable: false,
		category: "authorization",
		suggestions: [
			"This service is only available to users 18 years and older",
			"Contact support if you believe your age verification is incorrect",
		],
	},

	[AttestationErrorCode.AGE_PROOF_MISSING]: {
		code: AttestationErrorCode.AGE_PROOF_MISSING,
		message: "Age proof is missing from attestation",
		userMessage:
			"Age verification is required but not found. Please complete age verification.",
		retryable: true,
		category: "verification",
		suggestions: [
			"Complete age verification through Self Protocol",
			"Ensure age attestation is properly submitted",
		],
	},

	// Residency verification errors
	[AttestationErrorCode.RESIDENCY_VERIFICATION_FAILED]: {
		code: AttestationErrorCode.RESIDENCY_VERIFICATION_FAILED,
		message: "Residency verification failed",
		userMessage:
			"Location verification could not be completed. Please verify your country of residence.",
		retryable: true,
		category: "verification",
		suggestions: [
			"Verify your country of residence",
			"Ensure location attestation is properly submitted",
			"Check that your country is supported",
		],
	},

	[AttestationErrorCode.COUNTRY_NOT_ALLOWED]: {
		code: AttestationErrorCode.COUNTRY_NOT_ALLOWED,
		message: "User country is not in the allowed list",
		userMessage: "Real estate data access is not available in your country.",
		retryable: false,
		category: "authorization",
		suggestions: [
			"This service is currently available in: US, Canada, UK, and Australia",
			"Contact support for information about expanding availability",
		],
	},

	[AttestationErrorCode.COUNTRY_BLOCKED]: {
		code: AttestationErrorCode.COUNTRY_BLOCKED,
		message: "User country is in the blocked list",
		userMessage:
			"Access is restricted from your location due to regulatory requirements.",
		retryable: false,
		category: "authorization",
		suggestions: [
			"Service is not available in your jurisdiction",
			"Contact support for more information",
		],
	},

	[AttestationErrorCode.RESIDENCY_PROOF_MISSING]: {
		code: AttestationErrorCode.RESIDENCY_PROOF_MISSING,
		message: "Residency proof is missing from attestation",
		userMessage:
			"Location verification is required but not found. Please complete location verification.",
		retryable: true,
		category: "verification",
		suggestions: [
			"Complete location verification through Self Protocol",
			"Ensure residency attestation is properly submitted",
		],
	},

	// Role verification errors
	[AttestationErrorCode.ROLE_VERIFICATION_FAILED]: {
		code: AttestationErrorCode.ROLE_VERIFICATION_FAILED,
		message: "Professional role verification failed",
		userMessage:
			"Professional credentials could not be verified. Please check your role verification.",
		retryable: true,
		category: "verification",
		suggestions: [
			"Verify your professional credentials",
			"Ensure role attestation is properly submitted",
			"Check that your profession is in the approved list",
		],
	},

	[AttestationErrorCode.INSUFFICIENT_ROLE_LEVEL]: {
		code: AttestationErrorCode.INSUFFICIENT_ROLE_LEVEL,
		message: "User role verification level is insufficient",
		userMessage:
			"A higher level of professional verification is required for access.",
		retryable: true,
		category: "authorization",
		suggestions: [
			"Upgrade your professional verification to enhanced or premium level",
			"Contact support for verification level requirements",
		],
	},

	[AttestationErrorCode.INVALID_PROFESSIONAL_ROLE]: {
		code: AttestationErrorCode.INVALID_PROFESSIONAL_ROLE,
		message: "User professional role is not in the required list",
		userMessage:
			"Access requires verification as a real estate professional, data analyst, or researcher.",
		retryable: true,
		category: "authorization",
		suggestions: [
			"Verify credentials as: Real Estate Professional, Data Analyst, or Researcher",
			"Ensure your professional role matches the required categories",
			"Contact support if your profession should be included",
		],
	},

	[AttestationErrorCode.ROLE_PROOF_MISSING]: {
		code: AttestationErrorCode.ROLE_PROOF_MISSING,
		message: "Professional role proof is missing from attestation",
		userMessage:
			"Professional verification is required but not found. Please complete role verification.",
		retryable: true,
		category: "verification",
		suggestions: [
			"Complete professional role verification through Self Protocol",
			"Ensure role attestation is properly submitted",
		],
	},

	// Identity verification errors
	[AttestationErrorCode.IDENTITY_VERIFICATION_FAILED]: {
		code: AttestationErrorCode.IDENTITY_VERIFICATION_FAILED,
		message: "Identity verification failed",
		userMessage:
			"Identity verification could not be completed. Please verify your identity.",
		retryable: true,
		category: "verification",
		suggestions: [
			"Complete identity verification with valid documentation",
			"Ensure identity attestation is properly submitted",
			"Contact support if verification repeatedly fails",
		],
	},

	[AttestationErrorCode.NOT_HUMAN_VERIFIED]: {
		code: AttestationErrorCode.NOT_HUMAN_VERIFIED,
		message: "Human verification failed or missing",
		userMessage:
			"Human verification is required. Please complete biometric or document verification.",
		retryable: true,
		category: "verification",
		suggestions: [
			"Complete human verification (liveness check)",
			"Ensure biometric verification is properly submitted",
			"Use a supported device with camera access",
		],
	},

	[AttestationErrorCode.DUPLICATE_IDENTITY]: {
		code: AttestationErrorCode.DUPLICATE_IDENTITY,
		message: "Identity uniqueness check failed - duplicate detected",
		userMessage:
			"This identity is already in use. Each person can only have one account.",
		retryable: false,
		category: "authorization",
		suggestions: [
			"Contact support if you believe this is an error",
			"Use your existing account instead of creating a new one",
		],
	},

	[AttestationErrorCode.HIGH_RISK_SCORE]: {
		code: AttestationErrorCode.HIGH_RISK_SCORE,
		message: "Identity risk score exceeds maximum threshold",
		userMessage: "Additional verification is required due to security checks.",
		retryable: true,
		category: "verification",
		suggestions: [
			"Complete additional verification steps",
			"Contact support for manual review",
			"Provide additional documentation if requested",
		],
	},

	[AttestationErrorCode.IDENTITY_PROOF_MISSING]: {
		code: AttestationErrorCode.IDENTITY_PROOF_MISSING,
		message: "Identity proof is missing from attestation",
		userMessage:
			"Identity verification is required but not found. Please complete identity verification.",
		retryable: true,
		category: "verification",
		suggestions: [
			"Complete identity verification through Self Protocol",
			"Ensure identity attestation is properly submitted",
		],
	},

	// Configuration errors
	[AttestationErrorCode.MISSING_API_KEY]: {
		code: AttestationErrorCode.MISSING_API_KEY,
		message: "Self Protocol API key is missing or invalid",
		userMessage: "Service configuration error. Please contact support.",
		retryable: false,
		category: "configuration",
		suggestions: [
			"Contact technical support",
			"Service may be temporarily unavailable",
		],
	},

	[AttestationErrorCode.INVALID_CONFIGURATION]: {
		code: AttestationErrorCode.INVALID_CONFIGURATION,
		message: "Invalid attestation service configuration",
		userMessage: "Service configuration error. Please contact support.",
		retryable: false,
		category: "configuration",
		suggestions: [
			"Contact technical support",
			"Service may be temporarily unavailable",
		],
	},

	[AttestationErrorCode.UNSUPPORTED_ATTESTATION_TYPE]: {
		code: AttestationErrorCode.UNSUPPORTED_ATTESTATION_TYPE,
		message: "Unsupported attestation type requested",
		userMessage: "The requested verification type is not supported.",
		retryable: false,
		category: "configuration",
		suggestions: [
			"Contact support for available verification types",
			"Use supported verification methods",
		],
	},

	// Timeout errors
	[AttestationErrorCode.JOB_TIMEOUT]: {
		code: AttestationErrorCode.JOB_TIMEOUT,
		message: "Job execution exceeded the maximum allowed time limit",
		userMessage:
			"The verification process took too long and was automatically cancelled. Please try again.",
		retryable: true,
		category: "configuration",
		suggestions: [
			"Try again with a fresh session",
			"Check your internet connection for improved speed",
			"Contact support if the problem persists",
		],
	},

	[AttestationErrorCode.ATTESTATION_TIMEOUT]: {
		code: AttestationErrorCode.ATTESTATION_TIMEOUT,
		message: "Identity verification process timed out",
		userMessage:
			"Identity verification took too long to complete. Please try again.",
		retryable: true,
		category: "verification",
		suggestions: [
			"Ensure a stable internet connection",
			"Complete verification promptly when prompted",
			"Try again in a few minutes",
		],
	},

	[AttestationErrorCode.C2D_TIMEOUT]: {
		code: AttestationErrorCode.C2D_TIMEOUT,
		message: "Compute-to-Data job execution timed out",
		userMessage:
			"Data processing took longer than expected and was cancelled. Please try again.",
		retryable: true,
		category: "configuration",
		suggestions: [
			"Try again - the system may be experiencing high load",
			"Contact support if processing consistently times out",
			"Check if your request is within normal processing limits",
		],
	},

	[AttestationErrorCode.OPERATION_CANCELLED]: {
		code: AttestationErrorCode.OPERATION_CANCELLED,
		message: "Operation was cancelled due to timeout or user request",
		userMessage: "The operation was cancelled. You can try again if needed.",
		retryable: true,
		category: "configuration",
		suggestions: [
			"Try the operation again",
			"Ensure you have sufficient time to complete the process",
			"Contact support if you continue to experience issues",
		],
	},
};

/**
 * Validate attestation result and throw appropriate errors
 */
export function validateAttestationResult(
	result: any,
	criteria: any
): AttestationFailureDetails | null {
	const failedChecks: string[] = [];
	const actualValues: Record<string, unknown> = {};
	const recommendations: string[] = [];

	// Age validation
	if (criteria.requireAge) {
		const ageData = result.verifiedClaims?.age;
		if (!ageData) {
			failedChecks.push("Age verification missing");
			recommendations.push("Complete age verification");
		} else {
			actualValues.age = ageData;
			if (criteria.requireAge.minimumAge && !ageData.isOver18) {
				failedChecks.push(
					`Minimum age requirement not met (${criteria.requireAge.minimumAge})`
				);
				recommendations.push("Must be at least 18 years old");
			}
		}
	}

	// Residency validation
	if (criteria.requireResidency) {
		const residencyData = result.verifiedClaims?.residency;
		if (!residencyData) {
			failedChecks.push("Residency verification missing");
			recommendations.push("Complete location verification");
		} else {
			actualValues.residency = residencyData;

			if (criteria.requireResidency.allowedCountries?.length > 0) {
				if (
					!criteria.requireResidency.allowedCountries.includes(
						residencyData.country
					)
				) {
					failedChecks.push(`Country not allowed: ${residencyData.country}`);
					recommendations.push(
						`Must be resident of: ${criteria.requireResidency.allowedCountries.join(
							", "
						)}`
					);
				}
			}

			if (
				criteria.requireResidency.blockedCountries?.includes(
					residencyData.country
				)
			) {
				failedChecks.push(`Country blocked: ${residencyData.country}`);
				recommendations.push("Access not available from your location");
			}
		}
	}

	// Role validation
	if (criteria.requireRole) {
		const roleData = result.verifiedClaims?.role;
		if (!roleData) {
			failedChecks.push("Professional role verification missing");
			recommendations.push("Complete professional verification");
		} else {
			actualValues.role = roleData;

			if (
				!roleData.isRealEstateProfessional &&
				!criteria.requireRole.requiredRoles.includes("data_analyst") &&
				!criteria.requireRole.requiredRoles.includes("researcher")
			) {
				failedChecks.push("Invalid professional role");
				recommendations.push(
					`Must be: ${criteria.requireRole.requiredRoles.join(", ")}`
				);
			}

			const levelRanking: Record<string, number> = {
				basic: 1,
				enhanced: 2,
				premium: 3,
			};
			const requiredLevel =
				criteria.requireRole.minimumVerificationLevel || "basic";
			const userLevel = levelRanking[roleData.verificationLevel] || 0;
			const requiredLevelRank = levelRanking[requiredLevel] || 1;
			if (userLevel < requiredLevelRank) {
				failedChecks.push(
					`Insufficient verification level: ${roleData.verificationLevel} (required: ${requiredLevel})`
				);
				recommendations.push(
					`Upgrade verification to ${requiredLevel} or higher`
				);
			}
		}
	}

	// Identity validation
	if (criteria.requireIdentity) {
		const identityData = result.verifiedClaims?.identity;
		if (!identityData) {
			failedChecks.push("Identity verification missing");
			recommendations.push("Complete identity verification");
		} else {
			actualValues.identity = identityData;

			if (criteria.requireIdentity.requireHuman && !identityData.isHuman) {
				failedChecks.push("Human verification failed");
				recommendations.push("Complete human verification (liveness check)");
			}

			if (criteria.requireIdentity.requireUnique && !identityData.isUnique) {
				failedChecks.push("Identity uniqueness check failed");
				recommendations.push("Contact support - duplicate identity detected");
			}

			const maxRiskScore = criteria.requireIdentity.maxRiskScore || 30;
			if (identityData.riskScore > maxRiskScore) {
				failedChecks.push(
					`Risk score too high: ${identityData.riskScore} (max: ${maxRiskScore})`
				);
				recommendations.push(
					"Additional verification required due to security checks"
				);
			}
		}
	}

	if (failedChecks.length > 0) {
		return {
			failedChecks,
			requiredCriteria: criteria,
			actualValues,
			recommendations,
		};
	}

	return null;
}
