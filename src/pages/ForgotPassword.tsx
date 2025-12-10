import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Mail, ArrowLeft } from "lucide-react";

export default function ForgotPassword() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleResetRequest = async () => {
    setIsLoading(true);

    // TODO: Replace with actual password reset API call
    setTimeout(() => {
      setEmailSent(true);
      toast({
        title: "Reset link sent",
        description: "Please check your admin email for the password reset link.",
      });
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted/30 to-background p-4">
      <div className="w-full max-w-md">
        {/* Logo/Brand */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-playfair font-bold text-primary mb-2">
            Lucy's Beauty Parlour
          </h1>
          <p className="text-muted-foreground">Admin Portal</p>
        </div>

        <Card className="border-border/50 shadow-elegant">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-2xl font-playfair">
              {emailSent ? "Check Your Email" : "Reset Password"}
            </CardTitle>
            <CardDescription>
              {emailSent
                ? "We've sent a password reset link to your registered admin email address."
                : "Click below to receive a password reset link at your registered admin email."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {emailSent ? (
              <div className="space-y-4">
                <div className="text-center py-4">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Mail className="h-8 w-8 text-primary" />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Didn't receive the email? Check your spam folder or{" "}
                    <button
                      onClick={() => setEmailSent(false)}
                      className="text-primary hover:underline"
                    >
                      try again
                    </button>
                  </p>
                </div>
                <Link to="/admin/login">
                  <Button variant="outline" className="w-full gap-2">
                    <ArrowLeft className="h-4 w-4" />
                    Back to Login
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-5">
                <Button 
                  onClick={handleResetRequest} 
                  className="w-full" 
                  disabled={isLoading}
                >
                  {isLoading ? "Sending..." : "Send Reset Link"}
                </Button>

                <Link to="/admin/login">
                  <Button variant="ghost" className="w-full gap-2">
                    <ArrowLeft className="h-4 w-4" />
                    Back to Login
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
