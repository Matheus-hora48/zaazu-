"use client";

import { useState, useEffect, useCallback } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { userService } from "@/lib/services";
import { User } from "@/lib/types";
import {
  Users,
  Search,
  Eye,
  Edit,
  Shield,
  Calendar,
  Clock,
  Mail,
  UserCheck,
  UserX,
  Crown,
  Activity,
  Plus,
  Key,
} from "lucide-react";
import { AddUserModal } from "@/components/modals/add-user-modal";
import { ResetPasswordModal } from "@/components/modals/reset-password-modal";
import { ViewUserModal } from "@/components/modals/view-user-modal";
import { EditUserModal } from "@/components/modals/edit-user-modal";
import { logAdminAction } from "@/lib/logging";
import { useAuth } from "@/lib/auth-context";

export default function UsuariosPage() {
  const { user: currentAdmin } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [isResetPasswordModalOpen, setIsResetPasswordModalOpen] =
    useState(false);
  const [isViewUserModalOpen, setIsViewUserModalOpen] = useState(false);
  const [isEditUserModalOpen, setIsEditUserModalOpen] = useState(false);
  const [selectedUserEmail, setSelectedUserEmail] = useState("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const loadUsers = useCallback(async () => {
    try {
      setLoading(true);
      const usersData = await userService.getAll();
      setUsers(usersData);

      // Log do carregamento da página de usuários
      await logAdminAction({
        action: "users_page_accessed",
        details: `Página de usuários acessada - ${usersData.length} usuários carregados`,
        admin: currentAdmin?.email || "unknown",
        level: "info",
        metadata: {
          usersCount: usersData.length,
          adminUsers: usersData.filter((u) => u.role === "admin").length,
          regularUsers: usersData.filter((u) => u.role === "user").length,
          timestamp: new Date().toISOString(),
        },
      });
    } catch (error) {
      console.error("Error loading users:", error);

      // Log do erro no carregamento
      await logAdminAction({
        action: "users_load_failed",
        details: `Falha ao carregar página de usuários - ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
        admin: currentAdmin?.email || "unknown",
        level: "error",
        metadata: {
          error: error instanceof Error ? error.message : "Unknown error",
          timestamp: new Date().toISOString(),
        },
      });
    } finally {
      setLoading(false);
    }
  }, [currentAdmin?.email]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const filteredUsers = users.filter(
    (user) =>
      (user.name?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
      (user.email?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
      (user.role?.toLowerCase().includes(searchTerm.toLowerCase()) || false)
  );

  const handleToggleRole = async (
    userId: string,
    currentRole: "admin" | "user"
  ) => {
    const newRole = currentRole === "admin" ? "user" : "admin";
    const confirmMessage = `Tem certeza que deseja ${
      newRole === "admin"
        ? "promover este usuário a administrador"
        : "remover privilégios de administrador deste usuário"
    }?`;

    if (confirm(confirmMessage)) {
      try {
        const user = users.find((u) => u.id === userId);
        await userService.update(userId, { role: newRole });

        // Log da mudança de role
        await logAdminAction({
          action:
            newRole === "admin"
              ? "user_promoted_to_admin"
              : "admin_demoted_to_user",
          details: `Role alterado: ${user?.name} (${user?.email}) de ${currentRole} para ${newRole}`,
          admin: currentAdmin?.email || "unknown",
          level: "warning",
          metadata: {
            userId: userId,
            userName: user?.name || "unknown",
            userEmail: user?.email || "unknown",
            previousRole: currentRole,
            newRole: newRole,
            timestamp: new Date().toISOString(),
          },
        });

        loadUsers();
      } catch (error) {
        console.error("Error updating user role:", error);

        // Log do erro na mudança de role
        await logAdminAction({
          action: "user_role_update_failed",
          details: `Falha ao alterar role do usuário ${userId} - ${
            error instanceof Error ? error.message : "Unknown error"
          }`,
          admin: currentAdmin?.email || "unknown",
          level: "error",
          metadata: {
            userId: userId,
            currentRole: currentRole,
            attemptedRole: newRole,
            error: error instanceof Error ? error.message : "Unknown error",
            timestamp: new Date().toISOString(),
          },
        });

        alert("Erro ao atualizar função do usuário");
      }
    }
  };

  const handleViewUser = (user: User) => {
    setSelectedUser(user);
    setIsViewUserModalOpen(true);
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setIsEditUserModalOpen(true);
  };

  const adminUsers = users.filter((user) => user.role === "admin");
  const regularUsers = users.filter((user) => user.role === "user");
  const recentUsers = users.filter((user) => {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    return new Date(user.createdAt) > oneWeekAgo;
  });

  const getInitials = (name: string | undefined) => {
    if (!name) return "??";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getLastLoginText = (lastLogin?: Date) => {
    if (!lastLogin) return "Nunca fez login";

    const now = new Date();
    const diffTime = Math.abs(now.getTime() - lastLogin.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return "Hoje";
    if (diffDays <= 7) return `${diffDays} dias atrás`;
    if (diffDays <= 30) return `${Math.ceil(diffDays / 7)} semanas atrás`;
    return `${Math.ceil(diffDays / 30)} meses atrás`;
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Gerenciar Usuários
            </h1>
            <p className="text-gray-600 mt-1">
              Administração de usuários e controle de acesso
            </p>
          </div>
          <Button
            onClick={() => setIsAddUserModalOpen(true)}
            className="bg-gradient-to-r from-green-600 to-orange-600 hover:from-green-700 hover:to-green-700"
          >
            <Plus className="h-4 w-4" />
            <span>Adicionar Usuário</span>
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Users className="h-8 w-8 text-blue-500" />
                <div>
                  <p className="text-2xl text-gray-700 font-bold">
                    {users.length}
                  </p>
                  <p className="text-sm text-gray-600">Total de Usuários</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Shield className="h-8 w-8 text-purple-500" />
                <div>
                  <p className="text-2xl text-gray-700 font-bold">
                    {adminUsers.length}
                  </p>
                  <p className="text-sm text-gray-600">Administradores</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <UserCheck className="h-8 w-8 text-green-500" />
                <div>
                  <p className="text-2xl text-gray-700 font-bold">
                    {regularUsers.length}
                  </p>
                  <p className="text-sm text-gray-600">Usuários Regulares</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Activity className="h-8 w-8 text-orange-500" />
                <div>
                  <p className="text-2xl text-gray-700 font-bold">
                    {recentUsers.length}
                  </p>
                  <p className="text-sm text-gray-600">Novos (7 dias)</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar usuários por nome, email ou função..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Users Table */}
        {loading ? (
          <Card>
            <CardContent className="p-8">
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gray-200 rounded-full animate-pulse" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded animate-pulse w-1/4" />
                      <div className="h-3 bg-gray-200 rounded animate-pulse w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ) : filteredUsers.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {searchTerm
                  ? "Nenhum usuário encontrado"
                  : "Nenhum usuário cadastrado"}
              </h3>
              <p className="text-gray-600">
                {searchTerm
                  ? "Tente buscar por outros termos."
                  : "Os usuários aparecerão aqui quando se cadastrarem na plataforma."}
              </p>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="text-left p-4 font-medium text-gray-900">
                        Usuário
                      </th>
                      <th className="text-left p-4 font-medium text-gray-900">
                        Função
                      </th>
                      <th className="text-left p-4 font-medium text-gray-900">
                        Data de Cadastro
                      </th>
                      <th className="text-left p-4 font-medium text-gray-900">
                        Último Login
                      </th>
                      <th className="text-left p-4 font-medium text-gray-900">
                        Ações
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredUsers.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50">
                        <td className="p-4">
                          <div className="flex items-center space-x-3">
                            <div
                              className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-medium ${
                                user.role === "admin"
                                  ? "bg-purple-500"
                                  : "bg-blue-500"
                              }`}
                            >
                              {getInitials(user.name)}
                            </div>
                            <div>
                              <div className="flex items-center space-x-2">
                                <p className="font-medium text-gray-900">
                                  {user.name}
                                </p>
                                {user.role === "admin" && (
                                  <Crown className="h-4 w-4 text-green-500" />
                                )}
                              </div>
                              <p className="text-sm text-gray-500 flex items-center">
                                <Mail className="h-3 w-3 mr-1" />
                                {user.email}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              user.role === "admin"
                                ? "bg-purple-100 text-purple-800"
                                : "bg-blue-100 text-blue-800"
                            }`}
                          >
                            {user.role === "admin" ? (
                              <>
                                <Shield className="h-3 w-3 mr-1" />
                                Administrador
                              </>
                            ) : (
                              <>
                                <UserCheck className="h-3 w-3 mr-1" />
                                Usuário
                              </>
                            )}
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center text-sm text-gray-500">
                            <Calendar className="h-3 w-3 mr-1" />
                            {new Date(user.createdAt).toLocaleDateString(
                              "pt-BR"
                            )}
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center text-sm text-gray-500">
                            <Clock className="h-3 w-3 mr-1" />
                            {getLastLoginText(user.lastLogin)}
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleViewUser(user)}
                              className="text-purple-600 hover:text-purple-700"
                            >
                              <Eye className="h-3 w-3 mr-1" />
                              Ver
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditUser(user)}
                              className="text-green-600 hover:text-green-700"
                            >
                              <Edit className="h-3 w-3 mr-1" />
                              Editar
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedUserEmail(user.email);
                                setIsResetPasswordModalOpen(true);
                              }}
                              className="text-blue-600 hover:text-blue-700"
                            >
                              <Key className="h-3 w-3 mr-1" />
                              Redefinir Senha
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                handleToggleRole(user.id, user.role)
                              }
                              className={
                                user.role === "admin"
                                  ? "text-orange-600 hover:text-orange-700"
                                  : "text-purple-600 hover:text-purple-700"
                              }
                            >
                              {user.role === "admin" ? (
                                <>
                                  <UserX className="h-3 w-3 mr-1" />
                                  Remover Admin
                                </>
                              ) : (
                                <>
                                  <Shield className="h-3 w-3 mr-1" />
                                  Tornar Admin
                                </>
                              )}
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Modais */}
      <AddUserModal
        isOpen={isAddUserModalOpen}
        onClose={() => setIsAddUserModalOpen(false)}
        onSuccess={loadUsers}
      />

      <ResetPasswordModal
        isOpen={isResetPasswordModalOpen}
        onClose={() => setIsResetPasswordModalOpen(false)}
        userEmail={selectedUserEmail}
      />

      <ViewUserModal
        isOpen={isViewUserModalOpen}
        onClose={() => setIsViewUserModalOpen(false)}
        user={selectedUser}
      />

      <EditUserModal
        isOpen={isEditUserModalOpen}
        onClose={() => setIsEditUserModalOpen(false)}
        onSuccess={loadUsers}
        user={selectedUser}
      />
    </DashboardLayout>
  );
}
