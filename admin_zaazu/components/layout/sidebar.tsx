"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Video,
  Gamepad2,
  BookOpen,
  Users,
  Settings,
  Menu,
  X,
  LogOut,
  Grid3x3,
} from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Vídeos", href: "/videos", icon: Video },
  { name: "Jogos", href: "/jogos", icon: Gamepad2 },
  { name: "Atividades", href: "/atividades", icon: BookOpen },
  { name: "Usuários", href: "/usuarios", icon: Users },
  { name: "Grades", href: "/grades", icon: Grid3x3 },
  { name: "Configurações", href: "/configuracoes", icon: Settings },
];

export function Sidebar() {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await logout();
      router.push("/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <>
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-purple-500"
        >
          {isMobileOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </button>
      </div>

      {/* Mobile menu overlay */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-gray-600 bg-opacity-75"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0",
          isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-center h-16 px-4 bg-gradient-to-r from-purple-600 to-pink-600">
            <h1 className="text-xl font-bold text-white">Zaazu Admin</h1>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors",
                    isActive
                      ? "bg-purple-50 text-purple-700 border-l-4 border-purple-600"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  )}
                  onClick={() => setIsMobileOpen(false)}
                >
                  <item.icon className="mr-3 h-5 w-5" />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* User section */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-white">
                  {user?.name?.charAt(0).toUpperCase() || "A"}
                </span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {user?.name || "Admin"}
                </p>
                <p className="text-xs text-gray-500">{user?.email}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center w-full px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <LogOut className="mr-3 h-4 w-4" />
              Sair
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
