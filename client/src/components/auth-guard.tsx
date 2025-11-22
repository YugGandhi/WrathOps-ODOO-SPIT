import { useEffect } from "react";
import { useLocation } from "wouter";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const [, setLocation] = useLocation();

  useEffect(() => {
    const user = localStorage.getItem("user");
    if (!user) {
      setLocation("/login");
    }
  }, [setLocation]);

  const user = localStorage.getItem("user");
  if (!user) {
    return null;
  }

  return <>{children}</>;
}

