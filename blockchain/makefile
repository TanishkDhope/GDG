-include .env

 create_Ballot:
	forge create src/Ballot.sol:Ballot --rpc-url $(RPC_URL) --private-key $(LOCAL_PRIVATE_KEY) --broadcast  

 create_Ballot_Registry:
	forge create src/BallotRegistry.sol:BallotRegistry --rpc-url $(RPC_URL) --private-key $(LOCAL_PRIVATE_KEY) --broadcast  

 create_voter_verifier:
	forge create src/VoterVerifier.sol:VoterVerifier --rpc-url ${RPC_URL} --private-key ${LOCAL_PRIVATE_KEY} --broadcast

 create_zkvoting:
	@echo "Usage: make create_zkvoting VERIFIER_ADDRESS=<address> MERKLE_ROOT=<bytes32> ELECTION_ID=<uint256>"
	@echo "Example: make create_zkvoting VERIFIER_ADDRESS=${VOTER_VERIFIER_ADD} MERKLE_ROOT= ELECTION_ID=1"
	forge create src/ZKVoting.sol:ZKVoting --rpc-url ${RPC_URL} --private-key ${LOCAL_PRIVATE_KEY} --broadcast --constructor-args ${VERIFIER_ADDRESS} ${MERKLE_ROOT} ${ELECTION_ID}
 
 create_voting:
	forge create src/ZKVoting.sol:ZKVoting --rpc-url ${RPC_URL} --private-key ${LOCAL_PRIVATE_KEY} --broadcast --constructor-args ${VOTER_VERIFIER_ADD} 1 

 deploy_voting:
	@echo "Deploying VoterVerifier and ZKVoting contracts..."
	@VERIFIER=$$(forge create src/VoterVerifier.sol:VoterVerifier --rpc-url ${RPC_URL} --private-key ${LOCAL_PRIVATE_KEY} --broadcast --json | jq -r '.deployedTo'); \
	echo "VoterVerifier deployed at: $$VERIFIER"; \
	sleep 2; \
	echo "Deploying ZKVoting with verifier: $$VERIFIER and electionId: 1"; \
	forge create src/ZKVoting.sol:ZKVoting --rpc-url ${RPC_URL} --private-key ${LOCAL_PRIVATE_KEY} --broadcast --constructor-args $$VERIFIER 1

 create_voter_registry:
	forge create src/VoterRegistry.sol:VoterRegistry --rpc-url ${RPC_URL} --private-key ${LOCAL_PRIVATE_KEY} --broadcast

 try:
	cast send ${CONTRACT_ADD} "vote(bytes32,uint256)" 0x5b610e8e1835afecdd154863369b91f55612defc17933f83f4425533c435a248 1 --private-key ${LOCAL_PRIVATE_KEY}

 try_registry:
	cast send ${CONTRACT_ADD_REGISTRY} "storeBallot(uint256,bytes32,string calldata)" 1 0x5b610e8e1835afecdd154863369b91f55612defc17933f83f4425533c435a248 0x5b610e8e1835afecdd154863369b91f55612defc17933f83f4425533c435a248  --private-key ${LOCAL_PRIVATE_KEY}
deploy_contracts:
	forge create src/ZKVoting.sol:ZKVoting --rpc-url ${SEPOLIA_RPC_URL} --private-key ${PRIVATE_KEY} --broadcast --constructor-args 0xC8a57319D2653E07504d7737dAFcC0c3bDa3b089 1