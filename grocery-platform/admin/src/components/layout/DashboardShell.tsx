// src/components/layout/DashboardShell.tsx
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

interface DashboardShellProps {
  title: string;
  children: React.ReactNode;
}

export default function DashboardShell({ title, children }: DashboardShellProps) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 ml-64 flex flex-col">
        <Topbar title={title} />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
