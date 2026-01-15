import { Router } from "express";
import { 
  createVoter,
  getVoterById,
  updateVoter,
  deleteVoter, 
  verifyVoter, 
  sendOtp, 
  verifyOtp,
  markVoterAsVoted,
  getVoterByVoterID 
} from "../controllers/voters.controllers.js";

const router = Router();

console.log("✅ voters.routes.js loaded");

router.route("/").post(createVoter);
router.route("/verify").post(verifyVoter);
router.route("/send-otp").post(sendOtp);
router.route("/verify-otp").post(verifyOtp);
router.route("/mark-voted").post(markVoterAsVoted);
router.route("/by-voter-id/:voterID").get(getVoterByVoterID);
router.route("/:id").get(getVoterById);
router.route("/:id").put(updateVoter);
router.route("/:id").delete(deleteVoter);

export default router;