import { google } from "googleapis";
import type { drive_v3 } from "googleapis";
import type { OAuth2Client } from "google-auth-library";

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
  private drive!: drive_v3.Drive;
  private auth!: OAuth2Client;
  private config: GoogleDriveConfig;

  constructor(config: GoogleDriveConfig) {
    this.config = config;
    this.initializeAuth();
  }

  private initializeAuth() {
    this.auth = new google.auth.OAuth2(
      this.config.clientId,
      this.config.clientSecret,
      this.config.redirectUri
    );

    if (this.config.refreshToken) {
      this.auth.setCredentials({
        refresh_token: this.config.refreshToken,
      });
    }

    this.drive = google.drive({ version: "v3", auth: this.auth });
  }

  // Gerar URL de autorização para obter tokens
  generateAuthUrl(): string {
    const scopes = [
      "https://www.googleapis.com/auth/drive.file",
      "https://www.googleapis.com/auth/drive.appfolder",
    ];

    return this.auth.generateAuthUrl({
      access_type: "offline",
      scope: scopes,
      prompt: "consent",
    });
  }

  // Trocar código de autorização por tokens
  async getTokensFromCode(code: string) {
    try {
      const { tokens } = await this.auth.getToken(code);
      this.auth.setCredentials(tokens);
      return tokens;
    } catch (error) {
      console.error("Erro ao obter tokens:", error);
      throw error;
    }
  }

  // Verificar se está autenticado
  isAuthenticated(): boolean {
    return !!(
      this.auth.credentials &&
      (this.auth.credentials.access_token ||
        this.auth.credentials.refresh_token)
    );
  }

  // Criar pasta de backup se não existir
  private async ensureBackupFolder(): Promise<string> {
    try {
      // Procurar pasta existente
      const response = await this.drive.files.list({
        q: "name='Zaazu_Backups' and mimeType='application/vnd.google-apps.folder' and trashed=false",
        fields: "files(id, name)",
        spaces: "drive",
      });

      if (response.data.files && response.data.files.length > 0) {
        return response.data.files[0].id || "";
      }

      // Criar nova pasta
      const folderMetadata = {
        name: "Zaazu_Backups",
        mimeType: "application/vnd.google-apps.folder",
        parents: ["root"],
      };

      const folder = await this.drive.files.create({
        requestBody: folderMetadata,
        fields: "id",
      });

      return folder.data.id || "";
    } catch (error) {
      console.error("Erro ao criar/encontrar pasta de backup:", error);
      throw error;
    }
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

      const folderId = await this.ensureBackupFolder();
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
      const fileName = `zaazu-backup-${timestamp}.json`;

      const backupContent = JSON.stringify(
        {
          ...backupData,
          exportedBy: adminEmail,
          exportedAt: new Date().toISOString(),
          version: "1.0",
        },
        null,
        2
      );

      const media = {
        mimeType: "application/json",
        body: backupContent,
      };

      const fileMetadata = {
        name: fileName,
        parents: [folderId],
        description: `Backup automático do sistema Zaazu - ${new Date().toLocaleString(
          "pt-BR"
        )}`,
      };

      const response = await this.drive.files.create({
        requestBody: fileMetadata,
        media: media,
        fields: "id, name, size",
      });

      const fileSizeKB = (backupContent.length / 1024).toFixed(2);

      return {
        success: true,
        fileId: response.data.id || undefined,
        fileName: fileName,
        size: `${fileSizeKB} KB`,
        message: `Backup salvo automaticamente no Google Drive: ${fileName}`,
      };
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

      const folderId = await this.ensureBackupFolder();

      const response = await this.drive.files.list({
        q: `'${folderId}' in parents and name contains 'zaazu-backup' and trashed=false`,
        orderBy: "createdTime desc",
        pageSize: limit,
        fields: "files(id, name, size, createdTime, description)",
      });

      return response.data.files || [];
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

      const response = await this.drive.files.get({
        fileId: fileId,
        alt: "media",
      });

      return JSON.parse(response.data as string);
    } catch (error) {
      console.error("Erro ao baixar backup:", error);
      throw error;
    }
  }

  // Deletar backup antigo
  async deleteBackup(fileId: string): Promise<boolean> {
    try {
      if (!this.isAuthenticated()) {
        throw new Error("Não autenticado no Google Drive");
      }

      await this.drive.files.delete({
        fileId: fileId,
      });

      return true;
    } catch (error) {
      console.error("Erro ao deletar backup:", error);
      return false;
    }
  }

  // Limpeza automática de backups antigos (manter apenas os N mais recentes)
  async cleanupOldBackups(keepCount: number = 10): Promise<number> {
    try {
      const backups = await this.listBackups(100); // Buscar mais para limpar

      if (backups.length <= keepCount) {
        return 0; // Nenhum backup para deletar
      }

      const backupsToDelete = backups.slice(keepCount);
      let deletedCount = 0;

      for (const backup of backupsToDelete) {
        if (backup.id) {
          const deleted = await this.deleteBackup(backup.id);
          if (deleted) deletedCount++;
        }
      }

      return deletedCount;
    } catch (error) {
      console.error("Erro na limpeza de backups:", error);
      return 0;
    }
  }
}
