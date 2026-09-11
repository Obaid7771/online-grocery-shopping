// src/components/ui/StatCard.tsx
import { cn } from "@/lib/utils";
import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon: LucideIcon;
  iconColor?: string;
  iconBg?: string;
}

export default function StatCard({ title, value, change, icon: Icon, iconColor = "text-primary-600", iconBg = "bg-primary-50" }: StatCardProps) {
  const positive = change !== undefined && change >= 0;
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", iconBg)}>
          <Icon size={20} className={iconColor} />
        </div>
      </div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      {change !== undefined && (
        <div className={cn("flex items-center gap-1 mt-2 text-xs font-medium", positive ? "text-green-600" : "text-red-500")}>
          {positive ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
          <span>{Math.abs(change)}% vs last month</span>
        </div>
      )}
    </div>
  );
}
