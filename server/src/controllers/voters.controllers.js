import { Voter } from "../models/voters.model.js";
import { ApiResponse } from '../utils/api-response.js';
import { ApiError } from '../utils/api-error.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const createVoter = asyncHandler(async (req, res, next) => {
  const { profilePicture, fullName, fatherName, gender, dateOfBirth, voterID, email, phoneNumber, address } = req.body;
  const existingVoter = await Voter.findOne({ $or: [ { voterID }, { email }, { phoneNumber } ] });
  if (existingVoter) {
    return next(new ApiError(400, "Voter with the same Voter ID, email, or phone number already exists"));
  }
  const newVoter = await Voter.create({ profilePicture, fullName, fatherName, gender, dateOfBirth, voterID, email, phoneNumber, address });
  res.status(201).json(new ApiResponse(201, "Voter created successfully", newVoter));
});

const getVoterById = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const voter = await Voter.findById(id);
  if (!voter) {
    return next(new ApiError(404, "Voter not found"));
  }
  res.status(200).json(new ApiResponse(200, "Voter retrieved successfully", voter));
});

const updateVoter = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const updates = req.body;
  const updatedVoter = await Voter.findByIdAndUpdate(id, updates, { new: true });
  if (!updatedVoter) {
    return next(new ApiError(404, "Voter not found"));
  }
  res.status(200).json(new ApiResponse(200, "Voter updated successfully", updatedVoter));
});

const deleteVoter = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const deletedVoter = await Voter.findByIdAndDelete(id);
  if (!deletedVoter) {
    return next(new ApiError(404, "Voter not found"));
  }
  res.status(200).json(new ApiResponse(200, "Voter deleted successfully", deletedVoter));
});

export {
  createVoter,
  getVoterById,
  updateVoter,
  deleteVoter
};