"use client"

import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  Video, 
  Gamepad2, 
  BookOpen, 
  Users, 
  TrendingUp, 
  Play,
  Upload,
  Eye,
  Star
} from "lucide-react"

export default function DashboardPage() {
  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600 mt-1">Bem-vindo ao painel administrativo do Zaazu</p>
          </div>
          <div className="flex space-x-3">
            <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
              <Upload className="mr-2 h-4 w-4" />
              Upload Conteúdo
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-l-4 border-l-blue-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total de Vídeos</CardTitle>
              <Video className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">24</div>
              <p className="text-xs text-gray-500 mt-1">
                <span className="text-green-600">+2</span> novos esta semana
              </p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Jogos HTML5</CardTitle>
              <Gamepad2 className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12</div>
              <p className="text-xs text-gray-500 mt-1">
                <span className="text-green-600">+1</span> novo esta semana
              </p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-yellow-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Atividades</CardTitle>
              <BookOpen className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">36</div>
              <p className="text-xs text-gray-500 mt-1">
                <span className="text-green-600">+5</span> novas esta semana
              </p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-purple-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Usuários Ativos</CardTitle>
              <Users className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1,247</div>
              <p className="text-xs text-gray-500 mt-1">
                <span className="text-green-600">+12%</span> vs mês passado
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity & Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="mr-2 h-5 w-5" />
                Atividade Recente
              </CardTitle>
              <CardDescription>
                Últimas ações realizadas no sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Novo vídeo Aprendendo Cores foi publicado</p>
                    <p className="text-xs text-gray-500">Há 2 horas</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Jogo Puzzle Animals foi atualizado</p>
                    <p className="text-xs text-gray-500">Há 4 horas</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">5 novas atividades de matemática adicionadas</p>
                    <p className="text-xs text-gray-500">Ontem</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">123 novos usuários se cadastraram</p>
                    <p className="text-xs text-gray-500">Esta semana</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Ações Rápidas</CardTitle>
              <CardDescription>
                Ferramentas mais utilizadas para gerenciar conteúdo
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <Button variant="outline" className="h-20 flex flex-col space-y-2">
                  <Video className="h-6 w-6 text-blue-500" />
                  <span className="text-sm">Adicionar Vídeo</span>
                </Button>
                <Button variant="outline" className="h-20 flex flex-col space-y-2">
                  <Gamepad2 className="h-6 w-6 text-green-500" />
                  <span className="text-sm">Cadastrar Jogo</span>
                </Button>
                <Button variant="outline" className="h-20 flex flex-col space-y-2">
                  <BookOpen className="h-6 w-6 text-yellow-500" />
                  <span className="text-sm">Nova Atividade</span>
                </Button>
                <Button variant="outline" className="h-20 flex flex-col space-y-2">
                  <Users className="h-6 w-6 text-purple-500" />
                  <span className="text-sm">Ver Usuários</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Popular Content */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Star className="mr-2 h-5 w-5" />
              Conteúdo Mais Popular
            </CardTitle>
            <CardDescription>
              Vídeos, jogos e atividades com melhor engajamento
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Popular Video */}
              <div className="space-y-3">
                <div className="aspect-video bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg flex items-center justify-center">
                  <Play className="h-8 w-8 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-medium">Aventura dos Números</h4>
                  <p className="text-sm text-gray-500 flex items-center mt-1">
                    <Eye className="h-3 w-3 mr-1" />
                    2,340 visualizações
                  </p>
                </div>
              </div>

              {/* Popular Game */}
              <div className="space-y-3">
                <div className="aspect-video bg-gradient-to-br from-green-100 to-green-200 rounded-lg flex items-center justify-center">
                  <Gamepad2 className="h-8 w-8 text-green-600" />
                </div>
                <div>
                  <h4 className="font-medium">Quebra-Cabeça Safari</h4>
                  <p className="text-sm text-gray-500 flex items-center mt-1">
                    <Play className="h-3 w-3 mr-1" />
                    1,890 jogadas
                  </p>
                </div>
              </div>

              {/* Popular Activity */}
              <div className="space-y-3">
                <div className="aspect-video bg-gradient-to-br from-yellow-100 to-yellow-200 rounded-lg flex items-center justify-center">
                  <BookOpen className="h-8 w-8 text-yellow-600" />
                </div>
                <div>
                  <h4 className="font-medium">Colorir Animais</h4>
                  <p className="text-sm text-gray-500 flex items-center mt-1">
                    <Star className="h-3 w-3 mr-1" />
                    1,456 completadas
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
