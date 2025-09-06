"use client";

import { useState } from "react";
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
import { X, Upload, BookOpen, Plus, Trash2 } from "lucide-react";
import { TagsInput } from "@/components/ui/tags-input";
import { logAdminAction, LOG_ACTIONS } from "@/lib/logging";
import { useAuth } from "@/lib/auth-context";

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
    const icons = ["🔴", "🔵", "🟢", "🟡"];
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
              Crie perguntas educativas com múltiplas opções de resposta
            </p>
          </div>
        </div>
      </div>

      {/* Lista de perguntas */}
      <div className="space-y-4 max-h-96 overflow-y-auto">
        {questions.map((question, questionIndex) => (
          <Card
            key={questionIndex}
            className="border-2 border-orange-200 bg-orange-50"
          >
            <CardHeader className="bg-orange-100 border-b border-orange-200">
              <div className="flex justify-between items-center">
                <CardTitle className="text-orange-900 flex items-center gap-2">
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
                  Remover
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
                  className="border-2 border-gray-300 focus:border-orange-500 text-gray-900 font-medium"
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
              Crie perguntas interativas para tornar o aprendizado mais
              divertido!
            </p>
            <Button
              type="button"
              onClick={addQuestion}
              className="bg-yellow-600 hover:bg-yellow-700 text-white font-bold px-6 py-3"
            >
              <Plus className="h-5 w-5 mr-2" />
              Criar Primeira Pergunta
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
            className="border-orange-300 text-orange-700 hover:bg-orange-50 font-bold px-6"
          >
            <Plus className="h-4 w-4 mr-2" />
            Adicionar Mais Uma Pergunta
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

interface AddActivityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function AddActivityModal({
  isOpen,
  onClose,
  onSuccess,
}: AddActivityModalProps) {
  const { user: currentAdmin } = useAuth();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    type: "quiz" as "quiz" | "coloring" | "puzzle" | "drawing",
    category: "",
    ageGroup: "",
    difficulty: "easy" as "easy" | "medium" | "hard",
    content: {} as ActivityContent,
    tags: [] as string[],
  });
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Create activity first
      const activityId = await activityService.create({
        ...formData,
        thumbnail: "", // Will be updated after upload
        isActive: true,
      });

      // Upload thumbnail if provided
      let thumbnailUrl = "";
      if (thumbnailFile) {
        thumbnailUrl = await activityService.uploadThumbnail(
          thumbnailFile,
          activityId
        );
        await activityService.update(activityId, { thumbnail: thumbnailUrl });
      }

      // Log da criação da atividade
      await logAdminAction({
        action: "activity_created",
        details: `Atividade criada: ${formData.title} (${formData.type})`,
        admin: currentAdmin?.email || "unknown",
        level: "info",
        metadata: {
          activityId: activityId,
          activityTitle: formData.title,
          activityType: formData.type,
          activityCategory: formData.category,
          ageGroup: formData.ageGroup,
          difficulty: formData.difficulty,
          tags: formData.tags,
          hasThumbnail: !!thumbnailFile,
          thumbnailUrl: thumbnailUrl,
          questionsCount:
            formData.type === "quiz"
              ? formData.content.questions?.length || 0
              : 0,
          timestamp: new Date().toISOString(),
        },
      });

      onSuccess();
      onClose();
      resetForm();
    } catch (error) {
      console.error("Error creating activity:", error);

      // Log do erro na criação
      await logAdminAction({
        action: "activity_creation_failed",
        details: `Falha ao criar atividade: ${formData.title} - ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
        admin: currentAdmin?.email || "unknown",
        level: "error",
        metadata: {
          activityTitle: formData.title,
          activityType: formData.type,
          activityCategory: formData.category,
          ageGroup: formData.ageGroup,
          difficulty: formData.difficulty,
          tags: formData.tags,
          error: error instanceof Error ? error.message : "Unknown error",
          timestamp: new Date().toISOString(),
        },
      });

      setError("Erro ao criar atividade. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      type: "quiz",
      category: "",
      ageGroup: "",
      difficulty: "easy",
      content: {},
      tags: [],
    });
    setThumbnailFile(null);
    setError("");
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <Card className="bg-white w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl border-2">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center text-gray-900 text-xl font-bold">
              <BookOpen className="mr-2 h-6 w-6 text-gray-600" />
              Adicionar Nova Atividade
            </CardTitle>
            <CardDescription className="text-gray-700 font-medium mt-1">
              Configure uma atividade educativa interativa
            </CardDescription>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClose}
            className="hover:bg-red-100 text-red-600 hover:text-red-700"
          >
            <X className="h-5 w-5" />
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
              <label className="text-sm text-gray-800 font-medium">
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
              <label className="text-sm text-gray-800 font-medium">
                Descrição
              </label>
              <textarea
                className="flex min-h-[80px] w-full rounded-md border border-gray-300 bg-background px-3 py-2 text-sm text-gray-600 ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
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
                <label className="text-sm text-gray-800 font-medium">
                  Tipo
                </label>
                <select
                  className="flex h-10 w-full rounded-md border border-gray-300 bg-background px-3 py-2 text-sm text-gray-600 ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
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
                  {/* <option value="coloring">Colorir</option>
                  <option value="puzzle">Quebra-cabeça</option>
                  <option value="drawing">Desenho</option> */}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm text-gray-800 font-medium">
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
                <label className="text-sm text-gray-800 font-medium">
                  Faixa Etária
                </label>
                <select
                  className="flex h-10 w-full rounded-md border border-gray-300 bg-background px-3 py-2 text-sm text-gray-600 ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
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
                <label className="text-sm text-gray-800 font-medium">
                  Dificuldade
                </label>
                <select
                  className="flex h-10 w-full rounded-md border border-gray-300 bg-background px-3 py-2 text-sm text-gray-600 ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
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

            {/* Conteúdo específico do tipo de atividade */}
            <div className="space-y-4 border-t pt-4">
              <label className="text-sm text-gray-800 font-medium">
                Conteúdo da Atividade
              </label>

              {formData.type === "quiz" && (
                <QuizCreator
                  questions={formData.content.questions || []}
                  onChange={(questions) =>
                    setFormData({ ...formData, content: { questions } })
                  }
                />
              )}

              {formData.type === "coloring" && (
                <div className="p-4 border rounded-lg bg-gray-50">
                  <p className="text-sm text-gray-600">
                    Atividade de colorir - Upload de imagem para colorir será
                    processado após criação
                  </p>
                </div>
              )}

              {formData.type === "puzzle" && (
                <div className="p-4 border rounded-lg bg-gray-50">
                  <p className="text-sm text-gray-600">
                    Quebra-cabeça - Configure as peças e dificuldade após
                    criação
                  </p>
                </div>
              )}

              {formData.type === "drawing" && (
                <div className="p-4 border rounded-lg bg-gray-50">
                  <p className="text-sm text-gray-600">
                    Atividade de desenho - Ferramentas de desenho serão
                    configuradas após criação
                  </p>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-800">Tags</label>
              <TagsInput
                tags={formData.tags}
                onChange={(tags) => setFormData({ ...formData, tags })}
                placeholder="Adicionar tag (ex: quiz, educativo, matemática...)"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-800">
                Thumbnail
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
                Formatos aceitos: JPG, PNG, GIF (máx. 5MB)
              </p>
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={loading}
                className="text-gray-700 hover:bg-gray-100 border-gray-300"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700"
              >
                {loading ? "Criando..." : "Criar Atividade"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
