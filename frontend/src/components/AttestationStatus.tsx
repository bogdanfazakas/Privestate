import React, { useState, useEffect } from "react";
import { useWeb3 } from "../contexts/Web3Context";
import {
	createSelfAttestationService,
	AttestationResult,
	AttestationType,
	VerifiedClaims,
} from "../lib/selfProtocol";

interface AttestationStatusProps {
	onStatusChange?: (isValid: boolean) => void;
	autoVerify?: boolean;
}

interface AttestationState {
	age: AttestationResult | null;
	residency: AttestationResult | null;
	role: AttestationResult | null;
	comprehensive: AttestationResult | null;
	isLoading: boolean;
	error: string | null;
}

export default function AttestationStatus({
	onStatusChange,
	autoVerify = false,
}: AttestationStatusProps) {
	const { address, isConnected } = useWeb3();
	const [attestationState, setAttestationState] = useState<AttestationState>({
		age: null,
		residency: null,
		role: null,
		comprehensive: null,
		isLoading: false,
		error: null,
	});

	const selfService = createSelfAttestationService();

	// Auto-verify when wallet is connected
	useEffect(() => {
		if (isConnected && address && autoVerify) {
			handleVerifyAll();
		}
	}, [isConnected, address, autoVerify]);

	// Notify parent component of overall status
	useEffect(() => {
		const { comprehensive } = attestationState;
		if (comprehensive && onStatusChange) {
			onStatusChange(comprehensive.isValid);
		}
	}, [attestationState.comprehensive, onStatusChange]);

	const handleVerifyAge = async () => {
		if (!address) return;

		setAttestationState((prev) => ({ ...prev, isLoading: true, error: null }));

		try {
			const result = await selfService.verifyAge(address);
			setAttestationState((prev) => ({ ...prev, age: result }));
		} catch (error) {
			setAttestationState((prev) => ({
				...prev,
				error:
					error instanceof Error ? error.message : "Age verification failed",
			}));
		} finally {
			setAttestationState((prev) => ({ ...prev, isLoading: false }));
		}
	};

	const handleVerifyResidency = async () => {
		if (!address) return;

		setAttestationState((prev) => ({ ...prev, isLoading: true, error: null }));

		try {
			const result = await selfService.verifyResidency(address);
			setAttestationState((prev) => ({ ...prev, residency: result }));
		} catch (error) {
			setAttestationState((prev) => ({
				...prev,
				error:
					error instanceof Error
						? error.message
						: "Residency verification failed",
			}));
		} finally {
			setAttestationState((prev) => ({ ...prev, isLoading: false }));
		}
	};

	const handleVerifyRole = async () => {
		if (!address) return;

		setAttestationState((prev) => ({ ...prev, isLoading: true, error: null }));

		try {
			const result = await selfService.verifyRole(address);
			setAttestationState((prev) => ({ ...prev, role: result }));
		} catch (error) {
			setAttestationState((prev) => ({
				...prev,
				error:
					error instanceof Error ? error.message : "Role verification failed",
			}));
		} finally {
			setAttestationState((prev) => ({ ...prev, isLoading: false }));
		}
	};

	const handleVerifyAll = async () => {
		if (!address) return;

		setAttestationState((prev) => ({ ...prev, isLoading: true, error: null }));

		try {
			const result = await selfService.verifyComprehensive(address);
			setAttestationState((prev) => ({
				...prev,
				comprehensive: result,
				age: result.verifiedClaims.age
					? { ...result, attestationType: "age" }
					: null,
				residency: result.verifiedClaims.residency
					? { ...result, attestationType: "residency" }
					: null,
				role: result.verifiedClaims.role
					? { ...result, attestationType: "role" }
					: null,
			}));
		} catch (error) {
			setAttestationState((prev) => ({
				...prev,
				error:
					error instanceof Error
						? error.message
						: "Comprehensive verification failed",
			}));
		} finally {
			setAttestationState((prev) => ({ ...prev, isLoading: false }));
		}
	};

	const getStatusIcon = (result: AttestationResult | null) => {
		if (!result) return "⏸️";
		if (result.isValid) return "✅";
		return "❌";
	};

	const getStatusColor = (result: AttestationResult | null) => {
		if (!result) return "text-gray-400";
		if (result.isValid) return "text-green-600";
		return "text-red-600";
	};

	const formatTimestamp = (timestamp: number) => {
		return new Date(timestamp).toLocaleString();
	};

	const renderClaimDetail = (label: string, value: any) => {
		if (value === null || value === undefined) return null;

		if (typeof value === "boolean") {
			return (
				<div className="flex justify-between text-sm">
					<span className="text-gray-600">{label}:</span>
					<span className={value ? "text-green-600" : "text-red-600"}>
						{value ? "Yes" : "No"}
					</span>
				</div>
			);
		}

		if (typeof value === "number") {
			return (
				<div className="flex justify-between text-sm">
					<span className="text-gray-600">{label}:</span>
					<span className="text-gray-900">{value}</span>
				</div>
			);
		}

		return (
			<div className="flex justify-between text-sm">
				<span className="text-gray-600">{label}:</span>
				<span className="text-gray-900">{value}</span>
			</div>
		);
	};

	const renderAttestationCard = (
		title: string,
		type: AttestationType,
		result: AttestationResult | null,
		onVerify: () => void
	) => (
		<div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
			<div className="flex items-center justify-between mb-3">
				<h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
					{getStatusIcon(result)}
					{title}
				</h3>
				<button
					onClick={onVerify}
					disabled={!isConnected || attestationState.isLoading}
					className="px-3 py-1 text-sm bg-self-blue text-white rounded-md hover:bg-self-blue/90 disabled:opacity-50 disabled:cursor-not-allowed"
				>
					{attestationState.isLoading ? "Verifying..." : "Verify"}
				</button>
			</div>

			{result && (
				<div className="space-y-2">
					<div className="flex justify-between text-sm">
						<span className="text-gray-600">Status:</span>
						<span className={getStatusColor(result)}>
							{result.isValid ? "Valid" : "Invalid"}
						</span>
					</div>

					<div className="flex justify-between text-sm">
						<span className="text-gray-600">Verified:</span>
						<span className="text-gray-900">
							{formatTimestamp(result.timestamp)}
						</span>
					</div>

					{result.proofHash && (
						<div className="flex justify-between text-sm">
							<span className="text-gray-600">Proof:</span>
							<span className="text-gray-900 font-mono text-xs">
								{result.proofHash.slice(0, 16)}...
							</span>
						</div>
					)}

					{/* Age-specific details */}
					{type === "age" && result.verifiedClaims.age && (
						<div className="mt-3 p-3 bg-gray-50 rounded-md space-y-1">
							<h4 className="font-medium text-gray-900">Age Verification</h4>
							{renderClaimDetail("Over 18", result.verifiedClaims.age.isOver18)}
							{renderClaimDetail("Over 21", result.verifiedClaims.age.isOver21)}
							{renderClaimDetail(
								"Age Range",
								result.verifiedClaims.age.ageRange
							)}
						</div>
					)}

					{/* Residency-specific details */}
					{type === "residency" && result.verifiedClaims.residency && (
						<div className="mt-3 p-3 bg-gray-50 rounded-md space-y-1">
							<h4 className="font-medium text-gray-900">
								Residency Verification
							</h4>
							{renderClaimDetail(
								"Country",
								result.verifiedClaims.residency.country
							)}
							{renderClaimDetail(
								"Region",
								result.verifiedClaims.residency.region
							)}
							{renderClaimDetail(
								"EU Resident",
								result.verifiedClaims.residency.isEuResident
							)}
							{renderClaimDetail(
								"US Resident",
								result.verifiedClaims.residency.isUsResident
							)}
						</div>
					)}

					{/* Role-specific details */}
					{type === "role" && result.verifiedClaims.role && (
						<div className="mt-3 p-3 bg-gray-50 rounded-md space-y-1">
							<h4 className="font-medium text-gray-900">Professional Role</h4>
							{renderClaimDetail(
								"Real Estate Professional",
								result.verifiedClaims.role.isRealEstateProfessional
							)}
							{renderClaimDetail(
								"License Type",
								result.verifiedClaims.role.licenseType
							)}
							{renderClaimDetail(
								"Verification Level",
								result.verifiedClaims.role.verificationLevel
							)}
						</div>
					)}

					{result.error && (
						<div className="mt-3 p-3 bg-red-50 rounded-md">
							<p className="text-sm text-red-800">{result.error}</p>
							{result.failureDetails && (
								<div className="mt-2 space-y-1">
									<p className="text-xs text-red-600">
										{result.failureDetails.userMessage}
									</p>
									{result.failureDetails.suggestions.length > 0 && (
										<ul className="text-xs text-red-600 list-disc list-inside">
											{result.failureDetails.suggestions.map(
												(suggestion, index) => (
													<li key={index}>{suggestion}</li>
												)
											)}
										</ul>
									)}
								</div>
							)}
						</div>
					)}
				</div>
			)}
		</div>
	);

	if (!isConnected) {
		return (
			<div className="bg-white rounded-lg border border-gray-200 p-6 text-center">
				<div className="text-gray-400 mb-4">
					<svg
						className="w-16 h-16 mx-auto"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={2}
							d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
						/>
					</svg>
				</div>
				<h3 className="text-lg font-semibold text-gray-900 mb-2">
					Connect Wallet for Attestation
				</h3>
				<p className="text-gray-600">
					Connect your wallet to start Self Protocol identity verification.
				</p>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="bg-gradient-to-r from-self-blue to-self-purple rounded-lg p-6 text-white">
				<h2 className="text-2xl font-bold mb-2">
					Self Protocol Identity Verification
				</h2>
				<p className="text-self-blue/80">
					Zero-knowledge proof attestation for age, residency, and professional
					role verification
				</p>
				<div className="mt-4 flex items-center gap-4">
					<div className="text-sm">
						<span className="font-medium">Connected:</span>{" "}
						{address?.slice(0, 6)}...{address?.slice(-4)}
					</div>
					<button
						onClick={handleVerifyAll}
						disabled={!isConnected || attestationState.isLoading}
						className="px-4 py-2 bg-white text-self-blue rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
					>
						{attestationState.isLoading ? "Verifying All..." : "Verify All"}
					</button>
				</div>
			</div>

			{/* Error Display */}
			{attestationState.error && (
				<div className="bg-red-50 border border-red-200 rounded-lg p-4">
					<div className="flex items-center gap-2 text-red-800">
						<svg
							className="w-5 h-5"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
							/>
						</svg>
						<span className="font-medium">Verification Error</span>
					</div>
					<p className="text-red-700 mt-1">{attestationState.error}</p>
				</div>
			)}

			{/* Comprehensive Status */}
			{attestationState.comprehensive && (
				<div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
					<h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
						{getStatusIcon(attestationState.comprehensive)}
						Comprehensive Verification
					</h3>

					<div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
						<div className="space-y-2">
							<div className="flex justify-between text-sm">
								<span className="text-gray-600">Overall Status:</span>
								<span
									className={getStatusColor(attestationState.comprehensive)}
								>
									{attestationState.comprehensive.isValid
										? "All Verified"
										: "Verification Failed"}
								</span>
							</div>

							<div className="flex justify-between text-sm">
								<span className="text-gray-600">Verified:</span>
								<span className="text-gray-900">
									{formatTimestamp(attestationState.comprehensive.timestamp)}
								</span>
							</div>

							<div className="flex justify-between text-sm">
								<span className="text-gray-600">Proof Hash:</span>
								<span className="text-gray-900 font-mono text-xs">
									{attestationState.comprehensive.proofHash.slice(0, 16)}...
								</span>
							</div>
						</div>

						{/* Identity Claims Summary */}
						{attestationState.comprehensive.verifiedClaims.identity && (
							<div className="space-y-2">
								<h4 className="font-medium text-gray-900">Identity Summary</h4>
								{renderClaimDetail(
									"Human Verified",
									attestationState.comprehensive.verifiedClaims.identity.isHuman
								)}
								{renderClaimDetail(
									"Unique Identity",
									attestationState.comprehensive.verifiedClaims.identity
										.isUnique
								)}
								{renderClaimDetail(
									"Risk Score",
									attestationState.comprehensive.verifiedClaims.identity
										.riskScore
								)}
							</div>
						)}
					</div>
				</div>
			)}

			{/* Individual Attestations */}
			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
				{renderAttestationCard(
					"Age Verification",
					"age",
					attestationState.age,
					handleVerifyAge
				)}

				{renderAttestationCard(
					"Residency Verification",
					"residency",
					attestationState.residency,
					handleVerifyResidency
				)}

				{renderAttestationCard(
					"Role Verification",
					"role",
					attestationState.role,
					handleVerifyRole
				)}
			</div>

			{/* Self Protocol Branding */}
			<div className="text-center py-4 text-sm text-gray-500">
				<p>
					Powered by{" "}
					<a
						href="https://self.id"
						target="_blank"
						rel="noopener noreferrer"
						className="text-self-blue hover:text-self-blue/80 font-medium"
					>
						Self Protocol
					</a>{" "}
					Zero-Knowledge Identity Verification
				</p>
			</div>
		</div>
	);
}
