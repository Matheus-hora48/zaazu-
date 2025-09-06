"use client";

import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Settings,
  Power,
  PowerOff,
  Trash2,
  Plus,
  Grid3x3,
} from "lucide-react";
import { HomeGrid, GridTag } from "@/lib/types";
import { gridService } from "@/lib/grid-service";
import { GridRowManager } from "@/components/modals/grid-row-manager";

function GridsContent() {
  const [grids, setGrids] = useState<HomeGrid[]>([]);
  const [loading, setLoading] = useState(true);
  const [showGridManager, setShowGridManager] = useState(false);
  const [selectedGridId, setSelectedGridId] = useState<string | undefined>();
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    const createDefaultGrids = async () => {
      try {
        // Criar as 3 grades padrão, uma para cada tag
        const defaultGrids = [
          {
            name: "� Diversão e Entretenimento",
            description: "Conteúdo divertido para momentos de lazer das crianças",
            tag: "entretenimento" as GridTag,
            isActive: true, // Primeira grade ativa por padrão
          },
          {
            name: "🏃‍♀️ Atividades Físicas e Movimento",
            description: "Conteúdo para movimentar o corpo e se exercitar de forma divertida",
            tag: "atividade" as GridTag,
            isActive: false,
          },
          {
            name: "📚 Aprendizado e Educação",
            description: "Conteúdo educativo para aprender brincando",
            tag: "educativo" as GridTag,
            isActive: false,
          },
        ];

        const createdGrids = [];
        for (const gridData of defaultGrids) {
          const gridId = await gridService.createGrid({
            name: gridData.name,
            description: gridData.description,
            tag: gridData.tag,
            rows: [],
            isActive: gridData.isActive,
          });

          // Criar uma linha padrão para cada grade (sem contentType específico)
          await gridService.createGridRow(gridId, {
            title: `Conteúdo Selecionado`,
            description: `Os melhores conteúdos selecionados para esta categoria`,
            items: [],
            isActive: true,
            order: 1,
            maxItems: 20,
          });

          createdGrids.push(gridId);
        }

        return await gridService.getGrids();
      } catch (error) {
        console.error("Error creating default grids:", error);
        return [];
      }
    };

    const loadData = async () => {
      setLoading(true);
      try {
        let gridsData = await gridService.getGrids();
        
        // Se não há grids, criar as 3 grades padrão automaticamente
        if (gridsData.length === 0) {
          gridsData = await createDefaultGrids();
        }
        
        setGrids(gridsData);
      } catch (error) {
        console.error("Error loading grids:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleToggleGridStatus = async (gridId: string, isActive: boolean) => {
    try {
      const targetGrid = grids.find(g => g.id === gridId);
      if (!targetGrid) return;

      // Se ativando esta grade, desativar outras grades da mesma tag
      if (isActive) {
        const sameTagGrids = grids.filter((g) => {
          return g.isActive && g.id !== gridId && g.tag === targetGrid.tag;
        });
        
        for (const grid of sameTagGrids) {
          await gridService.updateGrid(grid.id, { isActive: false });
        }
      }

      await gridService.updateGrid(gridId, { isActive });
      
      // Recarregar grids
      const updatedGrids = await gridService.getGrids();
      setGrids(updatedGrids);
    } catch (error) {
      console.error("Error updating grid status:", error);
    }
  };

  const handleDeleteGrid = async (gridId: string) => {
    if (
      !confirm(
        "Tem certeza que deseja excluir esta grade? Todas as linhas serão removidas."
      )
    ) {
      return;
    }

    try {
      await gridService.deleteGrid(gridId);
      const updatedGrids = await gridService.getGrids();
      setGrids(updatedGrids);
    } catch (error) {
      console.error("Error deleting grid:", error);
    }
  };

  const getTagIcon = (tag: GridTag) => {
    switch (tag) {
      case "entretenimento":
        return "�";
      case "atividade":
        return "🏃‍♀️";
      case "educativo":
        return "📚";
      default:
        return "�";
    }
  };

  const getTagName = (tag: GridTag) => {
    switch (tag) {
      case "entretenimento":
        return "Entretenimento";
      case "atividade":
        return "Atividade";
      case "educativo":
        return "Educativo";
      default:
        return "Conteúdo";
    }
  };

  const handleCreateGrid = async (name: string, description: string, tag: GridTag) => {
    try {
      const gridId = await gridService.createGrid({
        name,
        description,
        tag,
        rows: [],
        isActive: false, // Nova grade sempre inativa por padrão
      });

      // Criar uma linha padrão para a nova grade (pode ter qualquer tipo de conteúdo)
      await gridService.createGridRow(gridId, {
        title: `Conteúdos Selecionados`,
        description: `Os melhores conteúdos desta categoria para as crianças`,
        items: [],
        isActive: true,
        order: 1,
        maxItems: 20,
      });

      // Recarregar grids
      const updatedGrids = await gridService.getGrids();
      setGrids(updatedGrids);
      setShowCreateModal(false);
    } catch (error) {
      console.error("Error creating grid:", error);
    }
  };

  const getActiveGridsByTag = () => {
    const activeGrids = grids.filter((g) => g.isActive);
    const result = {
      entretenimento: null as HomeGrid | null,
      atividade: null as HomeGrid | null,
      educativo: null as HomeGrid | null,
    };

    activeGrids.forEach(grid => {
      if (grid.tag === 'entretenimento') result.entretenimento = grid;
      else if (grid.tag === 'atividade') result.atividade = grid;
      else if (grid.tag === 'educativo') result.educativo = grid;
    });

    return result;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            Sistema de Grades por Tipo de Conteúdo
          </h1>
          <p className="text-gray-600 mt-1">
            Crie grades específicas para vídeos, atividades ou jogos. Você pode ativar uma grade de cada tipo simultaneamente.
          </p>
        </div>
        <Button
          onClick={() => setShowCreateModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          <Plus className="h-4 w-4 mr-2" />
          Criar Nova Grade
        </Button>
      </div>

      {/* Active Grids Indicator */}
      {grids.some(g => g.isActive) && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Power className="h-5 w-5 text-green-600" />
              <span className="font-medium text-green-800">
                Grades Ativas no Aplicativo:
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {(() => {
                const activeByTag = getActiveGridsByTag();
                return (
                  <>
                    <div className="bg-white rounded-lg p-3 border border-green-200">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">�</span>
                        <div>
                          <div className="font-medium text-green-800">
                            {activeByTag.entretenimento ? activeByTag.entretenimento.name : "Nenhuma grade de entretenimento ativa"}
                          </div>
                          <div className="text-sm text-green-600">
                            {activeByTag.entretenimento ? `${activeByTag.entretenimento.rows?.length || 0} linhas` : "Selecione uma grade de entretenimento"}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white rounded-lg p-3 border border-green-200">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">🏃‍♀️</span>
                        <div>
                          <div className="font-medium text-green-800">
                            {activeByTag.atividade ? activeByTag.atividade.name : "Nenhuma grade de atividade ativa"}
                          </div>
                          <div className="text-sm text-green-600">
                            {activeByTag.atividade ? `${activeByTag.atividade.rows?.length || 0} linhas` : "Selecione uma grade de atividade"}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white rounded-lg p-3 border border-green-200">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">📚</span>
                        <div>
                          <div className="font-medium text-green-800">
                            {activeByTag.educativo ? activeByTag.educativo.name : "Nenhuma grade educativa ativa"}
                          </div>
                          <div className="text-sm text-green-600">
                            {activeByTag.educativo ? `${activeByTag.educativo.rows?.length || 0} linhas` : "Selecione uma grade educativa"}
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                );
              })()}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Grids List */}
      <div className="grid gap-4">
        {grids.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Grid3x3 className="h-16 w-16 mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                🎯 Inicializando Grades por Tipo de Conteúdo...
              </h3>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <p className="text-blue-800 font-medium mb-2">
                  Criando automaticamente 3 grades educativas para crianças:
                </p>
                <div className="space-y-1 text-sm text-blue-700">
                  <div>� <strong>Vídeos Educativos Infantis</strong> - Conteúdo audiovisual educativo</div>
                  <div>� <strong>Atividades e Exercícios</strong> - Atividades interativas e lúdicas</div>
                  <div>🎮 <strong>Jogos Educativos</strong> - Aprendizado através de jogos divertidos</div>
                </div>
              </div>
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            </CardContent>
          </Card>
        ) : (
          grids.map((grid) => {
            return (
              <Card
                key={grid.id}
                className={grid.isActive ? "border-green-200 bg-green-50" : ""}
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={`p-3 rounded-lg ${
                          grid.isActive ? "bg-green-100" : "bg-gray-100"
                        }`}
                      >
                        <span className="text-2xl">
                          {getTagIcon(grid.tag)}
                        </span>
                      </div>
                      <div>
                        <CardTitle className="flex items-center text-gray-900 gap-2">
                          {grid.name}
                          {grid.isActive && (
                            <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                              Ativa
                            </span>
                          )}
                        </CardTitle>
                        <CardDescription className="text-gray-700 font-medium">
                          {grid.description || "📝 Nenhuma descrição configurada"}
                        </CardDescription>
                        <div className="mt-1 text-sm text-blue-600 font-medium">
                          {getTagIcon(grid.tag)} Grade de {getTagName(grid.tag)}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          handleToggleGridStatus(grid.id, !grid.isActive)
                        }
                        className={
                          grid.isActive
                            ? "border-orange-300 text-orange-700 hover:bg-orange-50"
                            : "border-green-300 text-green-700 hover:bg-green-50"
                        }
                      >
                        {grid.isActive ? (
                          <>
                            <PowerOff className="h-4 w-4 mr-2" />
                            Desativar
                          </>
                        ) : (
                          <>
                            <Power className="h-4 w-4 mr-2" />
                            Ativar
                          </>
                        )}
                      </Button>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedGridId(grid.id);
                          setShowGridManager(true);
                        }}
                        className="border-blue-300 text-blue-700 hover:bg-blue-50"
                      >
                        <Settings className="h-4 w-4 mr-2" />
                        Configurar Linhas
                      </Button>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteGrid(grid.id)}
                        className="border-red-300 text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Excluir
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="pt-4">
                  {/* Row preview */}
                  {grid.rows && grid.rows.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <h4 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
                        📋 Linhas configuradas nesta grade:
                      </h4>
                      <div className="space-y-2">
                        {grid.rows.slice(0, 3).map((row) => (
                          <div
                            key={row.id}
                            className="bg-gray-50 p-2 rounded-lg flex items-center gap-3 border"
                          >
                            <span className="text-lg">
                              📝
                            </span>
                            <span className="font-medium text-gray-800">
                              {row.title}
                            </span>
                            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full font-medium ml-auto">
                              {row.items?.length || 0}{" "}
                              {row.items?.length === 1 ? "item" : "itens"}
                            </span>
                          </div>
                        ))}
                        {grid.rows.length > 3 && (
                          <div className="text-sm text-gray-600 bg-gray-100 p-2 rounded text-center">
                            ➕ Mais {grid.rows.length - 3}{" "}
                            {grid.rows.length - 3 === 1 ? "linha" : "linhas"}{" "}
                            configuradas
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Create Grid Modal */}
      {showCreateModal && (
        <CreateGridModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreateGrid}
        />
      )}

      {/* Grid Manager Modal */}
      <GridRowManager
        isOpen={showGridManager}
        onClose={() => {
          setShowGridManager(false);
          setSelectedGridId(undefined);
        }}
        onSuccess={async () => {
          // Recarregar grids após sucesso
          setLoading(true);
          try {
            const gridsData = await gridService.getGrids();
            setGrids(gridsData);
          } catch (error) {
            console.error("Error reloading grids:", error);
          } finally {
            setLoading(false);
          }
          setShowGridManager(false);
          setSelectedGridId(undefined);
        }}
        gridId={selectedGridId}
      />
    </div>
  );
}

// Create Grid Modal Component
interface CreateGridModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (name: string, description: string, tag: GridTag) => void;
}

function CreateGridModal({ isOpen, onClose, onSubmit }: CreateGridModalProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [tag, setTag] = useState<GridTag>("entretenimento");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onSubmit(name.trim(), description.trim(), tag);
    setName("");
    setDescription("");
    setTag("entretenimento");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md shadow-2xl border-2 bg-white">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-gray-900 flex items-center">
            <Grid3x3 className="mr-3 h-8 w-8" />
            Criar Nova Grade
          </CardTitle>
          <CardDescription className="text-gray-600 font-medium">
            Crie uma grade específica para um tipo de conteúdo
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4 pt-6">
            <div>
              <label className="block text-sm font-bold text-gray-800 mb-2">
                Categoria da Grade *
              </label>
              <select
                value={tag}
                onChange={(e) => setTag(e.target.value as GridTag)}
                className="w-full px-3 py-2 border-2 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                required
              >
                <option value="entretenimento">🎉 Entretenimento - Diversão e Lazer</option>
                <option value="atividade">🏃‍♀️ Atividade - Movimento e Exercícios</option>
                <option value="educativo">📚 Educativo - Aprendizado e Estudos</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Cada categoria pode ter apenas uma grade ativa por vez. A lista inicial poderá conter vídeos, jogos e atividades misturados.
              </p>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-800 mb-2">
                Nome da Grade *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Vídeos de Matemática, Jogos de Português, Atividades de Ciências..."
                className="w-full px-3 py-2 border-2 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-800 mb-2">
                Descrição
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Descreva o propósito e público-alvo desta grade..."
                rows={3}
                className="w-full px-3 py-2 border-2 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              />
            </div>
          </CardContent>

          <div className="flex justify-end gap-3 p-6 pt-0">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="border-gray-300 text-gray-700 hover:bg-gray-100"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={!name.trim()}
              className="bg-green-600 hover:bg-green-700 text-white font-bold px-6"
            >
              Criar Grade
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

export default function GridsPage() {
  return (
    <DashboardLayout>
      <GridsContent />
    </DashboardLayout>
  );
}
