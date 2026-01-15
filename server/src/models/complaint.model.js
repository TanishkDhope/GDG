import mongoose from "mongoose";

const complaintSchema = new mongoose.Schema(
  {
    voterId: {
      type: String,
      required: true,
      trim: true,
      uppercase: true
    },
    category: {
      type: String,
      required: true,
      enum: [
        "technical",
        "face-verification",
        "otp",
        "voter-id",
        "voting-process",
        "other"
      ],
      default: "technical"
    },
    description: {
      type: String,
      required: true,
      trim: true
    },
    status: {
      type: String,
      enum: ["submitted", "under-review", "resolved"],
      default: "submitted"
    },
    adminResponse: {
      type: String,
      default: ""
    },
    resolvedAt: {
      type: Date,
      default: null
    }
  },
  { timestamps: true }
);

// Index for faster voter ID lookups
complaintSchema.index({ voterId: 1 });
complaintSchema.index({ status: 1 });

export const Complaint = mongoose.model("Complaint", complaintSchema);
