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
import { X, Plus, Trash2, Brain, Check } from "lucide-react";
import { useAdminLogging } from "@/lib/use-admin-logging";

interface Question {
  question: string;
  options: string[];
  correctAnswer: number;
}

interface QuizModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  activityId?: string;
  existingQuestions?: Question[];
}

export function QuizModal({
  isOpen,
  onClose,
  onSuccess,
  activityId,
  existingQuestions = [],
}: QuizModalProps) {
  const { logUpdate, logError } = useAdminLogging();

  const [questions, setQuestions] = useState<Question[]>(
    existingQuestions.length > 0
      ? existingQuestions
      : [
          {
            question: "",
            options: ["", "", "", ""],
            correctAnswer: 0,
          },
        ]
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        question: "",
        options: ["", "", "", ""],
        correctAnswer: 0,
      },
    ]);
  };

  const removeQuestion = (index: number) => {
    if (questions.length > 1) {
      setQuestions(questions.filter((_, i) => i !== index));
    }
  };

  const updateQuestion = (
    index: number,
    field: keyof Question,
    value: string | number | string[]
  ) => {
    const newQuestions = [...questions];
    newQuestions[index] = { ...newQuestions[index], [field]: value };
    setQuestions(newQuestions);
  };

  const updateOption = (
    questionIndex: number,
    optionIndex: number,
    value: string
  ) => {
    const newQuestions = [...questions];
    newQuestions[questionIndex].options[optionIndex] = value;
    setQuestions(newQuestions);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activityId) return;

    // Validações
    const invalidQuestions = questions.filter(
      (q) =>
        !q.question.trim() ||
        q.options.some((opt) => !opt.trim()) ||
        q.correctAnswer < 0 ||
        q.correctAnswer >= q.options.length
    );

    if (invalidQuestions.length > 0) {
      setError(
        "Todas as perguntas devem ter texto, opções preenchidas e uma resposta correta selecionada."
      );
      return;
    }

    setLoading(true);
    setError("");

    try {
      await activityService.update(activityId, {
        content: { questions },
      });

      // Log da atualização do quiz
      await logUpdate(
        "activity",
        `Quiz atualizado para atividade ID: ${activityId}`,
        JSON.stringify({
          activityId,
          questionsCount: questions.length,
          totalOptions: questions.reduce((acc, q) => acc + q.options.length, 0),
          before: existingQuestions,
          after: questions,
          changeType: "quiz_update",
        })
      );

      onSuccess();
      onClose();
    } catch (error) {
      console.error("Error updating quiz:", error);

      // Log do erro na atualização
      await logError(
        "quiz_update",
        `Falha ao atualizar quiz da atividade: ${activityId}`,
        error,
        {
          activityId,
          questionsAttempted: questions.length,
          existingQuestions: existingQuestions.length,
        }
      );

      setError("Erro ao salvar o quiz. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <Card className="bg-white w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center text-gray-800">
              <Brain className="mr-2 h-5 w-5" />
              Editor de Quiz
            </CardTitle>
            <CardDescription className="text-gray-600">
              Configure as perguntas e respostas do quiz
            </CardDescription>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}

            <div className="space-y-6">
              {questions.map((question, questionIndex) => (
                <Card key={questionIndex} className="border-2">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">
                        Pergunta {questionIndex + 1}
                      </CardTitle>
                      {questions.length > 1 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeQuestion(questionIndex)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-800">
                        Pergunta
                      </label>
                      <Input
                        value={question.question}
                        onChange={(e) =>
                          updateQuestion(
                            questionIndex,
                            "question",
                            e.target.value
                          )
                        }
                        placeholder="Digite a pergunta"
                        required
                      />
                    </div>

                    <div className="space-y-3">
                      <label className="text-sm font-medium text-gray-800">
                        Opções de Resposta
                      </label>
                      {question.options.map((option, optionIndex) => (
                        <div
                          key={optionIndex}
                          className="flex items-center space-x-3"
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
                              className="mr-2"
                            />
                            <span className="text-sm font-medium min-w-[20px]">
                              {String.fromCharCode(65 + optionIndex)}:
                            </span>
                          </div>
                          <div className="flex-1 relative">
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
                              )}`}
                              required
                              className={
                                question.correctAnswer === optionIndex
                                  ? "border-green-500 bg-green-50"
                                  : ""
                              }
                            />
                            {question.correctAnswer === optionIndex && (
                              <Check className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-green-600" />
                            )}
                          </div>
                        </div>
                      ))}
                      <p className="text-xs text-gray-500">
                        Selecione o botão de rádio ao lado da resposta correta
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="flex justify-between items-center pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={addQuestion}
                className="flex items-center"
              >
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Pergunta
              </Button>

              <div className="flex space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  disabled={loading}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={loading || questions.length === 0}
                >
                  {loading ? "Salvando..." : "Salvar Quiz"}
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
