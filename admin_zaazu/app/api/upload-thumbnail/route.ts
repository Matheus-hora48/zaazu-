import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    const data = await request.formData();
    const file: File | null = data.get('file') as unknown as File;
    const type: string = data.get('type') as string; // 'videos', 'jogos', 'atividades'
    const id: string = data.get('id') as string;

    if (!file) {
      return NextResponse.json({ error: 'Nenhum arquivo foi enviado' }, { status: 400 });
    }

    if (!type || !['videos', 'jogos', 'atividades'].includes(type)) {
      return NextResponse.json({ error: 'Tipo inválido' }, { status: 400 });
    }

    if (!id) {
      return NextResponse.json({ error: 'ID é obrigatório' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Definir extensão baseada no tipo de arquivo
    const fileExtension = file.name.split('.').pop() || 'jpg';
    const fileName = `${id}.${fileExtension}`;

    // Criar diretório se não existir
    const uploadsDir = path.join(process.cwd(), 'public', 'thumbnails', type);
    await mkdir(uploadsDir, { recursive: true });

    // Salvar arquivo
    const filePath = path.join(uploadsDir, fileName);
    await writeFile(filePath, buffer);

    // Retornar URL pública
    const publicUrl = `/thumbnails/${type}/${fileName}`;

    return NextResponse.json({ 
      success: true, 
      url: publicUrl,
      message: 'Thumbnail salva com sucesso'
    });

  } catch (error) {
    console.error('Erro ao fazer upload da thumbnail:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' }, 
      { status: 500 }
    );
  }
}
