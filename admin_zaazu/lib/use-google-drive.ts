import { useState, useEffect } from "react";
import { GoogleDriveService } from "./google-drive-service-client";

interface GoogleDriveConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  refreshToken?: string;
}

interface DriveAuthState {
  isAuthenticated: boolean;
  isConfigured: boolean;
  authUrl?: string;
  error?: string;
}

interface BackupFile {
  id: string;
  name: string;
  size: string;
  createdTime: string;
  description?: string;
}

export const useGoogleDrive = () => {
  const [driveService, setDriveService] = useState<GoogleDriveService | null>(
    null
  );
  const [authState, setAuthState] = useState<DriveAuthState>({
    isAuthenticated: false,
    isConfigured: false,
  });
  const [backupFiles, setBackupFiles] = useState<BackupFile[]>([]);
  const [loading, setLoading] = useState(false);

  // Inicializar serviço do Google Drive
  const initializeDrive = (config: GoogleDriveConfig) => {
    try {
      const service = new GoogleDriveService(config);
      setDriveService(service);

      setAuthState({
        isAuthenticated: service.isAuthenticated(),
        isConfigured: true,
        authUrl: service.isAuthenticated()
          ? undefined
          : service.generateAuthUrl(),
      });

      // Salvar configuração no localStorage para persistência
      localStorage.setItem(
        "googleDriveConfig",
        JSON.stringify({
          clientId: config.clientId,
          clientSecret: config.clientSecret,
          redirectUri: config.redirectUri,
          refreshToken: config.refreshToken,
        })
      );

      return true;
    } catch (error) {
      console.error("Erro ao inicializar Google Drive:", error);
      setAuthState((prev) => ({
        ...prev,
        error:
          error instanceof Error
            ? error.message
            : "Erro ao configurar Google Drive",
      }));
      return false;
    }
  };

  // Carregar configuração salva
  useEffect(() => {
    const savedConfig = localStorage.getItem("googleDriveConfig");
    if (savedConfig) {
      try {
        const config = JSON.parse(savedConfig);
        initializeDrive(config);
      } catch (error) {
        console.error("Erro ao carregar configuração do Google Drive:", error);
      }
    }
  }, []);

  // Completar autenticação com código
  const completeAuth = async (authCode: string) => {
    if (!driveService) {
      throw new Error("Serviço do Google Drive não inicializado");
    }

    try {
      setLoading(true);
      const tokens = await driveService.getTokensFromCode(authCode);

      // Atualizar configuração com refresh token
      const savedConfig = localStorage.getItem("googleDriveConfig");
      if (savedConfig) {
        const config = JSON.parse(savedConfig);
        config.refreshToken = tokens.refresh_token;
        localStorage.setItem("googleDriveConfig", JSON.stringify(config));

        // Reinicializar serviço com novo token
        initializeDrive(config);
      }

      setAuthState((prev) => ({
        ...prev,
        isAuthenticated: true,
        authUrl: undefined,
        error: undefined,
      }));

      return true;
    } catch (error) {
      console.error("Erro ao completar autenticação:", error);
      setAuthState((prev) => ({
        ...prev,
        error: error instanceof Error ? error.message : "Erro na autenticação",
      }));
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Upload automático de backup
  const uploadBackup = async (
    backupData: Record<string, unknown>,
    adminEmail: string
  ) => {
    if (!driveService || !authState.isAuthenticated) {
      throw new Error("Google Drive não configurado ou não autenticado");
    }

    try {
      setLoading(true);
      // Converter para BackupData format se necessário
      const hasDataProperty = "data" in backupData;
      const formattedBackupData = {
        data: hasDataProperty
          ? (backupData.data as Record<string, unknown>)
          : backupData,
        createdAt: ("createdAt" in backupData
          ? backupData.createdAt
          : new Date()) as Date,
        size: ("size" in backupData ? backupData.size : 0) as number,
        collections: ("collections" in backupData
          ? backupData.collections
          : 0) as number,
        version: ("version" in backupData
          ? backupData.version
          : "1.0") as string,
        admin: ("admin" in backupData
          ? backupData.admin
          : adminEmail) as string,
      };

      const result = await driveService.uploadBackup(
        formattedBackupData,
        adminEmail
      );

      if (result.success) {
        // Atualizar lista de backups
        await listBackups();
      }

      return result;
    } catch (error) {
      console.error("Erro ao fazer upload do backup:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Listar backups
  const listBackups = async (limit: number = 10) => {
    if (!driveService || !authState.isAuthenticated) {
      return [];
    }

    try {
      setLoading(true);
      const files = await driveService.listBackups(limit);

      const formattedFiles = files.map(
        (file: {
          id?: string;
          name?: string;
          size?: string;
          createdTime?: string;
          description?: string;
        }) => ({
          id: file.id || "",
          name: file.name || "",
          size: file.size
            ? `${(parseInt(file.size) / 1024).toFixed(2)} KB`
            : "N/A",
          createdTime: file.createdTime
            ? new Date(file.createdTime).toLocaleString("pt-BR")
            : "N/A",
          description: file.description || undefined,
        })
      );

      setBackupFiles(formattedFiles);
      return formattedFiles;
    } catch (error) {
      console.error("Erro ao listar backups:", error);
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Baixar backup
  const downloadBackup = async (fileId: string) => {
    if (!driveService || !authState.isAuthenticated) {
      throw new Error("Google Drive não configurado ou não autenticado");
    }

    try {
      setLoading(true);
      return await driveService.downloadBackup(fileId);
    } catch (error) {
      console.error("Erro ao baixar backup:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Deletar backup
  const deleteBackup = async (fileId: string) => {
    if (!driveService || !authState.isAuthenticated) {
      throw new Error("Google Drive não configurado ou não autenticado");
    }

    try {
      setLoading(true);
      const success = await driveService.deleteBackup(fileId);

      if (success) {
        // Atualizar lista de backups
        await listBackups();
      }

      return success;
    } catch (error) {
      console.error("Erro ao deletar backup:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Limpeza automática de backups antigos
  const cleanupOldBackups = async (keepCount: number = 10) => {
    if (!driveService || !authState.isAuthenticated) {
      throw new Error("Google Drive não configurado ou não autenticado");
    }

    try {
      setLoading(true);
      const deletedCount = await driveService.cleanupOldBackups(keepCount);

      if (deletedCount > 0) {
        // Atualizar lista de backups
        await listBackups();
      }

      return deletedCount;
    } catch (error) {
      console.error("Erro na limpeza de backups:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Resetar configuração
  const resetConfiguration = () => {
    localStorage.removeItem("googleDriveConfig");
    setDriveService(null);
    setAuthState({
      isAuthenticated: false,
      isConfigured: false,
    });
    setBackupFiles([]);
  };

  return {
    // Estado
    authState,
    backupFiles,
    loading,

    // Métodos
    initializeDrive,
    completeAuth,
    uploadBackup,
    listBackups,
    downloadBackup,
    deleteBackup,
    cleanupOldBackups,
    resetConfiguration,
  };
};
