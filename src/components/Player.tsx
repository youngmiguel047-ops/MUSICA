import {
  Disc3,
  Download,
  FileText,
  Heart,
  ListPlus,
  MoreHorizontal,
  Pause,
  Play,
  Share2,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { useState } from 'react';
import { useAudio } from '../contexts/AudioContext';
import { useMusic } from '../contexts/MusicContext';
import { formatDuration } from '../services/audioEngine';
import { CoverImage } from './CoverImage';

export function Player() {
  const {
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    volume,
    isMuted,
    togglePlay,
    playNext,
    playPrevious,
    seek,
    setVolume,
    toggleMute,
  } = useAudio();

  const {
    likedTrackIds,
    libraryTrackIds,
    downloadedTrackIds,
    toggleLike,
    toggleLibrary,
    downloadTrack,
    openLyrics,
    openAlbumById,
    showToast,
  } = useMusic();

  const [menuOpen, setMenuOpen] = useState(false);

  if (!currentTrack) return null;

  const isLiked = likedTrackIds.includes(currentTrack.id);
  const inLibrary = libraryTrackIds.includes(currentTrack.id);
  const isDownloaded = downloadedTrackIds.includes(currentTrack.id);
  const progressPercent = duration > 0 ? Math.min(100, (currentTime / duration) * 100) : 0;

  const handleShare = async () => {
    setMenuOpen(false);
    const label = `${currentTrack.title} — ${currentTrack.artistName} sur Musica`;
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(`${window.location.origin}/?track=${currentTrack.id}`);
      }
      showToast(`Lien copié : ${label}`);
    } catch {
      showToast(`Partage : ${label}`);
    }
  };

  return (
    <div
      role="region"
      aria-label="Lecteur audio Musica"
      className="fixed bottom-14 md:bottom-0 left-0 right-0 z-40 h-14 md:h-20 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-xl border-t border-zinc-200 dark:border-zinc-800/90 px-3 sm:px-5 lg:px-6 flex flex-col justify-center"
    >
      {/* Barre de progression fine en haut sur mobile */}
      <div className="md:hidden absolute top-0 left-0 right-0 h-0.5 bg-zinc-200 dark:bg-zinc-800">
        <div
          className="h-full transition-[width] duration-150"
          style={{ width: `${progressPercent}%`, backgroundColor: 'var(--accent)' }}
        />
      </div>

      <div className="max-w-screen-2xl mx-auto w-full flex items-center justify-between gap-3 md:gap-6">
        {/* Gauche : Pochette + Titre + Artiste + Like */}
        <div className="flex items-center gap-3 min-w-0 flex-1 md:flex-none md:w-64 lg:w-72">
          <CoverImage
            src={currentTrack.coverUrl}
            alt={currentTrack.title}
            className="w-10 h-10 md:w-12 md:h-12 rounded-lg shrink-0"
          />
          <div className="min-w-0 flex-1">
            <p className="text-xs sm:text-sm font-semibold text-zinc-950 dark:text-white truncate">
              {currentTrack.title}
            </p>
            <p className="text-[11px] sm:text-xs text-zinc-500 dark:text-zinc-400 truncate">
              {currentTrack.artistName}
            </p>
          </div>
          <button
            type="button"
            onClick={() => toggleLike(currentTrack.id)}
            aria-label={isLiked ? 'Retirer des titres likés' : 'Aimer ce titre'}
            className="hidden sm:flex min-w-[40px] min-h-[40px] items-center justify-center rounded-lg text-zinc-500 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white transition-colors shrink-0"
          >
            <Heart
              className="w-4 h-4"
              style={isLiked ? { color: 'var(--accent)', fill: 'var(--accent)' } : undefined}
              aria-hidden="true"
            />
          </button>
        </div>

        {/* Centre : Contrôles de lecture & barre de progression */}
        <div className="flex items-center md:flex-col md:flex-1 md:max-w-xl gap-1 md:gap-1.5">
          <div className="flex items-center gap-1 sm:gap-3">
            <button
              type="button"
              onClick={playPrevious}
              aria-label="Piste précédente"
              className="hidden sm:flex min-w-[40px] min-h-[40px] items-center justify-center rounded-full text-zinc-600 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white transition-colors"
            >
              <SkipBack className="w-4 h-4 fill-current" aria-hidden="true" />
            </button>

            <button
              type="button"
              onClick={togglePlay}
              aria-label={isPlaying ? 'Mettre en pause' : 'Lire'}
              className="w-10 h-10 md:w-9 md:h-9 rounded-full flex items-center justify-center transition-transform active:scale-95 shrink-0"
              style={{
                backgroundColor: 'var(--accent)',
                color: 'var(--accent-foreground)',
              }}
            >
              {isPlaying ? (
                <Pause className="w-4 h-4 fill-current" aria-hidden="true" />
              ) : (
                <Play className="w-4 h-4 fill-current ml-0.5" aria-hidden="true" />
              )}
            </button>

            <button
              type="button"
              onClick={playNext}
              aria-label="Piste suivante"
              className="min-w-[40px] min-h-[40px] flex items-center justify-center rounded-full text-zinc-600 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white transition-colors"
            >
              <SkipForward className="w-4 h-4 fill-current" aria-hidden="true" />
            </button>
          </div>

          {/* Barre de progression interactive (Desktop) */}
          <div className="hidden md:flex items-center gap-2.5 w-full">
            <span className="font-mono-tabular text-[11px] text-zinc-500 dark:text-zinc-400 w-9 text-right">
              {formatDuration(currentTime)}
            </span>
            <input
              type="range"
              min={0}
              max={duration || 1}
              step={0.5}
              value={Math.min(currentTime, duration || 1)}
              onChange={(e) => seek(Number(e.target.value))}
              aria-label="Position de lecture"
              className="w-full h-1.5 rounded-full appearance-none cursor-pointer bg-zinc-200 dark:bg-zinc-800 accent-[var(--accent)]"
            />
            <span className="font-mono-tabular text-[11px] text-zinc-500 dark:text-zinc-400 w-9">
              {formatDuration(duration)}
            </span>
          </div>
        </div>

        {/* Droite : Volume + Menu 3 points */}
        <div className="flex items-center gap-1.5 sm:gap-2 md:w-64 lg:w-72 justify-end shrink-0">
          <div className="hidden lg:flex items-center gap-2 mr-1">
            <button
              type="button"
              onClick={toggleMute}
              aria-label={isMuted ? 'Réactiver le son' : 'Couper le son'}
              className="min-w-[36px] min-h-[36px] flex items-center justify-center rounded-lg text-zinc-500 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white transition-colors"
            >
              {isMuted || volume === 0 ? (
                <VolumeX className="w-4 h-4" aria-hidden="true" />
              ) : (
                <Volume2 className="w-4 h-4" aria-hidden="true" />
              )}
            </button>
            <input
              type="range"
              min={0}
              max={1}
              step={0.02}
              value={isMuted ? 0 : volume}
              onChange={(e) => setVolume(Number(e.target.value))}
              aria-label="Volume"
              className="w-20 h-1.5 rounded-full appearance-none cursor-pointer bg-zinc-200 dark:bg-zinc-800 accent-[var(--accent)]"
            />
          </div>

          <button
            type="button"
            onClick={() => downloadTrack(currentTrack)}
            aria-label="Télécharger dans la mémoire du téléphone"
            title="Télécharger sur l’appareil"
            className="hidden sm:flex min-w-[40px] min-h-[40px] items-center justify-center rounded-xl text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
          >
            <Download
              className="w-4 h-4"
              style={isDownloaded ? { color: 'var(--accent)' } : undefined}
              aria-hidden="true"
            />
          </button>

          <div className="relative">
            <button
              type="button"
              onClick={() => setMenuOpen((prev) => !prev)}
              aria-label="Options du morceau"
              aria-expanded={menuOpen}
              className="min-w-[40px] min-h-[40px] flex items-center justify-center rounded-xl text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
            >
              <MoreHorizontal className="w-5 h-5" aria-hidden="true" />
            </button>

            {menuOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setMenuOpen(false)}
                  aria-hidden="true"
                />
                <div className="absolute right-0 bottom-12 z-50 w-60 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-1.5 shadow-2xl text-sm">
                  <button
                    type="button"
                    onClick={() => {
                      setMenuOpen(false);
                      downloadTrack(currentTrack);
                    }}
                    className="w-full min-h-[42px] flex items-center gap-3 px-3 py-2 rounded-xl text-left text-zinc-800 dark:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                  >
                    <Download className="w-4 h-4 shrink-0" aria-hidden="true" />
                    <span>
                      {isDownloaded ? 'Télécharger à nouveau' : 'Télécharger sur l’appareil'}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setMenuOpen(false);
                      toggleLibrary(currentTrack.id);
                    }}
                    className="w-full min-h-[42px] flex items-center gap-3 px-3 py-2 rounded-xl text-left text-zinc-800 dark:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                  >
                    <ListPlus className="w-4 h-4 shrink-0" aria-hidden="true" />
                    <span>
                      {inLibrary ? 'Retirer de la bibliothèque' : 'Ajouter à la bibliothèque'}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={handleShare}
                    className="w-full min-h-[42px] flex items-center gap-3 px-3 py-2 rounded-xl text-left text-zinc-800 dark:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                  >
                    <Share2 className="w-4 h-4 shrink-0" aria-hidden="true" />
                    <span>Partager</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setMenuOpen(false);
                      openLyrics(currentTrack);
                    }}
                    className="w-full min-h-[42px] flex items-center gap-3 px-3 py-2 rounded-xl text-left text-zinc-800 dark:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                  >
                    <FileText className="w-4 h-4 shrink-0" aria-hidden="true" />
                    <span>Voir les paroles</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setMenuOpen(false);
                      openAlbumById(currentTrack.albumId);
                    }}
                    className="w-full min-h-[42px] flex items-center gap-3 px-3 py-2 rounded-xl text-left text-zinc-800 dark:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                  >
                    <Disc3 className="w-4 h-4 shrink-0" aria-hidden="true" />
                    <span>Voir l’album</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
