import { useState } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Package, ArrowLeft } from "lucide-react";

const emailSchema = z.object({
  email: z.string().email("Invalid email format"),
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
type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

export default function ForgotPassword() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [step, setStep] = useState<"email" | "otp" | "reset">("email");
  const [isLoading, setIsLoading] = useState(false);
  
  const emailForm = useForm<EmailFormData>({
    resolver: zodResolver(emailSchema),
    defaultValues: { email: "" },
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
      console.log("Email submitted:", data);
      await new Promise(resolve => setTimeout(resolve, 1000));
      setStep("otp");
      toast({
        title: "Email sent",
        description: "Please check your email for reset instructions",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send reset email",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const onOtpNext = () => {
    setStep("reset");
  };

  const onResetSubmit = async (data: ResetPasswordFormData) => {
    setIsLoading(true);
    try {
      console.log("Password reset:", data);
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast({
        title: "Password updated",
        description: "Your password has been successfully reset",
      });
      setLocation("/login");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to reset password",
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
                <div className="w-12 h-12 rounded-md bg-primary flex items-center justify-center">
                  <Package className="w-6 h-6 text-primary-foreground" />
                </div>
              </div>
              <CardTitle className="text-2xl font-semibold">Reset Password</CardTitle>
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
            <div className="space-y-4">
              <div className="p-4 bg-muted rounded-md text-center">
                <p className="text-sm text-muted-foreground">
                  We've sent a reset link to your email. Click the link to continue.
                </p>
              </div>
              <Button
                onClick={onOtpNext}
                className="w-full"
                data-testid="button-otp-next"
              >
                I've clicked the link
              </Button>
            </div>
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
