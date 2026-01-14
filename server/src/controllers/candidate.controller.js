import Candidate from "../models/candidate.model.js";

/**
 * Create single candidate
 */
export const createCandidate = async (req, res) => {
  try {
    const candidate = await Candidate.create(req.body);
    res.status(201).json({
      success: true,
      data: candidate
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Bulk insert candidates (your JSON list)
 */
export const bulkInsertCandidates = async (req, res) => {
  try {
    const candidates = await Candidate.insertMany(req.body);
    res.status(201).json({
      success: true,
      count: candidates.length,
      data: candidates
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Get all candidates
 */
export const getAllCandidates = async (req, res) => {
  try {
    const candidates = await Candidate.find().sort({ srNo: 1 });
    res.status(200).json({
      success: true,
      data: candidates
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
