import mongoose, { mongo, Schema } from 'mongoose';

const voterSchema = new Schema(
  {
    profilePicture: {
      type: {
        url: String,
        localPath: String
      },
      default: {
        url: `https://placehold.co/100x100`,
        localPath: ""
      }
    },
    fullName: {
      type: String,
      required: true,
      trim: true
    },
    fatherName: {
      type: String,
      required: true,
      trim: true
    },
    gender: {
      type: String,
      required: true,
      enum: ['Male', 'Female', 'Other']
    },
    dateOfBirth: {
      type: Date,
      required: true
    },
    voterID: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    phoneNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    address: {
      type: String,
      required: true,
      trim: true
    },
    // Location fields for ward-based voting
    belongingState: {
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
    // Voting status
    hasVoted: {
      type: Boolean,
      default: false
    },
    votedAt: {
      type: Date,
      default: null
    }
  },
  { timestamps: true }
);

// Index for location-based queries
voterSchema.index({ belongingState: 1, district: 1, ward: 1 });

export const Voter = mongoose.model('Voter', voterSchema);