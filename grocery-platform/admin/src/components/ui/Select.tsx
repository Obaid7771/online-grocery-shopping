// src/components/ui/Select.tsx
import { cn } from "@/lib/utils";
import { SelectHTMLAttributes, forwardRef } from "react";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(({ className, label, error, options, id, ...props }, ref) => {
  return (
    <div className="space-y-1">
      {label && <label htmlFor={id} className="block text-sm font-medium text-gray-700">{label}</label>}
      <select
        id={id}
        ref={ref}
        className={cn(
          "w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 bg-white transition-shadow",
          error ? "border-red-400 focus:ring-red-400" : "border-gray-300 focus:ring-primary-500",
          className
        )}
        {...props}
      >
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
});
Select.displayName = "Select";
export default Select;
