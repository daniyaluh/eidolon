import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import { MotionConfig } from "framer-motion";
import { Toaster } from "sonner";
import "./index.css";
import App from "./App.tsx";
import { queryClient } from "./lib/queryClient";
import { SmoothScroll } from "./components/layout/SmoothScroll";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        {/* reducedMotion="user" makes all Framer Motion animations honor the
            OS prefers-reduced-motion setting automatically. */}
        <MotionConfig reducedMotion="user">
          {/* Global Lenis smooth scroll (no-op under prefers-reduced-motion). */}
          <SmoothScroll />
          <App />
          <Toaster theme="dark" position="bottom-right" richColors duration={4000} closeButton />
        </MotionConfig>
      </BrowserRouter>
    </QueryClientProvider>
  </StrictMode>
);
