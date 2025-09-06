"use client";

import { ContentTag } from "@/lib/types";

interface ContentTagSelectorProps {
  value: ContentTag | "";
  onChange: (tag: ContentTag) => void;
  label?: string;
  required?: boolean;
  className?: string;
}

export function ContentTagSelector({
  value,
  onChange,
  label = "Tag do Conteúdo",
  required = true,
  className = "",
}: ContentTagSelectorProps) {
  const tagOptions: { value: ContentTag; label: string; emoji: string; description: string }[] = [
    {
      value: "entretenimento",
      label: "Entretenimento",
      emoji: "🎬",
      description: "Conteúdo para diversão e lazer"
    },
    {
      value: "atividade",
      label: "Atividade",
      emoji: "🎯",
      description: "Atividades práticas e exercícios"
    },
    {
      value: "educativo",
      label: "Educativo",
      emoji: "📚",
      description: "Conteúdo educacional e aprendizado"
    }
  ];

  return (
    <div className={className}>
      <label className="block text-sm font-bold text-gray-800 mb-2">
        {label} {required && "*"}
      </label>
      <div className="space-y-2">
        {tagOptions.map((option) => (
          <label
            key={option.value}
            className={`flex items-center p-3 border-2 rounded-lg cursor-pointer transition-all ${
              value === option.value
                ? "border-blue-500 bg-blue-50 text-blue-800"
                : "border-gray-200 bg-white hover:border-gray-300 text-gray-700"
            }`}
          >
            <input
              type="radio"
              name="contentTag"
              value={option.value}
              checked={value === option.value}
              onChange={(e) => onChange(e.target.value as ContentTag)}
              className="sr-only"
            />
            <div className="flex items-center flex-1">
              <span className="text-2xl mr-3">{option.emoji}</span>
              <div>
                <div className="font-medium">{option.label}</div>
                <div className="text-sm opacity-75">{option.description}</div>
              </div>
            </div>
            {value === option.value && (
              <div className="ml-2">
                <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
            )}
          </label>
        ))}
      </div>
      {required && !value && (
        <p className="text-red-500 text-xs mt-1">Selecione uma tag para o conteúdo</p>
      )}
    </div>
  );
}
