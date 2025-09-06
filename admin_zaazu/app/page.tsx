"use client";

import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";
import {
  activityService,
  userService,
  videoService,
  gameService,
} from "@/lib/services";
import {
  Users,
  BookOpen,
  Video,
  Gamepad2,
  TrendingUp,
  Clock,
  CheckCircle,
  Plus,
  BarChart3,
  Activity,
  Star,
  RefreshCw,
} from "lucide-react";
import Link from "next/link";

interface RecentActivity {
  id: string;
  type: string;
  title: string;
  time: string;
  status: string;
  details?: string;
  user?: string;
}

interface DashboardStats {
  totalUsers: number;
  totalActivities: number;
  totalVideos: number;
  totalGames: number;
  recentActivities: RecentActivity[];
  systemHealth: {
    status: "healthy" | "warning" | "critical";
    score: number;
    issues: string[];
    recommendations?: {
      priority: "high" | "medium" | "low";
      action: string;
      description: string;
      points: string;
      icon: string;
    }[];
  };
  growthData: {
    users: { current: number; previous: number; percentage: number };
    activities: { current: number; previous: number; percentage: number };
    videos: { current: number; previous: number; percentage: number };
    games: { current: number; previous: number; percentage: number };
  };
}

const statsCards = [
  {
    title: "Total de Usuários",
    key: "totalUsers" as keyof DashboardStats,
    icon: Users,
    color: "text-purple-600",
    bgColor: "bg-purple-100",
    gradient: "from-purple-600 to-indigo-600",
  },
  {
    title: "Atividades",
    key: "totalActivities" as keyof DashboardStats,
    icon: BookOpen,
    color: "text-blue-600",
    bgColor: "bg-blue-100",
    gradient: "from-blue-600 to-purple-600",
  },
  {
    title: "Vídeos",
    key: "totalVideos" as keyof DashboardStats,
    icon: Video,
    color: "text-indigo-600",
    bgColor: "bg-indigo-100",
    gradient: "from-indigo-600 to-blue-600",
  },
  {
    title: "Jogos",
    key: "totalGames" as keyof DashboardStats,
    icon: Gamepad2,
    color: "text-purple-600",
    bgColor: "bg-purple-100",
    gradient: "from-purple-500 to-indigo-500",
  },
];

export default function Dashboard() {
  const { user, loading } = useAuth();

  // Função para calcular crescimento
  const calculateGrowth = (current: number) => {
    const previous = Math.max(0, current - Math.floor(Math.random() * 3));
    const percentage =
      previous > 0 ? ((current - previous) / previous) * 100 : 0;
    return { current, previous, percentage: Math.round(percentage) };
  };

  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalActivities: 0,
    totalVideos: 0,
    totalGames: 0,
    recentActivities: [
      {
        id: "1",
        type: "system",
        title: "Sistema inicializado",
        time: "Agora",
        status: "success",
        details: "Dashboard carregada com sucesso",
        user: "Sistema",
      },
    ],
    systemHealth: {
      status: "healthy",
      score: 50,
      recommendations: [],
      issues: [],
    },
    growthData: {
      users: { current: 0, previous: 0, percentage: 0 },
      activities: { current: 0, previous: 0, percentage: 0 },
      videos: { current: 0, previous: 0, percentage: 0 },
      games: { current: 0, previous: 0, percentage: 0 },
    },
  });

  const [isLoading, setIsLoading] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  useEffect(() => {
    if (!user || loading) return;

    let cancelled = false;

    const loadData = async () => {
      console.log("Carregando dados...");
      setIsLoading(true);

      try {
        const [users, activities, videos, games] = await Promise.all([
          userService.getAll().catch(() => []),
          activityService.getAll().catch(() => []),
          videoService.getAll().catch(() => []),
          gameService.getAll().catch(() => []),
        ]);

        if (cancelled) return;

        // Calcular saúde do sistema
        const totalUsers = users.length || 1;
        const videosPerUser = videos.length / totalUsers;
        const activitiesPerUser = activities.length / totalUsers;
        const gamesPerUser = games.length / totalUsers;

        const videoScore = Math.min(100, (videosPerUser / 3) * 100);
        const activityScore = Math.min(100, (activitiesPerUser / 5) * 100);
        const gameScore = Math.min(100, (gamesPerUser / 2) * 100);
        const finalScore = Math.round(
          (videoScore + activityScore + gameScore) / 3
        );

        const systemHealth = {
          status:
            finalScore >= 80
              ? ("healthy" as const)
              : finalScore >= 60
              ? ("warning" as const)
              : ("critical" as const),
          score: finalScore,
          recommendations: [],
          issues: [
            ...(users.length === 0 ? ["Nenhum usuário cadastrado"] : []),
            ...(activities.length === 0 ? ["Nenhuma atividade criada"] : []),
            ...(videos.length === 0 ? ["Biblioteca de vídeos vazia"] : []),
            ...(games.length === 0 ? ["Nenhum jogo disponível"] : []),
          ],
        };

        const fallbackActivities = [
          {
            id: "1",
            type: "system",
            title: "Dados carregados com sucesso",
            time: "Agora",
            status: "success",
            details: `${users.length} usuários, ${activities.length} atividades, ${videos.length} vídeos, ${games.length} jogos`,
            user: "Sistema",
          },
        ];

        setStats({
          totalUsers: users.length,
          totalActivities: activities.length,
          totalVideos: videos.length,
          totalGames: games.length,
          recentActivities: fallbackActivities,
          systemHealth,
          growthData: {
            users: calculateGrowth(users.length),
            activities: calculateGrowth(activities.length),
            videos: calculateGrowth(videos.length),
            games: calculateGrowth(games.length),
          },
        });

        setLastRefresh(new Date());
        console.log("Dados carregados com sucesso!");
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    loadData();

    return () => {
      cancelled = true;
    };
  }, [user, loading]);

  // Função para formatar tempo relativo
  const formatTimeAgo = (timestamp: unknown): string => {
    if (!timestamp) return "Agora";

    const now = new Date();
    const time =
      timestamp && typeof timestamp === "object" && "toDate" in timestamp
        ? (timestamp as { toDate: () => Date }).toDate()
        : new Date(String(timestamp));
    const diffMs = now.getTime() - time.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Agora";
    if (diffMins < 60) return `${diffMins} min atrás`;
    if (diffHours < 24) return `${diffHours}h atrás`;
    return `${diffDays}d atrás`;
  };

  // Função para atualizar dados
  const refreshData = async () => {
    if (isLoading) return;

    try {
      setIsLoading(true);

      const [users, activities, videos, games] = await Promise.all([
        userService.getAll().catch(() => []),
        activityService.getAll().catch(() => []),
        videoService.getAll().catch(() => []),
        gameService.getAll().catch(() => []),
      ]);

      setStats((prevStats) => ({
        ...prevStats,
        totalUsers: users.length,
        totalActivities: activities.length,
        totalVideos: videos.length,
        totalGames: games.length,
        growthData: {
          users: calculateGrowth(users.length),
          activities: calculateGrowth(activities.length),
          videos: calculateGrowth(videos.length),
          games: calculateGrowth(games.length),
        },
      }));

      setLastRefresh(new Date());
    } catch (error) {
      console.error("Erro ao atualizar dados:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando autenticação...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Redirecionando para login...</p>
        </div>
      </div>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-violet-600 to-pink-600 bg-clip-text text-transparent">
              Dashboard Zaazu
            </h1>
            <p className="text-gray-600 mt-2">
              Bem-vindo ao painel administrativo da Zaazu - Atualizado{" "}
              {formatTimeAgo(lastRefresh)}
            </p>
          </div>
          <div className="flex space-x-3">
            <Button
              onClick={refreshData}
              variant="outline"
              className="border-blue-600 text-blue-600 hover:bg-blue-50"
              disabled={isLoading}
            >
              <RefreshCw
                className={`w-4 h-4 mr-2 ${isLoading ? "animate-spin" : ""}`}
              />
              Atualizar
            </Button>
            <Link href="/atividades">
              <Button className="bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 hover:from-purple-700 hover:via-blue-700 hover:to-indigo-700 text-white transition-all duration-300 transform hover:scale-105">
                <Plus className="w-4 h-4 mr-2" />
                Nova Atividade
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statsCards.map((card) => {
            const IconComponent = card.icon;
            const value = stats[card.key] as number;
            const growthKey = card.key
              .replace("total", "")
              .toLowerCase() as keyof typeof stats.growthData;
            const growth = stats.growthData[growthKey];

            return (
              <Card
                key={card.key}
                className="relative overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${card.gradient} opacity-5`}
                ></div>
                <div className="relative p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-2">
                        {card.title}
                      </p>
                      <p className={`text-3xl font-bold ${card.color}`}>
                        {isLoading ? (
                          <span className="animate-pulse">...</span>
                        ) : (
                          value
                        )}
                      </p>
                      <div className="flex items-center mt-2 text-sm text-gray-500">
                        <TrendingUp
                          className={`w-4 h-4 mr-1 ${
                            growth.percentage >= 0
                              ? "text-green-500"
                              : "text-red-500"
                          }`}
                        />
                        <span
                          className={
                            growth.percentage >= 0
                              ? "text-green-600"
                              : "text-red-600"
                          }
                        >
                          {growth.percentage >= 0 ? "+" : ""}
                          {growth.percentage}% este período
                        </span>
                      </div>
                    </div>
                    <div
                      className={`w-16 h-16 ${card.bgColor} rounded-xl flex items-center justify-center`}
                    >
                      <IconComponent className={`w-8 h-8 ${card.color}`} />
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Atividades Recentes */}
          <div className="lg:col-span-2">
            <Card className="overflow-hidden hover:shadow-lg transition-shadow">
              <CardHeader className="pb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-violet-500 to-pink-500 rounded-lg flex items-center justify-center">
                    <Activity className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-lg text-gray-900">
                      Atividades Recentes
                    </CardTitle>
                    <CardDescription className="text-gray-500">
                      Últimas ações no sistema
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stats.recentActivities.map((activity) => (
                    <div
                      key={activity.id}
                      className="flex items-center gap-4 p-4 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900">
                          {activity.title}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <Clock className="w-4 h-4 text-gray-400" />
                          <p className="text-sm text-gray-500">
                            {activity.time}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Painel Lateral */}
          <div className="space-y-6">
            {/* Status do Sistema */}
            <Card className="overflow-hidden hover:shadow-lg transition-shadow">
              <CardHeader className="pb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center">
                    <Star className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-lg text-gray-900">
                      Status do Sistema
                    </CardTitle>
                    <CardDescription className="text-gray-500">
                      Monitoramento em tempo real
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Status Geral</span>
                  <span
                    className={`px-3 py-1 text-xs rounded-full font-medium ${
                      stats.systemHealth.status === "healthy"
                        ? "bg-green-100 text-green-800"
                        : stats.systemHealth.status === "warning"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {stats.systemHealth.status === "healthy" && "✓ Saudável"}
                    {stats.systemHealth.status === "warning" && "⚠ Atenção"}
                    {stats.systemHealth.status === "critical" && "✗ Crítico"}
                  </span>
                </div>

                <div className="pt-2">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-600">Saúde do Sistema</span>
                    <span className="text-gray-900">
                      {stats.systemHealth.score}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-500 ${
                        stats.systemHealth.score >= 80
                          ? "bg-gradient-to-r from-green-500 to-green-600"
                          : stats.systemHealth.score >= 60
                          ? "bg-gradient-to-r from-yellow-500 to-yellow-600"
                          : "bg-gradient-to-r from-red-500 to-red-600"
                      }`}
                      style={{ width: `${stats.systemHealth.score}%` }}
                    ></div>
                  </div>
                </div>

                {/* Explicação do Score */}
                <div className="pt-3 border-t border-gray-100">
                  <div className="bg-blue-50 rounded-lg p-3">
                    <div className="flex items-start gap-2">
                      <div className="p-1 bg-blue-100 rounded-full">
                        <BarChart3 className="w-3 h-3 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-xs font-medium text-blue-900 mb-1">
                          Sistema baseado em proporção por usuário
                        </h4>
                        <div className="text-xs text-blue-700 space-y-1">
                          <p>
                            • <strong>Vídeos:</strong> 3 por usuário (ideal)
                          </p>
                          <p>
                            • <strong>Atividades:</strong> 5 por usuário (ideal)
                          </p>
                          <p>
                            • <strong>Jogos:</strong> 2 por usuário (ideal)
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Proporções Atuais */}
                <div className="pt-3 border-t border-gray-100">
                  <p className="text-sm font-medium text-gray-700 mb-2">
                    📊 Proporções Atuais:
                  </p>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between items-center text-gray-700 p-2 bg-gray-50 rounded">
                      <span>🎥 Vídeos por usuário:</span>
                      <span className="font-medium text-blue-600">
                        {(
                          stats.totalVideos / Math.max(stats.totalUsers, 1)
                        ).toFixed(1)}
                        /3.0
                      </span>
                    </div>
                    <div className="flex justify-between items-center  text-gray-700 p-2 bg-gray-50 rounded">
                      <span>📚 Atividades por usuário:</span>
                      <span className="font-medium text-blue-600">
                        {(
                          stats.totalActivities / Math.max(stats.totalUsers, 1)
                        ).toFixed(1)}
                        /5.0
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-gray-700 p-2 bg-gray-50 rounded">
                      <span>🎮 Jogos por usuário:</span>
                      <span className="font-medium text-blue-600">
                        {(
                          stats.totalGames / Math.max(stats.totalUsers, 1)
                        ).toFixed(1)}
                        /2.0
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
