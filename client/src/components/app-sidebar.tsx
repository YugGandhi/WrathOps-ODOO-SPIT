import { useLocation } from "wouter";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  LayoutDashboard,
  Package,
  Factory,
  ArrowRightLeft,
  ShoppingCart,
  ShoppingBag,
  Users,
  Settings,
  ChevronUp,
  User2,
  LogOut,
} from "lucide-react";

// Mock user - will be replaced with actual auth context
const mockUser = {
  name: "Admin User",
  email: "admin@stockmaster.com",
  role: "Inventory Manager" as const,
};

const navigationItems = [
  {
    title: "Dashboard",
    icon: LayoutDashboard,
    url: "/dashboard",
    roles: ["Inventory Manager", "Warehouse Staff"],
  },
  {
    title: "Inventory",
    icon: Package,
    url: "/inventory",
    roles: ["Inventory Manager", "Warehouse Staff"],
  },
  {
    title: "Manufacturing",
    icon: Factory,
    url: "/manufacturing",
    roles: ["Inventory Manager", "Warehouse Staff"],
  },
  {
    title: "Stock Move",
    icon: ArrowRightLeft,
    url: "/stock-moves",
    roles: ["Inventory Manager", "Warehouse Staff"],
  },
  {
    title: "Purchase",
    icon: ShoppingCart,
    url: "/purchase",
    roles: ["Inventory Manager"],
  },
  {
    title: "Sales",
    icon: ShoppingBag,
    url: "/sales",
    roles: ["Inventory Manager"],
  },
  {
    title: "Contacts",
    icon: Users,
    url: "/contacts",
    roles: ["Inventory Manager", "Warehouse Staff"],
  },
  {
    title: "Settings",
    icon: Settings,
    url: "/settings",
    roles: ["Inventory Manager"],
  },
];

export function AppSidebar() {
  const [location, setLocation] = useLocation();

  // Filter navigation based on user role
  const visibleItems = navigationItems.filter((item) =>
    item.roles.includes(mockUser.role)
  );

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-lg font-semibold px-4 py-3">
            StockMaster
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {visibleItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={location === item.url}
                    data-testid={`nav-${item.title.toLowerCase().replace(/\s+/g, "-")}`}
                  >
                    <a href={item.url} onClick={(e) => {
                      e.preventDefault();
                      setLocation(item.url);
                    }}>
                      <item.icon className="w-5 h-5" />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton data-testid="button-user-menu">
                  <User2 className="w-5 h-5" />
                  <div className="flex flex-col items-start flex-1 min-w-0">
                    <span className="text-sm font-medium truncate">{mockUser.name}</span>
                    <span className="text-xs text-muted-foreground truncate">{mockUser.role}</span>
                  </div>
                  <ChevronUp className="w-4 h-4 ml-auto" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent side="top" className="w-56">
                <DropdownMenuItem
                  onClick={() => setLocation("/profile")}
                  data-testid="menu-profile"
                >
                  <User2 className="w-4 h-4 mr-2" />
                  My Profile
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setLocation("/login")}
                  data-testid="menu-logout"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
