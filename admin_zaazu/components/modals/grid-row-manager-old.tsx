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

      // Log da abertura do gerenciador de grade
      logAction({
        action: "grid_manager_access",
        details: "Gerenciador de grades aberto",
        level: "info",
        metadata: {
          gridId: gridId || "new",
          openedAt: new Date().toISOString(),
        },
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, gridId]);

  const loadGrid = async () => {
    if (!gridId) return;

    setLoading(true);
    try {
      const gridData = await gridService.getGrid(gridId);
      if (gridData) {
        setGrid(gridData);
        setRows(gridData.rows || []);

        // Determinar o tipo de conteúdo da grade baseado na primeira linha
        const gridContentType =
          gridData.rows?.[0]?.contentType ||
          (gridData.name.toLowerCase().includes("video")
            ? "video"
            : gridData.name.toLowerCase().includes("atividade")
            ? "activity"
            : gridData.name.toLowerCase().includes("jogo")
            ? "game"
            : "video");

        // Atualizar o formulário de nova linha com o tipo da grade
        setNewRowForm((prev) => ({
          ...prev,
          contentType: gridContentType,
        }));

        // Atualizar editingRow se estiver editando uma linha
        if (editingRow) {
          const updatedEditingRow = gridData.rows?.find(
            (row) => row.id === editingRow.id
          );
          if (updatedEditingRow) {
            setEditingRow(updatedEditingRow);
          }
        }
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

      setAllContent([...videos, ...games, ...activities]);
    } catch (error) {
      console.error("Error loading content:", error);
    }
  };

  const getAllContent = async (): Promise<AnyContent[]> => {
    return allContent;
  };

  const getContentById = (id: string, type: string): AnyContent | null => {
    return (
      allContent.find(
        (content) => content.id === id && getContentType(content) === type
      ) || null
    );
  };

  const getContentType = (content: AnyContent): ContentType => {
    if ("duration" in content) return "video";
    if (
      "type" in content &&
      ("html5" === content.type || "embed" === content.type)
    )
      return "game";
    return "activity";
  };

  const handleCreateRow = async () => {
    if (!grid || !newRowForm.title) return;

    const originalFormData = { ...newRowForm };
    setLoading(true);
    try {
      const rowData: Omit<GridRow, "id" | "createdAt" | "updatedAt"> = {
        title: newRowForm.title,
        description: newRowForm.description,
        contentType: newRowForm.contentType,
        items: [],
        isActive: true,
        order: rows.length,
        maxItems: newRowForm.maxItems,
      };

      await gridService.createGridRow(grid.id, rowData);

      // Log da criação da linha
      await logAction({
        action: "grid_row_create",
        details: `Nova linha de grade criada: ${newRowForm.title}`,
        level: "info",
        metadata: {
          gridId: grid.id,
          gridName: grid.name,
          rowTitle: newRowForm.title,
          rowDescription: newRowForm.description,
          contentType: newRowForm.contentType,
          maxItems: newRowForm.maxItems,
          order: rows.length,
        },
      });

      // Reload grid
      await loadGrid();

      // Reset form
      setNewRowForm({
        title: "",
        description: "",
        contentType: "video",
        maxItems: 10,
      });
    } catch (error) {
      console.error("Error creating row:", error);

      // Log do erro na criação
      await logError(
        "grid_row_creation",
        `Falha ao criar linha de grade: ${originalFormData.title}`,
        error,
        {
          gridId: grid?.id,
          gridName: grid?.name,
          attemptedData: originalFormData,
        }
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRow = async (rowId: string) => {
    if (!confirm("Tem certeza que deseja excluir esta linha?")) return;

    // Capturar dados da linha antes da exclusão
    const rowToDelete = rows.find((row) => row.id === rowId);

    setLoading(true);
    try {
      await gridService.deleteGridRow(rowId);

      // Log da exclusão da linha
      await logAction({
        action: "grid_row_delete",
        details: `Linha de grade excluída: ${rowToDelete?.title || rowId}`,
        level: "warning",
        metadata: {
          gridId: grid?.id,
          gridName: grid?.name,
          deletedRowId: rowId,
          deletedRowTitle: rowToDelete?.title,
          deletedRowContentType: rowToDelete?.contentType,
          deletedRowItemsCount: rowToDelete?.items?.length || 0,
        },
      });

      await loadGrid();
    } catch (error) {
      console.error("Error deleting row:", error);

      // Log do erro na exclusão
      await logError(
        "grid_row_deletion",
        `Falha ao excluir linha de grade: ${rowToDelete?.title || rowId}`,
        error,
        {
          gridId: grid?.id,
          gridName: grid?.name,
          rowId: rowId,
          rowTitle: rowToDelete?.title,
        }
      );
    } finally {
      setLoading(false);
    }
  };

  const handleEditRow = (row: GridRow) => {
    setEditingRow(row);
    setSelectedContentType(row.contentType);
    setShowContentGrid(true);
  };

  const handleReorderRowItems = async (rowId: string, items: GridItem[]) => {
    const targetRow = rows.find((row) => row.id === rowId);

    try {
      await gridService.reorderRowItems(rowId, items);

      // Log da reordenação
      await logAction({
        action: "grid_row_reorder",
        details: `Itens reordenados na linha: ${targetRow?.title || rowId}`,
        level: "info",
        metadata: {
          gridId: grid?.id,
          gridName: grid?.name,
          rowId: rowId,
          rowTitle: targetRow?.title,
          itemsCount: items.length,
          newOrder: items.map((item) => item.contentId),
        },
      });

      await loadGrid();
    } catch (error) {
      console.error("Error reordering items:", error);

      // Log do erro na reordenação
      await logError(
        "grid_row_reorder",
        `Falha ao reordenar itens na linha: ${targetRow?.title || rowId}`,
        error,
        {
          gridId: grid?.id,
          rowId: rowId,
          rowTitle: targetRow?.title,
        }
      );
    }
  };

  const handleRemoveItemFromRow = async (rowId: string, itemId: string) => {
    const targetRow = rows.find((row) => row.id === rowId);
    const itemToRemove = targetRow?.items?.find((item) => item.id === itemId);

    try {
      await gridService.removeItemFromRow(rowId, itemId);

      // Log da remoção do item
      await logAction({
        action: "grid_item_remove",
        details: `Item removido da linha: ${targetRow?.title || rowId}`,
        level: "info",
        metadata: {
          gridId: grid?.id,
          gridName: grid?.name,
          rowId: rowId,
          rowTitle: targetRow?.title,
          removedItemId: itemId,
          removedItemContentId: itemToRemove?.contentId,
          removedItemType: itemToRemove?.contentType,
        },
      });

      await loadGrid();
    } catch (error) {
      console.error("Error removing item:", error);

      // Log do erro na remoção
      await logError(
        "grid_item_removal",
        `Falha ao remover item da linha: ${targetRow?.title || rowId}`,
        error,
        {
          gridId: grid?.id,
          rowId: rowId,
          itemId: itemId,
          rowTitle: targetRow?.title,
        }
      );
    }
  };

  const handleRandomizeRow = async (rowId: string) => {
    const targetRow = rows.find((row) => row.id === rowId);

    try {
      await gridService.randomizeRowItems(rowId);

      // Log da aleatorização
      await logAction({
        action: "grid_row_randomize",
        details: `Itens aleatorizados na linha: ${targetRow?.title || rowId}`,
        level: "info",
        metadata: {
          gridId: grid?.id,
          gridName: grid?.name,
          rowId: rowId,
          rowTitle: targetRow?.title,
          itemsCount: targetRow?.items?.length || 0,
        },
      });

      await loadGrid();
    } catch (error) {
      console.error("Error randomizing items:", error);

      // Log do erro na aleatorização
      await logError(
        "grid_row_randomize",
        `Falha ao aleatorizar itens na linha: ${targetRow?.title || rowId}`,
        error,
        {
          gridId: grid?.id,
          rowId: rowId,
          rowTitle: targetRow?.title,
        }
      );
    }
  };

  const handleAddContentToRow = async (contentId: string) => {
    if (!editingRow) return;

    // Verificar se o item já está na linha
    if (editingRow.items?.some((item) => item.contentId === contentId)) {
      return;
    }

    // Verificar se atingiu o limite máximo
    if ((editingRow.items?.length || 0) >= (editingRow.maxItems || 20)) {
      alert(
        `Limite máximo de ${editingRow.maxItems} itens atingido para esta linha.`
      );
      return;
    }

    const contentToAdd = getContentById(contentId, editingRow.contentType);
    const newItem: Omit<GridItem, "id"> = {
      contentId,
      contentType: editingRow.contentType,
      order: editingRow.items?.length || 0,
    };

    try {
      // Atualizar estado local imediatamente para feedback visual rápido
      const tempId = `temp-${Date.now()}`;
      const tempItem = { ...newItem, id: tempId };

      setEditingRow((prev) =>
        prev
          ? {
              ...prev,
              items: [...(prev.items || []), tempItem],
            }
          : null
      );

      // Fazer a chamada para o servidor
      await gridService.addItemToRow(editingRow.id, newItem);

      // Log da adição do conteúdo
      await logAction({
        action: "grid_content_add",
        details: `Conteúdo adicionado à linha: ${editingRow.title}`,
        level: "info",
        metadata: {
          gridId: grid?.id,
          gridName: grid?.name,
          rowId: editingRow.id,
          rowTitle: editingRow.title,
          addedContentId: contentId,
          addedContentType: editingRow.contentType,
          contentTitle: contentToAdd?.title || contentId,
          newItemsCount: (editingRow.items?.length || 0) + 1,
        },
      });

      await loadGrid();
    } catch (error) {
      console.error("Error adding content:", error);

      // Log do erro na adição
      await logError(
        "grid_content_addition",
        `Falha ao adicionar conteúdo à linha: ${editingRow.title}`,
        error,
        {
          gridId: grid?.id,
          rowId: editingRow.id,
          rowTitle: editingRow.title,
          contentId: contentId,
          contentType: editingRow.contentType,
        }
      );

      // Reverter estado local em caso de erro
      setEditingRow((prev) =>
        prev
          ? {
              ...prev,
              items:
                prev.items?.filter((item) => !item.id.startsWith("temp-")) ||
                [],
            }
          : null
      );
    }
  };

  const handleRemoveContentFromRow = async (contentId: string) => {
    if (!editingRow) return;

    const item = editingRow.items?.find((item) => item.contentId === contentId);
    if (!item) return;

    const contentToRemove = getContentById(contentId, editingRow.contentType);

    try {
      // Atualizar estado local imediatamente para feedback visual rápido
      setEditingRow((prev) =>
        prev
          ? {
              ...prev,
              items: prev.items?.filter((i) => i.contentId !== contentId) || [],
            }
          : null
      );

      // Fazer a chamada para o servidor
      await gridService.removeItemFromRow(editingRow.id, item.id);

      // Log da remoção do conteúdo
      await logAction({
        action: "grid_content_remove",
        details: `Conteúdo removido da linha: ${editingRow.title}`,
        level: "info",
        metadata: {
          gridId: grid?.id,
          gridName: grid?.name,
          rowId: editingRow.id,
          rowTitle: editingRow.title,
          removedContentId: contentId,
          removedContentType: editingRow.contentType,
          contentTitle: contentToRemove?.title || contentId,
          newItemsCount: (editingRow.items?.length || 1) - 1,
        },
      });

      await loadGrid();
    } catch (error) {
      console.error("Error removing content:", error);

      // Log do erro na remoção
      await logError(
        "grid_content_removal",
        `Falha ao remover conteúdo da linha: ${editingRow.title}`,
        error,
        {
          gridId: grid?.id,
          rowId: editingRow.id,
          rowTitle: editingRow.title,
          contentId: contentId,
          contentType: editingRow.contentType,
        }
      );

      // Reverter estado local em caso de erro
      await loadGrid();
    }
  };

  const getSelectedItemsForRow = (row: GridRow): string[] => {
    return row.items?.map((item) => item.contentId) || [];
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <Card className="bg-white w-full max-w-7xl max-h-[95vh] overflow-y-auto shadow-2xl border-2">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center text-gray-900 text-xl font-bold">
              Gerenciar Grade da Home
            </CardTitle>
            <CardDescription className="text-gray-700 font-medium mt-1">
              {grid?.name
                ? `Configurando: ${grid.name}`
                : "Configure linhas de conteúdo para a página inicial"}
            </CardDescription>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="hover:bg-red-100 text-red-600 hover:text-red-700"
          >
            <X className="h-5 w-5" />
          </Button>
        </CardHeader>

        <CardContent className="space-y-6">
          {loading && (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          )}

          {!showContentGrid ? (
            <>
              {/* New Row Form */}
              <Card className="border-2 border-gray-200 bg-gray-50 mt-4">
                <CardHeader className="bg-gray-100 border-b border-gray-200">
                  <CardTitle className="text-lg text-gray-900 flex items-center gap-2">
                    Criar Nova Linha de Conteúdo
                  </CardTitle>
                  <CardDescription className="text-gray-700 font-medium">
                    Configure uma nova linha temática para organizar conteúdos
                    na home
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-gray-800 mb-2">
                        Título da Linha
                      </label>
                      <Input
                        placeholder="Ex: Vídeos em Destaque, Jogos Populares..."
                        value={newRowForm.title}
                        onChange={(e) =>
                          setNewRowForm({
                            ...newRowForm,
                            title: e.target.value,
                          })
                        }
                        className="border-2 border-gray-300 focus:border-blue-500 text-gray-900"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-800 mb-2">
                        Tipo de Conteúdo da Grade
                      </label>
                      <div className="px-3 py-2 border-2 border-gray-200 rounded-md bg-gray-50 text-gray-700 font-medium">
                        {newRowForm.contentType === "video" &&
                          "🎬 Vídeos Educativos"}
                        {newRowForm.contentType === "activity" &&
                          "📖 Atividades"}
                        {newRowForm.contentType === "game" && "🎮 Jogos"}
                        <span className="text-sm text-gray-500 ml-2">
                          (Todas as linhas desta grade terão este tipo)
                        </span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-800 mb-2">
                        Descrição (opcional)
                      </label>
                      <Input
                        placeholder="Ex: Os melhores vídeos educativos para crianças"
                        value={newRowForm.description}
                        onChange={(e) =>
                          setNewRowForm({
                            ...newRowForm,
                            description: e.target.value,
                          })
                        }
                        className="border-2 border-gray-300 focus:border-blue-500 text-gray-900"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-800 mb-2">
                        Máximo de Itens por Linha
                      </label>
                      <Input
                        type="number"
                        min="1"
                        max="50"
                        value={newRowForm.maxItems}
                        onChange={(e) =>
                          setNewRowForm({
                            ...newRowForm,
                            maxItems: parseInt(e.target.value) || 10,
                          })
                        }
                        className="border-2 border-gray-300 focus:border-blue-500 text-gray-900"
                        placeholder="10"
                      />
                      <p className="text-xs text-gray-600 mt-1">
                        Recomendado: 5-15 itens
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 flex justify-end">
                    <Button
                      onClick={handleCreateRow}
                      disabled={!newRowForm.title || loading}
                      className="bg-green-600 hover:bg-green-700 text-white font-bold px-6 py-2"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Criar Nova Linha
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Existing Rows */}
              <div className="space-y-4">
                <div className="bg-blue-50 p-4 rounded-lg border-2 border-blue-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-blue-900 flex items-center gap-2">
                        📋 Linhas Configuradas ({rows.length})
                      </h3>
                      <p className="text-blue-700 text-sm mt-1">
                        Gerencie o conteúdo e a ordem das linhas na sua grade
                      </p>
                    </div>
                    {rows.length > 0 && (
                      <Button
                        variant="outline"
                        onClick={async () => {
                          if (
                            confirm(
                              "Aleatorizar o conteúdo de todas as linhas?"
                            )
                          ) {
                            for (const row of rows) {
                              if (row.items && row.items.length > 0) {
                                await handleRandomizeRow(row.id);
                              }
                            }
                          }
                        }}
                        className="border-purple-300 text-purple-700 hover:bg-purple-50 font-medium"
                      >
                        🎲 Aleatorizar Todas
                      </Button>
                    )}
                  </div>
                </div>

                {rows.length === 0 ? (
                  <div className="text-center py-12 bg-yellow-50 rounded-lg border-2 border-yellow-200">
                    <div className="text-6xl mb-4">📭</div>
                    <h4 className="text-lg font-bold text-yellow-800 mb-2">
                      Nenhuma linha criada ainda
                    </h4>
                    <p className="text-yellow-700">
                      Use o formulário acima para criar sua primeira linha de
                      conteúdo
                    </p>
                  </div>
                ) : (
                  rows.map((row) => (
                    <Card
                      key={row.id}
                      className="border-2 hover:border-blue-300 transition-colors"
                    >
                      <CardHeader className="flex flex-row items-center justify-between bg-gray-50">
                        <div>
                          <CardTitle className="text-lg font-bold text-gray-900 flex items-center gap-2">
                            {row.contentType === "video" && "🎥"}
                            {row.contentType === "game" && "🎮"}
                            {row.contentType === "activity" && "📚"}
                            {row.title}
                          </CardTitle>
                          {row.description && (
                            <CardDescription className="text-gray-700 font-medium mt-1">
                              {row.description}
                            </CardDescription>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditRow(row)}
                            className="border-blue-300 text-blue-700 hover:bg-blue-50 font-medium"
                          >
                            <Settings className="h-4 w-4 mr-2" />
                            Configurar
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteRow(row.id)}
                            className="border-red-300 text-red-700 hover:bg-red-50 font-medium"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Excluir
                          </Button>
                        </div>
                      </CardHeader>

                      <CardContent>
                        <DragDropList
                          items={row.items || []}
                          onReorder={(items) =>
                            handleReorderRowItems(row.id, items)
                          }
                          onRemove={(itemId) =>
                            handleRemoveItemFromRow(row.id, itemId)
                          }
                          onRandomize={() => handleRandomizeRow(row.id)}
                          getContentById={getContentById}
                          maxItems={row.maxItems}
                        />
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </>
          ) : (
            <>
              {/* Content Selection Grid */}
              <div className="space-y-6">
                {/* Header da Edição */}
                <div className="bg-gradient-to-r from-gray-50 to-gray-50 p-4 rounded-lg border-2 border-gray-200 mt-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                        Editando Linha: {editingRow?.title}
                      </h3>
                      <p className="text-gray-700 font-medium mt-1">
                        {editingRow?.contentType === "video" &&
                          "🎥 Selecione vídeos para esta linha"}
                        {editingRow?.contentType === "game" &&
                          "🎮 Selecione jogos para esta linha"}
                        {editingRow?.contentType === "activity" &&
                          "📚 Selecione atividades para esta linha"}
                      </p>
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                        <span>
                          📊 Itens selecionados:{" "}
                          {editingRow
                            ? getSelectedItemsForRow(editingRow).length
                            : 0}
                          /{editingRow?.maxItems || 0}
                        </span>
                        <span>🎯 Tipo: {editingRow?.contentType}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setShowContentGrid(false);
                          setEditingRow(null);
                        }}
                        className="border-gray-300 text-gray-700 hover:bg-gray-100 font-medium"
                      >
                        <X className="h-4 w-4 mr-2" />
                        Voltar
                      </Button>
                    </div>
                  </div>
                </div>

                <ContentGrid
                  contentType={selectedContentType}
                  selectedItems={
                    editingRow ? getSelectedItemsForRow(editingRow) : []
                  }
                  onItemSelect={handleAddContentToRow}
                  onItemDeselect={handleRemoveContentFromRow}
                  maxSelection={editingRow?.maxItems || 20}
                  getAllContent={getAllContent}
                />
              </div>
            </>
          )}

          {/* Actions */}
          <div className="bg-gray-50 p-4 rounded-lg border-t-2 border-gray-200">
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-600">
                {!showContentGrid ? (
                  <span>
                    💡 Dica: Clique em &quot;Configurar&quot; para adicionar
                    conteúdos às linhas
                  </span>
                ) : (
                  <span>
                    ✨ Alterações são salvas automaticamente ao
                    selecionar/desselecionar itens
                  </span>
                )}
              </div>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={onClose}
                  className="border-gray-300 text-gray-700 hover:bg-gray-100 font-medium px-6"
                >
                  <X className="h-4 w-4 mr-2" />
                  Fechar
                </Button>
                <Button
                  onClick={onSuccess}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Concluir & Salvar
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
