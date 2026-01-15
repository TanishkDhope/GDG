import mongoose from "mongoose";

const merkleTreeSchema = new mongoose.Schema(
  {
    electionId: {
      type: Number,
      required: true,
      unique: true,
    },
    merkleRoot: {
      type: String,
      required: true,
    },
    treeDepth: {
      type: Number,
      default: 20,
    },
    nextLeafIndex: {
      type: Number,
      default: 0,
    },
    // Store all commitments with their proofs
    commitments: [
      {
        commitment: {
          type: String,
          required: true,
          unique: true,
        },
        leafIndex: {
          type: Number,
          required: true,
        },
        pathElements: {
          type: [String],
          required: true,
        },
        pathIndices: {
          type: [String],
          required: true,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Index for fast commitment lookup
merkleTreeSchema.index({ "commitments.commitment": 1 });

export const MerkleTree = mongoose.model("MerkleTree", merkleTreeSchema);
