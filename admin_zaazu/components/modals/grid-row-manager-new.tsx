"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { X, Plus, Settings, Save, Trash2 } from "lucide-react";
import {
  GridRow,
  HomeGrid,
  GridItem,
  ContentType,
  AnyContent,
} from "@/lib/types";
import { gridService } from "@/lib/grid-service";
import { videoService, gameService, activityService } from "@/lib/services";
import { DragDropList } from "@/components/ui/drag-drop-list";
import { ContentGrid } from "@/components/ui/content-grid";

interface GridRowManagerProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  gridId?: string;
}

export function GridRowManager({
  isOpen,
  onClose,
  onSuccess,
  gridId,
}: GridRowManagerProps) {
  const [grid, setGrid] = useState<HomeGrid | null>(null);
  const [rows, setRows] = useState<GridRow[]>([]);
  const [editingRow, setEditingRow] = useState<GridRow | null>(null);
  const [showContentGrid, setShowContentGrid] = useState(false);
  const [selectedContentType, setSelectedContentType] =
    useState<ContentType>("video");
  const [loading, setLoading] = useState(false);
  const [newRowForm, setNewRowForm] = useState({
    title: "",
    description: "",
    maxItems: 10,
  });

  // Content cache
  const [allContent, setAllContent] = useState<AnyContent[]>([]);

  useEffect(() => {
    if (isOpen) {
      loadGrid();
      loadAllContent();
    }
  }, [isOpen, gridId]);

  const loadGrid = async () => {
    if (!gridId) return;

    setLoading(true);
    try {
      const gridData = await gridService.getGrid(gridId);
      if (gridData) {
        setGrid(gridData);
        setRows(gridData.rows || []);
      }
    } catch (error) {
      console.error("Error loading grid:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadAllContent = async () => {
    try {
      const [videos, games, activities] = await Promise.all([
        videoService.getAll(),
        gameService.getAll(),
        activityService.getAll(),
      ]);

      const allContentItems: AnyContent[] = [
        ...videos,
        ...games,
        ...activities,
      ];

      setAllContent(allContentItems);
    } catch (error) {
      console.error("Error loading content:", error);
    }
  };

  const handleCreateRow = async () => {
    if (!gridId || !newRowForm.title.trim()) return;

    setLoading(true);
    try {
      await gridService.createGridRow(gridId, {
        title: newRowForm.title,
        description: newRowForm.description,
        items: [],
        isActive: true,
        order: rows.length + 1,
        maxItems: newRowForm.maxItems,
      });

      await loadGrid();
      setNewRowForm({
        title: "",
        description: "",
        maxItems: 10,
      });
    } catch (error) {
      console.error("Error creating row:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRow = async (rowId: string) => {
    if (!confirm("Tem certeza que deseja excluir esta linha?")) return;

    setLoading(true);
    try {
      await gridService.deleteGridRow(rowId);
      await loadGrid();
    } catch (error) {
      console.error("Error deleting row:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditRow = async (row: GridRow) => {
    setEditingRow(row);
    setShowContentGrid(true);
  };

  const handleCloseContentGrid = () => {
    setShowContentGrid(false);
    setEditingRow(null);
  };

  const handleSaveRow = async () => {
    if (!editingRow) return;

    setLoading(true);
    try {
      await gridService.updateGridRow(editingRow.id, {
        title: editingRow.title,
        description: editingRow.description,
        items: editingRow.items,
        maxItems: editingRow.maxItems,
      });

      await loadGrid();
      handleCloseContentGrid();
    } catch (error) {
      console.error("Error saving row:", error);
    } finally {
      setLoading(false);
    }
  };

  const getContentById = (
    contentId: string,
    contentType: ContentType
  ): AnyContent | null => {
    return (
      allContent.find((content) => {
        if (content.id !== contentId) return false;

        // Verificar tipo baseado nas propriedades específicas
        if (
          contentType === "video" &&
          "url" in content &&
          !("plays" in content) &&
          !("completions" in content)
        ) {
          return true;
        }
        if (contentType === "game" && "plays" in content) {
          return true;
        }
        if (contentType === "activity" && "completions" in content) {
          return true;
        }

        return false;
      }) || null
    );
  };

  const handleAddContentToRow = (
    contentId: string,
    contentType: ContentType
  ) => {
    if (!editingRow) return;

    const contentToAdd = getContentById(contentId, contentType);
    if (!contentToAdd) return;

    const newItem: GridItem = {
      id: `${Date.now()}-${Math.random()}`,
      contentId,
      contentType,
      order: editingRow.items.length,
    };

    const maxItems = editingRow.maxItems || 20;
    if (editingRow.items.length >= maxItems) {
      alert(`Esta linha já atingiu o limite máximo de ${maxItems} itens.`);
      return;
    }

    const updatedItems = [...editingRow.items, newItem];
    setEditingRow({
      ...editingRow,
      items: updatedItems,
    });
  };

  const handleRemoveContentFromRow = (contentId: string) => {
    if (!editingRow) return;

    const updatedItems = editingRow.items.filter(
      (item) => item.contentId !== contentId
    );
    setEditingRow({
      ...editingRow,
      items: updatedItems,
    });
  };

  const handleReorderRowItems = (newItems: GridItem[]) => {
    if (!editingRow) return;

    const reorderedItems = newItems.map((item, index) => ({
      ...item,
      order: index,
    }));

    setEditingRow({
      ...editingRow,
      items: reorderedItems,
    });
  };

  const renderRowContent = (row: GridRow) => {
    if (!row.items || row.items.length === 0) {
      return (
        <div className="text-gray-500 text-sm italic text-center py-2">
          Nenhum conteúdo adicionado ainda
        </div>
      );
    }

    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {row.items.slice(0, 4).map((item) => {
          const content = getContentById(item.contentId, item.contentType);
          if (!content) return null;

          return (
            <div
              key={item.id}
              className="bg-gray-50 p-2 rounded-lg border text-xs"
            >
              <div className="font-medium truncate">
                {item.contentType === "video" && "🎥"}
                {item.contentType === "game" && "🎮"}
                {item.contentType === "activity" && "📚"}
                {" " + content.title}
              </div>
              <div className="text-gray-500 truncate">
                {content.category || "Sem categoria"}
              </div>
            </div>
          );
        })}
        {row.items.length > 4 && (
          <div className="bg-gray-100 p-2 rounded-lg border text-xs flex items-center justify-center text-gray-600">
            +{row.items.length - 4} mais
          </div>
        )}
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-6xl h-[90vh] shadow-2xl border-2 bg-white flex flex-col">
        <CardHeader className="flex-shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-bold text-gray-900 flex items-center">
                Gerenciar Grade: {grid?.name || "Carregando..."}
              </CardTitle>
              <CardDescription className="text-gray-600 font-medium">
                {grid?.tag && `Categoria: ${grid.tag}`} • Organize listas de
                conteúdo para a grade
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

        <CardContent className="flex-1 overflow-hidden">
          {!showContentGrid ? (
            <div className="h-full flex flex-col space-y-6">
              {/* Formulário para nova linha */}
              <Card className="flex-shrink-0 bg-blue-50 border-blue-200">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg text-blue-800">
                    Criar Nova Lista de Conteúdo
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Título da Lista *
                      </label>
                      <Input
                        value={newRowForm.title}
                        onChange={(e) =>
                          setNewRowForm((prev) => ({
                            ...prev,
                            title: e.target.value,
                          }))
                        }
                        placeholder="Ex: Vídeos da Manhã, Jogos Educativos..."
                        className="text-gray-900"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Descrição
                      </label>
                      <Input
                        value={newRowForm.description}
                        onChange={(e) =>
                          setNewRowForm((prev) => ({
                            ...prev,
                            description: e.target.value,
                          }))
                        }
                        placeholder="Descrição opcional..."
                        className="text-gray-900"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Máximo de Itens
                      </label>
                      <Input
                        type="number"
                        value={newRowForm.maxItems}
                        onChange={(e) =>
                          setNewRowForm((prev) => ({
                            ...prev,
                            maxItems: parseInt(e.target.value) || 10,
                          }))
                        }
                        min="1"
                        max="50"
                        className="text-gray-900"
                      />
                    </div>
                  </div>
                  <div className="text-xs text-blue-600 bg-blue-100 p-2 rounded">
                    💡 Esta lista poderá conter vídeos, jogos e atividades
                    misturados. Você escolherá o conteúdo específico na próxima
                    etapa.
                  </div>
                  <Button
                    onClick={handleCreateRow}
                    disabled={!newRowForm.title.trim() || loading}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Criar Lista
                  </Button>
                </CardContent>
              </Card>

              {/* Lista de linhas existentes */}
              <div className="flex-1 overflow-auto">
                <div className="space-y-4">
                  {rows.length === 0 ? (
                    <div className="text-center text-gray-500 py-8">
                      <div className="text-4xl mb-4">📝</div>
                      <p>Nenhuma lista criada ainda.</p>
                      <p className="text-sm">
                        Crie sua primeira lista usando o formulário acima.
                      </p>
                    </div>
                  ) : (
                    rows.map((row) => (
                      <Card key={row.id} className="bg-white border-gray-200">
                        <CardHeader className="pb-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <CardTitle className="text-lg text-gray-900 flex items-center gap-2">
                                📝 {row.title}
                                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                                  {row.items?.length || 0}/{row.maxItems || 20}{" "}
                                  itens
                                </span>
                              </CardTitle>
                              {row.description && (
                                <CardDescription className="text-gray-600">
                                  {row.description}
                                </CardDescription>
                              )}
                            </div>
                            <div className="flex gap-2">
                              <Button
                                onClick={() => handleEditRow(row)}
                                variant="outline"
                                size="sm"
                              >
                                <Settings className="h-4 w-4 mr-1" />
                                Editar
                              </Button>
                              <Button
                                onClick={() => handleDeleteRow(row.id)}
                                variant="outline"
                                size="sm"
                                className="text-red-600 border-red-200 hover:bg-red-50"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>{renderRowContent(row)}</CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </div>
            </div>
          ) : (
            // Editor de conteúdo da linha
            <div className="h-full flex flex-col space-y-4">
              <div className="flex-shrink-0 flex items-center justify-between bg-gray-50 p-4 rounded-lg">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">
                    Editando: {editingRow?.title}
                  </h3>
                  <p className="text-sm text-gray-600">
                    Selecione os conteúdos que aparecerão nesta lista. Você pode
                    misturar vídeos, jogos e atividades.
                  </p>
                  <div className="flex gap-4 mt-2 text-xs text-gray-500">
                    <span>
                      📋 Itens atuais: {editingRow?.items?.length || 0}
                    </span>
                    <span>🎯 Máximo: {editingRow?.maxItems || 20}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={handleSaveRow}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Salvar
                  </Button>
                  <Button onClick={handleCloseContentGrid} variant="outline">
                    Cancelar
                  </Button>
                </div>
              </div>

              {/* Seletor de tipo de conteúdo */}
              <div className="flex-shrink-0">
                <div className="flex gap-2 p-1 bg-gray-100 rounded-lg w-fit">
                  <Button
                    onClick={() => setSelectedContentType("video")}
                    variant={
                      selectedContentType === "video" ? "default" : "ghost"
                    }
                    size="sm"
                  >
                    🎥 Vídeos
                  </Button>
                  <Button
                    onClick={() => setSelectedContentType("game")}
                    variant={
                      selectedContentType === "game" ? "default" : "ghost"
                    }
                    size="sm"
                  >
                    🎮 Jogos
                  </Button>
                  <Button
                    onClick={() => setSelectedContentType("activity")}
                    variant={
                      selectedContentType === "activity" ? "default" : "ghost"
                    }
                    size="sm"
                  >
                    📚 Atividades
                  </Button>
                </div>
              </div>

              {/* Grid de conteúdo e itens selecionados */}
              <div className="flex-1 overflow-hidden grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Conteúdo disponível */}
                <div className="overflow-auto">
                  <h4 className="font-semibold text-gray-800 mb-2">
                    Conteúdo Disponível ({selectedContentType})
                  </h4>
                  <ContentGrid
                    contentType={selectedContentType}
                    selectedItems={[]}
                    onItemSelect={(contentId) =>
                      handleAddContentToRow(contentId, selectedContentType)
                    }
                    onItemDeselect={() => {}}
                    getAllContent={async () => allContent}
                  />
                </div>

                {/* Itens selecionados */}
                <div className="overflow-auto">
                  <h4 className="font-semibold text-gray-800 mb-2">
                    Itens Selecionados ({editingRow?.items?.length || 0})
                  </h4>
                  {editingRow?.items && editingRow.items.length > 0 ? (
                    <DragDropList
                      items={editingRow.items}
                      onReorder={handleReorderRowItems}
                      onRemove={handleRemoveContentFromRow}
                      onRandomize={() => {}}
                      getContentById={(id: string, type: string) => 
                        getContentById(id, type as ContentType)
                      }
                    />
                  ) : (
                    <div className="text-gray-500 text-center py-8">
                      <div className="text-4xl mb-2">📂</div>
                      <p>Nenhum item selecionado</p>
                      <p className="text-sm">
                        Clique nos itens à esquerda para adicioná-los
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
