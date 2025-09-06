import { NextRequest, NextResponse } from 'next/server';
import { logAppAction } from '@/lib/logging';

export async function POST(request: NextRequest) {
  try {
    const { action, details, user, userId, sessionId, deviceInfo } = await request.json();

    // Validar dados obrigatórios
    if (!action || !details || !user) {
      return NextResponse.json(
        { error: 'Dados obrigatórios não fornecidos (action, details, user)' },
        { status: 400 }
      );
    }

    // Registrar log do app
    await logAppAction({
      action,
      details,
      user,
      userId,
      sessionId,
      deviceInfo,
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Log registrado com sucesso' 
    });
  } catch (error) {
    console.error('Erro ao processar log do app:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'API de Logs do Sistema Zaazu',
    endpoints: {
      POST: 'Registrar novo log do aplicativo',
    },
    requiredFields: ['action', 'details', 'user'],
    optionalFields: ['userId', 'sessionId', 'deviceInfo'],
    example: {
      action: 'user_login',
      details: 'Usuário fez login no aplicativo',
      user: 'crianca@email.com',
      userId: 'user123',
      sessionId: 'session456',
      deviceInfo: 'Android 13, Samsung Galaxy'
    }
  });
}
