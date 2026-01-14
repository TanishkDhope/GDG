import { Router } from "express";
import { createVoter,
  getVoterById,
  updateVoter,
  deleteVoter } from "../controllers/voters.controllers.js";

const router = Router();

console.log("✅ voters.routes.js loaded");

router.route("/").post(createVoter);
router.route("/:id").put(updateVoter);
router.route("/:id").delete(deleteVoter);
router.route("/:id").get(getVoterById);

export default router;