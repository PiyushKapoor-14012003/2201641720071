import React, { useState } from "react";
import { postCreate } from "../lib/api";

export default function CreateShortUrl() {
  const [url, setUrl] = useState("");
  const [validity, setValidity] = useState(30);
  const [shortLink, setShortLink] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (!url.trim()) return setError("Please enter a URL.");

    setLoading(true);
    try {
      const res = await postCreate({ url, validity });
      if (res?.shortLink) {
        setShortLink(res.shortLink);
      } else {
        setError("Unexpected response from server.");
      }
    } catch (err) {
      setError(err.message || "Request failed");
    } finally {
      setLoading(false);
    }
  }

  function copyToClipboard() {
    if (!shortLink) return;
    navigator.clipboard.writeText(shortLink).then(() => {
      alert("Copied to clipboard!");
    });
  }

  return (
    <section className="card">
      <h2>Create Short URL</h2>

      <form onSubmit={handleSubmit} className="form">
        <label>
          Original URL
          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com"
            type="text"
            required
          />
        </label>

        <label>
          Validity (minutes)
          <input
            value={validity}
            onChange={(e) => setValidity(Number(e.target.value))}
            type="number"
            min="1"
          />
        </label>

        <div className="actions">
          <button disabled={loading} type="submit">
            {loading ? "Creating..." : "Create Short URL"}
          </button>
        </div>
      </form>

      {error && <p className="err">{error}</p>}

      {shortLink && (
        <div className="result">
          <p>
            Short link:{" "}
            <a href={shortLink} target="_blank" rel="noreferrer">
              {shortLink}
            </a>
          </p>
          <button onClick={copyToClipboard}>Copy</button>
        </div>
      )}
    </section>
  );
}
