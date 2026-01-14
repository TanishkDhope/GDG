// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "forge-std/Script.sol";
import "../src/Ballot.sol";

contract DeployBallot is Script {
    function run() external {
        vm.startBroadcast();

        Ballot ballot = new Ballot();

        vm.stopBroadcast();
    }
}
