"use client";

import { useState, KeyboardEvent } from "react";
import { X, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface TagsInputProps {
  tags: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
  maxTags?: number;
}

export function TagsInput({
  tags,
  onChange,
  placeholder = "Adicionar tag...",
  maxTags = 10,
}: TagsInputProps) {
  const [inputValue, setInputValue] = useState("");

  const addTag = () => {
    const trimmedValue = inputValue.trim();
    if (trimmedValue && !tags.includes(trimmedValue) && tags.length < maxTags) {
      onChange([...tags, trimmedValue]);
      setInputValue("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    onChange(tags.filter((tag) => tag !== tagToRemove));
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addTag();
    } else if (e.key === "Backspace" && !inputValue && tags.length > 0) {
      removeTag(tags[tags.length - 1]);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center space-x-2">
        <Input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="flex-1"
          disabled={tags.length >= maxTags}
        />
        <Button
          type="button"
          onClick={addTag}
          disabled={!inputValue.trim() || tags.length >= maxTags}
          size="sm"
          variant="outline"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {tags.map((tag, index) => (
            <span
              key={index}
              className="inline-flex items-center px-2 py-1 rounded-full text-sm bg-blue-100 text-blue-800 border"
            >
              {tag}
              <button
                type="button"
                onClick={() => removeTag(tag)}
                className="ml-1 hover:text-blue-600"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      {tags.length >= maxTags && (
        <p className="text-sm text-gray-500">
          Máximo de {maxTags} tags atingido
        </p>
      )}
    </div>
  );
}
