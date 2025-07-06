import { useWeb3 } from "@/contexts/Web3Context";

export function WalletInfo() {
	const { isConnected, address, balance, chainId, chainName, formatAddress } =
		useWeb3();

	if (!isConnected) {
		return (
			<div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
				<div className="flex items-center space-x-2">
					<div className="w-3 h-3 bg-gray-400 rounded-full"></div>
					<span className="text-sm text-gray-600">Wallet not connected</span>
				</div>
			</div>
		);
	}

	return (
		<div className="bg-white border border-gray-200 rounded-lg p-4 space-y-3">
			<div className="flex items-center justify-between">
				<h3 className="text-sm font-medium text-gray-900">Wallet Connected</h3>
				<div className="flex items-center space-x-1">
					<div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
					<span className="text-xs text-green-600">Active</span>
				</div>
			</div>

			<div className="space-y-2">
				<div className="flex justify-between items-center">
					<span className="text-xs text-gray-500">Address</span>
					<span className="text-xs font-mono text-gray-900">
						{address && formatAddress(address)}
					</span>
				</div>

				{balance && (
					<div className="flex justify-between items-center">
						<span className="text-xs text-gray-500">Balance</span>
						<span className="text-xs font-medium text-gray-900">
							{parseFloat(balance).toFixed(4)} ETH
						</span>
					</div>
				)}

				{chainName && (
					<div className="flex justify-between items-center">
						<span className="text-xs text-gray-500">Network</span>
						<span className="text-xs text-gray-900">{chainName}</span>
					</div>
				)}

				{chainId && (
					<div className="flex justify-between items-center">
						<span className="text-xs text-gray-500">Chain ID</span>
						<span className="text-xs text-gray-900">{chainId}</span>
					</div>
				)}
			</div>

			<div className="pt-2 border-t border-gray-100">
				<div className="flex items-center space-x-2">
					<svg
						className="w-3 h-3 text-green-500"
						fill="currentColor"
						viewBox="0 0 20 20"
					>
						<path
							fillRule="evenodd"
							d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
							clipRule="evenodd"
						/>
					</svg>
					<span className="text-xs text-gray-600">Ready for transactions</span>
				</div>
			</div>
		</div>
	);
}
