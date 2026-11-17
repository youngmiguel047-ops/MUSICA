import { Play, Upload } from 'lucide-react';
import { useMemo } from 'react';
import { AlbumCard } from '../components/AlbumCard';
import { CoverImage } from '../components/CoverImage';
import { SongCard } from '../components/SongCard';
import { useAudio } from '../contexts/AudioContext';
import { useMusic } from '../contexts/MusicContext';

export function HomePage() {
  const { tracks, albums, setActiveTab } = useMusic();
  const { playTrack } = useAudio();

  const popularTracks = useMemo(
    () => [...tracks].sort((a, b) => b.plays - a.plays).slice(0, 5),
    [tracks]
  );

  const recentTracks = useMemo(
    () =>
      [...tracks]
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 5),
    [tracks]
  );

  const recommendedTracks = useMemo(() => {
    const flagged = tracks.filter((t) => t.isRecommended);
    if (flagged.length >= 4) return flagged.slice(0, 5);
    return [...tracks].sort((a, b) => b.likes - a.likes).slice(0, 5);
  }, [tracks]);

  const newAlbums = useMemo(
    () =>
      [...albums]
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 5),
    [albums]
  );

  const spotlightTrack = popularTracks[0] ?? tracks[0];

  return (
    <div className="space-y-10">
      {/* Bannière éditoriale principale */}
      {spotlightTrack && (
        <section className="rounded-3xl border border-zinc-200 dark:border-zinc-800/90 bg-white dark:bg-zinc-900/75 p-5 sm:p-7 lg:p-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            <div className="lg:col-span-8 space-y-4">
              <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                À la une · Streaming gratuit et publication ouverte
              </p>
              <h1 className="font-display text-3xl sm:text-4xl lg:text-[42px] font-extrabold tracking-tight text-zinc-950 dark:text-white leading-[1.1] text-balance">
                La musique à portée de main, libre et sans abonnement.
              </h1>
              <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400 max-w-2xl leading-relaxed">
                Découvrez des créations indépendantes ou publiez vos propres titres et albums gratuitement, avec paroles et pochette.
              </p>
              <div className="flex flex-wrap items-center gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => playTrack(spotlightTrack, popularTracks)}
                  className="min-h-[44px] inline-flex items-center gap-2.5 px-5 py-2.5 rounded-xl text-sm font-semibold transition-transform active:scale-[0.98] whitespace-nowrap shrink-0"
                  style={{
                    backgroundColor: 'var(--accent)',
                    color: 'var(--accent-foreground)',
                  }}
                >
                  <Play className="w-4 h-4 fill-current" aria-hidden="true" />
                  <span>Écouter « {spotlightTrack.title} »</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('publish')}
                  className="min-h-[44px] inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors whitespace-nowrap shrink-0"
                >
                  <Upload className="w-4 h-4" aria-hidden="true" />
                  <span>Publier votre musique</span>
                </button>
              </div>
            </div>

            <div className="lg:col-span-4 flex items-center gap-4 lg:justify-end">
              <button
                type="button"
                onClick={() => playTrack(spotlightTrack, popularTracks)}
                className="group relative w-28 h-28 sm:w-36 sm:h-36 lg:w-48 lg:h-48 rounded-2xl overflow-hidden shadow-xl shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
              >
                <CoverImage
                  src={spotlightTrack.coverUrl}
                  alt={spotlightTrack.title}
                  className="w-full h-full transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/15 to-transparent flex items-end p-3 text-left">
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-white truncate">{spotlightTrack.title}</p>
                    <p className="text-[11px] text-zinc-200 truncate">{spotlightTrack.artistName}</p>
                  </div>
                </div>
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Section 1 : Populaires */}
      <section className="space-y-4">
        <div className="flex items-baseline justify-between gap-4">
          <h2 className="font-display text-xl sm:text-2xl font-bold text-zinc-950 dark:text-white">
            Populaires
          </h2>
          <button
            type="button"
            onClick={() => setActiveTab('discover')}
            className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white transition-colors whitespace-nowrap"
          >
            Tout voir
          </button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {popularTracks.map((track) => (
            <SongCard key={track.id} track={track} queue={popularTracks} />
          ))}
        </div>
      </section>

      {/* Section 2 : Récents */}
      <section className="space-y-4">
        <div className="flex items-baseline justify-between gap-4">
          <h2 className="font-display text-xl sm:text-2xl font-bold text-zinc-950 dark:text-white">
            Récents
          </h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {recentTracks.map((track) => (
            <SongCard key={track.id} track={track} queue={recentTracks} />
          ))}
        </div>
      </section>

      {/* Section 3 : Recommandés */}
      <section className="space-y-4">
        <div className="flex items-baseline justify-between gap-4">
          <h2 className="font-display text-xl sm:text-2xl font-bold text-zinc-950 dark:text-white">
            Recommandés
          </h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {recommendedTracks.map((track) => (
            <SongCard key={track.id} track={track} queue={recommendedTracks} />
          ))}
        </div>
      </section>

      {/* Section 4 : Nouveaux albums */}
      <section className="space-y-4">
        <div className="flex items-baseline justify-between gap-4">
          <h2 className="font-display text-xl sm:text-2xl font-bold text-zinc-950 dark:text-white">
            Nouveaux albums
          </h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {newAlbums.map((album) => (
            <AlbumCard key={album.id} album={album} />
          ))}
        </div>
      </section>
    </div>
  );
}
