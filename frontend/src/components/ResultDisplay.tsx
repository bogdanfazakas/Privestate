import React, { useState, useEffect } from "react";
import {
	Chart as ChartJS,
	CategoryScale,
	LinearScale,
	BarElement,
	LineElement,
	PointElement,
	Title,
	Tooltip,
	Legend,
	ArcElement,
} from "chart.js";
import { Bar, Line, Doughnut } from "react-chartjs-2";

// Register Chart.js components
ChartJS.register(
	CategoryScale,
	LinearScale,
	BarElement,
	LineElement,
	PointElement,
	Title,
	Tooltip,
	Legend,
	ArcElement
);

interface ASI1MiniResult {
	summary: string;
	chart: {
		type: "bar" | "line" | "doughnut";
		title: string;
		xAxisLabel: string;
		yAxisLabel: string;
		data: Array<{
			label: string;
			value: number;
			color: string;
		}>;
	};
	insights: Array<{
		type: "trend" | "anomaly" | "pattern" | "recommendation";
		description: string;
		confidence: number;
		metadata: Record<string, any>;
	}>;
	metadata: {
		originalDataSize: number;
		processingMethod: string;
		confidence: number;
		processingTime: number;
		timestamp: number;
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
	asi1MiniResult: ASI1MiniResult;
}

interface ResultDisplayProps {
	jobResult?: C2DJobResult;
	isLoading?: boolean;
	error?: string;
}

export default function ResultDisplay({
	jobResult,
	isLoading = false,
	error,
}: ResultDisplayProps) {
	const [selectedView, setSelectedView] = useState<
		"summary" | "chart" | "insights" | "raw"
	>("summary");
	const [animationKey, setAnimationKey] = useState(0);

	// Mock data for demonstration
	const mockResult: C2DJobResult = {
		jobId: "job_dubai_real_estate_2024_001",
		status: "completed",
		oceanProtocol: {
			datasetDid:
				"did:op:7dd2c5ae1e604b1ad90bfa5b8bb4e2d4b4e8a9f3c4b5e6f7a8b9c0d1e2f3a4b5",
			algorithmDid: "did:op:algorithm_average_price_py",
			computeJobId: "compute_job_12345",
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
					type: "anomaly",
					description:
						"Single-room properties show elevated pricing at 6.8M AED, potentially indicating prime location premium or luxury studio apartments.",
					confidence: 78,
					metadata: {
						category: "location_premium",
						investigation_needed: true,
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
				processingTime: 3200,
				timestamp: Date.now(),
			},
		},
	};

	const result = jobResult || mockResult;

	useEffect(() => {
		if (result) {
			setAnimationKey((prev) => prev + 1);
		}
	}, [result]);

	const getChartData = () => {
		if (!result?.asi1MiniResult?.chart) return null;

		const chartData = result.asi1MiniResult.chart;
		const labels = chartData.data.map((item) => item.label);
		const values = chartData.data.map((item) => item.value);
		const colors = chartData.data.map((item) => item.color);

		return {
			labels,
			datasets: [
				{
					label: chartData.yAxisLabel,
					data: values,
					backgroundColor: colors,
					borderColor: colors,
					borderWidth: 1,
				},
			],
		};
	};

	const chartOptions = {
		responsive: true,
		maintainAspectRatio: false,
		plugins: {
			legend: {
				position: "top" as const,
			},
			title: {
				display: true,
				text: result?.asi1MiniResult?.chart?.title || "Analysis Results",
			},
			tooltip: {
				callbacks: {
					label: function (context: any) {
						return `${context.dataset.label}: ${new Intl.NumberFormat("en-AE", {
							style: "currency",
							currency: "AED",
							minimumFractionDigits: 0,
						}).format(context.parsed.y)}`;
					},
				},
			},
		},
		scales: {
			y: {
				beginAtZero: true,
				ticks: {
					callback: function (value: any) {
						return new Intl.NumberFormat("en-AE", {
							style: "currency",
							currency: "AED",
							minimumFractionDigits: 0,
							notation: "compact",
						}).format(value);
					},
				},
			},
		},
	};

	const getConfidenceColor = (confidence: number) => {
		if (confidence >= 90) return "text-green-600 bg-green-100";
		if (confidence >= 80) return "text-blue-600 bg-blue-100";
		if (confidence >= 70) return "text-yellow-600 bg-yellow-100";
		return "text-red-600 bg-red-100";
	};

	const getInsightIcon = (type: string) => {
		switch (type) {
			case "trend":
				return "📈";
			case "pattern":
				return "🔍";
			case "anomaly":
				return "⚠️";
			case "recommendation":
				return "💡";
			default:
				return "📊";
		}
	};

	const formatTimestamp = (timestamp: number) => {
		return new Date(timestamp).toLocaleString();
	};

	if (error) {
		return (
			<div className="bg-red-50 border border-red-200 rounded-lg p-6">
				<div className="flex items-center gap-3 mb-2">
					<span className="text-red-500 text-xl">❌</span>
					<h3 className="text-lg font-semibold text-red-900">
						Analysis Failed
					</h3>
				</div>
				<p className="text-red-700">{error}</p>
			</div>
		);
	}

	if (isLoading) {
		return (
			<div className="bg-white rounded-lg border border-gray-200 p-6">
				<div className="flex items-center gap-3 mb-4">
					<div className="w-8 h-8 border-2 border-asi-600 border-t-transparent rounded-full animate-spin"></div>
					<div>
						<h3 className="text-lg font-semibold text-gray-900">
							Processing Analysis
						</h3>
						<p className="text-gray-600 text-sm">
							ASI-1 mini is analyzing your data...
						</p>
					</div>
				</div>
				<div className="space-y-3">
					<div className="h-4 bg-gray-200 rounded animate-pulse"></div>
					<div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
					<div className="h-4 bg-gray-200 rounded animate-pulse w-1/2"></div>
				</div>
			</div>
		);
	}

	if (!result) {
		return (
			<div className="bg-gray-50 rounded-lg border border-gray-200 p-6 text-center">
				<span className="text-gray-400 text-4xl mb-3 block">📊</span>
				<h3 className="text-lg font-semibold text-gray-900 mb-2">
					No Analysis Results
				</h3>
				<p className="text-gray-600">
					Run a compute-to-data analysis to see results here.
				</p>
			</div>
		);
	}

	return (
		<div className="space-y-6" key={animationKey}>
			{/* Header */}
			<div className="bg-gradient-to-r from-asi-600 to-asi-800 rounded-lg p-6 text-white">
				<div className="flex items-center gap-3 mb-2">
					<span className="text-3xl">🤖</span>
					<div>
						<h2 className="text-2xl font-bold">ASI-1 mini Analysis Results</h2>
						<p className="text-asi-100">
							AI-powered insights from your Ocean Protocol data
						</p>
					</div>
				</div>
				<div className="mt-4 flex items-center gap-4 text-sm">
					<div>
						<span className="font-medium">Job ID:</span> {result.jobId}
					</div>
					<div>
						<span className="font-medium">Status:</span>
						<span className="ml-1 px-2 py-1 bg-green-100 text-green-800 rounded text-xs">
							{result.status}
						</span>
					</div>
					<div>
						<span className="font-medium">Processed:</span>{" "}
						{formatTimestamp(result.asi1MiniResult.metadata.timestamp)}
					</div>
				</div>
			</div>

			{/* Navigation Tabs */}
			<div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
				{[
					{ id: "summary", label: "Summary", icon: "📋" },
					{ id: "chart", label: "Chart", icon: "📊" },
					{ id: "insights", label: "Insights", icon: "💡" },
					{ id: "raw", label: "Raw Data", icon: "🔧" },
				].map((tab) => (
					<button
						key={tab.id}
						onClick={() => setSelectedView(tab.id as any)}
						className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-md font-medium transition-colors ${
							selectedView === tab.id
								? "bg-white text-asi-600 shadow-sm"
								: "text-gray-600 hover:text-gray-900"
						}`}
					>
						<span>{tab.icon}</span>
						<span>{tab.label}</span>
					</button>
				))}
			</div>

			{/* Content Views */}
			{selectedView === "summary" && (
				<div className="bg-white rounded-lg border border-gray-200 p-6">
					<h3 className="text-lg font-semibold text-gray-900 mb-4">
						Executive Summary
					</h3>
					<p className="text-gray-700 leading-relaxed text-lg">
						{result.asi1MiniResult.summary}
					</p>
					<div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
						<div className="bg-asi-50 rounded-lg p-4">
							<div className="text-2xl font-bold text-asi-600">
								{result.asi1MiniResult.metadata.originalDataSize}
							</div>
							<div className="text-sm text-gray-600">Properties Analyzed</div>
						</div>
						<div className="bg-ocean-50 rounded-lg p-4">
							<div className="text-2xl font-bold text-ocean-600">
								{result.asi1MiniResult.metadata.confidence}%
							</div>
							<div className="text-sm text-gray-600">Confidence Level</div>
						</div>
						<div className="bg-self-50 rounded-lg p-4">
							<div className="text-2xl font-bold text-self-600">
								{(result.asi1MiniResult.metadata.processingTime / 1000).toFixed(
									1
								)}
								s
							</div>
							<div className="text-sm text-gray-600">Processing Time</div>
						</div>
					</div>
				</div>
			)}

			{selectedView === "chart" && (
				<div className="bg-white rounded-lg border border-gray-200 p-6">
					<h3 className="text-lg font-semibold text-gray-900 mb-4">
						{result.asi1MiniResult.chart.title}
					</h3>
					<div className="h-96">
						{result.asi1MiniResult.chart.type === "bar" && (
							<Bar data={getChartData()!} options={chartOptions} />
						)}
						{result.asi1MiniResult.chart.type === "line" && (
							<Line data={getChartData()!} options={chartOptions} />
						)}
						{result.asi1MiniResult.chart.type === "doughnut" && (
							<Doughnut data={getChartData()!} options={chartOptions} />
						)}
					</div>
				</div>
			)}

			{selectedView === "insights" && (
				<div className="bg-white rounded-lg border border-gray-200 p-6">
					<h3 className="text-lg font-semibold text-gray-900 mb-4">
						AI Insights
					</h3>
					<div className="space-y-4">
						{result.asi1MiniResult.insights.map((insight, index) => (
							<div
								key={index}
								className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow"
							>
								<div className="flex items-start justify-between mb-2">
									<div className="flex items-center gap-2">
										<span className="text-xl">
											{getInsightIcon(insight.type)}
										</span>
										<span className="font-medium text-gray-900 capitalize">
											{insight.type}
										</span>
									</div>
									<span
										className={`text-xs px-2 py-1 rounded-full ${getConfidenceColor(
											insight.confidence
										)}`}
									>
										{insight.confidence}% confidence
									</span>
								</div>
								<p className="text-gray-700 mb-3">{insight.description}</p>
								{insight.metadata &&
									Object.keys(insight.metadata).length > 0 && (
										<div className="bg-gray-50 rounded-md p-3">
											<div className="text-sm font-medium text-gray-900 mb-2">
												Additional Details
											</div>
											<div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
												{Object.entries(insight.metadata).map(
													([key, value]) => (
														<div key={key}>
															<span className="text-gray-600">
																{key.replace(/_/g, " ")}:
															</span>
															<span className="ml-2 text-gray-900">
																{String(value)}
															</span>
														</div>
													)
												)}
											</div>
										</div>
									)}
							</div>
						))}
					</div>
				</div>
			)}

			{selectedView === "raw" && (
				<div className="bg-white rounded-lg border border-gray-200 p-6">
					<h3 className="text-lg font-semibold text-gray-900 mb-4">
						Raw C2D Output
					</h3>
					<div className="bg-gray-900 text-gray-100 rounded-lg p-4 overflow-x-auto">
						<pre className="text-sm">
							{JSON.stringify(result.rawOutput, null, 2)}
						</pre>
					</div>
					<div className="mt-4 text-sm text-gray-600">
						<p>
							<strong>Ocean Protocol Details:</strong>
						</p>
						<div className="mt-2 space-y-1">
							<div>
								Dataset DID:{" "}
								<span className="font-mono text-xs">
									{result.oceanProtocol.datasetDid}
								</span>
							</div>
							<div>
								Algorithm DID:{" "}
								<span className="font-mono text-xs">
									{result.oceanProtocol.algorithmDid}
								</span>
							</div>
							<div>
								Compute Job ID:{" "}
								<span className="font-mono text-xs">
									{result.oceanProtocol.computeJobId}
								</span>
							</div>
						</div>
					</div>
				</div>
			)}

			{/* Footer */}
			<div className="text-center py-4 text-sm text-gray-500">
				<p>
					Analysis powered by{" "}
					<a
						href="https://fetch.ai"
						target="_blank"
						rel="noopener noreferrer"
						className="text-asi-600 hover:text-asi-800 font-medium"
					>
						ASI-1 mini
					</a>{" "}
					from Fetch.ai • Data processed via{" "}
					<a
						href="https://oceanprotocol.com"
						target="_blank"
						rel="noopener noreferrer"
						className="text-ocean-600 hover:text-ocean-800 font-medium"
					>
						Ocean Protocol
					</a>
				</p>
			</div>
		</div>
	);
}
