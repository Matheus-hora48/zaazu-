"use client";

import { X, Calendar, Clock, Target, Award, Book, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DailyMission, ContentTag } from "@/lib/types";

interface ViewDailyMissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  mission: DailyMission | null;
}

export function ViewDailyMissionModal({ isOpen, onClose, mission }: ViewDailyMissionModalProps) {
  if (!isOpen || !mission) return null;

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit", 
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getContentTagColor = (tag: ContentTag): string => {
    switch (tag) {
      case "educativo": return "bg-blue-100 text-blue-800";
      case "atividade": return "bg-green-100 text-green-800";
      case "entretenimento": return "bg-purple-100 text-purple-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getDifficultyColor = (difficulty?: string): string => {
    switch (difficulty) {
      case "facil": return "bg-green-100 text-green-800";
      case "medio": return "bg-yellow-100 text-yellow-800";
      case "dificil": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getAgeGroupIcon = (ageGroup: string) => {
    return ageGroup === "2-6" ? "👶" : "🧒";
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-xl font-semibold text-gray-800">
            Detalhes da Missão do Dia
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0 hover:bg-gray-100"
          >
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Header da Missão */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">{mission.title}</h2>
                <p className="text-gray-700 text-lg">{mission.description}</p>
              </div>
              <div className={`w-3 h-3 rounded-full ${mission.isActive ? "bg-green-500" : "bg-red-500"}`} />
            </div>
            
            <div className="flex flex-wrap gap-2">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getContentTagColor(mission.contentTag)}`}>
                {mission.contentTag}
              </span>
              <span className="px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                {getAgeGroupIcon(mission.ageGroup)} {mission.ageGroup} anos
              </span>
              {mission.difficulty && (
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(mission.difficulty)}`}>
                  {mission.difficulty}
                </span>
              )}
              <span className="px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
                {mission.isActive ? "Ativo" : "Inativo"}
              </span>
            </div>
          </div>

          {/* Informações Gerais */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <Calendar className="h-5 w-5 text-gray-600" />
              <div>
                <p className="text-sm font-medium text-gray-900">Criado em</p>
                <p className="text-sm text-gray-600">{formatDate(mission.createdAt)}</p>
              </div>
            </div>

            {mission.estimatedDuration && (
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <Clock className="h-5 w-5 text-gray-600" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Duração Estimada</p>
                  <p className="text-sm text-gray-600">{mission.estimatedDuration} minutos</p>
                </div>
              </div>
            )}

            {mission.updatedAt && (
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <Calendar className="h-5 w-5 text-gray-600" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Última Atualização</p>
                  <p className="text-sm text-gray-600">{formatDate(mission.updatedAt)}</p>
                </div>
              </div>
            )}
          </div>

          {/* Instruções */}
          {mission.instructions && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Book className="h-5 w-5 text-gray-600" />
                <h3 className="text-lg font-semibold text-gray-900">Instruções</h3>
              </div>
              <div className="bg-blue-50 rounded-lg p-4">
                <p className="text-gray-700 whitespace-pre-wrap">{mission.instructions}</p>
              </div>
            </div>
          )}

          {/* Materiais */}
          {mission.materials && mission.materials.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Users className="h-5 w-5 text-gray-600" />
                <h3 className="text-lg font-semibold text-gray-900">Materiais Necessários</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {mission.materials.map((material, index) => (
                  <div key={index} className="flex items-center gap-2 p-2 bg-green-50 rounded-lg">
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                    <span className="text-sm text-gray-700">{material}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Objetivos */}
          {mission.goals && mission.goals.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Target className="h-5 w-5 text-gray-600" />
                <h3 className="text-lg font-semibold text-gray-900">Objetivos da Missão</h3>
              </div>
              <div className="space-y-2">
                {mission.goals.map((goal, index) => (
                  <div key={index} className="flex items-start gap-2 p-3 bg-yellow-50 rounded-lg">
                    <Target className="h-4 w-4 text-yellow-600 mt-0.5" />
                    <span className="text-sm text-gray-700">{goal}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recompensas */}
          {mission.rewards && mission.rewards.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Award className="h-5 w-5 text-gray-600" />
                <h3 className="text-lg font-semibold text-gray-900">Recompensas</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {mission.rewards.map((reward, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-yellow-100 text-yellow-800 text-sm rounded-full"
                  >
                    🏆 {reward}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-end pt-4">
            <Button
              onClick={onClose}
              className="bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800"
            >
              Fechar
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
