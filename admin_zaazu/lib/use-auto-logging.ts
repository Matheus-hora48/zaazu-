import { useAdminLogging } from "@/lib/use-admin-logging";

// Tipos para metadados de logging
interface LogMetadata {
  [key: string]: string | number | boolean | Date | null | undefined;
}

interface ChangeRecord {
  [key: string]: { old: string; new: string };
}

interface OperationResult {
  id?: string;
  [key: string]: unknown;
}

/**
 * Hook para logging automático em operações CRUD
 * Simplifica a implementação de logs em todas as telas
 */
export function useAutoLogging() {
  const logging = useAdminLogging();

  // Wrapper para operações que automaticamente fazem log
  const withLogging = {
    // Operações de usuário
    user: {
      create: async (
        operation: () => Promise<OperationResult>,
        userName: string,
        metadata?: LogMetadata
      ) => {
        try {
          const result = await operation();
          await logging.logCreate(
            "user",
            userName,
            result.id || String(result),
            metadata
          );
          return result;
        } catch (error) {
          await logging.logError(
            "user_creation",
            `Falha ao criar usuário: ${userName}`,
            error,
            metadata
          );
          throw error;
        }
      },

      update: async (
        operation: () => Promise<OperationResult>,
        userName: string,
        userId: string,
        changes?: ChangeRecord,
        metadata?: LogMetadata
      ) => {
        try {
          const result = await operation();
          await logging.logUpdate("user", userName, userId, changes, metadata);
          return result;
        } catch (error) {
          await logging.logError(
            "user_update",
            `Falha ao atualizar usuário: ${userName}`,
            error,
            metadata
          );
          throw error;
        }
      },

      delete: async (
        operation: () => Promise<OperationResult>,
        userName: string,
        userId: string,
        metadata?: LogMetadata
      ) => {
        try {
          const result = await operation();
          await logging.logDelete("user", userName, userId, metadata);
          return result;
        } catch (error) {
          await logging.logError(
            "user_deletion",
            `Falha ao excluir usuário: ${userName}`,
            error,
            metadata
          );
          throw error;
        }
      },

      roleChange: async (
        operation: () => Promise<OperationResult>,
        userName: string,
        userEmail: string,
        userId: string,
        previousRole: string,
        newRole: string,
        metadata?: LogMetadata
      ) => {
        try {
          const result = await operation();
          await logging.logRoleChange(
            userName,
            userEmail,
            userId,
            previousRole,
            newRole,
            metadata
          );
          return result;
        } catch (error) {
          await logging.logError(
            "user_role_change",
            `Falha ao alterar role do usuário: ${userName}`,
            error,
            metadata
          );
          throw error;
        }
      },
    },

    // Operações de vídeo
    video: {
      create: async (
        operation: () => Promise<OperationResult>,
        videoTitle: string,
        metadata?: LogMetadata
      ) => {
        try {
          const result = await operation();
          await logging.logCreate(
            "video",
            videoTitle,
            result.id || String(result),
            metadata
          );
          return result;
        } catch (error) {
          await logging.logError(
            "video_creation",
            `Falha ao criar vídeo: ${videoTitle}`,
            error,
            metadata
          );
          throw error;
        }
      },

      update: async (
        operation: () => Promise<OperationResult>,
        videoTitle: string,
        videoId: string,
        changes?: ChangeRecord,
        metadata?: LogMetadata
      ) => {
        try {
          const result = await operation();
          await logging.logUpdate(
            "video",
            videoTitle,
            videoId,
            changes,
            metadata
          );
          return result;
        } catch (error) {
          await logging.logError(
            "video_update",
            `Falha ao atualizar vídeo: ${videoTitle}`,
            error,
            metadata
          );
          throw error;
        }
      },

      delete: async (
        operation: () => Promise<OperationResult>,
        videoTitle: string,
        videoId: string,
        metadata?: LogMetadata
      ) => {
        try {
          const result = await operation();
          await logging.logDelete("video", videoTitle, videoId, metadata);
          return result;
        } catch (error) {
          await logging.logError(
            "video_deletion",
            `Falha ao excluir vídeo: ${videoTitle}`,
            error,
            metadata
          );
          throw error;
        }
      },
    },

    // Operações de atividade
    activity: {
      create: async (
        operation: () => Promise<OperationResult>,
        activityTitle: string,
        metadata?: LogMetadata
      ) => {
        try {
          const result = await operation();
          await logging.logCreate(
            "activity",
            activityTitle,
            result.id || String(result),
            metadata
          );
          return result;
        } catch (error) {
          await logging.logError(
            "activity_creation",
            `Falha ao criar atividade: ${activityTitle}`,
            error,
            metadata
          );
          throw error;
        }
      },

      update: async (
        operation: () => Promise<OperationResult>,
        activityTitle: string,
        activityId: string,
        changes?: ChangeRecord,
        metadata?: LogMetadata
      ) => {
        try {
          const result = await operation();
          await logging.logUpdate(
            "activity",
            activityTitle,
            activityId,
            changes,
            metadata
          );
          return result;
        } catch (error) {
          await logging.logError(
            "activity_update",
            `Falha ao atualizar atividade: ${activityTitle}`,
            error,
            metadata
          );
          throw error;
        }
      },

      delete: async (
        operation: () => Promise<OperationResult>,
        activityTitle: string,
        activityId: string,
        metadata?: LogMetadata
      ) => {
        try {
          const result = await operation();
          await logging.logDelete(
            "activity",
            activityTitle,
            activityId,
            metadata
          );
          return result;
        } catch (error) {
          await logging.logError(
            "activity_deletion",
            `Falha ao excluir atividade: ${activityTitle}`,
            error,
            metadata
          );
          throw error;
        }
      },
    },

    // Operações de jogo
    game: {
      create: async (
        operation: () => Promise<OperationResult>,
        gameTitle: string,
        metadata?: LogMetadata
      ) => {
        try {
          const result = await operation();
          await logging.logCreate(
            "game",
            gameTitle,
            result.id || String(result),
            metadata
          );
          return result;
        } catch (error) {
          await logging.logError(
            "game_creation",
            `Falha ao criar jogo: ${gameTitle}`,
            error,
            metadata
          );
          throw error;
        }
      },

      update: async (
        operation: () => Promise<OperationResult>,
        gameTitle: string,
        gameId: string,
        changes?: ChangeRecord,
        metadata?: LogMetadata
      ) => {
        try {
          const result = await operation();
          await logging.logUpdate("game", gameTitle, gameId, changes, metadata);
          return result;
        } catch (error) {
          await logging.logError(
            "game_update",
            `Falha ao atualizar jogo: ${gameTitle}`,
            error,
            metadata
          );
          throw error;
        }
      },

      delete: async (
        operation: () => Promise<OperationResult>,
        gameTitle: string,
        gameId: string,
        metadata?: LogMetadata
      ) => {
        try {
          const result = await operation();
          await logging.logDelete("game", gameTitle, gameId, metadata);
          return result;
        } catch (error) {
          await logging.logError(
            "game_deletion",
            `Falha ao excluir jogo: ${gameTitle}`,
            error,
            metadata
          );
          throw error;
        }
      },
    },

    // Operação de acesso a páginas
    pageAccess: async (
      pageName: string,
      itemsCount?: number,
      metadata?: LogMetadata
    ) => {
      try {
        await logging.logPageAccess(pageName, itemsCount, metadata);
      } catch (error) {
        console.error("Failed to log page access:", error);
      }
    },

    // Operações de configuração
    configChange: async (
      operation: () => Promise<OperationResult>,
      section: string,
      changes: string[],
      metadata?: LogMetadata
    ) => {
      try {
        const result = await operation();
        await logging.logConfigChange(section, changes, metadata);
        return result;
      } catch (error) {
        await logging.logError(
          "config_change",
          `Falha ao alterar configuração na seção: ${section}`,
          error,
          metadata
        );
        throw error;
      }
    },
  };

  return {
    ...logging,
    withLogging,
  };
}
