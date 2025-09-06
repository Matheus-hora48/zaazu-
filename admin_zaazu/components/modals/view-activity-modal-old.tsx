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
  Calendar,
  Users,
  Star,
  Brain,
  Palette,
  PuzzleIcon,
  PenTool,
} from "lucide-react";
import Image from "next/image";

interface QuizContent {
  questions: Array<{
    question: string;
    options: string[];
    correctAnswer: number;
  }>;
}

interface ViewActivityModalProps {
  isOpen: boolean;
  onClose: () => void;
  activity: Activity | null;
  onEdit: (activity: Activity) => void;
}

export function ViewActivityModal({
  isOpen,
  onClose,
  activity,
  onEdit,
}: ViewActivityModalProps) {
  if (!isOpen || !activity) return null;

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "quiz":
        return <Brain className="h-5 w-5" />;
      case "coloring":
        return <Palette className="h-5 w-5" />;
      case "puzzle":
        return <PuzzleIcon className="h-5 w-5" />;
      case "drawing":
        return <PenTool className="h-5 w-5" />;
      default:
        return <BookOpen className="h-5 w-5" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "quiz":
        return "Quiz";
      case "coloring":
        return "Colorir";
      case "puzzle":
        return "Quebra-cabeça";
      case "drawing":
        return "Desenho";
      default:
        return type;
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "text-green-600 bg-green-100";
      case "medium":
        return "text-yellow-600 bg-yellow-100";
      case "hard":
        return "text-red-600 bg-red-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const getDifficultyLabel = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "Fácil";
      case "medium":
        return "Médio";
      case "hard":
        return "Difícil";
      default:
        return difficulty;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <Card className="bg-white w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center text-gray-800">
              {getTypeIcon(activity.type)}
              <span className="ml-2">Visualizar Atividade</span>
            </CardTitle>
            <CardDescription className="text-gray-600">
              Detalhes completos da atividade
            </CardDescription>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Thumbnail e Informações Básicas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              {activity.thumbnail ? (
                <Image
                  src={activity.thumbnail}
                  alt={activity.title}
                  width={400}
                  height={225}
                  className="w-full aspect-video object-cover rounded-lg"
                />
              ) : (
                <div className="w-full aspect-video bg-gradient-to-br from-yellow-100 to-orange-100 rounded-lg flex items-center justify-center">
                  <div className="text-6xl">{getTypeIcon(activity.type)}</div>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  {activity.title}
                </h2>
                <p className="text-gray-600">{activity.description}</p>
              </div>

              <div className="flex flex-wrap gap-2">
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(
                    activity.difficulty
                  )}`}
                >
                  {getDifficultyLabel(activity.difficulty)}
                </span>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                  {getTypeLabel(activity.type)}
                </span>
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                    activity.isActive
                      ? "bg-green-100 text-green-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {activity.isActive ? "Ativa" : "Inativa"}
                </span>
              </div>
            </div>
          </div>

          {/* Detalhes */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Users className="h-5 w-5 text-purple-500" />
                  <div>
                    <p className="text-sm text-gray-600">Completadas</p>
                    <p className="text-xl font-bold text-gray-800">
                      {activity.completions}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Star className="h-5 w-5 text-yellow-500" />
                  <div>
                    <p className="text-sm text-gray-600">Categoria</p>
                    <p className="text-xl font-bold text-gray-800">
                      {activity.category}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-5 w-5 text-blue-500" />
                  <div>
                    <p className="text-sm text-gray-600">Faixa Etária</p>
                    <p className="text-xl font-bold text-gray-800">
                      {activity.ageGroup}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Informações Adicionais */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-3">
                Informações Técnicas
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-700">ID:</span>
                  <span className="font-mono text-gray-600">{activity.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-700">Criado em:</span>
                  <span className="text-gray-600">
                    {new Date(activity.createdAt).toLocaleDateString("pt-BR")}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-700">Atualizado em:</span>
                  <span className="text-gray-600">
                    {new Date(activity.updatedAt).toLocaleDateString("pt-BR")}
                  </span>
                </div>
              </div>
            </div>

            {activity.type === "quiz" && activity.content && (
              <div>
                <h3 className="text-lg font-semibold  text-gray-800 mb-3">
                  Conteúdo do Quiz
                </h3>
                <div className="text-sm">
                  <p className="text-gray-600">
                    {(activity.content as unknown as QuizContent).questions
                      ?.length || 0}{" "}
                    perguntas configuradas
                  </p>
                  {(activity.content as unknown as QuizContent).questions
                    ?.length > 0 && (
                    <div className="mt-2 p-3 bg-gray-50 rounded">
                      <p className="font-medium text-gray-800">
                        Exemplo de pergunta:
                      </p>
                      <p className="text-gray-700">
                        {
                          (activity.content as unknown as QuizContent)
                            .questions[0]?.question
                        }
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Tags */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Tags</h3>
            <div className="flex flex-wrap gap-2">
              {activity.tags && activity.tags.length > 0 ? (
                activity.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-yellow-100 text-yellow-800 text-sm rounded-full"
                  >
                    {tag}
                  </span>
                ))
              ) : (
                <p className="text-gray-500 text-sm italic">
                  Nenhuma tag adicionada
                </p>
              )}
            </div>
          </div>

          {/* Ações */}
          <div className="flex justify-end space-x-2 pt-4 border-t">
            <Button
              variant="outline"
              onClick={onClose}
              className="border-gray-300 text-gray-700 hover:bg-gray-100"
            >
              Fechar
            </Button>
            <Button
              onClick={() => onEdit(activity)}
              className="bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700"
            >
              Editar Atividade
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
