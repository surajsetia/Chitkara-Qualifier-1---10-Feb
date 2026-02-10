const express = require("express");
const axios = require("axios");
require("dotenv").config();

const app = express();
app.use(express.json());

const OFFICIAL_EMAIL = "suraj2301.be23@chitkara.edu.in";
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;


function isPrime(num) {
  if (num < 2) return false;
  for (let i = 2; i <= Math.sqrt(num); i++) {
    if (num % i === 0) return false;
  }
  return true;
}

function gcd(a, b) {
  return b === 0 ? a : gcd(b, a % b);
}

function lcm(a, b) {
  return (a * b) / gcd(a, b);
}

app.get("/health", (req, res) => {
  res.status(200).json({
    is_success: true,
    official_email: OFFICIAL_EMAIL,
  });
});


app.post("/bfhl", async (req, res) => {
  try {
    const keys = Object.keys(req.body);

    if (keys.length !== 1) {
      return res.status(400).json({
        is_success: false,
        error: "Request body must contain exactly one key",
      });
    }

    const key = keys[0];
    const value = req.body[key];
    let data;

    if (key === "fibonacci") {
      if (!Number.isInteger(value) || value < 0) {
        return res.status(400).json({
          is_success: false,
          error: "Invalid fibonacci input",
        });
      }

      let a = 0,
        b = 1;
      data = [];

      for (let i = 0; i < value; i++) {
        data.push(a);
        [a, b] = [b, a + b];
      }
    }

 
    else if (key === "prime") {
      if (!Array.isArray(value)) {
        return res.status(400).json({
          is_success: false,
          error: "Prime input must be an array",
        });
      }

      data = value.filter((num) => Number.isInteger(num) && isPrime(num));
    }


    else if (key === "lcm") {
      if (!Array.isArray(value) || value.length === 0) {
        return res.status(400).json({
          is_success: false,
          error: "LCM input must be a non-empty array",
        });
      }

      data = value.reduce((a, b) => lcm(a, b));
    }

    
    else if (key === "hcf") {
      if (!Array.isArray(value) || value.length === 0) {
        return res.status(400).json({
          is_success: false,
          error: "HCF input must be a non-empty array",
        });
      }

      data = value.reduce((a, b) => gcd(a, b));
    }

 
    else if (key === "AI") {
      if (typeof value !== "string" || value.trim() === "") {
        return res.status(400).json({
          is_success: false,
          error: "AI input must be a non-empty string",
        });
      }

      const response = await axios.post(
        "https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent",
        {
          contents: [
            {
              parts: [
                {
                  text: `Answer the following question in EXACTLY ONE WORD only.\nQuestion: ${value}`,
                },
              ],
            },
          ],
        },
        {
          params: { key: GEMINI_API_KEY },
          timeout: 10000,
        },
      );

      const text = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!text) {
        throw new Error("Empty AI response");
      }

      data = text.trim();
    }


    else {
      return res.status(400).json({
        is_success: false,
        error: "Invalid key provided",
      });
    }

    return res.status(200).json({
      is_success: true,
      official_email: OFFICIAL_EMAIL,
      data,
    });
  } catch (error) {
    console.error("Server error:", error.message);
    return res.status(500).json({
      is_success: false,
      error: "Internal Server Error",
    });
  }
});


const PORT = process.env.PORT || 3000;
/*app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});*/
if (process.env.NODE_ENV !== "production") {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = app;
