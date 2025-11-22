import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { useLogin } from "@/hooks/use-auth";

export default function Login() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const login = useLogin();
  const [loginId, setLoginId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!loginId || !password) {
      setError("Please enter both login ID and password");
      return;
    }

    try {
      const data = await login.mutateAsync({ loginId, password });
      localStorage.setItem("userId", data.userId);
      toast({
        title: "Login successful",
        description: "Welcome back to StockMaster!",
      });
      setLocation("/dashboard");
    } catch (err: any) {
      setError(err?.message || "Invalid credentials. Please try again.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-4 flex flex-col items-center">
          <div className="h-12 w-12 rounded-lg bg-primary flex items-center justify-center">
            <Package className="h-7 w-7 text-primary-foreground" />
          </div>
          <div className="space-y-2 text-center">
            <CardTitle className="text-2xl font-bold">StockMaster</CardTitle>
            <CardDescription>Sign in to your account</CardDescription>
          </div>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <div className="space-y-2">
              <Label htmlFor="loginId">Login ID</Label>
              <Input
                id="loginId"
                type="text"
                placeholder="Enter your login ID"
                value={loginId}
                onChange={(e) => setLoginId(e.target.value)}
                data-testid="input-login-id"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                data-testid="input-password"
              />
            </div>
            <div className="flex justify-end">
              <Link href="/forgot-password">
                <a className="text-sm text-primary hover:underline" data-testid="link-forgot-password">
                  Forgot Password?
                </a>
              </Link>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button 
              type="submit" 
              className="w-full" 
              disabled={login.isPending}
              data-testid="button-sign-in"
            >
              {login.isPending ? "Signing in..." : "SIGN IN"}
            </Button>
            <p className="text-sm text-center text-muted-foreground">
              Don't have an account?{" "}
              <Link href="/signup">
                <a className="text-primary hover:underline font-medium" data-testid="link-signup">
                  Sign Up
                </a>
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
