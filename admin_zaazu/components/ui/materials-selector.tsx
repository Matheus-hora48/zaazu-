"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Package, X } from "lucide-react";

interface MaterialsSelectorProps {
  selectedMaterials: string[];
  onChange: (materials: string[]) => void;
}

const DEFAULT_MATERIALS = [
  "tesoura",
  "lapis",
  "borracha", 
  "regua",
  "papel",
  "clip",
  "caneta",
  "marca texto"
];

export function MaterialsSelector({ selectedMaterials, onChange }: MaterialsSelectorProps) {
  const [customMaterial, setCustomMaterial] = useState("");
  const [customMaterials, setCustomMaterials] = useState<string[]>([]);

  const toggleMaterial = (material: string) => {
    if (selectedMaterials.includes(material)) {
      onChange(selectedMaterials.filter(m => m !== material));
    } else {
      onChange([...selectedMaterials, material]);
    }
  };

  const addCustomMaterial = () => {
    const material = customMaterial.trim().toLowerCase();
    if (material && !DEFAULT_MATERIALS.includes(material) && !customMaterials.includes(material)) {
      const newCustomMaterials = [...customMaterials, material];
      setCustomMaterials(newCustomMaterials);
      setCustomMaterial("");
      // Adicionar automaticamente à seleção
      onChange([...selectedMaterials, material]);
    }
  };

  const removeCustomMaterial = (material: string) => {
    setCustomMaterials(customMaterials.filter(m => m !== material));
    onChange(selectedMaterials.filter(m => m !== material));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addCustomMaterial();
    }
  };

  const allMaterials = [...DEFAULT_MATERIALS, ...customMaterials];

  return (
    <div className="space-y-4">
      <div className="flex items-center mb-3">
        <Package className="h-5 w-5 text-blue-600 mr-2" />
        <span className="text-sm font-bold text-gray-800">Materiais Necessários</span>
      </div>

      {/* Grid de materiais padrão */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {allMaterials.map((material) => (
          <div key={material} className="flex items-center relative">
            <label className="flex items-center space-x-2 cursor-pointer p-2 border rounded-lg hover:bg-gray-50 w-full">
              <input
                type="checkbox"
                checked={selectedMaterials.includes(material)}
                onChange={() => toggleMaterial(material)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700 capitalize flex-1">{material}</span>
            </label>
            
            {/* Botão de remover para materiais customizados */}
            {customMaterials.includes(material) && (
              <Button
                type="button"
                onClick={() => removeCustomMaterial(material)}
                variant="ghost"
                size="sm"
                className="absolute -top-1 -right-1 h-5 w-5 p-0 text-red-500 hover:text-red-700 bg-white border border-red-200 rounded-full"
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>
        ))}
      </div>

      {/* Input para adicionar material customizado */}
      <div className="border-t pt-3">
        <div className="flex gap-2">
          <Input
            value={customMaterial}
            onChange={(e) => setCustomMaterial(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Adicionar novo material..."
            className="flex-1 text-gray-900"
          />
          <Button
            type="button"
            onClick={addCustomMaterial}
            variant="outline"
            size="sm"
            disabled={!customMaterial.trim()}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-xs text-gray-500 mt-1">
          Digite o nome do material e pressione Enter ou clique no botão +
        </p>
      </div>

      {/* Lista de materiais selecionados */}
      {selectedMaterials.length > 0 && (
        <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
          <p className="text-sm font-medium text-blue-800 mb-2">
            Materiais selecionados ({selectedMaterials.length}):
          </p>
          <div className="flex flex-wrap gap-1">
            {selectedMaterials.map((material) => (
              <span
                key={material}
                className="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full"
              >
                {material}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
