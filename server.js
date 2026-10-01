const express = require("express");
const mongoose = require("mongoose");
const { nanoid } = require("nanoid");
require("dotenv").config();

const app = express();

app.use(express.json());

const PORT = 5000;

// MongoDB connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log("MongoDB connected successfully");
    })
    .catch((error) => {
        console.log("MongoDB connection failed:", error.message);
    });

// URL Schema
const urlSchema = new mongoose.Schema({
    originalUrl: String,
    shortCode: String
});

// URL Model
const Url = mongoose.model("Url", urlSchema);

// Home route
app.get("/", (req, res) => {
    res.send("URL Shortener Backend is Running!");
});

// Shorten URL
app.post("/shorten", async (req, res) => {
    try {
        const longUrl = req.body.url;

        if (!longUrl) {
            return res.status(400).json({
                error: "URL is required"
            });
        }

        const shortCode = nanoid(6);

        const newUrl = new Url({
            originalUrl: longUrl,
            shortCode: shortCode
        });

        await newUrl.save();

        res.json({
            message: "URL shortened successfully",
            originalUrl: longUrl,
            shortCode: shortCode
        });

    } catch (error) {
        res.status(500).json({
            error: "Server error"
        });
    }
});

// Redirect using short code
app.get("/:shortCode", async (req, res) => {
    try {
        const shortCode = req.params.shortCode;

        const urlData = await Url.findOne({
            shortCode: shortCode
        });

        if (!urlData) {
            return res.status(404).send("Short URL not found");
        }

        res.redirect(urlData.originalUrl);

    } catch (error) {
        res.status(500).send("Server error");
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});