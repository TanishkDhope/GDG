export const ZK_VOTING_ABI =  [
        {
            "type": "constructor",
            "inputs": [
                {
                    "name": "_verifier",
                    "type": "address",
                    "internalType": "address"
                },
                {
                    "name": "_root",
                    "type": "bytes32",
                    "internalType": "bytes32"
                },
                {
                    "name": "_electionId",
                    "type": "uint256",
                    "internalType": "uint256"
                }
            ],
            "stateMutability": "nonpayable"
        },
        {
            "type": "function",
            "name": "electionId",
            "inputs": [],
            "outputs": [
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
            "name": "merkleRoot",
            "inputs": [],
            "outputs": [
                {
                    "name": "",
                    "type": "bytes32",
                    "internalType": "bytes32"
                }
            ],
            "stateMutability": "view"
        },
        {
            "type": "function",
            "name": "nullifierUsed",
            "inputs": [
                {
                    "name": "",
                    "type": "uint256",
                    "internalType": "uint256"
                }
            ],
            "outputs": [
                {
                    "name": "",
                    "type": "bool",
                    "internalType": "bool"
                }
            ],
            "stateMutability": "view"
        },
        {
            "type": "function",
            "name": "verifier",
            "inputs": [],
            "outputs": [
                {
                    "name": "",
                    "type": "address",
                    "internalType": "contract VoterVerifier"
                }
            ],
            "stateMutability": "view"
        },
        {
            "type": "function",
            "name": "vote",
            "inputs": [
                {
                    "name": "a",
                    "type": "uint256[2]",
                    "internalType": "uint256[2]"
                },
                {
                    "name": "b",
                    "type": "uint256[2][2]",
                    "internalType": "uint256[2][2]"
                },
                {
                    "name": "c",
                    "type": "uint256[2]",
                    "internalType": "uint256[2]"
                },
                {
                    "name": "input",
                    "type": "uint256[1]",
                    "internalType": "uint256[1]"
                },
                {
                    "name": "candidate",
                    "type": "uint256",
                    "internalType": "uint256"
                }
            ],
            "outputs": [],
            "stateMutability": "nonpayable"
        },
        {
            "type": "function",
            "name": "votes",
            "inputs": [
                {
                    "name": "",
                    "type": "uint256",
                    "internalType": "uint256"
                }
            ],
            "outputs": [
                {
                    "name": "",
                    "type": "uint256",
                    "internalType": "uint256"
                }
            ],
            "stateMutability": "view"
        },
        {
            "type": "event",
            "name": "VoteCast",
            "inputs": [
                {
                    "name": "candidate",
                    "type": "uint256",
                    "indexed": false,
                    "internalType": "uint256"
                },
                {
                    "name": "nullifier",
                    "type": "uint256",
                    "indexed": false,
                    "internalType": "uint256"
                }
            ],
            "anonymous": false
        }
    ] as const;