"use client";

import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AddActivityModal } from "@/components/modals/add-activity-modal";
import { ViewActivityModal } from "@/components/modals/view-activity-modal";
import { EditActivityModal } from "@/components/modals/edit-activity-modal";
import { ActivityCard } from "@/components/ui/activity-card";
import { activityService } from "@/lib/services";
import { Activity } from "@/lib/types";
import {
  BookOpen,
  Plus,
  Search,
  Clock,
  Brain,
  Star,
} from "lucide-react";

export default function AtividadesPage() {
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
    
    return matchesSearch;
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <BookOpen className="mr-3 h-8 w-8" />
              Gerenciar Atividades
            </h1>
            <p className="text-gray-600 mt-1">
              Gerencie todo o conteúdo de atividades da plataforma
            </p>
          </div>
          <Button
            onClick={() => setIsAddModalOpen(true)}
            className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
          >
            <Plus className="mr-2 h-4 w-4" />
            Adicionar Atividade
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <BookOpen className="h-4 w-4 text-blue-500" />
                <span className="text-sm font-medium text-gray-600">
                  Total de Atividades
                </span>
              </div>
              <p className="text-2xl font-bold text-gray-700 mt-1">
                {activities.length}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-green-500" />
                <span className="text-sm font-medium text-gray-600">
                  Total de Realizações
                </span>
              </div>
              <p className="text-2xl font-bold text-gray-700 mt-1">
                {activities
                  .reduce((total, activity) => total + (activity.completions || 0), 0)
                  .toLocaleString()}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Brain className="h-4 w-4 text-purple-500" />
                <span className="text-sm font-medium text-gray-600">
                  Atividades Ativas
                </span>
              </div>
              <p className="text-2xl font-bold text-gray-700 mt-1">
                {activities.filter((activity) => activity.isActive).length}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Star className="h-4 w-4 text-orange-500" />
                <span className="text-sm font-medium text-gray-600">
                  Categorias
                </span>
              </div>
              <p className="text-2xl font-bold text-gray-700 mt-1">
                {new Set(activities.map(activity => activity.category)).size}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <Card>
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar atividades por título ou categoria..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 text-gray-700"
              />
            </div>
          </CardContent>
        </Card>

        {/* Activities Grid */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredActivities.map((activity) => (
              <ActivityCard
                key={activity.id}
                activity={activity}
                onView={(activity) => {
                  setSelectedActivity(activity);
                  setIsViewModalOpen(true);
                }}
                onEdit={(activity) => {
                  setSelectedActivity(activity);
                  setIsEditModalOpen(true);
                }}
                onDelete={handleDeleteActivity}
              />
            ))}

            {filteredActivities.length === 0 && !loading && (
              <div className="col-span-full text-center py-12">
                <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {searchTerm
                    ? "Nenhuma atividade encontrada"
                    : "Nenhuma atividade cadastrada"}
                </h3>
                <p className="text-gray-500 mb-4">
                  {searchTerm
                    ? "Tente buscar com outros termos"
                    : "Comece adicionando sua primeira atividade"}
                </p>
                {!searchTerm && (
                  <Button
                    onClick={() => setIsAddModalOpen(true)}
                    className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Adicionar Primeira Atividade
                  </Button>
                )}
              </div>
            )}
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
