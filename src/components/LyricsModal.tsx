import { X } from 'lucide-react';
import { useMusic } from '../contexts/MusicContext';
import { CoverImage } from './CoverImage';

export function LyricsModal() {
  const { lyricsTrack, openLyrics } = useMusic();

  if (!lyricsTrack) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="lyrics-title"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 bg-black/75 backdrop-blur-sm"
    >
      <div className="relative w-full sm:max-w-lg max-h-[85vh] flex flex-col rounded-t-3xl sm:rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between gap-4 px-6 py-4 border-b border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center gap-3 min-w-0">
            <CoverImage
              src={lyricsTrack.coverUrl}
              alt={lyricsTrack.title}
              className="w-11 h-11 rounded-xl shrink-0"
            />
            <div className="min-w-0">
              <h2
                id="lyrics-title"
                className="font-display text-base font-bold text-zinc-950 dark:text-white truncate"
              >
                {lyricsTrack.title}
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate">
                {lyricsTrack.artistName}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => openLyrics(null)}
            aria-label="Fermer les paroles"
            className="w-9 h-9 rounded-full flex items-center justify-center text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-900 shrink-0"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto">
          {lyricsTrack.lyrics && lyricsTrack.lyrics.trim().length > 0 ? (
            <p className="whitespace-pre-line text-base sm:text-lg leading-relaxed text-zinc-800 dark:text-zinc-200 font-medium">
              {lyricsTrack.lyrics}
            </p>
          ) : (
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Aucune parole n’a été ajoutée pour ce titre.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
