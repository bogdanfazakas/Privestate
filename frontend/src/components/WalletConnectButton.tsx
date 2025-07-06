import { useState } from "react";
import { useWeb3 } from "@/contexts/Web3Context";

export function WalletConnectButton() {
	const {
		isConnected,
		isConnecting,
		address,
		balance,
		chainName,
		connect,
		disconnect,
		formatAddress,
	} = useWeb3();

	const [error, setError] = useState<string | null>(null);

	const handleConnect = async () => {
		try {
			setError(null);
			await connect();
		} catch (error: any) {
			console.error("Connection failed:", error);
			setError(error.message || "Failed to connect wallet");
		}
	};

	const handleDisconnect = async () => {
		try {
			setError(null);
			await disconnect();
		} catch (error: any) {
			console.error("Disconnection failed:", error);
			setError(error.message || "Failed to disconnect wallet");
		}
	};

	if (isConnected && address) {
		return (
			<div className="space-y-2">
				<div className="flex items-center space-x-4">
					<div className="flex items-center space-x-2 bg-self-100 text-self-800 px-4 py-2 rounded-lg border border-self-200">
						<div className="w-2 h-2 bg-self-500 rounded-full animate-pulse"></div>
						<div className="text-sm">
							<div className="font-medium">{formatAddress(address)}</div>
							{chainName && (
								<div className="text-xs text-self-600">{chainName}</div>
							)}
						</div>
					</div>
					<div className="text-right">
						{balance && (
							<div className="text-sm text-gray-600">
								{parseFloat(balance).toFixed(4)} ETH
							</div>
						)}
						<button
							onClick={handleDisconnect}
							className="text-xs text-gray-500 hover:text-gray-700 transition-colors"
						>
							Disconnect
						</button>
					</div>
				</div>
				{error && (
					<div className="text-xs text-red-600 bg-red-50 px-2 py-1 rounded">
						{error}
					</div>
				)}
			</div>
		);
	}

	return (
		<div className="space-y-2">
			<button
				onClick={handleConnect}
				disabled={isConnecting}
				className={`btn-primary ${
					isConnecting ? "opacity-50 cursor-not-allowed" : ""
				}`}
			>
				{isConnecting ? (
					<div className="flex items-center space-x-2">
						<div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
						<span>Connecting...</span>
					</div>
				) : (
					"Connect Wallet"
				)}
			</button>
			{error && (
				<div className="text-xs text-red-600 bg-red-50 px-2 py-1 rounded">
					{error}
				</div>
			)}
		</div>
	);
}
