import React, {
	createContext,
	useContext,
	useState,
	useEffect,
	ReactNode,
} from "react";
import {
	connectWallet,
	disconnectWallet,
	getBalance,
	formatAddress,
	getChainName,
	web3Modal,
	WalletConnection,
} from "@/lib/web3";

interface Web3ContextType {
	// Connection state
	isConnected: boolean;
	isConnecting: boolean;
	connection: WalletConnection | null;

	// User info
	address: string | null;
	balance: string | null;
	chainId: number | null;
	chainName: string | null;

	// Actions
	connect: () => Promise<void>;
	disconnect: () => Promise<void>;

	// Utils
	formatAddress: (address: string) => string;
}

const Web3Context = createContext<Web3ContextType | undefined>(undefined);

export const useWeb3 = () => {
	const context = useContext(Web3Context);
	if (context === undefined) {
		throw new Error("useWeb3 must be used within a Web3Provider");
	}
	return context;
};

interface Web3ProviderProps {
	children: ReactNode;
}

export const Web3Provider: React.FC<Web3ProviderProps> = ({ children }) => {
	const [isConnected, setIsConnected] = useState(false);
	const [isConnecting, setIsConnecting] = useState(false);
	const [connection, setConnection] = useState<WalletConnection | null>(null);
	const [address, setAddress] = useState<string | null>(null);
	const [balance, setBalance] = useState<string | null>(null);
	const [chainId, setChainId] = useState<number | null>(null);
	const [chainName, setChainName] = useState<string | null>(null);

	// Check for cached provider on mount
	useEffect(() => {
		const checkCachedProvider = async () => {
			if (web3Modal && web3Modal.cachedProvider) {
				await connect();
			}
		};
		checkCachedProvider();
	}, []);

	// Update balance when connection changes
	useEffect(() => {
		const updateBalance = async () => {
			if (connection && address) {
				try {
					const bal = await getBalance(connection.provider, address);
					setBalance(bal);
				} catch (error) {
					console.error("Error updating balance:", error);
				}
			}
		};
		updateBalance();
	}, [connection, address]);

	const connect = async () => {
		setIsConnecting(true);
		try {
			const walletConnection = await connectWallet();

			setConnection(walletConnection);
			setAddress(walletConnection.address);
			setChainId(walletConnection.chainId);
			setChainName(getChainName(walletConnection.chainId));
			setIsConnected(true);

			console.log("Wallet connected:", {
				address: walletConnection.address,
				chainId: walletConnection.chainId,
				chainName: walletConnection.chainName,
			});
		} catch (error) {
			console.error("Failed to connect wallet:", error);
			// Reset state on error
			setConnection(null);
			setAddress(null);
			setBalance(null);
			setChainId(null);
			setChainName(null);
			setIsConnected(false);
			throw error;
		} finally {
			setIsConnecting(false);
		}
	};

	const disconnect = async () => {
		try {
			await disconnectWallet();

			// Reset all state
			setConnection(null);
			setAddress(null);
			setBalance(null);
			setChainId(null);
			setChainName(null);
			setIsConnected(false);

			console.log("Wallet disconnected");
		} catch (error) {
			console.error("Failed to disconnect wallet:", error);
			throw error;
		}
	};

	const contextValue: Web3ContextType = {
		// Connection state
		isConnected,
		isConnecting,
		connection,

		// User info
		address,
		balance,
		chainId,
		chainName,

		// Actions
		connect,
		disconnect,

		// Utils
		formatAddress,
	};

	return (
		<Web3Context.Provider value={contextValue}>{children}</Web3Context.Provider>
	);
};
