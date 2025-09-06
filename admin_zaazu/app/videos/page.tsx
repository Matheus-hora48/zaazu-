"use client";

import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AddVideoModal } from "@/components/modals/add-video-modal";
import { ViewVideoModal } from "@/components/modals/view-video-modal";
import { EditVideoModal } from "@/components/modals/edit-video-modal";
import { VideoCard } from "@/components/ui/video-card";
import { videoService } from "@/lib/services";
import { Video, VideoSeries } from "@/lib/types";
import {
  Video as VideoIcon,
  Plus,
  Search,
  Eye,
  Play,
  Clock,
  Tv,
  Grid,
  List,
  Filter,
  Hash,
} from "lucide-react";
import { logAdminAction } from "@/lib/logging";
import { useAuth } from "@/lib/auth-context";

export default function VideosPage() {
  const { user: currentAdmin } = useAuth();
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<"individual" | "series">(
    "individual"
  );
  const [selectedSeriesFilter, setSelectedSeriesFilter] = useState<string>("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);

  useEffect(() => {
    loadVideos();
  }, []);

  const loadVideos = async () => {
    try {
      setLoading(true);
      const videosData = await videoService.getAll();
      setVideos(videosData);
    } catch (error) {
      console.error("Error loading videos:", error);
    } finally {
      setLoading(false);
    }
  };

  // Função para agrupar vídeos por série
  const groupVideosBySeries = (videos: Video[]): VideoSeries[] => {
    const seriesMap = new Map<string, VideoSeries>();

    videos.forEach((video) => {
      if (video.seriesId && video.seriesTitle) {
        if (!seriesMap.has(video.seriesId)) {
          seriesMap.set(video.seriesId, {
            seriesId: video.seriesId,
            seriesTitle: video.seriesTitle,
            totalEpisodes: 0,
            seasons: {},
            thumbnail: video.thumbnail,
            tag: video.tag,
            category: video.category,
            ageGroup: video.ageGroup,
            minAge: video.minAge || 2,
          });
        }

        const series = seriesMap.get(video.seriesId)!;
        const season = video.seasonNumber || 1;

        if (!series.seasons[season]) {
          series.seasons[season] = [];
        }

        series.seasons[season].push(video);
        series.totalEpisodes++;
      }
    });

    // Ordenar episódios por número dentro de cada temporada
    seriesMap.forEach((series) => {
      Object.keys(series.seasons).forEach((seasonKey) => {
        const seasonNum = parseInt(seasonKey);
        series.seasons[seasonNum].sort(
          (a: Video, b: Video) =>
            (a.episodeNumber || 0) - (b.episodeNumber || 0)
        );
      });
    });

    return Array.from(seriesMap.values());
  };

  // Filtrar vídeos com base na pesquisa e filtros
  const filteredVideos = videos.filter((video) => {
    const matchesSearch =
      video.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      video.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesSeries =
      selectedSeriesFilter === "" || video.seriesId === selectedSeriesFilter;

    return matchesSearch && matchesSeries;
  });

  // Obter vídeos únicos (sem série) para exibição
  const standAloneVideos = filteredVideos.filter((video) => !video.seriesId);

  // Obter séries filtradas
  const filteredSeries = groupVideosBySeries(filteredVideos);

  // Lista de séries para o filtro
  const availableSeries = groupVideosBySeries(videos);

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(date);
  };

  const handleDeleteVideo = async (videoId: string) => {
    if (confirm("Tem certeza que deseja excluir este vídeo?")) {
      try {
        const video = videos.find((v) => v.id === videoId);
        await videoService.delete(videoId);

        // Log da exclusão do vídeo
        await logAdminAction({
          action: "video_deleted",
          details: `Vídeo excluído: ${
            video?.title || "Unknown"
          } (ID: ${videoId})`,
          admin: currentAdmin?.email || "unknown",
          level: "warning",
          metadata: {
            videoId: videoId,
            videoTitle: video?.title || "unknown",
            videoUrl: video?.url || "unknown",
            tag: video?.tag || "entretenimento",
            timestamp: new Date().toISOString(),
          },
        });

        loadVideos();
      } catch (error) {
        console.error("Error deleting video:", error);

        // Log do erro na exclusão
        await logAdminAction({
          action: "video_deletion_failed",
          details: `Falha ao excluir vídeo ${videoId} - ${
            error instanceof Error ? error.message : "Unknown error"
          }`,
          admin: currentAdmin?.email || "unknown",
          level: "error",
          metadata: {
            videoId: videoId,
            error: error instanceof Error ? error.message : "Unknown error",
            timestamp: new Date().toISOString(),
          },
        });

        alert("Erro ao excluir vídeo");
      }
    }
  };

  const handleViewVideo = (video: Video) => {
    setSelectedVideo(video);
    setIsViewModalOpen(true);
  };

  const handleEditVideo = (video: Video) => {
    setSelectedVideo(video);
    setIsEditModalOpen(true);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <VideoIcon className="mr-3 h-8 w-8" />
              Gerenciar Vídeos
            </h1>
            <p className="text-gray-600 mt-1">
              Gerencie todo o conteúdo de vídeo da plataforma
            </p>
          </div>
          <Button
            onClick={() => setIsAddModalOpen(true)}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
          >
            <Plus className="mr-2 h-4 w-4" />
            Adicionar Vídeo
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <VideoIcon className="h-4 w-4 text-blue-500" />
                <span className="text-sm font-medium text-gray-600">
                  Total de Vídeos
                </span>
              </div>
              <p className="text-2xl font-bold text-gray-700 mt-1">
                {videos.length}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Eye className="h-4 w-4 text-green-500" />
                <span className="text-sm font-medium text-gray-600">
                  Total de Views
                </span>
              </div>
              <p className="text-2xl font-bold text-gray-700 mt-1">
                {videos
                  .reduce((total, video) => total + (video.views || 0), 0)
                  .toLocaleString()}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Play className="h-4 w-4 text-purple-500" />
                <span className="text-sm font-medium text-gray-600">
                  Vídeos Ativos
                </span>
              </div>
              <p className="text-2xl font-bold text-gray-700 mt-1">
                {videos.filter((video) => video.isActive).length}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-orange-500" />
                <span className="text-sm font-medium text-gray-600">
                  Duração Total
                </span>
              </div>
              <p className="text-2xl font-bold text-gray-700 mt-1">
                {Math.floor(
                  videos.reduce(
                    (total, video) => total + (video.duration || 0),
                    0
                  ) / 60
                )}
                min
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Tv className="h-4 w-4 text-indigo-500" />
                <span className="text-sm font-medium text-gray-600">
                  Total de Séries
                </span>
              </div>
              <p className="text-2xl font-bold text-gray-700 mt-1">
                {availableSeries.length}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Controles de Visualização e Filtros */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          {/* Toggle de Visualização */}
          <div className="flex items-center space-x-2 bg-gray-100 rounded-lg p-1 text-gray-800">
            <Button
              variant={viewMode === "individual" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("individual")}
              className={
                viewMode === "individual"
                  ? "bg-white shadow-sm text-gray-800"
                  : ""
              }
            >
              <Grid className="h-4 w-4 mr-2 text-gray-800" />
              Vídeos Individuais
            </Button>
            <Button
              variant={viewMode === "series" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("series")}
              className={
                viewMode === "series" ? "bg-white shadow-sm text-gray-800" : ""
              }
            >
              <List className="h-4 w-4 mr-2 text-gray-800" />
              Por Séries
            </Button>
          </div>

          {/* Filtros */}
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2 text-gray-800">
              <Filter className="h-4 w-4 text-gray-500" />
              <select
                value={selectedSeriesFilter}
                onChange={(e) => setSelectedSeriesFilter(e.target.value)}
                className="text-sm border border-gray-300 rounded-md px-3 py-1 bg-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="">Todas as séries</option>
                {availableSeries.map((series) => (
                  <option key={series.seriesId} value={series.seriesId}>
                    {series.seriesTitle} ({series.totalEpisodes} eps)
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Search */}
        <Card>
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar vídeos por título ou categoria..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10  text-gray-700"
              />
            </div>
          </CardContent>
        </Card>

        {/* Videos Grid */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
          </div>
        ) : viewMode === "series" ? (
          /* Visualização por Séries */
          <div className="space-y-8">
            {/* Vídeos sem série */}
            {standAloneVideos.length > 0 && (
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <VideoIcon className="h-5 w-5 mr-2" />
                  Vídeos Individuais ({standAloneVideos.length})
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {standAloneVideos.map((video) => (
                    <VideoCard
                      key={video.id}
                      video={video}
                      onView={handleViewVideo}
                      onEdit={handleEditVideo}
                      onDelete={handleDeleteVideo}
                      formatDuration={formatDuration}
                      formatDate={formatDate}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Séries */}
            {filteredSeries.map((series) => (
              <div key={series.seriesId} className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold text-gray-900 flex items-center">
                    <Tv className="h-5 w-5 mr-2 text-purple-600" />
                    {series.seriesTitle}
                    <span className="ml-2 text-sm text-gray-500 font-normal">
                      ({series.totalEpisodes} episódios)
                    </span>
                  </h3>
                  <div className="flex items-center text-sm text-gray-500">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        series.tag === "entretenimento"
                          ? "bg-purple-100 text-purple-800"
                          : series.tag === "educativo"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-green-100 text-green-800"
                      }`}
                    >
                      {series.tag}
                    </span>
                  </div>
                </div>

                {/* Temporadas */}
                {Object.entries(series.seasons)
                  .sort(([a], [b]) => parseInt(a) - parseInt(b))
                  .map(([seasonNum, episodes]) => (
                    <div key={seasonNum} className="pl-6">
                      <h4 className="text-lg font-medium text-gray-800 mb-3 flex items-center">
                        <Hash className="h-4 w-4 mr-2 text-gray-600" />
                        Temporada {seasonNum} ({episodes.length} episódios)
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {episodes.map((video) => (
                          <VideoCard
                            key={video.id}
                            video={video}
                            onView={handleViewVideo}
                            onEdit={handleEditVideo}
                            onDelete={handleDeleteVideo}
                            formatDuration={formatDuration}
                            formatDate={formatDate}
                            showEpisodeNumber={true}
                            compact={true}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
              </div>
            ))}
          </div>
        ) : (
          /* Visualização Individual (original) */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredVideos.map((video) => (
              <VideoCard
                key={video.id}
                video={video}
                onView={handleViewVideo}
                onEdit={handleEditVideo}
                onDelete={handleDeleteVideo}
                formatDuration={formatDuration}
                formatDate={formatDate}
              />
            ))}

            {filteredVideos.length === 0 && !loading && (
              <div className="col-span-full text-center py-12">
                <VideoIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {searchTerm
                    ? "Nenhum vídeo encontrado"
                    : "Nenhum vídeo cadastrado"}
                </h3>
                <p className="text-gray-500 mb-4">
                  {searchTerm
                    ? "Tente buscar com outros termos"
                    : "Comece adicionando seu primeiro vídeo"}
                </p>
                {!searchTerm && (
                  <Button
                    onClick={() => setIsAddModalOpen(true)}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Adicionar Primeiro Vídeo
                  </Button>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      <AddVideoModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={loadVideos}
      />

      <ViewVideoModal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        video={selectedVideo}
      />

      <EditVideoModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSuccess={loadVideos}
        video={selectedVideo}
      />
    </DashboardLayout>
  );
}
