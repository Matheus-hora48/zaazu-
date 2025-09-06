"use client";

import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AddGameModal } from "@/components/modals/add-game-modal";
import { ViewGameModal } from "@/components/modals/view-game-modal";
import { EditGameModal } from "@/components/modals/edit-game-modal";
import { GameCard } from "@/components/ui/game-card";
import { gameService } from "@/lib/services";
import { Game } from "@/lib/types";
import {
  Gamepad2,
  Plus,
  Search,
  Play,
  Eye,
  Globe,
} from "lucide-react";

export default function JogosPage() {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);

  useEffect(() => {
    loadGames();
  }, []);

  const loadGames = async () => {
    try {
      setLoading(true);
      const gamesData = await gameService.getAll();
      setGames(gamesData);
    } catch (error) {
      console.error("Error loading games:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredGames = games.filter(
    (game) =>
      game.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      game.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(date);
  };

  const handleDeleteGame = async (gameId: string) => {
    if (confirm("Tem certeza que deseja excluir este jogo?")) {
      try {
        await gameService.delete(gameId);
        await loadGames();
      } catch (error) {
        console.error("Error deleting game:", error);
        alert("Erro ao excluir jogo");
      }
    }
  };

  const handleViewGame = (game: Game) => {
    setSelectedGame(game);
    setIsViewModalOpen(true);
  };

  const handleEditGame = (game: Game) => {
    setSelectedGame(game);
    setIsEditModalOpen(true);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <Gamepad2 className="mr-3 h-8 w-8" />
              Gerenciar Jogos
            </h1>
            <p className="text-gray-600 mt-1">
              Gerencie todos os jogos interativos da plataforma
            </p>
          </div>
          <Button
            onClick={() => setIsAddModalOpen(true)}
            className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
          >
            <Plus className="mr-2 h-4 w-4" />
            Adicionar Jogo
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 ">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Gamepad2 className="h-4 w-4 text-green-500" />
                <span className="text-sm font-medium text-gray-600">
                  Total de Jogos
                </span>
              </div>
              <p className="text-2xl font-bold mt-1 text-gray-700">
                {games.length}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Play className="h-4 w-4 text-blue-500" />
                <span className="text-sm font-medium text-gray-600">
                  Total de Plays
                </span>
              </div>
              <p className="text-2xl font-bold mt-1 text-gray-700">
                {games
                  .reduce((total, game) => total + (game.plays || 0), 0)
                  .toLocaleString()}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Eye className="h-4 w-4 text-purple-500" />
                <span className="text-sm font-medium text-gray-600">
                  Jogos Ativos
                </span>
              </div>
              <p className="text-2xl font-bold mt-1 text-gray-700">
                {games.filter((game) => game.isActive).length}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Globe className="h-4 w-4 text-orange-500" />
                <span className="text-sm font-medium text-gray-600">
                  HTML5 Games
                </span>
              </div>
              <p className="text-2xl font-bold mt-1 text-gray-700">
                {games.filter((game) => game.type === "html5").length}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <Card>
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar jogos por título ou categoria..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 text-gray-700"
              />
            </div>
          </CardContent>
        </Card>

        {/* Games Grid */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredGames.map((game) => (
              <GameCard
                key={game.id}
                game={game}
                onView={handleViewGame}
                onEdit={handleEditGame}
                onDelete={handleDeleteGame}
                formatDate={formatDate}
              />
            ))}

            {filteredGames.length === 0 && !loading && (
              <div className="col-span-full text-center py-12">
                <Gamepad2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {searchTerm
                    ? "Nenhum jogo encontrado"
                    : "Nenhum jogo cadastrado"}
                </h3>
                <p className="text-gray-500 mb-4">
                  {searchTerm
                    ? "Tente buscar com outros termos"
                    : "Comece adicionando seu primeiro jogo"}
                </p>
                {!searchTerm && (
                  <Button
                    onClick={() => setIsAddModalOpen(true)}
                    className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Adicionar Primeiro Jogo
                  </Button>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      <AddGameModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={loadGames}
      />

      <ViewGameModal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        game={selectedGame}
      />

      <EditGameModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSuccess={loadGames}
        game={selectedGame}
      />
    </DashboardLayout>
  );
}
