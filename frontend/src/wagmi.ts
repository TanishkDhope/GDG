import '@rainbow-me/rainbowkit/styles.css';
import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { mainnet, polygon, sepolia, foundry } from 'wagmi/chains';

export const config = getDefaultConfig({
  appName: 'My NFT Marketplace',
  projectId: '5d9d1b723d3fa7df2ccf93cadd1b5547', // Get from cloud.walletconnect.com
  chains: [foundry, sepolia, mainnet, polygon],
});
