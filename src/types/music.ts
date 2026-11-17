/**
 * Types principaux de l'application Musica.
 * Conçus pour rester compatibles avec une migration vers Supabase (PostgreSQL) ou Firebase (Firestore).
 */

export type NavTab = 'home' | 'discover' | 'publish' | 'library' | 'profile';

export type ThemeMode = 'dark' | 'light';

export type AccentColorId = 'green' | 'purple' | 'blue' | 'red' | 'white';

export interface AccentPreset {
  id: AccentColorId;
  label: string;
  hex: string;
  hoverHex: string;
  darkForeground: string;
  lightHex: string;
  lightHoverHex: string;
  lightForeground: string;
  softBg: string;
}

export type AuthMethod = 'google' | 'phone';

export interface UserProfile {
  id: string;
  artistName: string;
  bio: string;
  avatarUrl: string;
  authMethod: AuthMethod;
  email?: string;
  phoneNumber?: string;
  createdAt: string;
}

export interface Track {
  id: string;
  title: string;
  artistName: string;
  artistId: string;
  genre: string;
  description: string;
  lyrics: string;
  coverUrl: string;
  audioUrl: string;
  /** Graine audio utilisée pour générer un flux audio local si audioUrl est procédural */
  audioSeed?: number;
  durationSec: number;
  albumId?: string;
  albumTitle?: string;
  trackNumber?: number;
  plays: number;
  likes: number;
  createdAt: string;
  isRecommended?: boolean;
}

export interface Album {
  id: string;
  title: string;
  artistName: string;
  artistId: string;
  genre: string;
  description: string;
  coverUrl: string;
  trackIds: string[];
  createdAt: string;
}

export interface PublishTrackPayload {
  title: string;
  artistName: string;
  genre: string;
  description: string;
  lyrics: string;
  coverUrl: string;
  audioUrl: string;
  durationSec: number;
}

export interface PublishAlbumTrackInput {
  trackNumber: number;
  title: string;
  audioUrl: string;
  durationSec: number;
  lyrics?: string;
}

export interface PublishAlbumPayload {
  title: string;
  artistName: string;
  genre: string;
  description: string;
  coverUrl: string;
  tracks: PublishAlbumTrackInput[];
}
