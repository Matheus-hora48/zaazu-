import { useAuth } from "@/lib/auth-context";
import { logAdminAction, LOG_ACTIONS, AdminLogData } from "@/lib/logging";

export function useAdminLogging() {
  const { user: currentAdmin } = useAuth();

  const logAction = async (logData: Omit<AdminLogData, "admin">) => {
    try {
      await logAdminAction({
        ...logData,
        admin: currentAdmin?.email || "unknown",
      });
    } catch (error) {
      console.error("Failed to log admin action:", error);
    }
  };

  // Logs de CRUD Operations
  const logCreate = async (
    type: "user" | "video" | "activity" | "game",
    itemName: string,
    itemId: string,
    metadata?: Record<string, unknown>
  ) => {
    await logAction({
      action: `${type}_created`,
      details: `${
        type.charAt(0).toUpperCase() + type.slice(1)
      } criado: ${itemName}`,
      level: "info",
      metadata: {
        [`${type}Id`]: itemId,
        [`${type}Name`]: itemName,
        timestamp: new Date().toISOString(),
        ...metadata,
      },
    });
  };

  const logUpdate = async (
    type: "user" | "video" | "activity" | "game",
    itemName: string,
    itemId: string,
    changes?: Record<string, { old: string; new: string }>,
    metadata?: Record<string, unknown>
  ) => {
    await logAction({
      action: `${type}_updated`,
      details: `${
        type.charAt(0).toUpperCase() + type.slice(1)
      } atualizado: ${itemName}`,
      level: "info",
      metadata: {
        [`${type}Id`]: itemId,
        [`${type}Name`]: itemName,
        changes: changes,
        fieldsChanged: changes ? Object.keys(changes) : [],
        timestamp: new Date().toISOString(),
        ...metadata,
      },
    });
  };

  const logDelete = async (
    type: "user" | "video" | "activity" | "game",
    itemName: string,
    itemId: string,
    metadata?: Record<string, unknown>
  ) => {
    await logAction({
      action: `${type}_deleted`,
      details: `${
        type.charAt(0).toUpperCase() + type.slice(1)
      } excluído: ${itemName}`,
      level: "warning",
      metadata: {
        [`${type}Id`]: itemId,
        [`${type}Name`]: itemName,
        timestamp: new Date().toISOString(),
        ...metadata,
      },
    });
  };

  const logError = async (
    action: string,
    details: string,
    error: Error | unknown,
    metadata?: Record<string, unknown>
  ) => {
    await logAction({
      action: `${action}_failed`,
      details: `${details} - ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
      level: "error",
      metadata: {
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
        ...metadata,
      },
    });
  };

  // Logs específicos de navegação/acesso
  const logPageAccess = async (
    pageName: string,
    itemsCount?: number,
    metadata?: Record<string, unknown>
  ) => {
    await logAction({
      action: `${pageName}_page_accessed`,
      details: `Página de ${pageName} acessada${
        itemsCount ? ` - ${itemsCount} itens carregados` : ""
      }`,
      level: "info",
      metadata: {
        itemsCount,
        timestamp: new Date().toISOString(),
        ...metadata,
      },
    });
  };

  // Logs de configurações
  const logConfigChange = async (
    section: string,
    changes: string[],
    metadata?: Record<string, unknown>
  ) => {
    await logAction({
      action: LOG_ACTIONS.ADMIN.SETTINGS_UPDATED,
      details: `Configurações atualizadas na seção: ${section}`,
      level: "warning",
      metadata: {
        section,
        changes,
        timestamp: new Date().toISOString(),
        ...metadata,
      },
    });
  };

  // Logs de autenticação
  const logLogin = async (metadata?: Record<string, unknown>) => {
    await logAction({
      action: LOG_ACTIONS.ADMIN.LOGIN,
      details: "Administrador fez login no sistema",
      level: "info",
      metadata: {
        timestamp: new Date().toISOString(),
        userAgent:
          typeof navigator !== "undefined" ? navigator.userAgent : "unknown",
        ip: "admin-panel",
        ...metadata,
      },
    });
  };

  const logLogout = async (metadata?: Record<string, unknown>) => {
    await logAction({
      action: LOG_ACTIONS.ADMIN.LOGOUT,
      details: "Administrador fez logout do sistema",
      level: "info",
      metadata: {
        timestamp: new Date().toISOString(),
        ...metadata,
      },
    });
  };

  // Logs de mudanças de role
  const logRoleChange = async (
    userName: string,
    userEmail: string,
    userId: string,
    previousRole: string,
    newRole: string,
    metadata?: Record<string, unknown>
  ) => {
    await logAction({
      action:
        newRole === "admin"
          ? "user_promoted_to_admin"
          : "admin_demoted_to_user",
      details: `Role alterado: ${userName} (${userEmail}) de ${previousRole} para ${newRole}`,
      level: "warning",
      metadata: {
        userId,
        userName,
        userEmail,
        previousRole,
        newRole,
        timestamp: new Date().toISOString(),
        ...metadata,
      },
    });
  };

  return {
    logAction,
    logCreate,
    logUpdate,
    logDelete,
    logError,
    logPageAccess,
    logConfigChange,
    logLogin,
    logLogout,
    logRoleChange,
  };
}
