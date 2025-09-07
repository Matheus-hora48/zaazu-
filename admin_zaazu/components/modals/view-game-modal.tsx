"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { X, Gamepad2, Calendar, Globe, ExternalLink, Play } from "lucide-react";
import { Game } from "@/lib/types";

interface ViewGameModalProps {
  isOpen: boolean;
  onClose: () => void;
  game: Game | null;
}

export function ViewGameModal({ isOpen, onClose, game }: ViewGameModalProps) {
  if (!isOpen || !game) return null;

  const formatDate = (timestamp: Date | { seconds: number } | null) => {
    if (!timestamp) return "Data não disponível";

    if (timestamp instanceof Date) {
      return timestamp.toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    }

    if (typeof timestamp === "object" && "seconds" in timestamp) {
      return new Date(timestamp.seconds * 1000).toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    }

    return "Data inválida";
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <Card className="bg-white w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex text-gray-800 items-center">
              <Gamepad2 className="mr-2 h-5 w-5" />
              Detalhes do Jogo
            </CardTitle>
            <CardDescription className="text-gray-600">
              Informações completas do jogo
            </CardDescription>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Game Preview */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800">
              Preview do Jogo
            </h3>
            <div className="relative bg-gray-100 rounded-lg overflow-hidden aspect-video">
              {game.thumbnail ? (
                <Image
                  src={game.thumbnail}
                  alt={game.title}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Gamepad2 className="h-20 w-20 text-gray-400" />
                </div>
              )}
              <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center">
                <Button
                  size="lg"
                  className="bg-green-600 hover:bg-green-700 text-white rounded-full"
                  onClick={() => window.open(game.url, "_blank")}
                >
                  <Play className="h-6 w-6 mr-2" />
                  Jogar Agora
                </Button>
              </div>
            </div>
          </div>

          {/* Game Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-800">
                  Título
                </label>
                <p className="text-lg font-semibold text-gray-900">
                  {game.title}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-800">
                  Descrição
                </label>
                <p className="text-gray-600 leading-relaxed">
                  {game.description}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-800">
                  Categoria
                </label>
                <p className="text-gray-900">{game.category}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-800">
                  Faixa Etária
                </label>
                <p className="text-gray-900">{game.minAge} anos+</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-800">
                  URL do Jogo
                </label>
                <div className="flex items-center space-x-2">
                  <Globe className="h-4 w-4 text-gray-400" />
                  <a
                    href={game.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 truncate flex items-center"
                  >
                    {game.url}
                    <ExternalLink className="h-3 w-3 ml-1" />
                  </a>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-800">
                  Tipo
                </label>
                <div className="flex items-center space-x-2">
                  <div
                    className={`w-3 h-3 rounded-full ${
                      game.type === "html5" ? "bg-blue-500" : "bg-purple-500"
                    }`}
                  ></div>
                  <p className="text-gray-900 capitalize">
                    {game.type === "html5" ? "HTML5" : "Embed"}
                  </p>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-800">
                  Data de Criação
                </label>
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <p className="text-gray-900">{formatDate(game.createdAt)}</p>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-800">
                  Status
                </label>
                <div className="flex items-center space-x-2">
                  <div
                    className={`w-3 h-3 rounded-full ${
                      game.isActive ? "bg-green-500" : "bg-red-500"
                    }`}
                  ></div>
                  <p className="text-gray-900">
                    {game.isActive ? "Ativo" : "Inativo"}
                  </p>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-800">
                  Jogadas
                </label>
                <p className="text-gray-900">
                  {game.plays?.toLocaleString() || 0} jogadas
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-800">
                  Categoria
                </label>
                <div className="flex flex-wrap gap-2 mt-1">
                  <span className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full flex items-center gap-1">
                    {game.tag === "entretenimento" && "🎪"}
                    {game.tag === "atividade" && "📝"}
                    {game.tag === "educativo" && "🎓"}
                    {game.tag === "entretenimento" && "Entretenimento"}
                    {game.tag === "atividade" && "Atividade"}
                    {game.tag === "educativo" && "Educativo"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-2 pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => window.open(game.url, "_blank")}
              className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Abrir Jogo
            </Button>
            <Button
              onClick={onClose}
              className="text-gray-700 hover:bg-gray-100 border-gray-300"
            >
              Fechar
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
