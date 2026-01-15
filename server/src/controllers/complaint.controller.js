import { Complaint } from "../models/complaint.model.js";
import { ApiResponse } from "../utils/api-response.js";
import { ApiError } from "../utils/api-error.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// Create a new complaint (Public - for users)
const createComplaint = asyncHandler(async (req, res, next) => {
  const { voterId, category, description } = req.body;

  if (!voterId || !description) {
    return next(new ApiError(400, "Voter ID and description are required"));
  }

  const complaint = await Complaint.create({
    voterId: voterId.toUpperCase(),
    category: category || "technical",
    description
  });

  res.status(201).json(new ApiResponse(201, complaint, "Complaint submitted successfully"));
});

// Get complaints by voter ID (Public - for users to track their complaints)
const getComplaintsByVoterId = asyncHandler(async (req, res, next) => {
  const { voterId } = req.params;

  if (!voterId) {
    return next(new ApiError(400, "Voter ID is required"));
  }

  const complaints = await Complaint.find({ voterId: voterId.toUpperCase() })
    .sort({ createdAt: -1 });

  res.status(200).json(new ApiResponse(200, complaints, "Complaints retrieved successfully"));
});

// Get all complaints (Admin only)
const getAllComplaints = asyncHandler(async (req, res, next) => {
  const { status } = req.query;

  const filter = {};
  if (status && status !== "all") {
    filter.status = status;
  }

  const complaints = await Complaint.find(filter).sort({ createdAt: -1 });

  // Get statistics
  const stats = {
    total: await Complaint.countDocuments(),
    submitted: await Complaint.countDocuments({ status: "submitted" }),
    underReview: await Complaint.countDocuments({ status: "under-review" }),
    resolved: await Complaint.countDocuments({ status: "resolved" })
  };

  res.status(200).json(new ApiResponse(200, {
    complaints,
    stats
  }, "Complaints retrieved successfully"));
});

// Get single complaint by ID (Admin only)
const getComplaintById = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const complaint = await Complaint.findById(id);
  if (!complaint) {
    return next(new ApiError(404, "Complaint not found"));
  }

  res.status(200).json(new ApiResponse(200, complaint, "Complaint retrieved successfully"));
});

// Update complaint status (Admin only)
const updateComplaintStatus = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { status, adminResponse } = req.body;

  if (!status) {
    return next(new ApiError(400, "Status is required"));
  }

  const validStatuses = ["submitted", "under-review", "resolved"];
  if (!validStatuses.includes(status)) {
    return next(new ApiError(400, "Invalid status value"));
  }

  const updateData = { status };
  
  if (adminResponse !== undefined) {
    updateData.adminResponse = adminResponse;
  }

  if (status === "resolved") {
    updateData.resolvedAt = new Date();
  }

  const complaint = await Complaint.findByIdAndUpdate(
    id,
    updateData,
    { new: true }
  );

  if (!complaint) {
    return next(new ApiError(404, "Complaint not found"));
  }

  res.status(200).json(new ApiResponse(200, complaint, "Complaint updated successfully"));
});

// Delete complaint (Admin only)
const deleteComplaint = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const complaint = await Complaint.findByIdAndDelete(id);
  if (!complaint) {
    return next(new ApiError(404, "Complaint not found"));
  }

  res.status(200).json(new ApiResponse(200, complaint, "Complaint deleted successfully"));
});

export {
  createComplaint,
  getComplaintsByVoterId,
  getAllComplaints,
  getComplaintById,
  updateComplaintStatus,
  deleteComplaint
};
