// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/VoterVerifier.sol";
import "../src/ZKVoting.sol";

contract DeployZKVoting is Script {
    function run() external {
        uint256 electionId = 1;

        vm.startBroadcast();

        // Deploy VoterVerifier first
        VoterVerifier verifier = new VoterVerifier();
        console.log("VoterVerifier deployed at:", address(verifier));

        // Deploy ZKVoting (merkle root starts at zero, update later after voter registration)
        ZKVoting zkVoting = new ZKVoting(address(verifier), electionId);
        console.log("ZKVoting deployed at:", address(zkVoting));
        console.log("Admin (can update merkle root):", msg.sender);

        vm.stopBroadcast();
    }
}
