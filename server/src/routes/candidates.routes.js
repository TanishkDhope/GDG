import express from "express";
import {
  createCandidate,
  bulkInsertCandidates,
  getAllCandidates
} from "../controllers/candidate.controller.js";

const router = express.Router();

router.post("/", createCandidate);
router.post("/bulk", bulkInsertCandidates);
router.get("/", getAllCandidates);

export default router;
