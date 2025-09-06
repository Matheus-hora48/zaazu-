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
import { X, UserPlus, Eye, EyeOff } from "lucide-react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, Timestamp } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { useAdminLogging } from "@/lib/use-admin-logging";

interface AddUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function AddUserModal({
  isOpen,
  onClose,
  onSuccess,
}: AddUserModalProps) {
  const { logCreate, logError } = useAdminLogging();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "user" as "admin" | "user",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Validações
    if (formData.password !== formData.confirmPassword) {
      setError("As senhas não coincidem.");
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres.");
      setLoading(false);
      return;
    }

    try {
      // Criar usuário no Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );

      // Salvar dados adicionais no Firestore
      await setDoc(doc(db, "users", userCredential.user.uid), {
        name: formData.name,
        email: formData.email,
        role: formData.role,
        createdAt: Timestamp.now(),
        lastLogin: null,
      });

      // Log da criação do usuário
      await logCreate("user", formData.name, userCredential.user.uid, {
        userEmail: formData.email,
        userRole: formData.role,
      });

      onSuccess();
      onClose();
      resetForm();
    } catch (error: unknown) {
      console.error("Error creating user:", error);

      // Log do erro na criação
      await logError(
        "user_creation",
        `Falha ao criar usuário: ${formData.email}`,
        error,
        {
          attemptedEmail: formData.email,
          attemptedName: formData.name,
          attemptedRole: formData.role,
        }
      );

      // Tratar erros específicos do Firebase
      const firebaseError = error as { code?: string };
      switch (firebaseError.code) {
        case "auth/email-already-in-use":
          setError("Este email já está em uso.");
          break;
        case "auth/invalid-email":
          setError("Email inválido.");
          break;
        case "auth/weak-password":
          setError("A senha é muito fraca.");
          break;
        default:
          setError("Erro ao criar usuário. Tente novamente.");
      }
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      role: "user",
    });
    setShowPassword(false);
    setShowConfirmPassword(false);
    setError("");
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <Card className="bg-white w-full max-w-md max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center text-gray-800">
              <UserPlus className="mr-2 h-5 w-5" />
              Adicionar Novo Usuário
            </CardTitle>
            <CardDescription className="text-gray-600">
              Crie uma conta para um novo usuário
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
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-800">Senha</label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  placeholder="Digite a senha"
                  required
                  minLength={6}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <p className="text-xs text-gray-500">Mínimo de 6 caracteres</p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-800">
                Confirmar Senha
              </label>
              <div className="relative">
                <Input
                  type={showConfirmPassword ? "text" : "password"}
                  value={formData.confirmPassword}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      confirmPassword: e.target.value,
                    })
                  }
                  placeholder="Confirme a senha"
                  required
                  minLength={6}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
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
                Administradores têm acesso completo ao sistema
              </p>
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button
                type="button"
                variant="outline"
                className="border border-gray-300 text-gray-700 hover:bg-gray-100"
                onClick={handleClose}
                disabled={loading}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="bg-gradient-to-r from-green-600 to-orange-600 hover:from-green-700 hover:to-green-700"
              >
                {loading ? "Criando..." : "Criar Usuário"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
