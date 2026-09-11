"use client";
// src/components/layout/Sidebar.tsx
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard, ShoppingCart, Package, Users, Tag,
  Truck, FolderOpen, BarChart3, LogOut, ChevronRight, Store,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { adminLogout, getAdminUser, AdminUser } from "@/lib/auth";
import toast from "react-hot-toast";

const navItems = [
  { label: "Dashboard",   href: "/dashboard",   icon: LayoutDashboard },
  { label: "Orders",      href: "/orders",       icon: ShoppingCart },
  { label: "Products",    href: "/products",     icon: Package },
  { label: "Categories",  href: "/categories",   icon: FolderOpen },
  { label: "Inventory",   href: "/inventory",    icon: BarChart3 },
  { label: "Customers",   href: "/customers",    icon: Users },
  { label: "Coupons",     href: "/coupons",      icon: Tag },
  { label: "Delivery",    href: "/delivery",     icon: Truck },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<AdminUser | null>(null);
  const [mounted, setMounted] = useState(false);

  // Load user data only on client side to avoid hydration mismatch
  useEffect(() => {
    setUser(getAdminUser());
    setMounted(true);
  }, []);

  const handleLogout = () => {
    adminLogout();
    toast.success("Logged out");
    router.push("/login");
  };

  return (
    <aside className="w-64 min-h-screen bg-sidebar flex flex-col fixed left-0 top-0 z-30">
      {/* Brand */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-700">
        <div className="w-9 h-9 bg-primary-500 rounded-lg flex items-center justify-center">
          <Store size={20} className="text-white" />
        </div>
        <div>
          <p className="text-white font-semibold text-sm">FreshCart</p>
          <p className="text-gray-400 text-xs">Admin Panel</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map(({ label, href, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors group",
                active
                  ? "bg-primary-600 text-white"
                  : "text-gray-400 hover:bg-sidebar-hover hover:text-white"
              )}
            >
              <Icon size={18} className={cn(active ? "text-white" : "text-gray-400 group-hover:text-white")} />
              <span className="flex-1">{label}</span>
              {active && <ChevronRight size={14} className="text-white/70" />}
            </Link>
          );
        })}
      </nav>

      {/* User + Logout */}
      <div className="px-3 py-4 border-t border-gray-700">
        <div className="flex items-center gap-3 px-3 py-2 mb-2">
          <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center text-white text-xs font-semibold">
            {mounted && user ? `${user.firstName[0]}${user.lastName[0]}` : ""}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-xs font-medium truncate">{mounted && user ? `${user.firstName} ${user.lastName}` : ""}</p>
            <p className="text-gray-400 text-xs truncate">{mounted ? (user?.role ?? "") : ""}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-400 hover:bg-red-500/10 hover:text-red-400 transition-colors"
        >
          <LogOut size={16} />
          <span>Log out</span>
        </button>
      </div>
    </aside>
  );
}
