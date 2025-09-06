"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Activity } from "@/lib/types";
import { X, BookOpen, Play, Target, Clock, Users, Tag, ExternalLink, Check } from "lucide-react";
import Image from "next/image";

interface ViewActivityModalProps {
  isOpen: boolean;
  onClose: () => void;
  activity: Activity;
}

export function ViewActivityModal({
  isOpen,
  onClose,
  activity,
}: ViewActivityModalProps) {
  if (!isOpen) return null;

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

  const getDifficultyIcon = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "🟢";
      case "medium":
        return "🟡";
      case "hard":
        return "🔴";
      default:
        return "⚪";
    }
  };

  const getDifficultyText = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "Fácil";
      case "medium":
        return "Médio";
      case "hard":
        return "Difícil";
      default:
        return "Não definido";
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-auto shadow-2xl border-2">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <CardTitle className="text-2xl font-bold text-gray-900 flex items-center">
                <BookOpen className="mr-3 h-8 w-8" />
                {activity.title}
              </CardTitle>
              <CardDescription className="text-gray-600 font-medium">
                Detalhes da atividade educativa
              </CardDescription>
            </div>
            <Button
              onClick={onClose}
              variant="outline"
              size="sm"
              className="flex-shrink-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Thumbnail */}
          {activity.thumbnail && (
            <div className="w-full h-48 bg-gray-100 rounded-lg overflow-hidden border">
              <Image
                src={activity.thumbnail}
                alt={activity.title}
                width={500}
                height={192}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Informações Básicas */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <div className="flex items-center mb-2">
                <Tag className="h-5 w-5 text-blue-600 mr-2" />
                <span className="font-bold text-blue-800">Categoria</span>
              </div>
              <p className="text-blue-700 capitalize">
                {activity.category || "Não definida"}
              </p>
            </div>

            <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
              <div className="flex items-center mb-2">
                <Users className="h-5 w-5 text-purple-600 mr-2" />
                <span className="font-bold text-purple-800">Faixa Etária</span>
              </div>
              <p className="text-purple-700">
                {activity.ageGroup ? `${activity.ageGroup} anos` : "Não definida"}
              </p>
              {activity.age && (
                <p className="text-sm text-purple-600 mt-1">
                  Específico: {activity.age}
                </p>
              )}
            </div>

            <div className={`p-4 rounded-lg border ${getDifficultyColor(activity.difficulty || "")}`}>
              <div className="flex items-center mb-2">
                <Target className="h-5 w-5 mr-2" />
                <span className="font-bold">Dificuldade</span>
              </div>
              <p className="flex items-center">
                <span className="mr-2">{getDifficultyIcon(activity.difficulty || "")}</span>
                {getDifficultyText(activity.difficulty || "")}
              </p>
            </div>
          </div>

          {/* Descrição */}
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center">
              <BookOpen className="h-5 w-5 mr-2" />
              Descrição da Atividade
            </h3>
            <div className="bg-gray-50 p-4 rounded-lg border">
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                {activity.description || "Sem descrição disponível."}
              </p>
            </div>
          </div>

          {/* Objetivos */}
          {activity.objectives && activity.objectives.length > 0 && (
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center">
                <Target className="h-5 w-5 mr-2" />
                Objetivos de Aprendizagem
              </h3>
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <ul className="space-y-2">
                  {activity.objectives.map((objective, index) => (
                    <li key={index} className="flex items-start">
                      <Check className="h-4 w-4 text-green-600 mr-2 mt-1 flex-shrink-0" />
                      <span className="text-green-800">{objective}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Vídeo Instrucional */}
          {activity.instructionVideo && (
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center">
                <Play className="h-5 w-5 mr-2" />
                Vídeo da Atividade
              </h3>
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <a
                  href={activity.instructionVideo}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center text-blue-600 hover:text-blue-800 font-medium"
                >
                  <Play className="h-4 w-4 mr-2" />
                  Assistir vídeo explicativo
                  <ExternalLink className="h-4 w-4 ml-2" />
                </a>
              </div>
            </div>
          )}

          {/* Tags */}
          {activity.tags && activity.tags.length > 0 && (
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center">
                <Tag className="h-5 w-5 mr-2" />
                Tags
              </h3>
              <div className="flex flex-wrap gap-2">
                {activity.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 bg-gray-100 text-gray-800 text-sm font-medium rounded-full border"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Estatísticas */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg border">
            <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center">
              <Clock className="h-5 w-5 mr-2" />
              Estatísticas
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Completamentos</p>
                <p className="text-2xl font-bold text-blue-600">
                  {activity.completions || 0}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Status</p>
                <p className={`text-sm font-medium ${
                  activity.isActive ? "text-green-600" : "text-red-600"
                }`}>
                  {activity.isActive ? "🟢 Ativa" : "🔴 Inativa"}
                </p>
              </div>
            </div>
          </div>

          {/* Botão Fechar */}
          <div className="flex justify-end pt-4 border-t">
            <Button onClick={onClose} className="bg-gray-600 hover:bg-gray-700 text-white">
              Fechar
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
