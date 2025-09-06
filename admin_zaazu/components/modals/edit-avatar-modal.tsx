"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { X, Save, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { avatarService } from "@/lib/services";
import { Avatar } from "@/lib/types";

interface EditAvatarModalProps {
  isOpen: boolean;
  onClose: () => void;
  avatar: Avatar | null;
  onSuccess: (avatar: Avatar) => void;
}

export function EditAvatarModal({
  isOpen,
  onClose,
  avatar,
  onSuccess,
}: EditAvatarModalProps) {
  const [name, setName] = useState("");
  const [category, setCategory] = useState<
    "masculino" | "feminino" | "neutro" | "outros"
  >("neutro");
  const [tags, setTags] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (avatar) {
      setName(avatar.name);
      setCategory(avatar.category || "neutro");
      setTags(avatar.tags?.join(", ") || "");
      setIsActive(avatar.isActive);
    }
  }, [avatar]);

  if (!isOpen || !avatar) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const updatedData = {
        name: name.trim(),
        category,
        tags: tags
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean),
        isActive,
      };

      await avatarService.update(avatar.id, updatedData);

      const updatedAvatar: Avatar = {
        ...avatar,
        ...updatedData,
      };

      onSuccess(updatedAvatar);
      onClose();
    } catch (error) {
      console.error("Error updating avatar:", error);
      setError(
        error instanceof Error ? error.message : "Erro ao atualizar avatar"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
      setError(null);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <Card className="w-full bg-white max-w-md max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-xl font-semibold text-gray-800">
            Editar Avatar
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClose}
            disabled={loading}
            className="hover:bg-red-100 text-red-600 hover:text-red-700"
          >
            <X className="h-4 w-4 " />
          </Button>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-red-500" />
                <span className="text-sm text-red-700">{error}</span>
              </div>
            )}

            {/* Preview do Avatar */}
            <div className="flex justify-center">
              <div className="w-24 h-24 bg-gray-50 border border-gray-200 rounded-xl flex items-center justify-center">
                <Image
                  src={avatar.svgUrl}
                  alt={avatar.name}
                  width={80}
                  height={80}
                  className="object-contain"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="edit-name" className="text-gray-700">
                Nome do Avatar
              </Label>
              <Input
                id="edit-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Avatar Criança Menino"
                required
                disabled={loading}
              />
            </div>

            <div>
              <Label htmlFor="edit-category" className="text-gray-700">
                Categoria
              </Label>
              <select
                id="edit-category"
                value={category}
                onChange={(e) =>
                  setCategory(
                    e.target.value as
                      | "masculino"
                      | "feminino"
                      | "neutro"
                      | "outros"
                  )
                }
                className="w-full px-3 py-2 border text-gray-500 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={loading}
              >
                <option value="neutro">Neutro</option>
                <option value="masculino">Masculino</option>
                <option value="feminino">Feminino</option>
                <option value="outros">Outros</option>
              </select>
            </div>

            <div>
              <Label htmlFor="edit-tags" className="text-gray-700">
                Tags (separadas por vírgula)
              </Label>
              <Input
                id="edit-tags"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="Ex: criança, escola, feliz"
                disabled={loading}
              />
            </div>

            <div className="flex items-center space-x-2">
              <input
                id="edit-active"
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                disabled={loading}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <Label htmlFor="edit-active" className="text-sm text-gray-700">
                Avatar ativo (disponível para uso)
              </Label>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={loading}
                className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={!name.trim() || loading}
                className="flex-1 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
              >
                {loading ? (
                  <>
                    <Save className="h-4 w-4 mr-2 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Salvar Alterações
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
