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

    uint256 public constant VOTE_FEE = 0.000001 ether;
    address public constant TREASURY = 0x00Bd67C393E1fCb9E8265a7ED1b7F6300b185083;

    function vote(bytes32 token, uint256 candidateId) external payable {
        require(msg.value >= VOTE_FEE, "Insufficient fee");
        require(!tokenUsed[token], "Token already used");

        tokenUsed[token] = true;
        candidateVotes[candidateId]++;

        // Transfer fee to treasury immediately
        payable(TREASURY).transfer(msg.value);

        emit VoteCast(token, candidateId);
    }

    function withdraw() external {
        require(msg.sender == admin, "Only admin");
        payable(admin).transfer(address(this).balance);
    }

    function getVotes(uint256 candidateId) external view returns (uint256) {
        return candidateVotes[candidateId];
    }
}
