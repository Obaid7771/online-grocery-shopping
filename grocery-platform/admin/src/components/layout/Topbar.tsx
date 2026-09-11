"use client";
// src/components/layout/Topbar.tsx
import { Bell, Search } from "lucide-react";
import { getAdminUser } from "@/lib/auth";

interface TopbarProps { title: string; }

export default function Topbar({ title }: TopbarProps) {
  const user = getAdminUser();
  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 sticky top-0 z-20">
      <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
      <div className="flex items-center gap-4">
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input
            className="pl-9 pr-4 py-2 text-sm bg-gray-100 rounded-lg border-0 focus:outline-none focus:ring-2 focus:ring-primary-500 w-56"
            placeholder="Search..."
          />
        </div>
        <button className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
          <Bell size={20} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
        </button>
        <div className="w-8 h-8 rounded-full bg-primary-500 flex items-center justify-center text-white text-xs font-semibold">
          {user ? `${user.firstName[0]}${user.lastName[0]}` : "A"}
        </div>
      </div>
    </header>
  );
}
