"use client";

import { useState, useEffect } from "react";
import { Input } from "./input";

interface DurationInputProps {
  value: number; // Duração em segundos
  onChange: (seconds: number) => void;
  className?: string;
  placeholder?: string;
  required?: boolean;
}

export function DurationInput({
  value,
  onChange,
  className = "",
  placeholder = "Ex: 5:30 ou 330",
  required = false,
}: DurationInputProps) {
  const [displayValue, setDisplayValue] = useState("");

  useEffect(() => {
    if (value > 0) {
      const minutes = Math.floor(value / 60);
      const seconds = value % 60;
      setDisplayValue(`${minutes}:${seconds.toString().padStart(2, "0")}`);
    } else {
      setDisplayValue("");
    }
  }, [value]);

  const handleChange = (inputValue: string) => {
    setDisplayValue(inputValue);

    // Permite diferentes formatos de entrada
    let seconds = 0;

    if (inputValue.includes(":")) {
      // Formato MM:SS
      const parts = inputValue.split(":");
      if (parts.length === 2) {
        const minutes = parseInt(parts[0]) || 0;
        const secs = parseInt(parts[1]) || 0;
        seconds = minutes * 60 + secs;
      }
    } else {
      // Formato apenas números (segundos)
      seconds = parseInt(inputValue) || 0;
    }

    onChange(seconds);
  };

  const formatHint = () => {
    if (!displayValue) return "";
    
    if (value > 0) {
      const minutes = Math.floor(value / 60);
      const secs = value % 60;
      return `${minutes}min ${secs}s (${value} segundos)`;
    }
    
    return "";
  };

  return (
    <div className="space-y-1">
      <Input
        value={displayValue}
        onChange={(e) => handleChange(e.target.value)}
        placeholder={placeholder}
        className={className}
        required={required}
      />
      {formatHint() && (
        <p className="text-xs text-gray-500">{formatHint()}</p>
      )}
    </div>
  );
}
