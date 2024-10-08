import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";

import { Analytics } from "@vercel/analytics/react"; // Vercel Analytics Import

const qc = new QueryClient();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <QueryClientProvider client={qc}>
        <BrowserRouter>
          <App />
          <Analytics/>
        </BrowserRouter>
      </QueryClientProvider>
    </LocalizationProvider>
  </React.StrictMode>
);
