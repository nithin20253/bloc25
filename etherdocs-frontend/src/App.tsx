
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Navbar from "./components/Navbar";

// Import your existing components
import ConnectWalletPage from "./components/ConnectWalletPage";
import IssuerUploadPage from "./components/IssuerUploadPage";
import VerifierPage from "./components/VerifierPage";
import QRCode from "./components/QRCode";

// Create a new QueryClient instance
const queryClient = new QueryClient();

const App = () => {
  return (
    // Properly wrap the app with BrowserRouter first, then QueryClientProvider
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <div className="min-h-screen flex flex-col">
            <Navbar />
            <main className="flex-grow">
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/connect" element={<ConnectWalletPage />} />
                <Route path="/issuer" element={<IssuerUploadPage />} />
                <Route path="/verify" element={<VerifierPage />} />
                <Route path="/qrcode" element={<QRCode />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>
          </div>
        </TooltipProvider>
      </QueryClientProvider>
    </BrowserRouter>
  );
};

export default App;
