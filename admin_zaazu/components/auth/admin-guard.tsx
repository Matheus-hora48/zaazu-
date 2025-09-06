"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

interface AdminGuardProps {
  children: React.ReactNode;
}

export function AdminGuard({ children }: AdminGuardProps) {
  const { user, loading, isAdmin } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        console.log(user);
        router.push("/login");
      } else if (!isAdmin) {
        router.push("/unauthorized");
      }
    }
  }, [user, loading, isAdmin, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return null;
  }

  return <>{children}</>;
}
/**
 * Para saber se seu usuário é admin, você pode verificar o valor da variável `isAdmin` retornada pelo hook `useAuth()`.
 * 
 * Exemplo de uso:
 * 
 * const { isAdmin } = useAuth();
 * 
 * if (isAdmin) {
 *   // O usuário é admin
 * } else {
 *   // O usuário não é admin
 * }
 * 
 * O valor de `isAdmin` depende de como você implementou o contexto de autenticação (`auth-context`). 
 * Normalmente, ele verifica uma propriedade do usuário, como `user.role === 'admin'`.
 */