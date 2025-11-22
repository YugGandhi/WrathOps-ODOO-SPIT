import { useState } from "react";
import { Link } from "wouter";
import { Package, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function ForgotPassword() {
  const [step, setStep] = useState<"email" | "otp" | "reset" | "success">("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address");
      return;
    }

    setStep("otp");
  };

  const handleOtpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!otp || otp.length !== 6) {
      setError("Please enter a valid 6-digit OTP");
      return;
    }

    setStep("reset");
  };

  const handleResetSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters long");
      return;
    }

    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/.test(newPassword)) {
      setError("Password must contain uppercase, lowercase, number, and special character");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setStep("success");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-4 flex flex-col items-center">
          <div className="h-12 w-12 rounded-lg bg-primary flex items-center justify-center">
            <Package className="h-7 w-7 text-primary-foreground" />
          </div>
          <div className="space-y-2 text-center">
            <CardTitle className="text-2xl font-bold">
              {step === "email" && "Forgot Password"}
              {step === "otp" && "Enter OTP"}
              {step === "reset" && "Reset Password"}
              {step === "success" && "Password Reset Successful"}
            </CardTitle>
            <CardDescription>
              {step === "email" && "Enter your email to receive a reset code"}
              {step === "otp" && "We've sent a 6-digit code to your email"}
              {step === "reset" && "Create a new password for your account"}
              {step === "success" && "Your password has been updated"}
            </CardDescription>
          </div>
        </CardHeader>

        {step === "email" && (
          <form onSubmit={handleEmailSubmit}>
            <CardContent className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  data-testid="input-email"
                />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
              <Button type="submit" className="w-full" data-testid="button-next">
                NEXT
              </Button>
              <Link href="/login">
                <Button variant="ghost" className="w-full gap-2" data-testid="button-back-to-login">
                  <ArrowLeft className="h-4 w-4" />
                  Back to Login
                </Button>
              </Link>
            </CardFooter>
          </form>
        )}

        {step === "otp" && (
          <form onSubmit={handleOtpSubmit}>
            <CardContent className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <div className="space-y-2">
                <Label htmlFor="otp">Enter OTP</Label>
                <Input
                  id="otp"
                  type="text"
                  placeholder="Enter 6-digit code"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                  data-testid="input-otp"
                />
              </div>
              <p className="text-sm text-muted-foreground text-center">
                Didn't receive the code?{" "}
                <button type="button" className="text-primary hover:underline" data-testid="button-resend">
                  Resend
                </button>
              </p>
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full" data-testid="button-verify">
                VERIFY
              </Button>
            </CardFooter>
          </form>
        )}

        {step === "reset" && (
          <form onSubmit={handleResetSubmit}>
            <CardContent className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <Input
                  id="newPassword"
                  type="password"
                  placeholder="Enter new password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  data-testid="input-new-password"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Re-enter new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  data-testid="input-confirm-password"
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full" data-testid="button-reset-password">
                RESET PASSWORD
              </Button>
            </CardFooter>
          </form>
        )}

        {step === "success" && (
          <CardContent className="space-y-4">
            <div className="text-center py-6">
              <div className="mx-auto h-12 w-12 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mb-4">
                <svg
                  className="h-6 w-6 text-emerald-600 dark:text-emerald-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-sm text-muted-foreground">
                You can now sign in with your new password
              </p>
            </div>
            <Link href="/login">
              <Button className="w-full" data-testid="button-go-to-login">
                GO TO LOGIN
              </Button>
            </Link>
          </CardContent>
        )}
      </Card>
    </div>
  );
}
