"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { X, Plus, Settings, Save, Trash2, GripVertical } from "lucide-react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  horizontalListSortingStrategy,
} from "@dnd-kit/sortable";
import {
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  GridRow,
  HomeGrid,
  GridItem,
  ContentType,
  AnyContent,
  VideoSeries,
} from "@/lib/types";
import { gridService } from "@/lib/grid-service";
import { videoService, gameService, activityService } from "@/lib/services";

// Sortable Row Component
interface SortableRowProps {
  row: GridRow;
  children: React.ReactNode;
  onRenderContent: (row: GridRow) => React.ReactNode;
}

function SortableRow({ row, children, onRenderContent }: SortableRowProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: row.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`${isDragging ? 'z-50' : ''}`}
    >
      <Card className="mb-4 hover:shadow-lg transition-shadow bg-white border-gray-200 shadow-sm">
        <CardHeader className="pb-2 bg-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div
                {...attributes}
                {...listeners}
                className="cursor-grab active:cursor-grabbing p-1 hover:bg-gray-100 rounded"
                title="Arrastar para reordenar"
              >
                <GripVertical className="h-4 w-4 text-gray-400" />
              </div>
              <div>
                <CardTitle className="text-lg text-gray-900 flex items-center gap-2">
                  {row.title}
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                    {row.items?.length || 0}/{row.maxItems || 20} itens
                  </span>
                  {row.contentType && (
                    <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-full">
                      {row.contentType === "video" && "🎥 Vídeos"}
                      {row.contentType === "series" && "📺 Séries"}
                      {row.contentType === "game" && "🎮 Jogos"}
                      {row.contentType === "activity" && "📚 Atividades"}
                    </span>
                  )}
                  {!row.contentType && (
                    <span className="text-xs bg-green-100 text-green-600 px-2 py-1 rounded-full">
                      🎯 Misto
                    </span>
                  )}
                </CardTitle>
                {row.description && (
                  <CardDescription className="text-gray-600">{row.description}</CardDescription>
                )}
              </div>
            </div>
            {children}
          </div>
        </CardHeader>
        <CardContent className="bg-white">
          {onRenderContent(row)}
        </CardContent>
      </Card>
    </div>
  );
}

// Sortable Item Component
interface SortableItemProps {
  item: GridItem;
  content: AnyContent | VideoSeries;
  onRemove: () => void;
}

function SortableItem({ item, content, onRemove }: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  // Determinar título e categoria baseado no tipo de conteúdo
  const isSeries = item.contentType === "series" || item.isSeries;
  const title = isSeries && "seriesTitle" in content 
    ? content.seriesTitle 
    : "title" in content 
      ? content.title 
      : "Sem título";
  const category = content.category || "Sem categoria";

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`${isDragging ? 'z-50' : ''}`}
    >
      <div className="bg-gray-50 p-2 rounded-lg border text-xs relative group">
        <div
          {...attributes}
          {...listeners}
          className="absolute top-1 left-1 cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity"
          title="Arrastar para reordenar"
        >
          <GripVertical className="h-3 w-3 text-gray-400" />
        </div>
        <button
          onClick={onRemove}
          className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs hover:bg-red-600"
          title="Remover item"
        >
          ×
        </button>
        <div className="font-medium truncate mb-2 text-gray-900 text-sm pl-4">
          {item.contentType === "video" && "🎥"}
          {item.contentType === "series" && "📺"}
          {item.contentType === "game" && "🎮"}
          {item.contentType === "activity" && "📚"}
          {" " + title}
        </div>
        <div className="text-gray-500 truncate pl-4">
          {category}
        </div>
      </div>
    </div>
  );
}

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
    contentType: undefined as ContentType | undefined, // undefined = conteúdo misto
  });

  // Content cache
  const [allContent, setAllContent] = useState<AnyContent[]>([]);
  const [allSeries, setAllSeries] = useState<VideoSeries[]>([]);

  // Drag and Drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Handle row reordering
  const handleRowDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      setRows((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over?.id);

        const reorderedRows = arrayMove(items, oldIndex, newIndex);
        
        // Update order property for each row
        const updatedRows = reorderedRows.map((row, index) => ({
          ...row,
          order: index + 1,
        }));

        // Save to database
        updateRowsOrder(updatedRows);
        
        return updatedRows;
      });
    }
  };

  // Handle items reordering within a row
  const handleItemDragEnd = (event: DragEndEvent) => {
    if (!editingRow) return;

    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = editingRow.items.findIndex((item) => item.id === active.id);
      const newIndex = editingRow.items.findIndex((item) => item.id === over?.id);

      const reorderedItems = arrayMove(editingRow.items, oldIndex, newIndex);
      
      // Update order property for each item
      const updatedItems = reorderedItems.map((item, index) => ({
        ...item,
        order: index + 1,
      }));

      setEditingRow({
        ...editingRow,
        items: updatedItems,
      });
    }
  };

  // Update rows order in database
  const updateRowsOrder = async (reorderedRows: GridRow[]) => {
    if (!gridId) return;

    try {
      await Promise.all(
        reorderedRows.map((row) =>
          gridService.updateGridRow(row.id, { order: row.order })
        )
      );
    } catch (error) {
      console.error("Error updating rows order:", error);
    }
  };

  const loadGrid = useCallback(async () => {
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
  }, [gridId]);

  const loadAllContent = async () => {
    try {
      const [videos, games, activities, series] = await Promise.all([
        videoService.getAll(),
        gameService.getAll(),
        activityService.getAll(),
        videoService.getAllSeries(),
      ]);

      const allContentItems: AnyContent[] = [
        ...videos,
        ...games,
        ...activities,
      ];

      setAllContent(allContentItems);
      setAllSeries(series);
    } catch (error) {
      console.error("Error loading content:", error);
    }
  };

  useEffect(() => {
    if (!isOpen) return;

    const loadData = async () => {
      await loadGrid();
      await loadAllContent();
    };

    loadData();
  }, [isOpen, gridId, loadGrid]);

  // Ajustar o tipo selecionado quando editingRow tem tipo específico
  useEffect(() => {
    if (editingRow?.contentType) {
      setSelectedContentType(editingRow.contentType);
    }
  }, [editingRow]);

  const handleCreateRow = async () => {
    if (!gridId || !newRowForm.title.trim()) return;

    setLoading(true);
    try {
      const rowData: Omit<GridRow, "id" | "createdAt" | "updatedAt"> = {
        title: newRowForm.title,
        description: newRowForm.description,
        contentType: newRowForm.contentType,
        items: [],
        isActive: true,
        order: rows.length + 1,
        maxItems: newRowForm.maxItems,
      };

      await gridService.createGridRow(gridId, rowData);

      await loadGrid();
      setNewRowForm({
        title: "",
        description: "",
        maxItems: 10,
        contentType: undefined,
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
      onSuccess(); // Notificar o componente pai
    } catch (error) {
      console.error("Error saving row:", error);
    } finally {
      setLoading(false);
    }
  };

  const getContentById = (
    contentId: string,
    contentType: ContentType
  ): AnyContent | VideoSeries | null => {
    // Para séries, buscar na lista de séries
    if (contentType === "series") {
      return allSeries.find((s) => s.seriesId === contentId) || null;
    }

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

    // Validar se o tipo de conteúdo é compatível com a linha
    if (editingRow.contentType && editingRow.contentType !== contentType) {
      alert(
        `Esta linha só aceita conteúdo do tipo "${editingRow.contentType}". Você está tentando adicionar "${contentType}".`
      );
      return;
    }

    const contentToAdd = getContentById(contentId, contentType);
    if (!contentToAdd) return;

    // Verificar se o item já foi adicionado
    const alreadyExists = editingRow.items.some(
      (item) => item.contentId === contentId
    );
    if (alreadyExists) {
      alert("Este conteúdo já foi adicionado à lista.");
      return;
    }

    const newItem: GridItem = {
      id: `${Date.now()}-${Math.random()}`,
      contentId,
      contentType,
      order: editingRow.items.length,
      isSeries: contentType === "series",
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

          // Determinar título baseado no tipo
          const isSeries = item.contentType === "series" || item.isSeries;
          const title = isSeries && "seriesTitle" in content 
            ? content.seriesTitle 
            : "title" in content 
              ? content.title 
              : "Sem título";

          return (
            <div
              key={item.id}
              className="bg-gray-50 p-2 rounded-lg border text-xs"
            >
              <div className="font-medium truncate mb-2 text-gray-900 text-sm">
                {item.contentType === "video" && "🎥"}
                {item.contentType === "series" && "📺"}
                {item.contentType === "game" && "🎮"}
                {item.contentType === "activity" && "📚"}
                {" " + title}
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

  // Render draggable items in edit mode
  const renderEditableRowContent = (row: GridRow) => {
    if (!row.items || row.items.length === 0) {
      return (
        <div className="text-gray-500 text-sm italic text-center py-4">
          Nenhum conteúdo adicionado ainda. Use o botão &quot;+&quot; para adicionar conteúdo.
        </div>
      );
    }

    return (
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleItemDragEnd}
      >
        <SortableContext items={row.items.map(item => item.id)} strategy={horizontalListSortingStrategy}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {row.items.map((item) => {
              const content = getContentById(item.contentId, item.contentType);
              if (!content) return null;

              return (
                <SortableItem
                  key={item.id}
                  item={item}
                  content={content}
                  onRemove={() => handleRemoveContentFromRow(item.contentId)}
                />
              );
            })}
          </div>
        </SortableContext>
      </DndContext>
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-6xl h-[90vh] shadow-2xl border-2 bg-white flex flex-col">
        <CardHeader className="flex-shrink-0 bg-white border-b border-gray-200">
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
              className="flex-shrink-0 border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="flex-1 overflow-hidden bg-white">
          {!showContentGrid ? (
            <div className="h-full flex flex-col space-y-6">
              {/* Formulário para nova linha */}
              <Card className="flex-shrink-0 bg-blue-50 border-blue-200 mt-4">
                <CardHeader className="pb-4 bg-blue-50">
                  <CardTitle className="text-lg text-blue-800">
                    Criar Nova Lista de Conteúdo
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 bg-blue-50">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
                        className="text-gray-900 bg-white border-gray-300"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Tipo de Conteúdo
                      </label>
                      <select
                        value={newRowForm.contentType || "mixed"}
                        onChange={(e) => {
                          const value =
                            e.target.value === "mixed"
                              ? undefined
                              : (e.target.value as ContentType);
                          setNewRowForm((prev) => ({
                            ...prev,
                            contentType: value,
                          }));
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                      >
                        <option value="mixed">🎯 Conteúdo Misto</option>
                        <option value="video">🎥 Apenas Vídeos</option>
                        <option value="series">📺 Apenas Séries</option>
                        <option value="game">🎮 Apenas Jogos</option>
                        <option value="activity">📚 Apenas Atividades</option>
                      </select>
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
                    💡{" "}
                    {newRowForm.contentType
                      ? `Esta lista aceitará apenas ${
                          newRowForm.contentType === "video"
                            ? "vídeos individuais"
                            : newRowForm.contentType === "series"
                            ? "séries (estilo Netflix)"
                            : newRowForm.contentType === "game"
                            ? "jogos"
                            : "atividades"
                        }. Escolha "Conteúdo Misto" para permitir qualquer tipo.`
                      : "Esta lista poderá conter vídeos, séries, jogos e atividades misturados."}
                  </div>
                  <Button
                    onClick={handleCreateRow}
                    disabled={!newRowForm.title.trim() || loading}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-sm"
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
                    <DndContext
                      sensors={sensors}
                      collisionDetection={closestCenter}
                      onDragEnd={handleRowDragEnd}
                    >
                      <SortableContext items={rows.map(row => row.id)} strategy={verticalListSortingStrategy}>
                        {rows.map((row) => (
                          <SortableRow 
                            key={row.id} 
                            row={row}
                            onRenderContent={renderRowContent}
                          >
                            <div className="flex gap-2">
                              <Button
                                onClick={() => handleEditRow(row)}
                                variant="outline"
                                size="sm"
                                className="border-gray-300 text-gray-700 hover:bg-gray-50 font-medium"
                              >
                                <Settings className="h-4 w-4 mr-1" />
                                Editar
                              </Button>
                              <Button
                                onClick={() => handleDeleteRow(row.id)}
                                variant="outline"
                                size="sm"
                                className="text-red-600 border-red-200 hover:bg-red-50 font-medium"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </SortableRow>
                        ))}
                      </SortableContext>
                    </DndContext>
                  )}
                </div>
              </div>
            </div>
          ) : (
            // Editor de conteúdo da linha
            <div className="h-full flex flex-col space-y-4">
              <div className="flex-shrink-0 flex items-center justify-between bg-gray-50 mt-4 p-4 rounded-lg">
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
                    className="bg-green-600 hover:bg-green-700 text-white font-medium shadow-sm"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Salvar
                  </Button>
                  <Button
                    onClick={handleCloseContentGrid}
                    variant="outline"
                    className="border-gray-300 text-gray-700 hover:bg-gray-50 font-medium"
                  >
                    Cancelar
                  </Button>
                </div>
              </div>

              {/* Seletor de tipo de conteúdo */}
              <div className="flex-shrink-0">
                {editingRow?.contentType ? (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <div className="text-sm font-medium text-blue-800 mb-2">
                      Esta linha aceita apenas:
                      <span className=" text-blue-700 text-sm font-medium m-1">
                        {editingRow.contentType === "video" && "Vídeos"}
                        {editingRow.contentType === "series" && "Séries"}
                        {editingRow.contentType === "game" && "Jogos"}
                        {editingRow.contentType === "activity" && "Atividades"}
                      </span>
                    </div>
                    <div className="flex gap-2"></div>
                  </div>
                ) : (
                  <div className="bg-white   p-1 ">
                    <div className="text-sm font-medium text-gray-700 mb-3">
                      🎯 <strong>Linha Mista:</strong> Selecione o tipo de
                      conteúdo para visualizar e adicionar
                    </div>
                    <div className="flex space-x-1">
                      <button
                        onClick={() => setSelectedContentType("video")}
                        className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                          selectedContentType === "video"
                            ? "bg-blue-600 text-white shadow-sm"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                      >
                        🎥 Vídeos
                      </button>
                      <button
                        onClick={() => setSelectedContentType("series")}
                        className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                          selectedContentType === "series"
                            ? "bg-blue-600 text-white shadow-sm"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                      >
                        📺 Séries
                      </button>
                      <button
                        onClick={() => setSelectedContentType("game")}
                        className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                          selectedContentType === "game"
                            ? "bg-blue-600 text-white shadow-sm"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                      >
                        🎮 Jogos
                      </button>
                      <button
                        onClick={() => setSelectedContentType("activity")}
                        className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                          selectedContentType === "activity"
                            ? "bg-blue-600 text-white shadow-sm"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                      >
                        📚 Atividades
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Grid de conteúdo e itens selecionados */}
              <div className="flex-1 overflow-hidden grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Conteúdo disponível */}
                <div className="overflow-auto">
                  <h4 className="font-semibold text-gray-800 mb-2">
                    Conteúdo Disponível (
                    {editingRow?.contentType || selectedContentType})
                  </h4>
                  <div className="grid grid-cols-1 gap-2">
                    {/* Mostrar séries quando tipo for "series" */}
                    {(editingRow?.contentType === "series" || selectedContentType === "series") && (
                      allSeries.map((series) => (
                        <div
                          key={series.seriesId}
                          className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                          onClick={() =>
                            handleAddContentToRow(
                              series.seriesId,
                              "series"
                            )
                          }
                        >
                          <div className="font-medium text-gray-800 flex items-center gap-2">
                            📺 {series.seriesTitle}
                            <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded">
                              Série
                            </span>
                          </div>
                          <div className="text-sm text-gray-500">
                            {series.totalEpisodes} episódios • {series.category}
                          </div>
                        </div>
                      ))
                    )}
                    {/* Mostrar outros conteúdos quando tipo NÃO for "series" */}
                    {(editingRow?.contentType !== "series" && selectedContentType !== "series") && (
                      allContent
                        .filter((content) => {
                          // Se a linha tem tipo específico, mostrar apenas esse tipo
                          const targetType =
                            editingRow?.contentType || selectedContentType;

                          if (
                            targetType === "video" &&
                            "url" in content &&
                            !("plays" in content) &&
                            !("completions" in content)
                          ) {
                            return true;
                          }
                          if (targetType === "game" && "plays" in content) {
                            return true;
                          }
                          if (
                            targetType === "activity" &&
                            "completions" in content
                          ) {
                            return true;
                          }
                          return false;
                        })
                        .map((content) => (
                          <div
                            key={content.id}
                            className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                            onClick={() =>
                              handleAddContentToRow(
                                content.id,
                                editingRow?.contentType || selectedContentType
                              )
                            }
                          >
                            <div className="font-medium text-gray-800 ">
                              {content.title}
                            </div>
                            <div className="text-sm text-gray-500">
                              {content.category}
                            </div>
                          </div>
                        ))
                    )}
                  </div>
                </div>

                {/* Itens selecionados */}
                <div className="overflow-auto">
                  <h4 className="font-semibold text-gray-800 mb-2">
                    Itens Selecionados ({editingRow?.items?.length || 0})
                  </h4>
                  {editingRow ? renderEditableRowContent(editingRow) : (
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
