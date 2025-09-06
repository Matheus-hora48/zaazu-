import React from "react";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Activity } from "@/lib/types";
import {
  BookOpen,
  Play,
  Eye,
  Edit,
  Trash2,
  Calendar,
  Users,
  Target,
  Clock,
  Brain,
  Palette,
  PuzzleIcon,
  PenTool,
  Star,
} from "lucide-react";

interface ActivityCardProps {
  activity: Activity;
  onView: (activity: Activity) => void;
  onEdit: (activity: Activity) => void;
  onDelete: (activityId: string) => void;
  formatDate?: (date: Date) => string;
  compact?: boolean;
}

export function ActivityCard({
  activity,
  onView,
  onEdit,
  onDelete,
  formatDate,
  compact = false,
}: ActivityCardProps) {
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "matematica":
        return <PuzzleIcon className="h-5 w-5" />;
      case "portugues":
        return <BookOpen className="h-5 w-5" />;
      case "ciencias":
        return <Brain className="h-5 w-5" />;
      case "arte":
        return <Palette className="h-5 w-5" />;
      case "musica":
        return <Star className="h-5 w-5" />;
      case "educacao-fisica":
        return <Users className="h-5 w-5" />;
      case "historia":
        return <Calendar className="h-5 w-5" />;
      case "geografia":
        return <PenTool className="h-5 w-5" />;
      case "ingles":
        return <BookOpen className="h-5 w-5" />;
      case "vida-pratica":
        return <Target className="h-5 w-5" />;
      default:
        return <BookOpen className="h-5 w-5" />;
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case "matematica":
        return "Matemática";
      case "portugues":
        return "Português";
      case "ciencias":
        return "Ciências";
      case "arte":
        return "Arte e Criatividade";
      case "musica":
        return "Música";
      case "educacao-fisica":
        return "Educação Física";
      case "historia":
        return "História";
      case "geografia":
        return "Geografia";
      case "ingles":
        return "Inglês";
      case "vida-pratica":
        return "Vida Prática";
      default:
        return "Não categorizado";
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "bg-green-100 text-green-800 border-green-200";
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "hard":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getDifficultyText = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "🟢 Fácil";
      case "medium":
        return "🟡 Médio";
      case "hard":
        return "🔴 Difícil";
      default:
        return "⚪ Não definido";
    }
  };

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
      <div className="aspect-video bg-gradient-to-br from-blue-100 to-purple-100 relative group">
        {activity.thumbnail ? (
          <Image
            src={activity.thumbnail}
            alt={activity.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            {getCategoryIcon(activity.category || "")}
          </div>
        )}

        {/* Status badge */}
        <div className="absolute top-2 left-2">
          <span
            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
              activity.isActive
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {activity.isActive ? "🟢 Ativa" : "🔴 Inativa"}
          </span>
        </div>

        {/* Age badge */}
        {activity.minAge && (
          <div className="absolute top-2 right-2 bg-purple-600 bg-opacity-90 text-white text-xs px-2 py-1 rounded">
            {activity.minAge}+ anos
          </div>
        )}

        {/* Difficulty badge */}
        {activity.difficulty && (
          <div className="absolute bottom-2 left-2">
            <span
              className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getDifficultyColor(
                activity.difficulty
              )}`}
            >
              {getDifficultyText(activity.difficulty)}
            </span>
          </div>
        )}

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/10 backdrop-blur-sm group-hover:bg-opacity-20 transition-opacity flex items-center justify-center opacity-0 group-hover:opacity-100">
          <Button
            size="sm"
            className="bg-white text-gray-800 hover:bg-gray-100"
            onClick={() => onView(activity)}
          >
            <Eye className="h-4 w-4 mr-1" />
            Ver
          </Button>
        </div>
      </div>

      <CardContent className={compact ? "p-3" : "p-4"}>
        <div className="flex items-start justify-between mb-2">
          <h3
            className={`font-semibold text-gray-900 line-clamp-2 flex-1 ${
              compact ? "text-sm" : "text-base"
            }`}
          >
            {activity.title}
          </h3>
        </div>

        <p
          className={`text-gray-600 line-clamp-2 mb-3 ${
            compact ? "text-xs" : "text-sm"
          }`}
        >
          {activity.description}
        </p>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-3">
          <span className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
            {getTagLabel(activity.tag)}
          </span>
          <span className="inline-flex items-center px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
            {getCategoryLabel(activity.category || "")}
          </span>
        </div>

        {/* Metadata */}
        <div
          className={`grid grid-cols-2 gap-2 text-xs mb-3 ${
            compact ? "text-xs" : "text-xs"
          }`}
        >
          <div className="flex items-center text-gray-500">
            <Users className="h-3 w-3 mr-1" />
            {activity.ageGroup ? `${activity.ageGroup} anos` : "Idade livre"}
          </div>
          <div className="flex items-center text-gray-500">
            <Target className="h-3 w-3 mr-1" />
            {activity.objectives?.length || 0} objetivos
          </div>
          <div className="flex items-center text-gray-500">
            <Clock className="h-3 w-3 mr-1" />
            {activity.completions || 0} realizações
          </div>
          {activity.instructionVideo && (
            <div className="flex items-center text-blue-600">
              <Play className="h-3 w-3 mr-1" />
              Vídeo disponível
            </div>
          )}
        </div>

        {formatDate && activity.createdAt && !compact && (
          <div className="flex items-center text-gray-500 mb-3 text-xs">
            <Calendar className="h-3 w-3 mr-1" />
            {formatDate(activity.createdAt)}
          </div>
        )}

        {/* Actions */}
        <div
          className={`flex justify-end space-x-1 pt-2 border-t border-gray-100`}
        >
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onView(activity)}
            className={`text-blue-600 hover:text-blue-800 hover:bg-blue-50 ${
              compact ? "p-1" : ""
            }`}
          >
            <Eye className={compact ? "h-3 w-3" : "h-4 w-4"} />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onEdit(activity)}
            className={`text-green-600 hover:text-green-800 hover:bg-green-50 ${
              compact ? "p-1" : ""
            }`}
          >
            <Edit className={compact ? "h-3 w-3" : "h-4 w-4"} />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onDelete(activity.id)}
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
