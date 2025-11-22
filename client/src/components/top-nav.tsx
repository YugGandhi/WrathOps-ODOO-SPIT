import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  LayoutDashboard,
  Package,
  ArrowRightLeft,
  Settings,
  User2,
  LogOut,
  ChevronDown,
} from "lucide-react";
import { Logo } from "./logo";

const navigationItems = [
  {
    title: "Dashboard",
    url: "/dashboard",
  },
  {
    title: "Operations",
    url: "/operations",
    submenu: [
      { title: "Receipt", url: "/purchase" },
      { title: "Delivery", url: "/delivery" },
      { title: "Adjustment", url: "/stock-moves" },
    ],
  },
  {
    title: "Stock",
    url: "/inventory",
  },
  {
    title: "Move History",
    url: "/stock-moves",
  },
  {
    title: "Settings",
    url: "/settings",
  },
];

export function TopNav() {
  const [location, setLocation] = useLocation();

  return (
    <>
      <nav className="border-b bg-white dark:bg-slate-950" data-testid="top-nav">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2">
              <Logo className="h-8 w-8" />
              <h1 className="text-xl font-bold text-blue-600">StockMaster</h1>
            </div>
            <div className="flex items-center gap-6">
              {navigationItems.map((item) => (
                <div key={item.title}>
                  {item.submenu ? (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          className={`text-base font-medium flex items-center gap-1 ${
                            location.startsWith(item.url)
                              ? "text-blue-600"
                              : "text-gray-700 dark:text-gray-300"
                          }`}
                          data-testid={`nav-${item.title.toLowerCase()}`}
                        >
                          {item.title}
                          <ChevronDown className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        {item.submenu.map((subitem) => (
                          <DropdownMenuItem
                            key={subitem.title}
                            onClick={() => setLocation(subitem.url)}
                            data-testid={`nav-submenu-${subitem.title.toLowerCase()}`}
                          >
                            {subitem.title}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  ) : (
                    <Button
                      variant="ghost"
                      className={`text-base font-medium ${
                        location === item.url
                          ? "text-blue-600"
                          : "text-gray-700 dark:text-gray-300"
                      }`}
                      onClick={() => setLocation(item.url)}
                      data-testid={`nav-${item.title.toLowerCase()}`}
                    >
                      {item.title}
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              className="border-blue-600 text-blue-600 hover:bg-blue-50"
              onClick={() => setLocation("/dashboard")}
              data-testid="nav-dashboard-btn"
            >
              Dashboard
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" data-testid="nav-user-menu">
                  <User2 className="w-5 h-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem disabled>
                  <span className="text-sm">Admin User</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={async () => {
                  try {
                    await fetch("/api/auth/logout", { method: "POST" });
                    localStorage.removeItem("user");
                    setLocation("/login");
                  } catch (error) {
                    console.error("Logout error:", error);
                    localStorage.removeItem("user");
                    setLocation("/login");
                  }
                }}>
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </nav>

      {/* Operations submenu for quick access */}
      {location === "/operations" && (
        <div className="border-b bg-gray-50 dark:bg-slate-900 px-6 py-3" data-testid="operations-submenu">
          <div className="flex gap-4">
            <Button
              variant="ghost"
              onClick={() => setLocation("/purchase")}
              data-testid="submenu-receipt"
            >
              1. Receipt
            </Button>
            <Button
              variant="ghost"
              onClick={() => setLocation("/delivery")}
              data-testid="submenu-delivery"
            >
              2. Delivery
            </Button>
            <Button
              variant="ghost"
              onClick={() => setLocation("/stock-moves")}
              data-testid="submenu-adjustment"
            >
              3. Adjustment
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
