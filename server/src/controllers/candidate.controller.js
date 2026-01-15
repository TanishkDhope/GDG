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
 * Get all candidates with optional filters
 */
export const getAllCandidates = async (req, res) => {
  try {
    const { state, district, ward } = req.query;
    
    // Build filter object
    const filter = {};
    if (state) filter.state = state;
    if (district) filter.district = district;
    if (ward) filter.ward = ward;

    const candidates = await Candidate.find(filter).sort({ srNo: 1 });
    res.status(200).json({
      success: true,
      count: candidates.length,
      data: candidates
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Get unique filter options (states, districts, wards)
 */
export const getFilterOptions = async (req, res) => {
  try {
    const { state, district } = req.query;

    // Get all unique states
    const states = await Candidate.distinct("state");

    // Get districts based on selected state
    let districts = [];
    if (state) {
      districts = await Candidate.distinct("district", { state });
    }

    // Get wards based on selected state and district
    let wards = [];
    if (state && district) {
      wards = await Candidate.distinct("ward", { state, district });
    }

    res.status(200).json({
      success: true,
      data: {
        states,
        districts,
        wards
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Get candidate by ID
 */
export const getCandidateById = async (req, res) => {
  try {
    const candidate = await Candidate.findById(req.params.id);
    if (!candidate) {
      return res.status(404).json({
        success: false,
        message: "Candidate not found"
      });
    }
    res.status(200).json({
      success: true,
      data: candidate
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Compare candidates (get multiple by IDs)
 */
export const compareCandidates = async (req, res) => {
  try {
    const { ids } = req.query; // comma-separated IDs
    if (!ids) {
      return res.status(400).json({
        success: false,
        message: "Please provide candidate IDs to compare"
      });
    }

    const idArray = ids.split(",");
    const candidates = await Candidate.find({ _id: { $in: idArray } });

    res.status(200).json({
      success: true,
      count: candidates.length,
      data: candidates
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
