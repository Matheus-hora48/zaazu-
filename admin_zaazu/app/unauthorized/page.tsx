"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShieldX, ArrowLeft } from "lucide-react";
import { useAdminLogging } from "@/lib/use-admin-logging";
import { useEffect } from "react";

export default function UnauthorizedPage() {
  const { logAction } = useAdminLogging();

  useEffect(() => {
    // Log de acesso negado
    logAction({
      action: "unauthorized_access",
      details: "Tentativa de acesso não autorizado detectada",
      level: "warning",
      metadata: {
        page: "unauthorized",
        timestamp: new Date().toISOString(),
        userAgent:
          typeof window !== "undefined" ? navigator.userAgent : "unknown",
      },
    });
  }, [logAction]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-500 via-red-600 to-red-700 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-2xl border-0">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
            <ShieldX className="h-8 w-8 text-red-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            Acesso Negado
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-gray-600">
            Você não tem permissão para acessar esta área. Apenas
            administradores podem acessar o painel administrativo.
          </p>

          <div className="space-y-3">
            <Link href="/login">
              <Button className="w-full bg-red-600 hover:bg-red-700">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voltar ao Login
              </Button>
            </Link>
          </div>

          <p className="text-xs text-gray-500">
            Se você acredita que isso é um erro, entre em contato com o
            administrador do sistema.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
