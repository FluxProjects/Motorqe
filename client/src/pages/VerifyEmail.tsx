import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Check, XCircle } from "lucide-react";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface VerifyResult {
  isValid: boolean;
  message: string;
  email?: string;
}

export default function VerifyEmailPage() {
  const [, setLocation] = useLocation();
  const [status, setStatus] = useState<"loading" | "success" | "error" | "already-verified">("loading");
  const [message, setMessage] = useState<string>("Verifying your email, please wait...");
  const [email, setEmail] = useState<string | undefined>();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get("token");

    if (!token) {
      setStatus("error");
      setMessage("Invalid or missing token.");
      return;
    }

    const verifyEmail = async () => {
      try {
        const res = await fetch(`/api/auth/verify-token?token=${token}`);
        const data: VerifyResult = await res.json();

        if (data.isValid) {
          setStatus("success");
          setMessage(data.message);
          setEmail(data.email);
        } else if (data.message.includes("already verified")) {
          setStatus("already-verified");
          setMessage(data.message);
          setEmail(data.email);
        } else {
          setStatus("error");
          setMessage(data.message);
        }
      } catch (error) {
        console.error("Error verifying email:", error);
        setStatus("error");
        setMessage("Something went wrong while verifying your email.");
      }
    };

    verifyEmail();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <main className="max-w-xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-1 flex flex-col justify-center">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Verify Your Email</h1>
          <p className="text-gray-600">Ensuring your email is verified for secure account access</p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-8 text-center">
          {status === "loading" && (
            <div className="flex flex-col items-center space-y-4">
              <Loader2 className="h-10 w-10 text-motorqe-orange animate-spin" />
              <p className="text-gray-700">{message}</p>
            </div>
          )}

          {status === "success" && (
            <>
              <div className="flex justify-center mb-4">
                <div className="w-12 h-12 bg-motorqe-orange rounded-full flex items-center justify-center text-white">
                  <Check className="h-6 w-6" />
                </div>
              </div>
              <h2 className="text-xl font-bold text-green-600 mb-2">Email Verified Successfully</h2>
              <p className="text-gray-700 mb-6">{message}</p>
              {email && <p className="text-gray-900 font-medium">Verified Email: {email}</p>}
              <Button onClick={() => setLocation("/login")} className="mt-6">Continue to Login</Button>
            </>
          )}

          {status === "already-verified" && (
            <>
              <div className="flex justify-center mb-4">
                <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white">
                  <Check className="h-6 w-6" />
                </div>
              </div>
              <h2 className="text-xl font-bold text-blue-600 mb-2">Email Already Verified</h2>
              <p className="text-gray-700 mb-6">{message}</p>
              {email && <p className="text-gray-900 font-medium">Email: {email}</p>}
              <Button onClick={() => setLocation("/login")} className="mt-6">Go to Login</Button>
            </>
          )}

          {status === "error" && (
            <>
              <div className="flex justify-center mb-4">
                <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center text-white">
                  <XCircle className="h-6 w-6" />
                </div>
              </div>
              <h2 className="text-xl font-bold text-red-600 mb-2">Verification Failed</h2>
              <p className="text-gray-700 mb-6">{message}</p>
              <Button onClick={() => setLocation("/")} className="mt-6">Return to Home</Button>
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
