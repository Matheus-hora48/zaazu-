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
import { activityService } from "@/lib/services";
import { Activity, ContentTag } from "@/lib/types";
import { X, Upload, BookOpen, Plus, Trash2, Check } from "lucide-react";

interface EditActivityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  activity: Activity;
}

export function EditActivityModal({
  isOpen,
  onClose,
  onSuccess,
  activity,
}: EditActivityModalProps) {
  const [loading, setLoading] = useState(false);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    age: "",
    category: "",
    difficulty: "easy" as "easy" | "medium" | "hard",
    instructionVideo: "",
    objectives: [""] as string[],
    thumbnail: "",
  });

  useEffect(() => {
    if (isOpen && activity) {
      setFormData({
        title: activity.title || "",
        description: activity.description || "",
        age: activity.age || "",
        category: activity.category || "",
        difficulty: activity.difficulty || "easy",
        instructionVideo: activity.instructionVideo || "",
        objectives: activity.objectives?.length ? activity.objectives : [""],
        thumbnail: activity.thumbnail || "",
      });
      setThumbnailFile(null);
    }
  }, [isOpen, activity]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.description.trim()) return;

    setLoading(true);
    try {
      // Filtrar objetivos vazios
      const validObjectives = formData.objectives.filter((obj) => obj.trim());

      const activityData = {
        title: formData.title,
        description: formData.description,
        age: formData.age,
        category: formData.category,
        difficulty: formData.difficulty,
        minAge: activity.minAge || parseInt(formData.age) || 2,
        tag: activity.tag || "educativo" as ContentTag,
        instructionVideo: formData.instructionVideo,
        objectives: validObjectives,
        materials: activity.materials || [],
        thumbnail: formData.thumbnail,
        completions: activity.completions || 0,
        isActive: activity.isActive ?? true,
      };

      await activityService.update(activity.id, activityData);

      // Upload da thumbnail se fornecida
      if (thumbnailFile) {
        const thumbnailUrl = await activityService.uploadThumbnail(activity.id, thumbnailFile);
        await activityService.update(activity.id, { thumbnail: thumbnailUrl });
      }

      onSuccess();
      onClose();
    } catch (error) {
      console.error("Error updating activity:", error);
      alert("Erro ao atualizar atividade. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const addObjective = () => {
    setFormData((prev) => ({
      ...prev,
      objectives: [...prev.objectives, ""],
    }));
  };

  const updateObjective = (index: number, value: string) => {
    setFormData((prev) => ({
      ...prev,
      objectives: prev.objectives.map((obj, i) => (i === index ? value : obj)),
    }));
  };

  const removeObjective = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      objectives: prev.objectives.filter((_, i) => i !== index),
    }));
  };

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setThumbnailFile(file);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-auto shadow-2xl border-2">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-bold text-gray-900 flex items-center">
                <BookOpen className="mr-3 h-8 w-8" />
                Editar Atividade
              </CardTitle>
              <CardDescription className="text-gray-600 font-medium">
                Modifique as informações da atividade educativa
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

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            {/* Informações Básicas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-800 mb-2">
                  Título da Atividade *
                </label>
                <Input
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  placeholder="Ex: Contando Números, Pintura Criativa..."
                  className="text-gray-900"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-800 mb-2">
                  Categoria *
                </label>
                <select
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  required
                >
                  <option value="">Selecione uma categoria</option>
                  <option value="matematica">Matemática</option>
                  <option value="portugues">Português</option>
                  <option value="ciencias">Ciências</option>
                  <option value="arte">Arte e Criatividade</option>
                  <option value="musica">Música</option>
                  <option value="educacao-fisica">Educação Física</option>
                  <option value="historia">História</option>
                  <option value="geografia">Geografia</option>
                  <option value="ingles">Inglês</option>
                  <option value="vida-pratica">Vida Prática</option>
                </select>
              </div>
            </div>

            {/* Descrição */}
            <div>
              <label className="block text-sm font-bold text-gray-800 mb-2">
                Descrição da Atividade *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Descreva detalhadamente como realizar esta atividade..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 resize-none h-24"
                required
              />
            </div>

            {/* Idade e Faixa Etária */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-800 mb-2">
                  Idade Específica
                </label>
                <Input
                  value={formData.age}
                  onChange={(e) =>
                    setFormData({ ...formData, age: e.target.value })
                  }
                  placeholder="Ex: 5 anos, 4-6 anos..."
                  className="text-gray-900"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-800 mb-2">
                  Dificuldade *
                </label>
                <select
                  value={formData.difficulty}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      difficulty: e.target.value as "easy" | "medium" | "hard",
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  required
                >
                  <option value="easy">🟢 Fácil</option>
                  <option value="medium">🟡 Médio</option>
                  <option value="hard">🔴 Difícil</option>
                </select>
              </div>
            </div>

            {/* Vídeo Instrucional */}
            <div>
              <label className="block text-sm font-bold text-gray-800 mb-2">
                Vídeo da Atividade (URL)
              </label>
              <Input
                value={formData.instructionVideo}
                onChange={(e) =>
                  setFormData({ ...formData, instructionVideo: e.target.value })
                }
                placeholder="Ex: https://youtube.com/watch?v=..."
                className="text-gray-900"
                type="url"
              />
              <p className="text-xs text-gray-500 mt-1">
                URL do vídeo explicativo de como fazer a atividade
              </p>
            </div>

            {/* Objetivos */}
            <div>
              <label className="block text-sm font-bold text-gray-800 mb-2">
                Objetivos de Aprendizagem
              </label>
              <div className="space-y-2">
                {formData.objectives.map((objective, index) => (
                  <div key={index} className="flex gap-2">
                    <div className="flex items-center">
                      <Check className="h-4 w-4 text-green-600" />
                    </div>
                    <Input
                      value={objective}
                      onChange={(e) => updateObjective(index, e.target.value)}
                      placeholder="Ex: Desenvolver coordenação motora fina..."
                      className="flex-1 text-gray-900"
                    />
                    {formData.objectives.length > 1 && (
                      <Button
                        type="button"
                        onClick={() => removeObjective(index)}
                        variant="outline"
                        size="sm"
                        className="text-red-600 border-red-200 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button
                  type="button"
                  onClick={addObjective}
                  variant="outline"
                  size="sm"
                  className="w-full border-dashed"
                >
                  <Plus className="h-4 w-4 mr-2 text-gray-600" />
                  Adicionar Objetivo
                </Button>
              </div>
            </div>

            {/* Thumbnail */}
            <div>
              <label className="block text-sm font-bold text-gray-800 mb-2">
                Imagem da Atividade (Thumbnail)
              </label>
              <div className="space-y-2">
                {formData.thumbnail && (
                  <div className="text-sm text-gray-600">
                    Imagem atual: {formData.thumbnail}
                  </div>
                )}
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
            </div>

            {/* Botões */}
            <div className="flex gap-3 pt-4 border-t">
              <Button
                type="submit"
                disabled={loading}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
              >
                {loading ? "Salvando..." : "Salvar Alterações"}
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
