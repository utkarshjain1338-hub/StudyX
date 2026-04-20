import { createRoot } from "react-dom/client";
import { setBaseUrl } from "@workspace/api-client-react";
import App from "./App";
import "./index.css";

// On Android (Capacitor WebView) there is no proxy — we must hit the real API.
// Set VITE_API_BASE_URL in .env (or .env.mobile) to your deployed API origin,
// e.g. https://your-api.example.com
// Leave it unset for browser dev (the Vite proxy handles /api calls).
const apiBaseUrl = import.meta.env.VITE_API_BASE_URL as string | undefined;
if (apiBaseUrl) {
  setBaseUrl(apiBaseUrl);
}

createRoot(document.getElementById("root")!).render(<App />);
