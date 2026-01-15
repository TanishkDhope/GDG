import mongoose from "mongoose";

const candidateSchema = new mongoose.Schema(
  {
    srNo: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },

    name: {
      type: String,
      required: true,
      trim: true
    },

    icon: {
      type: String,
      default: "Not specified"
    },

    party: {
      type: String,
      default: "Not specified"
    },

    profilePhoto: {
      type: String,
      default: "https://placehold.co/200x200?text=Candidate"
    },

    isSigned: {
      type: Boolean,
      default: false
    },

    isValid: {
      type: Boolean,
      default: true
    },

    hash: {
      type: String,
      required: true
    }
  },
  { timestamps: true }
);

export default mongoose.model("Candidate", candidateSchema);
