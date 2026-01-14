
export interface Feature {
    id: string;
    title: string;
    description: string;
    image?: string; // Optional image URL
    highlight: string;
}

export interface ProductConfig {
    productName: string;
    tagline: string;
    description: string;
    heroCtaText: string;
    features: Feature[];
    techStack: string[];
    socials: {
        github: string;
        twitter: string;
        demo: string;
    };
}

export const productConfig: ProductConfig = {
    productName: "TRACE",
    tagline: "The Future of Digital Provenance",
    description: "Experience the next evolution of NFT marketplaces. Trace combines AI-driven artistry with cryptographic security to create a seamless ecosystem for creators and collectors.",
    heroCtaText: "Launch Application",
    features: [
        {
            id: "ai-studio",
            title: "AI Creativity Studio",
            description: "Unleash your imagination. textual prompts into stunning, high-fidelity digital art assets ready for minting in seconds.",
            highlight: "Generative Art",
        },
        {
            id: "secure-vault",
            title: "Encrypted Vault",
            description: "Your assets, fully secured. Our non-custodial vault technology ensures your digital collectibles remain truly yours, verified on-chain.",
            highlight: "Self-Sovereign",
        },
        {
            id: "instant-mint",
            title: "Gas-Optimized Minting",
            description: "Forget high fees. Our optimized smart contracts verify and mint your transactions with minimal gas costs and maximum speed.",
            highlight: "Layer 2 Ready",
        },
        {
            id: "analytics",
            title: "Market Insights",
            description: "Make informed decisions. Real-time data analytics and trend tracking give you the edge in the fast-paced NFT market.",
            highlight: "Real-time Data",
        }
    ],
    techStack: ["React", "Vite", "Solidity", "IPFS", "Wagmi", "TailwindCSS", "GSAP"],
    socials: {
        github: "https://github.com/your-repo",
        twitter: "https://twitter.com/your-handle",
        demo: "https://trace.demo"
    }
};
