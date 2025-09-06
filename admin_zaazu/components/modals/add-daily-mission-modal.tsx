"use client";

import { useState } from "react";
import { X, Plus, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { dailyMissionService } from "@/lib/services";
import { DailyMission, ContentTag } from "@/lib/types";

interface AddDailyMissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (mission: DailyMission) => void;
}

export function AddDailyMissionModal({ isOpen, onClose, onSuccess }: AddDailyMissionModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [contentTag, setContentTag] = useState<ContentTag>("educativo");
  const [ageGroup, setAgeGroup] = useState<"2-6" | "7-9">("2-6");
  const [instructions, setInstructions] = useState("");
  const [estimatedDuration, setEstimatedDuration] = useState<number | "">("");
  const [materials, setMaterials] = useState("");
  const [goals, setGoals] = useState("");
  const [difficulty, setDifficulty] = useState<"facil" | "medio" | "dificil">("facil");
  const [rewards, setRewards] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const missionData = {
        title: title.trim(),
        description: description.trim(),
        contentTag,
        ageGroup,
        instructions: instructions.trim() || undefined,
        estimatedDuration: estimatedDuration || undefined,
        materials: materials.split(",").map(item => item.trim()).filter(Boolean),
        goals: goals.split(",").map(goal => goal.trim()).filter(Boolean),
        difficulty,
        rewards: rewards.split(",").map(reward => reward.trim()).filter(Boolean),
        isActive: true,
      };

      const missionId = await dailyMissionService.create(missionData);

      const newMission: DailyMission = {
        id: missionId,
        ...missionData,
        createdAt: new Date(),
      };

      onSuccess(newMission);
      onClose();
      
      // Reset form
      setTitle("");
      setDescription("");
      setContentTag("educativo");
      setAgeGroup("2-6");
      setInstructions("");
      setEstimatedDuration("");
      setMaterials("");
      setGoals("");
      setDifficulty("facil");
      setRewards("");
    } catch (error) {
      console.error("Error creating daily mission:", error);
      setError(error instanceof Error ? error.message : "Erro ao criar missão");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
      setTitle("");
      setDescription("");
      setContentTag("educativo");
      setAgeGroup("2-6");
      setInstructions("");
      setEstimatedDuration("");
      setMaterials("");
      setGoals("");
      setDifficulty("facil");
      setRewards("");
      setError(null);
    }
  };

  const getContentTagColor = (tag: ContentTag): string => {
    switch (tag) {
      case "educativo": return "bg-blue-100 text-blue-800";
      case "atividade": return "bg-green-100 text-green-800";
      case "entretenimento": return "bg-purple-100 text-purple-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-xl font-semibold text-gray-800">
            Adicionar Missão do Dia
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClose}
            disabled={loading}
            className="h-8 w-8 p-0 hover:bg-gray-100"
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="title">Título da Missão</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex: Caça ao Tesouro da Matemática"
                  required
                  disabled={loading}
                />
              </div>

              <div>
                <Label htmlFor="duration">Duração (minutos)</Label>
                <Input
                  id="duration"
                  type="number"
                  value={estimatedDuration}
                  onChange={(e) => setEstimatedDuration(e.target.value ? parseInt(e.target.value) : "")}
                  placeholder="Ex: 30"
                  disabled={loading}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="description">Descrição</Label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Descreva o que a criança vai fazer nesta missão..."
                required
                disabled={loading}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="contentTag">Categoria</Label>
                <select
                  id="contentTag"
                  value={contentTag}
                  onChange={(e) => setContentTag(e.target.value as ContentTag)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={loading}
                >
                  <option value="educativo">Educativo</option>
                  <option value="atividade">Atividade</option>
                  <option value="entretenimento">Entretenimento</option>
                </select>
                <div className={`inline-block px-2 py-1 text-xs rounded-full mt-1 ${getContentTagColor(contentTag)}`}>
                  {contentTag}
                </div>
              </div>

              <div>
                <Label htmlFor="ageGroup">Faixa Etária</Label>
                <select
                  id="ageGroup"
                  value={ageGroup}
                  onChange={(e) => setAgeGroup(e.target.value as "2-6" | "7-9")}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={loading}
                >
                  <option value="2-6">2 a 6 anos</option>
                  <option value="7-9">7 a 9 anos</option>
                </select>
              </div>

              <div>
                <Label htmlFor="difficulty">Dificuldade</Label>
                <select
                  id="difficulty"
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value as "facil" | "medio" | "dificil")}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={loading}
                >
                  <option value="facil">Fácil</option>
                  <option value="medio">Médio</option>
                  <option value="dificil">Difícil</option>
                </select>
              </div>
            </div>

            <div>
              <Label htmlFor="instructions">Instruções Detalhadas</Label>
              <textarea
                id="instructions"
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                placeholder="Passo a passo de como executar a missão..."
                disabled={loading}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="materials">Materiais Necessários (separados por vírgula)</Label>
              <Input
                id="materials"
                value={materials}
                onChange={(e) => setMaterials(e.target.value)}
                placeholder="Ex: papel, lápis colorido, tesoura"
                disabled={loading}
              />
            </div>

            <div>
              <Label htmlFor="goals">Objetivos da Missão (separados por vírgula)</Label>
              <Input
                id="goals"
                value={goals}
                onChange={(e) => setGoals(e.target.value)}
                placeholder="Ex: desenvolver coordenação motora, aprender números"
                disabled={loading}
              />
            </div>

            <div>
              <Label htmlFor="rewards">Recompensas/Benefícios (separados por vírgula)</Label>
              <Input
                id="rewards"
                value={rewards}
                onChange={(e) => setRewards(e.target.value)}
                placeholder="Ex: estrelas douradas, certificado de missão cumprida"
                disabled={loading}
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={loading}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={!title.trim() || !description.trim() || loading}
                className="flex-1 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
              >
                {loading ? (
                  <>
                    <Plus className="h-4 w-4 mr-2 animate-spin" />
                    Criando...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    Criar Missão
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
