import { buildPoseidon } from "circomlibjs";
import crypto from "crypto";
import { PoseidonMerkleTree } from "../PoseidonMerkleTrees.js";
import fs from "fs";

const poseidon = await buildPoseidon();
const tree = new PoseidonMerkleTree(20, poseidon);

const FIELD_SIZE =
  BigInt("21888242871839275222246405745257275088548364400416034343698204186575808495617"); // BN254

function randomFieldElement() {
  let x;
  do {
    x = BigInt("0x" + crypto.randomBytes(32).toString("hex"));
  } while (x >= FIELD_SIZE);
  return x;
}

async function run() {
  const poseidon = await buildPoseidon();

  const identity_secret = 123456789n;
  console.log("Identity Secret:", identity_secret.toString());

  const commitment = poseidon([identity_secret]);
  const commitmentBigInt = poseidon.F.toObject(commitment);
  console.log("Commitment:", commitmentBigInt.toString());

  const idx = tree.insert(commitment);

  console.log("Leaf index:", idx);
  const merkleRoot = tree.root();
  const merkleRootBigInt = poseidon.F.toObject(merkleRoot);
  console.log("Root:", merkleRootBigInt.toString());

  const proof = tree.getProof(idx);

  // Convert to string format for JSON - pathElements are already BigInts
  const pathElements = proof.pathElements.map(e => {
    if (typeof e === 'bigint') return e.toString();
    return poseidon.F.toObject(e).toString();
  });
  const pathIndices = proof.pathIndices.map(i => i ? 1 : 0);

  const election_id = 1n;
  console.log("Election Id:", election_id.toString());

  // Create input object for circuit
  const circuitInput = {
    identity_secret: identity_secret.toString(),
    pathElements: pathElements,
    pathIndices: pathIndices,
    merkle_root: merkleRootBigInt.toString(),
    election_id: election_id.toString()
  };

  // Write to file
  const outputPath = "../circuits/VoterCircuit/inputs/input.json";
  fs.writeFileSync(outputPath, JSON.stringify(circuitInput, null, 2));
  console.log("\n✅ Circuit input written to:", outputPath);
  console.log("\nCircuit Input:");
  console.log(JSON.stringify(circuitInput, null, 2));
}

run();
