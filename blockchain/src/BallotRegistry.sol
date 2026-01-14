// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract BallotRegistry {

    address public admin;

    struct Ballot {
        bytes32 hash;
        string ipfsHash;
        uint256 timestamp;
    }

    mapping(uint256 => Ballot) public ballots;

    event BallotStored(uint256 indexed electionId, bytes32 hash, string ipfsHash);

    constructor() {
        admin = msg.sender;
    }

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can upload ballot");
        _;
    }

    function storeBallot(
        uint256 electionId,
        bytes32 ballotHash,
        string calldata ipfsHash
    ) external onlyAdmin {

        require(ballots[electionId].hash == bytes32(0), "Ballot already stored");

        ballots[electionId] = Ballot({
            hash: ballotHash,
            ipfsHash: ipfsHash,
            timestamp: block.timestamp
        });

        emit BallotStored(electionId, ballotHash, ipfsHash);
    }

    function getBallot(uint256 electionId)
        external
        view
        returns (bytes32, string memory, uint256)
    {
        Ballot memory b = ballots[electionId];
        return (b.hash, b.ipfsHash, b.timestamp);
    }
}
