export const BALLOT_REGISTRY_ABI =   [
        {
            "type": "constructor",
            "inputs": [],
            "stateMutability": "nonpayable"
        },
        {
            "type": "function",
            "name": "admin",
            "inputs": [],
            "outputs": [
                {
                    "name": "",
                    "type": "address",
                    "internalType": "address"
                }
            ],
            "stateMutability": "view"
        },
        {
            "type": "function",
            "name": "ballots",
            "inputs": [
                {
                    "name": "",
                    "type": "uint256",
                    "internalType": "uint256"
                }
            ],
            "outputs": [
                {
                    "name": "hash",
                    "type": "bytes32",
                    "internalType": "bytes32"
                },
                {
                    "name": "ipfsHash",
                    "type": "string",
                    "internalType": "string"
                },
                {
                    "name": "timestamp",
                    "type": "uint256",
                    "internalType": "uint256"
                }
            ],
            "stateMutability": "view"
        },
        {
            "type": "function",
            "name": "getBallot",
            "inputs": [
                {
                    "name": "electionId",
                    "type": "uint256",
                    "internalType": "uint256"
                }
            ],
            "outputs": [
                {
                    "name": "",
                    "type": "bytes32",
                    "internalType": "bytes32"
                },
                {
                    "name": "",
                    "type": "string",
                    "internalType": "string"
                },
                {
                    "name": "",
                    "type": "uint256",
                    "internalType": "uint256"
                }
            ],
            "stateMutability": "view"
        },
        {
            "type": "function",
            "name": "storeBallot",
            "inputs": [
                {
                    "name": "electionId",
                    "type": "uint256",
                    "internalType": "uint256"
                },
                {
                    "name": "ballotHash",
                    "type": "bytes32",
                    "internalType": "bytes32"
                },
                {
                    "name": "ipfsHash",
                    "type": "string",
                    "internalType": "string"
                }
            ],
            "outputs": [],
            "stateMutability": "nonpayable"
        },
        {
            "type": "event",
            "name": "BallotStored",
            "inputs": [
                {
                    "name": "electionId",
                    "type": "uint256",
                    "indexed": true,
                    "internalType": "uint256"
                },
                {
                    "name": "hash",
                    "type": "bytes32",
                    "indexed": false,
                    "internalType": "bytes32"
                },
                {
                    "name": "ipfsHash",
                    "type": "string",
                    "indexed": false,
                    "internalType": "string"
                }
            ],
            "anonymous": false
        }
    ] as const;
