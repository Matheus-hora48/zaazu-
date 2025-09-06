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
import { Settings, Grid3x3, Power, PowerOff, Trash2, Plus } from "lucide-react";
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
            name: "🎉 Diversão e Entretenimento",
            description:
              "Conteúdo divertido para momentos de lazer das crianças",
            tag: "entretenimento" as GridTag,
            isActive: true, // Primeira grade ativa por padrão
          },
          {
            name: "🏃‍♀️ Atividades Físicas e Movimento",
            description:
              "Conteúdo para movimentar o corpo e se exercitar de forma divertida",
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

          // Criar uma linha padrão para cada grade (primeira linha com conteúdo misto)
          await gridService.createGridRow(gridId, {
            title: `Conteúdo em Destaque`,
            description: `Seleção especial com vídeos, jogos e atividades para as crianças`,
            items: [],
            isActive: true,
            order: 1,
            maxItems: 6, // Primeira linha limitada a 6 itens mistos
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

        // Se não há grades, criar as padrão
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
      const targetGrid = grids.find((g) => g.id === gridId);
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

      // Ativar/desativar a grade atual
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
        return "🎉";
      case "atividade":
        return "🏃‍♀️";
      case "educativo":
        return "📚";
      default:
        return "📁";
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

  const handleCreateGrid = async (
    name: string,
    description: string,
    tag: GridTag
  ) => {
    try {
      const gridId = await gridService.createGrid({
        name,
        description,
        tag,
        rows: [],
        isActive: false, // Nova grade sempre inativa por padrão
      });

      // Criar uma linha padrão para a nova grade (pode ter qualquer tipo de conteúdo misturado)
      await gridService.createGridRow(gridId, {
        title: `Conteúdo em Destaque`,
        description: `Seleção especial com vídeos, jogos e atividades para as crianças`,
        items: [],
        isActive: true,
        order: 1,
        maxItems: 6, // Primeira linha limitada a 6 itens
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

    activeGrids.forEach((grid) => {
      if (grid.tag === "entretenimento") result.entretenimento = grid;
      else if (grid.tag === "atividade") result.atividade = grid;
      else if (grid.tag === "educativo") result.educativo = grid;
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
            Sistema de Grades por Categoria
          </h1>
          <p className="text-gray-600 mt-1">
            Crie grades para diferentes categorias: entretenimento, atividade e
            educativo. Você pode ativar uma grade de cada categoria
            simultaneamente.
          </p>
        </div>
        <Button
          onClick={() => setShowCreateModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2"
        >
          <Plus className="h-5 w-5 mr-2" />
          Nova Grade
        </Button>
      </div>

      {/* Seção de Grades Ativas */}
      <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
        <CardHeader>
          <CardTitle className="text-xl text-green-800 flex items-center">
            <Power className="mr-2 h-6 w-6" />
            Grades Ativas no App das Crianças
          </CardTitle>
          <CardDescription className="text-green-700">
            Estas são as grades que estão aparecendo na tela inicial do app das
            crianças
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {(() => {
              const activeByTag = getActiveGridsByTag();
              return (
                <>
                  <div className="bg-white rounded-lg p-3 border border-green-200">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">🎉</span>
                      <div>
                        <div className="font-medium text-green-800">
                          {activeByTag.entretenimento
                            ? activeByTag.entretenimento.name
                            : "Nenhuma grade de entretenimento ativa"}
                        </div>
                        <div className="text-sm text-green-600">
                          {activeByTag.entretenimento
                            ? `${
                                activeByTag.entretenimento.rows?.length || 0
                              } linhas`
                            : "Selecione uma grade de entretenimento"}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg p-3 border border-green-200">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">🏃‍♀️</span>
                      <div>
                        <div className="font-medium text-green-800">
                          {activeByTag.atividade
                            ? activeByTag.atividade.name
                            : "Nenhuma grade de atividade ativa"}
                        </div>
                        <div className="text-sm text-green-600">
                          {activeByTag.atividade
                            ? `${
                                activeByTag.atividade.rows?.length || 0
                              } linhas`
                            : "Selecione uma grade de atividade"}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg p-3 border border-green-200">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">📚</span>
                      <div>
                        <div className="font-medium text-green-800">
                          {activeByTag.educativo
                            ? activeByTag.educativo.name
                            : "Nenhuma grade educativa ativa"}
                        </div>
                        <div className="text-sm text-green-600">
                          {activeByTag.educativo
                            ? `${
                                activeByTag.educativo.rows?.length || 0
                              } linhas`
                            : "Selecione uma grade educativa"}
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

      {/* Lista de Grades */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {loading ? (
          <Card className="col-span-2">
            <CardContent className="p-8">
              <div className="text-center space-y-4">
                <div className="text-gray-600">
                  <div>
                    🎬 <strong>Vídeos Educativos Infantis</strong> - Conteúdo
                    audiovisual educativo
                  </div>
                  <div>
                    📖 <strong>Atividades e Exercícios</strong> - Atividades
                    interativas e lúdicas
                  </div>
                  <div>
                    🎮 <strong>Jogos Educativos</strong> - Aprendizado através
                    de jogos divertidos
                  </div>
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
                  <div className="flex items-start gap-4">
                    <div
                      className={`p-3 rounded-lg ${
                        grid.isActive ? "bg-green-100" : "bg-gray-100"
                      }`}
                    >
                      <span className="text-2xl">{getTagIcon(grid.tag)}</span>
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
                </CardHeader>

                <CardContent>
                  <div className="space-y-4">
                    {/* Preview das primeiras linhas */}
                    {grid.rows && grid.rows.length > 0 ? (
                      <div className="space-y-2">
                        <h4 className="font-semibold text-gray-800 text-sm">
                          📋 Primeiras Linhas ({grid.rows.length} total):
                        </h4>
                        {grid.rows.slice(0, 3).map((row) => (
                          <div
                            key={row.id}
                            className="bg-gray-50 p-2 rounded-lg flex items-center gap-3 border"
                          >
                            <span className="text-lg">📝</span>
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
                          <div className="text-center text-sm text-gray-500 italic">
                            ... e mais {grid.rows.length - 3} linhas
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-center text-gray-500 py-4">
                        Nenhuma linha criada ainda
                      </div>
                    )}

                    {/* Botões de Ação */}
                    <div className="flex gap-2 pt-4 border-t">
                      <Button
                        onClick={() => {
                          setSelectedGridId(grid.id);
                          setShowGridManager(true);
                        }}
                        variant="outline"
                        className="flex-1 text-blue-600 border-blue-200 hover:bg-blue-50"
                      >
                        <Settings className="h-4 w-4 mr-2" />
                        Gerenciar Linhas
                      </Button>

                      <Button
                        onClick={() =>
                          handleToggleGridStatus(grid.id, !grid.isActive)
                        }
                        variant={grid.isActive ? "outline" : "default"}
                        className={
                          grid.isActive
                            ? "text-red-600 border-red-200 hover:bg-red-50"
                            : "bg-green-600 hover:bg-green-700 text-white"
                        }
                      >
                        {grid.isActive ? (
                          <PowerOff className="h-4 w-4 mr-2" />
                        ) : (
                          <Power className="h-4 w-4 mr-2" />
                        )}
                        {grid.isActive ? "Desativar" : "Ativar"}
                      </Button>

                      <Button
                        onClick={() => handleDeleteGrid(grid.id)}
                        variant="outline"
                        className="text-red-600 border-red-200 hover:bg-red-50 px-3"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Modal de Criação */}
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
    onClose();
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
            Crie uma grade para uma categoria específica
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
                <option value="entretenimento">
                  🎉 Entretenimento - Diversão e Lazer
                </option>
                <option value="atividade">
                  🏃‍♀️ Atividade - Movimento e Exercícios
                </option>
                <option value="educativo">
                  📚 Educativo - Aprendizado e Estudos
                </option>
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Cada categoria pode ter apenas uma grade ativa por vez. A lista
                inicial poderá conter vídeos, jogos e atividades misturados.
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
                placeholder="Ex: Conteúdo da Manhã, Atividades do Final de Semana..."
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
                placeholder="Descrição opcional da grade..."
                className="w-full px-3 py-2 border-2 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 resize-none h-20"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="submit"
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
              >
                Criar Grade
              </Button>
              <Button
                type="button"
                onClick={onClose}
                variant="outline"
                className="flex-1"
              >
                Cancelar
              </Button>
            </div>
          </CardContent>
        </form>
      </Card>
    </div>
  );
}

export default function GradesPage() {
  return (
    <DashboardLayout>
      <GridsContent />
    </DashboardLayout>
  );
}
