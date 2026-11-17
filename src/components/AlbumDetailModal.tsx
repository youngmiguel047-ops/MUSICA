import { Download, FileText, Heart, Pause, Play, X } from 'lucide-react';
import { useAudio } from '../contexts/AudioContext';
import { useMusic } from '../contexts/MusicContext';
import { formatDuration } from '../services/audioEngine';
import { CoverImage } from './CoverImage';

export function AlbumDetailModal() {
  const {
    selectedAlbum,
    openAlbum,
    tracks,
    likedTrackIds,
    downloadedTrackIds,
    toggleLike,
    downloadTrack,
    downloadAlbum,
    openLyrics,
  } = useMusic();
  const { currentTrack, isPlaying, playTrack } = useAudio();

  if (!selectedAlbum) return null;

  const albumTracks = tracks
    .filter((t) => t.albumId === selectedAlbum.id || selectedAlbum.trackIds.includes(t.id))
    .sort((a, b) => (a.trackNumber ?? 0) - (b.trackNumber ?? 0));

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="album-modal-title"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 bg-black/75 backdrop-blur-sm"
    >
      <div className="relative w-full sm:max-w-2xl max-h-[88vh] flex flex-col rounded-t-3xl sm:rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-2xl overflow-hidden">
        <button
          type="button"
          onClick={() => openAlbum(null)}
          aria-label="Fermer l'album"
          className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full flex items-center justify-center bg-zinc-100/90 dark:bg-zinc-900/90 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-800"
        >
          <X className="w-5 h-5" aria-hidden="true" />
        </button>

        {/* En-tête de l'album */}
        <div className="p-6 sm:p-7 flex flex-col sm:flex-row gap-5 border-b border-zinc-200 dark:border-zinc-800">
          <CoverImage
            src={selectedAlbum.coverUrl}
            alt={selectedAlbum.title}
            className="w-32 h-32 sm:w-40 sm:h-40 rounded-2xl shrink-0 shadow-lg"
          />

          <div className="min-w-0 flex-1 flex flex-col justify-between gap-3">
            <div className="space-y-1.5">
              <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                Album · {selectedAlbum.genre} · {albumTracks.length}{' '}
                {albumTracks.length > 1 ? 'pistes' : 'piste'}
              </p>
              <h2
                id="album-modal-title"
                className="font-display text-2xl sm:text-3xl font-extrabold text-zinc-950 dark:text-white leading-tight"
              >
                {selectedAlbum.title}
              </h2>
              <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                {selectedAlbum.artistName}
              </p>
              {selectedAlbum.description && (
                <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed pt-1">
                  {selectedAlbum.description}
                </p>
              )}
            </div>

            {albumTracks.length > 0 && (
              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => playTrack(albumTracks[0], albumTracks)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-transform active:scale-[0.98]"
                  style={{
                    backgroundColor: 'var(--accent)',
                    color: 'var(--accent-foreground)',
                  }}
                >
                  <Play className="w-4 h-4 fill-current" aria-hidden="true" />
                  <span>Tout lire</span>
                </button>
                <button
                  type="button"
                  onClick={() => downloadAlbum(selectedAlbum, albumTracks)}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                >
                  <Download className="w-4 h-4" aria-hidden="true" />
                  <span>Télécharger l’album</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Liste des pistes */}
        <div className="p-3 sm:p-5 overflow-y-auto divide-y divide-zinc-100 dark:divide-zinc-900">
          {albumTracks.map((track, idx) => {
            const isCurrent = currentTrack?.id === track.id;
            const isTrackPlaying = isCurrent && isPlaying;
            const isLiked = likedTrackIds.includes(track.id);

            return (
              <div
                key={track.id}
                className="flex items-center justify-between gap-3 py-3 px-2 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-900/60 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <button
                    type="button"
                    onClick={() => playTrack(track, albumTracks)}
                    aria-label={isTrackPlaying ? `Pause ${track.title}` : `Lire ${track.title}`}
                    className="w-9 h-9 rounded-lg flex items-center justify-center text-xs font-mono-tabular font-semibold shrink-0 bg-zinc-100 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white"
                    style={
                      isCurrent
                        ? { backgroundColor: 'var(--accent)', color: 'var(--accent-foreground)' }
                        : undefined
                    }
                  >
                    {isTrackPlaying ? (
                      <Pause className="w-4 h-4 fill-current" aria-hidden="true" />
                    ) : isCurrent ? (
                      <Play className="w-4 h-4 fill-current ml-0.5" aria-hidden="true" />
                    ) : (
                      track.trackNumber ?? idx + 1
                    )}
                  </button>

                  <div className="min-w-0 flex-1">
                    <p
                      className="text-sm font-semibold truncate text-zinc-950 dark:text-white"
                      style={isCurrent ? { color: 'var(--accent)' } : undefined}
                    >
                      {track.title}
                    </p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate">
                      {track.artistName}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  {track.lyrics && (
                    <button
                      type="button"
                      onClick={() => openLyrics(track)}
                      aria-label={`Paroles de ${track.title}`}
                      className="min-w-[36px] min-h-[36px] flex items-center justify-center rounded-lg text-zinc-500 hover:text-zinc-950 dark:hover:text-white"
                    >
                      <FileText className="w-4 h-4" aria-hidden="true" />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => downloadTrack(track)}
                    aria-label={`Télécharger ${track.title}`}
                    title="Télécharger sur l’appareil"
                    className="min-w-[36px] min-h-[36px] flex items-center justify-center rounded-lg text-zinc-500 hover:text-zinc-950 dark:hover:text-white"
                  >
                    <Download
                      className="w-4 h-4"
                      style={
                        downloadedTrackIds.includes(track.id)
                          ? { color: 'var(--accent)' }
                          : undefined
                      }
                      aria-hidden="true"
                    />
                  </button>
                  <button
                    type="button"
                    onClick={() => toggleLike(track.id)}
                    aria-label={isLiked ? 'Retirer le like' : 'Aimer'}
                    className="min-w-[36px] min-h-[36px] flex items-center justify-center rounded-lg text-zinc-500 hover:text-zinc-950 dark:hover:text-white"
                  >
                    <Heart
                      className="w-4 h-4"
                      style={isLiked ? { color: 'var(--accent)', fill: 'var(--accent)' } : undefined}
                      aria-hidden="true"
                    />
                  </button>
                  <span className="font-mono-tabular text-xs text-zinc-500 dark:text-zinc-400 w-10 text-right">
                    {formatDuration(track.durationSec)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
