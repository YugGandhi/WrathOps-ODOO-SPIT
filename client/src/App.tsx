import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { TopBar } from "@/components/top-bar";

import Login from "@/pages/login";
import Signup from "@/pages/signup";
import ForgotPassword from "@/pages/forgot-password";
import Dashboard from "@/pages/dashboard";
import Inventory from "@/pages/inventory";
import ProductDetails from "@/pages/product-details";
import ProductForm from "@/pages/product-form";
import Manufacturing from "@/pages/manufacturing";
import ManufacturingDetails from "@/pages/manufacturing-details";
import StockMoves from "@/pages/stock-moves";
import Purchase from "@/pages/purchase";
import Sales from "@/pages/sales";
import Contacts from "@/pages/contacts";
import Settings from "@/pages/settings";
import NotFound from "@/pages/not-found";

function ProtectedRoute({ component: Component, ...rest }: { component: React.ComponentType; path?: string }) {
  const userId = localStorage.getItem("userId");
  
  if (!userId) {
    return <Redirect to="/login" />;
  }
  
  return <Component {...rest} />;
}

function AuthRoute({ component: Component, ...rest }: { component: React.ComponentType; path?: string }) {
  const userId = localStorage.getItem("userId");
  
  if (userId) {
    return <Redirect to="/dashboard" />;
  }
  
  return <Component {...rest} />;
}

function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
  const style = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  };

  return (
    <SidebarProvider style={style as React.CSSProperties}>
      <div className="flex h-screen w-full">
        <AppSidebar />
        <div className="flex flex-col flex-1 overflow-hidden">
          <TopBar />
          <main className="flex-1 overflow-hidden">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/login" component={() => <AuthRoute component={Login} />} />
      <Route path="/signup" component={() => <AuthRoute component={Signup} />} />
      <Route path="/forgot-password" component={() => <AuthRoute component={ForgotPassword} />} />
      
      <Route path="/">
        <Redirect to="/dashboard" />
      </Route>
      
      <Route path="/dashboard">
        <AuthenticatedLayout>
          <ProtectedRoute component={Dashboard} />
        </AuthenticatedLayout>
      </Route>
      
      <Route path="/inventory">
        <AuthenticatedLayout>
          <ProtectedRoute component={Inventory} />
        </AuthenticatedLayout>
      </Route>
      
      <Route path="/inventory/new">
        <AuthenticatedLayout>
          <ProtectedRoute component={ProductForm} />
        </AuthenticatedLayout>
      </Route>
      
      <Route path="/inventory/:id">
        <AuthenticatedLayout>
          <ProtectedRoute component={ProductDetails} />
        </AuthenticatedLayout>
      </Route>
      
      <Route path="/inventory/:id/edit">
        <AuthenticatedLayout>
          <ProtectedRoute component={ProductForm} />
        </AuthenticatedLayout>
      </Route>
      
      <Route path="/manufacturing">
        <AuthenticatedLayout>
          <ProtectedRoute component={Manufacturing} />
        </AuthenticatedLayout>
      </Route>
      
      <Route path="/manufacturing/:id">
        <AuthenticatedLayout>
          <ProtectedRoute component={ManufacturingDetails} />
        </AuthenticatedLayout>
      </Route>
      
      <Route path="/stock-moves">
        <AuthenticatedLayout>
          <ProtectedRoute component={StockMoves} />
        </AuthenticatedLayout>
      </Route>
      
      <Route path="/purchase">
        <AuthenticatedLayout>
          <ProtectedRoute component={Purchase} />
        </AuthenticatedLayout>
      </Route>
      
      <Route path="/sales">
        <AuthenticatedLayout>
          <ProtectedRoute component={Sales} />
        </AuthenticatedLayout>
      </Route>
      
      <Route path="/contacts">
        <AuthenticatedLayout>
          <ProtectedRoute component={Contacts} />
        </AuthenticatedLayout>
      </Route>
      
      <Route path="/settings">
        <AuthenticatedLayout>
          <ProtectedRoute component={Settings} />
        </AuthenticatedLayout>
      </Route>
      
      <Route component={NotFound} />
    </Switch>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}
