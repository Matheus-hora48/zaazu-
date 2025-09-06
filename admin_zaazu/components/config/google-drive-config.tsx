import React, { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Card } from "../ui/card";
import {
  Cloud,
  Check,
  AlertCircle,
  ExternalLink,
  Download,
  Trash2,
  RefreshCw,
} from "lucide-react";

interface GoogleDriveConfigProps {
  googleDrive: {
    authState: {
      isAuthenticated: boolean;
      isConfigured: boolean;
      authUrl?: string;
      error?: string;
    };
    backupFiles: Array<{
      id: string;
      name: string;
      size: string;
      createdTime: string;
      description?: string;
    }>;
    loading: boolean;
    initializeDrive: (config: {
      clientId: string;
      clientSecret: string;
      redirectUri: string;
      refreshToken?: string;
    }) => boolean;
    completeAuth: (authCode: string) => Promise<boolean>;
    listBackups: (limit?: number) => Promise<
      Array<{
        id: string;
        name: string;
        size: string;
        createdTime: string;
        description?: string;
      }>
    >;
    downloadBackup: (fileId: string) => Promise<{
      data: Record<string, unknown>;
      createdAt: Date | object;
      size: number;
      collections: number;
      version: string;
      admin: string;
    }>;
    deleteBackup: (fileId: string) => Promise<boolean>;
    cleanupOldBackups: (keepCount?: number) => Promise<number>;
    resetConfiguration: () => void;
  };
}

export default function GoogleDriveConfig({
  googleDrive,
}: GoogleDriveConfigProps) {
  const [config, setConfig] = useState({
    clientId: "",
    clientSecret: "",
    redirectUri: "http://localhost:3001/configuracoes",
  });
  const [authCode, setAuthCode] = useState("");
  const [showBackups, setShowBackups] = useState(false);

  const handleConfigSave = () => {
    const success = googleDrive.initializeDrive(config);
    if (success) {
      // Configuração salva com sucesso
    }
  };

  const handleAuthComplete = async () => {
    if (!authCode.trim()) return;

    const success = await googleDrive.completeAuth(authCode.trim());
    if (success) {
      setAuthCode("");
      // Listar backups após autenticação
      await googleDrive.listBackups();
    }
  };

  const handleListBackups = async () => {
    await googleDrive.listBackups();
    setShowBackups(true);
  };

  const handleDownloadBackup = async (fileId: string, fileName: string) => {
    try {
      const backup = await googleDrive.downloadBackup(fileId);

      // Criar download do arquivo
      const blob = new Blob([JSON.stringify(backup, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Erro ao baixar backup:", error);
    }
  };

  const handleDeleteBackup = async (fileId: string) => {
    if (confirm("Tem certeza que deseja deletar este backup?")) {
      await googleDrive.deleteBackup(fileId);
    }
  };

  const handleCleanupOldBackups = async () => {
    if (
      confirm(
        "Deseja manter apenas os 10 backups mais recentes e deletar os demais?"
      )
    ) {
      const deletedCount = await googleDrive.cleanupOldBackups(10);
      alert(`${deletedCount} backups antigos foram removidos.`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Configuração Inicial */}
      <Card className="p-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
            <Cloud className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Configuração do Google Drive
            </h3>
            <p className="text-sm text-gray-500">
              Configure o backup automático para Google Drive
            </p>
          </div>
        </div>

        {!googleDrive.authState.isConfigured ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="clientId">Client ID</Label>
                <Input
                  id="clientId"
                  type="text"
                  placeholder="Seu Google Client ID"
                  value={config.clientId}
                  onChange={(e) =>
                    setConfig((prev) => ({ ...prev, clientId: e.target.value }))
                  }
                />
              </div>
              <div>
                <Label htmlFor="clientSecret">Client Secret</Label>
                <Input
                  id="clientSecret"
                  type="password"
                  placeholder="Seu Google Client Secret"
                  value={config.clientSecret}
                  onChange={(e) =>
                    setConfig((prev) => ({
                      ...prev,
                      clientSecret: e.target.value,
                    }))
                  }
                />
              </div>
            </div>
            <div>
              <Label htmlFor="redirectUri">Redirect URI</Label>
              <Input
                id="redirectUri"
                type="text"
                value={config.redirectUri}
                onChange={(e) =>
                  setConfig((prev) => ({
                    ...prev,
                    redirectUri: e.target.value,
                  }))
                }
              />
              <p className="text-xs text-gray-500 mt-1">
                Configure esta URL no console do Google Cloud
              </p>
            </div>
            <Button
              onClick={handleConfigSave}
              disabled={!config.clientId || !config.clientSecret}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              Salvar Configuração
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Status da Autenticação */}
            <div
              className={`p-4 rounded-lg ${
                googleDrive.authState.isAuthenticated
                  ? "bg-green-50 border border-green-200"
                  : "bg-yellow-50 border border-yellow-200"
              }`}
            >
              <div className="flex items-center space-x-2">
                {googleDrive.authState.isAuthenticated ? (
                  <>
                    <Check className="w-5 h-5 text-green-600" />
                    <span className="text-green-800 font-medium">
                      Google Drive conectado e configurado
                    </span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-5 h-5 text-yellow-600" />
                    <span className="text-yellow-800 font-medium">
                      Autenticação necessária
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Autorização */}
            {!googleDrive.authState.isAuthenticated &&
              googleDrive.authState.authUrl && (
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <Button
                      onClick={() =>
                        window.open(googleDrive.authState.authUrl, "_blank")
                      }
                      variant="outline"
                      className="flex items-center gap-2"
                    >
                      <ExternalLink className="w-4 h-4" />
                      Autorizar Google Drive
                    </Button>
                  </div>

                  <div className="flex gap-2">
                    <Input
                      placeholder="Cole o código de autorização aqui"
                      value={authCode}
                      onChange={(e) => setAuthCode(e.target.value)}
                      className="flex-1"
                    />
                    <Button
                      onClick={handleAuthComplete}
                      disabled={!authCode.trim() || googleDrive.loading}
                      className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
                    >
                      {googleDrive.loading ? "Processando..." : "Concluir"}
                    </Button>
                  </div>
                </div>
              )}

            {/* Ações */}
            {googleDrive.authState.isAuthenticated && (
              <div className="flex gap-2 flex-wrap">
                <Button
                  onClick={handleListBackups}
                  variant="outline"
                  className="flex items-center gap-2"
                  disabled={googleDrive.loading}
                >
                  <RefreshCw className="w-4 h-4" />
                  Listar Backups
                </Button>

                <Button
                  onClick={handleCleanupOldBackups}
                  variant="outline"
                  className="flex items-center gap-2"
                  disabled={googleDrive.loading}
                >
                  <Trash2 className="w-4 h-4" />
                  Limpar Antigos
                </Button>

                <Button
                  onClick={googleDrive.resetConfiguration}
                  variant="outline"
                  className="flex items-center gap-2 text-red-600 border-red-300 hover:bg-red-50"
                >
                  Resetar Configuração
                </Button>
              </div>
            )}
          </div>
        )}

        {googleDrive.authState.error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800 text-sm">
              {googleDrive.authState.error}
            </p>
          </div>
        )}
      </Card>

      {/* Lista de Backups */}
      {showBackups && googleDrive.backupFiles.length > 0 && (
        <Card className="p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">
            Backups no Google Drive ({googleDrive.backupFiles.length})
          </h4>

          <div className="space-y-3">
            {googleDrive.backupFiles.map((file) => (
              <div
                key={file.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{file.name}</p>
                  <p className="text-sm text-gray-500">
                    {file.size} • {file.createdTime}
                  </p>
                  {file.description && (
                    <p className="text-xs text-gray-400">{file.description}</p>
                  )}
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={() => handleDownloadBackup(file.id, file.name)}
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-1"
                  >
                    <Download className="w-3 h-3" />
                    Baixar
                  </Button>
                  <Button
                    onClick={() => handleDeleteBackup(file.id)}
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-1 text-red-600 border-red-300 hover:bg-red-50"
                  >
                    <Trash2 className="w-3 h-3" />
                    Deletar
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
