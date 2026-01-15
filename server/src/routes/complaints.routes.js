import { Router } from "express";
import {
  createComplaint,
  getComplaintsByVoterId,
  getAllComplaints,
  getComplaintById,
  updateComplaintStatus,
  deleteComplaint
} from "../controllers/complaint.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

// Public routes (for users)
router.route("/").post(createComplaint);
router.route("/voter/:voterId").get(getComplaintsByVoterId);

// Protected routes (for admin)
router.route("/").get(verifyJWT, getAllComplaints);
router.route("/:id").get(verifyJWT, getComplaintById);
router.route("/:id").patch(verifyJWT, updateComplaintStatus);
router.route("/:id").delete(verifyJWT, deleteComplaint);

export default router;
