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
import { Activity } from "@/lib/types";
import { X, Upload, BookOpen, Plus, Trash2 } from "lucide-react";
import { TagsInput } from "@/components/ui/tags-input";
import { useAdminLogging } from "@/lib/use-admin-logging";

interface Question {
  question: string;
  options: string[];
  correctAnswer: number;
}

interface QuizCreatorProps {
  questions: Question[];
  onChange: (questions: Question[]) => void;
}

function QuizCreator({ questions, onChange }: QuizCreatorProps) {
  const addQuestion = () => {
    const newQuestion: Question = {
      question: "",
      options: ["", "", "", ""],
      correctAnswer: 0,
    };
    onChange([...questions, newQuestion]);
  };

  const updateQuestion = (
    index: number,
    field: keyof Question,
    value: string | number
  ) => {
    const updatedQuestions = [...questions];
    updatedQuestions[index] = { ...updatedQuestions[index], [field]: value };
    onChange(updatedQuestions);
  };

  const updateOption = (
    questionIndex: number,
    optionIndex: number,
    value: string
  ) => {
    const updatedQuestions = [...questions];
    updatedQuestions[questionIndex].options[optionIndex] = value;
    onChange(updatedQuestions);
  };

  const removeQuestion = (index: number) => {
    if (confirm("Tem certeza que deseja remover esta pergunta?")) {
      const updatedQuestions = questions.filter((_, i) => i !== index);
      onChange(updatedQuestions);
    }
  };

  const getOptionIcon = (optionIndex: number) => {
    const icons = ["🅰️", "🅱️", "🆎", "🅾️"];
    return icons[optionIndex] || `${optionIndex + 1}`;
  };

  return (
    <div className="space-y-6">
      {/* Header da seção de quiz */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-4 rounded-lg border-2 border-purple-200">
        <div className="flex justify-between items-center">
          <div>
            <h4 className="text-lg font-bold text-purple-900 flex items-center gap-2">
              🧠 Perguntas do Quiz ({questions.length})
            </h4>
            <p className="text-purple-700 text-sm mt-1">
              Edite as perguntas educativas com múltiplas opções de resposta
            </p>
          </div>
          <Button
            type="button"
            onClick={addQuestion}
            className="bg-purple-600 hover:bg-purple-700 text-white font-bold"
          >
            <Plus className="h-4 w-4 mr-2" />➕ Nova Pergunta
          </Button>
        </div>
      </div>

      {/* Lista de perguntas */}
      <div className="space-y-4 max-h-96 overflow-y-auto">
        {questions.map((question, questionIndex) => (
          <Card
            key={questionIndex}
            className="border-2 border-blue-200 bg-blue-50"
          >
            <CardHeader className="bg-blue-100 border-b border-blue-200">
              <div className="flex justify-between items-center">
                <CardTitle className="text-blue-900 flex items-center gap-2">
                  ❓ Pergunta {questionIndex + 1}
                </CardTitle>
                <Button
                  type="button"
                  onClick={() => removeQuestion(questionIndex)}
                  variant="ghost"
                  size="sm"
                  className="text-red-600 hover:bg-red-100 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  🗑️ Remover
                </Button>
              </div>
            </CardHeader>

            <CardContent className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-800 mb-2">
                  📝 Pergunta:
                </label>
                <Input
                  value={question.question}
                  onChange={(e) =>
                    updateQuestion(questionIndex, "question", e.target.value)
                  }
                  placeholder="Ex: Qual é a capital do Brasil?"
                  className="border-2 border-gray-300 focus:border-blue-500 text-gray-900 font-medium"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-800 mb-3">
                  ✅ Opções de Resposta (marque a correta):
                </label>
                <div className="space-y-3">
                  {question.options.map((option, optionIndex) => (
                    <div
                      key={optionIndex}
                      className={`flex items-center space-x-3 p-3 rounded-lg border-2 transition-colors ${
                        question.correctAnswer === optionIndex
                          ? "border-green-500 bg-green-50"
                          : "border-gray-300 bg-white"
                      }`}
                    >
                      <div className="flex items-center">
                        <input
                          type="radio"
                          name={`correct-${questionIndex}`}
                          checked={question.correctAnswer === optionIndex}
                          onChange={() =>
                            updateQuestion(
                              questionIndex,
                              "correctAnswer",
                              optionIndex
                            )
                          }
                          className="w-4 h-4 text-green-600 focus:ring-green-500"
                        />
                        <span className="ml-2 text-lg font-bold">
                          {getOptionIcon(optionIndex)}
                        </span>
                      </div>
                      <Input
                        value={option}
                        onChange={(e) =>
                          updateOption(
                            questionIndex,
                            optionIndex,
                            e.target.value
                          )
                        }
                        placeholder={`Opção ${String.fromCharCode(
                          65 + optionIndex
                        )}...`}
                        className={`flex-1 border-0 focus:ring-0 font-medium ${
                          question.correctAnswer === optionIndex
                            ? "text-green-800 bg-transparent"
                            : "text-gray-800 bg-transparent"
                        }`}
                        required
                      />
                      {question.correctAnswer === optionIndex && (
                        <span className="text-green-600 font-bold">
                          ✓ Correta
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State melhorado */}
      {questions.length === 0 && (
        <Card className="border-2 border-yellow-200 bg-yellow-50">
          <CardContent className="text-center py-12">
            <div className="text-6xl mb-4">🤔</div>
            <h3 className="text-xl font-bold text-yellow-800 mb-2">
              Nenhuma pergunta criada ainda
            </h3>
            <p className="text-yellow-700 mb-6">
              Adicione perguntas interativas para tornar o aprendizado mais
              divertido!
            </p>
            <Button
              type="button"
              onClick={addQuestion}
              className="bg-yellow-600 hover:bg-yellow-700 text-white font-bold px-6 py-3"
            >
              <Plus className="h-5 w-5 mr-2" />
              🚀 Criar Primeira Pergunta
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Botão adicional na parte inferior */}
      {questions.length > 0 && (
        <div className="flex justify-center pt-4 border-t border-gray-200">
          <Button
            type="button"
            onClick={addQuestion}
            variant="outline"
            className="border-purple-300 text-purple-700 hover:bg-purple-50 font-bold px-6"
          >
            <Plus className="h-4 w-4 mr-2" />➕ Adicionar Mais Uma Pergunta
          </Button>
        </div>
      )}
    </div>
  );
}

interface ActivityContent {
  questions?: Question[];
  [key: string]: unknown;
}

interface EditActivityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  activity: Activity | null;
}

export function EditActivityModal({
  isOpen,
  onClose,
  onSuccess,
  activity,
}: EditActivityModalProps) {
  const { logUpdate, logError } = useAdminLogging();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    type: "quiz" as "quiz" | "coloring" | "puzzle" | "drawing",
    category: "",
    ageGroup: "",
    difficulty: "easy" as "easy" | "medium" | "hard",
    isActive: true,
    content: {} as ActivityContent,
    tags: [] as string[],
  });
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (activity) {
      setFormData({
        title: activity.title,
        description: activity.description,
        type: activity.type,
        category: activity.category,
        ageGroup: activity.ageGroup,
        difficulty: activity.difficulty,
        isActive: activity.isActive,
        content: activity.content || {},
        tags: activity.tags || [],
      });
    }
  }, [activity]);

  const handleQuestionsChange = (questions: Question[]) => {
    setFormData({
      ...formData,
      content: { ...formData.content, questions },
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activity) return;

    setLoading(true);
    setError("");

    // Preparar mudanças para log
    const changes: Record<string, { old: string; new: string }> = {};
    if (formData.title !== activity.title) {
      changes.title = { old: activity.title, new: formData.title };
    }
    if (formData.description !== activity.description) {
      changes.description = {
        old: activity.description,
        new: formData.description,
      };
    }
    if (formData.type !== activity.type) {
      changes.type = { old: activity.type, new: formData.type };
    }
    if (formData.category !== activity.category) {
      changes.category = { old: activity.category, new: formData.category };
    }
    if (formData.ageGroup !== activity.ageGroup) {
      changes.ageGroup = { old: activity.ageGroup, new: formData.ageGroup };
    }
    if (formData.difficulty !== activity.difficulty) {
      changes.difficulty = {
        old: activity.difficulty,
        new: formData.difficulty,
      };
    }

    try {
      // Update activity
      await activityService.update(activity.id, formData);

      // Upload new thumbnail if provided
      let thumbnailUrl = "";
      if (thumbnailFile) {
        thumbnailUrl = await activityService.uploadThumbnail(
          thumbnailFile,
          activity.id
        );
        await activityService.update(activity.id, { thumbnail: thumbnailUrl });
      }

      // Log da atualização
      await logUpdate("activity", formData.title, activity.id, changes, {
        activityType: formData.type,
        activityCategory: formData.category,
        ageGroup: formData.ageGroup,
        difficulty: formData.difficulty,
        tags: formData.tags,
        fieldsChanged: Object.keys(changes),
        newThumbnail: !!thumbnailFile,
        thumbnailUrl: thumbnailUrl,
        questionsCount:
          formData.type === "quiz"
            ? formData.content.questions?.length || 0
            : 0,
      });

      onSuccess();
      onClose();
    } catch (error) {
      console.error("Error updating activity:", error);

      // Log do erro
      await logError(
        "activity_update",
        `Falha ao atualizar atividade: ${activity.title}`,
        error,
        {
          activityId: activity.id,
          activityTitle: activity.title,
          attemptedChanges: changes,
        }
      );

      setError("Erro ao atualizar atividade. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setError("");
    onClose();
  };

  if (!isOpen || !activity) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <Card className="bg-white w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center text-gray-800">
              <BookOpen className="mr-2 h-5 w-5" />
              Editar Atividade
            </CardTitle>
            <CardDescription className="text-gray-600">
              Atualize as informações da atividade
            </CardDescription>
          </div>
          <Button variant="ghost" size="icon" onClick={handleClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-800">
                Título
              </label>
              <Input
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                placeholder="Digite o título da atividade"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-800">
                Descrição
              </label>
              <textarea
                className="w-full px-3 py-2 border text-gray-600 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Digite a descrição da atividade"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-800">
                  Tipo
                </label>
                <select
                  className="w-full px-3 py-2 border text-gray-600 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  value={formData.type}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      type: e.target.value as
                        | "quiz"
                        | "coloring"
                        | "puzzle"
                        | "drawing",
                    })
                  }
                  required
                >
                  <option value="quiz">Quiz</option>
                  <option value="coloring">Colorir</option>
                  <option value="puzzle">Quebra-cabeça</option>
                  <option value="drawing">Desenho</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-800">
                  Categoria
                </label>
                <Input
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                  placeholder="Ex: Matemática, Arte, Ciências"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-800">
                  Faixa Etária
                </label>
                <select
                  className="w-full px-3 py-2 border text-gray-600 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  value={formData.ageGroup}
                  onChange={(e) =>
                    setFormData({ ...formData, ageGroup: e.target.value })
                  }
                  required
                >
                  <option value="">Selecione a faixa etária</option>
                  <option value="3-5 anos">3-5 anos</option>
                  <option value="5-7 anos">5-7 anos</option>
                  <option value="7-9 anos">7-9 anos</option>
                  <option value="9-12 anos">9-12 anos</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-800">
                  Dificuldade
                </label>
                <select
                  className="w-full px-3 py-2 border text-gray-600 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  value={formData.difficulty}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      difficulty: e.target.value as "easy" | "medium" | "hard",
                    })
                  }
                  required
                >
                  <option value="easy">Fácil</option>
                  <option value="medium">Médio</option>
                  <option value="hard">Difícil</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) =>
                    setFormData({ ...formData, isActive: e.target.checked })
                  }
                  className="rounded border-gray-300"
                />
                <span className="text-sm font-medium text-gray-600">
                  Atividade ativa
                </span>
              </label>
              <p className="text-xs text-gray-500">
                Atividades inativas não aparecerão para os usuários
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-800">Tags</label>
              <TagsInput
                tags={formData.tags}
                onChange={(tags) => setFormData({ ...formData, tags })}
                placeholder="Adicionar tag (ex: quiz, educativo, matemática...)"
              />
            </div>

            {/* Quiz Creator - só mostra se o tipo for quiz */}
            {formData.type === "quiz" && (
              <div className="space-y-4">
                <QuizCreator
                  questions={formData.content.questions || []}
                  onChange={handleQuestionsChange}
                />
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-800">
                Nova Thumbnail (opcional)
              </label>
              <div className="flex items-center space-x-2">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    setThumbnailFile(e.target.files?.[0] || null)
                  }
                  className="flex-1"
                />
                <Upload className="h-4 w-4 text-gray-400" />
              </div>
              <p className="text-xs text-gray-500">
                Deixe em branco para manter a thumbnail atual
              </p>
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={loading}
                className="border-gray-300 text-gray-700 hover:bg-gray-100"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700"
              >
                {loading ? "Salvando..." : "Salvar Alterações"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
