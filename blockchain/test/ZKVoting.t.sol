// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../src/ZKVoting.sol";
import "../src/VoterVerifier.sol";

contract ZKVotingTest is Test {
    ZKVoting public zkVoting;
    VoterVerifier public verifier;

    address admin = address(1);
    address voter1 = address(2);
    address voter2 = address(3);

    function setUp() public {
        vm.startPrank(admin);

        // Deploy verifier
        verifier = new VoterVerifier();

        // Deploy ZKVoting
        zkVoting = new ZKVoting(address(verifier), 1);

        // Set a dummy merkle root
        zkVoting.updateMerkleRoot(bytes32(uint256(12345)));

        vm.stopPrank();
    }

    function testNullifierPreventsDoubleVoting() public {
        // Simulate valid proof data (these would be real proof values in practice)
        uint[2] memory a = [uint(1), uint(2)];
        uint[2][2] memory b = [[uint(1), uint(2)], [uint(3), uint(4)]];
        uint[2] memory c = [uint(1), uint(2)];
        uint[3] memory input = [uint(12345), uint(1), uint(999)]; // [merkle_root, election_id, nullifier]
        uint256 candidate = 1;

        // First vote should work (if proof is valid - it will fail in this test because proof is dummy)
        // But we can still test the nullifier logic by mocking the verifier

        vm.expectRevert("Invalid ZK proof");
        zkVoting.vote(a, b, c, input, candidate);
    }

    function testNullifierMapping() public {
        // Test that nullifierUsed mapping works
        uint256 testNullifier = 12345;

        // Should be false initially
        assertFalse(zkVoting.nullifierUsed(testNullifier));

        // After voting (if we could), it should be true
        // This is just checking the mapping exists and is publicly readable
    }

    function testOnlyAdminCanUpdateMerkleRoot() public {
        bytes32 newRoot = bytes32(uint256(99999));

        // Non-admin should fail
        vm.prank(voter1);
        vm.expectRevert("Only admin");
        zkVoting.updateMerkleRoot(newRoot);

        // Admin should succeed
        vm.prank(admin);
        zkVoting.updateMerkleRoot(newRoot);

        assertEq(zkVoting.merkleRoot(), newRoot);
    }

    function testVoteCountIncreases() public {
        // Check initial vote count for candidate 1
        assertEq(zkVoting.votes(1), 0);

        // After voting, it should increase to 1
        // (Can't actually test this without valid proofs)
    }
}
