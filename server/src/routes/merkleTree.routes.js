import { Router } from "express";
import {
  addCommitment,
  getProof,
  getMerkleRoot,
  getAllCommitments,
} from "../controllers/merkleTree.controllers.js";

const router = Router();

// Public routes - anyone can add commitment or get proof
router.route("/add").post(addCommitment);
router.route("/:electionId/proof/:commitment").get(getProof);
router.route("/:electionId/root").get(getMerkleRoot);
router.route("/:electionId/commitments").get(getAllCommitments);

export default router;
