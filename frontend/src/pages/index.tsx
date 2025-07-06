import Head from "next/head";
import React, { useState, useCallback } from "react";
import { WalletConnectButton } from "@/components/WalletConnectButton";
import AttestationStatus from "../components/AttestationStatus";
import DatasetViewer from "../components/DatasetViewer";
import ResultDisplay from "../components/ResultDisplay";
import { Hero } from "@/components/Hero";
import { Features } from "@/components/Features";
import { useWeb3 } from "../contexts/Web3Context";

// Types for the complete flow
interface DatasetMetadata {
	id: string;
	name: string;
	description: string;
	size: string;
	records: string;
	lastUpdated: string;
	price: string;
	algorithm: {
		name: string;
		description: string;
		language: string;
		version: string;
	};
}

interface C2DJobResult {
	jobId: string;
	status: "completed" | "processing" | "failed";
	oceanProtocol: {
		datasetDid: string;
		algorithmDid: string;
		computeJobId: string;
	};
	rawOutput: Record<string, any>;
	asi1MiniResult: any;
}

type FlowStep = "wallet" | "attestation" | "dataset" | "analysis" | "results";

export default function Home() {
	const { isConnected } = useWeb3();

	// Flow state management
	const [currentStep, setCurrentStep] = useState<FlowStep>("wallet");
	const [isAttested, setIsAttested] = useState(false);
	const [selectedDataset, setSelectedDataset] =
		useState<DatasetMetadata | null>(null);
	const [isAnalysisRunning, setIsAnalysisRunning] = useState(false);
	const [analysisResults, setAnalysisResults] = useState<C2DJobResult | null>(
		null
	);
	const [analysisError, setAnalysisError] = useState<string | null>(null);

	// Flow progression logic
	const handleAttestationComplete = useCallback((isValid: boolean) => {
		setIsAttested(isValid);
		if (isValid) {
			setCurrentStep("dataset");
		}
	}, []);

	const handleDatasetSelected = useCallback((dataset: DatasetMetadata) => {
		setSelectedDataset(dataset);
	}, []);

	const handleRunAnalysis = useCallback(async (datasetId: string) => {
		setCurrentStep("analysis");
		setIsAnalysisRunning(true);
		setAnalysisError(null);

		try {
			// Simulate C2D job execution with real-looking progression
			await new Promise((resolve) => setTimeout(resolve, 2000)); // Ocean Protocol job setup
			await new Promise((resolve) => setTimeout(resolve, 3000)); // C2D execution
			await new Promise((resolve) => setTimeout(resolve, 2000)); // ASI-1 mini processing

			// Mock successful result - in production this would come from the actual services
			const mockResult: C2DJobResult = {
				jobId: `job_${datasetId}_${Date.now()}`,
				status: "completed",
				oceanProtocol: {
					datasetDid:
						"did:op:7dd2c5ae1e604b1ad90bfa5b8bb4e2d4b4e8a9f3c4b5e6f7a8b9c0d1e2f3a4b5",
					algorithmDid: "did:op:algorithm_average_price_py",
					computeJobId: `compute_job_${Date.now()}`,
				},
				rawOutput: {
					"1": { totalPrice: 6800000, count: 1, averagePrice: 6800000 },
					"3": { totalPrice: 22900000, count: 3, averagePrice: 7633333.33 },
					"4": { totalPrice: 15200000, count: 2, averagePrice: 7600000 },
					"5": { totalPrice: 32750000, count: 2, averagePrice: 16375000 },
				},
				asi1MiniResult: {
					summary:
						"Analysis of Dubai real estate market reveals significant price variations across property types. Villas command premium prices averaging 16.4M AED for 5-bedroom properties, while apartments show more moderate pricing. The data indicates a luxury-focused market with strong demand for larger properties in premium locations like Jumeirah and Dubai Marina.",
					chart: {
						type: "bar",
						title: "Average Property Prices by Room Count",
						xAxisLabel: "Number of Rooms",
						yAxisLabel: "Average Price (AED)",
						data: [
							{ label: "1 Room", value: 6800000, color: "#3498db" },
							{ label: "3 Rooms", value: 7633333, color: "#2ecc71" },
							{ label: "4 Rooms", value: 7600000, color: "#f39c12" },
							{ label: "5 Rooms", value: 16375000, color: "#e74c3c" },
						],
					},
					insights: [
						{
							type: "trend",
							description:
								"Premium properties (5+ rooms) show significantly higher average prices, indicating a luxury market segment with 115% price premium over standard properties.",
							confidence: 92,
							metadata: { category: "luxury_segment", price_premium: 115 },
						},
						{
							type: "pattern",
							description:
								"Similar pricing patterns observed for 3-4 room properties, suggesting market stability in the mid-range segment around 7.6M AED.",
							confidence: 87,
							metadata: {
								category: "mid_range_stability",
								price_range: "7.6M-7.7M",
							},
						},
						{
							type: "recommendation",
							description:
								"Investment opportunities exist in the 3-4 room segment with stable pricing and strong market fundamentals. Consider portfolio diversification across room counts.",
							confidence: 85,
							metadata: {
								category: "investment_strategy",
								target_segment: "3-4_rooms",
							},
						},
					],
					metadata: {
						originalDataSize: 487,
						processingMethod: "asi1mini",
						confidence: 88,
						processingTime: 7000,
						timestamp: Date.now(),
					},
				},
			};

			setAnalysisResults(mockResult);
			setCurrentStep("results");
		} catch (error) {
			setAnalysisError(
				error instanceof Error ? error.message : "Analysis failed"
			);
		} finally {
			setIsAnalysisRunning(false);
		}
	}, []);

	const handleStartOver = useCallback(() => {
		setCurrentStep("attestation");
		setAnalysisResults(null);
		setAnalysisError(null);
	}, []);

	// Auto-progress flow based on connection status
	React.useEffect(() => {
		if (isConnected && currentStep === "wallet") {
			setCurrentStep("attestation");
		} else if (!isConnected && currentStep !== "wallet") {
			setCurrentStep("wallet");
			setIsAttested(false);
			setSelectedDataset(null);
			setAnalysisResults(null);
			setAnalysisError(null);
		}
	}, [isConnected, currentStep]);

	const getStepIcon = (
		step: FlowStep,
		isActive: boolean,
		isCompleted: boolean
	) => {
		if (isCompleted) return "✅";
		if (isActive) return "🔄";

		switch (step) {
			case "wallet":
				return "🔗";
			case "attestation":
				return "🔐";
			case "dataset":
				return "📊";
			case "analysis":
				return "⚡";
			case "results":
				return "📈";
			default:
				return "⏸️";
		}
	};

	const getStepStatus = (step: FlowStep) => {
		switch (step) {
			case "wallet":
				return {
					isActive: currentStep === "wallet",
					isCompleted: isConnected,
					title: "Connect Wallet",
					description: "Connect your Web3 wallet to begin",
				};
			case "attestation":
				return {
					isActive: currentStep === "attestation",
					isCompleted: isAttested,
					title: "Self Protocol Verification",
					description: "Verify your identity with zero-knowledge proofs",
				};
			case "dataset":
				return {
					isActive: currentStep === "dataset",
					isCompleted: selectedDataset !== null,
					title: "Select Dataset",
					description: "Choose Ocean Protocol dataset for analysis",
				};
			case "analysis":
				return {
					isActive: currentStep === "analysis",
					isCompleted: analysisResults !== null,
					title: "Run Analysis",
					description: "Execute C2D job with ASI-1 mini processing",
				};
			case "results":
				return {
					isActive: currentStep === "results",
					isCompleted: analysisResults !== null,
					title: "View Results",
					description: "Review AI-powered insights and charts",
				};
			default:
				return {
					isActive: false,
					isCompleted: false,
					title: "Unknown Step",
					description: "",
				};
		}
	};

	return (
		<>
			<Head>
				<title>AI Platform - Private Real Estate Data Broker</title>
				<meta
					name="description"
					content="Secure, privacy-preserving real estate data analysis platform combining Ocean Protocol, Self Protocol, and ASI-1 mini."
				/>
				<meta name="viewport" content="width=device-width, initial-scale=1" />
				<link rel="icon" href="/favicon.ico" />
			</Head>

			<main className="min-h-screen bg-gray-50">
				{/* Hero Section */}
				<Hero />

				{/* Flow Progress Indicator */}
				<section className="py-8 bg-white border-b border-gray-200">
					<div className="container mx-auto px-4">
						<div className="max-w-6xl mx-auto">
							<h2 className="text-xl font-semibold text-gray-900 mb-6 text-center">
								Complete Analysis Flow
							</h2>
							<div className="flex items-center justify-between">
								{(
									[
										"wallet",
										"attestation",
										"dataset",
										"analysis",
										"results",
									] as FlowStep[]
								).map((step, index) => {
									const status = getStepStatus(step);
									return (
										<React.Fragment key={step}>
											<div className="flex flex-col items-center">
												<div
													className={`w-12 h-12 rounded-full flex items-center justify-center text-xl mb-2 ${
														status.isCompleted
															? "bg-green-100 text-green-600"
															: status.isActive
															? "bg-blue-100 text-blue-600"
															: "bg-gray-100 text-gray-400"
													}`}
												>
													{getStepIcon(
														step,
														status.isActive,
														status.isCompleted
													)}
												</div>
												<div className="text-center max-w-20">
													<div
														className={`text-sm font-medium ${
															status.isCompleted || status.isActive
																? "text-gray-900"
																: "text-gray-400"
														}`}
													>
														{status.title}
													</div>
													<div className="text-xs text-gray-500 mt-1">
														{status.description}
													</div>
												</div>
											</div>
											{index < 4 && (
												<div
													className={`flex-1 h-0.5 mx-4 ${
														getStepStatus(
															(
																[
																	"wallet",
																	"attestation",
																	"dataset",
																	"analysis",
																	"results",
																] as FlowStep[]
															)[index + 1]
														).isActive ||
														getStepStatus(
															(
																[
																	"wallet",
																	"attestation",
																	"dataset",
																	"analysis",
																	"results",
																] as FlowStep[]
															)[index + 1]
														).isCompleted
															? "bg-blue-300"
															: "bg-gray-200"
													}`}
												/>
											)}
										</React.Fragment>
									);
								})}
							</div>
						</div>
					</div>
				</section>

				{/* Main Content Based on Current Step */}
				<section className="py-16">
					<div className="container mx-auto px-4">
						<div className="max-w-6xl mx-auto">
							{/* Step 1: Wallet Connection */}
							{currentStep === "wallet" && (
								<div className="text-center">
									<div className="bg-white rounded-lg border border-gray-200 p-8 max-w-md mx-auto">
										<div className="text-gray-400 mb-6">
											<svg
												className="w-20 h-20 mx-auto"
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
										<h3 className="text-2xl font-bold text-gray-900 mb-4">
											Connect Your Wallet
										</h3>
										<p className="text-gray-600 mb-6">
											Connect your Web3 wallet to start using the AI Platform
											for secure, privacy-preserving real estate data analysis.
										</p>
										<WalletConnectButton />
									</div>
								</div>
							)}

							{/* Step 2: Self Protocol Attestation */}
							{currentStep === "attestation" && (
								<AttestationStatus
									onStatusChange={handleAttestationComplete}
									autoVerify={true}
								/>
							)}

							{/* Step 3: Dataset Selection */}
							{currentStep === "dataset" && (
								<DatasetViewer
									onDatasetSelected={handleDatasetSelected}
									onRunAnalysis={handleRunAnalysis}
									isAttested={isAttested}
								/>
							)}

							{/* Step 4: Analysis Running */}
							{currentStep === "analysis" && (
								<div className="space-y-6">
									<DatasetViewer
										onDatasetSelected={handleDatasetSelected}
										onRunAnalysis={handleRunAnalysis}
										isAttested={isAttested}
									/>
									<div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
										<div className="flex items-center gap-4">
											<div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
											<div className="flex-1">
												<h3 className="text-lg font-semibold text-blue-900 mb-2">
													Analysis in Progress
												</h3>
												<div className="space-y-2">
													<div className="flex justify-between text-sm">
														<span className="text-blue-700">
															Setting up Ocean Protocol C2D job...
														</span>
														<span className="text-blue-600">Step 1/3</span>
													</div>
													<div className="w-full bg-blue-200 rounded-full h-2">
														<div
															className="bg-blue-600 h-2 rounded-full animate-pulse"
															style={{ width: "66%" }}
														/>
													</div>
													<p className="text-sm text-blue-700">
														Your data is being processed securely. The compute
														job never exposes raw data, ensuring complete
														privacy while generating valuable insights.
													</p>
												</div>
											</div>
										</div>
									</div>
								</div>
							)}

							{/* Step 5: Results Display */}
							{currentStep === "results" && (
								<div className="space-y-6">
									<div className="flex justify-between items-center">
										<h2 className="text-2xl font-bold text-gray-900">
											Analysis Complete
										</h2>
										<button
											onClick={handleStartOver}
											className="px-4 py-2 bg-ocean-600 text-white rounded-md hover:bg-ocean-700 transition-colors"
										>
											Run New Analysis
										</button>
									</div>
									<ResultDisplay
										jobResult={analysisResults || undefined}
										isLoading={isAnalysisRunning}
										error={analysisError || undefined}
									/>
								</div>
							)}
						</div>
					</div>
				</section>

				{/* Features Section */}
				<Features />

				{/* Footer */}
				<footer className="bg-gray-900 text-white py-12">
					<div className="container mx-auto px-4">
						<div className="max-w-6xl mx-auto">
							<div className="grid grid-cols-1 md:grid-cols-3 gap-8">
								<div>
									<h3 className="text-lg font-semibold mb-4">AI Platform</h3>
									<p className="text-gray-300">
										Secure, privacy-preserving real estate data analysis
										platform combining Ocean Protocol, Self Protocol, and ASI-1
										mini.
									</p>
								</div>
								<div>
									<h3 className="text-lg font-semibold mb-4">Technologies</h3>
									<ul className="space-y-2 text-gray-300">
										<li>🌊 Ocean Protocol - Secure Data Access</li>
										<li>🔐 Self Protocol - Identity Verification</li>
										<li>🤖 ASI-1 mini - AI Analysis</li>
										<li>⚡ Fluence - Decentralized Compute</li>
									</ul>
								</div>
								<div>
									<h3 className="text-lg font-semibold mb-4">Privacy First</h3>
									<ul className="space-y-2 text-gray-300">
										<li>Zero-knowledge proofs</li>
										<li>Compute-to-data technology</li>
										<li>No raw data exposure</li>
										<li>Decentralized processing</li>
									</ul>
								</div>
							</div>
							<div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
								<p>
									&copy; 2024 AI Platform. Built for privacy-preserving data
									analysis.
								</p>
							</div>
						</div>
					</div>
				</footer>
			</main>
		</>
	);
}
