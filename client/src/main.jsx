import React, { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { store } from "./store/store";
import App from "./App";
import "./index.css";
import { Toaster } from "@/components/ui/sonner";
// Get the root DOM element
const container = document.getElementById("root");
// Create a root instance
const root = createRoot(container);
import { BrowserRouter } from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";

// Render the app
root.render(
  <StrictMode>
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
    <BrowserRouter>
      <Provider store={store}>
        <App />
        <Toaster
          position="top-right"
          expand={false}
          visibleToasts={5}
          richColors="true"
          description
          offset={{ top: '70px', right: "16px" }}
        />
        {/* <Toaster position="top-right" richColors='true'  description/> */}
      </Provider>
    </BrowserRouter>
    </GoogleOAuthProvider>
  </StrictMode>
);
