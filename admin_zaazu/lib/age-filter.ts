/**
 * Utilitários para filtragem de conteúdo por idade mínima
 */

import { Video, Game, Activity } from "@/lib/types";

/**
 * Filtra conteúdo baseado na idade da criança
 * @param content Array de conteúdo (vídeos, jogos ou atividades)
 * @param childAge Idade da criança
 * @returns Conteúdo filtrado que a criança pode acessar
 */
export function filterContentByAge<T extends { minAge: number }>(
  content: T[],
  childAge: number
): T[] {
  return content.filter(item => item.minAge <= childAge);
}

/**
 * Filtra vídeos por idade mínima
 */
export function filterVideosByAge(videos: Video[], childAge: number): Video[] {
  return filterContentByAge(videos, childAge);
}

/**
 * Filtra jogos por idade mínima
 */
export function filterGamesByAge(games: Game[], childAge: number): Game[] {
  return filterContentByAge(games, childAge);
}

/**
 * Filtra atividades por idade mínima
 */
export function filterActivitiesByAge(activities: Activity[], childAge: number): Activity[] {
  return filterContentByAge(activities, childAge);
}

/**
 * Exemplo de uso em um componente:
 * 
 * const childAge = 7; // Criança de 7 anos
 * const availableVideos = filterVideosByAge(allVideos, childAge);
 * const availableGames = filterGamesByAge(allGames, childAge);
 * const availableActivities = filterActivitiesByAge(allActivities, childAge);
 * 
 * // Agora só aparecem conteúdos com minAge <= 7
 */
