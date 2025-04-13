import dotenv from "dotenv";
import express from "express";

dotenv.config({
  path: "../.env",
});

import { connectDB } from "./db.js";
import { app } from "./app.js";

connectDB()
  .then(() => {
    app.listen(process.env.PORT, () => {
      console.log(`server is running on port ${process.env.PORT}`);
    });
  })
  .catch((err) => {
    console.log("Database connection failed", err.message);
  });
