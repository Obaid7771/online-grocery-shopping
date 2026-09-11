// src/components/ui/Spinner.tsx
import { Loader2 } from "lucide-react";

export default function Spinner({ size = 24, className = "" }: { size?: number; className?: string }) {
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <Loader2 size={size} className="animate-spin text-primary-500" />
    </div>
  );
}
