// Serviço alternativo para upload local de thumbnails
// Use este se quiser salvar as imagens nas pastas do projeto em vez do Firebase Storage

export const localThumbnailService = {
  async uploadThumbnail(file: File, type: 'videos' | 'jogos' | 'atividades', id: string): Promise<string> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);
    formData.append('id', id);

    const response = await fetch('/api/upload-thumbnail', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Erro ao fazer upload da thumbnail');
    }

    const result = await response.json();
    return result.url;
  },

  // Função para deletar thumbnail local (opcional)
  async deleteThumbnail(type: 'videos' | 'jogos' | 'atividades', id: string): Promise<void> {
    // Esta funcionalidade pode ser implementada se necessário
    // Por enquanto, as imagens antigas permanecerão no servidor
    console.log(`Thumbnail ${type}/${id} deveria ser deletada`);
  }
};

// Exemplo de como usar nos serviços:
/*
// No lugar de:
const thumbnailUrl = await videoService.uploadThumbnail(thumbnailFile, videoId);

// Use:
const thumbnailUrl = await localThumbnailService.uploadThumbnail(thumbnailFile, 'videos', videoId);
*/
