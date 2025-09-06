'use client';

import { useState, useEffect } from 'react';
import { X, Upload, Play, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { achievementService, achievementTemplates } from '@/lib/services';
import { Achievement, ContentTag } from '@/lib/types';

interface AddAchievementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const RARITY_OPTIONS = [
  { value: 'bronze', label: 'Bronze', icon: '🥉' },
  { value: 'silver', label: 'Prata', icon: '🥈' },
  { value: 'gold', label: 'Ouro', icon: '🥇' },
  { value: 'diamond', label: 'Diamante', icon: '💎' }
] as const;

const CATEGORY_OPTIONS = [
  { value: undefined, label: 'Geral', icon: '🎯' },
  { value: 'entretenimento', label: 'Entretenimento', icon: '🎪' },
  { value: 'educativo', label: 'Educativo', icon: '🎓' },
  { value: 'atividade', label: 'Atividade', icon: '📝' }
] as const;

export default function AddAchievementModal({ isOpen, onClose, onSuccess }: AddAchievementModalProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    targetValue: 1,
    points: 10,
    category: undefined as ContentTag | undefined,
    rarity: 'bronze' as Achievement['rarity'],
    svgIcon: '',
    audioFile: '',
    isActive: true
  });
  const [svgFile, setSvgFile] = useState<File | null>(null);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [previewAudio, setPreviewAudio] = useState<string>('');

  useEffect(() => {
    if (selectedTemplate) {
      const template = achievementTemplates.find(t => t.type === selectedTemplate);
      if (template) {
        const pointsByRarity = { bronze: 10, silver: 25, gold: 50, diamond: 100, legendary: 200 };
        setFormData({
          name: template.title,
          description: template.descriptionTemplate.replace('{targetValue}', '1').replace('{category}', 'geral'),
          targetValue: template.suggestedTargets[0],
          points: pointsByRarity.bronze,
          category: undefined,
          rarity: 'bronze',
          svgIcon: '',
          audioFile: '',
          isActive: true
        });
      }
    }
  }, [selectedTemplate]);

  const handleSvgUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === 'image/svg+xml') {
      setSvgFile(file);
    } else {
      alert('Por favor, selecione um arquivo SVG válido.');
    }
  };

  const handleAudioUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && (file.type.startsWith('audio/') || file.name.endsWith('.mp3') || file.name.endsWith('.wav'))) {
      setAudioFile(file);
      const url = URL.createObjectURL(file);
      setPreviewAudio(url);
    } else {
      alert('Por favor, selecione um arquivo de áudio válido (MP3 ou WAV).');
    }
  };

  const playPreview = () => {
    if (previewAudio) {
      const audio = new Audio(previewAudio);
      audio.play().catch(console.error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.description.trim()) {
      alert('Nome e descrição são obrigatórios.');
      return;
    }

    setIsLoading(true);

    try {
      const template = selectedTemplate ? achievementTemplates.find(t => t.type === selectedTemplate) : null;
      
      const achievementData: Omit<Achievement, 'id' | 'createdAt'> = {
        type: (template?.type || 'time_spent') as Achievement['type'],
        name: formData.name,
        description: formData.description,
        targetValue: formData.targetValue,
        points: formData.points,
        category: formData.category,
        rarity: formData.rarity,
        svgIcon: '',
        audioFile: '',
        isActive: formData.isActive,
        updatedAt: new Date()
      };

      const achievementId = await achievementService.create(achievementData);

      if (svgFile) {
        const svgUrl = await achievementService.uploadAchievementAudio(achievementId, svgFile);
        await achievementService.update(achievementId, { svgIcon: svgUrl });
      }

      if (audioFile) {
        const audioUrl = await achievementService.uploadAchievementAudio(achievementId, audioFile);
        await achievementService.update(achievementId, { audioFile: audioUrl });
      }

      onSuccess();
      onClose();
      resetForm();
    } catch (error) {
      console.error('Erro ao criar conquista:', error);
      alert('Erro ao criar conquista. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setSelectedTemplate('');
    setFormData({
      name: '',
      description: '',
      targetValue: 1,
      points: 10,
      category: undefined,
      rarity: 'bronze',
      svgIcon: '',
      audioFile: '',
      isActive: true
    });
    setSvgFile(null);
    setAudioFile(null);
    setPreviewAudio('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Award className="w-5 h-5 text-yellow-500" />
            Adicionar Nova Conquista
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Seleção de Template */}
          <div>
            <Label htmlFor="template">Template de Conquista (Opcional)</Label>
            <select
              id="template"
              value={selectedTemplate}
              onChange={(e) => setSelectedTemplate(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Criar conquista personalizada</option>
              {achievementTemplates.map((template) => (
                <option key={template.type} value={template.type}>
                  {template.title} - {template.descriptionTemplate}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Nome */}
            <div>
              <Label htmlFor="name">Nome da Conquista *</Label>
              <Input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ex: Primeiro Dia de Aventura"
                required
              />
            </div>

            {/* Valor Alvo */}
            <div>
              <Label htmlFor="targetValue">Valor Alvo</Label>
              <Input
                id="targetValue"
                type="number"
                min="1"
                value={formData.targetValue}
                onChange={(e) => setFormData({ ...formData, targetValue: parseInt(e.target.value) })}
                placeholder="1"
              />
            </div>

            {/* Pontos */}
            <div>
              <Label htmlFor="points">Pontos</Label>
              <Input
                id="points"
                type="number"
                min="1"
                value={formData.points}
                onChange={(e) => setFormData({ ...formData, points: parseInt(e.target.value) })}
                placeholder="10"
              />
            </div>
          </div>

          {/* Descrição */}
          <div>
            <Label htmlFor="description">Descrição *</Label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Descreva como conquistar esta medalha..."
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Categoria */}
            <div>
              <Label htmlFor="category">Categoria</Label>
              <select
                id="category"
                value={formData.category || ''}
                onChange={(e) => setFormData({ ...formData, category: e.target.value as ContentTag || undefined })}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {CATEGORY_OPTIONS.map((option) => (
                  <option key={option.value || 'geral'} value={option.value || ''}>
                    {option.icon} {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Raridade */}
            <div>
              <Label htmlFor="rarity">Raridade</Label>
              <select
                id="rarity"
                value={formData.rarity}
                onChange={(e) => setFormData({ ...formData, rarity: e.target.value as Achievement['rarity'] })}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {RARITY_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.icon} {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Upload de Ícone SVG */}
          <div>
            <Label htmlFor="svgIcon">Ícone SVG</Label>
            <div className="flex items-center gap-2">
              <input
                id="svgIcon"
                type="file"
                accept=".svg,image/svg+xml"
                onChange={handleSvgUpload}
                className="flex-1 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <Upload className="w-4 h-4 text-gray-400" />
            </div>
            {svgFile && (
              <p className="text-sm text-green-600 mt-1">
                ✓ {svgFile.name} selecionado
              </p>
            )}
          </div>

          {/* Upload de Áudio */}
          <div>
            <Label htmlFor="audioFile">Som de Conquista</Label>
            <div className="flex items-center gap-2">
              <input
                id="audioFile"
                type="file"
                accept=".mp3,.wav,audio/*"
                onChange={handleAudioUpload}
                className="flex-1 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <Upload className="w-4 h-4 text-gray-400" />
              {previewAudio && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={playPreview}
                  className="px-2"
                >
                  <Play className="w-4 h-4" />
                </Button>
              )}
            </div>
            {audioFile && (
              <p className="text-sm text-green-600 mt-1">
                ✓ {audioFile.name} selecionado
              </p>
            )}
          </div>

          {/* Status */}
          <div className="flex items-center gap-2">
            <input
              id="isActive"
              type="checkbox"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
            />
            <Label htmlFor="isActive">Conquista ativa (visível para usuários)</Label>
          </div>

          {/* Botões */}
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Criando...' : 'Criar Conquista'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
