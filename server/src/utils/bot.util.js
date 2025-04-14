import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";
import puppeteer from "puppeteer";

// Store the access token in a module-level variable
let botAccessToken = null;

export const addBot = async () => {
  const username = process.env.BOT_NAME;
  const password = process.env.BOT_PASSWORD;
  const email = "bottish@diddy.com";

  try {
    const botExists = await User.findOne({
      username: process.env.BOT_NAME,
    });

    // console.log(botExists);

    if (!botExists) {
      const registerBot = await User.create({
        username: process.env.BOT_NAME,
        password: process.env.BOT_PASSWORD,
        email: email,
      });

      const bot = await User.findById(registerBot._id);
      if (!bot) throw new Error("Error in creating bot");
    }

    // Generate the token regardless of whether the bot was created or already existed
    botAccessToken = jwt.sign(
      {
        username: process.env.BOT_NAME,
      },
      process.env.ACCESS_TOKEN_SECRET,
      {
        expiresIn: "10d",
      },
    );

    console.log("Bot access token generated:", botAccessToken);
    return botAccessToken;
  } catch (error) {
    console.log("Error creating bot", error.message);
    throw error;
  }
};

export const formSubmit = async (req, res) => {
  try {
    // Make sure we have a token
    if (!botAccessToken) {
      await addBot(); // Generate token if it doesn't exist
    }

    const userInput = req.body.reasons;
    console.log("Processing form submission with input:", userInput);

    // Launch a browser
    const browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const page = await browser.newPage();

    // Navigate to a page first to establish context
    await page.goto("http://localhost:5555");

    // Set the cookie with correct domain format
    await page.setCookie({
      name: "accessToken",
      value: botAccessToken,
      domain: "localhost",
      path: "/",
      httpOnly: false,
      secure: false,
    });

    console.log("cookies set:", await page.cookies());

    // Create HTML with user input and serve it as content
    const html = `
      <!DOCTYPE html>
      <html>
        <body> 
          <h3>Entry requests</h3> 
          <p class="content">${userInput}</p>
          <script>
            console.log("Cookies available:", document.cookie);
          </script>
        </body> 
      </html>
    `;

    // Set the content
    await page.setContent(html);

    // Monitor requests for potential XSS
    page.on("request", (request) => {
      console.log("Request made:", request.url());
      if (request.url().includes(botAccessToken)) {
        console.log("POTENTIAL XSS DETECTED! Token leaked in request URL");
      }
    });

    // Get cookies after loading
    const cookiesBeforeWait = await page.cookies();
    console.log("Cookies before waiting:", cookiesBeforeWait);

    const content = await page.content();
    console.log("Page content:", content);

    // Close the browser
    await browser.close();

    res.status(200).json({ success: true, message: "Form processed" });
  } catch (error) {
    console.error("Error in formSubmit:", error);
    res.status(500).json({ success: false, message: "Error processing form" });
  }
};
