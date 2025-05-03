import { createRoot } from "react-dom/client";
import { StrictMode, Suspense, useState } from "react";

import App from "./App";
import "./index.css";
import { BrowserRouter } from "react-router-dom";
import { ErrorBoundary } from "react-error-boundary";

import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import { I18nextProvider } from "react-i18next";
import i18n from "@/lib/i18n";

function ErrorFallback({ error }: { error: Error }) {
  return (
    <div role="alert">
      <p>Something went wrong:</p>
      <pre style={{ color: "red" }}>{error.message}</pre>
    </div>
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <I18nextProvider i18n={i18n}>
    
      <QueryClientProvider client={queryClient}>
        
          <BrowserRouter>
              <TooltipProvider>
                <ErrorBoundary FallbackComponent={ErrorFallback}>
                  <Toaster />
                  <App />
                </ErrorBoundary>
              </TooltipProvider>
          </BrowserRouter>
        
      </QueryClientProvider>
      
    </I18nextProvider>

  </StrictMode>
);
