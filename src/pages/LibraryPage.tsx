import { Disc3, Download, Heart, Music2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { AlbumCard } from '../components/AlbumCard';
import { SongCard } from '../components/SongCard';
import { useMusic } from '../contexts/MusicContext';

type LibrarySubTab = 'tracks' | 'albums' | 'liked' | 'downloads';

export function LibraryPage() {
  const {
    tracks,
    albums,
    currentUser,
    likedTrackIds,
    libraryTrackIds,
    downloadedTrackIds,
    setActiveTab,
    setAuthModalOpen,
  } = useMusic();

  const [subTab, setSubTab] = useState<LibrarySubTab>('liked');

  const myTracks = useMemo(() => {
    if (!currentUser) return [];
    return tracks.filter((t) => t.artistId === currentUser.id);
  }, [tracks, currentUser]);

  const myAlbums = useMemo(() => {
    if (!currentUser) return [];
    return albums.filter((a) => a.artistId === currentUser.id);
  }, [albums, currentUser]);

  const likedAndSavedTracks = useMemo(() => {
    const idSet = new Set([...likedTrackIds, ...libraryTrackIds]);
    return tracks.filter((t) => idSet.has(t.id));
  }, [tracks, likedTrackIds, libraryTrackIds]);

  const downloadedTracks = useMemo(() => {
    const idSet = new Set(downloadedTrackIds);
    return tracks.filter((t) => idSet.has(t.id));
  }, [tracks, downloadedTrackIds]);

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <div className="space-y-1">
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-zinc-950 dark:text-white">
            Bibliothèque
          </h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Retrouvez vos publications et vos coups de cœur.
          </p>
        </div>

        {/* Onglets segmentés */}
        <div
          role="tablist"
          aria-label="Sections de la bibliothèque"
          className="inline-flex flex-wrap items-center gap-1 p-1 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900"
        >
          <button
            type="button"
            role="tab"
            aria-selected={subTab === 'liked'}
            onClick={() => setSubTab('liked')}
            className={`min-h-[40px] inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
              subTab === 'liked'
                ? 'shadow-sm'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white'
            }`}
            style={
              subTab === 'liked'
                ? { backgroundColor: 'var(--accent)', color: 'var(--accent-foreground)' }
                : undefined
            }
          >
            <Heart className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Chansons likées ({likedAndSavedTracks.length})</span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={subTab === 'tracks'}
            onClick={() => setSubTab('tracks')}
            className={`min-h-[40px] inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
              subTab === 'tracks'
                ? 'shadow-sm'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white'
            }`}
            style={
              subTab === 'tracks'
                ? { backgroundColor: 'var(--accent)', color: 'var(--accent-foreground)' }
                : undefined
            }
          >
            <Music2 className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Mes titres publiés ({myTracks.length})</span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={subTab === 'albums'}
            onClick={() => setSubTab('albums')}
            className={`min-h-[40px] inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
              subTab === 'albums'
                ? 'shadow-sm'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white'
            }`}
            style={
              subTab === 'albums'
                ? { backgroundColor: 'var(--accent)', color: 'var(--accent-foreground)' }
                : undefined
            }
          >
            <Disc3 className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Mes albums publiés ({myAlbums.length})</span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={subTab === 'downloads'}
            onClick={() => setSubTab('downloads')}
            className={`min-h-[40px] inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
              subTab === 'downloads'
                ? 'shadow-sm'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white'
            }`}
            style={
              subTab === 'downloads'
                ? { backgroundColor: 'var(--accent)', color: 'var(--accent-foreground)' }
                : undefined
            }
          >
            <Download className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Téléchargements ({downloadedTracks.length})</span>
          </button>
        </div>
      </div>

      {/* Contenu */}
      {subTab === 'liked' && (
        <>
          {likedAndSavedTracks.length === 0 ? (
            <div className="rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 p-10 text-center space-y-4">
              <p className="font-display text-lg font-bold text-zinc-950 dark:text-white">
                Aucun titre liké pour le moment
              </p>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                Explorez le catalogue et cliquez sur le cœur pour enregistrer vos morceaux préférés.
              </p>
              <button
                type="button"
                onClick={() => setActiveTab('discover')}
                className="px-5 py-2.5 rounded-xl text-xs font-semibold"
                style={{
                  backgroundColor: 'var(--accent)',
                  color: 'var(--accent-foreground)',
                }}
              >
                Découvrir des titres
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
              {likedAndSavedTracks.map((track) => (
                <SongCard key={track.id} track={track} queue={likedAndSavedTracks} />
              ))}
            </div>
          )}
        </>
      )}

      {subTab === 'tracks' && (
        <>
          {!currentUser ? (
            <div className="rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 p-10 text-center space-y-4">
              <p className="font-display text-lg font-bold text-zinc-950 dark:text-white">
                Connectez-vous pour voir vos titres publiés
              </p>
              <button
                type="button"
                onClick={() => setAuthModalOpen(true)}
                className="px-5 py-2.5 rounded-xl text-xs font-semibold"
                style={{
                  backgroundColor: 'var(--accent)',
                  color: 'var(--accent-foreground)',
                }}
              >
                Se connecter
              </button>
            </div>
          ) : myTracks.length === 0 ? (
            <div className="rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 p-10 text-center space-y-4">
              <p className="font-display text-lg font-bold text-zinc-950 dark:text-white">
                Vous n’avez pas encore publié de titre
              </p>
              <button
                type="button"
                onClick={() => setActiveTab('publish')}
                className="px-5 py-2.5 rounded-xl text-xs font-semibold"
                style={{
                  backgroundColor: 'var(--accent)',
                  color: 'var(--accent-foreground)',
                }}
              >
                Publier un titre gratuitement
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
              {myTracks.map((track) => (
                <SongCard key={track.id} track={track} queue={myTracks} />
              ))}
            </div>
          )}
        </>
      )}

      {subTab === 'albums' && (
        <>
          {!currentUser ? (
            <div className="rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 p-10 text-center space-y-4">
              <p className="font-display text-lg font-bold text-zinc-950 dark:text-white">
                Connectez-vous pour voir vos albums publiés
              </p>
              <button
                type="button"
                onClick={() => setAuthModalOpen(true)}
                className="px-5 py-2.5 rounded-xl text-xs font-semibold"
                style={{
                  backgroundColor: 'var(--accent)',
                  color: 'var(--accent-foreground)',
                }}
              >
                Se connecter
              </button>
            </div>
          ) : myAlbums.length === 0 ? (
            <div className="rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 p-10 text-center space-y-4">
              <p className="font-display text-lg font-bold text-zinc-950 dark:text-white">
                Vous n’avez pas encore publié d’album
              </p>
              <button
                type="button"
                onClick={() => setActiveTab('publish')}
                className="px-5 py-2.5 rounded-xl text-xs font-semibold"
                style={{
                  backgroundColor: 'var(--accent)',
                  color: 'var(--accent-foreground)',
                }}
              >
                Publier un album gratuitement
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
              {myAlbums.map((album) => (
                <AlbumCard key={album.id} album={album} />
              ))}
            </div>
          )}
        </>
      )}
      {subTab === 'downloads' && (
        <>
          {downloadedTracks.length === 0 ? (
            <div className="rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 p-10 text-center space-y-4">
              <p className="font-display text-lg font-bold text-zinc-950 dark:text-white">
                Aucun titre téléchargé sur votre appareil
              </p>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-md mx-auto">
                Utilisez le bouton Télécharger depuis le lecteur, une carte ou un album pour enregistrer la musique dans le dossier Téléchargements de la mémoire interne.
              </p>
              <button
                type="button"
                onClick={() => setActiveTab('discover')}
                className="px-5 py-2.5 rounded-xl text-xs font-semibold"
                style={{
                  backgroundColor: 'var(--accent)',
                  color: 'var(--accent-foreground)',
                }}
              >
                Explorer le catalogue
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Ces morceaux ont été enregistrés dans le dossier Téléchargements de votre téléphone ou appareil.
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                {downloadedTracks.map((track) => (
                  <SongCard key={track.id} track={track} queue={downloadedTracks} />
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
