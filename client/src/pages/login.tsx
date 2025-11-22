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
import { Logo } from "@/components/logo";

const loginSchema = z.object({
  loginId: z.string().min(1, "Login ID is required"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function Login() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  // Redirect to dashboard if already logged in
  useEffect(() => {
    const user = localStorage.getItem("user");
    if (user) {
      setLocation("/dashboard");
    }
  }, [setLocation]);
  
  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      loginId: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Login failed");
      }

      const result = await response.json();
      
      // Store user in localStorage for simple auth management
      localStorage.setItem("user", JSON.stringify(result.user));
      
      toast({
        title: "Login successful",
        description: "Welcome to StockMaster",
      });
      
      setLocation("/dashboard");
    } catch (error) {
      toast({
        title: "Login failed",
        description: error instanceof Error ? error.message : "Invalid credentials. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-4 text-center">
          <div className="flex justify-center">
            <Logo className="h-16 w-16" />
          </div>
          <div>
            <CardTitle className="text-2xl font-semibold text-blue-600">StockMaster</CardTitle>
            <CardDescription className="text-sm mt-2">
              Sign in to your account to continue
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="loginId">Login ID</Label>
              <Input
                id="loginId"
                data-testid="input-login-id"
                type="text"
                {...form.register("loginId")}
                className={form.formState.errors.loginId ? "border-destructive" : ""}
              />
              {form.formState.errors.loginId && (
                <p className="text-xs text-destructive">
                  {form.formState.errors.loginId.message}
                </p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                data-testid="input-password"
                type="password"
                {...form.register("password")}
                className={form.formState.errors.password ? "border-destructive" : ""}
              />
              {form.formState.errors.password && (
                <p className="text-xs text-destructive">
                  {form.formState.errors.password.message}
                </p>
              )}
            </div>

            <div className="flex items-center justify-between">
              <Button
                type="button"
                variant="link"
                className="px-0 text-sm"
                onClick={() => setLocation("/forgot-password")}
                data-testid="link-forgot-password"
              >
                Forgot Password?
              </Button>
              <Button
                type="button"
                variant="link"
                className="px-0 text-sm"
                onClick={() => setLocation("/signup")}
                data-testid="link-signup"
              >
                Sign Up
              </Button>
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
              data-testid="button-sign-in"
            >
              {isLoading ? "Signing in..." : "SIGN IN"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
