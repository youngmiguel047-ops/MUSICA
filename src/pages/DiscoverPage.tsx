import { Search, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import { AlbumCard } from '../components/AlbumCard';
import { SongCard } from '../components/SongCard';
import { MUSIC_GENRES } from '../data/seedCatalog';
import { useMusic } from '../contexts/MusicContext';

export function DiscoverPage() {
  const { tracks, albums } = useMusic();
  const [query, setQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState<string>('Tous');

  const normalizedQuery = query.trim().toLowerCase();

  const filteredTracks = useMemo(() => {
    return tracks.filter((track) => {
      const matchesGenre = selectedGenre === 'Tous' || track.genre === selectedGenre;
      if (!matchesGenre) return false;
      if (!normalizedQuery) return true;
      return (
        track.title.toLowerCase().includes(normalizedQuery) ||
        track.artistName.toLowerCase().includes(normalizedQuery) ||
        (track.albumTitle ?? '').toLowerCase().includes(normalizedQuery) ||
        track.genre.toLowerCase().includes(normalizedQuery)
      );
    });
  }, [tracks, normalizedQuery, selectedGenre]);

  const filteredAlbums = useMemo(() => {
    return albums.filter((album) => {
      const matchesGenre = selectedGenre === 'Tous' || album.genre === selectedGenre;
      if (!matchesGenre) return false;
      if (!normalizedQuery) return true;
      return (
        album.title.toLowerCase().includes(normalizedQuery) ||
        album.artistName.toLowerCase().includes(normalizedQuery) ||
        album.genre.toLowerCase().includes(normalizedQuery)
      );
    });
  }, [albums, normalizedQuery, selectedGenre]);

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <div className="space-y-1">
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-zinc-950 dark:text-white">
            Découvrir
          </h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Recherchez un titre, un artiste, un album ou un genre musical.
          </p>
        </div>

        {/* Barre de recherche */}
        <div className="relative max-w-2xl">
          <Search
            className="w-4 h-4 text-zinc-400 absolute left-4 top-1/2 -translate-y-1/2"
            aria-hidden="true"
          />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher par titre, artiste, album ou genre..."
            aria-label="Rechercher de la musique"
            className="w-full h-12 pl-11 pr-10 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm text-zinc-950 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              aria-label="Effacer la recherche"
              className="absolute right-3 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full flex items-center justify-center text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
            >
              <X className="w-4 h-4" aria-hidden="true" />
            </button>
          )}
        </div>

        {/* Filtres par genre */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {['Tous', ...MUSIC_GENRES].map((genre) => {
            const active = selectedGenre === genre;
            return (
              <button
                key={genre}
                type="button"
                onClick={() => setSelectedGenre(genre)}
                className={`min-h-[38px] px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap shrink-0 transition-colors ${
                  active
                    ? 'shadow-sm'
                    : 'border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white'
                }`}
                style={
                  active
                    ? { backgroundColor: 'var(--accent)', color: 'var(--accent-foreground)' }
                    : undefined
                }
              >
                {genre}
              </button>
            );
          })}
        </div>
      </div>

      {filteredTracks.length === 0 && filteredAlbums.length === 0 ? (
        <div className="rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 p-10 text-center space-y-2">
          <p className="font-display text-lg font-bold text-zinc-950 dark:text-white">
            Aucun résultat trouvé
          </p>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Essayez un autre mot-clé ou réinitialisez le filtre de genre.
          </p>
        </div>
      ) : (
        <>
          {filteredTracks.length > 0 && (
            <section className="space-y-4">
              <div className="flex items-baseline justify-between">
                <h2 className="font-display text-xl font-bold text-zinc-950 dark:text-white">
                  Titres ({filteredTracks.length})
                </h2>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                {filteredTracks.map((track) => (
                  <SongCard key={track.id} track={track} queue={filteredTracks} />
                ))}
              </div>
            </section>
          )}

          {filteredAlbums.length > 0 && (
            <section className="space-y-4">
              <div className="flex items-baseline justify-between">
                <h2 className="font-display text-xl font-bold text-zinc-950 dark:text-white">
                  Albums ({filteredAlbums.length})
                </h2>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                {filteredAlbums.map((album) => (
                  <AlbumCard key={album.id} album={album} />
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}
