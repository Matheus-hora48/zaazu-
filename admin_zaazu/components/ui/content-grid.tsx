"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { Search, Filter, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { AnyContent, ContentType } from "@/lib/types";

interface ContentGridProps {
  contentType: ContentType;
  selectedItems: string[];
  onItemSelect: (itemId: string) => void;
  onItemDeselect: (itemId: string) => void;
  maxSelection?: number;
  getAllContent: () => Promise<AnyContent[]>;
}

export function ContentGrid({
  contentType,
  selectedItems,
  onItemSelect,
  onItemDeselect,
  maxSelection = 20,
  getAllContent,
}: ContentGridProps) {
  const [content, setContent] = useState<AnyContent[]>([]);
  const [filteredContent, setFilteredContent] = useState<AnyContent[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedAgeGroup, setSelectedAgeGroup] = useState("");
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
      const typeFilteredContent = allContent.filter(
        (item) => getContentType(item) === contentType
      );
      setContent(typeFilteredContent);
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
          item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (item.tags &&
            item.tags.some((tag) =>
              tag.toLowerCase().includes(searchTerm.toLowerCase())
            ))
      );
    }

    // Filter by category
    if (selectedCategory) {
      filtered = filtered.filter((item) => item.category === selectedCategory);
    }

    // Filter by age group
    if (selectedAgeGroup) {
      filtered = filtered.filter((item) => item.ageGroup === selectedAgeGroup);
    }

    // Filter only active content
    filtered = filtered.filter((item) => item.isActive);

    setFilteredContent(filtered);
  }, [content, searchTerm, selectedCategory, selectedAgeGroup]);

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
    const ageGroups = content.map((item) => item.ageGroup).filter(Boolean);
    return [...new Set(ageGroups)].sort();
  };

  const isSelected = (itemId: string) => {
    const selected = selectedItems.includes(itemId);
    return selected;
  };

  const canSelect = () => selectedItems.length < maxSelection;

  const handleItemClick = (item: AnyContent) => {
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
              <p className="text-xs text-gray-500 truncate">{item.category}</p>

              {item.tags && item.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-1">
                  {item.tags.slice(0, 2).map((tag, index) => (
                    <span
                      key={index}
                      className="px-1 py-0.5 bg-gray-100 text-gray-600 text-xs rounded"
                    >
                      {tag}
                    </span>
                  ))}
                  {item.tags.length > 2 && (
                    <span className="text-xs text-gray-400">
                      +{item.tags.length - 2}
                    </span>
                  )}
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
