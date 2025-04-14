import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";
import mongoose from "mongoose";
import { JSDOM } from "jsdom";

// Store the access token in a module-level variable so it's accessible across functions
let botAccessToken = null;

export const addBot = async () => {
  const username = process.env.BOT_NAME;
  const password = process.env.BOT_PASSWORD;
  const email = "bottish@diddy.com";

  try {
    const botExists = await User.findOne({
      username: process.env.BOT_NAME,
    });

    if (!botExists) {
      const registerBot = await User.create({
        username: process.env.BOT_NAME,
        password: process.env.BOT_PASSWORD,
        email: email,
      });

      const bot = await User.findById(registerBot._id);
      if (!bot) throw new Error("Error in creating bot");
    }

    // Generate the token regardless of whether the bot was just created or already existed
    botAccessToken = jwt.sign(
      {
        username: process.env.BOT_NAME,
      },
      process.env.ACCESS_TOKEN_SECRET,
      {
        expiresIn: "10d",
      },
    );

    return botAccessToken;
  } catch (error) {
    console.log("Error creating bot", error.message);
    throw error; // Re-throw to handle it in the calling function
  }
};

export const formSubmit = async (req, res) => {
  try {
    // Make sure we have a token
    if (!botAccessToken) {
      console.log("token doesnt exist...geneating");
      await addBot();
    }

    const userInput = req.body.reasons;

    const dom = new JSDOM(
      `
      <!DOCTYPE html>
      <html>
        <body> 
          <h3> Entry requests </h3> 
          <p class="content">${userInput}</p>
        </body> 
      </html> 
    `,
      {
        url: process.env.CLIENT_URL,
        runScripts: "dangerously",
        resources: "usable",
      },
    );

    const document = dom.window.document;
    console.log("bot access token in dom", botAccessToken);
    document.cookie = `accessToken=${botAccessToken}`;

    const para = document.querySelector(".content");
    console.log("para content:", para.textContent);
    console.log("bot cookie:", document.cookie);

    // Give time for any scripts to execute
    setTimeout(() => {
      console.log(
        "After script execution, cookie is:",
        dom.window.document.cookie,
      );
    }, 100);

    // Return a response
    res.status(200).json({ success: true, message: "Form processed" });
  } catch (error) {
    console.error("Error in formSubmit:", error);
    res.status(500).json({ success: false, message: "Error processing form" });
  }
};

// Initialize the bot and token when the module loads
// but don't block other operations
addBot().catch((err) => {
  console.error("Failed to initialize bot:", err);
});
