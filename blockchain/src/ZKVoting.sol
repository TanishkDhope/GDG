// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./VoterVerifier.sol";

contract ZKVoting {
    VoterVerifier public verifier;

    // nullifier => used or not
    mapping(uint256 => bool) public nullifierUsed;

    // candidate => votes
    mapping(uint256 => uint256) public votes;

    bytes32 public merkleRoot;
    uint256 public electionId;

    event VoteCast(uint256 candidate, uint256 nullifier);

    constructor(address _verifier, bytes32 _root, uint256 _electionId) {
        verifier = VoterVerifier(_verifier);
        merkleRoot = _root;
        electionId = _electionId;
    }

    function vote(
        uint[2] calldata a,
        uint[2][2] calldata b,
        uint[2] calldata c,
        uint[1] calldata input,
        uint256 candidate
    ) external {
        /*
            input[0] = nullifier (only public output)
            Public inputs (merkle_root, election_id) are verified in circuit
        */

        uint256 nullifier = input[0];

        require(!nullifierUsed[nullifier], "Already voted");

        bool valid = verifier.verifyProof(a, b, c, input);
        require(valid, "Invalid ZK proof");

        nullifierUsed[nullifier] = true;
        votes[candidate]++;

        emit VoteCast(candidate, nullifier);
    }
}
