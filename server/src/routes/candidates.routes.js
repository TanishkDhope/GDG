import express from "express";
import {
  createCandidate,
  bulkInsertCandidates,
  getAllCandidates,
  getFilterOptions,
  getCandidateById,
  compareCandidates
} from "../controllers/candidate.controller.js";

const router = express.Router();

router.post("/", createCandidate);
router.post("/bulk", bulkInsertCandidates);
router.get("/", getAllCandidates);
router.get("/filters", getFilterOptions);
router.get("/compare", compareCandidates);
router.get("/:id", getCandidateById);

export default router;
