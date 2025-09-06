"use client";

import { useState } from "react";
import { X, Upload, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { avatarService } from "@/lib/services";
import { Avatar } from "@/lib/types";

interface AddAvatarModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (avatar: Avatar) => void;
}

export function AddAvatarModal({
  isOpen,
  onClose,
  onSuccess,
}: AddAvatarModalProps) {
  const [name, setName] = useState("");
  const [category, setCategory] = useState<
    "masculino" | "feminino" | "neutro" | "outros"
  >("neutro");
  const [tags, setTags] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    // Validar se é SVG
    if (
      !selectedFile.type.includes("svg") &&
      !selectedFile.name.endsWith(".svg")
    ) {
      setError("Por favor, selecione um arquivo SVG");
      return;
    }

    // Validar tamanho (máximo 500KB)
    if (selectedFile.size > 500 * 1024) {
      setError("O arquivo SVG deve ter no máximo 500KB");
      return;
    }

    setFile(selectedFile);
    setError(null);

    // Criar preview
    const reader = new FileReader();
    reader.onload = (e) => {
      const svgContent = e.target?.result as string;

      // Validar conteúdo SVG
      if (!avatarService.validateSvgContent(svgContent)) {
        setError("Arquivo SVG inválido ou inseguro");
        setFile(null);
        setPreview(null);
        return;
      }

      setPreview(svgContent);
    };
    reader.readAsText(selectedFile);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !name.trim()) return;

    setLoading(true);
    setError(null);

    try {
      // Upload do arquivo SVG
      const svgUrl = await avatarService.uploadSvg(file, name);

      // Criar avatar no banco
      const avatarData = {
        name: name.trim(),
        svgUrl,
        fileName: file.name,
        size: file.size,
        isActive: true,
        category,
        tags: tags
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean),
      };

      const avatarId = await avatarService.create(avatarData);

      const newAvatar: Avatar = {
        id: avatarId,
        ...avatarData,
        createdAt: new Date(),
      };

      onSuccess(newAvatar);
      onClose();

      // Reset form
      setName("");
      setCategory("neutro");
      setTags("");
      setFile(null);
      setPreview(null);
    } catch (error) {
      console.error("Error creating avatar:", error);
      setError(error instanceof Error ? error.message : "Erro ao criar avatar");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
      setName("");
      setCategory("neutro");
      setTags("");
      setFile(null);
      setPreview(null);
      setError(null);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <Card className="w-full bg-white max-w-md max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-xl font-semibold text-gray-800">
            Adicionar Avatar
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClose}
            disabled={loading}
            className="hover:bg-red-100 text-red-600 hover:text-red-700"
          >
            <X className="h-4 w-4" />
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

            <div>
              <Label htmlFor="name" className="text-gray-700">
                Nome do Avatar
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Avatar Criança Menino"
                required
                disabled={loading}
              />
            </div>

            <div>
              <Label htmlFor="category" className="text-gray-700">
                Categoria
              </Label>
              <select
                id="category"
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
              <Label htmlFor="tags" className="text-gray-700">
                Tags (separadas por vírgula)
              </Label>
              <Input
                id="tags"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="Ex: criança, escola, feliz"
                disabled={loading}
              />
            </div>

            <div>
              <Label htmlFor="svg-file" className="text-gray-700">
                Arquivo SVG
              </Label>
              <div className="mt-1">
                <input
                  id="svg-file"
                  type="file"
                  accept=".svg,image/svg+xml"
                  onChange={handleFileChange}
                  disabled={loading}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Máximo 500KB. Apenas arquivos SVG são aceitos.
                </p>
              </div>
            </div>

            {preview && (
              <div>
                <Label className="text-gray-700">Preview</Label>
                <div className="border border-gray-300 rounded-lg p-4 bg-gray-50 flex items-center justify-center">
                  <div
                    className="w-24 h-24"
                    dangerouslySetInnerHTML={{ __html: preview }}
                  />
                </div>
              </div>
            )}

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
                disabled={!file || !name.trim() || loading}
                className="flex-1 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
              >
                {loading ? (
                  <>
                    <Upload className="h-4 w-4 mr-2 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Adicionar Avatar
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
