-include .env

 create_Ballot:
	forge create src/Ballot.sol:Ballot --rpc-url $(RPC_URL) --private-key $(LOCAL_PRIVATE_KEY) --broadcast  

 create_Ballot_Registry:
	forge create src/BallotRegistry.sol:BallotRegistry --rpc-url $(RPC_URL) --private-key $(LOCAL_PRIVATE_KEY) --broadcast  

 try:
	cast send ${CONTRACT_ADD} "vote(bytes32,uint256)" 0x5b610e8e1835afecdd154863369b91f55612defc17933f83f4425533c435a248 1 --private-key ${LOCAL_PRIVATE_KEY}

 try_registry:
	cast send ${CONTRACT_ADD_REGISTRY} "storeBallot(uint256,bytes32,string calldata)" 1 0x5b610e8e1835afecdd154863369b91f55612defc17933f83f4425533c435a248 0x5b610e8e1835afecdd154863369b91f55612defc17933f83f4425533c435a248  --private-key ${LOCAL_PRIVATE_KEY}