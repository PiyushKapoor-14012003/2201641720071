// simple API helper - change BASE_URL if your backend is at a different host
const BASE_URL = "http://localhost:3000";

async function handleFetch(res) {
  if (!res.ok) {
    const contentType = res.headers.get("content-type") || "";
    let msg = `HTTP ${res.status}`;
    try {
      if (contentType.includes("application/json")) {
        const body = await res.json();
        msg = body.error || JSON.stringify(body);
      } else {
        msg = await res.text();
      }
    } catch (_) {}
    throw new Error(msg);
  }
  return res.json().catch(() => null);
}

export async function postCreate(payload) {
  const res = await fetch(`${BASE_URL}/shorturls`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return handleFetch(res);
}

export async function getStats(shortcode) {
  const res = await fetch(`${BASE_URL}/shorturls/${encodeURIComponent(shortcode)}`);
  return handleFetch(res);
}
