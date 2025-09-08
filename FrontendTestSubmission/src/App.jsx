import CreateShortUrl from "./components/CreateShortUrl";
import "./App.css";

export default function App() {
  return (
    <div className="app">
      <header>
        <h1>URL Shortener</h1>
        <p>Simple frontend for your shortener backend</p>
      </header>

      <main>
        <CreateShortUrl />
        <hr />
      </main>

      <footer>
        <small>Make sure backend is running at <code>http://localhost:3000</code></small>
      </footer>
    </div>
  );
}
