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
  Target,
  Clock,
  Tag,
} from "lucide-react";

export default function AtividadesPage() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState("");
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
      const data = await activityService.getAll();
      setActivities(data);
    } catch (error) {
      console.error("Error loading activities:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteActivity = async (id: string) => {
    if (confirm("Tem certeza que deseja excluir esta atividade?")) {
      try {
        await activityService.delete(id);
        loadActivities();
      } catch (error) {
        console.error("Error deleting activity:", error);
        alert("Erro ao excluir atividade. Tente novamente.");
      }
    }
  };

  const filteredActivities = activities.filter((activity) => {
    const matchesSearch = 
      activity.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      activity.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      activity.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      activity.tag?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = !categoryFilter || activity.category === categoryFilter;
    const matchesDifficulty = !difficultyFilter || activity.difficulty === difficultyFilter;
    
    return matchesSearch && matchesCategory && matchesDifficulty;
  });

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

  const categories = [
    "matematica",
    "portugues",
    "ciencias", 
    "arte",
    "musica",
    "educacao-fisica",
    "historia",
    "geografia",
    "ingles",
    "vida-pratica"
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <BookOpen className="mr-3 h-8 w-8" />
              Atividades
            </h1>
            <p className="text-gray-600 mt-1">
              Gerencie as atividades educativas disponíveis
            </p>
          </div>
          <Button
            onClick={() => setIsAddModalOpen(true)}
            className="bg-green-600 hover:bg-green-700 text-white flex items-center"
          >
            <Plus className="mr-2 h-4 w-4" />
            Nova Atividade
          </Button>
        </div>

        {/* Filtros */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar atividades..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          
          <div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todas as categorias</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {getCategoryLabel(cat)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={difficultyFilter}
              onChange={(e) => setDifficultyFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todas as dificuldades</option>
              <option value="easy">🟢 Fácil</option>
              <option value="medium">🟡 Médio</option>
              <option value="hard">🔴 Difícil</option>
            </select>
          </div>

          <div className="text-sm text-gray-600 flex items-center">
            Total: {filteredActivities.length} atividades
          </div>
        </div>

        {/* Lista de Atividades */}
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Carregando atividades...</p>
          </div>
        ) : filteredActivities.length === 0 ? (
          <div className="text-center py-12">
            <BookOpen className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              Nenhuma atividade encontrada
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm || categoryFilter || difficultyFilter
                ? "Tente ajustar os filtros de busca."
                : "Comece criando uma nova atividade."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredActivities.map((activity) => (
              <Card
                key={activity.id}
                className="overflow-hidden hover:shadow-lg transition-shadow duration-300 border-2"
              >
                <CardContent className="p-0">
                  {/* Thumbnail */}
                  <div className="relative h-48 bg-gradient-to-r from-blue-100 to-purple-100">
                    {activity.thumbnail ? (
                      <Image
                        src={activity.thumbnail}
                        alt={activity.title}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="h-full flex items-center justify-center">
                        {getCategoryIcon(activity.category || "")}
                      </div>
                    )}
                    
                    {/* Status Badge */}
                    <div className="absolute top-2 right-2">
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

                    {/* Difficulty Badge */}
                    <div className="absolute top-2 left-2">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getDifficultyColor(activity.difficulty || "")}`}>
                        {getDifficultyIcon(activity.difficulty || "")} {getDifficultyText(activity.difficulty || "")}
                      </span>
                    </div>
                  </div>

                  {/* Conteúdo */}
                  <div className="p-4 space-y-3">
                    <div>
                      <h3 className="font-bold text-lg text-gray-900 mb-1">
                        {activity.title}
                      </h3>
                      <p className="text-gray-600 text-sm line-clamp-2">
                        {activity.description}
                      </p>
                    </div>

                    {/* Metadados */}
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="flex items-center text-gray-500">
                        <Tag className="h-3 w-3 mr-1" />
                        {getCategoryLabel(activity.category || "")}
                      </div>
                      <div className="flex items-center text-gray-500">
                        <Users className="h-3 w-3 mr-1" />
                        {activity.minAge ? `${activity.minAge}+ anos` : "Idade livre"}
                      </div>
                      <div className="flex items-center text-gray-500">
                        <Target className="h-3 w-3 mr-1" />
                        {activity.objectives?.length || 0} objetivos
                      </div>
                      <div className="flex items-center text-gray-500">
                        <Clock className="h-3 w-3 mr-1" />
                        {activity.completions || 0} realizações
                      </div>
                    </div>

                    {/* Tag */}
                    {activity.tag && (
                      <div className="flex flex-wrap gap-1">
                        <span className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                          {activity.tag === "entretenimento" && "🎉 Entretenimento"}
                          {activity.tag === "atividade" && "🏃‍♀️ Atividade"}
                          {activity.tag === "educativo" && "📚 Educativo"}
                        </span>
                      </div>
                    )}

                    {/* Vídeo Indicator */}
                    {activity.instructionVideo && (
                      <div className="flex items-center text-blue-600 text-xs">
                        <Play className="h-3 w-3 mr-1" />
                        Vídeo disponível
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2 pt-2 border-t">
                      <Button
                        onClick={() => {
                          setSelectedActivity(activity);
                          setIsViewModalOpen(true);
                        }}
                        variant="outline"
                        size="sm"
                        className="flex-1"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Ver
                      </Button>
                      <Button
                        onClick={() => {
                          setSelectedActivity(activity);
                          setIsEditModalOpen(true);
                        }}
                        variant="outline"
                        size="sm"
                        className="flex-1"
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Editar
                      </Button>
                      <Button
                        onClick={() => handleDeleteActivity(activity.id)}
                        variant="outline"
                        size="sm"
                        className="text-red-600 border-red-200 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Modals */}
        <AddActivityModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onSuccess={loadActivities}
        />

        {selectedActivity && (
          <>
            <ViewActivityModal
              isOpen={isViewModalOpen}
              onClose={() => {
                setIsViewModalOpen(false);
                setSelectedActivity(null);
              }}
              activity={selectedActivity}
            />
            <EditActivityModal
              isOpen={isEditModalOpen}
              onClose={() => {
                setIsEditModalOpen(false);
                setSelectedActivity(null);
              }}
              onSuccess={loadActivities}
              activity={selectedActivity}
            />
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
