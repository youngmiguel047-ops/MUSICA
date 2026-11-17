import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { downloadAlbumAudioFiles, downloadTrackAudioFile } from '../services/audioEngine';
import { musicDb } from '../services/database';
import {
  Album,
  NavTab,
  PublishAlbumPayload,
  PublishTrackPayload,
  Track,
  UserProfile,
} from '../types/music';

interface MusicContextValue {
  tracks: Track[];
  albums: Album[];
  currentUser: UserProfile | null;
  likedTrackIds: string[];
  libraryTrackIds: string[];
  downloadedTrackIds: string[];
  activeTab: NavTab;
  selectedAlbum: Album | null;
  lyricsTrack: Track | null;
  authModalOpen: boolean;
  toastMessage: string | null;
  isLoading: boolean;
  setActiveTab: (tab: NavTab) => void;
  openAlbum: (album: Album | null) => void;
  openAlbumById: (albumId?: string) => void;
  openLyrics: (track: Track | null) => void;
  setAuthModalOpen: (open: boolean) => void;
  showToast: (message: string) => void;
  publishTrack: (payload: PublishTrackPayload) => Promise<Track>;
  publishAlbum: (payload: PublishAlbumPayload) => Promise<{ album: Album; tracks: Track[] }>;
  toggleLike: (trackId: string) => Promise<void>;
  toggleLibrary: (trackId: string) => Promise<void>;
  downloadTrack: (track: Track) => Promise<void>;
  downloadAlbum: (album: Album, albumTracks: Track[]) => Promise<void>;
  recordPlay: (trackId: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInWithPhone: (phoneNumber: string, artistName?: string) => Promise<void>;
  updateProfile: (updates: Partial<Pick<UserProfile, 'artistName' | 'bio' | 'avatarUrl'>>) => Promise<void>;
  signOut: () => Promise<void>;
}

const MusicContext = createContext<MusicContextValue | null>(null);

export function MusicProvider({ children }: { children: React.ReactNode }) {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [likedTrackIds, setLikedTrackIds] = useState<string[]>([]);
  const [libraryTrackIds, setLibraryTrackIds] = useState<string[]>([]);
  const [downloadedTrackIds, setDownloadedTrackIds] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<NavTab>('home');
  const [selectedAlbum, setSelectedAlbum] = useState<Album | null>(null);
  const [lyricsTrack, setLyricsTrack] = useState<Track | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const showToast = useCallback((message: string) => {
    setToastMessage(message);
  }, []);

  useEffect(() => {
    if (!toastMessage) return;
    const timer = window.setTimeout(() => setToastMessage(null), 3200);
    return () => window.clearTimeout(timer);
  }, [toastMessage]);

  const hydrate = useCallback(async () => {
    setIsLoading(true);
    try {
      const [loadedTracks, loadedAlbums, user] = await Promise.all([
        musicDb.getTracks(),
        musicDb.getAlbums(),
        musicDb.getCurrentUser(),
      ]);
      setTracks(loadedTracks);
      setAlbums(loadedAlbums);
      setCurrentUser(user);

      const userId = user?.id ?? 'guest';
      const [likes, lib, downloads] = await Promise.all([
        musicDb.getLikedTrackIds(userId),
        musicDb.getLibraryTrackIds(userId),
        musicDb.getDownloadedTrackIds(userId),
      ]);
      setLikedTrackIds(likes);
      setLibraryTrackIds(lib);
      setDownloadedTrackIds(downloads);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  const publishTrack = useCallback(
    async (payload: PublishTrackPayload) => {
      if (!currentUser) {
        setAuthModalOpen(true);
        throw new Error('Connexion requise pour publier.');
      }
      const created = await musicDb.publishTrack(payload, currentUser);
      setTracks((prev) => [created, ...prev]);
      showToast(`« ${created.title} » publié gratuitement !`);
      return created;
    },
    [currentUser, showToast]
  );

  const publishAlbum = useCallback(
    async (payload: PublishAlbumPayload) => {
      if (!currentUser) {
        setAuthModalOpen(true);
        throw new Error('Connexion requise pour publier.');
      }
      const result = await musicDb.publishAlbum(payload, currentUser);
      setAlbums((prev) => [result.album, ...prev]);
      setTracks((prev) => [...result.tracks, ...prev]);
      showToast(`Album « ${result.album.title} » publié avec ${result.tracks.length} pistes !`);
      return result;
    },
    [currentUser, showToast]
  );

  const toggleLike = useCallback(
    async (trackId: string) => {
      const userId = currentUser?.id ?? 'guest';
      const result = await musicDb.toggleLikeTrack(trackId, userId);
      setLikedTrackIds(result.likedIds);
      setTracks(result.tracks);
    },
    [currentUser]
  );

  const toggleLibrary = useCallback(
    async (trackId: string) => {
      const userId = currentUser?.id ?? 'guest';
      const exists = libraryTrackIds.includes(trackId);
      const updated = await musicDb.toggleLibraryTrack(trackId, userId);
      setLibraryTrackIds(updated);
      showToast(exists ? 'Retiré de votre bibliothèque' : 'Ajouté à votre bibliothèque');
    },
    [currentUser, libraryTrackIds, showToast]
  );

  const downloadTrack = useCallback(
    async (track: Track) => {
      try {
        showToast(`Préparation du téléchargement de « ${track.title} »...`);
        const fileName = await downloadTrackAudioFile(track);
        const userId = currentUser?.id ?? 'guest';
        const updated = await musicDb.markTrackDownloaded(track.id, userId);
        setDownloadedTrackIds(updated);
        showToast(`« ${fileName} » enregistré dans la mémoire du téléphone`);
      } catch {
        showToast('Impossible de télécharger ce fichier audio sur votre appareil.');
      }
    },
    [currentUser, showToast]
  );

  const downloadAlbum = useCallback(
    async (album: Album, albumTracks: Track[]) => {
      if (albumTracks.length === 0) return;
      try {
        showToast(`Téléchargement de « ${album.title} » en cours...`);
        const count = await downloadAlbumAudioFiles(albumTracks);
        const userId = currentUser?.id ?? 'guest';
        let updated = downloadedTrackIds;
        for (const t of albumTracks) {
          updated = await musicDb.markTrackDownloaded(t.id, userId);
        }
        setDownloadedTrackIds(updated);
        showToast(`${count} pistes de « ${album.title} » enregistrées sur l’appareil`);
      } catch {
        showToast('Impossible de télécharger certaines pistes de cet album.');
      }
    },
    [currentUser, downloadedTrackIds, showToast]
  );

  const recordPlay = useCallback(async (trackId: string) => {
    const updated = await musicDb.incrementPlayCount(trackId);
    setTracks(updated);
  }, []);

  const signInWithGoogle = useCallback(async () => {
    const user = await musicDb.signInWithGoogle();
    setCurrentUser(user);
    const [likes, lib, downloads] = await Promise.all([
      musicDb.getLikedTrackIds(user.id),
      musicDb.getLibraryTrackIds(user.id),
      musicDb.getDownloadedTrackIds(user.id),
    ]);
    setLikedTrackIds(likes);
    setLibraryTrackIds(lib);
    setDownloadedTrackIds(downloads);
    setAuthModalOpen(false);
    showToast(`Bienvenue, ${user.artistName}`);
  }, [showToast]);

  const signInWithPhone = useCallback(
    async (phoneNumber: string, artistName?: string) => {
      const user = await musicDb.signInWithPhone(phoneNumber, artistName);
      setCurrentUser(user);
      const [likes, lib, downloads] = await Promise.all([
        musicDb.getLikedTrackIds(user.id),
        musicDb.getLibraryTrackIds(user.id),
        musicDb.getDownloadedTrackIds(user.id),
      ]);
      setLikedTrackIds(likes);
      setLibraryTrackIds(lib);
      setDownloadedTrackIds(downloads);
      setAuthModalOpen(false);
      showToast(`Connecté en tant que ${user.artistName}`);
    },
    [showToast]
  );

  const updateProfile = useCallback(
    async (updates: Partial<Pick<UserProfile, 'artistName' | 'bio' | 'avatarUrl'>>) => {
      if (!currentUser) return;
      const updated = await musicDb.updateUserProfile(currentUser.id, updates);
      setCurrentUser(updated);
      showToast('Profil mis à jour');
    },
    [currentUser, showToast]
  );

  const signOut = useCallback(async () => {
    await musicDb.signOut();
    setCurrentUser(null);
    const [likes, lib, downloads] = await Promise.all([
      musicDb.getLikedTrackIds('guest'),
      musicDb.getLibraryTrackIds('guest'),
      musicDb.getDownloadedTrackIds('guest'),
    ]);
    setLikedTrackIds(likes);
    setLibraryTrackIds(lib);
    setDownloadedTrackIds(downloads);
    showToast('Vous êtes déconnecté');
  }, [showToast]);

  const openAlbumById = useCallback(
    (albumId?: string) => {
      if (!albumId) {
        showToast('Ce titre est un single indépendant.');
        return;
      }
      const found = albums.find((a) => a.id === albumId);
      if (found) {
        setSelectedAlbum(found);
      } else {
        showToast('Album introuvable.');
      }
    },
    [albums, showToast]
  );

  return (
    <MusicContext.Provider
      value={{
        tracks,
        albums,
        currentUser,
        likedTrackIds,
        libraryTrackIds,
        downloadedTrackIds,
        activeTab,
        selectedAlbum,
        lyricsTrack,
        authModalOpen,
        toastMessage,
        isLoading,
        setActiveTab,
        openAlbum: setSelectedAlbum,
        openAlbumById,
        openLyrics: setLyricsTrack,
        setAuthModalOpen,
        showToast,
        publishTrack,
        publishAlbum,
        toggleLike,
        toggleLibrary,
        downloadTrack,
        downloadAlbum,
        recordPlay,
        signInWithGoogle,
        signInWithPhone,
        updateProfile,
        signOut,
      }}
    >
      {children}
    </MusicContext.Provider>
  );
}

export function useMusic() {
  const ctx = useContext(MusicContext);
  if (!ctx) throw new Error('useMusic doit être utilisé dans un MusicProvider.');
  return ctx;
}
