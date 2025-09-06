"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { gameService } from "@/lib/services";
import { X, Gamepad2, Save, Upload } from "lucide-react";
import { Game, ContentTag } from "@/lib/types";
import { ContentTagSelector } from "@/components/ui/content-tag-selector";
import { MinAgeSelector } from "@/components/ui/min-age-selector";
import { useAdminLogging } from "@/lib/use-admin-logging";

interface EditGameModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  game: Game | null;
}

export function EditGameModal({
  isOpen,
  onClose,
  onSuccess,
  game,
}: EditGameModalProps) {
  const { logUpdate, logError } = useAdminLogging();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    url: "",
    category: "",
    minAge: 2,
    type: "html5" as "html5" | "embed",
    tag: "entretenimento" as ContentTag,
  });
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (game) {
      setFormData({
        title: game.title,
        description: game.description,
        url: game.url,
        category: game.category,
        minAge: game.minAge || 2,
        type: game.type,
        tag: game.tag || "entretenimento",
      });
    }
  }, [game]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!game) return;

    setLoading(true);
    setError("");

    // Preparar mudanças para log
    const changes: Record<string, { old: string; new: string }> = {};
    if (formData.title !== game.title) {
      changes.title = { old: game.title, new: formData.title };
    }
    if (formData.description !== game.description) {
      changes.description = {
        old: game.description,
        new: formData.description,
      };
    }
    if (formData.url !== game.url) {
      changes.url = { old: game.url, new: formData.url };
    }
    if (formData.category !== game.category) {
      changes.category = { old: game.category, new: formData.category };
    }
    if (formData.minAge !== game.minAge) {
      changes.minAge = { old: game.minAge.toString(), new: formData.minAge.toString() };
    }
    if (formData.type !== game.type) {
      changes.type = { old: game.type, new: formData.type };
    }

    try {
      // Update game data
      await gameService.update(game.id, formData);

      // Upload new thumbnail if provided
      if (thumbnailFile) {
        await gameService.uploadThumbnail(game.id, thumbnailFile);
      }

      // Log da atualização
      await logUpdate("game", formData.title, game.id, changes, {
        gameType: formData.type,
        gameCategory: formData.category,
        minAge: formData.minAge,
        gameUrl: formData.url,
        tag: formData.tag,
        fieldsChanged: Object.keys(changes),
        newThumbnail: !!thumbnailFile,
      });

      onSuccess();
      onClose();
    } catch (error) {
      console.error("Error updating game:", error);

      // Log do erro
      await logError(
        "game_update",
        `Falha ao atualizar jogo: ${game.title}`,
        error,
        {
          gameId: game.id,
          gameTitle: game.title,
          attemptedChanges: changes,
        }
      );

      setError("Erro ao atualizar jogo. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setError("");
    setThumbnailFile(null);
    onClose();
  };

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setThumbnailFile(file);
    }
  };

  if (!isOpen || !game) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <Card className="bg-white w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center text-gray-800">
              <Gamepad2 className="mr-2 h-5 w-5" />
              Editar Jogo
            </CardTitle>
            <CardDescription className="text-gray-600">
              Atualize as informações do jogo
            </CardDescription>
          </div>
          <Button variant="ghost" size="icon" onClick={handleClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm text-gray-800 font-medium">
                Título
              </label>
              <Input
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                placeholder="Nome do jogo"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm text-gray-800 font-medium">
                URL do Jogo
              </label>
              <Input
                type="url"
                value={formData.url}
                onChange={(e) =>
                  setFormData({ ...formData, url: e.target.value })
                }
                placeholder="https://example.com/game"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm text-gray-800 font-medium">
                Descrição
              </label>
              <textarea
                className="flex min-h-[80px] w-full rounded-md border border-gray-300 bg-background px-3 py-2 text-sm text-gray-600 ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Descrição do jogo"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm text-gray-800 font-medium">
                  Tipo
                </label>
                <select
                  className="flex h-10 w-full rounded-md border border-gray-300 bg-background px-3 py-2 text-sm text-gray-600 ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={formData.type}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      type: e.target.value as "html5" | "embed",
                    })
                  }
                  required
                >
                  <option value="html5">HTML5</option>
                  <option value="embed">Embed</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm text-gray-800 font-medium">
                  Categoria
                </label>
                <select
                  className="flex h-10 w-full rounded-md border border-gray-300 bg-background px-3 py-2 text-sm text-gray-600 ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                  required
                >
                  <option value="">Selecione uma categoria</option>
                  <option value="Ação">Ação</option>
                  <option value="Aventura">Aventura</option>
                  <option value="Puzzle">Puzzle</option>
                  <option value="Educacional">Educacional</option>
                  <option value="Esporte">Esporte</option>
                  <option value="Corrida">Corrida</option>
                  <option value="Estratégia">Estratégia</option>
                </select>
              </div>
            </div>

            <div>
              <MinAgeSelector
                value={formData.minAge}
                onChange={(age) => setFormData({ ...formData, minAge: age })}
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-800">Categoria</label>
              <ContentTagSelector
                value={formData.tag}
                onChange={(tag) => setFormData({ ...formData, tag })}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm text-gray-800 font-medium">
                Nova Thumbnail (opcional)
              </label>
              <div className="flex items-center gap-4">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleThumbnailChange}
                  className="flex-1"
                />
                {thumbnailFile && (
                  <div className="text-sm text-green-600 flex items-center">
                    <Upload className="h-4 w-4 mr-1" />
                    {thumbnailFile.name}
                  </div>
                )}
              </div>
              <p className="text-xs text-gray-500">
                Deixe em branco para manter a thumbnail atual. Formatos aceitos:
                JPG, PNG, GIF (máx. 5MB)
              </p>
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={loading}
                className="text-gray-700 hover:bg-gray-100 border-gray-300"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
              >
                <Save className="mr-2 h-4 w-4" />
                {loading ? "Salvando..." : "Salvar Alterações"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
