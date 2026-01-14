// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

contract Ballot {
    address public admin;

    mapping(bytes32 => bool) public tokenUsed;
    mapping(uint256 => uint256) public candidateVotes;

    event VoteCast(bytes32 indexed token, uint256 indexed candidateId);

    constructor() {
        admin = msg.sender;
    }

    function vote(bytes32 token, uint256 candidateId) external {
        require(!tokenUsed[token], "Token already used");

        tokenUsed[token] = true;
        candidateVotes[candidateId]++;

        emit VoteCast(token, candidateId);
    }

    function getVotes(uint256 candidateId) external view returns (uint256) {
        return candidateVotes[candidateId];
    }
}
