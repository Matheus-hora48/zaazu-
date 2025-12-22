"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { Search, Filter, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { AnyContent, ContentType, Video, VideoSeries } from "@/lib/types";
import { videoService } from "@/lib/services";

interface ContentGridProps {
  contentType: ContentType;
  selectedItems: string[];
  onItemSelect: (itemId: string) => void;
  onItemDeselect: (itemId: string) => void;
  maxSelection?: number;
  getAllContent: () => Promise<AnyContent[]>;
}

// Tipo unificado para exibição no grid
type DisplayItem = {
  id: string;
  title: string;
  description?: string;
  thumbnail: string;
  category: string;
  minAge: number;
  tag: string;
  isActive: boolean;
  isSeries?: boolean; // Flag para identificar séries
  totalEpisodes?: number; // Para séries
};

export function ContentGrid({
  contentType,
  selectedItems,
  onItemSelect,
  onItemDeselect,
  maxSelection = 20,
  getAllContent,
}: ContentGridProps) {
  const [content, setContent] = useState<DisplayItem[]>([]);
  const [filteredContent, setFilteredContent] = useState<DisplayItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedAgeGroup, setSelectedAgeGroup] = useState("");
  const [videoTypeFilter, setVideoTypeFilter] = useState<"all" | "series" | "individual">("all"); // Filtro para séries/individuais
  const [loading, setLoading] = useState(true);
  const [, setForceUpdate] = useState(0);

  // Force re-render when selectedItems change
  useEffect(() => {
    setForceUpdate((prev) => prev + 1);
  }, [selectedItems]);

  const getContentType = (item: AnyContent): ContentType => {
    if ("duration" in item) return "video";
    if ("type" in item && ("html5" === item.type || "embed" === item.type))
      return "game";
    return "activity";
  };

  const loadContent = useCallback(async () => {
    setLoading(true);
    try {
      const allContent = await getAllContent();
      
      // Se for tipo "series", mostrar apenas séries
      if (contentType === "series") {
        const displayItems: DisplayItem[] = [];
        
        // Buscar apenas séries agrupadas
        const series = await videoService.getAllSeries();
        series.forEach((s: VideoSeries) => {
          displayItems.push({
            id: s.seriesId, // ID da série para seleção
            title: s.seriesTitle,
            description: `${s.totalEpisodes} episódios`,
            thumbnail: s.thumbnail,
            category: s.category,
            minAge: s.minAge,
            tag: s.tag,
            isActive: true,
            isSeries: true,
            totalEpisodes: s.totalEpisodes,
          });
        });

        setContent(displayItems);
      }
      // Se for vídeo, precisamos agrupar séries E vídeos avulsos
      else if (contentType === "video") {
        const displayItems: DisplayItem[] = [];
        
        // Buscar séries agrupadas
        const series = await videoService.getAllSeries();
        series.forEach((s: VideoSeries) => {
          displayItems.push({
            id: s.seriesId, // ID da série para seleção
            title: s.seriesTitle,
            description: `${s.totalEpisodes} episódios`,
            thumbnail: s.thumbnail,
            category: s.category,
            minAge: s.minAge,
            tag: s.tag,
            isActive: true,
            isSeries: true,
            totalEpisodes: s.totalEpisodes,
          });
        });

        // Buscar vídeos avulsos (sem seriesId)
        const videos = allContent.filter(
          (item) => getContentType(item) === "video"
        ) as Video[];
        
        videos.forEach((video: Video) => {
          if (!video.seriesId) {
            displayItems.push({
              id: video.id,
              title: video.title,
              description: video.description,
              thumbnail: video.thumbnail,
              category: video.category,
              minAge: video.minAge,
              tag: video.tag,
              isActive: video.isActive,
              isSeries: false,
            });
          }
        });

        setContent(displayItems);
      } else {
        // Para jogos e atividades, manter lógica original
        const typeFilteredContent = allContent.filter(
          (item) => getContentType(item) === contentType
        );
        
        const displayItems: DisplayItem[] = typeFilteredContent.map((item) => ({
          id: item.id,
          title: item.title,
          description: item.description,
          thumbnail: item.thumbnail,
          category: item.category,
          minAge: item.minAge,
          tag: item.tag,
          isActive: item.isActive,
          isSeries: false,
        }));
        
        setContent(displayItems);
      }
    } catch (error) {
      console.error("Error loading content:", error);
    } finally {
      setLoading(false);
    }
  }, [getAllContent, contentType]);

  const filterContent = useCallback(() => {
    let filtered = [...content];

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (item) =>
          item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (item.tag &&
            item.tag.toLowerCase().includes(searchTerm.toLowerCase())
          )
      );
    }

    // Filter by category
    if (selectedCategory) {
      filtered = filtered.filter((item) => item.category === selectedCategory);
    }

    // Filter by age group
    if (selectedAgeGroup) {
      filtered = filtered.filter((item) => item.minAge === parseInt(selectedAgeGroup));
    }

    // Filter by video type (series vs individual) - only for videos
    if (contentType === "video" && videoTypeFilter !== "all") {
      if (videoTypeFilter === "series") {
        filtered = filtered.filter((item) => item.isSeries === true);
      } else if (videoTypeFilter === "individual") {
        filtered = filtered.filter((item) => item.isSeries === false);
      }
    }

    // Filter only active content
    filtered = filtered.filter((item) => item.isActive);

    setFilteredContent(filtered);
  }, [content, searchTerm, selectedCategory, selectedAgeGroup, videoTypeFilter, contentType]);

  useEffect(() => {
    loadContent();
  }, [loadContent]);

  useEffect(() => {
    filterContent();
  }, [filterContent]);

  const getUniqueCategories = () => {
    const categories = content.map((item) => item.category).filter(Boolean);
    return [...new Set(categories)].sort();
  };

  const getUniqueAgeGroups = () => {
    const ageGroups = content.map((item) => item.minAge?.toString()).filter(Boolean);
    return [...new Set(ageGroups)].sort();
  };

  const isSelected = (itemId: string) => {
    const selected = selectedItems.includes(itemId);
    return selected;
  };

  const canSelect = () => selectedItems.length < maxSelection;

  const handleItemClick = (item: DisplayItem) => {
    if (isSelected(item.id)) {
      onItemDeselect(item.id);
    } else if (canSelect()) {
      onItemSelect(item.id);
    } else {
      alert(`Limite máximo de ${maxSelection} itens atingido!`);
    }
  };

  const getContentTypeIcon = (type: ContentType) => {
    switch (type) {
      case "video":
        return "🎥";
      case "game":
        return "🎮";
      case "activity":
        return "📚";
      default:
        return "📄";
    }
  };

  const getContentTypeName = (type: ContentType) => {
    switch (type) {
      case "video":
        return "Vídeos";
      case "game":
        return "Jogos";
      case "activity":
        return "Atividades";
      default:
        return "Conteúdo";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filtro de tipo de vídeo (Série vs Individual) - apenas para vídeos */}
      {contentType === "video" && (
        <div className="flex gap-2 p-2 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border-2 border-purple-200">
          <button
            onClick={() => setVideoTypeFilter("all")}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
              videoTypeFilter === "all"
                ? "bg-purple-600 text-white shadow-md"
                : "bg-white text-gray-700 hover:bg-purple-100 border border-gray-200"
            }`}
          >
            📺 Todos
          </button>
          <button
            onClick={() => setVideoTypeFilter("series")}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-all flex items-center gap-2 ${
              videoTypeFilter === "series"
                ? "bg-purple-600 text-white shadow-md"
                : "bg-white text-gray-700 hover:bg-purple-100 border border-gray-200"
            }`}
          >
            📺 Apenas Séries
            <span className="text-xs bg-purple-200 text-purple-800 px-1.5 py-0.5 rounded-full">
              {content.filter(c => c.isSeries).length}
            </span>
          </button>
          <button
            onClick={() => setVideoTypeFilter("individual")}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-all flex items-center gap-2 ${
              videoTypeFilter === "individual"
                ? "bg-blue-600 text-white shadow-md"
                : "bg-white text-gray-700 hover:bg-blue-100 border border-gray-200"
            }`}
          >
            🎥 Vídeos Avulsos
            <span className="text-xs bg-blue-200 text-blue-800 px-1.5 py-0.5 rounded-full">
              {content.filter(c => !c.isSeries).length}
            </span>
          </button>
        </div>
      )}

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-white border-2 border-gray-200 rounded-lg shadow-sm">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
          <Input
            placeholder="🔍 Buscar por título, descrição ou tags..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 border-2 border-gray-300 focus:border-blue-500"
          />
        </div>

        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-3 py-2 border-2 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 font-medium"
        >
          <option value="">Todas as categorias</option>
          {getUniqueCategories().map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>

        <select
          value={selectedAgeGroup}
          onChange={(e) => setSelectedAgeGroup(e.target.value)}
          className="px-3 py-2 border-2 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 font-medium"
        >
          <option value="">Todas as idades</option>
          {getUniqueAgeGroups().map((ageGroup) => (
            <option key={ageGroup} value={ageGroup}>
              {ageGroup}
            </option>
          ))}
        </select>
      </div>

      {/* Results */}
      <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
        <span className="text-sm font-bold text-blue-900">
          📋 {filteredContent.length}{" "}
          {filteredContent.length === 1
            ? "item encontrado"
            : "itens encontrados"}
          {(searchTerm || selectedCategory || selectedAgeGroup) && (
            <span className="text-blue-700"> (filtrado)</span>
          )}
        </span>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 p-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 max-h-96 overflow-y-auto">
        {filteredContent.map((item) => (
          <div
            key={item.id}
            onClick={() => handleItemClick(item)}
            className={`
              relative cursor-pointer group transition-all duration-200 rounded-lg overflow-hidden border-2
              ${
                isSelected(item.id)
                  ? "border-green-500 bg-green-50 shadow-lg scale-105"
                  : "border-gray-200 hover:border-gray-300 hover:shadow-sm hover:scale-102"
              }
              ${
                !canSelect() && !isSelected(item.id)
                  ? "opacity-50 cursor-not-allowed"
                  : ""
              }
            `}
          >
            <div className="aspect-video relative">
              <Image
                src={item.thumbnail || "/placeholder-image.jpg"}
                alt={item.title}
                fill
                className="object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "/placeholder-image.jpg";
                }}
              />

              {/* Badge de Série no canto superior direito */}
              {item.isSeries && (
                <div className="absolute top-1 right-1 bg-gradient-to-r from-purple-600 to-pink-500 text-white text-xs px-2 py-1 rounded-lg shadow-lg flex items-center gap-1 border border-white/20">
                  <span>📺</span>
                  <span className="font-bold">{item.totalEpisodes} episódios</span>
                </div>
              )}

              {/* Badge de Vídeo Avulso */}
              {!item.isSeries && contentType === "video" && (
                <div className="absolute top-1 left-1 bg-blue-600 text-white text-[10px] px-1.5 py-0.5 rounded shadow">
                  🎥 Vídeo
                </div>
              )}

              {isSelected(item.id) && (
                <div className="absolute inset-0 bg-green-500 bg-opacity-30 flex items-center justify-center backdrop-blur-sm">
                  <div className="bg-green-600 text-white rounded-full p-2 shadow-lg border-2 border-white">
                    <Plus className="h-5 w-5 rotate-45" />
                  </div>
                </div>
              )}

              {/* Overlay de seleção com animação */}
              <div
                className={`absolute inset-0 border-2 rounded-lg transition-all duration-200 ${
                  isSelected(item.id)
                    ? "border-green-500 shadow-lg"
                    : "border-transparent"
                }`}
              />
            </div>

            <div className="p-2">
              <h4 className="font-medium text-sm text-gray-900 truncate mb-1">
                {item.title}
              </h4>
              <p className="text-xs text-gray-500 truncate">
                {item.isSeries 
                  ? `📺 ${item.totalEpisodes} episódios • ${item.category}`
                  : `🎥 ${item.category}`
                }
              </p>

              {item.tag && (
                <div className="flex flex-wrap gap-1 mt-1">
                  <span
                    className="px-1 py-0.5 bg-gray-100 text-gray-600 text-xs rounded"
                  >
                    {item.tag}
                  </span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredContent.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <Filter className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <p>Nenhum conteúdo encontrado com os filtros aplicados.</p>
        </div>
      )}
    </div>
  );
}
