
import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/providers/language-provider";
import { PageTransition } from "@/components/page-transition";
import { toast } from "sonner";
import { Navbar } from "@/components/navbar";
import { FormField } from "@/components/auth/form-field";
import { validateEmail } from "@/providers/auth/auth-utils";
import { supabase } from "@/integrations/supabase/client";

const ForgotPassword = () => {
  const { t } = useLanguage();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const validateForm = () => {
    if (!email) {
      setError("Email is required");
      return false;
    } 
    
    if (!validateEmail(email)) {
      setError("Please enter a valid email");
      return false;
    }
    
    setError(null);
    return true;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + '/reset-password',
      });
      
      if (error) {
        throw error;
      }
      
      setIsSubmitted(true);
      toast.success("Password reset instructions sent to your email");
    } catch (error: any) {
      console.error("Password reset error:", error);
      toast.error(error.message || "Failed to send reset instructions");
      setError(error.message || "Failed to send reset instructions");
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <PageTransition>
      <Navbar />
      <div className="min-h-[calc(100vh-76px)] flex items-center justify-center bg-gradient-to-b from-transparent to-background/50 px-4">
        <div className="fixed top-20 left-4 z-50">
          <Button variant="ghost" size="sm" asChild className="gap-1 bg-background/80 backdrop-blur-sm">
            <Link to="/login">
              <ArrowLeft className="h-4 w-4" />
              <span>{t("back_to_login")}</span>
            </Link>
          </Button>
        </div>
        
        <div className="w-full max-w-md">
          <div className="bg-card shadow-lg rounded-lg overflow-hidden animate-slide-in">
            <div className="p-8">
              <div className="text-center mb-8">
                <h1 className="text-2xl font-bold mb-2">Reset Password</h1>
                <p className="text-muted-foreground text-sm">
                  {isSubmitted 
                    ? "Check your email for reset instructions" 
                    : "Enter your email to reset your password"}
                </p>
              </div>
              
              {!isSubmitted ? (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <FormField
                    id="email"
                    label="Email"
                    type="email"
                    value={email}
                    onChange={setEmail}
                    required
                    disabled={isLoading}
                    placeholder="your@email.com"
                    error={error || undefined}
                  />
                  
                  <Button 
                    type="submit" 
                    className="w-full bg-primary" 
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <div className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Sending...
                      </div>
                    ) : "Send Reset Instructions"}
                  </Button>
                </form>
              ) : (
                <div className="text-center space-y-4">
                  <p className="text-green-600 dark:text-green-400">
                    Reset instructions sent! Check your email.
                  </p>
                  <Button 
                    onClick={() => setIsSubmitted(false)}
                    variant="outline" 
                    className="w-full"
                  >
                    Send Again
                  </Button>
                </div>
              )}
              
              <div className="text-center mt-6">
                <p className="text-sm text-muted-foreground">
                  Remember your password?{" "}
                  <Link to="/login" className="text-primary font-medium hover:underline">
                    Sign In
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
};

export default ForgotPassword;
