import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import "./utils/apiTesting"; // Load API testing functions globally

createRoot(document.getElementById("root")!).render(<App />);
