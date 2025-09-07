import { useState, useEffect } from "react";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "./firebase";
import { logAdminAction, LOG_ACTIONS } from "./logging";

export interface AppConfig {
  platformName: string;
  description: string;
  baseUrl: string;
  contactEmail: string;
  defaultAgeGroup: string;
  maxVideoDuration: number;
  activitiesPerDay: number;
  maxSessionTime: number;
  maxVideosPerDay: number;
  autoApprove: boolean;
  emailNotifications: boolean;
  newContentNotifications: boolean;
  userRegistrationNotifications: boolean;
  systemAlerts: boolean;
  parentalControl: boolean;
  progressTracking: boolean;
  passwordPolicy: string;
  sessionExpiration: number;
  twoFactor: boolean;
  loginLog: boolean;
  maintenanceMode: boolean;
  allowedCategories: string;
  minDifficultyLevel: string;
  minActivityDuration: number;
  autoGenerateQuiz: boolean;
  allowDownloads: boolean;
  moderateContent: boolean;
}

export interface SystemStatus {
  lastBackup: Date;
  lastCacheCleanup: Date;
  cdnStatus: string;
  logSize: string;
  backupInProgress: boolean;
  cacheClearing: boolean;
}

const defaultConfig: AppConfig = {
  platformName: "Zaazu Kids",
  description: "Plataforma educativa para crianças",
  baseUrl: "https://zaazu.app",
  contactEmail: "contato@zaazu.app",
  defaultAgeGroup: "3-5",
  maxVideoDuration: 10,
  activitiesPerDay: 3,
  maxSessionTime: 30,
  maxVideosPerDay: 5,
  autoApprove: false,
  emailNotifications: true,
  newContentNotifications: true,
  userRegistrationNotifications: true,
  systemAlerts: false,
  parentalControl: true,
  progressTracking: true,
  passwordPolicy: "medium",
  sessionExpiration: 24,
  twoFactor: false,
  loginLog: true,
  maintenanceMode: false,
  allowedCategories: "todas",
  minDifficultyLevel: "facil",
  minActivityDuration: 5,
  autoGenerateQuiz: false,
  allowDownloads: true,
  moderateContent: true,
};

const defaultSystemStatus: SystemStatus = {
  lastBackup: new Date(),
  lastCacheCleanup: new Date(Date.now() - 2 * 60 * 60 * 1000),
  cdnStatus: "Ativo",
  logSize: "245 MB",
  backupInProgress: false,
  cacheClearing: false,
};

export const useAppConfig = () => {
  const [config, setConfig] = useState<AppConfig>(defaultConfig);
  const [systemStatus, setSystemStatus] =
    useState<SystemStatus>(defaultSystemStatus);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  // Carregar configurações do Firebase
  const loadConfigurations = async () => {
    try {
      setLoading(true);
      const configDoc = await getDoc(doc(db!, "settings", "general"));
      if (configDoc.exists()) {
        const data = configDoc.data();
        setConfig((prev) => ({ ...prev, ...data }));
      }

      const statusDoc = await getDoc(doc(db!, "system", "status"));
      if (statusDoc.exists()) {
        const data = statusDoc.data();
        setSystemStatus((prev) => ({
          ...prev,
          lastBackup: data.lastBackup?.toDate() || new Date(),
          lastCacheCleanup:
            data.lastCacheCleanup?.toDate() ||
            new Date(Date.now() - 2 * 60 * 60 * 1000),
          cdnStatus: data.cdnStatus || "Ativo",
          logSize: data.logSize || "245 MB",
        }));
      }
    } catch (error) {
      console.error("Erro ao carregar configurações:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Salvar configurações
  const saveConfigurations = async (adminEmail?: string) => {
    try {
      setLoading(true);

      // Validar configurações antes de salvar
      validateConfig(config);

      await setDoc(doc(db!, "settings", "general"), {
        ...config,
        updatedAt: serverTimestamp(),
      });

      // Log da alteração
      await logAdminAction({
        action: LOG_ACTIONS.ADMIN.SETTINGS_UPDATED,
        details: "Configurações gerais atualizadas",
        admin: adminEmail || "admin@zaazu.app",
      });

      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error("Erro ao salvar configurações:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Validar configurações
  const validateConfig = (config: AppConfig) => {
    const errors: string[] = [];

    if (!config.platformName.trim()) {
      errors.push("Nome da plataforma é obrigatório");
    }

    if (!config.contactEmail.trim() || !isValidEmail(config.contactEmail)) {
      errors.push("Email de contato válido é obrigatório");
    }

    if (!config.baseUrl.trim() || !isValidUrl(config.baseUrl)) {
      errors.push("URL base válida é obrigatória");
    }

    if (config.maxVideoDuration <= 0 || config.maxVideoDuration > 60) {
      errors.push("Duração máxima de vídeo deve estar entre 1 e 60 minutos");
    }

    if (config.activitiesPerDay <= 0 || config.activitiesPerDay > 20) {
      errors.push("Atividades por dia deve estar entre 1 e 20");
    }

    if (config.maxSessionTime <= 0 || config.maxSessionTime > 180) {
      errors.push("Tempo de sessão deve estar entre 1 e 180 minutos");
    }

    if (config.sessionExpiration <= 0 || config.sessionExpiration > 720) {
      errors.push("Expiração de sessão deve estar entre 1 e 720 horas");
    }

    if (config.minActivityDuration <= 0 || config.minActivityDuration > 60) {
      errors.push(
        "Duração mínima de atividade deve estar entre 1 e 60 minutos"
      );
    }

    if (errors.length > 0) {
      throw new Error(errors.join(", "));
    }
  };

  // Atualizar configuração específica
  const updateConfig = (
    key: keyof AppConfig,
    value: string | boolean | number
  ) => {
    setConfig((prev) => ({ ...prev, [key]: value }));
  };

  // Atualizar status do sistema
  const updateSystemStatus = (updates: Partial<SystemStatus>) => {
    setSystemStatus((prev) => ({ ...prev, ...updates }));
  };

  useEffect(() => {
    loadConfigurations();
  }, []);

  return {
    config,
    systemStatus,
    loading,
    saved,
    updateConfig,
    updateSystemStatus,
    saveConfigurations,
    loadConfigurations,
  };
};

// Funções utilitárias
const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};
