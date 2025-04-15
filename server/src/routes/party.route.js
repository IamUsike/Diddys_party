import { Router } from "express";
import jwt from "jsonwebtoken";
import { verifyJWT } from "../middlewares/verifyToken.js";

const router = Router();

let user = null;
const verifybot = async (req, res) => {
  //  console.log("headers : ", req.headers);
  const token = req.headers?.authorization?.replace("Bearer ", "");

  if (!token) {
    return res.status(401).json({
      message: "Unauthorized",
    });
  }

  const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

  if (decodedToken.username !== process.env.BOT_NAME) {
    return res.status(401).json({
      message: "Unauthorized",
    });
  }

  return res.status(200).json({
    message: "Ok",
  });
};

const verifyParty = async (req, res) => {
  const botName = process.env.BOT_NAME;
  console.log(req.cookies);

  if (botName !== req.user.username) {
    return res.status(401).json({
      message: "Unauthorized",
    });
  }

  return res.status(200).json({ message: "OK" });
};

router.post("/verify-auth", verifybot, verifyParty);

export default router;
