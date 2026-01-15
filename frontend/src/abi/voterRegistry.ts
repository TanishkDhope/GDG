export const VOTER_REGISTRY_ABI = [
    {
        inputs: [],
        stateMutability: "nonpayable",
        type: "constructor",
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "string",
                name: "voterId",
                type: "string",
            },
            {
                indexed: false,
                internalType: "uint256",
                name: "commitment",
                type: "uint256",
            },
        ],
        name: "VoterRegistered",
        type: "event",
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "string",
                name: "voterId",
                type: "string",
            },
        ],
        name: "VoterRemoved",
        type: "event",
    },
    {
        inputs: [],
        name: "admin",
        outputs: [
            {
                internalType: "address",
                name: "",
                type: "address",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "string",
                name: "voterId",
                type: "string",
            },
        ],
        name: "getCommitment",
        outputs: [
            {
                internalType: "uint256",
                name: "",
                type: "uint256",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "string",
                name: "",
                type: "string",
            },
        ],
        name: "isRegistered",
        outputs: [
            {
                internalType: "bool",
                name: "",
                type: "bool",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "string",
                name: "voterId",
                type: "string",
            },
        ],
        name: "isVoterRegistered",
        outputs: [
            {
                internalType: "bool",
                name: "",
                type: "bool",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "string",
                name: "voterId",
                type: "string",
            },
            {
                internalType: "uint256",
                name: "commitment",
                type: "uint256",
            },
        ],
        name: "registerVoter",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "string[]",
                name: "voterIds",
                type: "string[]",
            },
            {
                internalType: "uint256[]",
                name: "commitments",
                type: "uint256[]",
            },
        ],
        name: "registerVotersBatch",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "string",
                name: "voterId",
                type: "string",
            },
        ],
        name: "removeVoter",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "address",
                name: "newAdmin",
                type: "address",
            },
        ],
        name: "transferAdmin",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "string",
                name: "",
                type: "string",
            },
        ],
        name: "voterCommitments",
        outputs: [
            {
                internalType: "uint256",
                name: "",
                type: "uint256",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
] as const;
