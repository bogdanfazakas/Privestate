import React, { useState, useEffect } from "react";
import { useWeb3 } from "../contexts/Web3Context";

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
	oceanProtocol: {
		did: string;
		chainId: number;
		published: boolean;
		compute: {
			allowRawAlgorithm: boolean;
			allowNetworkAccess: boolean;
			publisherTrustedAlgorithms: string[];
		};
	};
	dataSchema: {
		fields: Array<{
			name: string;
			type: string;
			description: string;
		}>;
	};
	sampleData: any[];
}

interface DatasetViewerProps {
	onDatasetSelected?: (dataset: DatasetMetadata) => void;
	onRunAnalysis?: (datasetId: string) => void;
	isAttested?: boolean;
}

export default function DatasetViewer({
	onDatasetSelected,
	onRunAnalysis,
	isAttested = false,
}: DatasetViewerProps) {
	const { isConnected } = useWeb3();
	const [datasets, setDatasets] = useState<DatasetMetadata[]>([]);
	const [selectedDataset, setSelectedDataset] =
		useState<DatasetMetadata | null>(null);
	const [isLoading, setIsLoading] = useState(false);
	const [expandedDataset, setExpandedDataset] = useState<string | null>(null);
	const [isLoadingData, setIsLoadingData] = useState(false);

	useEffect(() => {
		// Load dataset metadata
		const loadDatasets = async () => {
			setIsLoadingData(true);
			try {
				// Simulate loading real dataset metadata
				const mockDatasets: DatasetMetadata[] = [
					{
						id: "dubai-real-estate-2024",
						name: "Dubai Real Estate Market Dataset 2024",
						description:
							"Comprehensive real estate data for Dubai covering villas, apartments, and commercial properties. Includes pricing, location, property features, and market trends from major Dubai developments.",
						size: "24.3 MB",
						records: "487",
						lastUpdated: "2024-01-15T10:30:00Z",
						price: "0.1 OCEAN",
						algorithm: {
							name: "average-price.py",
							description:
								"Calculates average property prices by room count and property type",
							language: "Python 3.9",
							version: "1.0.0",
						},
						oceanProtocol: {
							did: "did:op:7dd2c5ae1e604b1ad90bfa5b8bb4e2d4b4e8a9f3c4b5e6f7a8b9c0d1e2f3a4b5",
							chainId: 1,
							published: true,
							compute: {
								allowRawAlgorithm: false,
								allowNetworkAccess: false,
								publisherTrustedAlgorithms: ["average-price.py"],
							},
						},
						dataSchema: {
							fields: [
								{
									name: "id",
									type: "integer",
									description: "Unique property identifier",
								},
								{
									name: "price",
									type: "number",
									description: "Property price in AED",
								},
								{
									name: "type",
									type: "string",
									description: "Property type (Villa, Apartment, etc.)",
								},
								{
									name: "zone",
									type: "string",
									description: "Location zone in Dubai",
								},
								{
									name: "roomsNo",
									type: "integer",
									description: "Number of rooms",
								},
								{
									name: "bathroomsNo",
									type: "integer",
									description: "Number of bathrooms",
								},
								{
									name: "surface",
									type: "number",
									description: "Property surface area in sqft",
								},
								{
									name: "ccy",
									type: "string",
									description: "Currency code (AED)",
								},
								{
									name: "createdOn",
									type: "string",
									description: "Listing creation date",
								},
							],
						},
						sampleData: [
							{
								id: 1,
								price: 6800000,
								type: "Villa",
								zone: "Whispering Pines, Jumeirah Golf Estates",
								roomsNo: 4,
								bathroomsNo: 5,
								surface: 4573,
								ccy: "AED",
							},
							{
								id: 2,
								price: 4600000,
								type: "Apartment",
								zone: "The Jewel Tower B, Dubai Marina",
								roomsNo: 3,
								bathroomsNo: 5,
								surface: 4306,
								ccy: "AED",
							},
							{
								id: 3,
								price: 2850000,
								type: "Apartment",
								zone: "23 Marina, Dubai Marina",
								roomsNo: 3,
								bathroomsNo: 5,
								surface: 2146,
								ccy: "AED",
							},
						],
					},
				];

				setDatasets(mockDatasets);
				if (mockDatasets.length > 0) {
					setSelectedDataset(mockDatasets[0]);
					onDatasetSelected?.(mockDatasets[0]);
				}
			} catch (error) {
				console.error("Error loading datasets:", error);
			} finally {
				setIsLoadingData(false);
			}
		};

		loadDatasets();
	}, [onDatasetSelected]);

	const handleRunAnalysis = async (datasetId: string) => {
		if (!isConnected) {
			alert("Please connect your wallet first");
			return;
		}

		if (!isAttested) {
			alert("Please complete Self Protocol attestation first");
			return;
		}

		setIsLoading(true);
		try {
			// Simulate C2D job execution
			await new Promise((resolve) => setTimeout(resolve, 2000));
			onRunAnalysis?.(datasetId);
		} catch (error) {
			console.error("Error running analysis:", error);
		} finally {
			setIsLoading(false);
		}
	};

	const handleDatasetSelect = (dataset: DatasetMetadata) => {
		setSelectedDataset(dataset);
		onDatasetSelected?.(dataset);
	};

	const toggleExpanded = (datasetId: string) => {
		setExpandedDataset(expandedDataset === datasetId ? null : datasetId);
	};

	const formatCurrency = (amount: number) => {
		return new Intl.NumberFormat("en-AE", {
			style: "currency",
			currency: "AED",
			minimumFractionDigits: 0,
		}).format(amount);
	};

	const getPropertyTypeColor = (type: string) => {
		switch (type?.toLowerCase()) {
			case "villa":
				return "bg-ocean-100 text-ocean-800";
			case "apartment":
				return "bg-asi-100 text-asi-800";
			case "townhouse":
				return "bg-self-100 text-self-800";
			default:
				return "bg-gray-100 text-gray-800";
		}
	};

	if (isLoadingData) {
		return (
			<div className="flex items-center justify-center py-12">
				<div className="text-center">
					<div className="w-8 h-8 border-2 border-ocean-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
					<p className="text-gray-600">Loading Ocean Protocol datasets...</p>
				</div>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="bg-gradient-to-r from-ocean-600 to-ocean-800 rounded-lg p-6 text-white">
				<h2 className="text-2xl font-bold mb-2">Ocean Protocol Datasets</h2>
				<p className="text-ocean-100">
					Secure compute-to-data on privacy-preserving real estate datasets
				</p>
			</div>

			{/* Dataset Grid */}
			<div className="grid grid-cols-1 gap-6">
				{datasets.map((dataset) => (
					<div
						key={dataset.id}
						className={`border rounded-lg p-6 transition-all duration-200 ${
							selectedDataset?.id === dataset.id
								? "border-ocean-400 bg-ocean-50 shadow-lg"
								: "border-gray-200 bg-white hover:border-ocean-200 hover:shadow-md"
						}`}
					>
						{/* Dataset Header */}
						<div className="flex justify-between items-start mb-4">
							<div className="flex-1">
								<div className="flex items-center gap-3 mb-2">
									<h3 className="text-lg font-semibold text-gray-900">
										{dataset.name}
									</h3>
									{dataset.oceanProtocol.published && (
										<span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
											Published
										</span>
									)}
								</div>
								<p className="text-gray-600 mb-3">{dataset.description}</p>

								{/* Dataset Stats */}
								<div className="flex items-center gap-6 text-sm text-gray-500">
									<div className="flex items-center gap-1">
										<span>📊</span>
										<span>{dataset.records} records</span>
									</div>
									<div className="flex items-center gap-1">
										<span>��</span>
										<span>{dataset.size}</span>
									</div>
									<div className="flex items-center gap-1">
										<span>🔄</span>
										<span>
											Updated{" "}
											{new Date(dataset.lastUpdated).toLocaleDateString()}
										</span>
									</div>
								</div>
							</div>

							<div className="text-right ml-4">
								<div className="text-sm text-gray-500 mb-1">Access Price</div>
								<div className="text-lg font-semibold text-ocean-600">
									{dataset.price}
								</div>
							</div>
						</div>

						{/* Ocean Protocol Details */}
						<div className="bg-gray-50 rounded-lg p-4 mb-4">
							<div className="flex items-center justify-between mb-2">
								<h4 className="font-medium text-gray-900">
									Ocean Protocol Details
								</h4>
								<button
									onClick={() => toggleExpanded(dataset.id)}
									className="text-ocean-600 hover:text-ocean-800 text-sm"
								>
									{expandedDataset === dataset.id
										? "Hide Details"
										: "Show Details"}
								</button>
							</div>

							<div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
								<div>
									<span className="text-gray-600">DID:</span>
									<span className="ml-2 font-mono text-xs text-gray-900">
										{dataset.oceanProtocol.did.slice(0, 20)}...
									</span>
								</div>
								<div>
									<span className="text-gray-600">Chain ID:</span>
									<span className="ml-2 font-medium text-gray-900">
										{dataset.oceanProtocol.chainId}
									</span>
								</div>
							</div>

							{expandedDataset === dataset.id && (
								<div className="mt-4 space-y-4">
									{/* Compute Settings */}
									<div>
										<h5 className="font-medium text-gray-900 mb-2">
											Compute Settings
										</h5>
										<div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
											<div className="flex items-center gap-2">
												<span
													className={`w-2 h-2 rounded-full ${
														dataset.oceanProtocol.compute.allowRawAlgorithm
															? "bg-green-500"
															: "bg-red-500"
													}`}
												></span>
												<span>
													Raw Algorithm:{" "}
													{dataset.oceanProtocol.compute.allowRawAlgorithm
														? "Allowed"
														: "Restricted"}
												</span>
											</div>
											<div className="flex items-center gap-2">
												<span
													className={`w-2 h-2 rounded-full ${
														dataset.oceanProtocol.compute.allowNetworkAccess
															? "bg-green-500"
															: "bg-red-500"
													}`}
												></span>
												<span>
													Network Access:{" "}
													{dataset.oceanProtocol.compute.allowNetworkAccess
														? "Allowed"
														: "Restricted"}
												</span>
											</div>
										</div>
									</div>

									{/* Data Schema */}
									<div>
										<h5 className="font-medium text-gray-900 mb-2">
											Data Schema
										</h5>
										<div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
											{dataset.dataSchema.fields
												.slice(0, 6)
												.map((field, index) => (
													<div key={index} className="flex items-center gap-2">
														<span className="text-gray-600">{field.name}:</span>
														<span className="font-mono text-xs bg-gray-200 px-1 rounded">
															{field.type}
														</span>
													</div>
												))}
										</div>
									</div>

									{/* Sample Data */}
									<div>
										<h5 className="font-medium text-gray-900 mb-2">
											Sample Data
										</h5>
										<div className="overflow-x-auto">
											<table className="min-w-full text-sm">
												<thead className="bg-gray-100">
													<tr>
														<th className="px-2 py-1 text-left">Type</th>
														<th className="px-2 py-1 text-left">Zone</th>
														<th className="px-2 py-1 text-left">Rooms</th>
														<th className="px-2 py-1 text-left">Price</th>
													</tr>
												</thead>
												<tbody>
													{dataset.sampleData.map((item, index) => (
														<tr key={index} className="border-t">
															<td className="px-2 py-1">
																<span
																	className={`px-2 py-1 rounded-full text-xs ${getPropertyTypeColor(
																		item.type
																	)}`}
																>
																	{item.type}
																</span>
															</td>
															<td className="px-2 py-1 text-gray-600">
																{item.zone.slice(0, 30)}...
															</td>
															<td className="px-2 py-1 text-gray-900">
																{item.roomsNo}
															</td>
															<td className="px-2 py-1 font-medium text-gray-900">
																{formatCurrency(item.price)}
															</td>
														</tr>
													))}
												</tbody>
											</table>
										</div>
									</div>
								</div>
							)}
						</div>

						{/* Algorithm Details */}
						<div className="bg-gray-50 rounded-lg p-4 mb-4">
							<h4 className="font-medium text-gray-900 mb-2">Algorithm</h4>
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
								<div>
									<span className="text-gray-600">Name:</span>
									<span className="ml-2 font-mono bg-gray-200 px-2 py-1 rounded text-xs">
										{dataset.algorithm.name}
									</span>
								</div>
								<div>
									<span className="text-gray-600">Language:</span>
									<span className="ml-2 font-medium text-gray-900">
										{dataset.algorithm.language}
									</span>
								</div>
							</div>
							<div className="mt-2">
								<span className="text-gray-600">Description:</span>
								<span className="ml-2 text-gray-900">
									{dataset.algorithm.description}
								</span>
							</div>
						</div>

						{/* Action Buttons */}
						<div className="flex gap-3">
							<button
								onClick={() => handleDatasetSelect(dataset)}
								className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
									selectedDataset?.id === dataset.id
										? "bg-ocean-600 text-white"
										: "bg-ocean-100 text-ocean-800 hover:bg-ocean-200"
								}`}
							>
								{selectedDataset?.id === dataset.id
									? "Selected"
									: "Select Dataset"}
							</button>

							<button
								onClick={() => handleRunAnalysis(dataset.id)}
								disabled={isLoading || !isConnected || !isAttested}
								className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
									isLoading || !isConnected || !isAttested
										? "bg-gray-300 text-gray-500 cursor-not-allowed"
										: "bg-asi-600 text-white hover:bg-asi-700"
								}`}
							>
								{isLoading ? (
									<div className="flex items-center justify-center gap-2">
										<div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
										<span>Running C2D...</span>
									</div>
								) : (
									"Run Analysis"
								)}
							</button>
						</div>

						{/* Status Messages */}
						{!isConnected && (
							<div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
								<p className="text-sm text-yellow-800">
									Connect your wallet to run compute-to-data analysis
								</p>
							</div>
						)}

						{isConnected && !isAttested && (
							<div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-md">
								<p className="text-sm text-blue-800">
									Complete Self Protocol attestation to access dataset
								</p>
							</div>
						)}
					</div>
				))}
			</div>

			{/* C2D Processing Status */}
			{isLoading && (
				<div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
					<div className="flex items-center gap-3">
						<div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
						<div>
							<div className="font-medium text-blue-900">
								Processing on Ocean Protocol
							</div>
							<div className="text-sm text-blue-700">
								Your compute-to-data job is running securely. Data never leaves
								the secure environment.
							</div>
						</div>
					</div>
				</div>
			)}

			{/* Ocean Protocol Branding */}
			<div className="text-center py-4 text-sm text-gray-500">
				<p>
					Powered by{" "}
					<a
						href="https://oceanprotocol.com"
						target="_blank"
						rel="noopener noreferrer"
						className="text-ocean-600 hover:text-ocean-800 font-medium"
					>
						Ocean Protocol
					</a>{" "}
					Secure Compute-to-Data
				</p>
			</div>
		</div>
	);
}
