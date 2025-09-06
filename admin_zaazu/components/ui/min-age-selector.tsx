import React from 'react';

interface MinAgeSelectorProps {
  value: number;
  onChange: (age: number) => void;
  required?: boolean;
  className?: string;
}

export function MinAgeSelector({ 
  value, 
  onChange, 
  required = false, 
  className = "" 
}: MinAgeSelectorProps) {
  const ages = [2, 3, 4, 5, 6, 7, 8, 9];

  return (
    <div className="space-y-2">
      <label className="block text-sm font-bold text-gray-800 mb-2">
        Idade Mínima {required && "*"}
      </label>
      <select
        value={value || ""}
        onChange={(e) => onChange(parseInt(e.target.value) || 2)}
        className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 ${className}`}
        required={required}
      >
        <option value="">Selecione a idade mínima</option>
        {ages.map((age) => (
          <option key={age} value={age}>
            {age} {age === 1 ? 'ano' : 'anos'}
          </option>
        ))}
      </select>
      <p className="text-xs text-gray-500">
        Crianças com esta idade ou mais poderão acessar este conteúdo
      </p>
    </div>
  );
}
