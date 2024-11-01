import { Injectable } from '@angular/core';

interface DeveloperCache {
  projects: any[];
  tasks: any[];
  upcomingMeetings: any[];
  pastMeetings: any[];
  messages: { [conversationId: string]: any[] };
  lastUpdated: Date;
}

@Injectable({
  providedIn: 'root'
})
export class CacheService {
  private cache: Map<string, DeveloperCache> = new Map();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds

  constructor() {}

  setCachedDeveloperData(developerId: string, data: Partial<DeveloperCache>): void {
    const existingCache = this.cache.get(developerId) || {
      projects: [],
      tasks: [],
      upcomingMeetings: [],
      pastMeetings: [],
      messages: {},
      lastUpdated: new Date()
    };

    this.cache.set(developerId, {
      ...existingCache,
      ...data,
      lastUpdated: new Date()
    });
  }

  getCachedDeveloperData(developerId: string): DeveloperCache | null {
    const cachedData = this.cache.get(developerId);
    
    if (!cachedData) return null;

    // Check if cache is still valid
    const now = new Date();
    if (now.getTime() - cachedData.lastUpdated.getTime() > this.CACHE_DURATION) {
      this.cache.delete(developerId);
      return null;
    }

    return cachedData;
  }

  clearCache(): void {
    this.cache.clear();
  }

  removeDeveloperCache(developerId: string): void {
    this.cache.delete(developerId);
  }

  updateCacheAfterApiCall(developerId: string, dataType: keyof DeveloperCache, newData: any[]): void {
    const existingCache = this.getCachedDeveloperData(developerId);
    if (existingCache) {
      this.setCachedDeveloperData(developerId, {
        ...existingCache,
        [dataType]: newData
      });
    }
  }

  setCachedMessages(userId: string, conversationId: string, messages: any[]): void {
    const existingCache = this.getCachedDeveloperData(userId) || {
      projects: [],
      tasks: [],
      upcomingMeetings: [],
      pastMeetings: [],
      messages: {},
      lastUpdated: new Date()
    };

    this.cache.set(userId, {
      ...existingCache,
      messages: {
        ...existingCache.messages,
        [conversationId]: messages
      },
      lastUpdated: new Date()
    });
  }

  getCachedMessages(userId: string, conversationId: string): any[] | null {
    const cachedData = this.getCachedDeveloperData(userId);
    if (!cachedData || !cachedData.messages[conversationId]) return null;
    return cachedData.messages[conversationId];
  }

  clearMessageCache(userId: string): void {
    const cachedData = this.getCachedDeveloperData(userId);
    if (cachedData) {
      cachedData.messages = {};
      this.cache.set(userId, cachedData);
    }
  }
} 