import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { 
  Cloud, 
  Check, 
  AlertCircle, 
  ExternalLink, 
  Download,
  Trash2,
  RefreshCw,
  Info
} from 'lucide-react';

interface GoogleDriveSimpleConfigProps {
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
    listBackups: (limit?: number) => Promise<Array<{
      id: string;
      name: string;
      size: string;
      createdTime: string;
      description?: string;
    }>>;
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

export default function GoogleDriveSimpleConfig({ googleDrive }: GoogleDriveSimpleConfigProps) {
  const [showConfig, setShowConfig] = useState(!googleDrive.authState.isConfigured);
  const [config, setConfig] = useState({
    clientId: '',
    clientSecret: '',
    redirectUri: 'http://localhost:3001/configuracoes'
  });
  const [authCode, setAuthCode] = useState('');
  const [showBackups, setShowBackups] = useState(false);

  const handleConfigSave = () => {
    if (!config.clientId.trim() || !config.clientSecret.trim()) {
      alert('Por favor, preencha todos os campos obrigatórios');
      return;
    }
    
    const success = googleDrive.initializeDrive(config);
    if (success) {
      setShowConfig(false);
    }
  };

  const handleAuthComplete = async () => {
    if (!authCode.trim()) {
      alert('Por favor, cole o código de autorização');
      return;
    }
    
    const success = await googleDrive.completeAuth(authCode.trim());
    if (success) {
      setAuthCode('');
      alert('Google Drive conectado com sucesso!');
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
      
      const blob = new Blob([JSON.stringify(backup, null, 2)], {
        type: 'application/json'
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch {
      alert('Erro ao baixar backup. Tente novamente.');
    }
  };

  const handleDeleteBackup = async (fileId: string) => {
    if (confirm('Tem certeza que deseja deletar este backup?')) {
      const success = await googleDrive.deleteBackup(fileId);
      if (success) {
        alert('Backup deletado com sucesso!');
      }
    }
  };

  const handleCleanupOldBackups = async () => {
    if (confirm('Deseja manter apenas os 10 backups mais recentes?')) {
      const deletedCount = await googleDrive.cleanupOldBackups(10);
      alert(`${deletedCount} backups antigos foram removidos.`);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center text-gray-800">
          <Cloud className="mr-2 h-5 w-5" />
          Backup Google Drive
        </CardTitle>
        <CardDescription>
          Configure o backup automático para Google Drive
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status */}
        <div className={`p-3 rounded-lg flex items-center gap-2 ${
          googleDrive.authState.isAuthenticated
            ? 'bg-green-50 border border-green-200'
            : googleDrive.authState.isConfigured
            ? 'bg-yellow-50 border border-yellow-200'
            : 'bg-blue-50 border border-blue-200'
        }`}>
          {googleDrive.authState.isAuthenticated ? (
            <>
              <Check className="w-4 h-4 text-green-600" />
              <span className="text-green-800 text-sm font-medium">
                ✅ Google Drive conectado - Backup automático ativo
              </span>
            </>
          ) : googleDrive.authState.isConfigured ? (
            <>
              <AlertCircle className="w-4 h-4 text-yellow-600" />
              <span className="text-yellow-800 text-sm font-medium">
                ⚠️ Configurado - Autorização necessária
              </span>
            </>
          ) : (
            <>
              <Info className="w-4 h-4 text-blue-600" />
              <span className="text-blue-800 text-sm font-medium">
                ℹ️ Configuração necessária
              </span>
            </>
          )}
        </div>

        {/* Configuração Inicial */}
        {(showConfig || !googleDrive.authState.isConfigured) && (
          <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium text-gray-900">Configuração do Google Cloud</h4>
            <div className="space-y-2">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Client ID *
                </label>
                <Input
                  type="text"
                  placeholder="Ex: 123456789-abc.apps.googleusercontent.com"
                  value={config.clientId}
                  onChange={(e) => setConfig(prev => ({ ...prev, clientId: e.target.value }))}
                  className="text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Client Secret *
                </label>
                <Input
                  type="password"
                  placeholder="Seu Google Client Secret"
                  value={config.clientSecret}
                  onChange={(e) => setConfig(prev => ({ ...prev, clientSecret: e.target.value }))}
                  className="text-sm"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={handleConfigSave}
                  disabled={!config.clientId || !config.clientSecret}
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Salvar Configuração
                </Button>
                <Button
                  onClick={() => setShowConfig(false)}
                  variant="outline"
                  size="sm"
                  disabled={!googleDrive.authState.isConfigured}
                >
                  Cancelar
                </Button>
              </div>
              <p className="text-xs text-gray-500">
                💡 Precisa das credenciais? <a href="https://console.cloud.google.com/" target="_blank" className="text-blue-600 underline">Acesse o Google Cloud Console</a>
              </p>
            </div>
          </div>
        )}

        {/* Autorização */}
        {googleDrive.authState.isConfigured && !googleDrive.authState.isAuthenticated && (
          <div className="space-y-3 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
            <h4 className="font-medium text-yellow-800">Autorização Necessária</h4>
            <div className="space-y-2">
              <Button
                onClick={() => window.open(googleDrive.authState.authUrl, '_blank')}
                size="sm"
                className="bg-green-600 hover:bg-green-700 w-full"
              >
                <ExternalLink className="w-3 h-3 mr-1" />
                1. Autorizar no Google
              </Button>
              
              <div className="flex gap-2">
                <Input
                  placeholder="2. Cole o código aqui"
                  value={authCode}
                  onChange={(e) => setAuthCode(e.target.value)}
                  className="text-sm"
                />
                <Button
                  onClick={handleAuthComplete}
                  disabled={!authCode.trim() || googleDrive.loading}
                  size="sm"
                  className="bg-green-600 hover:bg-green-700"
                >
                  Conectar
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Ações quando conectado */}
        {googleDrive.authState.isAuthenticated && (
          <div className="space-y-3">
            <div className="flex gap-2 flex-wrap">
              <Button
                onClick={handleListBackups}
                variant="outline"
                size="sm"
                disabled={googleDrive.loading}
              >
                <RefreshCw className="w-3 h-3 mr-1" />
                Ver Backups
              </Button>
              
              <Button
                onClick={handleCleanupOldBackups}
                variant="outline"
                size="sm"
                disabled={googleDrive.loading}
              >
                <Trash2 className="w-3 h-3 mr-1" />
                Limpar Antigos
              </Button>
              
              <Button
                onClick={() => setShowConfig(true)}
                variant="outline"
                size="sm"
              >
                Reconfigurar
              </Button>
            </div>

            {/* Lista de Backups */}
            {showBackups && googleDrive.backupFiles.length > 0 && (
              <div className="max-h-40 overflow-y-auto border rounded-lg">
                <div className="p-2 bg-gray-50 border-b">
                  <span className="text-xs font-medium text-gray-700">
                    {googleDrive.backupFiles.length} backup(s) encontrado(s)
                  </span>
                </div>
                {googleDrive.backupFiles.slice(0, 5).map((file) => (
                  <div
                    key={file.id}
                    className="p-2 border-b last:border-b-0 flex items-center justify-between"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-gray-900 truncate">
                        {file.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {file.size} • {file.createdTime}
                      </p>
                    </div>
                    
                    <div className="flex gap-1 ml-2">
                      <Button
                        onClick={() => handleDownloadBackup(file.id, file.name)}
                        variant="outline"
                        size="sm"
                        className="h-6 px-2"
                      >
                        <Download className="w-3 h-3" />
                      </Button>
                      <Button
                        onClick={() => handleDeleteBackup(file.id)}
                        variant="outline"
                        size="sm"
                        className="h-6 px-2 text-red-600 border-red-300 hover:bg-red-50"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                ))}
                {googleDrive.backupFiles.length > 5 && (
                  <div className="p-2 bg-gray-50 text-center">
                    <span className="text-xs text-gray-500">
                      E mais {googleDrive.backupFiles.length - 5} backup(s)...
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {googleDrive.authState.error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800 text-sm">{googleDrive.authState.error}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
