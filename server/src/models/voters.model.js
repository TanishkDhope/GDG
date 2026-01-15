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
    }
  },
  { timestamps: true }
);

export const Voter = mongoose.model('Voter', voterSchema);