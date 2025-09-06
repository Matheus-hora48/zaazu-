"use client";

import { useState, useEffect } from "react";
import { X, Clock, Trophy, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DailyTimeLimit } from "@/lib/types";

interface DailyTimeLimitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (limits: {
    ageGroup2_6: DailyTimeLimit;
    ageGroup7_9: DailyTimeLimit;
  }) => void;
  currentLimits?: {
    ageGroup2_6?: DailyTimeLimit;
    ageGroup7_9?: DailyTimeLimit;
  };
}

export function DailyTimeLimitModal({
  isOpen,
  onClose,
  onSuccess,
  currentLimits,
}: DailyTimeLimitModalProps) {
  // Estados para faixa 2-6 anos
  const [limits2_6, setLimits2_6] = useState({
    entretenimento: 30,
    atividade: 20,
    educativo: 15,
    rewardType: "medalha" as
      | "medalha"
      | "tempo_extra"
      | "novo_avatar"
      | "badge_especial",
    rewardTitle: "Pequeno Explorador",
  });

  // Estados para faixa 7-9 anos
  const [limits7_9, setLimits7_9] = useState({
    entretenimento: 45,
    atividade: 30,
    educativo: 25,
    rewardType: "medalha" as
      | "medalha"
      | "tempo_extra"
      | "novo_avatar"
      | "badge_especial",
    rewardTitle: "Super Explorador",
  });

  const [isLoading, setIsLoading] = useState(false);

  // Carregar dados existentes
  useEffect(() => {
    if (currentLimits?.ageGroup2_6) {
      setLimits2_6({
        entretenimento: currentLimits.ageGroup2_6.entretenimentoLimit,
        atividade: currentLimits.ageGroup2_6.atividadeLimit,
        educativo: currentLimits.ageGroup2_6.educativoLimit,
        rewardType: currentLimits.ageGroup2_6.rewardType,
        rewardTitle: currentLimits.ageGroup2_6.rewardTitle,
      });
    }

    if (currentLimits?.ageGroup7_9) {
      setLimits7_9({
        entretenimento: currentLimits.ageGroup7_9.entretenimentoLimit,
        atividade: currentLimits.ageGroup7_9.atividadeLimit,
        educativo: currentLimits.ageGroup7_9.educativoLimit,
        rewardType: currentLimits.ageGroup7_9.rewardType,
        rewardTitle: currentLimits.ageGroup7_9.rewardTitle,
      });
    }
  }, [currentLimits]);

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const now = new Date();

      const ageGroup2_6: DailyTimeLimit = {
        id: currentLimits?.ageGroup2_6?.id || "",
        ageGroup: "2-6",
        entretenimentoLimit: limits2_6.entretenimento,
        atividadeLimit: limits2_6.atividade,
        educativoLimit: limits2_6.educativo,
        rewardType: limits2_6.rewardType,
        rewardTitle: limits2_6.rewardTitle,
        isActive: true,
        createdAt: currentLimits?.ageGroup2_6?.createdAt || now,
        updatedAt: now,
      };

      const ageGroup7_9: DailyTimeLimit = {
        id: currentLimits?.ageGroup7_9?.id || "",
        ageGroup: "7-9",
        entretenimentoLimit: limits7_9.entretenimento,
        atividadeLimit: limits7_9.atividade,
        educativoLimit: limits7_9.educativo,
        rewardType: limits7_9.rewardType,
        rewardTitle: limits7_9.rewardTitle,
        isActive: true,
        createdAt: currentLimits?.ageGroup7_9?.createdAt || now,
        updatedAt: now,
      };

      onSuccess({ ageGroup2_6, ageGroup7_9 });
      onClose();
    } catch (error) {
      console.error("Erro ao salvar limites:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center">
            <Clock className="h-6 w-6 text-blue-600 mr-3" />
            <h2 className="text-xl font-semibold text-gray-800">
              Configurar Tempo Limite Diário
            </h2>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="p-6">
          <div className="mb-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="text-sm font-medium text-blue-800 mb-2">
              Como funciona:
            </h3>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>
                • Define o tempo máximo que a criança pode usar cada categoria
                por dia
              </li>
              <li>
                • Quando uma categoria atinge o limite, ela é bloqueada até o
                próximo dia
              </li>
              <li>
                • A criança só ganha o prêmio quando usar TODAS as 3 categorias
              </li>
              <li>
                • Promove diversificação de atividades e uso equilibrado do app
              </li>
            </ul>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Configuração para 2-6 anos */}
            <div className="border rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm mr-3">
                  2-6 anos
                </span>
                Crianças Pequenas
              </h3>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="entretenimento2_6" className="text-gray-700">
                    🎪 Entretenimento (minutos/dia)
                  </Label>
                  <Input
                    id="entretenimento2_6"
                    type="number"
                    min="5"
                    max="120"
                    value={limits2_6.entretenimento}
                    onChange={(e) =>
                      setLimits2_6((prev) => ({
                        ...prev,
                        entretenimento: parseInt(e.target.value) || 0,
                      }))
                    }
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="atividade2_6" className="text-gray-700">
                    📝 Atividade (minutos/dia)
                  </Label>
                  <Input
                    id="atividade2_6"
                    type="number"
                    min="5"
                    max="120"
                    value={limits2_6.atividade}
                    onChange={(e) =>
                      setLimits2_6((prev) => ({
                        ...prev,
                        atividade: parseInt(e.target.value) || 0,
                      }))
                    }
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="educativo2_6" className="text-gray-700">
                    🎓 Educativo (minutos/dia)
                  </Label>
                  <Input
                    id="educativo2_6"
                    type="number"
                    min="5"
                    max="120"
                    value={limits2_6.educativo}
                    onChange={(e) =>
                      setLimits2_6((prev) => ({
                        ...prev,
                        educativo: parseInt(e.target.value) || 0,
                      }))
                    }
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="rewardTitle2_6" className="text-gray-700">
                    🏆 Nome do Prêmio
                  </Label>
                  <Input
                    id="rewardTitle2_6"
                    value={limits2_6.rewardTitle}
                    onChange={(e) =>
                      setLimits2_6((prev) => ({
                        ...prev,
                        rewardTitle: e.target.value,
                      }))
                    }
                    placeholder="Ex: Pequeno Explorador"
                    className="mt-1"
                  />
                </div>

                <div className="bg-gray-50 p-3 rounded">
                  <p className="text-sm text-gray-600">
                    <strong>Total:</strong>{" "}
                    {limits2_6.entretenimento +
                      limits2_6.atividade +
                      limits2_6.educativo}{" "}
                    minutos/dia
                  </p>
                </div>
              </div>
            </div>

            {/* Configuração para 7-9 anos */}
            <div className="border rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm mr-3">
                  7-9 anos
                </span>
                Crianças Maiores
              </h3>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="entretenimento7_9" className="text-gray-700">
                    🎪 Entretenimento (minutos/dia)
                  </Label>
                  <Input
                    id="entretenimento7_9"
                    type="number"
                    min="5"
                    max="180"
                    value={limits7_9.entretenimento}
                    onChange={(e) =>
                      setLimits7_9((prev) => ({
                        ...prev,
                        entretenimento: parseInt(e.target.value) || 0,
                      }))
                    }
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="atividade7_9" className="text-gray-700">
                    📝 Atividade (minutos/dia)
                  </Label>
                  <Input
                    id="atividade7_9"
                    type="number"
                    min="5"
                    max="180"
                    value={limits7_9.atividade}
                    onChange={(e) =>
                      setLimits7_9((prev) => ({
                        ...prev,
                        atividade: parseInt(e.target.value) || 0,
                      }))
                    }
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="educativo7_9" className="text-gray-700">
                    🎓 Educativo (minutos/dia)
                  </Label>
                  <Input
                    id="educativo7_9"
                    type="number"
                    min="5"
                    max="180"
                    value={limits7_9.educativo}
                    onChange={(e) =>
                      setLimits7_9((prev) => ({
                        ...prev,
                        educativo: parseInt(e.target.value) || 0,
                      }))
                    }
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="rewardTitle7_9" className="text-gray-700">
                    🏆 Nome do Prêmio
                  </Label>
                  <Input
                    id="rewardTitle7_9"
                    value={limits7_9.rewardTitle}
                    onChange={(e) =>
                      setLimits7_9((prev) => ({
                        ...prev,
                        rewardTitle: e.target.value,
                      }))
                    }
                    placeholder="Ex: Super Explorador"
                    className="mt-1"
                  />
                </div>

                <div className="bg-gray-50 p-3 rounded">
                  <p className="text-sm text-gray-600">
                    <strong>Total:</strong>{" "}
                    {limits7_9.entretenimento +
                      limits7_9.atividade +
                      limits7_9.educativo}{" "}
                    minutos/dia
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 flex justify-end space-x-3">
            <Button
              variant="outline"
              className="text-gray-700 hover:bg-gray-100 border-gray-300"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSave}
              disabled={isLoading}
              className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Salvar Configurações
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
