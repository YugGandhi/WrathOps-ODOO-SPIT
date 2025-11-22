import { Switch, Route, Redirect, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { TopNav } from "@/components/top-nav";
import { AuthGuard } from "@/components/auth-guard";
import { useEffect } from "react";

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
import ReceiptDetails from "@/pages/receipt-details";
import Sales from "@/pages/sales";
import SalesOrderForm from "@/pages/sales-form";
import Delivery from "@/pages/delivery";
import DeliveryForm from "@/pages/delivery-form";
import DeliveryDetails from "@/pages/delivery-details";
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
    <AuthGuard>
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
      <Route path="/purchase/:id/edit" component={PurchaseOrderForm} />
      <Route path="/purchase/receipt/:id" component={ReceiptDetails} />
      
      {/* Sales */}
      <Route path="/sales" component={Sales} />
      <Route path="/sales/new" component={SalesOrderForm} />
      
      {/* Delivery */}
      <Route path="/delivery" component={Delivery} />
      <Route path="/delivery/new" component={DeliveryForm} />
      <Route path="/delivery/:id/edit" component={DeliveryForm} />
      <Route path="/delivery/:id" component={DeliveryDetails} />
      
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
    </AuthGuard>
  );
}

function MainLayout() {
  return (
    <div className="flex flex-col h-screen w-full overflow-hidden">
      <TopNav />
      <main className="flex-1 overflow-auto">
        <AppRouter />
      </main>
    </div>
  );
}

function App() {
  const [location] = useLocation();
  const isAuthPath = /^\/(login|signup|forgot-password)/.test(location);

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
