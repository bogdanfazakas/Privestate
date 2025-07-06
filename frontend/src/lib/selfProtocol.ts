// Self Protocol Types (adapted from agent module)
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
	age?: {
		isOver18: boolean;
		isOver21: boolean;
		ageRange: string;
	};
	residency?: {
		country: string;
		region: string;
		isEuResident: boolean;
		isUsResident: boolean;
	};
	role?: {
		isRealEstateProfessional: boolean;
		licenseType: string;
		verificationLevel: "basic" | "enhanced" | "premium";
	};
	identity?: {
		isHuman: boolean;
		isUnique: boolean;
		riskScore: number;
	};
}

export interface AttestationFailureDetails {
	code: string;
	message: string;
	userMessage: string;
	retryable: boolean;
	category: "authentication" | "verification" | "configuration";
	suggestions: string[];
}

export type AttestationType =
	| "age"
	| "residency"
	| "role"
	| "identity"
	| "combined";

export interface ProofCriteria {
	requireAge?: {
		minimumAge: number;
		ageRangeOnly?: boolean;
	};
	requireResidency?: {
		allowedCountries?: string[];
		blockedCountries?: string[];
		requireEuResident?: boolean;
	};
	requireRole?: {
		requiredRoles: string[];
		minimumVerificationLevel?: "basic" | "enhanced" | "premium";
	};
	requireIdentity?: {
		requireHuman: boolean;
		requireUnique: boolean;
		maxRiskScore: number;
	};
}

export interface SelfAttestationConfig {
	readonly selfApiKey: string;
	readonly selfEndpoint: string;
	readonly defaultTimeout: number;
	readonly enableMockMode: boolean;
}

/**
 * Self Protocol service for frontend attestation verification
 */
export class SelfAttestationService {
	private readonly config: SelfAttestationConfig;

	constructor(config: SelfAttestationConfig) {
		this.config = config;
	}

	/**
	 * Convert wallet address to DID format
	 * @param address Wallet address
	 * @returns DID string
	 */
	private addressToDid(address: string): string {
		// For demo purposes, we'll use a simple DID format
		// In production, this would be more sophisticated
		return `did:self:${address.toLowerCase()}`;
	}

	/**
	 * Generate a unique nonce for proof requests
	 * @returns Random nonce string
	 */
	private generateNonce(): string {
		return `nonce-${Date.now()}-${Math.random().toString(36).substr(2, 12)}`;
	}

	/**
	 * Make an HTTP request to the Self Protocol API
	 * @param endpoint API endpoint
	 * @param data Request data
	 * @returns Promise with response data
	 */
	private async makeRequest(endpoint: string, data: any): Promise<any> {
		const controller = new AbortController();
		const timeoutId = setTimeout(
			() => controller.abort(),
			this.config.defaultTimeout
		);

		try {
			const response = await fetch(`${this.config.selfEndpoint}${endpoint}`, {
				method: "POST",
				headers: {
					Authorization: `Bearer ${this.config.selfApiKey}`,
					"Content-Type": "application/json",
				},
				body: JSON.stringify(data),
				signal: controller.signal,
			});

			clearTimeout(timeoutId);

			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}

			return await response.json();
		} catch (error) {
			clearTimeout(timeoutId);
			throw error;
		}
	}

	/**
	 * Verify age attestation
	 * @param walletAddress User's wallet address
	 * @param minimumAge Minimum age requirement
	 * @returns Promise with age verification result
	 */
	public async verifyAge(
		walletAddress: string,
		minimumAge: number = 18
	): Promise<AttestationResult> {
		const userDid = this.addressToDid(walletAddress);

		if (this.config.enableMockMode) {
			// Simulate API delay
			await new Promise((resolve) => setTimeout(resolve, 1000));
			return this.createMockResult("age", {
				age: {
					isOver18: true,
					isOver21: minimumAge <= 21,
					ageRange: "25-35",
				},
			});
		}

		try {
			const response = await this.makeRequest("/verify/age", {
				userDid,
				minimumAge,
				nonce: this.generateNonce(),
			});

			return response;
		} catch (error) {
			console.error("Age verification failed:", error);
			return this.createErrorResult("age", "Age verification failed");
		}
	}

	/**
	 * Verify residency attestation
	 * @param walletAddress User's wallet address
	 * @param allowedCountries Array of allowed country codes
	 * @returns Promise with residency verification result
	 */
	public async verifyResidency(
		walletAddress: string,
		allowedCountries: string[] = ["US", "CA", "GB", "AU"]
	): Promise<AttestationResult> {
		const userDid = this.addressToDid(walletAddress);

		if (this.config.enableMockMode) {
			// Simulate API delay
			await new Promise((resolve) => setTimeout(resolve, 1200));
			return this.createMockResult("residency", {
				residency: {
					country: "US",
					region: "California",
					isEuResident: false,
					isUsResident: true,
				},
			});
		}

		try {
			const response = await this.makeRequest("/verify/residency", {
				userDid,
				allowedCountries,
				nonce: this.generateNonce(),
			});

			return response;
		} catch (error) {
			console.error("Residency verification failed:", error);
			return this.createErrorResult(
				"residency",
				"Residency verification failed"
			);
		}
	}

	/**
	 * Verify professional role attestation
	 * @param walletAddress User's wallet address
	 * @param requiredRoles Array of required professional roles
	 * @returns Promise with role verification result
	 */
	public async verifyRole(
		walletAddress: string,
		requiredRoles: string[] = [
			"real_estate_professional",
			"data_analyst",
			"researcher",
		]
	): Promise<AttestationResult> {
		const userDid = this.addressToDid(walletAddress);

		if (this.config.enableMockMode) {
			// Simulate API delay
			await new Promise((resolve) => setTimeout(resolve, 1500));
			return this.createMockResult("role", {
				role: {
					isRealEstateProfessional: true,
					licenseType: "Real Estate Broker",
					verificationLevel: "enhanced",
				},
			});
		}

		try {
			const response = await this.makeRequest("/verify/role", {
				userDid,
				requiredRoles,
				nonce: this.generateNonce(),
			});

			return response;
		} catch (error) {
			console.error("Role verification failed:", error);
			return this.createErrorResult("role", "Role verification failed");
		}
	}

	/**
	 * Verify comprehensive identity attestation
	 * @param walletAddress User's wallet address
	 * @param criteria Verification criteria
	 * @returns Promise with comprehensive verification result
	 */
	public async verifyComprehensive(
		walletAddress: string,
		criteria?: ProofCriteria
	): Promise<AttestationResult> {
		const userDid = this.addressToDid(walletAddress);

		const defaultCriteria: ProofCriteria = {
			requireAge: { minimumAge: 18, ageRangeOnly: true },
			requireResidency: { allowedCountries: ["US", "CA", "GB", "AU"] },
			requireRole: {
				requiredRoles: [
					"real_estate_professional",
					"data_analyst",
					"researcher",
				],
				minimumVerificationLevel: "basic",
			},
			requireIdentity: {
				requireHuman: true,
				requireUnique: true,
				maxRiskScore: 30,
			},
		};

		const fullCriteria = { ...defaultCriteria, ...criteria };

		if (this.config.enableMockMode) {
			// Simulate API delay
			await new Promise((resolve) => setTimeout(resolve, 2000));
			return this.createMockResult("combined", {
				age: {
					isOver18: true,
					isOver21: true,
					ageRange: "25-35",
				},
				residency: {
					country: "US",
					region: "California",
					isEuResident: false,
					isUsResident: true,
				},
				role: {
					isRealEstateProfessional: true,
					licenseType: "Real Estate Broker",
					verificationLevel: "enhanced",
				},
				identity: {
					isHuman: true,
					isUnique: true,
					riskScore: 15,
				},
			});
		}

		try {
			const response = await this.makeRequest("/verify/comprehensive", {
				userDid,
				criteria: fullCriteria,
				nonce: this.generateNonce(),
			});

			return response;
		} catch (error) {
			console.error("Comprehensive verification failed:", error);
			return this.createErrorResult(
				"combined",
				"Comprehensive verification failed"
			);
		}
	}

	/**
	 * Create a mock successful result for development
	 * @param type Attestation type
	 * @param claims Verified claims
	 * @returns Mock attestation result
	 */
	private createMockResult(
		type: AttestationType,
		claims: Partial<VerifiedClaims>
	): AttestationResult {
		return {
			isValid: true,
			attestationType: type,
			verifiedClaims: claims as VerifiedClaims,
			proofHash: `proof-${Date.now()}-${Math.random()
				.toString(36)
				.substr(2, 12)}`,
			timestamp: Date.now(),
		};
	}

	/**
	 * Create an error result
	 * @param type Attestation type
	 * @param message Error message
	 * @returns Error attestation result
	 */
	private createErrorResult(
		type: AttestationType,
		message: string
	): AttestationResult {
		return {
			isValid: false,
			attestationType: type,
			verifiedClaims: {},
			proofHash: `failed-proof-${Date.now()}`,
			timestamp: Date.now(),
			error: message,
			failureDetails: {
				code: "VERIFICATION_FAILED",
				message,
				userMessage: "Verification failed. Please try again.",
				retryable: true,
				category: "verification",
				suggestions: [
					"Check your connection",
					"Try again later",
					"Contact support",
				],
			},
		};
	}
}

/**
 * Create and configure Self Protocol attestation service
 * @param config Service configuration
 * @returns Configured Self Protocol service instance
 */
export function createSelfAttestationService(
	config?: Partial<SelfAttestationConfig>
): SelfAttestationService {
	const defaultConfig: SelfAttestationConfig = {
		selfApiKey: process.env.NEXT_PUBLIC_SELF_API_KEY || "",
		selfEndpoint:
			process.env.NEXT_PUBLIC_SELF_ENDPOINT || "https://api.self.id",
		defaultTimeout: 30000, // 30 seconds
		enableMockMode:
			process.env.NODE_ENV === "development" ||
			!process.env.NEXT_PUBLIC_SELF_API_KEY,
	};

	const fullConfig = { ...defaultConfig, ...config };
	return new SelfAttestationService(fullConfig);
}
