import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import App from "./App";
import "./index.css";

import { AdminAuthProvider } from "./contexts/AdminAuthContext";
import {
  LanguageProvider,
} from "./contexts/LanguageContext";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <AdminAuthProvider>
        <LanguageProvider>
          <App />
        </LanguageProvider>
      </AdminAuthProvider>
    </BrowserRouter>
  </StrictMode>
);