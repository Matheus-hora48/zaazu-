"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AddActivityModal } from "@/components/modals/add-activity-modal";
import { ViewActivityModal } from "@/components/modals/view-activity-modal";
import { EditActivityModal } from "@/components/modals/edit-activity-modal";
import { activityService } from "@/lib/services";
import { Activity } from "@/lib/types";
import {
  BookOpen,
  Plus,
  Search,
  Eye,
  Edit,
  Trash2,
  Play,
  Calendar,
  Users,
  Star,
  Brain,
  Palette,
  PuzzleIcon,
  PenTool,
} from "lucide-react";
import { useAdminLogging } from "@/lib/use-admin-logging";

export default function AtividadesPage() {
  const { logPageAccess, logDelete, logError } = useAdminLogging();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(
    null
  );

  useEffect(() => {
    loadActivities();
  }, []);

  const loadActivities = async () => {
    try {
      setLoading(true);
      const activitiesData = await activityService.getAll();
      setActivities(activitiesData);

      // Log do acesso à página
      await logPageAccess("atividades", activitiesData.length, {
        quizzes: activitiesData.filter((a) => a.type === "quiz").length,
        coloring: activitiesData.filter((a) => a.type === "coloring").length,
        puzzles: activitiesData.filter((a) => a.type === "puzzle").length,
        drawing: activitiesData.filter((a) => a.type === "drawing").length,
      });
    } catch (error) {
      console.error("Error loading activities:", error);
      await logError("activities_load", "Falha ao carregar atividades", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredActivities = activities.filter(
    (activity) =>
      activity.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      activity.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      activity.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDeleteActivity = async (id: string) => {
    if (confirm("Tem certeza que deseja excluir esta atividade?")) {
      try {
        const activity = activities.find((a) => a.id === id);
        await activityService.delete(id);

        // Log da exclusão
        await logDelete("activity", activity?.title || "Unknown", id, {
          activityType: activity?.type,
          activityCategory: activity?.category,
          ageGroup: activity?.ageGroup,
        });

        loadActivities();
      } catch (error) {
        console.error("Error deleting activity:", error);
        await logError(
          "activity_deletion",
          `Falha ao excluir atividade ${id}`,
          error
        );
        alert("Erro ao excluir atividade");
      }
    }
  };

  const handleViewActivity = (activity: Activity) => {
    setSelectedActivity(activity);
    setIsViewModalOpen(true);
  };

  const handleEditActivity = (activity: Activity) => {
    setSelectedActivity(activity);
    setIsEditModalOpen(true);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "quiz":
        return <Brain className="h-4 w-4" />;
      case "coloring":
        return <Palette className="h-4 w-4" />;
      case "puzzle":
        return <PuzzleIcon className="h-4 w-4" />;
      case "drawing":
        return <PenTool className="h-4 w-4" />;
      default:
        return <BookOpen className="h-4 w-4" />;
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

  const activeActivities = activities.filter((activity) => activity.isActive);
  const totalCompletions = activities.reduce(
    (sum, activity) => sum + activity.completions,
    0
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Gerenciar Atividades
            </h1>
            <p className="text-gray-600 mt-1">
              Criação e organização de atividades educativas interativas
            </p>
          </div>
          <Button
            onClick={() => setIsAddModalOpen(true)}
            className="bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700"
          >
            <Plus className="mr-2 h-4 w-4" />
            Criar Atividade
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <BookOpen className="h-8 w-8 text-yellow-500" />
                <div>
                  <p className="text-2xl text-gray-800 font-bold">
                    {activities.length}
                  </p>
                  <p className="text-sm text-gray-600">Total de Atividades</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Play className="h-8 w-8 text-green-500" />
                <div>
                  <p className="text-2xl text-gray-800 font-bold">
                    {activeActivities.length}
                  </p>
                  <p className="text-sm text-gray-600">Ativas</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Users className="h-8 w-8 text-purple-500" />
                <div>
                  <p className="text-2xl text-gray-800 font-bold">
                    {totalCompletions.toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-600">Completadas</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Star className="h-8 w-8 text-blue-500" />
                <div>
                  <p className="text-2xl  text-gray-800 font-bold">
                    {activities.length > 0
                      ? Math.round(totalCompletions / activities.length)
                      : 0}
                  </p>
                  <p className="text-sm text-gray-600">Média por Atividade</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar atividades por título, categoria ou tipo..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Activities Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <div className="aspect-video bg-gray-200 animate-pulse" />
                <CardContent className="p-4">
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded animate-pulse" />
                    <div className="h-3 bg-gray-200 rounded animate-pulse w-3/4" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredActivities.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {searchTerm
                  ? "Nenhuma atividade encontrada"
                  : "Nenhuma atividade criada"}
              </h3>
              <p className="text-gray-600 mb-4">
                {searchTerm
                  ? "Tente buscar por outros termos ou ajuste os filtros."
                  : "Comece criando sua primeira atividade educativa."}
              </p>
              {!searchTerm && (
                <Button
                  onClick={() => setIsAddModalOpen(true)}
                  className="bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700"
                >
                  <Plus className="mr-2 h-4 w-4 text-gray-600" />
                  Criar Primeira Atividade
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredActivities.map((activity) => (
              <Card
                key={activity.id}
                className="overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="relative">
                  {activity.thumbnail ? (
                    <Image
                      src={activity.thumbnail}
                      alt={activity.title}
                      width={400}
                      height={225}
                      className="aspect-video object-cover"
                    />
                  ) : (
                    <div className="aspect-video bg-gradient-to-br from-yellow-100 to-orange-100 flex items-center justify-center">
                      <div className="text-4xl">
                        {getTypeIcon(activity.type)}
                      </div>
                    </div>
                  )}
                  <div
                    className={`absolute top-2 left-2 px-2 py-1 rounded text-xs font-medium ${
                      activity.isActive
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {activity.isActive ? "Ativa" : "Inativa"}
                  </div>
                  <div
                    className={`absolute top-2 right-2 px-2 py-1 rounded text-xs font-medium ${getDifficultyColor(
                      activity.difficulty
                    )}`}
                  >
                    {getDifficultyLabel(activity.difficulty)}
                  </div>
                </div>
                <CardContent className="p-4">
                  <div className="space-y-2">
                    <div className="flex items-center text-gray-700 space-x-2">
                      {getTypeIcon(activity.type)}
                      <span className="text-xs text-gray-500 uppercase tracking-wide">
                        {getTypeLabel(activity.type)}
                      </span>
                    </div>
                    <h3 className="font-semibold text-gray-900 line-clamp-2">
                      {activity.title}
                    </h3>
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {activity.description}
                    </p>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span className="flex items-center">
                        <Users className="h-3 w-3 mr-1" />
                        {activity.completions} completadas
                      </span>
                      <span>{activity.ageGroup}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span className="flex items-center">
                        <Calendar className="h-3 w-3 mr-1" />
                        {new Date(activity.createdAt).toLocaleDateString(
                          "pt-BR"
                        )}
                      </span>
                      <span className="bg-gray-100 px-2 py-1 rounded">
                        {activity.category}
                      </span>
                    </div>
                  </div>
                  <div className="flex justify-between pt-4 space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 text-orange-600 hover:text-orange-700"
                      onClick={() => handleViewActivity(activity)}
                    >
                      <Eye className="h-3 w-3 mr-1" />
                      Ver
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 text-orange-600 hover:text-orange-700"
                      onClick={() => handleEditActivity(activity)}
                    >
                      <Edit className="h-3 w-3 mr-1" />
                      Editar
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      onClick={() => handleDeleteActivity(activity.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Add Activity Modal */}
        <AddActivityModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onSuccess={loadActivities}
        />

        {/* View Activity Modal */}
        <ViewActivityModal
          isOpen={isViewModalOpen}
          onClose={() => setIsViewModalOpen(false)}
          activity={selectedActivity}
          onEdit={handleEditActivity}
        />

        {/* Edit Activity Modal */}
        <EditActivityModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onSuccess={() => {
            loadActivities();
            setIsEditModalOpen(false);
          }}
          activity={selectedActivity}
        />
      </div>
    </DashboardLayout>
  );
}
