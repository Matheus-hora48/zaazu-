"use client";

import Image from "next/image";
import { X, Calendar, Tag, FileText, HardDrive } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/lib/types";

interface ViewAvatarModalProps {
  isOpen: boolean;
  onClose: () => void;
  avatar: Avatar | null;
}

export function ViewAvatarModal({
  isOpen,
  onClose,
  avatar,
}: ViewAvatarModalProps) {
  if (!isOpen || !avatar) return null;

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getCategoryColor = (category?: string): string => {
    switch (category) {
      case "masculino":
        return "bg-blue-100 text-blue-800";
      case "feminino":
        return "bg-pink-100 text-pink-800";
      case "neutro":
        return "bg-gray-100 text-gray-800";
      case "outros":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <Card className="w-full bg-white max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-xl font-semibold text-gray-800">
            Detalhes do Avatar
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0 hover:bg-gray-100"
          >
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Preview do Avatar */}
          <div className="flex flex-col items-center">
            <div className="w-32 h-32 bg-gray-50 border border-gray-200 rounded-xl flex items-center justify-center mb-4">
              <Image
                src={avatar.svgUrl}
                alt={avatar.name}
                width={96}
                height={96}
                className="object-contain"
              />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">
              {avatar.name}
            </h3>
            <div
              className={`px-3 py-1 rounded-full text-xs font-medium mt-2 ${getCategoryColor(
                avatar.category
              )}`}
            >
              {avatar.category || "Sem categoria"}
            </div>
          </div>

          {/* Informações do Arquivo */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <FileText className="h-5 w-5 text-gray-600" />
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    Nome do Arquivo
                  </p>
                  <p className="text-sm text-gray-600">{avatar.fileName}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <HardDrive className="h-5 w-5 text-gray-600" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Tamanho</p>
                  <p className="text-sm text-gray-600">
                    {formatFileSize(avatar.size)}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <Calendar className="h-5 w-5 text-gray-600" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Criado em</p>
                  <p className="text-sm text-gray-600">
                    {formatDate(avatar.createdAt)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div
                  className={`w-5 h-5 rounded-full ${
                    avatar.isActive ? "bg-green-500" : "bg-red-500"
                  }`}
                />
                <div>
                  <p className="text-sm font-medium text-gray-900">Status</p>
                  <p className="text-sm text-gray-600">
                    {avatar.isActive ? "Ativo" : "Inativo"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Tags */}
          {avatar.tags && avatar.tags.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Tag className="h-4 w-4 text-gray-600" />
                <span className="text-sm font-medium text-gray-900">Tags</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {avatar.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* URL do SVG */}
          <div>
            <p className="text-sm font-medium text-gray-900 mb-2">URL do SVG</p>
            <div className="bg-gray-50 rounded-lg p-3">
              <code className="text-xs text-gray-600 break-all">
                {avatar.svgUrl}
              </code>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <Button
              onClick={onClose}
              className="bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800"
            >
              Fechar
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
