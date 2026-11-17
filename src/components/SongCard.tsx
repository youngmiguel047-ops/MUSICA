import { Download, Heart, ListPlus, Disc3, FileText, MoreHorizontal, Pause, Play, Share2 } from 'lucide-react';
import { useState } from 'react';
import { useAudio } from '../contexts/AudioContext';
import { useMusic } from '../contexts/MusicContext';
import { formatDuration } from '../services/audioEngine';
import { Track } from '../types/music';
import { CoverImage } from './CoverImage';

interface SongCardProps {
  track: Track;
  queue?: Track[];
}

export function SongCard({ track, queue }: SongCardProps) {
  const { currentTrack, isPlaying, playTrack } = useAudio();
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

  const isCurrent = currentTrack?.id === track.id;
  const isTrackPlaying = isCurrent && isPlaying;
  const isLiked = likedTrackIds.includes(track.id);
  const inLibrary = libraryTrackIds.includes(track.id);
  const isDownloaded = downloadedTrackIds.includes(track.id);

  const handleShare = async () => {
    setMenuOpen(false);
    const shareText = `${track.title} — ${track.artistName} sur Musica`;
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(`${window.location.origin}/?track=${track.id}`);
      }
      showToast(`Lien copié : ${shareText}`);
    } catch {
      showToast(`Partage : ${shareText}`);
    }
  };

  return (
    <article className="group relative flex flex-col rounded-2xl bg-white dark:bg-zinc-900/75 border border-zinc-200/80 dark:border-zinc-800/80 p-3.5 transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-900">
      {/* Pochette carrée + bouton lecture au survol */}
      <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-zinc-200 dark:bg-zinc-800">
        <CoverImage
          src={track.coverUrl}
          alt={`Pochette de ${track.title}`}
          className="w-full h-full transition-transform duration-300 group-hover:scale-[1.03]"
        />
        <div
          className={`absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent transition-opacity duration-200 ${
            isTrackPlaying ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
          }`}
        />
        <button
          type="button"
          onClick={() => playTrack(track, queue)}
          aria-label={isTrackPlaying ? `Mettre en pause ${track.title}` : `Lire ${track.title}`}
          className={`absolute bottom-2.5 right-2.5 w-11 h-11 rounded-full flex items-center justify-center shadow-lg transition-all duration-150 active:scale-95 ${
            isTrackPlaying
              ? 'opacity-100 translate-y-0'
              : 'opacity-95 sm:opacity-0 sm:translate-y-1.5 group-hover:opacity-100 group-hover:translate-y-0'
          }`}
          style={{
            backgroundColor: 'var(--accent)',
            color: 'var(--accent-foreground)',
          }}
        >
          {isTrackPlaying ? (
            <Pause className="w-5 h-5 fill-current" aria-hidden="true" />
          ) : (
            <Play className="w-5 h-5 fill-current ml-0.5" aria-hidden="true" />
          )}
        </button>
      </div>

      {/* Informations du titre (métadonnées épurées sans pilules) */}
      <div className="mt-3 min-w-0 flex-1 flex flex-col justify-between gap-2">
        <div className="min-w-0">
          <h3
            className="text-sm font-semibold truncate text-zinc-950 dark:text-white"
            style={isCurrent ? { color: 'var(--accent)' } : undefined}
          >
            {track.title}
          </h3>
          <p className="text-xs text-zinc-600 dark:text-zinc-400 truncate mt-0.5">
            {track.artistName}
          </p>
        </div>

        <div className="flex items-center justify-between gap-2 pt-1">
          <div className="flex items-center gap-1.5 text-[11px] text-zinc-500 dark:text-zinc-400 truncate">
            <span className="truncate">{track.genre}</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono-tabular shrink-0">{formatDuration(track.durationSec)}</span>
          </div>

          <div className="flex items-center gap-0.5 shrink-0">
            <button
              type="button"
              onClick={() => toggleLike(track.id)}
              aria-label={isLiked ? 'Retirer des titres likés' : 'Aimer ce titre'}
              className="min-w-[36px] min-h-[36px] flex items-center justify-center rounded-lg text-zinc-500 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white transition-colors"
            >
              <Heart
                className="w-4 h-4 transition-transform active:scale-125"
                style={isLiked ? { color: 'var(--accent)', fill: 'var(--accent)' } : undefined}
                aria-hidden="true"
              />
            </button>

            <div className="relative">
              <button
                type="button"
                onClick={() => setMenuOpen((prev) => !prev)}
                aria-label={`Actions pour ${track.title}`}
                className="min-w-[36px] min-h-[36px] flex items-center justify-center rounded-lg text-zinc-500 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white transition-colors"
              >
                <MoreHorizontal className="w-4 h-4" aria-hidden="true" />
              </button>

              {menuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-30"
                    onClick={() => setMenuOpen(false)}
                    aria-hidden="true"
                  />
                  <div className="absolute right-0 bottom-10 z-40 w-52 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-1.5 shadow-xl text-xs">
                    <button
                      type="button"
                      onClick={() => {
                        setMenuOpen(false);
                        toggleLibrary(track.id);
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-left text-zinc-800 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                    >
                      <ListPlus className="w-4 h-4 shrink-0" aria-hidden="true" />
                      <span>{inLibrary ? 'Retirer de la bibliothèque' : 'Ajouter à la bibliothèque'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setMenuOpen(false);
                        openLyrics(track);
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-left text-zinc-800 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                    >
                      <FileText className="w-4 h-4 shrink-0" aria-hidden="true" />
                      <span>Voir les paroles</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setMenuOpen(false);
                        openAlbumById(track.albumId);
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-left text-zinc-800 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                    >
                      <Disc3 className="w-4 h-4 shrink-0" aria-hidden="true" />
                      <span>Voir l’album</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setMenuOpen(false);
                        downloadTrack(track);
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-left text-zinc-800 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                    >
                      <Download className="w-4 h-4 shrink-0" aria-hidden="true" />
                      <span>
                        {isDownloaded ? 'Télécharger à nouveau' : 'Télécharger sur l’appareil'}
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={handleShare}
                      className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-left text-zinc-800 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                    >
                      <Share2 className="w-4 h-4 shrink-0" aria-hidden="true" />
                      <span>Partager</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
