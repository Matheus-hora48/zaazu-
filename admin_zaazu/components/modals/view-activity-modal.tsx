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
import {
  X,
  BookOpen,
  Play,
  Target,
  Clock,
  Users,
  Tag,
  ExternalLink,
  Check,
  Package,
} from "lucide-react";
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
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <Card className="bg-white w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex text-gray-800 items-center">
              <BookOpen className="mr-2 h-5 w-5" />
              Detalhes da Atividade
            </CardTitle>
            <CardDescription className="text-gray-600">
              Informações completas da atividade
            </CardDescription>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
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
                {activity.age
                  ? `${activity.age}`
                  : "Não definida"}
              </p>
              {activity.age && (
                <p className="text-sm text-purple-600 mt-1">
                  Específico: {activity.age}
                </p>
              )}
            </div>

            <div
              className={`p-4 rounded-lg border ${getDifficultyColor(
                activity.difficulty || ""
              )}`}
            >
              <div className="flex items-center mb-2">
                <Target className="h-5 w-5 mr-2" />
                <span className="font-bold">Dificuldade</span>
              </div>
              <p className="flex items-center">
                <span className="mr-2">
                  {getDifficultyIcon(activity.difficulty || "")}
                </span>
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

          {/* Tipo de Conteúdo */}
          {activity.tag && (
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center">
                <Tag className="h-5 w-5 mr-2" />
                Tipo de Conteúdo
              </h3>
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <span className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-800 text-lg font-medium rounded-full border">
                  {activity.tag === "entretenimento" && "🎬 Entretenimento"}
                  {activity.tag === "atividade" && "🎯 Atividade"}
                  {activity.tag === "educativo" && "📚 Educativo"}
                </span>
              </div>
            </div>
          )}

          {/* Materiais */}
          {activity.materials && activity.materials.length > 0 && (
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center">
                <Package className="h-5 w-5 mr-2" />
                Materiais Necessários
              </h3>
              <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {activity.materials.map((material, index) => (
                    <div key={index} className="flex items-center">
                      <Check className="h-4 w-4 text-orange-600 mr-2" />
                      <span className="text-orange-800 capitalize text-sm">
                        {material}
                      </span>
                    </div>
                  ))}
                </div>
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
                <p
                  className={`text-sm font-medium ${
                    activity.isActive ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {activity.isActive ? "🟢 Ativa" : "🔴 Inativa"}
                </p>
              </div>
            </div>
          </div>

          {/* Botão Fechar */}
          <div className="flex justify-end pt-4 border-t border-gray-200 bg-white">
            <Button
              onClick={onClose}
              className="bg-gray-600 hover:bg-gray-700 text-white font-medium shadow-sm"
            >
              Fechar
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
