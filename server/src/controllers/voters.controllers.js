import { Voter } from "../models/voters.model.js";
import { ApiResponse } from '../utils/api-response.js';
import { ApiError } from '../utils/api-error.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import client from "../utils/twilio.js";

const createVoter = asyncHandler(async (req, res, next) => {
  const { 
    profilePicture, fullName, fatherName, gender, dateOfBirth, 
    voterID, email, phoneNumber, address,
    belongingState, district, ward 
  } = req.body;
  
  const existingVoter = await Voter.findOne({ $or: [ { voterID }, { email }, { phoneNumber } ] });
  if (existingVoter) {
    return next(new ApiError(400, "Voter with the same Voter ID, email, or phone number already exists"));
  }
  
  const newVoter = await Voter.create({ 
    profilePicture, fullName, fatherName, gender, dateOfBirth, 
    voterID, email, phoneNumber, address,
    belongingState, district, ward 
  });
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

const verifyVoter = asyncHandler(async (req, res, next) => {
  const { voterID, fullName, dateOfBirth } = req.body;

  // Convert the dateOfBirth string to a Date object for comparison
  const dobDate = new Date(dateOfBirth);
  
  // Find voter by voterID and fullName first
  const voter = await Voter.findOne({ voterID, fullName });
  
  if (!voter) {
    return next(new ApiError(404, "Voter not found or details do not match"));
  }
  
  // Compare dates by converting both to date strings (YYYY-MM-DD)
  const voterDOB = new Date(voter.dateOfBirth).toISOString().split('T')[0];
  const inputDOB = dobDate.toISOString().split('T')[0];
  
  if (voterDOB !== inputDOB) {
    return next(new ApiError(404, "Voter not found or details do not match"));
  }
  
  // Return voter with location info for voting page
  res.status(200).json(new ApiResponse(200, "Voter verified successfully", {
    _id: voter._id,
    fullName: voter.fullName,
    voterID: voter.voterID,
    phoneNumber: voter.phoneNumber,
    belongingState: voter.belongingState,
    district: voter.district,
    ward: voter.ward,
    hasVoted: voter.hasVoted,
    votedAt: voter.votedAt,
    profilePicture: voter.profilePicture
  }));
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

const sendOtp = asyncHandler(async (req, res) => {
  const { voterID } = req.body;

  const voter = await Voter.findOne({ voterID });
  if (!voter) throw new ApiError(404, "Voter not found");

  const phoneNumber = `+91${voter.phoneNumber}`;

  await client.verify.v2
    .services(process.env.TWILIO_VERIFY_SERVICE_SID)
    .verifications.create({
      to: phoneNumber,
      channel: "sms"
    });

  res.json(new ApiResponse(200, "OTP sent successfully"));
});

const verifyOtp = asyncHandler(async (req, res) => {
  const { voterID, otp } = req.body;
  const voter = await Voter.findOne({ voterID });
  if (!voter) throw new ApiError(404, "Voter not found");
  const phoneNumber = `+91${voter.phoneNumber}`;

  const verificationCheck = await client.verify.v2
    .services(process.env.TWILIO_VERIFY_SERVICE_SID)
    .verificationChecks.create({
      to: phoneNumber,
      code: otp
    }); 
  if (verificationCheck.status !== "approved") {
    throw new ApiError(400, "Invalid OTP");
  }
  res.json(new ApiResponse(200, "OTP verified successfully"));
});

// Mark voter as having voted
const markVoterAsVoted = asyncHandler(async (req, res, next) => {
  const { voterID, txHash } = req.body;
  
  const voter = await Voter.findOne({ voterID });
  if (!voter) {
    return next(new ApiError(404, "Voter not found"));
  }
  
  if (voter.hasVoted) {
    return next(new ApiError(400, "Voter has already cast their vote"));
  }
  
  voter.hasVoted = true;
  voter.votedAt = new Date();
  await voter.save();
  
  res.status(200).json(new ApiResponse(200, "Vote recorded successfully", {
    voterID: voter.voterID,
    hasVoted: voter.hasVoted,
    votedAt: voter.votedAt,
    txHash
  }));
});

// Get voter by voterID (for voting page)
const getVoterByVoterID = asyncHandler(async (req, res, next) => {
  const { voterID } = req.params;
  
  const voter = await Voter.findOne({ voterID });
  if (!voter) {
    return next(new ApiError(404, "Voter not found"));
  }
  
  res.status(200).json(new ApiResponse(200, "Voter retrieved successfully", {
    _id: voter._id,
    fullName: voter.fullName,
    voterID: voter.voterID,
    belongingState: voter.belongingState,
    district: voter.district,
    ward: voter.ward,
    hasVoted: voter.hasVoted,
    votedAt: voter.votedAt,
    profilePicture: voter.profilePicture
  }));
});

export {
  createVoter,
  getVoterById,
  updateVoter,
  deleteVoter,
  verifyVoter,
  sendOtp,
  verifyOtp,
  markVoterAsVoted,
  getVoterByVoterID
};