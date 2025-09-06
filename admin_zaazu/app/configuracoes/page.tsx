"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import {
  Settings,
  Save,
  Users,
  Bell,
  Shield,
  Database,
  Check,
  Globe,
  BookOpen,
  Clock,
  Download,
  AlertTriangle,
  CheckCircle,
  XCircle,
  User,
  Plus,
  Eye,
  Edit,
  Trash2,
  Award,
} from "lucide-react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import GoogleDriveSimpleConfig from "@/components/config/google-drive-simple-config";
import { AddAvatarModal } from "@/components/modals/add-avatar-modal";
import { ViewAvatarModal } from "@/components/modals/view-avatar-modal";
import { EditAvatarModal } from "@/components/modals/edit-avatar-modal";
import { DailyTimeLimitModal } from "@/components/modals/daily-time-limit-modal";
import AddAchievementModal from "@/components/modals/add-achievement-modal";
import EditAchievementModal from "@/components/modals/edit-achievement-modal";
import { useAdminLogging } from "@/lib/use-admin-logging";
import {
  loadSystemLogs,
  exportLogsToCSV,
  filterLogs,
  createSampleLogs,
  cleanOldLogs,
  type LogEntry,
} from "@/lib/logging";
import { useAppConfig } from "@/lib/use-app-config";
import { useSystemOperations } from "@/lib/use-system-operations";
import {
  avatarService,
  dailyTimeLimitService,
  achievementService,
} from "@/lib/services";
import { Avatar, DailyTimeLimit, Achievement } from "@/lib/types";

export default function ConfiguracoesPage() {
  const { logAction } = useAdminLogging();

  const {
    config,
    systemStatus,
    loading,
    saved,
    updateConfig,
    updateSystemStatus,
    saveConfigurations,
  } = useAppConfig();

  const {
    operationLoading,
    createBackup,
    clearCache,
    configureCDN,
    getSystemStats,
    checkSystemHealth,
    googleDrive,
  } = useSystemOperations();

  const [logsVisible, setLogsVisible] = useState(false);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [logsLoading, setLogsLoading] = useState(false);
  const [logFilter, setLogFilter] = useState<"all" | "admin" | "app">("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [systemStats, setSystemStats] = useState<Record<string, number>>({});
  const [systemHealth, setSystemHealth] = useState<{
    checks: Record<string, boolean>;
    healthScore: number;
    status: "healthy" | "warning" | "critical";
  } | null>(null);
  const [notification, setNotification] = useState<{
    type: "success" | "error" | "warning";
    message: string;
  } | null>(null);

  // Avatar states
  const [avatars, setAvatars] = useState<Avatar[]>([]);
  const [avatarsLoading, setAvatarsLoading] = useState(true);
  const [isAddAvatarModalOpen, setIsAddAvatarModalOpen] = useState(false);
  const [isViewAvatarModalOpen, setIsViewAvatarModalOpen] = useState(false);
  const [isEditAvatarModalOpen, setIsEditAvatarModalOpen] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState<Avatar | null>(null);

  // Daily Time Limit states
  const [dailyTimeLimits, setDailyTimeLimits] = useState<DailyTimeLimit[]>([]);
  const [timeLimitsLoading, setTimeLimitsLoading] = useState(true);
  const [isDailyTimeLimitModalOpen, setIsDailyTimeLimitModalOpen] =
    useState(false);

  // Achievement states
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [achievementsLoading, setAchievementsLoading] = useState(true);
  const [isAddAchievementModalOpen, setIsAddAchievementModalOpen] =
    useState(false);
  const [isEditAchievementModalOpen, setIsEditAchievementModalOpen] =
    useState(false);
  const [selectedAchievement, setSelectedAchievement] =
    useState<Achievement | null>(null);

  // Funções utilitárias
  const showNotification = (
    type: "success" | "error" | "warning",
    message: string
  ) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  };

  // Funções para gerenciar avatares
  const loadAvatars = async () => {
    try {
      setAvatarsLoading(true);
      const avatarsData = await avatarService.getAll();
      setAvatars(avatarsData);
    } catch (error) {
      console.error("Error loading avatars:", error);
      showNotification("error", "Erro ao carregar avatares");
    } finally {
      setAvatarsLoading(false);
    }
  };

  const handleAddAvatar = (newAvatar: Avatar) => {
    setAvatars([newAvatar, ...avatars]);
    showNotification("success", "Avatar adicionado com sucesso!");
  };

  const handleViewAvatar = (avatar: Avatar) => {
    setSelectedAvatar(avatar);
    setIsViewAvatarModalOpen(true);
  };

  const handleEditAvatar = (avatar: Avatar) => {
    setSelectedAvatar(avatar);
    setIsEditAvatarModalOpen(true);
  };

  const handleUpdateAvatar = (updatedAvatar: Avatar) => {
    setAvatars(
      avatars.map((a) => (a.id === updatedAvatar.id ? updatedAvatar : a))
    );
    showNotification("success", "Avatar atualizado com sucesso!");
  };

  const handleDeleteAvatar = async (avatarId: string) => {
    if (!confirm("Tem certeza que deseja excluir este avatar?")) return;

    try {
      await avatarService.delete(avatarId);
      setAvatars(avatars.filter((a) => a.id !== avatarId));
      showNotification("success", "Avatar excluído com sucesso!");
    } catch (error) {
      console.error("Error deleting avatar:", error);
      showNotification("error", "Erro ao excluir avatar");
    }
  };

  // Carregar avatares quando o componente monta
  useEffect(() => {
    loadAvatars();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Daily Time Limit functions
  const loadDailyTimeLimits = async () => {
    try {
      setTimeLimitsLoading(true);
      const limits = await dailyTimeLimitService.getAll();
      setDailyTimeLimits(limits);
    } catch (error) {
      console.error("Error loading daily time limits:", error);
      showNotification("error", "Erro ao carregar limites de tempo");
    } finally {
      setTimeLimitsLoading(false);
    }
  };

  const handleSaveTimeLimits = async (limits: {
    ageGroup2_6: DailyTimeLimit;
    ageGroup7_9: DailyTimeLimit;
  }) => {
    try {
      // Salvar ou atualizar para faixa 2-6
      await dailyTimeLimitService.createOrUpdate("2-6", limits.ageGroup2_6);
      // Salvar ou atualizar para faixa 7-9
      await dailyTimeLimitService.createOrUpdate("7-9", limits.ageGroup7_9);

      await loadDailyTimeLimits(); // Recarregar dados
      showNotification("success", "Limites de tempo configurados com sucesso!");
    } catch (error) {
      console.error("Error saving time limits:", error);
      showNotification("error", "Erro ao salvar limites de tempo");
    }
  };

  // Carregar time limits quando o componente monta
  useEffect(() => {
    loadDailyTimeLimits();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Achievement functions
  const loadAchievements = async () => {
    try {
      setAchievementsLoading(true);
      const fetchedAchievements = await achievementService.getAll();
      setAchievements(fetchedAchievements);
    } catch (error) {
      console.error("Error loading achievements:", error);
      showNotification("error", "Erro ao carregar conquistas");
    } finally {
      setAchievementsLoading(false);
    }
  };

  const handleEditAchievement = (achievement: Achievement) => {
    setSelectedAchievement(achievement);
    setIsEditAchievementModalOpen(true);
  };

  const handleDeleteAchievement = async (achievementId: string) => {
    if (confirm("Tem certeza que deseja excluir esta conquista?")) {
      try {
        await achievementService.delete(achievementId);
        await loadAchievements();
        showNotification("success", "Conquista excluída com sucesso!");
        logAction({
          action: "achievement_deleted",
          details: `Achievement ${achievementId} deleted`,
        });
      } catch (error) {
        console.error("Error deleting achievement:", error);
        showNotification("error", "Erro ao excluir conquista");
      }
    }
  };

  // Carregar conquistas quando o componente monta
  useEffect(() => {
    loadAchievements();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSave = async () => {
    try {
      await saveConfigurations("admin@zaazu.app");
      showNotification("success", "Configurações salvas com sucesso!");
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Erro desconhecido";
      showNotification("error", `Erro ao salvar: ${errorMessage}`);
    }
  };

  const handleCreateBackup = async () => {
    try {
      const result = await createBackup(
        systemStatus,
        updateSystemStatus,
        "admin@zaazu.app"
      );
      showNotification("success", result.message);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Erro desconhecido";
      showNotification("error", errorMessage);
    }
  };

  const handleClearCache = async () => {
    try {
      const result = await clearCache(
        systemStatus,
        updateSystemStatus,
        "admin@zaazu.app"
      );
      showNotification("success", result.message);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Erro desconhecido";
      showNotification("error", errorMessage);
    }
  };

  const handleConfigureCDN = async () => {
    try {
      const result = await configureCDN(
        systemStatus,
        updateSystemStatus,
        "admin@zaazu.app"
      );
      showNotification("success", result.message);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Erro desconhecido";
      showNotification("error", errorMessage);
    }
  };

  const downloadLogs = async () => {
    try {
      const allLogs = await loadSystemLogs(1000);
      exportLogsToCSV(allLogs);
      showNotification("success", "Logs exportados com sucesso!");
    } catch (error) {
      console.error("Erro ao baixar logs:", error);
      showNotification("error", "Erro ao baixar logs. Tente novamente.");
    }
  };

  const handleCreateSampleLogs = async () => {
    try {
      await createSampleLogs();
      showNotification("success", "Logs de exemplo criados com sucesso!");
      loadLogs(); // Recarregar logs
    } catch (error) {
      console.error("Erro ao criar logs de exemplo:", error);
      showNotification("error", "Erro ao criar logs de exemplo.");
    }
  };

  const handleCleanOldLogs = async () => {
    try {
      const deletedCount = await cleanOldLogs(30);
      showNotification("success", `${deletedCount} logs antigos removidos.`);
      if (logsVisible) {
        loadLogs(); // Recarregar logs se estão visíveis
      }
    } catch (error) {
      console.error("Erro ao limpar logs antigos:", error);
      showNotification("error", "Erro ao limpar logs antigos.");
    }
  };

  const loadLogs = async () => {
    setLogsLoading(true);
    try {
      const allLogs = await loadSystemLogs(100);
      setLogs(allLogs);
      setLogsVisible(true);
    } catch (error) {
      console.error("Erro ao carregar logs:", error);
      showNotification("error", "Erro ao carregar logs. Tente novamente.");
    } finally {
      setLogsLoading(false);
    }
  };

  // Carregar estatísticas e saúde do sistema
  useEffect(() => {
    // Log de acesso à página
    logAction({
      action: "page_access",
      details: "Página de configurações acessada",
      level: "info",
      metadata: {
        page: "configuracoes",
        timestamp: new Date().toISOString(),
      },
    });

    const loadDashboardData = async () => {
      try {
        const [stats, health] = await Promise.all([
          getSystemStats(),
          checkSystemHealth(),
        ]);
        setSystemStats(stats);
        setSystemHealth(
          health as {
            checks: Record<string, boolean>;
            healthScore: number;
            status: "healthy" | "warning" | "critical";
          }
        );
      } catch (error) {
        console.error("Erro ao carregar dados do dashboard:", error);
      }
    };

    loadDashboardData();
  }, [getSystemStats, checkSystemHealth, logAction]);

  // Filtrar logs baseado no filtro e termo de busca
  const filteredLogs = filterLogs(logs, logFilter, searchTerm);

  const formatDate = (date: Date) => {
    return date.toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Notificação */}
        {notification && (
          <div
            className={`p-4 rounded-lg border-l-4 ${
              notification.type === "success"
                ? "bg-green-50 border-green-500 text-green-700"
                : notification.type === "warning"
                ? "bg-yellow-50 border-yellow-500 text-yellow-700"
                : "bg-red-50 border-red-500 text-red-700"
            }`}
          >
            <div className="flex items-center">
              {notification.type === "success" && (
                <CheckCircle className="h-5 w-5 mr-2" />
              )}
              {notification.type === "warning" && (
                <AlertTriangle className="h-5 w-5 mr-2" />
              )}
              {notification.type === "error" && (
                <XCircle className="h-5 w-5 mr-2" />
              )}
              <span>{notification.message}</span>
              <button
                onClick={() => setNotification(null)}
                className="ml-auto text-current hover:opacity-70"
              >
                ×
              </button>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Configurações</h1>
            <p className="text-gray-600 mt-1">
              Configurações gerais do sistema e personalização
            </p>
          </div>
          <Button
            onClick={handleSave}
            disabled={loading}
            className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
          >
            {saved ? (
              <>
                <Check className="mr-2 h-4 w-4" />
                Salvo com Sucesso!
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                {loading ? "Salvando..." : "Salvar Alterações"}
              </>
            )}
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Configurações Gerais */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-gray-800">
                <Settings className="mr-2 h-5 w-5" />
                Configurações Gerais
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome da Plataforma
                </label>
                <Input
                  value={config.platformName}
                  onChange={(e) => updateConfig("platformName", e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descrição
                </label>
                <Input
                  value={config.description}
                  onChange={(e) => updateConfig("description", e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  URL Base
                </label>
                <Input
                  value={config.baseUrl}
                  onChange={(e) => updateConfig("baseUrl", e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email de Contato
                </label>
                <Input
                  value={config.contactEmail}
                  onChange={(e) => updateConfig("contactEmail", e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Configurações de Conteúdo */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-gray-800">
                <BookOpen className="mr-2 h-5 w-5" />
                Configurações de Conteúdo
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Faixa Etária Padrão
                </label>
                <select
                  className="w-full border border-gray-300 text-gray-600 rounded-md px-3 py-2 bg-white"
                  value={config.defaultAgeGroup}
                  onChange={(e) =>
                    updateConfig("defaultAgeGroup", e.target.value)
                  }
                >
                  <option value="3-5">3-5 anos</option>
                  <option value="5-7">5-7 anos</option>
                  <option value="7-10">7-10 anos</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Duração Máxima dos Vídeos (minutos)
                </label>
                <Input
                  type="number"
                  value={config.maxVideoDuration}
                  onChange={(e) =>
                    updateConfig(
                      "maxVideoDuration",
                      parseInt(e.target.value) || 0
                    )
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-800 mb-1">
                  Número de Atividades por Dia
                </label>
                <Input
                  type="number"
                  value={config.activitiesPerDay}
                  onChange={(e) =>
                    updateConfig(
                      "activitiesPerDay",
                      parseInt(e.target.value) || 0
                    )
                  }
                />
              </div>
              {/* <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="autoApprove"
                  className="rounded"
                  checked={config.autoApprove}
                  onChange={(e) =>
                    updateConfig("autoApprove", e.target.checked)
                  }
                />
                <label htmlFor="autoApprove" className="text-sm text-gray-700">
                  Auto-aprovar conteúdo novo
                </label>
              </div> */}
            </CardContent>
          </Card>

          {/* Configurações de Usuário */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-gray-800">
                <Users className="mr-2 h-5 w-5 " />
                Configurações de Usuário
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-800 mb-1">
                  Tempo de Sessão Máximo (minutos)
                </label>
                <Input
                  type="number"
                  value={config.maxSessionTime}
                  onChange={(e) =>
                    updateConfig(
                      "maxSessionTime",
                      parseInt(e.target.value) || 0
                    )
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-800 mb-1">
                  Limite de Vídeos por Dia
                </label>
                <Input
                  type="number"
                  value={config.maxVideosPerDay}
                  onChange={(e) =>
                    updateConfig(
                      "maxVideosPerDay",
                      parseInt(e.target.value) || 0
                    )
                  }
                />
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="parentalControl"
                  className="rounded"
                  checked={config.parentalControl}
                  onChange={(e) =>
                    updateConfig("parentalControl", e.target.checked)
                  }
                />
                <label
                  htmlFor="parentalControl"
                  className="text-sm text-gray-700"
                >
                  Controle parental obrigatório
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="progressTracking"
                  className="rounded"
                  checked={config.progressTracking}
                  onChange={(e) =>
                    updateConfig("progressTracking", e.target.checked)
                  }
                />
                <label
                  htmlFor="progressTracking"
                  className="text-sm text-gray-700"
                >
                  Rastreamento de progresso
                </label>
              </div>
            </CardContent>
          </Card>

          {/* Configurações de Notificação */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-gray-800">
                <Bell className="mr-2 h-5 w-5" />
                Notificações
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="emailNotifications"
                  className="rounded"
                  checked={config.emailNotifications}
                  onChange={(e) =>
                    updateConfig("emailNotifications", e.target.checked)
                  }
                />
                <label
                  htmlFor="emailNotifications"
                  className="text-sm text-gray-700"
                >
                  Notificações por email
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="newContent"
                  className="rounded"
                  checked={config.newContentNotifications}
                  onChange={(e) =>
                    updateConfig("newContentNotifications", e.target.checked)
                  }
                />
                <label htmlFor="newContent" className="text-sm text-gray-700">
                  Novo conteúdo disponível
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="userRegistration"
                  className="rounded"
                  checked={config.userRegistrationNotifications}
                  onChange={(e) =>
                    updateConfig(
                      "userRegistrationNotifications",
                      e.target.checked
                    )
                  }
                />
                <label
                  htmlFor="userRegistration"
                  className="text-sm text-gray-700"
                >
                  Novos usuários registrados
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="systemAlerts"
                  className="rounded"
                  checked={config.systemAlerts}
                  onChange={(e) =>
                    updateConfig("systemAlerts", e.target.checked)
                  }
                />
                <label htmlFor="systemAlerts" className="text-sm text-gray-700">
                  Alertas do sistema
                </label>
              </div>
            </CardContent>
          </Card>

          {/* Configurações de Segurança */}
        </div>

        {/* Seção de Gestão de Avatares */}
        <Card className="mt-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <User className="mr-2 h-5 w-5 text-gray-800" />
                <div>
                  <CardTitle className="text-gray-800">
                    Gestão de Avatares
                  </CardTitle>
                  <CardDescription className="text-gray-600">
                    Gerencie os avatares SVG disponíveis para os usuários do
                    aplicativo
                  </CardDescription>
                </div>
              </div>
              <Button
                onClick={() => setIsAddAvatarModalOpen(true)}
                className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Avatar
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {avatarsLoading ? (
              <div className="flex justify-center items-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {avatars.map((avatar) => (
                  <div
                    key={avatar.id}
                    className="bg-gray-50 border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex flex-col items-center space-y-3">
                      <div className="w-16 h-16 bg-white border border-gray-200 rounded-lg flex items-center justify-center">
                        <Image
                          src={avatar.svgUrl}
                          alt={avatar.name}
                          width={48}
                          height={48}
                          className="object-contain"
                        />
                      </div>

                      <div className="text-center">
                        <h4 className="font-medium text-gray-900 text-sm line-clamp-2">
                          {avatar.name}
                        </h4>
                        <div className="flex items-center justify-center mt-1">
                          <div
                            className={`w-2 h-2 rounded-full mr-2 ${
                              avatar.isActive ? "bg-green-500" : "bg-red-500"
                            }`}
                          />
                          <span className="text-xs text-gray-500">
                            {avatar.isActive ? "Ativo" : "Inativo"}
                          </span>
                        </div>
                        {avatar.category && (
                          <span className="inline-block px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full mt-2">
                            {avatar.category}
                          </span>
                        )}
                      </div>

                      <div className="flex space-x-1 w-full">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleViewAvatar(avatar)}
                          className="flex-1 text-blue-600 hover:text-blue-700"
                        >
                          <Eye className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEditAvatar(avatar)}
                          className="flex-1 text-green-600 hover:text-green-700"
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteAvatar(avatar.id)}
                          className="flex-1 text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}

                {avatars.length === 0 && (
                  <div className="col-span-full text-center py-8">
                    <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 mb-4">
                      Nenhum avatar encontrado
                    </p>
                    <Button
                      onClick={() => setIsAddAvatarModalOpen(true)}
                      className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Adicionar Primeiro Avatar
                    </Button>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between text-gray-800">
              <div className="flex items-center">
                <Clock className="mr-2 h-5 w-5" />
                Tempo Limite por Categoria
              </div>
              <Button
                onClick={() => setIsDailyTimeLimitModalOpen(true)}
                className="bg-gradient-to-r text-white from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
              >
                <Settings className="h-4 w-4 mr-2 text-white" />
                Configurar Limites
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4 p-4 bg-blue-50 rounded-lg">
              <h3 className="text-sm font-medium text-blue-800 mb-2">
                Sistema de Controle Parental Inteligente:
              </h3>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>
                  • Define tempo máximo diário para cada categoria
                  (entretenimento, atividade, educativo)
                </li>
                <li>
                  • Bloqueia categoria automaticamente ao atingir o limite
                </li>
                <li>
                  • Criança ganha prêmio só quando usar TODAS as 3 categorias
                </li>
                <li>• Promove uso equilibrado e diversificado do app</li>
              </ul>
            </div>

            {timeLimitsLoading ? (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <p className="mt-2 text-gray-500">
                  Carregando configurações...
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Configuração para 2-6 anos */}
                {(() => {
                  const limits2_6 = dailyTimeLimits.find(
                    (limit) => limit.ageGroup === "2-6"
                  );
                  return (
                    <Card className="border-l-4 border-l-green-500">
                      <CardContent className="p-4">
                        <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
                          <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm mr-3">
                            2-6 anos
                          </span>
                          Crianças Pequenas
                        </h3>

                        {limits2_6 ? (
                          <div className="space-y-3 text-gray-600">
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-gray-600">
                                🎪 Entretenimento:
                              </span>
                              <span className="font-medium font-gray-800">
                                {limits2_6.entretenimentoLimit} min/dia
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-gray-600">
                                📝 Atividade:
                              </span>
                              <span className="font-medium font-gray-800">
                                {limits2_6.atividadeLimit} min/dia
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-gray-600">
                                🎓 Educativo:
                              </span>
                              <span className="font-medium font-gray-800">
                                {limits2_6.educativoLimit} min/dia
                              </span>
                            </div>
                            <div className="pt-2 border-t">
                              <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">
                                  🏆 Prêmio:
                                </span>
                                <span className="font-medium text-green-600">
                                  {limits2_6.rewardTitle}
                                </span>
                              </div>
                              <div className="flex justify-between items-center mt-1">
                                <span className="text-sm text-gray-600">
                                  Total diário:
                                </span>
                                <span className="font-bold text-gray-800">
                                  {limits2_6.entretenimentoLimit +
                                    limits2_6.atividadeLimit +
                                    limits2_6.educativoLimit}{" "}
                                  min
                                </span>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="text-center py-4">
                            <Clock className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                            <p className="text-gray-500 text-sm">
                              Nenhum limite configurado
                            </p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })()}

                {/* Configuração para 7-9 anos */}
                {(() => {
                  const limits7_9 = dailyTimeLimits.find(
                    (limit) => limit.ageGroup === "7-9"
                  );
                  return (
                    <Card className="border-l-4 border-l-blue-500">
                      <CardContent className="p-4">
                        <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
                          <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm mr-3">
                            7-9 anos
                          </span>
                          Crianças Maiores
                        </h3>

                        {limits7_9 ? (
                          <div className="space-y-3 text-gray-600">
                            <div className="flex justify-between items-center text-gray-600">
                              <span className="text-sm ">
                                🎪 Entretenimento:
                              </span>
                              <span className="font-medium font-gray-800">
                                {limits7_9.entretenimentoLimit} min/dia
                              </span>
                            </div>
                            <div className="flex justify-between items-center font-gray-800">
                              <span className="text-sm text-gray-600">
                                📝 Atividade:
                              </span>
                              <span className="font-medium font-gray-800">
                                {limits7_9.atividadeLimit} min/dia
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-gray-600">
                                🎓 Educativo:
                              </span>
                              <span className="font-medium font-gray-800">
                                {limits7_9.educativoLimit} min/dia
                              </span>
                            </div>
                            <div className="pt-2 border-t">
                              <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">
                                  🏆 Prêmio:
                                </span>
                                <span className="font-medium text-blue-600">
                                  {limits7_9.rewardTitle}
                                </span>
                              </div>
                              <div className="flex justify-between items-center mt-1">
                                <span className="text-sm text-gray-600">
                                  Total diário:
                                </span>
                                <span className="font-bold text-gray-800">
                                  {limits7_9.entretenimentoLimit +
                                    limits7_9.atividadeLimit +
                                    limits7_9.educativoLimit}{" "}
                                  min
                                </span>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="text-center py-4">
                            <Clock className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                            <p className="text-gray-500 text-sm">
                              Nenhum limite configurado
                            </p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })()}
              </div>
            )}

            {dailyTimeLimits.length === 0 && !timeLimitsLoading && (
              <div className="text-center py-8">
                <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 mb-4">
                  Nenhum limite de tempo configurado
                </p>
                <Button
                  onClick={() => setIsDailyTimeLimitModalOpen(true)}
                  className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Configurar Primeira Vez
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Seção de Gestão de Conquistas */}
        {/*
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between text-gray-800">
              <div className="flex items-center">
                <Award className="mr-2 h-5 w-5" />
                Sistema de Conquistas
              </div>
              <Button
                onClick={() => setIsAddAchievementModalOpen(true)}
                className="bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Nova Conquista
              </Button>
            </CardTitle>
            <CardDescription>
              Configure conquistas e medalhas para gamificar a experiência das
              crianças no app
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-4 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border border-yellow-200">
              <h3 className="text-sm font-medium text-yellow-800 mb-2">
                Sistema de Gamificação Inteligente:
              </h3>
              <ul className="text-sm text-yellow-700 space-y-1">
                <li>
                  • 🏆 Conquistas baseadas em templates pré-definidos otimizados
                  para engajamento infantil
                </li>
                <li>
                  • 🎯 Sistema de pontos e raridades (Bronze, Prata, Ouro,
                  Diamante)
                </li>
                <li>
                  • 🎵 Feedbacks visuais (ícones SVG) e sonoros personalizáveis
                </li>
                <li>
                  • 📊 Conquistas específicas por categoria ou gerais para
                  diversificar uso
                </li>
              </ul>
            </div>

            {achievementsLoading ? (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-600"></div>
                <p className="mt-2 text-gray-500">Carregando conquistas...</p>
              </div>
            ) : achievements.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {achievements.map((achievement) => (
                  <Card
                    key={achievement.id}
                    className={`relative border-l-4 ${
                      achievement.rarity === "bronze"
                        ? "border-l-amber-600 bg-amber-50"
                        : achievement.rarity === "silver"
                        ? "border-l-gray-400 bg-gray-50"
                        : achievement.rarity === "gold"
                        ? "border-l-yellow-500 bg-yellow-50"
                        : "border-l-blue-600 bg-blue-50"
                    }`}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-800 text-sm">
                            {achievement.name}
                          </h4>
                          <p className="text-xs text-gray-600 mt-1">
                            {achievement.description}
                          </p>
                        </div>
                        <div className="flex items-center ml-2">
                          <span className="text-lg">
                            {achievement.rarity === "bronze"
                              ? "🥉"
                              : achievement.rarity === "silver"
                              ? "🥈"
                              : achievement.rarity === "gold"
                              ? "🥇"
                              : "💎"}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-2 text-xs">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Tipo:</span>
                          <span className="font-medium">
                            {achievement.type}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Meta:</span>
                          <span className="font-medium">
                            {achievement.targetValue}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Pontos:</span>
                          <span className="font-bold text-yellow-600">
                            {achievement.points}
                          </span>
                        </div>
                        {achievement.category && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Categoria:</span>
                            <span className="font-medium capitalize">
                              {achievement.category}
                            </span>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span className="text-gray-600">Status:</span>
                          <span
                            className={`font-medium ${
                              achievement.isActive
                                ? "text-green-600"
                                : "text-red-600"
                            }`}
                          >
                            {achievement.isActive ? "Ativa" : "Inativa"}
                          </span>
                        </div>
                      </div>

                      <div className="flex justify-end gap-1 mt-3 pt-3 border-t">
                        <Button
                          onClick={() => handleEditAchievement(achievement)}
                          variant="outline"
                          size="sm"
                          className="px-2"
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button
                          onClick={() =>
                            handleDeleteAchievement(achievement.id)
                          }
                          variant="outline"
                          size="sm"
                          className="px-2 text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Award className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 mb-4">
                  Nenhuma conquista configurada ainda
                </p>
                <Button
                  onClick={() => setIsAddAchievementModalOpen(true)}
                  className="bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Criar Primeira Conquista
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
        */}

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-gray-800">
              <Shield className="mr-2 h-5 w-5" />
              Segurança
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* <div>
              <label className="block text-sm font-medium text-gray-800 mb-1">
                Política de Senha
              </label>
              <select
                className="w-full border border-gray-300 rounded-md px-3 py-2 bg-white text-gray-600"
                value={config.passwordPolicy}
                onChange={(e) => updateConfig("passwordPolicy", e.target.value)}
              >
                <option value="weak">Fraca (6+ caracteres)</option>
                <option value="medium">Média (8+ caracteres, números)</option>
                <option value="strong">Forte (12+ caracteres, símbolos)</option>
              </select>
            </div> */}
            <div>
              <label className="block text-sm font-medium text-gray-800 mb-1">
                Tempo de Expiração da Sessão (horas)
              </label>
              <Input
                type="number"
                value={config.sessionExpiration}
                onChange={(e) =>
                  updateConfig(
                    "sessionExpiration",
                    parseInt(e.target.value) || 24
                  )
                }
              />
            </div>
            {/* <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="twoFactor"
                className="rounded"
                checked={config.twoFactor}
                onChange={(e) => updateConfig("twoFactor", e.target.checked)}
              />
              <label htmlFor="twoFactor" className="text-sm text-gray-700">
                Autenticação de dois fatores
              </label>
            </div> */}
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="loginLog"
                className="rounded"
                checked={config.loginLog}
                onChange={(e) => updateConfig("loginLog", e.target.checked)}
              />
              <label htmlFor="loginLog" className="text-sm text-gray-700">
                Log de tentativas de login
              </label>
            </div>
            <div className="border-t pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-gray-700">
                    Modo de Manutenção
                  </h4>
                  <p className="text-xs text-gray-500">
                    Bloqueia acesso de usuários não-admin
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="maintenanceMode"
                    className="rounded"
                    checked={config.maintenanceMode}
                    onChange={(e) =>
                      updateConfig("maintenanceMode", e.target.checked)
                    }
                  />
                  <label
                    htmlFor="maintenanceMode"
                    className="text-sm font-medium"
                  >
                    {config.maintenanceMode ? (
                      <span className="text-orange-600">Ativado</span>
                    ) : (
                      <span className="text-green-600">Desativado</span>
                    )}
                  </label>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Seção de Logs do Sistema */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <BookOpen className="mr-2 h-5 w-5 text-gray-800" />
                <div>
                  <CardTitle className="text-gray-800">
                    Logs do Sistema
                  </CardTitle>
                  <CardDescription className="text-gray-600">
                    Visualizar e gerenciar logs do sistema (Admin e App)
                  </CardDescription>
                </div>
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  onClick={loadLogs}
                  disabled={logsLoading}
                  className="text-blue-600 hover:text-blue-700"
                >
                  {logsLoading ? "Carregando..." : "Carregar Logs"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setLogsVisible(!logsVisible)}
                  className="text-purple-600 hover:text-purple-700"
                >
                  {logsVisible ? "Ocultar" : "Mostrar"} Logs
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {logsVisible && (
              <div className="space-y-4">
                {/* Filtros */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <Input
                      placeholder="Buscar nos logs..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full"
                    />
                  </div>
                  <div className="flex space-x-2">
                    <select
                      value={logFilter}
                      onChange={(e) =>
                        setLogFilter(e.target.value as "all" | "admin" | "app")
                      }
                      className="border border-gray-300 rounded-md px-3 py-2 bg-white text-gray-600"
                    >
                      <option value="all">Todos os Logs</option>
                      <option value="admin">Apenas Admin</option>
                      <option value="app">Apenas App</option>
                    </select>
                    <Button
                      variant="outline"
                      onClick={downloadLogs}
                      className="text-orange-600 hover:text-orange-700"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Baixar CSV
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleCreateSampleLogs}
                      className="text-purple-600 hover:text-purple-700"
                    >
                      Criar Logs de Exemplo
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleCleanOldLogs}
                      className="text-red-600 hover:text-red-700"
                    >
                      Limpar Logs Antigos
                    </Button>
                  </div>
                </div>

                {/* Lista de Logs */}
                <div className="border rounded-lg overflow-hidden">
                  <div className="max-h-96 overflow-y-auto">
                    {filteredLogs.length > 0 ? (
                      <table className="w-full text-sm">
                        <thead className="bg-gray-50 sticky top-0">
                          <tr>
                            <th className="px-4 py-2 text-left font-medium text-gray-700">
                              Tipo
                            </th>
                            <th className="px-4 py-2 text-left font-medium text-gray-700">
                              Ação
                            </th>
                            <th className="px-4 py-2 text-left font-medium text-gray-700">
                              Detalhes
                            </th>
                            <th className="px-4 py-2 text-left font-medium text-gray-700">
                              Usuário
                            </th>
                            <th className="px-4 py-2 text-left font-medium text-gray-700">
                              Data/Hora
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredLogs.map((log, index) => (
                            <tr
                              key={log.id}
                              className={
                                index % 2 === 0 ? "bg-white" : "bg-gray-50"
                              }
                            >
                              <td className="px-4 py-2">
                                <span
                                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                                    log.type === "Admin"
                                      ? "bg-blue-100 text-blue-800"
                                      : "bg-green-100 text-green-800"
                                  }`}
                                >
                                  {log.type}
                                </span>
                              </td>
                              <td className="px-4 py-2 text-gray-800">
                                {log.action}
                              </td>
                              <td
                                className="px-4 py-2 text-gray-600 max-w-xs truncate"
                                title={log.details}
                              >
                                {log.details}
                              </td>
                              <td className="px-4 py-2 text-gray-600">
                                {log.user}
                              </td>
                              <td className="px-4 py-2 text-gray-500">
                                {new Date(log.timestamp).toLocaleString(
                                  "pt-BR"
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    ) : (
                      <div className="p-8 text-center text-gray-500">
                        {logsLoading
                          ? "Carregando logs..."
                          : "Nenhum log encontrado"}
                      </div>
                    )}
                  </div>
                </div>

                {/* Estatísticas */}
                {filteredLogs.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <div className="text-blue-800 font-semibold">
                        Logs Admin
                      </div>
                      <div className="text-2xl font-bold text-blue-600">
                        {logs.filter((log) => log.type === "Admin").length}
                      </div>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg">
                      <div className="text-green-800 font-semibold">
                        Logs App
                      </div>
                      <div className="text-2xl font-bold text-green-600">
                        {logs.filter((log) => log.type === "App").length}
                      </div>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-lg">
                      <div className="text-purple-800 font-semibold">Total</div>
                      <div className="text-2xl font-bold text-purple-600">
                        {logs.length}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Configurações Avançadas */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-gray-800">
              <Database className="mr-2 h-5 w-5" />
              Configurações do Sistema
            </CardTitle>
            <CardDescription className="text-gray-600">
              Gerenciar backup, cache, CDN e logs do sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Database className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="font-semibold mb-2 text-gray-800">
                  Backup de Dados
                </h3>
                <p className="text-sm text-gray-600 mb-3">
                  Último backup: {formatDate(systemStatus.lastBackup)}
                </p>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleCreateBackup}
                  disabled={operationLoading.backup}
                  className="text-blue-600 hover:text-blue-700"
                >
                  {operationLoading.backup ? "Criando..." : "Criar Backup"}
                </Button>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Clock className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="font-semibold mb-2 text-gray-800">
                  Cache do Sistema
                </h3>
                <p className="text-sm text-gray-600 mb-3">
                  Última limpeza: {formatDate(systemStatus.lastCacheCleanup)}
                </p>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleClearCache}
                  disabled={operationLoading.cache}
                  className="text-green-600 hover:text-green-700"
                >
                  {operationLoading.cache ? "Limpando..." : "Limpar Cache"}
                </Button>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Globe className="h-8 w-8 text-purple-600" />
                </div>
                <h3 className="font-semibold mb-2 text-gray-800">CDN</h3>
                <p className="text-sm text-gray-600 mb-3">
                  Status:{" "}
                  <span
                    className={`font-medium ${
                      systemStatus.cdnStatus === "Ativo"
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {systemStatus.cdnStatus}
                  </span>
                </p>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleConfigureCDN}
                  className="text-purple-600 hover:text-purple-700"
                >
                  {systemStatus.cdnStatus === "Ativo" ? "Desativar" : "Ativar"}{" "}
                  CDN
                </Button>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Download className="h-8 w-8 text-orange-600" />
                </div>
                <h3 className="font-semibold mb-2 text-gray-800">
                  Logs do Sistema
                </h3>
                <p className="text-sm text-gray-600 mb-3">
                  Tamanho: {systemStatus.logSize}
                </p>
                <div className="space-y-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      loadLogs();
                      setLogsVisible(true);
                    }}
                    disabled={logsLoading}
                    className="text-orange-600 hover:text-orange-700 w-full"
                  >
                    <BookOpen className="h-3 w-3 mr-1" />
                    {logsLoading ? "Carregando..." : "Ver Logs"}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={downloadLogs}
                    className="text-orange-600 hover:text-orange-700 w-full"
                  >
                    <Download className="h-3 w-3 mr-1" />
                    Baixar CSV
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button
            onClick={handleSave}
            disabled={loading}
            className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
          >
            {saved ? (
              <>
                <Check className="mr-2 h-4 w-4" />
                Configurações Salvas!
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                {loading ? "Salvando..." : "Salvar Todas as Configurações"}
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Modais para Gestão de Avatares */}
      <AddAvatarModal
        isOpen={isAddAvatarModalOpen}
        onClose={() => setIsAddAvatarModalOpen(false)}
        onSuccess={handleAddAvatar}
      />

      <ViewAvatarModal
        isOpen={isViewAvatarModalOpen}
        onClose={() => setIsViewAvatarModalOpen(false)}
        avatar={selectedAvatar}
      />

      <EditAvatarModal
        isOpen={isEditAvatarModalOpen}
        onClose={() => setIsEditAvatarModalOpen(false)}
        avatar={selectedAvatar}
        onSuccess={handleUpdateAvatar}
      />

      {/* Modal para Configuração de Tempo Limite */}
      <DailyTimeLimitModal
        isOpen={isDailyTimeLimitModalOpen}
        onClose={() => setIsDailyTimeLimitModalOpen(false)}
        onSuccess={handleSaveTimeLimits}
        currentLimits={{
          ageGroup2_6: dailyTimeLimits.find(
            (limit) => limit.ageGroup === "2-6"
          ),
          ageGroup7_9: dailyTimeLimits.find(
            (limit) => limit.ageGroup === "7-9"
          ),
        }}
      />

      {/* Modais para Conquistas */}
      <AddAchievementModal
        isOpen={isAddAchievementModalOpen}
        onClose={() => setIsAddAchievementModalOpen(false)}
        onSuccess={() => {
          loadAchievements();
          showNotification("success", "Conquista criada com sucesso!");
        }}
      />

      <EditAchievementModal
        isOpen={isEditAchievementModalOpen}
        onClose={() => {
          setIsEditAchievementModalOpen(false);
          setSelectedAchievement(null);
        }}
        achievement={selectedAchievement}
        onSuccess={() => {
          loadAchievements();
          showNotification("success", "Conquista atualizada com sucesso!");
        }}
      />
    </DashboardLayout>
  );
}
