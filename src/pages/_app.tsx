import '@/styles/globals.css'
import { APP_NAME } from '@/lib/consts'
import type { AppProps } from 'next/app'
import { optimismGoerli } from 'viem/chains'
import { WagmiConfig, createConfig } from 'wagmi'
import { ConnectKitProvider, getDefaultConfig } from 'connectkit'

const config = createConfig(
	getDefaultConfig({
		chains: [optimismGoerli],
		appName: APP_NAME,
		alchemyId: process.env.ALCHEMY_ID,
		walletConnectProjectId: process.env.WALLET_CONNECT_PROJECT_ID ?? '',
	})
)
export default function App({ Component, pageProps }: AppProps) {
	return (
		<WagmiConfig config={config}>
			<ConnectKitProvider>
				<Component {...pageProps} />
			</ConnectKitProvider>
		</WagmiConfig>
	)
}
