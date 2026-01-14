// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../src/BallotRegistry.sol";

contract BallotRegistryTest is Test {
    BallotRegistry registry;

    function setUp() public {
        registry = new BallotRegistry();
    }

    function testStoreBallot() public {
        uint256 electionId = 1;

        bytes32 hash = keccak256(bytes("ballot-json"));
        string memory ipfs = "QmTestHash";

        registry.storeBallot(electionId, hash, ipfs);

        (bytes32 h, string memory i, ) = registry.ballots(electionId);

        assertEq(h, hash);
        assertEq(i, ipfs);
    }

    function testCannotOverwrite() public {
        uint256 electionId = 2;
        bytes32 hash = keccak256(bytes("ballot"));

        registry.storeBallot(electionId, hash, "ipfs1");

        vm.expectRevert();
        registry.storeBallot(electionId, hash, "ipfs2");
    }
}
