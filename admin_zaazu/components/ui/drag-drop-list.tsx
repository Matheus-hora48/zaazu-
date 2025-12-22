"use client";

import React, { useState, useRef, DragEvent } from "react";
import Image from "next/image";
import { GripVertical, X, Shuffle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AnyContent, GridItem, VideoSeries } from "@/lib/types";

interface DragDropListProps {
  items: GridItem[];
  onReorder: (items: GridItem[]) => void;
  onRemove: (itemId: string) => void;
  onRandomize: () => void;
  getContentById: (id: string, type: string, isSeries?: boolean) => AnyContent | VideoSeries | null;
  maxItems?: number;
}

export function DragDropList({
  items,
  onReorder,
  onRemove,
  onRandomize,
  getContentById,
  maxItems = 20,
}: DragDropListProps) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const dragCounter = useRef(0);

  const handleDragStart = (e: DragEvent<HTMLDivElement>, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/html", e.currentTarget.outerHTML);
    e.currentTarget.style.opacity = "0.5";
  };

  const handleDragEnd = (e: DragEvent<HTMLDivElement>) => {
    e.currentTarget.style.opacity = "1";
    setDraggedIndex(null);
    setDragOverIndex(null);
    dragCounter.current = 0;
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDragEnter = (e: DragEvent<HTMLDivElement>, index: number) => {
    e.preventDefault();
    dragCounter.current++;
    setDragOverIndex(index);
  };

  const handleDragLeave = () => {
    dragCounter.current--;
    if (dragCounter.current === 0) {
      setDragOverIndex(null);
    }
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>, dropIndex: number) => {
    e.preventDefault();

    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }

    const newItems = [...items];
    const draggedItem = newItems[draggedIndex];

    // Remove the dragged item
    newItems.splice(draggedIndex, 1);

    // Insert at new position
    const insertIndex = draggedIndex < dropIndex ? dropIndex - 1 : dropIndex;
    newItems.splice(insertIndex, 0, draggedItem);

    // Update order
    const reorderedItems = newItems.map((item, index) => ({
      ...item,
      order: index,
    }));

    onReorder(reorderedItems);
    setDraggedIndex(null);
    setDragOverIndex(null);
    dragCounter.current = 0;
  };

  const getContentThumbnail = (item: GridItem): string => {
    const content = getContentById(item.contentId, item.contentType, item.isSeries);
    return content?.thumbnail || "/placeholder-image.jpg";
  };

  const getContentTitle = (item: GridItem): string => {
    const content = getContentById(item.contentId, item.contentType, item.isSeries);
    if (!content) return "Conteúdo não encontrado";
    
    // VideoSeries tem seriesTitle ao invés de title
    if ('seriesTitle' in content) {
      return content.seriesTitle || "Sem título";
    }
    
    return content.title || "Sem título";
  };

  const getContentTypeIcon = (type: string) => {
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

  const getContentTypeColor = (type: string) => {
    switch (type) {
      case "video":
        return "bg-blue-100 text-blue-800";
      case "game":
        return "bg-green-100 text-green-800";
      case "activity":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg border">
        <span className="text-sm font-bold text-gray-800 flex items-center gap-2">
          📊 {items.length} de {maxItems} itens selecionados
        </span>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onRandomize}
          disabled={items.length < 2}
          className="border-purple-300 text-purple-700 hover:bg-purple-50 font-medium"
        >
          <Shuffle className="h-4 w-4 mr-2" />
          Aleatorizar
        </Button>
      </div>

      <div className="space-y-2 max-h-96 overflow-y-auto">
        {items.length === 0 ? (
          <div className="text-center py-12 bg-yellow-50 border-2 border-yellow-200 rounded-lg">
            <div className="text-4xl mb-3">🎯</div>
            <h4 className="font-bold text-yellow-800 mb-2">
              Nenhum conteúdo selecionado
            </h4>
            <p className="text-yellow-700 text-sm">
              Use a grade de seleção acima para adicionar itens a esta linha
            </p>
          </div>
        ) : (
          items.map((item, index) => (
            <div
              key={item.id}
              draggable
              onDragStart={(e) => handleDragStart(e, index)}
              onDragEnd={handleDragEnd}
              onDragOver={handleDragOver}
              onDragEnter={(e) => handleDragEnter(e, index)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, index)}
              className={`
                flex items-center gap-3 p-3 bg-white border-2 rounded-lg cursor-move transition-all
                ${
                  draggedIndex === index
                    ? "border-blue-300 bg-blue-50 opacity-70"
                    : ""
                }
                ${
                  dragOverIndex === index
                    ? "border-green-500 bg-green-50"
                    : "border-gray-200"
                }
                hover:shadow-md hover:border-gray-300
              `}
            >
              <GripVertical className="h-4 w-4 text-gray-500 flex-shrink-0" />

              <Image
                src={getContentThumbnail(item)}
                alt={getContentTitle(item)}
                width={48}
                height={48}
                className="w-12 h-12 object-cover rounded-lg border-2 border-gray-200 flex-shrink-0"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "/placeholder-image.jpg";
                }}
              />

              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-gray-900 truncate">
                  {getContentTitle(item)}
                </h4>
                <div className="flex items-center gap-2 mt-1">
                  <span
                    className={`px-2 py-1 text-xs rounded-full font-medium ${getContentTypeColor(
                      item.contentType
                    )}`}
                  >
                    {getContentTypeIcon(item.contentType)} {item.contentType}
                  </span>
                  <span className="text-xs text-gray-700 bg-gray-100 px-2 py-1 rounded-full">
                    📍 Posição {index + 1}
                  </span>
                </div>
              </div>

              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => onRemove(item.id)}
                className="text-red-600 hover:text-red-700 hover:bg-red-100 border hover:border-red-300 flex-shrink-0"
                title="Remover da linha"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
