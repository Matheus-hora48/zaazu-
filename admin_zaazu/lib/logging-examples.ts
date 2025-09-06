/**
 * Exemplos de como usar o sistema de logging em outras partes do sistema
 * Este arquivo demonstra como integrar o logging tanto no painel admin quanto no app Flutter
 */

import { logAdminAction, logAppAction, LOG_ACTIONS } from "@/lib/logging";

// ========== EXEMPLOS DE USO NO PAINEL ADMIN ==========

/**
 * Exemplo: Logging quando um admin cria um usuário
 */
export const handleCreateUser = async (
  userData: { name: string; email: string; [key: string]: unknown },
  adminEmail: string
) => {
  try {
    // Lógica para criar o usuário...

    // Registrar log da ação
    await logAdminAction({
      action: LOG_ACTIONS.ADMIN.USER_CREATED,
      details: `Usuário ${userData.name} (${userData.email}) criado`,
      admin: adminEmail,
    });

    console.log("Usuário criado e log registrado com sucesso");
  } catch (error) {
    console.error("Erro ao criar usuário:", error);
  }
};

/**
 * Exemplo: Logging quando um admin aprova um vídeo
 */
export const handleApproveVideo = async (
  videoId: string,
  videoTitle: string,
  adminEmail: string
) => {
  try {
    // Lógica para aprovar o vídeo...

    // Registrar log da ação
    await logAdminAction({
      action: LOG_ACTIONS.ADMIN.VIDEO_APPROVED,
      details: `Vídeo aprovado: ${videoTitle} (ID: ${videoId})`,
      admin: adminEmail,
    });

    console.log("Vídeo aprovado e log registrado");
  } catch (error) {
    console.error("Erro ao aprovar vídeo:", error);
  }
};

/**
 * Exemplo: Logging quando um admin faz login
 */
export const handleAdminLogin = async (adminEmail: string) => {
  try {
    await logAdminAction({
      action: LOG_ACTIONS.ADMIN.LOGIN,
      details: "Login realizado no painel administrativo",
      admin: adminEmail,
    });
  } catch (error) {
    console.error("Erro ao registrar login do admin:", error);
  }
};

// ========== EXEMPLOS DE USO NO APP FLUTTER ==========
// Estas funções seriam chamadas a partir do Flutter via API

/**
 * Exemplo: API endpoint para logging de login do usuário
 * Esta função seria chamada pelo Flutter quando um usuário faz login
 */
export const handleUserLogin = async (userEmail: string, userId: string) => {
  try {
    await logAppAction({
      action: LOG_ACTIONS.APP.USER_LOGIN,
      details: "Usuário fez login no aplicativo",
      user: userEmail,
      userId: userId,
    });
  } catch (error) {
    console.error("Erro ao registrar login do usuário:", error);
  }
};

/**
 * Exemplo: Logging quando um usuário assiste a um vídeo
 * Esta função seria chamada pelo Flutter quando um vídeo é assistido
 */
export const handleVideoWatched = async (
  userEmail: string,
  userId: string,
  videoTitle: string,
  videoId: string,
  sessionId?: string
) => {
  try {
    await logAppAction({
      action: LOG_ACTIONS.APP.VIDEO_WATCHED,
      details: `Vídeo assistido: ${videoTitle}`,
      user: userEmail,
      userId: userId,
      sessionId: sessionId,
    });
  } catch (error) {
    console.error("Erro ao registrar visualização de vídeo:", error);
  }
};

/**
 * Exemplo: Logging quando um usuário completa uma atividade
 */
export const handleActivityCompleted = async (
  userEmail: string,
  userId: string,
  activityName: string,
  score?: number,
  timeSpent?: number
) => {
  try {
    await logAppAction({
      action: LOG_ACTIONS.APP.ACTIVITY_COMPLETED,
      details: `Atividade concluída: ${activityName}${
        score ? ` - Pontuação: ${score}` : ""
      }${timeSpent ? ` - Tempo: ${timeSpent}s` : ""}`,
      user: userEmail,
      userId: userId,
    });
  } catch (error) {
    console.error("Erro ao registrar conclusão de atividade:", error);
  }
};

/**
 * Exemplo: Logging quando um usuário inicia um jogo
 */
export const handleGameStarted = async (
  userEmail: string,
  userId: string,
  gameName: string,
  gameId: string,
  deviceInfo?: string
) => {
  try {
    await logAppAction({
      action: LOG_ACTIONS.APP.GAME_STARTED,
      details: `Jogo iniciado: ${gameName}`,
      user: userEmail,
      userId: userId,
      deviceInfo: deviceInfo,
    });
  } catch (error) {
    console.error("Erro ao registrar início de jogo:", error);
  }
};

/**
 * Exemplo: Logging de erro no aplicativo
 */
export const handleAppError = async (
  userEmail: string,
  userId: string,
  errorMessage: string,
  errorCode?: string,
  sessionId?: string
) => {
  try {
    await logAppAction({
      action: LOG_ACTIONS.APP.ERROR_OCCURRED,
      details: `Erro: ${errorMessage}${
        errorCode ? ` (Código: ${errorCode})` : ""
      }`,
      user: userEmail,
      userId: userId,
      sessionId: sessionId,
    });
  } catch (error) {
    console.error("Erro ao registrar erro do app:", error);
  }
};

/**
 * Exemplo: Logging de início de sessão
 */
export const handleSessionStarted = async (
  userEmail: string,
  userId: string,
  sessionId: string,
  deviceInfo?: string
) => {
  try {
    await logAppAction({
      action: LOG_ACTIONS.APP.SESSION_STARTED,
      details: `Sessão iniciada - ID: ${sessionId}`,
      user: userEmail,
      userId: userId,
      sessionId: sessionId,
      deviceInfo: deviceInfo,
    });
  } catch (error) {
    console.error("Erro ao registrar início de sessão:", error);
  }
};

// ========== EXEMPLO DE API ROUTES PARA O FLUTTER ==========

/**
 * Exemplo de como criar uma API route para receber logs do Flutter
 * Arquivo: app/api/logs/route.ts
 */
export const exampleApiRoute = `
import { NextRequest, NextResponse } from 'next/server';
import { logAppAction, LOG_ACTIONS } from '@/lib/logging';

export async function POST(request: NextRequest) {
  try {
    const { action, details, user, userId, sessionId, deviceInfo } = await request.json();

    // Validar dados recebidos
    if (!action || !details || !user) {
      return NextResponse.json(
        { error: 'Dados obrigatórios não fornecidos' },
        { status: 400 }
      );
    }

    // Registrar log
    await logAppAction({
      action,
      details,
      user,
      userId,
      sessionId,
      deviceInfo,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erro ao processar log:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
`;

// ========== EXEMPLO DE CÓDIGO DART PARA FLUTTER ==========

export const flutterExampleCode = `
// Exemplo de como enviar logs do Flutter para o servidor

import 'dart:convert';
import 'package:http/http.dart' as http;

class LoggingService {
  static const String baseUrl = 'https://zaazu.app';
  
  // Registrar login do usuário
  static Future<void> logUserLogin(String userEmail, String userId) async {
    await _sendLog({
      'action': 'user_login',
      'details': 'Usuário fez login no aplicativo',
      'user': userEmail,
      'userId': userId,
    });
  }
  
  // Registrar visualização de vídeo
  static Future<void> logVideoWatched(
    String userEmail, 
    String userId, 
    String videoTitle
  ) async {
    await _sendLog({
      'action': 'video_watched',
      'details': 'Vídeo assistido: \$videoTitle',
      'user': userEmail,
      'userId': userId,
    });
  }
  
  // Registrar conclusão de atividade
  static Future<void> logActivityCompleted(
    String userEmail,
    String userId,
    String activityName,
    int score,
  ) async {
    await _sendLog({
      'action': 'activity_completed',
      'details': 'Atividade concluída: \$activityName - Pontuação: \$score',
      'user': userEmail,
      'userId': userId,
    });
  }
  
  // Registrar erro
  static Future<void> logError(
    String userEmail,
    String userId,
    String errorMessage,
  ) async {
    await _sendLog({
      'action': 'error_occurred',
      'details': 'Erro: \$errorMessage',
      'user': userEmail,
      'userId': userId,
    });
  }
  
  // Função privada para enviar log
  static Future<void> _sendLog(Map<String, dynamic> logData) async {
    try {
      final response = await http.post(
        Uri.parse('\$baseUrl/api/logs'),
        headers: {
          'Content-Type': 'application/json',
        },
        body: json.encode(logData),
      );
      
      if (response.statusCode != 200) {
        print('Erro ao enviar log: \${response.statusCode}');
      }
    } catch (e) {
      print('Erro ao enviar log: \$e');
    }
  }
}
`;

console.log("Exemplos de logging disponíveis:", {
  admin: "handleCreateUser, handleApproveVideo, handleAdminLogin",
  app: "handleUserLogin, handleVideoWatched, handleActivityCompleted",
  flutter: "LoggingService class com métodos para enviar logs",
});
