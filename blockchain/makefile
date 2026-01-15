-include .env

 create_Ballot:
	forge create src/Ballot.sol:Ballot --rpc-url $(RPC_URL) --private-key $(LOCAL_PRIVATE_KEY) --broadcast  

 create_Ballot_Registry:
	forge create src/BallotRegistry.sol:BallotRegistry --rpc-url $(RPC_URL) --private-key $(LOCAL_PRIVATE_KEY) --broadcast  

 create_voter_verifier:
	forge create src/VoterVerifier.sol:VoterVerifier --rpc-url ${RPC_URL} --private-key ${LOCAL_PRIVATE_KEY} --broadcast

 create_zkvoting:
	@echo "Usage: make create_zkvoting VERIFIER_ADDRESS=<address> MERKLE_ROOT=<bytes32> ELECTION_ID=<uint256>"
	@echo "Example: make create_zkvoting VERIFIER_ADDRESS=0x... MERKLE_ROOT=0x... ELECTION_ID=1"
	forge create src/ZKVoting.sol:ZKVoting --rpc-url ${RPC_URL} --private-key ${LOCAL_PRIVATE_KEY} --broadcast --constructor-args ${VERIFIER_ADDRESS} ${MERKLE_ROOT} ${ELECTION_ID}

 try:
	cast send ${CONTRACT_ADD} "vote(bytes32,uint256)" 0x5b610e8e1835afecdd154863369b91f55612defc17933f83f4425533c435a248 1 --private-key ${LOCAL_PRIVATE_KEY}

 try_registry:
	cast send ${CONTRACT_ADD_REGISTRY} "storeBallot(uint256,bytes32,string calldata)" 1 0x5b610e8e1835afecdd154863369b91f55612defc17933f83f4425533c435a248 0x5b610e8e1835afecdd154863369b91f55612defc17933f83f4425533c435a248  --private-key ${LOCAL_PRIVATE_KEY}