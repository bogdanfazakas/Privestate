import { ethers } from "ethers";
import Web3Modal from "web3modal";

// Web3Modal provider options
const providerOptions = {
	// WalletConnect is built into Web3Modal by default
	// You can add more wallet options here
};

// Create Web3Modal instance
let web3Modal: Web3Modal | null = null;

if (typeof window !== "undefined") {
	web3Modal = new Web3Modal({
		network: "mainnet", // optional
		cacheProvider: true, // optional
		providerOptions, // required
		theme: {
			background: "rgb(39, 49, 56)",
			main: "rgb(199, 199, 199)",
			secondary: "rgb(136, 136, 136)",
			border: "rgba(195, 195, 195, 0.14)",
			hover: "rgb(16, 26, 32)",
		},
	});
}

export { web3Modal };

// Web3 utility functions
export const connectWallet = async () => {
	if (!web3Modal) {
		throw new Error("Web3Modal not initialized");
	}

	try {
		const provider = await web3Modal.connect();
		const ethersProvider = new ethers.providers.Web3Provider(provider);
		const signer = ethersProvider.getSigner();
		const address = await signer.getAddress();
		const network = await ethersProvider.getNetwork();

		// Listen for account changes
		provider.on("accountsChanged", (accounts: string[]) => {
			if (accounts.length === 0) {
				disconnectWallet();
			} else {
				window.location.reload();
			}
		});

		// Listen for chain changes
		provider.on("chainChanged", () => {
			window.location.reload();
		});

		// Listen for provider connection
		provider.on("connect", (info: { chainId: number }) => {
			console.log("Connected to chain:", info.chainId);
		});

		// Listen for provider disconnection
		provider.on("disconnect", (error: { code: number; message: string }) => {
			console.log("Disconnected:", error);
			disconnectWallet();
		});

		return {
			provider: ethersProvider,
			signer,
			address,
			chainId: network.chainId,
			chainName: network.name,
		};
	} catch (error) {
		console.error("Error connecting wallet:", error);
		throw error;
	}
};

export const disconnectWallet = async () => {
	if (web3Modal) {
		web3Modal.clearCachedProvider();
	}

	// Clear any cached connection
	localStorage.removeItem("walletconnect");
	localStorage.removeItem("WEB3_CONNECT_CACHED_PROVIDER");

	// Reload to reset state
	window.location.reload();
};

export const getBalance = async (
	provider: ethers.providers.Web3Provider,
	address: string
) => {
	try {
		const balance = await provider.getBalance(address);
		return ethers.utils.formatEther(balance);
	} catch (error) {
		console.error("Error getting balance:", error);
		return "0.0";
	}
};

export const formatAddress = (address: string): string => {
	if (!address) return "";
	return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

export const getChainName = (chainId: number): string => {
	const chains: { [key: number]: string } = {
		1: "Ethereum Mainnet",
		3: "Ropsten Testnet",
		4: "Rinkeby Testnet",
		5: "Goerli Testnet",
		42: "Kovan Testnet",
		56: "Binance Smart Chain",
		137: "Polygon",
		250: "Fantom",
		4002: "Fantom Testnet",
		43114: "Avalanche",
		43113: "Avalanche Testnet",
		80001: "Mumbai Testnet",
	};

	return chains[chainId] || `Chain ${chainId}`;
};

export const switchNetwork = async (chainId: number) => {
	if (!window.ethereum) {
		throw new Error("No wallet detected");
	}

	try {
		await window.ethereum.request({
			method: "wallet_switchEthereumChain",
			params: [{ chainId: `0x${chainId.toString(16)}` }],
		});
	} catch (error: any) {
		// This error code indicates that the chain has not been added to MetaMask
		if (error.code === 4902) {
			throw new Error("Please add this network to your wallet first");
		}
		throw error;
	}
};

// Types
export interface WalletConnection {
	provider: ethers.providers.Web3Provider;
	signer: ethers.Signer;
	address: string;
	chainId: number;
	chainName: string;
	balance?: string;
}
