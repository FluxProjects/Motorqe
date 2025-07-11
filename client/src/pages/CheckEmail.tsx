import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Check } from "lucide-react";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";

export default function CheckEmailPage() {
  const [, setLocation] = useLocation();
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const emailParam = params.get("email");
    setEmail(emailParam);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <main className="max-w-xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-1 flex flex-col justify-center">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Verify Your Email</h1>
          <p className="text-gray-600">Check your inbox to verify your email and activate your account</p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-8 text-center">
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 bg-motorqe-orange rounded-full flex items-center justify-center text-white">
              <Check className="h-6 w-6" />
            </div>
          </div>
          <h2 className="text-xl font-bold text-green-600 mb-2">Registration Successful!</h2>
          <p className="text-gray-700 mb-6">
            We have sent a verification link to your email address.
            Please check your inbox and click the link to verify your account.
          </p>
          {email && (
            <p className="text-gray-900 font-medium mb-4">
              Sent to: <span className="text-motorqe-orange">{email}</span>
            </p>
          )}
          <Button onClick={() => setLocation("/login")} className="mt-6">
            Return to Login
          </Button>
        </div>
      </main>

      <Footer />
    </div>
  );
}
