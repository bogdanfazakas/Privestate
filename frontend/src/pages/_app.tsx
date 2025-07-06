import type { AppProps } from "next/app";
import Head from "next/head";
import "../styles/globals.css";
import { Web3Provider } from "@/contexts/Web3Context";

export default function App({ Component, pageProps }: AppProps) {
	return (
		<>
			<Head>
				<meta name="viewport" content="width=device-width, initial-scale=1" />
				<link rel="icon" href="/favicon.ico" />
			</Head>
			<Web3Provider>
				<div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
					<Component {...pageProps} />
				</div>
			</Web3Provider>
		</>
	);
}
