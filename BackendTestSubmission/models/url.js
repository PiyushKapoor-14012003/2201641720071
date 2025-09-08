import fs from "fs";
import path from "path";

const BASE ="http://localhost:3000";
const DATA_FILE = path.join(process.cwd(), "urls.json");

let urls = {};

try {
  if (fs.existsSync(DATA_FILE)) {
    const raw = fs.readFileSync(DATA_FILE, "utf8");
    urls = raw ? JSON.parse(raw) : {};
  } else {
    fs.writeFileSync(DATA_FILE, JSON.stringify({}, null, 2));
    urls = {};
  }
} catch (err) {
  console.error("Failed to load urls.json, starting fresh:", err.message);
  urls = {};
}

function saveToDisk() {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(urls, null, 2), "utf8");
  } catch (err) {
    console.error("Failed to save urls.json:", err.message);
  }
}


export function createShortUrl(shortcode, url, validityMinutes) {
  const now = new Date();
  const validity = Number(validityMinutes) || 30; // minutes
  const expiry = new Date(now.getTime() + validity * 60_000);

  urls[shortcode] = {
    url,
    expiry: expiry.toISOString(),
    createdAt: now.toISOString(),
    clicks: [],
  };

  saveToDisk();

  return { shortLink: `${BASE}/${shortcode}`, expiry };
}


export function getUrl(shortcode) {
  const e = urls[shortcode];
  if (!e) return null;
  return {
    url: e.url,
    expiry: new Date(e.expiry),
    createdAt: new Date(e.createdAt),
    clicks: (e.clicks || []).map(c => ({ time: new Date(c.time), referrer: c.referrer, ip: c.ip })),
  };
}


export function recordClick(shortcode, req) {
  const entry = urls[shortcode];
  if (!entry) return;
  entry.clicks.push({
    time: new Date().toISOString(),
    referrer: req.get("referer") || "direct",
    ip: req.ip,
  });
  saveToDisk();
}


export function exists(shortcode) {
  return Boolean(urls[shortcode]);
}
