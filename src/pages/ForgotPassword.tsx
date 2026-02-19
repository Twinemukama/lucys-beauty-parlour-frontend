import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Mail, ArrowLeft } from "lucide-react";
import { adminForgotPassword } from "@/apis/bookings";

export default function ForgotPassword() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [email, setEmail] = useState("");

  const handleResetRequest = async () => {
    setIsLoading(true);

    try {
      await adminForgotPassword({ email: email.trim() });
      setEmailSent(true);
      toast({
        title: "If the email exists, a link was sent",
        description: "Please check your inbox (and spam folder) for the password reset link.",
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Request failed";
      toast({
        title: "Could not send reset link",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
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
          <div className="space-y-2">
            <Label htmlFor="email">Admin email</Label>
            <Input
              id="email"
              type="email"
              placeholder="admin@lucysbeautyparlour.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
                <Button 
                  onClick={handleResetRequest} 
                  className="w-full" 
            disabled={isLoading || !email.trim()}
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
