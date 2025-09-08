// app.js
import express from "express";
import cors from "cors"
import router from "./route/route.js";
import { getUrl, recordClick } from "./models/url.js";
import log from "../LoggingMiddleware/logger.js";
const app = express();
app.use(express.json());
app.use(cors({
  origin: "*"
}))

app.use("/shorturls", router);

function normalizeUrl(target) {
  if (!target) return target;

  if (/^[a-zA-Z][a-zA-Z0-9+.-]*:\/\//.test(target)) return target;

  return `https://${target}`;
}


app.get("/:shortcode", async (req, res) => {
  const { shortcode } = req.params;

  try {
    const entry = getUrl(shortcode);

    if (!entry) {
      await log("backend", "warn", "handler", `Shortcode ${shortcode} not found`);
      return res.status(404).json({ error: "Shortcode not found" });
    }

    if (new Date() > entry.expiry) {
      await log("backend", "warn", "handler", `Shortcode ${shortcode} expired`);
      return res.status(410).json({ error: "Link expired" });
    }

    recordClick(shortcode, req);
    await log("backend", "info", "controller", `Redirecting ${shortcode} -> ${entry.url}`);

    const target = normalizeUrl(entry.url);
    return res.redirect(target);
  } catch (err) {
    await log("backend", "fatal", "service", `Redirect handler error: ${err.message}`);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/", (req, res) => res.send("URL Shortener running"));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 URL Shortener running at http://localhost:${PORT}`);
});
