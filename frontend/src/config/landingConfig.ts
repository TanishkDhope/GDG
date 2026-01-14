
export interface ProblemStatement {
    id: string;
    title: string;
    description: string;
    prize: string;
    tags: string[];
}

export interface LandingConfig {
    eventName: string;
    eventDate: string;
    eventLocation: string;
    heroTitle: string;
    heroSubtitle: string;
    heroCtaText: string;
    problemStatements: ProblemStatement[];
}

export const landingConfig: LandingConfig = {
    eventName: "Web3 Nexus 2026",
    eventDate: "March 15-17, 2026",
    eventLocation: "San Francisco, CA & Online",
    heroTitle: "BUILD THE DECENTRALIZED FUTURE",
    heroSubtitle: "Join the world's most innovative minds for 48 hours of pure creation. Experiment, disrupt, and deploy on the next-generation blockchain infrastructure.",
    heroCtaText: "Enter App",
    problemStatements: [
        {
            id: "defi",
            title: "DeFi 3.0 Revolution",
            description: "Reimagine financial primitives. Build protocols that solve liquidity fragmentation, enhance capital efficiency, or introduce novel yield generation mechanisms.",
            prize: "$15,000",
            tags: ["DeFi", "Smart Contracts", "Yield"]
        },
        {
            id: "nft-utility",
            title: "Dynamic NFT Utility",
            description: "Go beyond static JPEGs. Create dynamic, evolvable NFTs that react to on-chain data, real-world events, or user interactions in real-time.",
            prize: "$10,000",
            tags: ["NFTs", "Metadata", "Gaming"]
        },
        {
            id: "zk-privacy",
            title: "Zero-Knowledge Privacy",
            description: "Leverage ZK-proofs to build privacy-preserving applications for identity, voting, or private transactions without compromising compliance.",
            prize: "$20,000",
            tags: ["ZK-Rollups", "Privacy", "Cryptography"]
        },
        {
            id: "dao-gov",
            title: "DAO Governance Tools",
            description: "Fix broken governance models. Build tools that encourage participation, prevent plutocracy, and streamline proposal execution.",
            prize: "$12,000",
            tags: ["DAO", "Governance", "Voting"]
        }
    ]
};
