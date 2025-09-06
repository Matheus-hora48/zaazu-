"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { X, Video, Calendar, Clock, Play, Globe, Tv, Hash } from "lucide-react";
import { Video as VideoType } from "@/lib/types";

interface ViewVideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  video: VideoType | null;
}

export function ViewVideoModal({
  isOpen,
  onClose,
  video,
}: ViewVideoModalProps) {
  if (!isOpen || !video) return null;

  const formatDate = (timestamp: Date | { seconds: number } | null) => {
    if (!timestamp) return "Data não disponível";

    if (timestamp instanceof Date) {
      return timestamp.toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    }

    if (typeof timestamp === "object" && "seconds" in timestamp) {
      return new Date(timestamp.seconds * 1000).toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    }

    return "Data inválida";
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const getVideoId = (url: string) => {
    const regex = /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/;
    const match = url.match(regex);
    return match ? match[1] : null;
  };

  const videoId = getVideoId(video.url);

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <Card className="bg-white w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="text-gray-700">
            <CardTitle className="flex items-center text-gray-800">
              <Video className="mr-2 h-5 w-5" />
              Detalhes do Vídeo
            </CardTitle>
            <CardDescription className="text-gray-600">
              Informações completas do vídeo
            </CardDescription>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Video Preview */}
          <div className="space-y-4">
            <h3 className="text-lg text-gray-700 font-semibold">
              Preview do Vídeo
            </h3>
            <div className="relative bg-gray-100 rounded-lg overflow-hidden aspect-video">
              {video.thumbnail ? (
                <Image
                  src={video.thumbnail}
                  alt={video.title}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Video className="h-20 w-20 text-gray-400" />
                </div>
              )}
              <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center">
                <Button
                  size="lg"
                  className="bg-red-600 hover:bg-red-700 text-white rounded-full"
                  onClick={() => window.open(video.url, "_blank")}
                >
                  <Play className="h-6 w-6 mr-2" />
                  Assistir no YouTube
                </Button>
              </div>
            </div>
          </div>

          {/* Video Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Título
                </label>
                <p className="text-lg font-semibold text-gray-900">
                  {video.title}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">
                  Descrição
                </label>
                <p className="text-gray-600 leading-relaxed">
                  {video.description}
                </p>
              </div>

              {/* Informações da Série */}
              {video.seriesId && video.seriesTitle && (
                <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                  <div className="flex items-center space-x-2 mb-3">
                    <Tv className="h-4 w-4 text-purple-600" />
                    <h4 className="text-sm font-semibold text-gray-800">Informações da Série</h4>
                  </div>
                  <div className="grid grid-cols-1 gap-2">
                    <div>
                      <label className="text-xs font-medium text-gray-600">Série</label>
                      <p className="text-sm font-semibold text-gray-900">{video.seriesTitle}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-medium text-gray-600">
                          <Hash className="h-3 w-3 inline mr-1" />
                          Temporada
                        </label>
                        <p className="text-sm text-gray-900">{video.seasonNumber || 1}</p>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-600">
                          <Play className="h-3 w-3 inline mr-1" />
                          Episódio
                        </label>
                        <p className="text-sm text-gray-900">{video.episodeNumber || 1}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div>
                <label className="text-sm font-medium text-gray-700">
                  Categoria
                </label>
                <p className="text-gray-900">{video.category}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700">
                  URL do Vídeo
                </label>
                <div className="flex items-center space-x-2">
                  <Globe className="h-4 w-4 text-gray-400" />
                  <a
                    href={video.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 truncate"
                  >
                    {video.url}
                  </a>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">
                  Duração
                </label>
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-gray-400" />
                  <p className="text-gray-900">
                    {formatDuration(video.duration)}
                  </p>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">
                  Data de Criação
                </label>
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <p className="text-gray-900">{formatDate(video.createdAt)}</p>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">
                  Status
                </label>
                <div className="flex items-center space-x-2">
                  <div
                    className={`w-3 h-3 rounded-full ${
                      video.isActive ? "bg-green-500" : "bg-red-500"
                    }`}
                  ></div>
                  <p className="text-gray-900">
                    {video.isActive ? "Ativo" : "Inativo"}
                  </p>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">
                  Categoria
                </label>
                <div className="flex flex-wrap gap-2 mt-1">
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full flex items-center gap-1">
                    {video.tag === "entretenimento" && "🎪"}
                    {video.tag === "atividade" && "📝"}
                    {video.tag === "educativo" && "🎓"}
                    {video.tag === "entretenimento" && "Entretenimento"}
                    {video.tag === "atividade" && "Atividade"}
                    {video.tag === "educativo" && "Educativo"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-2 pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => window.open(video.url, "_blank")}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              <Play className="h-4 w-4 mr-2" />
              Assistir Vídeo
            </Button>
            <Button
              onClick={onClose}
              className="text-purple-600 hover:text-purple-700"
            >
              Fechar
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
