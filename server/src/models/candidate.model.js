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
      default: "🏛️"
    },

    party: {
      type: String,
      default: "Independent"
    },

    profilePhoto: {
      type: String,
      default: "https://placehold.co/200x200?text=Candidate"
    },

    // Location filters
    state: {
      type: String,
      required: true,
      trim: true
    },

    district: {
      type: String,
      required: true,
      trim: true
    },

    ward: {
      type: String,
      required: true,
      trim: true
    },

    // Education
    education: {
      type: String,
      default: "Not specified"
    },

    // Legal History
    legalHistory: {
      pendingCases: {
        type: Number,
        default: 0
      },
      convictions: {
        type: Number,
        default: 0
      }
    },

    // Manifesto
    manifesto: {
      summary: {
        type: String,
        default: ""
      },
      promises: [{
        type: String
      }],
      pdfUrl: {
        type: String,
        default: ""
      }
    },

    // Reserved seat info
    isReservedSeat: {
      type: Boolean,
      default: false
    },

    reservedCategory: {
      type: String,
      enum: ["General", "Women Reserved Seat", "SC", "ST", "OBC"],
      default: "General"
    },

    // Affidavit
    affidavitUrl: {
      type: String,
      default: ""
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
    },
    
  },
  { timestamps: true }
);

// Index for faster filtering
candidateSchema.index({ state: 1, district: 1, ward: 1 });

export default mongoose.model("Candidate", candidateSchema);
