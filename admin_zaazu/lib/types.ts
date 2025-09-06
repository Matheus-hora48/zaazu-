// Tags fixas do sistema
export type ContentTag = "entretenimento" | "atividade" | "educativo";

export interface User {
  id: string;
  email: string;
  name: string;
  role: "admin" | "user";
  createdAt: Date;
  lastLogin?: Date;
}

export interface Video {
  id: string;
  title: string;
  description: string;
  url: string;
  thumbnail: string;
  duration: number;
  category: string;
  minAge: number; // Idade mínima (2-9 anos)
  views: number;
  tag: ContentTag; // Tag fixa do sistema
  // Campos para série
  seriesId?: string; // ID da série (null para vídeos avulsos)
  seriesTitle?: string; // Título da série
  seasonNumber?: number; // Número da temporada (padrão: 1)
  episodeNumber?: number; // Número do episódio na temporada
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
}

// Interface auxiliar para agrupar vídeos por série
export interface VideoSeries {
  seriesId: string;
  seriesTitle: string;
  totalEpisodes: number;
  seasons: {
    [seasonNumber: number]: Video[];
  };
  thumbnail: string; // Thumbnail do primeiro episódio
  tag: ContentTag;
  category: string;
  minAge: number; // Idade mínima da série
}

export interface Game {
  id: string;
  title: string;
  description: string;
  url: string;
  thumbnail: string;
  category: string;
  minAge: number; // Idade mínima (2-9 anos)
  plays: number;
  type: "html5" | "embed";
  tag: ContentTag; // Tag fixa do sistema
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
}

export interface Activity {
  id: string;
  title: string;
  description: string;
  age: string; // Idade específica ou faixa
  category: string;
  difficulty: "easy" | "medium" | "hard";
  minAge: number; // Idade mínima (2-9 anos)
  tag: ContentTag; // Tag fixa do sistema
  instructionVideo: string; // URL do vídeo explicativo da atividade
  objectives: string[]; // Array de objetivos (checkboxes)
  materials: string[]; // Array de materiais necessários
  thumbnail: string;
  completions: number;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
}

export interface UserProgress {
  id: string;
  userId: string;
  contentId: string;
  contentType: "video" | "game" | "activity";
  progress: number; // percentage 0-100
  completed: boolean;
  startedAt: Date;
  completedAt?: Date;
  score?: number;
}

// Grid System Types
export type ContentType = "video" | "game" | "activity";
export type GridTag = "entretenimento" | "atividade" | "educativo";

export interface GridItem {
  id: string;
  contentId: string;
  contentType: ContentType;
  order: number;
}

export interface GridRow {
  id: string;
  title: string;
  description?: string;
  contentType?: ContentType; // undefined = conteúdo misto, definido = só esse tipo
  items: GridItem[];
  isActive: boolean;
  order: number;
  maxItems?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface HomeGrid {
  id: string;
  name: string;
  description?: string;
  tag: GridTag;
  rows: GridRow[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Content Union Type for Grid Display
export type AnyContent = Video | Game | Activity;

export interface Avatar {
  id: string;
  name: string;
  svgUrl: string;
  fileName: string;
  size: number; // tamanho do arquivo em bytes
  createdAt: Date;
  isActive: boolean;
  category?: "masculino" | "feminino" | "neutro" | "outros";
  tags?: string[]; // tags para categorização adicional
}

export interface Achievement {
  id: string;
  type: "time_spent" | "activities_completed" | "streak_days" | "category_master" | "daily_goal" | "speed_learner" | "explorer" | "perfectionist";
  name: string;
  description: string;
  svgIcon: string; // Conteúdo SVG ou URL para o ícone
  audioFile?: string; // URL do arquivo de áudio de comemoração
  targetValue: number; // Quantidade necessária para conquistar
  category?: ContentTag; // Para conquistas específicas de categoria
  rarity: "bronze" | "silver" | "gold" | "diamond" | "legendary";
  points: number; // Pontos que a criança ganha ao conquistar
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Tipos pré-definidos de conquistas com suas configurações
export interface AchievementTemplate {
  type: Achievement["type"];
  title: string;
  descriptionTemplate: string; // Ex: "Complete {targetValue} atividades"
  defaultIcon: string;
  suggestedTargets: number[];
  category: "engagement" | "learning" | "consistency" | "mastery";
}

export interface DailyTimeLimit {
  id: string;
  ageGroup: "2-6" | "7-9";
  entretenimentoLimit: number; // minutos permitidos por dia
  atividadeLimit: number; // minutos permitidos por dia
  educativoLimit: number; // minutos permitidos por dia
  rewardType: "medalha" | "tempo_extra" | "novo_avatar" | "badge_especial";
  rewardTitle: string; // nome do prêmio (ex: "Explorador do Dia")
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
