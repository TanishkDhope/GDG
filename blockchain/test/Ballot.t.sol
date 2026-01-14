// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "forge-std/Test.sol";
import "../src/Ballot.sol";

contract BallotTest is Test {

    Ballot ballot;

    function setUp() public {
        ballot = new Ballot();
    }

    function testVoteOnce() public {
        bytes32 token = keccak256("token1");

        ballot.vote(token, 1);

        uint256 votes = ballot.getVotes(1);
        assertEq(votes, 1);
    }

    function testRejectDuplicateToken() public {
        bytes32 token = keccak256("token1");

        ballot.vote(token, 1);

        vm.expectRevert("Token already used");
        ballot.vote(token, 2);
    }
}
