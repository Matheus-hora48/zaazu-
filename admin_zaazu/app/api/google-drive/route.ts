import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';

interface GoogleDriveRequest {
  action: 'upload' | 'list' | 'download' | 'delete' | 'auth' | 'cleanup';
  data?: Record<string, unknown>;
  config?: {
    clientId: string;
    clientSecret: string;
    redirectUri: string;
    refreshToken?: string;
  };
  fileId?: string;
  authCode?: string;
  keepCount?: number;
}

export async function POST(request: NextRequest) {
  try {
    const body: GoogleDriveRequest = await request.json();
    const { action, data, config, fileId, authCode, keepCount } = body;

    if (!config) {
      return NextResponse.json(
        { error: 'Configuração do Google Drive não fornecida' },
        { status: 400 }
      );
    }

    const auth = new google.auth.OAuth2(
      config.clientId,
      config.clientSecret,
      config.redirectUri
    );

    if (config.refreshToken) {
      auth.setCredentials({
        refresh_token: config.refreshToken
      });
    }

    const drive = google.drive({ version: 'v3', auth });

    switch (action) {
      case 'auth': {
        if (!authCode) {
          return NextResponse.json(
            { error: 'Código de autorização não fornecido' },
            { status: 400 }
          );
        }

        const { tokens } = await auth.getToken(authCode);
        return NextResponse.json({ tokens });
      }

      case 'upload': {
        if (!data) {
          return NextResponse.json(
            { error: 'Dados do backup não fornecidos' },
            { status: 400 }
          );
        }

        // Verificar/criar pasta de backup
        const folderResponse = await drive.files.list({
          q: "name='Zaazu_Backups' and mimeType='application/vnd.google-apps.folder' and trashed=false",
          fields: 'files(id, name)',
          spaces: 'drive'
        });

        let folderId;
        if (folderResponse.data.files && folderResponse.data.files.length > 0) {
          folderId = folderResponse.data.files[0].id;
        } else {
          const folderMetadata = {
            name: 'Zaazu_Backups',
            mimeType: 'application/vnd.google-apps.folder',
            parents: ['root']
          };

          const folder = await drive.files.create({
            requestBody: folderMetadata,
            fields: 'id'
          });

          folderId = folder.data.id;
        }

        // Upload do arquivo
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const fileName = `zaazu-backup-${timestamp}.json`;
        
        const backupContent = JSON.stringify({
          ...data,
          exportedAt: new Date().toISOString(),
        }, null, 2);

        const media = {
          mimeType: 'application/json',
          body: backupContent
        };

        const fileMetadata = {
          name: fileName,
          parents: folderId ? [folderId] : ['root'],
          description: `Backup automático do sistema Zaazu - ${new Date().toLocaleString('pt-BR')}`
        };

        const response = await drive.files.create({
          requestBody: fileMetadata,
          media: media,
          fields: 'id, name, size'
        });

        const fileSizeKB = (backupContent.length / 1024).toFixed(2);

        return NextResponse.json({
          success: true,
          fileId: response.data.id || '',
          fileName: fileName,
          size: `${fileSizeKB} KB`,
          message: `Backup salvo automaticamente no Google Drive: ${fileName}`
        });
      }

      case 'list': {
        // Buscar pasta de backup
        const folderResponse = await drive.files.list({
          q: "name='Zaazu_Backups' and mimeType='application/vnd.google-apps.folder' and trashed=false",
          fields: 'files(id, name)',
          spaces: 'drive'
        });

        if (!folderResponse.data.files || folderResponse.data.files.length === 0) {
          return NextResponse.json([]);
        }

        const folderId = folderResponse.data.files[0].id;

        const response = await drive.files.list({
          q: `'${folderId}' in parents and name contains 'zaazu-backup' and trashed=false`,
          orderBy: 'createdTime desc',
          pageSize: 20,
          fields: 'files(id, name, size, createdTime, description)'
        });

        return NextResponse.json(response.data.files || []);
      }

      case 'download': {
        if (!fileId) {
          return NextResponse.json(
            { error: 'ID do arquivo não fornecido' },
            { status: 400 }
          );
        }

        const response = await drive.files.get({
          fileId: fileId,
          alt: 'media'
        });

        return NextResponse.json(JSON.parse(response.data as string));
      }

      case 'delete': {
        if (!fileId) {
          return NextResponse.json(
            { error: 'ID do arquivo não fornecido' },
            { status: 400 }
          );
        }

        await drive.files.delete({
          fileId: fileId
        });

        return NextResponse.json({ success: true });
      }

      case 'cleanup': {
        // Buscar pasta de backup
        const folderResponse = await drive.files.list({
          q: "name='Zaazu_Backups' and mimeType='application/vnd.google-apps.folder' and trashed=false",
          fields: 'files(id, name)',
          spaces: 'drive'
        });

        if (!folderResponse.data.files || folderResponse.data.files.length === 0) {
          return NextResponse.json({ deletedCount: 0 });
        }

        const folderId = folderResponse.data.files[0].id;

        const backupsResponse = await drive.files.list({
          q: `'${folderId}' in parents and name contains 'zaazu-backup' and trashed=false`,
          orderBy: 'createdTime desc',
          pageSize: 100,
          fields: 'files(id, name, createdTime)'
        });

        const backups = backupsResponse.data.files || [];
        const keepNumber = keepCount || 10;
        
        if (backups.length <= keepNumber) {
          return NextResponse.json({ deletedCount: 0 });
        }

        const backupsToDelete = backups.slice(keepNumber);
        let deletedCount = 0;

        for (const backup of backupsToDelete) {
          if (backup.id) {
            try {
              await drive.files.delete({ fileId: backup.id });
              deletedCount++;
            } catch (error) {
              console.error('Erro ao deletar backup:', backup.name, error);
            }
          }
        }

        return NextResponse.json({ deletedCount });
      }

      default:
        return NextResponse.json(
          { error: 'Ação não reconhecida' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Erro na API do Google Drive:', error);
    return NextResponse.json(
      { 
        error: 'Erro interno do servidor',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    );
  }
}
