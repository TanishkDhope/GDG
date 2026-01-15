// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import {Script, console} from "forge-std/Script.sol";
import {VoterRegistry} from "../src/VoterRegistry.sol";

contract DeployVoterRegistry is Script {
    function run() external returns (VoterRegistry) {
        uint256 deployerPrivateKey = vm.envUint("LOCAL_PRIVATE_KEY");

        vm.startBroadcast(deployerPrivateKey);

        VoterRegistry voterRegistry = new VoterRegistry();

        console.log("VoterRegistry deployed at:", address(voterRegistry));
        console.log("Admin:", voterRegistry.admin());

        vm.stopBroadcast();

        return voterRegistry;
    }
}
