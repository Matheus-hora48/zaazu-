"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { X, User, Calendar, Mail, Shield, UserCheck } from "lucide-react";
import { User as UserType } from "@/lib/types";

interface ViewUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserType | null;
}

export function ViewUserModal({ isOpen, onClose, user }: ViewUserModalProps) {
  if (!isOpen || !user) return null;

  const formatDate = (
    timestamp: Date | { seconds: number } | null | undefined
  ) => {
    if (!timestamp) return "Data não disponível";

    if (timestamp instanceof Date) {
      return timestamp.toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    }

    if (typeof timestamp === "object" && "seconds" in timestamp) {
      return new Date(timestamp.seconds * 1000).toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    }

    return "Data inválida";
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <Card className="bg-white w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center text-gray-800">
              <User className="mr-2 h-5 w-5" />
              Detalhes do Usuário
            </CardTitle>
            <CardDescription className="text-gray-600">
              Informações completas do usuário
            </CardDescription>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* User Avatar and Basic Info */}
          <div className="flex items-center space-x-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
              <User className="h-8 w-8 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900">
                {user.name}
              </h3>
              <div className="flex items-center space-x-2 mt-1">
                <div
                  className={`w-3 h-3 rounded-full ${
                    user.role === "admin" ? "bg-purple-500" : "bg-blue-500"
                  }`}
                ></div>
                <p className="text-sm text-gray-600 capitalize">
                  {user.role === "admin" ? "Administrador" : "Usuário"}
                </p>
              </div>
            </div>
          </div>

          {/* User Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 flex items-center">
                  <User className="h-4 w-4 mr-2" />
                  Nome Completo
                </label>
                <p className="text-lg text-gray-900 mt-1">{user.name}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 flex items-center">
                  <Mail className="h-4 w-4 mr-2" />
                  Email
                </label>
                <p className="text-gray-900 mt-1">{user.email}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 flex items-center">
                  <Shield className="h-4 w-4 mr-2" />
                  Função
                </label>
                <div className="flex items-center space-x-2 mt-1">
                  {user.role === "admin" ? (
                    <>
                      <Shield className="h-4 w-4 text-purple-600" />
                      <span className="text-purple-600 font-medium">
                        Administrador
                      </span>
                    </>
                  ) : (
                    <>
                      <UserCheck className="h-4 w-4 text-blue-600" />
                      <span className="text-blue-600 font-medium">Usuário</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 flex items-center">
                  <Calendar className="h-4 w-4 mr-2" />
                  Data de Criação
                </label>
                <p className="text-gray-900 mt-1">
                  {formatDate(user.createdAt)}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 flex items-center">
                  <Calendar className="h-4 w-4 mr-2" />
                  Último Login
                </label>
                <p className="text-gray-900 mt-1">
                  {formatDate(user.lastLogin)}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-800">
                  ID do Usuário
                </label>
                <p className="text-xs text-gray-600 font-mono bg-gray-100 p-2 rounded mt-1">
                  {user.id}
                </p>
              </div>
            </div>
          </div>

          {/* User Permissions */}
          <div className="space-y-3">
            <h4 className="text-lg font-medium text-gray-900">Permissões</h4>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
                <div
                  className={`w-3 h-3 rounded-full ${
                    user.role === "admin" ? "bg-green-500" : "bg-gray-300"
                  }`}
                ></div>
                <span className="text-sm text-gray-800">
                  Gerenciar Usuários
                </span>
              </div>
              <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
                <div
                  className={`w-3 h-3 rounded-full ${
                    user.role === "admin" ? "bg-green-500" : "bg-gray-300"
                  }`}
                ></div>
                <span className="text-sm text-gray-800">
                  Gerenciar Conteúdo
                </span>
              </div>
              <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
                <div
                  className={`w-3 h-3 rounded-full ${
                    user.role === "admin" ? "bg-green-500" : "bg-gray-300"
                  }`}
                ></div>
                <span className="text-sm text-gray-800">
                  Configurações do Sistema
                </span>
              </div>
              <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span className="text-sm text-gray-800">Acesso ao App</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-2 pt-4 border-t">
            <Button
              onClick={onClose}
              className="text-purple-600 hover:text-purple-700"
            >
              Fechar
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
