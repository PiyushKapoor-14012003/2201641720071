import express from "express";
import { createShortUrl, getUrl, exists } from "../models/url.js";
import generateShortcode from "../utils/generateCode.js";
import log from "../../LoggingMiddleware/logger.js";


const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { url, validity, shortcode } = req.body;

    if (!url) {
      await log("backend", "error", "handler", "Missing URL in request body");
      return res.status(400).json({ error: "url is required" });
    }

    let code = shortcode || generateShortcode();

    let tries = 0;
    while (exists(code) && tries < 5) {
      code = generateShortcode();
      tries++;
    }
    if (exists(code)) {
      await log("backend", "error", "handler", `Shortcode collision after retries: ${code}`);
      return res.status(409).json({ error: "Shortcode already exists, try again" });
    }

    const { shortLink, expiry } = createShortUrl(code, url, validity);
    await log("backend", "info", "controller", `Created short URL ${shortLink}`);
    return res.status(201).json({ shortLink, expiry });
  } catch (err) {
    await log("backend", "fatal", "service", err.message);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});


router.get("/:shortcode", async (req, res) => {
  const { shortcode } = req.params;
  const entry = getUrl(shortcode);

  if (!entry) {
    await log("backend", "error", "handler", `Stats request for missing shortcode ${shortcode}`);
    return res.status(404).json({ error: "Shortcode not found" });
  }

  const stats = {
    url: entry.url,
    createdAt: entry.createdAt,
    expiry: entry.expiry,
    totalClicks: entry.clicks.length,
    clicks: entry.clicks,
  };

  await log("backend", "info", "controller", `Stats retrieved for shortcode ${shortcode}`);
  res.json(stats);
});

export default router;