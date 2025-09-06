interface GoogleDriveConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  refreshToken?: string;
}

interface BackupUploadResult {
  success: boolean;
  fileId?: string;
  fileName: string;
  size: string;
  message: string;
}

interface BackupData {
  data: Record<string, unknown>;
  createdAt: Date | object;
  size: number;
  collections: number;
  version: string;
  admin: string;
}

export class GoogleDriveService {
  private config: GoogleDriveConfig;

  constructor(config: GoogleDriveConfig) {
    this.config = config;
  }

  // Gerar URL de autorização para obter tokens
  generateAuthUrl(): string {
    const scopes = [
      "https://www.googleapis.com/auth/drive.file",
      "https://www.googleapis.com/auth/drive.appfolder",
    ];

    const params = new URLSearchParams({
      client_id: this.config.clientId,
      redirect_uri: this.config.redirectUri,
      scope: scopes.join(" "),
      response_type: "code",
      access_type: "offline",
      prompt: "consent",
    });

    return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  }

  // Trocar código de autorização por tokens
  async getTokensFromCode(code: string) {
    try {
      const response = await fetch("/api/google-drive", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "auth",
          config: this.config,
          authCode: code,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Erro na autenticação");
      }

      const result = await response.json();
      return result.tokens;
    } catch (error) {
      console.error("Erro ao obter tokens:", error);
      throw error;
    }
  }

  // Verificar se está autenticado
  isAuthenticated(): boolean {
    return !!this.config.refreshToken;
  }

  // Upload do backup para Google Drive
  async uploadBackup(
    backupData: BackupData,
    adminEmail: string
  ): Promise<BackupUploadResult> {
    try {
      if (!this.isAuthenticated()) {
        throw new Error(
          "Não autenticado no Google Drive. Configure a autenticação primeiro."
        );
      }

      const response = await fetch("/api/google-drive", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "upload",
          config: this.config,
          data: {
            ...backupData,
            exportedBy: adminEmail,
          },
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Erro no upload");
      }

      return await response.json();
    } catch (error) {
      console.error("Erro ao fazer upload do backup:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Erro desconhecido";
      return {
        success: false,
        fileName: "backup-failed",
        size: "0 KB",
        message: `Erro ao salvar no Google Drive: ${errorMessage}`,
      };
    }
  }

  // Listar backups existentes
  async listBackups(limit: number = 10) {
    try {
      if (!this.isAuthenticated()) {
        throw new Error("Não autenticado no Google Drive");
      }

      const response = await fetch("/api/google-drive", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "list",
          config: this.config,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Erro ao listar backups");
      }

      return await response.json();
    } catch (error) {
      console.error("Erro ao listar backups:", error);
      throw error;
    }
  }

  // Baixar backup do Google Drive
  async downloadBackup(fileId: string): Promise<BackupData> {
    try {
      if (!this.isAuthenticated()) {
        throw new Error("Não autenticado no Google Drive");
      }

      const response = await fetch("/api/google-drive", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "download",
          config: this.config,
          fileId: fileId,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Erro ao baixar backup");
      }

      return await response.json();
    } catch (error) {
      console.error("Erro ao baixar backup:", error);
      throw error;
    }
  }

  // Deletar backup
  async deleteBackup(fileId: string): Promise<boolean> {
    try {
      if (!this.isAuthenticated()) {
        throw new Error("Não autenticado no Google Drive");
      }

      const response = await fetch("/api/google-drive", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "delete",
          config: this.config,
          fileId: fileId,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Erro ao deletar backup");
      }

      const result = await response.json();
      return result.success;
    } catch (error) {
      console.error("Erro ao deletar backup:", error);
      return false;
    }
  }

  // Limpeza automática de backups antigos (manter apenas os N mais recentes)
  async cleanupOldBackups(keepCount: number = 10): Promise<number> {
    try {
      if (!this.isAuthenticated()) {
        throw new Error("Não autenticado no Google Drive");
      }

      const response = await fetch("/api/google-drive", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "cleanup",
          config: this.config,
          keepCount: keepCount,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Erro na limpeza");
      }

      const result = await response.json();
      return result.deletedCount;
    } catch (error) {
      console.error("Erro na limpeza de backups:", error);
      return 0;
    }
  }
}
