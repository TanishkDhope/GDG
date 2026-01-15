import '@rainbow-me/rainbowkit/styles.css';
import { getDefaultWallets } from '@rainbow-me/rainbowkit';
import { createConfig } from 'wagmi';
import { mainnet, polygon, sepolia } from 'wagmi/chains';
import { defineChain, http } from 'viem';

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

const { connectors } = getDefaultWallets({
  appName: "My NFT Marketplace",
  projectId: "5d9d1b723d3fa7df2ccf93cadd1b5547",
});

export const config = createConfig({
  connectors,
  chains: [mainnet, polygon, sepolia, anvil],

  transports: {
    [mainnet.id]: http(),
    [polygon.id]: http(),
    [sepolia.id]: http(),
    [anvil.id]: http("http://127.0.0.1:8545"),
  },

  // 🔇 SILENCE VIEM / WAGMI NOISE
  logger: {
    warn: () => {},
    error: () => {},
  },
});
