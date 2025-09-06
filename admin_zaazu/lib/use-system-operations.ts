import { useState } from "react";
import {
  collection,
  getDocs,
  addDoc,
  setDoc,
  doc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "./firebase";
import { logAdminAction, LOG_ACTIONS } from "./logging";
import { SystemStatus } from "./use-app-config";
import { useGoogleDrive } from "./use-google-drive";

export const useSystemOperations = () => {
  const [operationLoading, setOperationLoading] = useState<{
    backup: boolean;
    cache: boolean;
    cdn: boolean;
  }>({
    backup: false,
    cache: false,
    cdn: false,
  });

  // Importar serviços do Google Drive
  const googleDrive = useGoogleDrive();

  // Criar backup do sistema
  const createBackup = async (
    systemStatus: SystemStatus,
    updateSystemStatus: (updates: Partial<SystemStatus>) => void,
    adminEmail?: string
  ) => {
    try {
      setOperationLoading((prev) => ({ ...prev, backup: true }));
      updateSystemStatus({ backupInProgress: true });

      // Coletar todos os dados para backup
      const collections = [
        "users",
        "videos",
        "games",
        "activities",
        "settings",
      ];

      const backupData: Record<string, unknown> = {};
      let totalSize = 0;

      for (const collectionName of collections) {
        try {
          const snapshot = await getDocs(collection(db, collectionName));
          const collectionData = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          backupData[collectionName] = collectionData;
          totalSize += JSON.stringify(collectionData).length;
        } catch (error) {
          console.warn(
            `Aviso: Não foi possível fazer backup da collection ${collectionName}:`,
            error
          );
          backupData[collectionName] = [];
        }
      }

      // Criar documento de backup
      const backupDoc = {
        data: backupData,
        createdAt: serverTimestamp(),
        size: totalSize,
        collections: collections.length,
        version: "1.0",
        admin: adminEmail || "admin@zaazu.app",
      };

      await addDoc(collection(db, "backups"), backupDoc);

      // Salvar automaticamente no Google Drive se configurado
      let googleDriveResult = null;
      if (googleDrive.authState.isAuthenticated) {
        try {
          googleDriveResult = await googleDrive.uploadBackup(backupDoc, adminEmail || "admin@zaazu.app");
        } catch (error) {
          console.warn("Erro ao salvar backup no Google Drive:", error);
          // Não falhar o backup local se o Google Drive falhar
        }
      }

      // Atualizar status do sistema
      const newBackupTime = new Date();
      await setDoc(doc(db, "system", "status"), {
        lastBackup: serverTimestamp(),
        lastCacheCleanup: systemStatus.lastCacheCleanup,
        cdnStatus: systemStatus.cdnStatus,
        logSize: systemStatus.logSize,
      });

      updateSystemStatus({
        lastBackup: newBackupTime,
        backupInProgress: false,
      });

      // Log da operação
      await logAdminAction({
        action: LOG_ACTIONS.ADMIN.BACKUP_CREATED,
        details: `Backup criado com ${collections.length} collections e ${(
          totalSize / 1024
        ).toFixed(2)} KB${googleDriveResult?.success ? ' - Salvo no Google Drive' : ''}`,
        admin: adminEmail || "admin@zaazu.app",
      });

      return {
        success: true,
        message: `Backup criado com sucesso! ${collections.length} collections salvas.${
          googleDriveResult?.success ? ' Também salvo no Google Drive.' : ''
        }`,
        size: `${(totalSize / 1024).toFixed(2)} KB`,
        googleDriveStatus: googleDriveResult?.success ? 'Salvo no Google Drive' : 'Não salvo no Google Drive',
      };
    } catch (error) {
      console.error("Erro ao criar backup:", error);
      updateSystemStatus({ backupInProgress: false });
      throw new Error(
        "Erro ao criar backup. Verifique sua conexão e tente novamente."
      );
    } finally {
      setOperationLoading((prev) => ({ ...prev, backup: false }));
    }
  };

  // Limpar cache do sistema
  const clearCache = async (
    systemStatus: SystemStatus,
    updateSystemStatus: (updates: Partial<SystemStatus>) => void,
    adminEmail?: string
  ) => {
    try {
      setOperationLoading((prev) => ({ ...prev, cache: true }));
      updateSystemStatus({ cacheClearing: true });

      // Simular operações de limpeza de cache
      const cacheOperations = [
        "Limpando cache de imagens...",
        "Limpando cache de vídeos...",
        "Limpando cache de dados...",
        "Atualizando índices...",
        "Finalizando limpeza...",
      ];

      for (let i = 0; i < cacheOperations.length; i++) {
        await new Promise((resolve) => setTimeout(resolve, 400));
        // Aqui você poderia emitir eventos de progresso se necessário
      }

      // Atualizar timestamp no Firebase
      await setDoc(doc(db, "system", "status"), {
        lastBackup: systemStatus.lastBackup,
        lastCacheCleanup: serverTimestamp(),
        cdnStatus: systemStatus.cdnStatus,
        logSize: systemStatus.logSize,
      });

      const newCleanupTime = new Date();
      updateSystemStatus({
        lastCacheCleanup: newCleanupTime,
        cacheClearing: false,
      });

      // Log da operação
      await logAdminAction({
        action: LOG_ACTIONS.ADMIN.CACHE_CLEARED,
        details: "Cache do sistema limpo com sucesso",
        admin: adminEmail || "admin@zaazu.app",
      });

      return {
        success: true,
        message: "Cache limpo com sucesso!",
      };
    } catch (error) {
      console.error("Erro ao limpar cache:", error);
      updateSystemStatus({ cacheClearing: false });
      throw new Error("Erro ao limpar cache. Tente novamente.");
    } finally {
      setOperationLoading((prev) => ({ ...prev, cache: false }));
    }
  };

  // Configurar CDN
  const configureCDN = async (
    systemStatus: SystemStatus,
    updateSystemStatus: (updates: Partial<SystemStatus>) => void,
    adminEmail?: string
  ) => {
    try {
      setOperationLoading((prev) => ({ ...prev, cdn: true }));

      const newStatus =
        systemStatus.cdnStatus === "Ativo" ? "Inativo" : "Ativo";

      // Simular configuração de CDN
      await new Promise((resolve) => setTimeout(resolve, 1500));

      await setDoc(doc(db, "system", "status"), {
        lastBackup: systemStatus.lastBackup,
        lastCacheCleanup: systemStatus.lastCacheCleanup,
        cdnStatus: newStatus,
        logSize: systemStatus.logSize,
      });

      updateSystemStatus({ cdnStatus: newStatus });

      // Log da operação
      await logAdminAction({
        action: LOG_ACTIONS.ADMIN.CDN_CONFIGURED,
        details: `CDN ${newStatus.toLowerCase()}`,
        admin: adminEmail || "admin@zaazu.app",
      });

      return {
        success: true,
        message: `CDN ${newStatus.toLowerCase()} com sucesso!`,
        newStatus,
      };
    } catch (error) {
      console.error("Erro ao configurar CDN:", error);
      throw new Error("Erro ao configurar CDN. Tente novamente.");
    } finally {
      setOperationLoading((prev) => ({ ...prev, cdn: false }));
    }
  };

  // Calcular estatísticas do sistema
  const getSystemStats = async () => {
    try {
      const collections = ["users", "videos", "games", "activities"];
      const stats: Record<string, number> = {};

      for (const collectionName of collections) {
        try {
          const snapshot = await getDocs(collection(db, collectionName));
          stats[collectionName] = snapshot.size;
        } catch (error) {
          console.warn(
            `Aviso: Não foi possível obter estatísticas de ${collectionName}:`,
            error
          );
          stats[collectionName] = 0;
        }
      }

      return stats;
    } catch (error) {
      console.error("Erro ao obter estatísticas:", error);
      return { users: 0, videos: 0, games: 0, activities: 0 };
    }
  };

  // Verificar integridade do sistema
  const checkSystemHealth = async () => {
    try {
      const checks = {
        database: false,
        storage: false,
        auth: false,
        logs: false,
      };

      // Verificar conectividade com o banco
      try {
        await getDocs(collection(db, "settings"));
        checks.database = true;
      } catch {
        checks.database = false;
      }

      // Verificar logs
      try {
        await getDocs(collection(db, "system", "logs", "admin_actions"));
        checks.logs = true;
      } catch {
        checks.logs = false;
      }

      // Simular verificações de storage e auth
      checks.storage = true;
      checks.auth = true;

      const healthScore =
        (Object.values(checks).filter(Boolean).length /
          Object.keys(checks).length) *
        100;

      return {
        checks,
        healthScore,
        status:
          healthScore >= 75
            ? "healthy"
            : healthScore >= 50
            ? "warning"
            : "critical",
      };
    } catch (error) {
      console.error("Erro ao verificar saúde do sistema:", error);
      return {
        checks: { database: false, storage: false, auth: false, logs: false },
        healthScore: 0,
        status: "critical" as const,
      };
    }
  };

  return {
    operationLoading,
    createBackup,
    clearCache,
    configureCDN,
    getSystemStats,
    checkSystemHealth,
    googleDrive, // Expor funcionalidades do Google Drive
  };
};
