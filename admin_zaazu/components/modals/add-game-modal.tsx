"use client";

import { useState } from "react";
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
import { X, Upload, Gamepad2 } from "lucide-react";
import { ContentTag } from "@/lib/types";
import { ContentTagSelector } from "@/components/ui/content-tag-selector";
import { MinAgeSelector } from "@/components/ui/min-age-selector";
import { useAdminLogging } from "@/lib/use-admin-logging";

interface AddGameModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function AddGameModal({
  isOpen,
  onClose,
  onSuccess,
}: AddGameModalProps) {
  const { logCreate, logError } = useAdminLogging();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    url: "",
    category: "",
    minAge: 2,
    type: "html5" as "html5" | "embed",
    thumbnail: "",
    isActive: true,
    tag: "entretenimento" as ContentTag,
  });
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const gameData = {
        title: formData.title,
        description: formData.description,
        url: formData.url,
        category: formData.category,
        minAge: formData.minAge,
        type: formData.type,
        thumbnail: "", // Will be updated after upload
        isActive: formData.isActive,
        tag: formData.tag,
        plays: 0,
      };

      const gameId = await gameService.create(gameData);

      // Upload da thumbnail se fornecida
      if (thumbnailFile) {
        await gameService.uploadThumbnail(gameId, thumbnailFile);
      }

      // Log da criação do jogo
      await logCreate("game", formData.title, gameId, {
        gameType: formData.type,
        gameCategory: formData.category,
        minAge: formData.minAge,
        gameUrl: formData.url,
        tag: formData.tag,
        hasThumbnail: !!thumbnailFile,
      });

      onSuccess();
      onClose();

      // Reset form
      setFormData({
        title: "",
        description: "",
        url: "",
        category: "",
        minAge: 2,
        type: "html5",
        thumbnail: "",
        isActive: true,
        tag: "entretenimento" as ContentTag,
      });
      setThumbnailFile(null);
    } catch (error) {
      console.error("Error creating game:", error);

      // Log do erro na criação
      await logError(
        "game_creation",
        `Falha ao criar jogo: ${formData.title}`,
        error,
        {
          gameTitle: formData.title,
          gameType: formData.type,
          gameCategory: formData.category,
          gameUrl: formData.url,
          minAge: formData.minAge,
          tag: formData.tag,
        }
      );
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setThumbnailFile(file);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto shadow-2xl border-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center text-gray-900 text-xl font-bold">
                <Gamepad2 className="mr-2 h-6 w-6 text-gray-600" />
                Adicionar Novo Jogo
              </CardTitle>
              <CardDescription className="text-gray-700 font-medium mt-1">
                Configure um jogo educativo interativo
              </CardDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="hover:bg-red-100 text-red-600 hover:text-red-700"
            >
              <X className="h-5 w-5" />
            </Button>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-800 mb-1">
                    Título do Jogo
                  </label>
                  <Input
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    className="text-gray-600 border-gray-300 focus:ring-purple-500"
                    placeholder="Ex: Quebra-cabeça dos Animais"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-800 mb-1">
                    Categoria
                  </label>
                  <Input
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="text-gray-600 border-gray-300 focus:ring-purple-500"
                    placeholder="Ex: Puzzle, Matemática, Ciências"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-800 mb-1">
                  Descrição
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Descrição do jogo e objetivos de aprendizado"
                  rows={3}
                  className="w-full px-3 py-2  text-gray-600 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-800 mb-1">
                  URL do Jogo
                </label>
                <Input
                  name="url"
                  value={formData.url}
                  onChange={handleInputChange}
                  className="text-gray-600 border-gray-300 focus:ring-purple-500"
                  placeholder="https://exemplo.com/jogo"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-800 mb-1">
                    Tipo de Jogo
                  </label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border text-gray-600 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    required
                  >
                    <option value="html5">HTML5</option>
                    <option value="embed">Embed</option>
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

              <div>
                <label className="block text-sm font-medium text-gray-800 mb-1">
                  Imagem do Jogo (Thumbnail)
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
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-800 mb-1">
                  Categoria
                </label>
                <ContentTagSelector
                  value={formData.tag}
                  onChange={(tag) => setFormData({ ...formData, tag })}
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isActive"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleInputChange}
                  className="rounded border-gray-300  text-purple-600 focus:ring-purple-500"
                />
                <label
                  htmlFor="isActive"
                  className="text-sm font-medium text-gray-700"
                >
                  Jogo ativo (visível para usuários)
                </label>
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  className=""
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={loading}
                  className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
                >
                  {loading ? "Criando..." : "Criar Jogo"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
