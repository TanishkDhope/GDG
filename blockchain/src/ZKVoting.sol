// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./VoterVerifier.sol";

contract ZKVoting {
    VoterVerifier public verifier;
    address public admin;

    // nullifier => used or not
    mapping(uint256 => bool) public nullifierUsed;

    // candidate => votes
    mapping(uint256 => uint256) public votes;

    bytes32 public merkleRoot;
    uint256 public electionId;

    event VoteCast(uint256 candidate, uint256 nullifier);
    event MerkleRootUpdated(bytes32 newRoot);

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin");
        _;
    }

    constructor(address _verifier, uint256 _electionId) {
        verifier = VoterVerifier(_verifier);
        electionId = _electionId;
        admin = msg.sender;
        // Initial merkle root is empty (all zeros) - update after registering voters
        merkleRoot = bytes32(0);
    }

    function updateMerkleRoot(bytes32 _newRoot) external onlyAdmin {
        merkleRoot = _newRoot;
        emit MerkleRootUpdated(_newRoot);
    }

    function vote(
        uint[2] calldata a,
        uint[2][2] calldata b,
        uint[2] calldata c,
        uint[3] calldata input, // Changed from uint[1] to uint[3]: [merkle_root, election_id, nullifier]
        uint256 candidate
    ) external {
        /*
            input[0] = merkle_root (public input)
            input[1] = election_id (public input)
            input[2] = nullifier (public output)
        */

        uint256 nullifier = input[2];

        // Check nullifier hasn't been used
        require(!nullifierUsed[nullifier], "Already voted");

        // Verify the ZK proof - verifier expects all public signals: [merkle_root, election_id, nullifier]
        bool valid = verifier.verifyProof(a, b, c, input);
        require(valid, "Invalid ZK proof");

        // Mark nullifier as used AFTER proof verification
        nullifierUsed[nullifier] = true;
        votes[candidate]++;

        emit VoteCast(candidate, nullifier);
    }
}
