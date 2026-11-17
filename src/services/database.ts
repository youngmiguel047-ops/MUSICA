import { DEFAULT_USER_AVATAR, SEED_ALBUMS, SEED_PROFILES, SEED_TRACKS } from '../data/seedCatalog';
import {
  Album,
  PublishAlbumPayload,
  PublishTrackPayload,
  Track,
  UserProfile,
} from '../types/music';

/**
 * Couche d'abstraction de base de données.
 * L'interface MusicDatabaseRepository permet de remplacer LocalStorageRepository
 * par un adaptateur Supabase (PostgreSQL + Storage) ou Firebase (Firestore + Storage)
 * sans modifier les composants UI.
 */
export interface MusicDatabaseRepository {
  getTracks(): Promise<Track[]>;
  getAlbums(): Promise<Album[]>;
  publishTrack(payload: PublishTrackPayload, user: UserProfile): Promise<Track>;
  publishAlbum(payload: PublishAlbumPayload, user: UserProfile): Promise<{ album: Album; tracks: Track[] }>;
  toggleLikeTrack(trackId: string, userId: string): Promise<{ likedIds: string[]; tracks: Track[] }>;
  toggleLibraryTrack(trackId: string, userId: string): Promise<string[]>;
  incrementPlayCount(trackId: string): Promise<Track[]>;
  getLikedTrackIds(userId: string): Promise<string[]>;
  getLibraryTrackIds(userId: string): Promise<string[]>;
  getDownloadedTrackIds(userId: string): Promise<string[]>;
  markTrackDownloaded(trackId: string, userId: string): Promise<string[]>;
  getCurrentUser(): Promise<UserProfile | null>;
  signInWithGoogle(): Promise<UserProfile>;
  signInWithPhone(phoneNumber: string, artistName?: string): Promise<UserProfile>;
  updateUserProfile(userId: string, updates: Partial<Pick<UserProfile, 'artistName' | 'bio' | 'avatarUrl'>>): Promise<UserProfile>;
  signOut(): Promise<void>;
}

const STORAGE_KEYS = {
  tracks: 'musica_tracks_v1',
  albums: 'musica_albums_v1',
  user: 'musica_current_user_v1',
  likedPrefix: 'musica_likes_v1_',
  libraryPrefix: 'musica_library_v1_',
  downloadedPrefix: 'musica_downloads_v1_',
};

function safeRead<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function safeWrite<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Ignore quota overflow gracefully in browser storage
  }
}

class LocalStorageMusicRepository implements MusicDatabaseRepository {
  private ensureSeeded() {
    const existingTracks = safeRead<Track[] | null>(STORAGE_KEYS.tracks, null);
    if (!existingTracks || existingTracks.length === 0) {
      safeWrite(STORAGE_KEYS.tracks, SEED_TRACKS);
    }
    const existingAlbums = safeRead<Album[] | null>(STORAGE_KEYS.albums, null);
    if (!existingAlbums || existingAlbums.length === 0) {
      safeWrite(STORAGE_KEYS.albums, SEED_ALBUMS);
    }
  }

  async getTracks(): Promise<Track[]> {
    this.ensureSeeded();
    return safeRead<Track[]>(STORAGE_KEYS.tracks, SEED_TRACKS);
  }

  async getAlbums(): Promise<Album[]> {
    this.ensureSeeded();
    return safeRead<Album[]>(STORAGE_KEYS.albums, SEED_ALBUMS);
  }

  async publishTrack(payload: PublishTrackPayload, user: UserProfile): Promise<Track> {
    const tracks = await this.getTracks();
    const newTrack: Track = {
      id: `track-${Date.now()}`,
      title: payload.title.trim(),
      artistName: payload.artistName.trim() || user.artistName,
      artistId: user.id,
      genre: payload.genre,
      description: payload.description.trim(),
      lyrics: payload.lyrics.trim(),
      coverUrl: payload.coverUrl,
      audioUrl: payload.audioUrl,
      durationSec: payload.durationSec,
      plays: 0,
      likes: 0,
      createdAt: new Date().toISOString(),
    };
    const updated = [newTrack, ...tracks];
    safeWrite(STORAGE_KEYS.tracks, updated);
    return newTrack;
  }

  async publishAlbum(
    payload: PublishAlbumPayload,
    user: UserProfile
  ): Promise<{ album: Album; tracks: Track[] }> {
    const existingTracks = await this.getTracks();
    const existingAlbums = await this.getAlbums();
    const albumId = `album-${Date.now()}`;
    const createdAt = new Date().toISOString();

    const newTracks: Track[] = payload.tracks.map((item, idx) => ({
      id: `track-${Date.now()}-${idx + 1}`,
      title: item.title.trim(),
      artistName: payload.artistName.trim() || user.artistName,
      artistId: user.id,
      genre: payload.genre,
      description: payload.description.trim(),
      lyrics: (item.lyrics || '').trim(),
      coverUrl: payload.coverUrl,
      audioUrl: item.audioUrl,
      durationSec: item.durationSec,
      albumId,
      albumTitle: payload.title.trim(),
      trackNumber: item.trackNumber,
      plays: 0,
      likes: 0,
      createdAt,
    }));

    const newAlbum: Album = {
      id: albumId,
      title: payload.title.trim(),
      artistName: payload.artistName.trim() || user.artistName,
      artistId: user.id,
      genre: payload.genre,
      description: payload.description.trim(),
      coverUrl: payload.coverUrl,
      trackIds: newTracks.map((t) => t.id),
      createdAt,
    };

    safeWrite(STORAGE_KEYS.albums, [newAlbum, ...existingAlbums]);
    safeWrite(STORAGE_KEYS.tracks, [...newTracks, ...existingTracks]);

    return { album: newAlbum, tracks: newTracks };
  }

  async getLikedTrackIds(userId: string): Promise<string[]> {
    const key = `${STORAGE_KEYS.likedPrefix}${userId || 'guest'}`;
    return safeRead<string[]>(key, ['track-1', 'track-4']);
  }

  async toggleLikeTrack(trackId: string, userId: string): Promise<{ likedIds: string[]; tracks: Track[] }> {
    const key = `${STORAGE_KEYS.likedPrefix}${userId || 'guest'}`;
    const currentLikes = await this.getLikedTrackIds(userId);
    const alreadyLiked = currentLikes.includes(trackId);
    const likedIds = alreadyLiked
      ? currentLikes.filter((id) => id !== trackId)
      : [...currentLikes, trackId];
    safeWrite(key, likedIds);

    const tracks = await this.getTracks();
    const updatedTracks = tracks.map((track) => {
      if (track.id !== trackId) return track;
      return {
        ...track,
        likes: Math.max(0, track.likes + (alreadyLiked ? -1 : 1)),
      };
    });
    safeWrite(STORAGE_KEYS.tracks, updatedTracks);

    return { likedIds, tracks: updatedTracks };
  }

  async getLibraryTrackIds(userId: string): Promise<string[]> {
    const key = `${STORAGE_KEYS.libraryPrefix}${userId || 'guest'}`;
    return safeRead<string[]>(key, ['track-6']);
  }

  async toggleLibraryTrack(trackId: string, userId: string): Promise<string[]> {
    const key = `${STORAGE_KEYS.libraryPrefix}${userId || 'guest'}`;
    const current = await this.getLibraryTrackIds(userId);
    const exists = current.includes(trackId);
    const updated = exists ? current.filter((id) => id !== trackId) : [...current, trackId];
    safeWrite(key, updated);
    return updated;
  }

  async getDownloadedTrackIds(userId: string): Promise<string[]> {
    const key = `${STORAGE_KEYS.downloadedPrefix}${userId || 'guest'}`;
    return safeRead<string[]>(key, []);
  }

  async markTrackDownloaded(trackId: string, userId: string): Promise<string[]> {
    const key = `${STORAGE_KEYS.downloadedPrefix}${userId || 'guest'}`;
    const current = await this.getDownloadedTrackIds(userId);
    if (current.includes(trackId)) return current;
    const updated = [trackId, ...current];
    safeWrite(key, updated);
    return updated;
  }

  async incrementPlayCount(trackId: string): Promise<Track[]> {
    const tracks = await this.getTracks();
    const updated = tracks.map((t) => (t.id === trackId ? { ...t, plays: t.plays + 1 } : t));
    safeWrite(STORAGE_KEYS.tracks, updated);
    return updated;
  }

  async getCurrentUser(): Promise<UserProfile | null> {
    return safeRead<UserProfile | null>(STORAGE_KEYS.user, SEED_PROFILES[0]);
  }

  async signInWithGoogle(): Promise<UserProfile> {
    const profile: UserProfile = {
      id: 'artist-claire-morel',
      artistName: 'Claire Morel',
      bio: 'Compositrice indépendante basée à Lyon. Synthétiseurs analogiques, guitares feutrées et textures nocturnes libres de droits.',
      avatarUrl: DEFAULT_USER_AVATAR,
      authMethod: 'google',
      email: 'claire.morel@gmail.com',
      createdAt: new Date().toISOString(),
    };
    safeWrite(STORAGE_KEYS.user, profile);
    return profile;
  }

  async signInWithPhone(phoneNumber: string, artistName?: string): Promise<UserProfile> {
    const cleanPhone = phoneNumber.trim();
    const profile: UserProfile = {
      id: `user-${cleanPhone.replace(/\D/g, '') || 'mobile'}`,
      artistName: artistName?.trim() || 'Artiste Indépendant',
      bio: 'Créateur sur Musica. Partage de morceaux originaux et d’albums libres.',
      avatarUrl: DEFAULT_USER_AVATAR,
      authMethod: 'phone',
      phoneNumber: cleanPhone,
      createdAt: new Date().toISOString(),
    };
    safeWrite(STORAGE_KEYS.user, profile);
    return profile;
  }

  async updateUserProfile(
    userId: string,
    updates: Partial<Pick<UserProfile, 'artistName' | 'bio' | 'avatarUrl'>>
  ): Promise<UserProfile> {
    const current = await this.getCurrentUser();
    if (!current || current.id !== userId) {
      throw new Error('Utilisateur non trouvé.');
    }
    const updated: UserProfile = { ...current, ...updates };
    safeWrite(STORAGE_KEYS.user, updated);
    return updated;
  }

  async signOut(): Promise<void> {
    localStorage.removeItem(STORAGE_KEYS.user);
  }
}

/**
 * Instance exportée prête à être basculée vers Supabase ou Firebase.
 */
export const musicDb: MusicDatabaseRepository = new LocalStorageMusicRepository();
