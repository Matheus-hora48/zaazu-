import {
  collection,
  doc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  limit,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL, getStorage } from "firebase/storage";
import { db, storage, isFirebaseConfigured } from "@/lib/firebase";
import { Video, Game, Activity, User, Avatar, DailyTimeLimit, Achievement, VideoSeries } from "@/lib/types";

// Helper function to check Firebase availability
const checkFirebase = () => {
  if (!isFirebaseConfigured || !db) {
    console.warn("Firebase não está configurado - usando modo demo");
    return false;
  }
  return true;
};

// Helper function to check Firebase Storage
const checkStorage = () => {
  if (!storage) {
    console.warn("Firebase Storage não está configurado");
    return false;
  }
  return true;
};

// Video Services
export const videoService = {
  async getAll(): Promise<Video[]> {
    try {
      if (!checkFirebase()) return [];

      const videosRef = collection(db!, "videos");
      const q = query(videosRef, orderBy("createdAt", "desc"));
      const snapshot = await getDocs(q);

      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date(),
      })) as Video[];
    } catch (error) {
      console.error("Error fetching videos:", error);
      return [];
    }
  },

  async create(
    videoData: Omit<Video, "id" | "createdAt" | "updatedAt">
  ): Promise<string> {
    try {
      if (!checkFirebase()) {
        throw new Error("Firebase não está configurado");
      }

      const videosRef = collection(db!, "videos");
      const docRef = doc(videosRef);
      await setDoc(docRef, {
        ...videoData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      return docRef.id;
    } catch (error) {
      console.error("Error creating video:", error);
      throw error;
    }
  },

  async update(id: string, videoData: Partial<Video>): Promise<void> {
    try {
      if (!checkFirebase()) {
        throw new Error("Firebase não está configurado");
      }

      const docRef = doc(db!, "videos", id);
      await updateDoc(docRef, {
        ...videoData,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error("Error updating video:", error);
      throw error;
    }
  },

  async delete(id: string): Promise<void> {
    try {
      if (!checkFirebase()) {
        throw new Error("Firebase não está configurado");
      }

      const docRef = doc(db!, "videos", id);
      await deleteDoc(docRef);
    } catch (error) {
      console.error("Error deleting video:", error);
      throw error;
    }
  },

  async uploadThumbnail(videoId: string, file: File): Promise<string> {
    try {
      if (!checkFirebase() || !checkStorage()) {
        throw new Error("Firebase Storage não está configurado");
      }

      const storageRef = ref(storage!, `videos/thumbnails/${videoId}`);
      await uploadBytes(storageRef, file);
      return await getDownloadURL(storageRef);
    } catch (error) {
      console.error("Error uploading thumbnail:", error);
      throw error;
    }
  },

  // Funções para gerenciamento de séries
  async getAllSeries(): Promise<VideoSeries[]> {
    try {
      if (!checkFirebase()) return [];

      const videos = await this.getAll();
      const seriesMap = new Map<string, VideoSeries>();

      videos.forEach((video) => {
        if (video.seriesId && video.seriesTitle) {
          if (!seriesMap.has(video.seriesId)) {
            seriesMap.set(video.seriesId, {
              seriesId: video.seriesId,
              seriesTitle: video.seriesTitle,
              totalEpisodes: 0,
              seasons: {},
              thumbnail: video.thumbnail,
              tag: video.tag,
              category: video.category,
              minAge: video.minAge,
            });
          }

          const series = seriesMap.get(video.seriesId)!;
          const season = video.seasonNumber || 1;
          
          if (!series.seasons[season]) {
            series.seasons[season] = [];
          }
          
          series.seasons[season].push(video);
          series.totalEpisodes++;
        }
      });

      // Ordenar episódios por número dentro de cada temporada
      seriesMap.forEach((series) => {
        Object.keys(series.seasons).forEach((seasonKey) => {
          const seasonNum = parseInt(seasonKey);
          series.seasons[seasonNum].sort((a: Video, b: Video) => 
            (a.episodeNumber || 0) - (b.episodeNumber || 0)
          );
        });
      });

      return Array.from(seriesMap.values());
    } catch (error) {
      console.error("Error fetching series:", error);
      return [];
    }
  },

  async getVideosBySeries(seriesId: string): Promise<Video[]> {
    try {
      if (!checkFirebase()) return [];

      const videosRef = collection(db!, "videos");
      const q = query(
        videosRef,
        where("seriesId", "==", seriesId),
        orderBy("seasonNumber", "asc"),
        orderBy("episodeNumber", "asc")
      );
      const snapshot = await getDocs(q);

      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date(),
      })) as Video[];
    } catch (error) {
      console.error("Error fetching videos by series:", error);
      return [];
    }
  },

  async getNextEpisodeNumber(seriesId: string, seasonNumber: number = 1): Promise<number> {
    try {
      if (!checkFirebase()) return 1;

      const videosRef = collection(db!, "videos");
      const q = query(
        videosRef,
        where("seriesId", "==", seriesId),
        where("seasonNumber", "==", seasonNumber),
        orderBy("episodeNumber", "desc"),
        limit(1)
      );
      const snapshot = await getDocs(q);

      if (snapshot.empty) return 1;
      
      const lastEpisode = snapshot.docs[0].data() as Video;
      return (lastEpisode.episodeNumber || 0) + 1;
    } catch (error) {
      console.error("Error getting next episode number:", error);
      return 1;
    }
  },

  async getExistingSeriesTitles(): Promise<string[]> {
    try {
      if (!checkFirebase()) return [];

      const videosRef = collection(db!, "videos");
      const q = query(videosRef);
      const snapshot = await getDocs(q);

      const seriesTitles = new Set<string>();
      snapshot.docs.forEach((doc) => {
        const video = doc.data() as Video;
        if (video.seriesTitle) {
          seriesTitles.add(video.seriesTitle);
        }
      });

      return Array.from(seriesTitles).sort();
    } catch (error) {
      console.error("Error fetching existing series titles:", error);
      return [];
    }
  },
};

// Game Services
export const gameService = {
  async getAll(): Promise<Game[]> {
    try {
      if (!checkFirebase()) return [];

      const gamesRef = collection(db!, "games");
      const q = query(gamesRef, orderBy("createdAt", "desc"));
      const snapshot = await getDocs(q);

      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date(),
      })) as Game[];
    } catch (error) {
      console.error("Error fetching games:", error);
      return [];
    }
  },

  async create(
    gameData: Omit<Game, "id" | "createdAt" | "updatedAt">
  ): Promise<string> {
    try {
      if (!checkFirebase()) {
        throw new Error("Firebase não está configurado");
      }

      const gamesRef = collection(db!, "games");
      const docRef = doc(gamesRef);
      await setDoc(docRef, {
        ...gameData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      return docRef.id;
    } catch (error) {
      console.error("Error creating game:", error);
      throw error;
    }
  },

  async update(id: string, gameData: Partial<Game>): Promise<void> {
    try {
      if (!checkFirebase()) {
        throw new Error("Firebase não está configurado");
      }

      const docRef = doc(db!, "games", id);
      await updateDoc(docRef, {
        ...gameData,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error("Error updating game:", error);
      throw error;
    }
  },

  async delete(id: string): Promise<void> {
    try {
      if (!checkFirebase()) {
        throw new Error("Firebase não está configurado");
      }

      const docRef = doc(db!, "games", id);
      await deleteDoc(docRef);
    } catch (error) {
      console.error("Error deleting game:", error);
      throw error;
    }
  },

  async uploadThumbnail(gameId: string, file: File): Promise<string> {
    try {
      if (!checkFirebase() || !checkStorage()) {
        throw new Error("Firebase Storage não está configurado");
      }

      const storageRef = ref(storage!, `games/thumbnails/${gameId}`);
      await uploadBytes(storageRef, file);
      return await getDownloadURL(storageRef);
    } catch (error) {
      console.error("Error uploading game thumbnail:", error);
      throw error;
    }
  },
};

// Activity Services
export const activityService = {
  async getAll(): Promise<Activity[]> {
    try {
      if (!checkFirebase()) return [];

      const activitiesRef = collection(db!, "activities");
      const q = query(activitiesRef, orderBy("createdAt", "desc"));
      const snapshot = await getDocs(q);

      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date(),
      })) as Activity[];
    } catch (error) {
      console.error("Error fetching activities:", error);
      return [];
    }
  },

  async create(
    activityData: Omit<Activity, "id" | "createdAt" | "updatedAt">
  ): Promise<string> {
    try {
      if (!checkFirebase()) {
        throw new Error("Firebase não está configurado");
      }

      const activitiesRef = collection(db!, "activities");
      const docRef = doc(activitiesRef);
      await setDoc(docRef, {
        ...activityData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      return docRef.id;
    } catch (error) {
      console.error("Error creating activity:", error);
      throw error;
    }
  },

  async update(id: string, activityData: Partial<Activity>): Promise<void> {
    try {
      if (!checkFirebase()) {
        throw new Error("Firebase não está configurado");
      }

      const docRef = doc(db!, "activities", id);
      await updateDoc(docRef, {
        ...activityData,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error("Error updating activity:", error);
      throw error;
    }
  },

  async delete(id: string): Promise<void> {
    try {
      if (!checkFirebase()) {
        throw new Error("Firebase não está configurado");
      }

      const docRef = doc(db!, "activities", id);
      await deleteDoc(docRef);
    } catch (error) {
      console.error("Error deleting activity:", error);
      throw error;
    }
  },

  async uploadThumbnail(activityId: string, file: File): Promise<string> {
    try {
      if (!checkFirebase() || !checkStorage()) {
        throw new Error("Firebase Storage não está configurado");
      }

      const storageRef = ref(storage!, `activities/thumbnails/${activityId}`);
      await uploadBytes(storageRef, file);
      return await getDownloadURL(storageRef);
    } catch (error) {
      console.error("Error uploading activity thumbnail:", error);
      throw error;
    }
  },
};

// User Services
export const userService = {
  async getAll(): Promise<User[]> {
    try {
      if (!checkFirebase()) return [];

      const usersRef = collection(db!, "users");
      const q = query(usersRef, orderBy("createdAt", "desc"));
      const snapshot = await getDocs(q);

      return snapshot.docs.map(
        (doc) =>
          ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate() || new Date(),
            updatedAt: doc.data().updatedAt?.toDate() || new Date(),
          } as unknown)
      ) as User[];
    } catch (error) {
      console.error("Error fetching users:", error);
      return [];
    }
  },

  async create(
    userData: Omit<User, "id" | "createdAt" | "updatedAt">
  ): Promise<string> {
    try {
      if (!checkFirebase()) {
        throw new Error("Firebase não está configurado");
      }

      const usersRef = collection(db!, "users");
      const docRef = doc(usersRef);
      await setDoc(docRef, {
        ...userData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      return docRef.id;
    } catch (error) {
      console.error("Error creating user:", error);
      throw error;
    }
  },

  async update(userId: string, userData: Partial<User>): Promise<void> {
    try {
      if (!checkFirebase()) {
        throw new Error("Firebase não está configurado");
      }

      const docRef = doc(db!, "users", userId);
      await updateDoc(docRef, {
        ...userData,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error("Error updating user:", error);
      throw error;
    }
  },

  async delete(userId: string): Promise<void> {
    try {
      if (!checkFirebase()) {
        throw new Error("Firebase não está configurado");
      }

      const docRef = doc(db!, "users", userId);
      await deleteDoc(docRef);
    } catch (error) {
      console.error("Error deleting user:", error);
      throw error;
    }
  },
};

// Avatar Services
export const avatarService = {
  async getAll(): Promise<Avatar[]> {
    try {
      if (!checkFirebase()) return [];

      const avatarsRef = collection(db!, "avatars");
      const q = query(avatarsRef, orderBy("createdAt", "desc"));
      const snapshot = await getDocs(q);

      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
      })) as Avatar[];
    } catch (error) {
      console.error("Error fetching avatars:", error);
      return [];
    }
  },

  async create(avatarData: Omit<Avatar, "id" | "createdAt">): Promise<string> {
    try {
      if (!checkFirebase()) {
        throw new Error("Firebase não está configurado");
      }

      const docRef = doc(collection(db!, "avatars"));
      await setDoc(docRef, {
        ...avatarData,
        createdAt: serverTimestamp(),
      });

      return docRef.id;
    } catch (error) {
      console.error("Error creating avatar:", error);
      throw error;
    }
  },

  async uploadSvg(file: File, avatarName: string): Promise<string> {
    try {
      if (!checkStorage()) {
        throw new Error("Firebase Storage não está configurado");
      }

      // Validar se é SVG
      if (!file.type.includes("svg") && !file.name.endsWith(".svg")) {
        throw new Error("O arquivo deve ser um SVG");
      }

      // Validar tamanho (máximo 500KB)
      if (file.size > 500 * 1024) {
        throw new Error("O arquivo SVG deve ter no máximo 500KB");
      }

      const fileName = `avatars/${Date.now()}_${avatarName.replace(/[^a-zA-Z0-9]/g, "_")}.svg`;
      const storageRef = ref(storage!, fileName);
      
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);
      
      return downloadURL;
    } catch (error) {
      console.error("Error uploading SVG:", error);
      throw error;
    }
  },

  async update(avatarId: string, avatarData: Partial<Avatar>): Promise<void> {
    try {
      if (!checkFirebase()) {
        throw new Error("Firebase não está configurado");
      }

      const docRef = doc(db!, "avatars", avatarId);
      await updateDoc(docRef, {
        ...avatarData,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error("Error updating avatar:", error);
      throw error;
    }
  },

  async delete(avatarId: string): Promise<void> {
    try {
      if (!checkFirebase()) {
        throw new Error("Firebase não está configurado");
      }

      const docRef = doc(db!, "avatars", avatarId);
      await deleteDoc(docRef);
    } catch (error) {
      console.error("Error deleting avatar:", error);
      throw error;
    }
  },

  // Validar SVG para segurança básica
  validateSvgContent(svgContent: string): boolean {
    try {
      // Verificações básicas de segurança para SVG
      const parser = new DOMParser();
      const doc = parser.parseFromString(svgContent, "image/svg+xml");
      
      // Verificar se não há elementos perigosos
      const dangerousElements = ["script", "object", "embed", "iframe"];
      for (const tag of dangerousElements) {
        if (doc.getElementsByTagName(tag).length > 0) {
          return false;
        }
      }
      
      // Verificar se é SVG válido
      return doc.documentElement.tagName.toLowerCase() === "svg";
    } catch {
      return false;
    }
  },
};

// Daily Time Limit Service
export const dailyTimeLimitService = {
  async getAll(): Promise<DailyTimeLimit[]> {
    try {
      if (!checkFirebase()) return [];

      const limitsRef = collection(db!, "dailyTimeLimits");
      const q = query(limitsRef, orderBy("createdAt", "desc"));
      const snapshot = await getDocs(q);

      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || undefined,
      })) as DailyTimeLimit[];
    } catch (error) {
      console.error("Error fetching daily time limits:", error);
      return [];
    }
  },

  async create(limitData: Omit<DailyTimeLimit, "id" | "createdAt">): Promise<string> {
    try {
      if (!checkFirebase()) {
        throw new Error("Firebase não está configurado");
      }

      const docRef = doc(collection(db!, "dailyTimeLimits"));
      await setDoc(docRef, {
        ...limitData,
        createdAt: serverTimestamp(),
      });

      return docRef.id;
    } catch (error) {
      console.error("Error creating daily time limit:", error);
      throw error;
    }
  },

  async update(limitId: string, limitData: Partial<DailyTimeLimit>): Promise<void> {
    try {
      if (!checkFirebase()) {
        throw new Error("Firebase não está configurado");
      }

      const docRef = doc(db!, "dailyTimeLimits", limitId);
      await updateDoc(docRef, {
        ...limitData,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error("Error updating daily time limit:", error);
      throw error;
    }
  },

  async delete(limitId: string): Promise<void> {
    try {
      if (!checkFirebase()) {
        throw new Error("Firebase não está configurado");
      }

      const docRef = doc(db!, "dailyTimeLimits", limitId);
      await deleteDoc(docRef);
    } catch (error) {
      console.error("Error deleting daily time limit:", error);
      throw error;
    }
  },

  async getByAgeGroup(ageGroup: "2-6" | "7-9"): Promise<DailyTimeLimit | null> {
    try {
      if (!checkFirebase()) return null;

      const limitsRef = collection(db!, "dailyTimeLimits");
      const q = query(
        limitsRef, 
        where("ageGroup", "==", ageGroup),
        where("isActive", "==", true)
      );
      const snapshot = await getDocs(q);

      if (snapshot.empty) return null;

      const doc = snapshot.docs[0];
      return {
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || undefined,
      } as DailyTimeLimit;
    } catch (error) {
      console.error("Error fetching daily time limit by age group:", error);
      return null;
    }
  },

  async createOrUpdate(ageGroup: "2-6" | "7-9", limitData: Partial<DailyTimeLimit>): Promise<void> {
    try {
      const existing = await this.getByAgeGroup(ageGroup);
      
      if (existing) {
        await this.update(existing.id, limitData);
      } else {
        await this.create({
          ageGroup,
          entretenimentoLimit: limitData.entretenimentoLimit || 30,
          atividadeLimit: limitData.atividadeLimit || 20,
          educativoLimit: limitData.educativoLimit || 15,
          rewardType: limitData.rewardType || "medalha",
          rewardTitle: limitData.rewardTitle || "Explorador do Dia",
          isActive: true,
          updatedAt: new Date(),
        });
      }
    } catch (error) {
      console.error("Error creating or updating daily time limit:", error);
      throw error;
    }
  },
};

// Achievement Templates - Conquistas pré-definidas para gamificação
export const achievementTemplates = [
  // 🎯 ENGAJAMENTO - Conquistas que incentivam uso do app
  {
    type: "time_spent" as const,
    title: "Explorador do Tempo",
    descriptionTemplate: "Passou {targetValue} minutos explorando o app",
    defaultIcon: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>`,
    suggestedTargets: [30, 60, 120, 300, 600], // 30min, 1h, 2h, 5h, 10h
    category: "engagement" as const,
  },
  {
    type: "activities_completed" as const,
    title: "Colecionador de Atividades",
    descriptionTemplate: "Completou {targetValue} atividades incríveis",
    defaultIcon: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/></svg>`,
    suggestedTargets: [5, 15, 30, 50, 100],
    category: "engagement" as const,
  },
  {
    type: "streak_days" as const,
    title: "Aprendiz Consistente",
    descriptionTemplate: "Usou o app por {targetValue} dias seguidos",
    defaultIcon: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M9 11H7v6h2v-6zm4 0h-2v6h2v-6zm4 0h-2v6h2v-6zm2-7h-1V2h-2v2H8V2H6v2H5c-1.1 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11z"/></svg>`,
    suggestedTargets: [3, 7, 14, 30, 100],
    category: "consistency" as const,
  },
  {
    type: "category_master" as const,
    title: "Mestre da Categoria",
    descriptionTemplate: "Dominou {targetValue} atividades de {category}",
    defaultIcon: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>`,
    suggestedTargets: [10, 25, 50, 100],
    category: "learning" as const,
  },
  {
    type: "daily_goal" as const,
    title: "Conquistador de Metas",
    descriptionTemplate: "Atingiu sua meta diária {targetValue} vezes",
    defaultIcon: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.94-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg>`,
    suggestedTargets: [5, 10, 25, 50, 100],
    category: "consistency" as const,
  },
  {
    type: "speed_learner" as const,
    title: "Aprendiz Relâmpago",
    descriptionTemplate: "Completou {targetValue} atividades em menos de 5 minutos",
    defaultIcon: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M13 1L8.5 8.5L1 9l5 5-1 7 6-3 6 3-1-7 5-5-7.5-.5L13 1z"/></svg>`,
    suggestedTargets: [5, 15, 30, 50],
    category: "mastery" as const,
  },
  {
    type: "explorer" as const,
    title: "Grande Explorador",
    descriptionTemplate: "Explorou {targetValue} tipos diferentes de conteúdo",
    defaultIcon: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.94-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg>`,
    suggestedTargets: [3, 5, 10, 15],
    category: "exploration" as const,
  },
  {
    type: "perfectionist" as const,
    title: "Perfeccionista",
    descriptionTemplate: "Acertou 100% em {targetValue} atividades",
    defaultIcon: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>`,
    suggestedTargets: [3, 10, 25, 50],
    category: "mastery" as const,
  },
];

// Achievement Service
export const achievementService = {
  async getAll(): Promise<Achievement[]> {
    try {
      if (!checkFirebase()) return [];

      const achievementsRef = collection(db!, "achievements");
      const q = query(achievementsRef, orderBy("createdAt", "desc"));
      const snapshot = await getDocs(q);

      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || undefined,
      })) as Achievement[];
    } catch (error) {
      console.error("Error fetching achievements:", error);
      return [];
    }
  },

  async create(achievementData: Omit<Achievement, "id" | "createdAt">): Promise<string> {
    try {
      if (!checkFirebase()) {
        throw new Error("Firebase não está configurado");
      }

      const docRef = doc(collection(db!, "achievements"));
      await setDoc(docRef, {
        ...achievementData,
        createdAt: serverTimestamp(),
      });

      return docRef.id;
    } catch (error) {
      console.error("Error creating achievement:", error);
      throw error;
    }
  },

  async update(achievementId: string, achievementData: Partial<Achievement>): Promise<void> {
    try {
      if (!checkFirebase()) {
        throw new Error("Firebase não está configurado");
      }

      const docRef = doc(db!, "achievements", achievementId);
      await updateDoc(docRef, {
        ...achievementData,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error("Error updating achievement:", error);
      throw error;
    }
  },

  async delete(achievementId: string): Promise<void> {
    try {
      if (!checkFirebase()) {
        throw new Error("Firebase não está configurado");
      }

      const docRef = doc(db!, "achievements", achievementId);
      await deleteDoc(docRef);
    } catch (error) {
      console.error("Error deleting achievement:", error);
      throw error;
    }
  },

  async getByType(type: Achievement["type"]): Promise<Achievement[]> {
    try {
      if (!checkFirebase()) return [];

      const achievementsRef = collection(db!, "achievements");
      const q = query(
        achievementsRef, 
        where("type", "==", type),
        where("isActive", "==", true)
      );
      const snapshot = await getDocs(q);

      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || undefined,
      })) as Achievement[];
    } catch (error) {
      console.error("Error fetching achievements by type:", error);
      return [];
    }
  },

  async uploadAchievementAudio(achievementId: string, audioFile: File): Promise<string> {
    try {
      if (!checkFirebase()) {
        throw new Error("Firebase não está configurado");
      }

      const storage = getStorage();
      const audioRef = ref(storage, `achievements/audio/${achievementId}/${audioFile.name}`);
      
      await uploadBytes(audioRef, audioFile);
      const downloadURL = await getDownloadURL(audioRef);
      
      return downloadURL;
    } catch (error) {
      console.error("Error uploading achievement audio:", error);
      throw error;
    }
  },
};
