// This script creates an admin user in the database. Run it once to set up the admin account.

import dotenv from "dotenv";
import mongoose from "mongoose";
import {User} from "../models/user.models.js";

dotenv.config(
  {
    path: '../../.env'
  }
);

await mongoose.connect(process.env.MONGODB_URI);

const admin = await User.create({
  email: "admin@gmail.com",
  username: "admin",
  password: "123456",
  role: "admin",
  isEmailVerified: true
});

console.log("Admin created successfully");
process.exit();