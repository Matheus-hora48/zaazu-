"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { X, Key, Mail } from "lucide-react";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useAdminLogging } from "@/lib/use-admin-logging";

interface ResetPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  userEmail?: string;
}

export function ResetPasswordModal({
  isOpen,
  onClose,
  userEmail = "",
}: ResetPasswordModalProps) {
  const { logAction, logError } = useAdminLogging();
  const [email, setEmail] = useState(userEmail);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await sendPasswordResetEmail(auth, email);

      // Log do reset de senha bem-sucedido
      await logAction({
        action: "user_password_reset",
        details: `Reset de senha enviado para: ${email}`,
        level: "warning",
        metadata: {
          targetEmail: email,
          resetMethod: "email_link",
          timestamp: new Date().toISOString(),
        },
      });

      setSuccess(true);
    } catch (error: unknown) {
      console.error("Error sending password reset email:", error);

      // Log do erro no reset
      await logError(
        "password_reset",
        `Falha ao enviar reset de senha para: ${email}`,
        error,
        {
          targetEmail: email,
          resetMethod: "email_link",
        }
      );

      const firebaseError = error as { code?: string };
      switch (firebaseError.code) {
        case "auth/user-not-found":
          setError("Usuário não encontrado com este email.");
          break;
        case "auth/invalid-email":
          setError("Email inválido.");
          break;
        default:
          setError("Erro ao enviar email de redefinição. Tente novamente.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setEmail("");
    setSuccess(false);
    setError("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <Card className="bg-white w-full max-w-md">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center text-gray-800">
              <Key className="mr-2 h-5 w-5" />
              Redefinir Senha
            </CardTitle>
            <CardDescription className="text-gray-600">
              Envie um link de redefinição por email
            </CardDescription>
          </div>
          <Button variant="ghost" size="icon" onClick={handleClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>

        <CardContent>
          {success ? (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <Mail className="h-8 w-8 text-green-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Email Enviado!
                </h3>
                <p className="text-gray-600 mt-1">
                  Um link para redefinir a senha foi enviado para:
                </p>
                <p className="font-medium text-blue-600">{email}</p>
              </div>
              <p className="text-sm text-gray-500">
                Verifique sua caixa de entrada e spam. O link expira em 1 hora.
              </p>
              <Button onClick={handleClose} className="w-full">
                Fechar
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-800">
                  Email do Usuário
                </label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Digite o email do usuário"
                  required
                />
                <p className="text-xs text-gray-500">
                  O usuário receberá um link para criar uma nova senha
                </p>
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                  disabled={loading}
                  className="text-gray-700 hover:bg-gray-100 border-gray-300"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={loading || !email}
                  className="bg-gradient-to-r from-blue-600 to-blue-600 hover:from-blue-700 hover:to-blue-700"
                >
                  {loading ? "Enviando..." : "Enviar Link"}
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
