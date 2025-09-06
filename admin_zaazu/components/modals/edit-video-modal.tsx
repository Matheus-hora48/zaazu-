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
import { X, Video, Save, Upload, Tv, Hash, Play } from "lucide-react";
import { Video as VideoType, ContentTag } from "@/lib/types";
import { ContentTagSelector } from "@/components/ui/content-tag-selector";
import { MinAgeSelector } from "@/components/ui/min-age-selector";
import { useAdminLogging } from "@/lib/use-admin-logging";

interface EditVideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  video: VideoType | null;
}

export function EditVideoModal({
  isOpen,
  onClose,
  onSuccess,
  video,
}: EditVideoModalProps) {
  const { logUpdate, logError } = useAdminLogging();
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

  useEffect(() => {
    if (video) {
      setFormData({
        title: video.title,
        description: video.description,
        url: video.url,
        category: video.category,
        minAge: video.minAge || 2,
        duration: video.duration,
        tag: video.tag || "entretenimento",
        // Campos de série
        isPartOfSeries: !!(video.seriesId && video.seriesTitle),
        seriesTitle: video.seriesTitle || "",
        seasonNumber: video.seasonNumber || 1,
        episodeNumber: video.episodeNumber || 1,
      });
    }
  }, [video]);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!video) return;

    setLoading(true);
    setError("");

    try {
      // Preparar dados do vídeo
      const updateData = {
        ...formData,
        // Adicionar campos de série se aplicável
        ...(formData.isPartOfSeries && formData.seriesTitle && {
          seriesId: formData.seriesTitle.toLowerCase().replace(/\s+/g, '-'),
          seriesTitle: formData.seriesTitle,
          seasonNumber: formData.seasonNumber,
          episodeNumber: formData.episodeNumber,
        }),
        // Remover campos de série se não faz mais parte de uma série
        ...(!formData.isPartOfSeries && {
          seriesId: undefined,
          seriesTitle: undefined,
          seasonNumber: undefined,
          episodeNumber: undefined,
        }),
      };

      // Remover campos auxiliares que não fazem parte da interface Video
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { isPartOfSeries, ...finalUpdateData } = updateData;

      // Upload new thumbnail if provided and then update video data
      if (thumbnailFile) {
        const thumbnailUrl = await videoService.uploadThumbnail(
          video.id,
          thumbnailFile
        );
        // Update video data with new thumbnail
        await videoService.update(video.id, { 
          ...finalUpdateData, 
          thumbnail: thumbnailUrl 
        });
      } else {
        // Update video data without changing thumbnail
        await videoService.update(video.id, finalUpdateData);
      }

      onSuccess();
      onClose();
      resetForm();
    } catch (error) {
      console.error("Error updating video:", error);
      setError("Erro ao atualizar vídeo. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setThumbnailFile(null);
    setError("");
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!isOpen || !video) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <Card className="bg-white w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row text-gray-700 items-center justify-between">
          <div>
            <CardTitle className="flex items-center text-gray-800">
              <Video className="mr-2 h-5 w-5" />
              Editar Vídeo
            </CardTitle>
            <CardDescription className="text-gray-600">
              Atualize as informações do vídeo
            </CardDescription>
          </div>
          <Button variant="ghost" size="icon" onClick={handleClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}

            <div className="space-y-2 text-gray-700">
              <label className="text-sm font-medium text-gray-800">
                Título
              </label>
              <Input
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                placeholder="Nome do vídeo"
                required
              />
            </div>

            <div className="space-y-2 text-gray-700">
              <label className="text-sm font-medium text-gray-800">
                URL do YouTube
              </label>
              <Input
                type="url"
                value={formData.url}
                onChange={(e) =>
                  setFormData({ ...formData, url: e.target.value })
                }
                placeholder="https://youtube.com/watch?v=..."
                required
              />
            </div>

            <div className="space-y-2 text-gray-700">
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

            <div className="space-y-2 text-gray-700">
              <label className="text-sm font-medium text-gray-800">
                Descrição
              </label>
              <textarea
                className="flex min-h-[80px] w-full rounded-md border border-gray-300 bg-background px-3 py-2 text-sm text-gray-600 ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Descrição do vídeo"
                required
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
                  Categoria
                </label>
                <select
                  className="flex h-10 w-full rounded-md border border-gray-300 bg-background px-3 py-2 text-sm text-gray-600 ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                  required
                >
                  <option value="">Selecione uma categoria</option>
                  <option value="Educacional">Educacional</option>
                  <option value="Entretenimento">Entretenimento</option>
                  <option value="Arte">Arte</option>
                  <option value="Música">Música</option>
                  <option value="História">História</option>
                  <option value="Ciências">Ciências</option>
                  <option value="Matemática">Matemática</option>
                </select>
              </div>

              <div>
                <MinAgeSelector
                  value={formData.minAge}
                  onChange={(age) => setFormData({ ...formData, minAge: age })}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-800">
                Nova Thumbnail (opcional)
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
              <p className="text-xs text-gray-500">
                Deixe em branco para manter a thumbnail atual. Formatos aceitos:
                JPG, PNG, GIF
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-800">Categoria</label>
              <ContentTagSelector
                value={formData.tag}
                onChange={(tag) => setFormData({ ...formData, tag })}
              />
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={loading}
                className="text-purple-600 hover:text-purple-700"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              >
                <Save className="mr-2 h-4 w-4" />
                {loading ? "Salvando..." : "Salvar Alterações"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
