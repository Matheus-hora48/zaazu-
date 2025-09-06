"use client";

import { AdminGuard } from "@/components/auth/admin-guard";
import { Sidebar } from "./sidebar";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <AdminGuard>
      <div className="min-h-screen bg-gray-50 flex">
        <Sidebar />
        <div className="flex-1 overflow-hidden">
          <main className="p-6 lg:p-8 h-full overflow-auto">{children}</main>
        </div>
      </div>
    </AdminGuard>
  );
}
