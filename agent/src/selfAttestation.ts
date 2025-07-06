/**
 * Self Protocol attestation module for age, residency, and role verification
 * Uses Zero Knowledge proofs for privacy-preserving identity verification
 */

import {
	AttestationErrorCode,
	AttestationException,
	createAttestationError,
	validateAttestationResult,
	type AttestationFailureDetails,
} from "./attestationErrors";

// Note: @selfxyz/core types - will be defined as needed since package may not have full TypeScript support
interface SelfClient {
	verifyAttestation(request: AttestationRequest): Promise<AttestationResult>;
	createProofRequest(criteria: ProofCriteria): Promise<ProofRequest>;
}

export interface AttestationRequest {
	readonly userDid: string;
	readonly proofRequest: ProofRequest;
	readonly challengeNonce?: string;
}

export interface AttestationResult {
	readonly isValid: boolean;
	readonly attestationType: AttestationType;
	readonly verifiedClaims: VerifiedClaims;
	readonly proofHash: string;
	readonly timestamp: number;
	readonly error?: string;
	readonly failureDetails?: AttestationFailureDetails;
}

export interface VerifiedClaims {
	readonly age?: {
		readonly isOver18: boolean;
		readonly isOver21: boolean;
		readonly ageRange?: string; // e.g., "18-25", "26-35", etc.
	};
	readonly residency?: {
		readonly country: string;
		readonly region?: string;
		readonly isEuResident: boolean;
		readonly isUsResident: boolean;
	};
	readonly role?: {
		readonly isRealEstateProfessional: boolean;
		readonly licenseType?: string;
		readonly verificationLevel: "basic" | "enhanced" | "premium";
	};
	readonly identity?: {
		readonly isHuman: boolean;
		readonly isUnique: boolean;
		readonly riskScore: number; // 0-100, lower is better
	};
}

export interface ProofCriteria {
	readonly requireAge?: {
		readonly minimumAge?: number;
		readonly ageRangeOnly?: boolean;
	};
	readonly requireResidency?: {
		readonly allowedCountries?: string[];
		readonly blockedCountries?: string[];
		readonly requireEuResident?: boolean;
	};
	readonly requireRole?: {
		readonly requiredRoles: string[];
		readonly minimumVerificationLevel?: "basic" | "enhanced" | "premium";
	};
	readonly requireIdentity?: {
		readonly requireHuman?: boolean;
		readonly requireUnique?: boolean;
		readonly maxRiskScore?: number;
	};
}

export interface ProofRequest {
	readonly requestId: string;
	readonly criteria: ProofCriteria;
	readonly expiresAt: number;
	readonly callbackUrl?: string;
}

export type AttestationType =
	| "age"
	| "residency"
	| "role"
	| "identity"
	| "combined";

export interface SelfAttestationConfig {
	readonly selfApiKey: string;
	readonly selfEndpoint: string;
	readonly defaultTimeout: number;
	readonly enableSelectiveDisclosure: boolean;
	readonly enableMockFailures: boolean; // For testing error scenarios
}

/**
 * Self Protocol attestation service for privacy-preserving identity verification
 */
export class SelfAttestationService {
	private readonly config: SelfAttestationConfig;
	private selfClient: SelfClient | null = null;

	constructor(config: SelfAttestationConfig) {
		this.config = config;
	}

	/**
	 * Initialize the Self Protocol client
	 * @returns Promise that resolves when client is initialized
	 */
	public async initialize(): Promise<void> {
		try {
			// Validate configuration
			if (!this.config.selfApiKey) {
				throw createAttestationError(AttestationErrorCode.MISSING_API_KEY);
			}

			if (!this.config.selfEndpoint) {
				throw createAttestationError(
					AttestationErrorCode.INVALID_CONFIGURATION,
					"Self Protocol endpoint is required"
				);
			}

			// TODO: Initialize actual Self SDK client
			// const { Self } = await import('@selfxyz/core');
			// this.selfClient = new Self({
			//   apiKey: this.config.selfApiKey,
			//   endpoint: this.config.selfEndpoint
			// });

			console.log("Self Protocol client initialized (placeholder)");
			this.selfClient = this.createMockClient();
		} catch (error) {
			if (error instanceof AttestationException) {
				throw error;
			}
			throw createAttestationError(
				AttestationErrorCode.ATTESTATION_SERVICE_UNAVAILABLE,
				`Failed to initialize Self Protocol client: ${
					error instanceof Error ? error.message : "Unknown error"
				}`
			);
		}
	}

	/**
	 * Verify user's age attestation
	 * @param userDid User's decentralized identifier
	 * @param minimumAge Minimum age requirement (default: 18)
	 * @returns Promise with age verification result
	 */
	public async verifyAge(
		userDid: string,
		minimumAge: number = 18
	): Promise<AttestationResult> {
		try {
			await this.ensureInitialized();
			this.validateUserDid(userDid);

			const criteria: ProofCriteria = {
				requireAge: {
					minimumAge,
					ageRangeOnly: this.config.enableSelectiveDisclosure,
				},
			};

			const proofRequest = await this.selfClient!.createProofRequest(criteria);

			const attestationRequest: AttestationRequest = {
				userDid,
				proofRequest,
				challengeNonce: this.generateNonce(),
			};

			const result = await this.selfClient!.verifyAttestation(
				attestationRequest
			);

			// Validate the result
			const validationResult = this.validateResult(result, criteria);
			if (!validationResult.isValid) {
				return {
					...result,
					attestationType: "age",
					isValid: false,
					failureDetails: validationResult.failureDetails,
				};
			}

			return {
				...result,
				attestationType: "age",
			};
		} catch (error) {
			if (error instanceof AttestationException) {
				throw error;
			}
			throw createAttestationError(
				AttestationErrorCode.AGE_VERIFICATION_FAILED,
				`Age verification failed: ${
					error instanceof Error ? error.message : "Unknown error"
				}`
			);
		}
	}

	/**
	 * Verify user's residency attestation
	 * @param userDid User's decentralized identifier
	 * @param allowedCountries Array of allowed country codes (ISO 3166-1 alpha-2)
	 * @param blockedCountries Array of blocked country codes
	 * @returns Promise with residency verification result
	 */
	public async verifyResidency(
		userDid: string,
		allowedCountries?: string[],
		blockedCountries?: string[]
	): Promise<AttestationResult> {
		try {
			await this.ensureInitialized();
			this.validateUserDid(userDid);

			const criteria: ProofCriteria = {
				requireResidency: {
					allowedCountries,
					blockedCountries,
					requireEuResident: allowedCountries?.some((country) =>
						this.isEuCountry(country)
					),
				},
			};

			const proofRequest = await this.selfClient!.createProofRequest(criteria);

			const attestationRequest: AttestationRequest = {
				userDid,
				proofRequest,
				challengeNonce: this.generateNonce(),
			};

			const result = await this.selfClient!.verifyAttestation(
				attestationRequest
			);

			// Validate the result
			const validationResult = this.validateResult(result, criteria);
			if (!validationResult.isValid) {
				return {
					...result,
					attestationType: "residency",
					isValid: false,
					failureDetails: validationResult.failureDetails,
				};
			}

			return {
				...result,
				attestationType: "residency",
			};
		} catch (error) {
			if (error instanceof AttestationException) {
				throw error;
			}
			throw createAttestationError(
				AttestationErrorCode.RESIDENCY_VERIFICATION_FAILED,
				`Residency verification failed: ${
					error instanceof Error ? error.message : "Unknown error"
				}`
			);
		}
	}

	/**
	 * Verify user's professional role attestation
	 * @param userDid User's decentralized identifier
	 * @param requiredRoles Array of required professional roles
	 * @param minimumLevel Minimum verification level required
	 * @returns Promise with role verification result
	 */
	public async verifyRole(
		userDid: string,
		requiredRoles: string[],
		minimumLevel: "basic" | "enhanced" | "premium" = "basic"
	): Promise<AttestationResult> {
		try {
			await this.ensureInitialized();
			this.validateUserDid(userDid);

			const criteria: ProofCriteria = {
				requireRole: {
					requiredRoles,
					minimumVerificationLevel: minimumLevel,
				},
			};

			const proofRequest = await this.selfClient!.createProofRequest(criteria);

			const attestationRequest: AttestationRequest = {
				userDid,
				proofRequest,
				challengeNonce: this.generateNonce(),
			};

			const result = await this.selfClient!.verifyAttestation(
				attestationRequest
			);

			// Validate the result
			const validationResult = this.validateResult(result, criteria);
			if (!validationResult.isValid) {
				return {
					...result,
					attestationType: "role",
					isValid: false,
					failureDetails: validationResult.failureDetails,
				};
			}

			return {
				...result,
				attestationType: "role",
			};
		} catch (error) {
			if (error instanceof AttestationException) {
				throw error;
			}
			throw createAttestationError(
				AttestationErrorCode.ROLE_VERIFICATION_FAILED,
				`Role verification failed: ${
					error instanceof Error ? error.message : "Unknown error"
				}`
			);
		}
	}

	/**
	 * Perform comprehensive identity verification including age, residency, and role
	 * @param userDid User's decentralized identifier
	 * @param criteria Combined verification criteria
	 * @returns Promise with comprehensive verification result
	 */
	public async verifyComprehensive(
		userDid: string,
		criteria: ProofCriteria
	): Promise<AttestationResult> {
		try {
			await this.ensureInitialized();
			this.validateUserDid(userDid);

			const proofRequest = await this.selfClient!.createProofRequest(criteria);

			const attestationRequest: AttestationRequest = {
				userDid,
				proofRequest,
				challengeNonce: this.generateNonce(),
			};

			const result = await this.selfClient!.verifyAttestation(
				attestationRequest
			);

			// Validate the result
			const validationResult = this.validateResult(result, criteria);
			if (!validationResult.isValid) {
				return {
					...result,
					attestationType: "combined",
					isValid: false,
					failureDetails: validationResult.failureDetails,
				};
			}

			return {
				...result,
				attestationType: "combined",
			};
		} catch (error) {
			if (error instanceof AttestationException) {
				throw error;
			}
			throw createAttestationError(
				AttestationErrorCode.IDENTITY_VERIFICATION_FAILED,
				`Comprehensive verification failed: ${
					error instanceof Error ? error.message : "Unknown error"
				}`
			);
		}
	}

	/**
	 * Validate user DID format
	 * @param userDid User's decentralized identifier
	 * @throws AttestationException if DID is invalid
	 */
	private validateUserDid(userDid: string): void {
		if (!userDid || userDid.trim().length === 0) {
			throw createAttestationError(
				AttestationErrorCode.INVALID_DID,
				"User DID is required"
			);
		}

		// Basic DID format validation
		if (!userDid.startsWith("did:")) {
			throw createAttestationError(
				AttestationErrorCode.INVALID_DID,
				"User DID must start with 'did:'"
			);
		}

		// Additional validation could be added here
	}

	/**
	 * Validate attestation result against criteria
	 * @param result Attestation result to validate
	 * @param criteria Verification criteria
	 * @returns Validation result with failure details if invalid
	 */
	private validateResult(
		result: AttestationResult,
		criteria: ProofCriteria
	): { isValid: boolean; failureDetails?: AttestationFailureDetails } {
		if (!result.isValid) {
			return { isValid: false };
		}

		const failureDetails = validateAttestationResult(result, criteria);
		if (failureDetails) {
			return { isValid: false, failureDetails };
		}

		return { isValid: true };
	}

	/**
	 * Generate a cryptographic nonce for challenge-response
	 * @returns Random nonce string
	 */
	private generateNonce(): string {
		return `nonce-${Date.now()}-${Math.random().toString(36).substr(2, 16)}`;
	}

	/**
	 * Check if a country code is in the EU
	 * @param countryCode ISO 3166-1 alpha-2 country code
	 * @returns True if country is in EU
	 */
	private isEuCountry(countryCode: string): boolean {
		const euCountries = [
			"AT",
			"BE",
			"BG",
			"HR",
			"CY",
			"CZ",
			"DK",
			"EE",
			"FI",
			"FR",
			"DE",
			"GR",
			"HU",
			"IE",
			"IT",
			"LV",
			"LT",
			"LU",
			"MT",
			"NL",
			"PL",
			"PT",
			"RO",
			"SK",
			"SI",
			"ES",
			"SE",
		];
		return euCountries.includes(countryCode.toUpperCase());
	}

	/**
	 * Ensure the Self client is initialized
	 * @throws AttestationException if client is not initialized
	 */
	private async ensureInitialized(): Promise<void> {
		if (!this.selfClient) {
			await this.initialize();
		}
	}

	/**
	 * Create a mock Self client for development/testing
	 * @returns Mock Self client implementation
	 */
	private createMockClient(): SelfClient {
		const self = this;
		return {
			async createProofRequest(criteria: ProofCriteria): Promise<ProofRequest> {
				return {
					requestId: `req-${Date.now()}`,
					criteria,
					expiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
				};
			},

			async verifyAttestation(
				request: AttestationRequest
			): Promise<AttestationResult> {
				// Simulate different error scenarios based on configuration
				if (self.config.enableMockFailures) {
					const random = Math.random();

					// 10% chance of various failures for testing
					if (random < 0.02) {
						// Invalid age scenario
						return self.createMockFailureResult(
							request,
							"age",
							{ age: { isOver18: false, isOver21: false } },
							"User is under 18"
						);
					} else if (random < 0.04) {
						// Invalid country scenario
						return self.createMockFailureResult(
							request,
							"residency",
							{
								residency: {
									country: "XX",
									isEuResident: false,
									isUsResident: false,
								},
							},
							"Country not supported"
						);
					} else if (random < 0.06) {
						// Invalid role scenario
						return self.createMockFailureResult(
							request,
							"role",
							{
								role: {
									isRealEstateProfessional: false,
									verificationLevel: "basic",
								},
							},
							"Insufficient verification level"
						);
					} else if (random < 0.08) {
						// High risk score scenario
						return self.createMockFailureResult(
							request,
							"identity",
							{ identity: { isHuman: true, isUnique: true, riskScore: 85 } },
							"High risk score detected"
						);
					} else if (random < 0.1) {
						// Missing proofs scenario
						return self.createMockFailureResult(
							request,
							"combined",
							{},
							"Required proofs are missing"
						);
					}
				}

				// Mock successful implementation for development
				const mockClaims: VerifiedClaims = {
					age: request.proofRequest.criteria.requireAge
						? {
								isOver18: true,
								isOver21: true,
								ageRange: "25-35",
						  }
						: undefined,
					residency: request.proofRequest.criteria.requireResidency
						? {
								country: "US",
								region: "California",
								isEuResident: false,
								isUsResident: true,
						  }
						: undefined,
					role: request.proofRequest.criteria.requireRole
						? {
								isRealEstateProfessional: true,
								licenseType: "Real Estate Broker",
								verificationLevel: "enhanced",
						  }
						: undefined,
					identity: request.proofRequest.criteria.requireIdentity
						? {
								isHuman: true,
								isUnique: true,
								riskScore: 15,
						  }
						: undefined,
				};

				return {
					isValid: true,
					attestationType: "combined",
					verifiedClaims: mockClaims,
					proofHash: `proof-${Date.now()}-${Math.random()
						.toString(36)
						.substr(2, 12)}`,
					timestamp: Date.now(),
				};
			},
		};
	}

	/**
	 * Create a mock failure result for testing
	 * @param request Original attestation request
	 * @param failureType Type of failure to simulate
	 * @param partialClaims Partial claims to include
	 * @param errorMessage Error message
	 * @returns Mock failure result
	 */
	private createMockFailureResult(
		request: AttestationRequest,
		failureType: string,
		partialClaims: Partial<VerifiedClaims>,
		errorMessage: string
	): AttestationResult {
		return {
			isValid: false,
			attestationType: failureType as AttestationType,
			verifiedClaims: partialClaims as VerifiedClaims,
			proofHash: `failed-proof-${Date.now()}`,
			timestamp: Date.now(),
			error: errorMessage,
		};
	}
}

/**
 * Create and configure Self attestation service
 * @param config Self attestation configuration
 * @returns Configured Self attestation service instance
 */
export function createSelfAttestationService(
	config?: Partial<SelfAttestationConfig>
): SelfAttestationService {
	const defaultConfig: SelfAttestationConfig = {
		selfApiKey: process.env.SELF_PROTOCOL_API_KEY || "",
		selfEndpoint: process.env.SELF_PROTOCOL_ENDPOINT || "https://api.self.xyz",
		defaultTimeout: 30000, // 30 seconds
		enableSelectiveDisclosure: true,
		enableMockFailures: process.env.NODE_ENV === "development", // Enable mock failures in dev
	};

	const fullConfig = { ...defaultConfig, ...config };

	return new SelfAttestationService(fullConfig);
}
