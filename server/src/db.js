import mongoose from "mongoose";
import process from "node:process";

const DB_NAME = process.env.DB_NAME;
export const connectDB = async () => {
  try {
    const connectionInstance = await mongoose.connect(
      `${process.env.MONGODB_URI}/${DB_NAME}`,
    );
    console.log(
      `\nMongoDB Connected !! DB HOST: ${connectionInstance.connection.host}`,
    );
  } catch (error) {
    console.log("MONGODB CONNECTION ERROR !! ", error.message);
    process.exit(1);
  }
};
