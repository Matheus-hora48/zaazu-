"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DurationInput } from "@/components/ui/duration-input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { videoService } from "@/lib/services";
import { ContentTag } from "@/lib/types";
import { X, Upload, Video as VideoIcon, Tv, Hash, Play } from "lucide-react";
import { ContentTagSelector } from "@/components/ui/content-tag-selector";
import { MinAgeSelector } from "@/components/ui/min-age-selector";
import { logAdminAction } from "@/lib/logging";
import { useAuth } from "@/lib/auth-context";

interface AddVideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function AddVideoModal({
  isOpen,
  onClose,
  onSuccess,
}: AddVideoModalProps) {
  const { user: currentAdmin } = useAuth();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    url: "",
    category: "",
    minAge: 2,
    duration: 0,
    tag: "entretenimento" as ContentTag,
    // Campos para série
    isPartOfSeries: false,
    seriesTitle: "",
    seasonNumber: 1,
    episodeNumber: 1,
  });
  const [existingSeriesTitles, setExistingSeriesTitles] = useState<string[]>([]);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Preparar dados do vídeo
      const videoData = {
        ...formData,
        thumbnail: "", // Will be updated after upload
        isActive: true,
        views: 0,
        // Adicionar campos de série se aplicável
        ...(formData.isPartOfSeries && formData.seriesTitle && {
          seriesId: formData.seriesTitle.toLowerCase().replace(/\s+/g, '-'),
          seriesTitle: formData.seriesTitle,
          seasonNumber: formData.seasonNumber,
          episodeNumber: formData.episodeNumber,
        }),
      };

      // Remover campos auxiliares que não fazem parte da interface Video
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { isPartOfSeries, ...finalVideoData } = videoData;

      // Create video first
      const videoId = await videoService.create(finalVideoData);

      // Upload thumbnail if provided
      let thumbnailUrl = "";
      if (thumbnailFile) {
        thumbnailUrl = await videoService.uploadThumbnail(
          videoId,
          thumbnailFile
        );
        await videoService.update(videoId, { thumbnail: thumbnailUrl });
      }

      // Log da criação do vídeo
      await logAdminAction({
        action: "video_created",
        details: `Vídeo criado: ${formData.title}`,
        admin: currentAdmin?.email || "unknown",
        level: "info",
        metadata: {
          videoId: videoId,
          videoTitle: formData.title,
          videoDescription: formData.description,
          videoUrl: formData.url,
          tag: formData.tag,
          hasThumbnail: !!thumbnailFile,
          thumbnailUrl: thumbnailUrl,
          timestamp: new Date().toISOString(),
        },
      });

      onSuccess();
      onClose();
      resetForm();
    } catch (error) {
      console.error("Error creating video:", error);

      // Log do erro na criação
      await logAdminAction({
        action: "video_creation_failed",
        details: `Falha ao criar vídeo: ${formData.title} - ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
        admin: currentAdmin?.email || "unknown",
        level: "error",
        metadata: {
          videoTitle: formData.title,
          videoDescription: formData.description,
          videoUrl: formData.url,
          tag: formData.tag,
          error: error instanceof Error ? error.message : "Unknown error",
          timestamp: new Date().toISOString(),
        },
      });

      setError("Erro ao criar vídeo. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  // Carregar séries existentes quando modal abrir
  useEffect(() => {
    if (isOpen) {
      loadExistingSeries();
    }
  }, [isOpen]);

  const loadExistingSeries = async () => {
    try {
      const titles = await videoService.getExistingSeriesTitles();
      setExistingSeriesTitles(titles);
    } catch (error) {
      console.error("Error loading series titles:", error);
    }
  };

  // Função para obter próximo número de episódio automaticamente
  const handleSeriesChange = async (seriesTitle: string) => {
    setFormData(prev => ({ ...prev, seriesTitle }));
    
    if (seriesTitle && formData.isPartOfSeries) {
      try {
        // Gerar um ID temporário para a série baseado no título
        const seriesId = seriesTitle.toLowerCase().replace(/\s+/g, '-');
        const nextEpisode = await videoService.getNextEpisodeNumber(seriesId, formData.seasonNumber);
        setFormData(prev => ({ ...prev, episodeNumber: nextEpisode }));
      } catch (error) {
        console.error("Error getting next episode number:", error);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      url: "",
      category: "",
      minAge: 2,
      duration: 0,
      tag: "entretenimento" as ContentTag,
      isPartOfSeries: false,
      seriesTitle: "",
      seasonNumber: 1,
      episodeNumber: 1,
    });
    setThumbnailFile(null);
    setError("");
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <Card className="bg-white w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl border-2">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center text-gray-900 text-xl font-bold">
              <VideoIcon className="mr-2 h-6 w-6 text-gray-600" />
              Adicionar Novo Vídeo
            </CardTitle>
            <CardDescription className="text-gray-700 font-medium mt-1">
              Preencha as informações do vídeo educativo
            </CardDescription>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClose}
            className="hover:bg-red-100 text-red-600 hover:text-red-700"
          >
            <X className="h-5 w-5" />
          </Button>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <span className="text-sm text-red-600">{error}</span>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2 text-gray-700">
                <label className="text-sm font-medium text-gray-800">
                  Título
                </label>
                <Input
                  className="text-gray-600 border-gray-300 focus:ring-purple-500"
                  required
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  placeholder="Nome do vídeo"
                />
              </div>
              <div className="space-y-2 text-gray-700">
                <label className="text-sm font-medium text-gray-800">
                  Categoria
                </label>
                <select
                  required
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                  className="w-full h-10 px-3 py-2 border text-gray-600 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">Selecione...</option>
                  <option value="educacional">Educacional</option>
                  <option value="entretenimento">Entretenimento</option>
                  <option value="musica">Música</option>
                  <option value="historia">História</option>
                  <option value="ciencia">Ciência</option>
                </select>
              </div>
            </div>

            <div className="space-y-2 text-gray-700">
              <label className="text-sm font-medium text-gray-800">
                Descrição
              </label>
              <textarea
                required
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Descrição do vídeo"
                className="w-full min-h-[80px] px-3 py-2 border text-gray-600 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            {/* Seção de Série */}
            <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
              <div className="flex items-center space-x-2 mb-3">
                <Tv className="h-4 w-4 text-purple-600" />
                <h4 className="text-sm font-semibold text-gray-800">Configurações de Série</h4>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="isPartOfSeries"
                    checked={formData.isPartOfSeries}
                    onChange={(e) =>
                      setFormData({ ...formData, isPartOfSeries: e.target.checked })
                    }
                    className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                  />
                  <label htmlFor="isPartOfSeries" className="text-sm font-medium text-gray-700">
                    Este vídeo faz parte de uma série
                  </label>
                </div>

                {formData.isPartOfSeries && (
                  <div className="grid grid-cols-1 gap-3 pl-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-800">
                        Nome da Série
                      </label>
                      <div className="flex gap-2">
                        <div className="flex-1">
                          <input
                            required
                            value={formData.seriesTitle}
                            onChange={(e) => handleSeriesChange(e.target.value)}
                            placeholder="Digite o nome da série"
                            className="w-full h-10 px-3 py-2 border text-gray-600 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                          />
                        </div>
                        <div className="w-40">
                          <select
                            value={formData.seriesTitle}
                            onChange={(e) => handleSeriesChange(e.target.value)}
                            className="w-full h-10 px-3 py-2 border text-gray-600 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
                          >
                            <option value="">Selecionar série</option>
                            {existingSeriesTitles.map((title) => (
                              <option key={title} value={title}>
                                {title}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <p className="text-xs text-gray-500">
                        {existingSeriesTitles.length > 0 
                          ? "Digite uma nova série ou selecione uma existente" 
                          : "Digite o nome da primeira série"
                        }
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-800">
                          <Hash className="h-3 w-3 inline mr-1" />
                          Temporada
                        </label>
                        <Input
                          type="number"
                          min="1"
                          required
                          value={formData.seasonNumber}
                          onChange={(e) =>
                            setFormData({ ...formData, seasonNumber: parseInt(e.target.value) || 1 })
                          }
                          className="text-gray-600 border-gray-300 focus:ring-purple-500"
                          placeholder="1"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-800">
                          <Play className="h-3 w-3 inline mr-1" />
                          Episódio
                        </label>
                        <Input
                          type="number"
                          min="1"
                          required
                          value={formData.episodeNumber}
                          onChange={(e) =>
                            setFormData({ ...formData, episodeNumber: parseInt(e.target.value) || 1 })
                          }
                          className="text-gray-600 border-gray-300 focus:ring-purple-500"
                          placeholder="1"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-gray-700">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-800">
                  URL do Vídeo
                </label>
                <Input
                  className="text-gray-600 border-gray-300 focus:ring-purple-500"
                  required
                  type="url"
                  value={formData.url}
                  onChange={(e) =>
                    setFormData({ ...formData, url: e.target.value })
                  }
                  placeholder="https://youtube.com/watch?v=..."
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-800">
                  Duração
                </label>
                <DurationInput
                  value={formData.duration}
                  onChange={(seconds) => setFormData({ ...formData, duration: seconds })}
                  className="text-gray-600 border-gray-300 focus:ring-purple-500"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 text-gray-700">
              <div>
                <MinAgeSelector
                  value={formData.minAge}
                  onChange={(age) => setFormData({ ...formData, minAge: age })}
                  required
                />
              </div>
            </div>

            <div className="space-y-2 text-gray-700">
              <label className="text-sm font-medium text-gray-800">
                Thumbnail
              </label>
              <div className="flex items-center space-x-2">
                <Input
                  className="text-gray-600 border-gray-300 focus:ring-purple-500 flex-1"
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    setThumbnailFile(e.target.files?.[0] || null)
                  }
                />
                <Upload className="h-4 w-4 text-gray-400" />
              </div>
            </div>

            <div className="space-y-2 text-gray-700">
              <label className="text-sm font-medium text-gray-800">Categoria</label>
              <ContentTagSelector
                value={formData.tag}
                onChange={(tag) => setFormData({ ...formData, tag })}
              />
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                className="text-purple-600 hover:text-purple-700"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              >
                {loading ? "Salvando..." : "Salvar Vídeo"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
