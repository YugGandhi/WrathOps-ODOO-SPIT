import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { TopBar } from "@/components/top-bar";

// Auth pages
import Login from "@/pages/login";
import Signup from "@/pages/signup";
import ForgotPassword from "@/pages/forgot-password";

// Main pages
import Dashboard from "@/pages/dashboard";
import Inventory from "@/pages/inventory";
import ProductDetails from "@/pages/product-details";
import ProductForm from "@/pages/product-form";
import Manufacturing from "@/pages/manufacturing";
import ManufacturingDetails from "@/pages/manufacturing-details";
import ManufacturingForm from "@/pages/manufacturing-form";
import StockMoves from "@/pages/stock-moves";
import StockMoveForm from "@/pages/stock-move-form";
import Purchase from "@/pages/purchase";
import PurchaseOrderForm from "@/pages/purchase-form";
import Sales from "@/pages/sales";
import SalesOrderForm from "@/pages/sales-form";
import Contacts from "@/pages/contacts";
import Settings from "@/pages/settings";
import NotFound from "@/pages/not-found";

function AuthRouter() {
  return (
    <Switch>
      <Route path="/login" component={Login} />
      <Route path="/signup" component={Signup} />
      <Route path="/forgot-password" component={ForgotPassword} />
      <Route path="/">
        <Redirect to="/login" />
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function AppRouter() {
  return (
    <Switch>
      <Route path="/dashboard" component={Dashboard} />
      
      {/* Inventory routes */}
      <Route path="/inventory" component={Inventory} />
      <Route path="/inventory/new" component={ProductForm} />
      <Route path="/inventory/:id/edit" component={ProductForm} />
      <Route path="/inventory/:id" component={ProductDetails} />
      
      {/* Manufacturing routes */}
      <Route path="/manufacturing" component={Manufacturing} />
      <Route path="/manufacturing/new" component={ManufacturingForm} />
      <Route path="/manufacturing/:id" component={ManufacturingDetails} />
      
      {/* Stock moves */}
      <Route path="/stock-moves" component={StockMoves} />
      <Route path="/stock-moves/new" component={StockMoveForm} />
      
      {/* Purchase */}
      <Route path="/purchase" component={Purchase} />
      <Route path="/purchase/new" component={PurchaseOrderForm} />
      
      {/* Sales */}
      <Route path="/sales" component={Sales} />
      <Route path="/sales/new" component={SalesOrderForm} />
      
      {/* Contacts */}
      <Route path="/contacts" component={Contacts} />
      
      {/* Settings */}
      <Route path="/settings" component={Settings} />
      
      {/* Default redirect */}
      <Route path="/">
        <Redirect to="/dashboard" />
      </Route>
      
      {/* 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function MainLayout() {
  const style = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  };

  return (
    <SidebarProvider style={style as React.CSSProperties}>
      <div className="flex h-screen w-full overflow-hidden">
        <AppSidebar />
        <div className="flex flex-col flex-1 overflow-hidden">
          <TopBar />
          <main className="flex-1 overflow-auto">
            <AppRouter />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

function App() {
  // Simple auth check - in production this would check actual auth state
  // For now, we'll route based on path
  const isAuthPath = window.location.pathname.match(/^\/(login|signup|forgot-password)/);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        {isAuthPath ? <AuthRouter /> : <MainLayout />}
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
