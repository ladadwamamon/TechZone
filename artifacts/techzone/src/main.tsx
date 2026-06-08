import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { reportWebVitals } from "./lib/webVitals";

createRoot(document.getElementById("root")!).render(<App />);

reportWebVitals();
