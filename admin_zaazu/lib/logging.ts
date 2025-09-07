import {
  collection,
  addDoc,
  serverTimestamp,
  getDocs,
  query,
  orderBy,
  limit,
  where,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { db } from "./firebase";

export interface LogEntry {
  id: string;
  type: "Admin" | "App";
  action: string;
  details: string;
  user: string;
  timestamp: string;
  level?: "info" | "warning" | "error";
  metadata?: Record<string, unknown>;
}

export interface AdminLogData {
  action: string;
  details: string;
  admin: string;
  level?: "info" | "warning" | "error";
  metadata?: Record<string, unknown>;
}

export interface AppLogData {
  action: string;
  details: string;
  user: string;
  userId?: string;
  sessionId?: string;
  deviceInfo?: string;
  level?: "info" | "warning" | "error";
  metadata?: Record<string, unknown>;
}

/**
 * Registra um log de ação do administrador
 */
export const logAdminAction = async (logData: AdminLogData): Promise<void> => {
  try {
    if (!db) {
      throw new Error("Firebase Firestore não está configurado.");
    }
    await addDoc(collection(db!, "system", "logs", "admin_actions"), {
      ...logData,
      level: logData.level || "info",
      timestamp: serverTimestamp(),
    });
  } catch (error) {
    console.error("Erro ao registrar log de admin:", error);
  }
};

/**
 * Registra um log de ação do aplicativo Flutter
 */
export const logAppAction = async (logData: AppLogData): Promise<void> => {
  try {
    await addDoc(collection(db!, "system", "logs", "app_actions"), {
      ...logData,
      level: logData.level || "info",
      timestamp: serverTimestamp(),
    });
  } catch (error) {
    console.error("Erro ao registrar log do app:", error);
  }
};

/**
 * Carrega logs do sistema (admin e app)
 */
export const loadSystemLogs = async (
  limitCount: number = 100
): Promise<LogEntry[]> => {
  try {
    // Buscar logs de admin
    const adminLogsSnapshot = await getDocs(
      query(
        collection(db!, "system", "logs", "admin_actions"),
        orderBy("timestamp", "desc"),
        limit(limitCount)
      )
    );

    // Buscar logs do app
    const appLogsSnapshot = await getDocs(
      query(
        collection(db!, "system", "logs", "app_actions"),
        orderBy("timestamp", "desc"),
        limit(limitCount)
      )
    );

    const adminLogs: LogEntry[] = adminLogsSnapshot.docs.map((doc) => ({
      id: doc.id,
      type: "Admin",
      action: doc.data().action || "N/A",
      details: doc.data().details || "N/A",
      user: doc.data().admin || doc.data().user || "N/A",
      timestamp:
        doc.data().timestamp?.toDate()?.toISOString() ||
        new Date().toISOString(),
      level: doc.data().level || "info",
      metadata: doc.data().metadata || {},
    }));

    const appLogs: LogEntry[] = appLogsSnapshot.docs.map((doc) => ({
      id: doc.id,
      type: "App",
      action: doc.data().action || "N/A",
      details: doc.data().details || "N/A",
      user: doc.data().user || doc.data().userId || "N/A",
      timestamp:
        doc.data().timestamp?.toDate()?.toISOString() ||
        new Date().toISOString(),
      level: doc.data().level || "info",
      metadata: doc.data().metadata || {},
    }));

    // Combinar e ordenar logs por timestamp
    const allLogs = [...adminLogs, ...appLogs].sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    return allLogs;
  } catch (error) {
    console.error("Erro ao carregar logs:", error);
    throw error;
  }
};

/**
 * Exporta logs para CSV
 */
export const exportLogsToCSV = (logs: LogEntry[]): void => {
  try {
    const csv = [
      "ID,Tipo,Ação,Detalhes,Usuário,Timestamp",
      ...logs.map(
        (log) =>
          `${log.id},${log.type},${log.action},"${log.details}",${log.user},${log.timestamp}`
      ),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `system-logs-${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  } catch (error) {
    console.error("Erro ao exportar logs:", error);
    throw error;
  }
};

/**
 * Filtra logs baseado em critérios
 */
export const filterLogs = (
  logs: LogEntry[],
  filter: "all" | "admin" | "app",
  searchTerm: string
): LogEntry[] => {
  return logs.filter((log) => {
    const matchesFilter =
      filter === "all" ||
      (filter === "admin" && log.type === "Admin") ||
      (filter === "app" && log.type === "App");

    const matchesSearch =
      searchTerm === "" ||
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.user.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesFilter && matchesSearch;
  });
};

/**
 * Tipos de ações mais comuns para logging
 */
export const LOG_ACTIONS = {
  // Admin Actions
  ADMIN: {
    USER_CREATED: "user_created",
    USER_UPDATED: "user_updated",
    USER_DELETED: "user_deleted",
    VIDEO_APPROVED: "video_approved",
    VIDEO_REJECTED: "video_rejected",
    GAME_APPROVED: "game_approved",
    GAME_REJECTED: "game_rejected",
    ACTIVITY_APPROVED: "activity_approved",
    ACTIVITY_REJECTED: "activity_rejected",
    SETTINGS_UPDATED: "settings_updated",
    BACKUP_CREATED: "backup_created",
    CACHE_CLEARED: "cache_cleared",
    CDN_CONFIGURED: "cdn_configured",
    LOGIN: "admin_login",
    LOGOUT: "admin_logout",
  },
  // App Actions
  APP: {
    USER_LOGIN: "user_login",
    USER_LOGOUT: "user_logout",
    USER_REGISTER: "user_register",
    VIDEO_WATCHED: "video_watched",
    VIDEO_COMPLETED: "video_completed",
    GAME_STARTED: "game_started",
    GAME_COMPLETED: "game_completed",
    ACTIVITY_STARTED: "activity_started",
    ACTIVITY_COMPLETED: "activity_completed",
    QUIZ_COMPLETED: "quiz_completed",
    PROGRESS_UPDATED: "progress_updated",
    SESSION_STARTED: "session_started",
    SESSION_ENDED: "session_ended",
    ERROR_OCCURRED: "error_occurred",
    CRASH_REPORTED: "crash_reported",
  },
} as const;

/**
 * Limpa logs antigos (mais de X dias)
 */
export const cleanOldLogs = async (daysOld: number = 30): Promise<number> => {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    // Buscar logs antigos de admin
    const adminQuery = query(
      collection(db!, "system", "logs", "admin_actions"),
      where("timestamp", "<", cutoffDate),
      limit(100)
    );
    const adminSnapshot = await getDocs(adminQuery);

    // Buscar logs antigos de app
    const appQuery = query(
      collection(db!, "system", "logs", "app_actions"),
      where("timestamp", "<", cutoffDate),
      limit(100)
    );
    const appSnapshot = await getDocs(appQuery);

    // Deletar logs
    const deletePromises: Promise<void>[] = [];
    adminSnapshot.docs.forEach((docRef) => {
      deletePromises.push(
        deleteDoc(doc(db!, "system", "logs", "admin_actions", docRef.id))
      );
    });
    appSnapshot.docs.forEach((docRef) => {
      deletePromises.push(
        deleteDoc(doc(db!, "system", "logs", "app_actions", docRef.id))
      );
    });

    await Promise.all(deletePromises);

    const deletedCount = adminSnapshot.size + appSnapshot.size;
    return deletedCount;
  } catch (error) {
    console.error("Erro ao limpar logs antigos:", error);
    throw error;
  }
};

/**
 * Busca logs por critérios específicos
 */
export const searchLogs = async (criteria: {
  action?: string;
  user?: string;
  level?: "info" | "warning" | "error";
  type?: "Admin" | "App";
  dateFrom?: Date;
  dateTo?: Date;
  limitCount?: number;
}): Promise<LogEntry[]> => {
  try {
    const {
      action,
      user,
      level,
      type,
      dateFrom,
      dateTo,
      limitCount = 50,
    } = criteria;

    // Para simplicidade, vamos carregar todos os logs e filtrar
    // Em produção, você implementaria queries mais específicas
    const allLogs = await loadSystemLogs(limitCount * 2);

    return allLogs
      .filter((log) => {
        if (action && !log.action.toLowerCase().includes(action.toLowerCase()))
          return false;
        if (user && !log.user.toLowerCase().includes(user.toLowerCase()))
          return false;
        if (level && log.level !== level) return false;
        if (type && log.type !== type) return false;
        if (dateFrom && new Date(log.timestamp) < dateFrom) return false;
        if (dateTo && new Date(log.timestamp) > dateTo) return false;
        return true;
      })
      .slice(0, limitCount);
  } catch (error) {
    console.error("Erro ao buscar logs:", error);
    throw error;
  }
};

/**
 * Cria logs de exemplo para demonstração
 */
export const createSampleLogs = async (): Promise<void> => {
  try {
    // Logs de exemplo para Admin
    const adminSampleLogs: AdminLogData[] = [
      {
        action: LOG_ACTIONS.ADMIN.USER_CREATED,
        details: "Novo usuário criado no sistema",
        admin: "admin@zaazu.app",
        level: "info",
        metadata: { userId: "user123", email: "user@example.com" },
      },
      {
        action: LOG_ACTIONS.ADMIN.VIDEO_APPROVED,
        details: "Vídeo 'Matemática Básica' aprovado",
        admin: "admin@zaazu.app",
        level: "info",
        metadata: { videoId: "video456", title: "Matemática Básica" },
      },
      {
        action: LOG_ACTIONS.ADMIN.SETTINGS_UPDATED,
        details: "Configurações de segurança atualizadas",
        admin: "admin@zaazu.app",
        level: "warning",
        metadata: {
          section: "security",
          changes: ["twoFactor", "sessionExpiration"],
        },
      },
      {
        action: LOG_ACTIONS.ADMIN.BACKUP_CREATED,
        details: "Backup automático criado com sucesso",
        admin: "system@zaazu.app",
        level: "info",
        metadata: { size: "2.5MB", collections: 5 },
      },
    ];

    // Logs de exemplo para App
    const appSampleLogs: AppLogData[] = [
      {
        action: LOG_ACTIONS.APP.USER_LOGIN,
        details: "Usuário fez login no aplicativo",
        user: "crianca01@email.com",
        level: "info",
        metadata: { device: "iPad", version: "1.0.0" },
      },
      {
        action: LOG_ACTIONS.APP.VIDEO_WATCHED,
        details: "Vídeo assistido: 'Cores e Formas'",
        user: "crianca02@email.com",
        level: "info",
        metadata: { videoId: "video789", duration: 180, completed: true },
      },
      {
        action: LOG_ACTIONS.APP.ACTIVITY_COMPLETED,
        details: "Atividade de matemática concluída",
        user: "crianca03@email.com",
        level: "info",
        metadata: { activityId: "act456", score: 85, timeSpent: 300 },
      },
      {
        action: LOG_ACTIONS.APP.ERROR_OCCURRED,
        details: "Erro ao carregar conteúdo do vídeo",
        user: "crianca01@email.com",
        level: "error",
        metadata: { error: "NetworkError", videoId: "video123", retry: true },
      },
    ];

    // Adicionar logs usando o serviço
    const promises = [];
    for (const logData of adminSampleLogs) {
      promises.push(logAdminAction(logData));
    }
    for (const logData of appSampleLogs) {
      promises.push(logAppAction(logData));
    }

    await Promise.all(promises);
  } catch (error) {
    console.error("Erro ao criar logs de exemplo:", error);
    throw error;
  }
};
