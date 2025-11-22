import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft } from "lucide-react";
import { Logo } from "@/components/logo";

const emailSchema = z.object({
  email: z.string().email("Invalid email format"),
});

const otpSchema = z.object({
  otp: z.string().length(6, "OTP must be 6 digits").regex(/^\d+$/, "OTP must contain only numbers"),
});

const resetPasswordSchema = z.object({
  newPassword: z.string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Must contain uppercase letter")
    .regex(/[a-z]/, "Must contain lowercase letter")
    .regex(/[0-9]/, "Must contain number")
    .regex(/[^A-Za-z0-9]/, "Must contain special character"),
  confirmPassword: z.string().min(1, "Please confirm your password"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type EmailFormData = z.infer<typeof emailSchema>;
type OTPFormData = z.infer<typeof otpSchema>;
type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

export default function ForgotPassword() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [step, setStep] = useState<"email" | "otp" | "reset">("email");
  const [isLoading, setIsLoading] = useState(false);
  const [userEmail, setUserEmail] = useState<string>("");
  const [resetToken, setResetToken] = useState<string>("");

  // Redirect to dashboard if already logged in
  useEffect(() => {
    const user = localStorage.getItem("user");
    if (user) {
      setLocation("/dashboard");
    }
  }, [setLocation]);
  
  const emailForm = useForm<EmailFormData>({
    resolver: zodResolver(emailSchema),
    defaultValues: { email: "" },
  });

  const otpForm = useForm<OTPFormData>({
    resolver: zodResolver(otpSchema),
    defaultValues: { otp: "" },
  });

  const resetForm = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      newPassword: "",
      confirmPassword: "",
    },
  });

  const onEmailSubmit = async (data: EmailFormData) => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to send reset email");
      }

      const result = await response.json();
      
      // Store email for OTP verification
      setUserEmail(data.email);
      
      // In development, we get the OTP back for testing
      if (result.otp) {
        toast({
          title: "OTP Generated",
          description: `Your OTP is: ${result.otp} (Development mode only)`,
        });
      } else {
        toast({
          title: "Email sent",
          description: "Please check your email for the OTP code",
        });
      }
      
      setStep("otp");
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to send reset email",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const onOtpSubmit = async (data: OTPFormData) => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: userEmail,
          otp: data.otp,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Invalid OTP");
      }

      const result = await response.json();
      setResetToken(result.token);
      
      toast({
        title: "OTP Verified",
        description: "Please enter your new password",
      });
      
      setStep("reset");
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Invalid OTP. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const onResetSubmit = async (data: ResetPasswordFormData) => {
    setIsLoading(true);
    try {
      // In development, use the token from the response
      // In production, this would come from the email link
      const token = resetToken || new URLSearchParams(window.location.search).get("token");
      
      if (!token) {
        throw new Error("Reset token is missing");
      }

      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          newPassword: data.newPassword,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to reset password");
      }

      toast({
        title: "Password updated",
        description: "Your password has been successfully reset. Please login with your new password.",
      });
      setLocation("/login");
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to reset password",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setLocation("/login")}
              data-testid="button-back"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div className="flex-1 text-center">
              <div className="flex justify-center mb-4">
                <Logo className="h-16 w-16" />
              </div>
              <CardTitle className="text-2xl font-semibold text-blue-600">Reset Password</CardTitle>
              <CardDescription className="text-sm mt-2">
                {step === "email" && "Enter your email to receive reset instructions"}
                {step === "otp" && "Check your email for the verification code"}
                {step === "reset" && "Create a new password"}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {step === "email" && (
            <form onSubmit={emailForm.handleSubmit(onEmailSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  data-testid="input-forgot-email"
                  type="email"
                  {...emailForm.register("email")}
                  className={emailForm.formState.errors.email ? "border-destructive" : ""}
                />
                {emailForm.formState.errors.email && (
                  <p className="text-xs text-destructive">
                    {emailForm.formState.errors.email.message}
                  </p>
                )}
              </div>
              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
                data-testid="button-send-email"
              >
                {isLoading ? "Sending..." : "Send Reset Link"}
              </Button>
            </form>
          )}

          {step === "otp" && (
            <form onSubmit={otpForm.handleSubmit(onOtpSubmit)} className="space-y-4">
              <div className="p-4 bg-muted rounded-md text-center">
                <p className="text-sm text-muted-foreground mb-2">
                  We've sent a 6-digit OTP code to your email.
                </p>
                <p className="text-xs text-muted-foreground">
                  Please enter the code below to continue.
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="otp">OTP Code</Label>
                <Input
                  id="otp"
                  data-testid="input-otp"
                  type="text"
                  maxLength={6}
                  placeholder="000000"
                  className={`text-center text-2xl tracking-widest ${otpForm.formState.errors.otp ? "border-destructive" : ""}`}
                  {...otpForm.register("otp", {
                    onChange: (e) => {
                      // Only allow numbers
                      e.target.value = e.target.value.replace(/\D/g, '');
                    }
                  })}
                />
                {otpForm.formState.errors.otp && (
                  <p className="text-xs text-destructive">
                    {otpForm.formState.errors.otp.message}
                  </p>
                )}
              </div>
              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
                data-testid="button-verify-otp"
              >
                {isLoading ? "Verifying..." : "Verify OTP"}
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="w-full text-sm"
                onClick={async () => {
                  if (!userEmail) {
                    setStep("email");
                    return;
                  }
                  setIsLoading(true);
                  try {
                    const response = await fetch("/api/auth/forgot-password", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ email: userEmail }),
                    });

                    if (!response.ok) {
                      throw new Error("Failed to resend OTP");
                    }

                    const result = await response.json();
                    otpForm.reset();
                    
                    if (result.otp) {
                      toast({
                        title: "OTP Resent",
                        description: `Your new OTP is: ${result.otp} (Development mode only)`,
                      });
                    } else {
                      toast({
                        title: "OTP Resent",
                        description: "Please check your email for the new OTP code",
                      });
                    }
                  } catch (error) {
                    toast({
                      title: "Error",
                      description: "Failed to resend OTP. Please try again.",
                      variant: "destructive",
                    });
                  } finally {
                    setIsLoading(false);
                  }
                }}
                disabled={isLoading}
                data-testid="button-resend-otp"
              >
                Resend OTP
              </Button>
            </form>
          )}

          {step === "reset" && (
            <form onSubmit={resetForm.handleSubmit(onResetSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <Input
                  id="newPassword"
                  data-testid="input-new-password"
                  type="password"
                  {...resetForm.register("newPassword")}
                  className={resetForm.formState.errors.newPassword ? "border-destructive" : ""}
                />
                {resetForm.formState.errors.newPassword && (
                  <p className="text-xs text-destructive">
                    {resetForm.formState.errors.newPassword.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <Input
                  id="confirmPassword"
                  data-testid="input-confirm-new-password"
                  type="password"
                  {...resetForm.register("confirmPassword")}
                  className={resetForm.formState.errors.confirmPassword ? "border-destructive" : ""}
                />
                {resetForm.formState.errors.confirmPassword && (
                  <p className="text-xs text-destructive">
                    {resetForm.formState.errors.confirmPassword.message}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
                data-testid="button-reset-password"
              >
                {isLoading ? "Resetting..." : "Reset Password"}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
