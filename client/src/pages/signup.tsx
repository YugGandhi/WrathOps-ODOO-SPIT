import { useState } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Package, Check, X } from "lucide-react";

const signupSchema = z.object({
  loginId: z.string().min(1, "Login ID is required"),
  email: z.string().email("Invalid email format"),
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Must contain uppercase letter")
    .regex(/[a-z]/, "Must contain lowercase letter")
    .regex(/[0-9]/, "Must contain number")
    .regex(/[^A-Za-z0-9]/, "Must contain special character"),
  confirmPassword: z.string().min(1, "Please confirm your password"),
  role: z.enum(["Inventory Manager", "Warehouse Staff"], {
    required_error: "Please select a role",
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type SignupFormData = z.infer<typeof signupSchema>;

export default function Signup() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  
  const form = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      loginId: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const password = form.watch("password");
  const passwordRequirements = [
    { label: "At least 8 characters", met: password.length >= 8 },
    { label: "Uppercase letter", met: /[A-Z]/.test(password) },
    { label: "Lowercase letter", met: /[a-z]/.test(password) },
    { label: "Number", met: /[0-9]/.test(password) },
    { label: "Special character", met: /[^A-Za-z0-9]/.test(password) },
  ];

  const onSubmit = async (data: SignupFormData) => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Signup failed");
      }
      
      toast({
        title: "Account created successfully",
        description: "Please login with your credentials",
      });
      
      setLocation("/login");
    } catch (error) {
      toast({
        title: "Signup failed",
        description: error instanceof Error ? error.message : "An error occurred. Please try again.",
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
            <div className="w-12 h-12 rounded-md bg-primary flex items-center justify-center">
              <Package className="w-6 h-6 text-primary-foreground" />
            </div>
          </div>
          <div>
            <CardTitle className="text-2xl font-semibold">Create Account</CardTitle>
            <CardDescription className="text-sm mt-2">
              Sign up for StockMaster
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="loginId">Login ID</Label>
              <Input
                id="loginId"
                data-testid="input-signup-login-id"
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
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                data-testid="input-email"
                type="email"
                {...form.register("email")}
                className={form.formState.errors.email ? "border-destructive" : ""}
              />
              {form.formState.errors.email && (
                <p className="text-xs text-destructive">
                  {form.formState.errors.email.message}
                </p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                data-testid="input-signup-password"
                type="password"
                {...form.register("password")}
                className={form.formState.errors.password ? "border-destructive" : ""}
              />
              {password && (
                <div className="space-y-1 mt-2">
                  {passwordRequirements.map((req, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs">
                      {req.met ? (
                        <Check className="w-3 h-3 text-green-600" />
                      ) : (
                        <X className="w-3 h-3 text-muted-foreground" />
                      )}
                      <span className={req.met ? "text-green-600" : "text-muted-foreground"}>
                        {req.label}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                data-testid="input-confirm-password"
                type="password"
                {...form.register("confirmPassword")}
                className={form.formState.errors.confirmPassword ? "border-destructive" : ""}
              />
              {form.formState.errors.confirmPassword && (
                <p className="text-xs text-destructive">
                  {form.formState.errors.confirmPassword.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select
                onValueChange={(value) => form.setValue("role", value as "Inventory Manager" | "Warehouse Staff")}
              >
                <SelectTrigger data-testid="select-role">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Inventory Manager">Inventory Manager</SelectItem>
                  <SelectItem value="Warehouse Staff">Warehouse Staff</SelectItem>
                </SelectContent>
              </Select>
              {form.formState.errors.role && (
                <p className="text-xs text-destructive">
                  {form.formState.errors.role.message}
                </p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
              data-testid="button-sign-up"
            >
              {isLoading ? "Creating account..." : "SIGN UP"}
            </Button>

            <div className="text-center">
              <Button
                type="button"
                variant="link"
                className="text-sm"
                onClick={() => setLocation("/login")}
                data-testid="link-login"
              >
                Already have an account? Sign in
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
