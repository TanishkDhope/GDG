import { buildPoseidon } from "circomlibjs";
import { PoseidonMerkleTree } from "./PoseidonMerkleTree";

const FIELD_SIZE = BigInt(
  "21888242871839275222246405745257275088548364400416034343698204186575808495617"
);

function randomFieldElement() {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);

  let x = BigInt(
    "0x" +
      Array.from(bytes)
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("")
  );

  while (x >= FIELD_SIZE) {
    crypto.getRandomValues(bytes);
    x = BigInt(
      "0x" +
        Array.from(bytes)
          .map((b) => b.toString(16).padStart(2, "0"))
          .join("")
    );
  }

  return x;
}

export async function generateCircuitInput() {
  const poseidon = await buildPoseidon();
  const tree = new PoseidonMerkleTree(20, poseidon);

  // 🔐 Identity secret (PRIVATE)
  const identity_secret = randomFieldElement();

  console.log("Identity Secret:", identity_secret.toString());

  // Commitment = Poseidon(secret)
  const commitment = poseidon([identity_secret]);
  const commitmentBigInt = poseidon.F.toObject(commitment);

  console.log("Commitment:", commitmentBigInt.toString());

  // Insert into Merkle tree
  const idx = tree.insert(commitment);

  console.log("Leaf index:", idx);

  const merkleRoot = tree.root();
  const merkleRootBigInt = poseidon.F.toObject(merkleRoot);

  console.log("Merkle Root:", merkleRootBigInt.toString());

  // Merkle proof
  const proof = tree.getProof(idx);

  const pathElements = proof.pathElements.map((e: any) =>
    typeof e === "bigint" ? e.toString() : poseidon.F.toObject(e).toString()
  );

  const pathIndices = proof.pathIndices.map((i: any) => (i ? 1 : 0));

  // 🗳️ Election + Candidate
  const election_id = 1n;
  const candidate = 2n; // example: candidate #2

  // 🎯 Final circuit input
  const circuitInput = {
    identity_secret: identity_secret.toString(),
    pathElements: pathElements,
    pathIndices: pathIndices,
    merkle_root: merkleRootBigInt.toString(),
    election_id: election_id.toString(),
    candidate: candidate.toString()
  };

  console.log("\n✅ Circuit input generated\n");
  console.log(JSON.stringify(circuitInput, null, 2));

  return {
    success: true,
    identity_secret: identity_secret.toString(),
    commitment: commitmentBigInt.toString(),
    leafIndex: idx,
    merkle_root: merkleRootBigInt.toString(),
    election_id: election_id.toString(),
    candidate: candidate.toString(),
    circuitInput
  };
}
