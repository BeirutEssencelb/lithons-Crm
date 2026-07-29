import {
  Users,
  Package,
  ShoppingCart,
  UserCheck,
  LayoutDashboard,
  Settings,
  type LucideIcon,
} from "lucide-react";

export const LEAD_STATUSES = ["active", "won", "lost"] as const;

export interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
}

/** Full sidebar nav */
export const NAV_ITEMS: NavItem[] = [
  { title: "Dashboard", href: "/", icon: LayoutDashboard },
  { title: "Leads", href: "/leads", icon: Users },
  { title: "Clients", href: "/clients", icon: UserCheck },
  { title: "Inventory", href: "/inventory", icon: Package },
  { title: "Orders", href: "/orders", icon: ShoppingCart },
];

/** Compact mobile bottom bar (no Dashboard — use logo) */
export const MOBILE_NAV_ITEMS: NavItem[] = [
  { title: "Leads", href: "/leads", icon: Users },
  { title: "Clients", href: "/clients", icon: UserCheck },
  { title: "Stock", href: "/inventory", icon: Package },
  { title: "Orders", href: "/orders", icon: ShoppingCart },
];

export const SECONDARY_NAV_ITEMS: NavItem[] = [
  { title: "Settings", href: "/settings", icon: Settings },
];

export const COMPANY_NAME = "LITHOS CRM";
export const COMPANY_ADDRESS = "123 Stone Avenue, Denver, CO 80202";
