// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

contract VoterRegistry {
    // Mapping from voterId (string) to commitment (uint256)
    mapping(string => uint256) public voterCommitments;

    // Mapping to track if a voterId has been registered
    mapping(string => bool) public isRegistered;

    // Admin address
    address public admin;

    // Events
    event VoterRegistered(string indexed voterId, uint256 commitment);
    event VoterRemoved(string indexed voterId);

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can call this function");
        _;
    }

    constructor() {
        admin = msg.sender;
    }

    /**
     * @notice Register a voter with their commitment
     * @param voterId The unique voter ID (string)
     * @param commitment The Poseidon hash commitment
     */
    function registerVoter(
        string calldata voterId,
        uint256 commitment
    ) external onlyAdmin {
        require(!isRegistered[voterId], "Voter already registered");
        require(commitment != 0, "Invalid commitment");

        voterCommitments[voterId] = commitment;
        isRegistered[voterId] = true;

        emit VoterRegistered(voterId, commitment);
    }

    /**
     * @notice Register multiple voters in a single transaction
     * @param voterIds Array of voter IDs
     * @param commitments Array of corresponding commitments
     */
    function registerVotersBatch(
        string[] calldata voterIds,
        uint256[] calldata commitments
    ) external onlyAdmin {
        require(
            voterIds.length == commitments.length,
            "Arrays length mismatch"
        );

        for (uint256 i = 0; i < voterIds.length; i++) {
            if (!isRegistered[voterIds[i]] && commitments[i] != 0) {
                voterCommitments[voterIds[i]] = commitments[i];
                isRegistered[voterIds[i]] = true;
                emit VoterRegistered(voterIds[i], commitments[i]);
            }
        }
    }

    /**
     * @notice Check if a voterId is registered
     * @param voterId The voter ID to check
     * @return bool True if voter is registered
     */
    function isVoterRegistered(
        string calldata voterId
    ) external view returns (bool) {
        return isRegistered[voterId];
    }

    /**
     * @notice Get the commitment for a voterId
     * @param voterId The voter ID
     * @return uint256 The commitment (0 if not registered)
     */
    function getCommitment(
        string calldata voterId
    ) external view returns (uint256) {
        return voterCommitments[voterId];
    }

    /**
     * @notice Remove a voter (admin only)
     * @param voterId The voter ID to remove
     */
    function removeVoter(string calldata voterId) external onlyAdmin {
        require(isRegistered[voterId], "Voter not registered");

        delete voterCommitments[voterId];
        isRegistered[voterId] = false;

        emit VoterRemoved(voterId);
    }

    /**
     * @notice Transfer admin rights
     * @param newAdmin The new admin address
     */
    function transferAdmin(address newAdmin) external onlyAdmin {
        require(newAdmin != address(0), "Invalid address");
        admin = newAdmin;
    }
}
