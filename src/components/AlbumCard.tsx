import { Play } from 'lucide-react';
import { useAudio } from '../contexts/AudioContext';
import { useMusic } from '../contexts/MusicContext';
import { Album } from '../types/music';
import { CoverImage } from './CoverImage';

interface AlbumCardProps {
  album: Album;
}

export function AlbumCard({ album }: AlbumCardProps) {
  const { tracks, openAlbum } = useMusic();
  const { playTrack } = useAudio();

  const albumTracks = tracks
    .filter((t) => t.albumId === album.id || album.trackIds.includes(t.id))
    .sort((a, b) => (a.trackNumber ?? 0) - (b.trackNumber ?? 0));

  const handlePlayAlbum = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (albumTracks.length > 0) {
      playTrack(albumTracks[0], albumTracks);
    }
  };

  return (
    <article
      onClick={() => openAlbum(album)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          openAlbum(album);
        }
      }}
      tabIndex={0}
      role="button"
      className="group cursor-pointer flex flex-col rounded-2xl bg-white dark:bg-zinc-900/75 border border-zinc-200/80 dark:border-zinc-800/80 p-3.5 transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
    >
      <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-zinc-200 dark:bg-zinc-800">
        <CoverImage
          src={album.coverUrl}
          alt={`Pochette de l'album ${album.title}`}
          className="w-full h-full transition-transform duration-300 group-hover:scale-[1.03]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
        {albumTracks.length > 0 && (
          <button
            type="button"
            onClick={handlePlayAlbum}
            aria-label={`Lire l'album ${album.title}`}
            className="absolute bottom-2.5 right-2.5 w-11 h-11 rounded-full flex items-center justify-center shadow-lg opacity-95 sm:opacity-0 sm:translate-y-1.5 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-150 active:scale-95"
            style={{
              backgroundColor: 'var(--accent)',
              color: 'var(--accent-foreground)',
            }}
          >
            <Play className="w-5 h-5 fill-current ml-0.5" aria-hidden="true" />
          </button>
        )}
      </div>

      <div className="mt-3 min-w-0 space-y-1">
        <h3 className="text-sm font-semibold truncate text-zinc-950 dark:text-white">
          {album.title}
        </h3>
        <p className="text-xs text-zinc-600 dark:text-zinc-400 truncate">
          {album.artistName}
        </p>
        <div className="flex items-center gap-1.5 text-[11px] text-zinc-500 dark:text-zinc-400 pt-0.5">
          <span>Album</span>
          <span aria-hidden="true">·</span>
          <span className="truncate">{album.genre}</span>
          <span aria-hidden="true">·</span>
          <span className="font-mono-tabular shrink-0">
            {albumTracks.length} {albumTracks.length > 1 ? 'pistes' : 'piste'}
          </span>
        </div>
      </div>
    </article>
  );
}
