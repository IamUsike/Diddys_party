import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const userSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    password: {
      type: String,
    },
  },
  {
    timestamps: true,
  },
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
};

userSchema.methods.generateAccessToken = function () {
  const secret = process.env.ACCESS_TOKEN_SECRET;
  const payload = {
    _id: this._id,
    username: this.username,
  };
  const options = {
    expiresIn: process.env.ACCESS_TOKEN_EXPIRY || "1d",
  };

  return jwt.sign(payload, secret, options);
};

userSchema.methods.generateRefreshToken = function () {
  const secret = process.env.REFRESH_TOKEN_SECRET;
  const payload = {
    _id: this._id,
  };
  const options = {
    expiresIn: process.env.REFRESH_TOKEN_EXPIRY || "2d",
  };

  return jwt.sign(payload, secret, options);
};

export const User = mongoose.model("User", userSchema);
