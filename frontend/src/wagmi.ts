import '@rainbow-me/rainbowkit/styles.css';
import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { mainnet, polygon, sepolia } from 'wagmi/chains';
import { defineChain } from "viem";



export const anvil = defineChain({
  id: 31337,
  name: "Anvil",
  nativeCurrency: {
    name: "Ether",
    symbol: "ETH",
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ["http://127.0.0.1:8545"],
    },
  },
});

export const config = getDefaultConfig({
  appName: 'My NFT Marketplace',
  projectId: '5d9d1b723d3fa7df2ccf93cadd1b5547', // Get from cloud.walletconnect.com
  chains: [mainnet, polygon, sepolia, anvil],
});