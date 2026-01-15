import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/api-response.js";
import { ApiError } from "../utils/api-error.js";
import { MerkleTree as MerkleTreeModel } from "../models/merkleTree.model.js";
import { buildPoseidon } from "circomlibjs";
import { MerkleTree } from "../../PoseidonMerkleTrees.js";

// Add a new commitment to the tree
const addCommitment = asyncHandler(async (req, res) => {
  const { electionId, commitment } = req.body;
  console.log("Adding commitment:", electionId, commitment);

  if (!electionId || !commitment) {
    throw new ApiError(400, "electionId and commitment required");
  }

  const poseidon = await buildPoseidon();

  // Get or create the merkle tree for this election
  let treeData = await MerkleTreeModel.findOne({ electionId });

  // Rebuild the tree with existing commitments
  const tree = new MerkleTree(20, poseidon);
  
  if (treeData) {
    // Re-insert existing commitments in order
    for (const c of treeData.commitments) {
      tree.insert(BigInt(c.commitment));
    }
console.log("hello")

    // Check if commitment already exists
    const exists = treeData.commitments.find((c) => c.commitment === commitment);
    if (exists) {
      throw new ApiError(400, "Commitment already exists in tree");
    }
  }

  // Insert new commitment
  const commitmentBigInt = BigInt(commitment);
  const leafIndex = tree.insert(commitmentBigInt);

  // Get proof for new commitment
  const proof = tree.getProof(leafIndex);

  // Get new merkle root
  const merkleRoot = tree.root();
  const merkleRootStr = merkleRoot.toString(); // Already BigInt from our MerkleTree class

  // Now rebuild ALL proofs since merkle root changed
  const updatedCommitments = [];

  // Re-insert all commitments and regenerate proofs
  const freshTree = new MerkleTree(20, poseidon);
  const allCommitments = treeData
    ? [...treeData.commitments.map((c) => c.commitment), commitment]
    : [commitment];

  for (let i = 0; i < allCommitments.length; i++) {
    const c = allCommitments[i];
    const cBigInt = BigInt(c);
    const idx = freshTree.insert(cBigInt);
    const p = freshTree.getProof(idx);

    updatedCommitments.push({
      commitment: c,
      leafIndex: idx,
      pathElements: p.pathElements.map((el) => el.toString()), // Already BigInt, just convert to string
      pathIndices: p.pathIndices.map((ind) => ind.toString()), // Already 0/1, just convert to string
      createdAt: treeData?.commitments[i]?.createdAt || new Date(),
    });
  }

  // Update or create the tree data
  if (treeData) {
    treeData.merkleRoot = merkleRootStr;
    treeData.commitments = updatedCommitments;
    treeData.nextLeafIndex = allCommitments.length;
    await treeData.save();
  } else {
    treeData = await MerkleTreeModel.create({
      electionId,
      merkleRoot: merkleRootStr,
      treeDepth: 20,
      nextLeafIndex: 1,
      commitments: updatedCommitments,
    });
  }

  return res.status(201).json(
    new ApiResponse(
      201,
      {
        commitment,
        leafIndex,
        merkleRoot: merkleRootStr,
        pathElements: updatedCommitments[updatedCommitments.length - 1].pathElements,
        pathIndices: updatedCommitments[updatedCommitments.length - 1].pathIndices,
        totalCommitments: updatedCommitments.length,
      },
      "Commitment added to merkle tree"
    )
  );
});

// Get proof for a specific commitment
const getProof = asyncHandler(async (req, res) => {
  const { electionId, commitment } = req.params;

  const treeData = await MerkleTreeModel.findOne({ electionId });
  if (!treeData) {
    throw new ApiError(404, "Merkle tree not found for this election");
  }

  const commitmentData = treeData.commitments.find((c) => c.commitment === commitment);
  if (!commitmentData) {
    throw new ApiError(404, "Commitment not found in tree");
  }

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        commitment: commitmentData.commitment,
        leafIndex: commitmentData.leafIndex,
        merkleRoot: treeData.merkleRoot,
        pathElements: commitmentData.pathElements,
        pathIndices: commitmentData.pathIndices,
        electionId: treeData.electionId,
      },
      "Merkle proof retrieved"
    )
  );
});

// Get current merkle root
const getMerkleRoot = asyncHandler(async (req, res) => {
  const { electionId } = req.params;

  const treeData = await MerkleTreeModel.findOne({ electionId });
  if (!treeData) {
    throw new ApiError(404, "Merkle tree not found for this election");
  }

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        electionId: treeData.electionId,
        merkleRoot: treeData.merkleRoot,
        totalCommitments: treeData.commitments.length,
        nextLeafIndex: treeData.nextLeafIndex,
        updatedAt: treeData.updatedAt,
      },
      "Merkle root retrieved"
    )
  );
});

// Get all commitments (for debugging)
const getAllCommitments = asyncHandler(async (req, res) => {
  const { electionId } = req.params;

  const treeData = await MerkleTreeModel.findOne({ electionId });
  if (!treeData) {
    throw new ApiError(404, "Merkle tree not found for this election");
  }

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        electionId: treeData.electionId,
        merkleRoot: treeData.merkleRoot,
        commitments: treeData.commitments,
        totalCommitments: treeData.commitments.length,
      },
      "All commitments retrieved"
    )
  );
});

export { addCommitment, getProof, getMerkleRoot, getAllCommitments };
