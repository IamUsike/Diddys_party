import { User } from "../models/user.model.js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import bcrypt from "bcrypt";

export const generateAccessAndRefreshTokens = async (UserId) => {
  try {
    const user = await User.findById(UserId);

    if (!user) {
      throw new Error("User not found");
    }

    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    console.log("Error while generating tokens:", error.message);
    throw new Error("Failed to generate access and refresh tokens");
  }
};

export const registerUser = async (req, res) => {
  console.log(req);
  let { username, email, password } = req.body;
  if (!username || !email || !password)
    return res.status(400).json({
      message: "All fields are required",
    });

  username = username.toLowerCase();
  console.log(username);

  const ban = ["marshall", "marshal", "mathers", "eminem"];
  if (ban.some((word) => username.toLowerCase().includes(word))) {
    return res.status(403).json({
      message: "oi oi oi... Damare Konoyaro",
    });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    //create a new user and save to db
    const userExists = await User.findOne({
      $or: [{ username }, { email }],
    });

    if (userExists)
      return res
        .status(409)
        .json({ message: "User with the email or username already exists" });

    const user = await User.create({
      username,
      email,
      password,
    });

    const createdUser = await User.findById(user._id).select(
      "-password -refreshToken",
    );

    if (!createdUser) {
      return res.status(500).json({
        message: "Somethng went wrong while registering the user",
      });
    }

    return res.status(201).json({
      message: "User registered successfully",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Failed to create user",
    });
  }
};

export const loginUser = async (req, res) => {
  console.log("login attempt", req.body);
  try {
    let { username, password } = req.body;
    if (!username || !password)
      return res.status(400).json({ message: "The field cannot be empty" });

    username = username.toLowerCase();

    const user = await User.findOne({ username });

    if (!user) {
      return res.status(400).json({
        message: "User does not exist",
      });
    }

    const isPasswordValid = await user.isPasswordCorrect(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        message: "Invalid password",
      });
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
      user._id,
    );

    //send the token in cookies
    const loggedInUser = await User.findById(user._id).select(
      "-password -refreshToken",
    );

    const options = {
      httpOnly: false,
      secure: false,
    };

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json({
        message: "User logged in successfully",
      });
  } catch (error) {
    console.log(error.message, "error logging in");
    return res.status(500).json({
      message: "Error while logging in",
    });
  }
};
