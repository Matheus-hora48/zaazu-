"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { userService } from "@/lib/services";
import { X, User, Save } from "lucide-react";
import { User as UserType } from "@/lib/types";
import { logAdminAction, LOG_ACTIONS } from "@/lib/logging";
import { useAuth } from "@/lib/auth-context";

interface EditUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  user: UserType | null;
}

export function EditUserModal({
  isOpen,
  onClose,
  onSuccess,
  user,
}: EditUserModalProps) {
  const { user: currentAdmin } = useAuth();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "user" as "admin" | "user",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name,
        email: user.email,
        role: user.role,
      });
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    setError("");

    // Criar objeto com mudanças para log
    const changes: Record<string, { old: string; new: string }> = {};
    if (formData.name !== user.name) {
      changes.name = { old: user.name, new: formData.name };
    }
    if (formData.email !== user.email) {
      changes.email = { old: user.email, new: formData.email };
    }
    if (formData.role !== user.role) {
      changes.role = { old: user.role, new: formData.role };
    }

    try {
      await userService.update(user.id, formData);

      // Log da atualização do usuário
      await logAdminAction({
        action: LOG_ACTIONS.ADMIN.USER_UPDATED,
        details: `Usuário atualizado: ${formData.name} (${formData.email})`,
        admin: currentAdmin?.email || "unknown",
        level: "info",
        metadata: {
          userId: user.id,
          userName: formData.name,
          userEmail: formData.email,
          changes: changes,
          fieldsChanged: Object.keys(changes),
          timestamp: new Date().toISOString(),
        },
      });

      onSuccess();
      onClose();
    } catch (error) {
      console.error("Error updating user:", error);

      // Log do erro na atualização
      await logAdminAction({
        action: "user_update_failed",
        details: `Falha ao atualizar usuário: ${user.name} (${user.email}) - ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
        admin: currentAdmin?.email || "unknown",
        level: "error",
        metadata: {
          userId: user.id,
          userName: user.name,
          userEmail: user.email,
          attemptedChanges: changes,
          error: error instanceof Error ? error.message : "Unknown error",
          timestamp: new Date().toISOString(),
        },
      });

      setError("Erro ao atualizar usuário. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setError("");
    onClose();
  };

  if (!isOpen || !user) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <Card className="bg-white w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center text-gray-800">
              <User className="mr-2 h-5 w-5" />
              Editar Usuário
            </CardTitle>
            <CardDescription className="text-gray-600">
              Atualize as informações do usuário
            </CardDescription>
          </div>
          <Button variant="ghost" size="icon" onClick={handleClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-800">
                Nome Completo
              </label>
              <Input
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Digite o nome completo"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-800">Email</label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                placeholder="Digite o email"
                required
              />
              <p className="text-xs text-gray-500">
                Alterar o email pode afetar o acesso do usuário
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-800">
                Função
              </label>
              <select
                className="flex h-10 w-full rounded-md border border-gray-300 bg-background px-3 py-2 text-sm text-gray-600 ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={formData.role}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    role: e.target.value as "admin" | "user",
                  })
                }
                required
              >
                <option value="user">Usuário</option>
                <option value="admin">Administrador</option>
              </select>
              <p className="text-xs text-gray-500">
                Administradores têm acesso total ao sistema
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 p-3 rounded">
              <p className="text-sm text-blue-700">
                <strong>Nota:</strong> Para alterar a senha do usuário, use a
                função &ldquo;Redefinir Senha&rdquo; na lista de usuários.
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
                disabled={loading}
                className="bg-gradient-to-r from-green-600 to-green-600 hover:from-green-700 hover:to-green-700"
              >
                <Save className="mr-2 h-4 w-4" />
                {loading ? "Salvando..." : "Salvar Alterações"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
