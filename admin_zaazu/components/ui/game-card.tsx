import React from "react";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Game } from "@/lib/types";
import {
  Gamepad2,
  Play,
  Eye,
  Edit,
  Trash2,
  Calendar,
  ExternalLink,
} from "lucide-react";

interface GameCardProps {
  game: Game;
  onView: (game: Game) => void;
  onEdit: (game: Game) => void;
  onDelete: (gameId: string) => void;
  formatDate: (date: Date) => string;
  compact?: boolean;
}

export function GameCard({
  game,
  onView,
  onEdit,
  onDelete,
  formatDate,
  compact = false,
}: GameCardProps) {
  const getTagLabel = (tag: string) => {
    switch (tag) {
      case "entretenimento":
        return "🎪 Entretenimento";
      case "atividade":
        return "📝 Atividade";
      case "educativo":
        return "🎓 Educativo";
      default:
        return tag;
    }
  };

  return (
    <Card
      className={`overflow-hidden hover:shadow-lg transition-all duration-300 border-0 shadow-md`}
    >
      <div className="aspect-video bg-gradient-to-br from-green-100 to-blue-200 relative group">
        {game.thumbnail ? (
          <Image
            src={game.thumbnail}
            alt={game.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <Gamepad2 className="h-12 w-12 text-green-400" />
          </div>
        )}

        {/* Type badge */}
        <div className="absolute top-2 left-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
          {game.type}
        </div>

        {/* Age badge */}
        {game.minAge && (
          <div className="absolute top-2 right-2 bg-purple-600 bg-opacity-90 text-white text-xs px-2 py-1 rounded">
            {game.minAge}+ anos
          </div>
        )}

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/10 backdrop-blur-sm group-hover:bg-opacity-20 transition-opacity flex items-center justify-center opacity-0 group-hover:opacity-100">
          <div className="flex gap-2">
            <Button
              size="sm"
              className="bg-white text-gray-800 hover:bg-gray-100"
              onClick={() => onView(game)}
            >
              <Eye className="h-4 w-4 mr-1" />
              Ver
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="bg-white border-white text-gray-800 hover:bg-gray-100"
              onClick={() => window.open(game.url, "_blank")}
            >
              <ExternalLink className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <CardContent className={compact ? "p-3" : "p-4"}>
        <div className="flex items-start justify-between mb-2">
          <h3
            className={`font-semibold text-gray-900 line-clamp-2 flex-1 ${
              compact ? "text-sm" : "text-base"
            }`}
          >
            {game.title}
          </h3>
        </div>

        <p
          className={`text-gray-600 line-clamp-2 mb-3 ${
            compact ? "text-xs" : "text-sm"
          }`}
        >
          {game.description}
        </p>

        {/* Tags and metadata */}
        <div className="flex flex-wrap gap-2 mb-3">
          <span className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
            {getTagLabel(game.tag)}
          </span>
          <span className="inline-flex items-center px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
            {game.category}
          </span>
          <span className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-800 text-xs font-medium rounded-full">
            {game.minAge}+ anos
          </span>
        </div>

        <div
          className={`flex items-center justify-between text-gray-500 mb-3 ${
            compact ? "text-xs" : "text-xs"
          }`}
        >
          <span className="flex items-center">
            <Play className="h-3 w-3 mr-1" />
            {(game.plays || 0).toLocaleString()} plays
          </span>
          {!compact && (
            <span className="flex items-center">
              <Calendar className="h-3 w-3 mr-1" />
              {formatDate(game.createdAt)}
            </span>
          )}
        </div>

        {/* Status */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-1">
            <div
              className={`w-2 h-2 rounded-full ${
                game.isActive ? "bg-green-500" : "bg-gray-400"
              }`}
            />
            <span className="text-xs text-gray-500">
              {game.isActive ? "Ativo" : "Inativo"}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div
          className={`flex justify-end space-x-1 pt-2 border-t border-gray-100`}
        >
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onView(game)}
            className={`text-blue-600 hover:text-blue-800 hover:bg-blue-50 ${
              compact ? "p-1" : ""
            }`}
          >
            <Eye className={compact ? "h-3 w-3" : "h-4 w-4"} />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => window.open(game.url, "_blank")}
            className={`text-purple-600 hover:text-purple-800 hover:bg-purple-50 ${
              compact ? "p-1" : ""
            }`}
          >
            <ExternalLink className={compact ? "h-3 w-3" : "h-4 w-4"} />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onEdit(game)}
            className={`text-green-600 hover:text-green-800 hover:bg-green-50 ${
              compact ? "p-1" : ""
            }`}
          >
            <Edit className={compact ? "h-3 w-3" : "h-4 w-4"} />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onDelete(game.id)}
            className={`text-red-600 hover:text-red-800 hover:bg-red-50 ${
              compact ? "p-1" : ""
            }`}
          >
            <Trash2 className={compact ? "h-3 w-3" : "h-4 w-4"} />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
