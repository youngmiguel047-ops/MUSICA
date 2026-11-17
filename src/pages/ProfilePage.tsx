import { Camera, Edit3, LogOut, Save, UserCheck } from 'lucide-react';
import { useMemo, useState } from 'react';
import { AlbumCard } from '../components/AlbumCard';
import { CoverImage } from '../components/CoverImage';
import { SongCard } from '../components/SongCard';
import { useMusic } from '../contexts/MusicContext';
import { readFileAsDataUrl } from '../services/audioEngine';

export function ProfilePage() {
  const { currentUser, tracks, albums, setAuthModalOpen, updateProfile, signOut, setActiveTab } =
    useMusic();

  const [isEditing, setIsEditing] = useState(false);
  const [artistNameDraft, setArtistNameDraft] = useState(currentUser?.artistName ?? '');
  const [bioDraft, setBioDraft] = useState(currentUser?.bio ?? '');

  const myTracks = useMemo(() => {
    if (!currentUser) return [];
    return tracks.filter((t) => t.artistId === currentUser.id);
  }, [tracks, currentUser]);

  const myAlbums = useMemo(() => {
    if (!currentUser) return [];
    return albums.filter((a) => a.artistId === currentUser.id);
  }, [albums, currentUser]);

  const totalPlays = useMemo(
    () => myTracks.reduce((sum, t) => sum + t.plays, 0),
    [myTracks]
  );

  const totalLikes = useMemo(
    () => myTracks.reduce((sum, t) => sum + t.likes, 0),
    [myTracks]
  );

  if (!currentUser) {
    return (
      <div className="max-w-xl mx-auto rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/75 p-8 text-center space-y-5">
        <div
          className="w-14 h-14 mx-auto rounded-2xl flex items-center justify-center"
          style={{ backgroundColor: 'var(--accent-soft)', color: 'var(--accent)' }}
        >
          <UserCheck className="w-7 h-7" aria-hidden="true" />
        </div>
        <div className="space-y-2">
          <h1 className="font-display text-2xl font-extrabold text-zinc-950 dark:text-white">
            Votre profil artiste Musica
          </h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Connectez-vous avec Google ou votre numéro de téléphone pour personnaliser votre bio, publier des titres et suivre vos écoutes.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setAuthModalOpen(true)}
          className="px-6 py-3 rounded-xl text-sm font-semibold"
          style={{
            backgroundColor: 'var(--accent)',
            color: 'var(--accent-foreground)',
          }}
        >
          Se connecter
        </button>
      </div>
    );
  }

  const startEditing = () => {
    setArtistNameDraft(currentUser.artistName);
    setBioDraft(currentUser.bio);
    setIsEditing(true);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateProfile({
      artistName: artistNameDraft.trim() || currentUser.artistName,
      bio: bioDraft.trim(),
    });
    setIsEditing(false);
  };

  const handleAvatarChange = async (file: File | undefined) => {
    if (!file) return;
    const dataUrl = await readFileAsDataUrl(file);
    await updateProfile({ avatarUrl: dataUrl });
  };

  return (
    <div className="space-y-10">
      {/* Carte d'identité artiste */}
      <section className="rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/75 p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-5 min-w-0">
            <label className="relative group w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden cursor-pointer shrink-0 bg-zinc-200 dark:bg-zinc-800">
              <CoverImage
                src={currentUser.avatarUrl}
                alt={currentUser.artistName}
                className="w-full h-full"
              />
              <span className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                <Camera className="w-5 h-5" aria-hidden="true" />
              </span>
              <input
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={(e) => handleAvatarChange(e.target.files?.[0])}
              />
            </label>

            <div className="min-w-0 space-y-1.5">
              <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                Artiste Musica ·{' '}
                {currentUser.authMethod === 'google'
                  ? currentUser.email ?? 'Compte Google'
                  : currentUser.phoneNumber}
              </p>
              <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-zinc-950 dark:text-white truncate">
                {currentUser.artistName}
              </h1>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 max-w-2xl leading-relaxed">
                {currentUser.bio || 'Aucune biographie renseignée pour le moment.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            {!isEditing && (
              <button
                type="button"
                onClick={startEditing}
                className="min-h-[40px] inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              >
                <Edit3 className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Modifier</span>
              </button>
            )}
            <button
              type="button"
              onClick={signOut}
              className="min-h-[40px] inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Déconnexion</span>
            </button>
          </div>
        </div>

        {isEditing && (
          <form
            onSubmit={handleSaveProfile}
            className="pt-5 border-t border-zinc-200 dark:border-zinc-800 space-y-4 max-w-2xl"
          >
            <div>
              <label
                htmlFor="profile-name"
                className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1"
              >
                Nom d’artiste
              </label>
              <input
                id="profile-name"
                type="text"
                value={artistNameDraft}
                onChange={(e) => setArtistNameDraft(e.target.value)}
                className="w-full h-11 px-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-sm text-zinc-950 dark:text-white"
              />
            </div>

            <div>
              <label
                htmlFor="profile-bio"
                className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1"
              >
                Biographie
              </label>
              <textarea
                id="profile-bio"
                rows={3}
                value={bioDraft}
                onChange={(e) => setBioDraft(e.target.value)}
                className="w-full p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-sm text-zinc-950 dark:text-white"
              />
            </div>

            <div className="flex items-center gap-3">
              <button
                type="submit"
                className="min-h-[40px] inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold"
                style={{
                  backgroundColor: 'var(--accent)',
                  color: 'var(--accent-foreground)',
                }}
              >
                <Save className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Enregistrer</span>
              </button>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="min-h-[40px] px-4 py-2 rounded-xl text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
              >
                Annuler
              </button>
            </div>
          </form>
        )}

        {/* Bandeau de statistiques aligné (4 colonnes) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 pt-5 border-t border-zinc-200 dark:border-zinc-800">
          <div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">Titres publiés</p>
            <p className="font-display font-mono-tabular text-2xl font-extrabold text-zinc-950 dark:text-white mt-0.5">
              {myTracks.length.toLocaleString('fr-FR')}
            </p>
          </div>
          <div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">Albums publiés</p>
            <p className="font-display font-mono-tabular text-2xl font-extrabold text-zinc-950 dark:text-white mt-0.5">
              {myAlbums.length.toLocaleString('fr-FR')}
            </p>
          </div>
          <div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">Total d’écoutes</p>
            <p className="font-display font-mono-tabular text-2xl font-extrabold text-zinc-950 dark:text-white mt-0.5">
              {totalPlays.toLocaleString('fr-FR')}
            </p>
          </div>
          <div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">Total de likes</p>
            <p className="font-display font-mono-tabular text-2xl font-extrabold text-zinc-950 dark:text-white mt-0.5">
              {totalLikes.toLocaleString('fr-FR')}
            </p>
          </div>
        </div>
      </section>

      {/* Titres de l'artiste */}
      <section className="space-y-4">
        <div className="flex items-baseline justify-between">
          <h2 className="font-display text-xl font-bold text-zinc-950 dark:text-white">
            Titres publiés ({myTracks.length})
          </h2>
          <button
            type="button"
            onClick={() => setActiveTab('publish')}
            className="text-xs font-semibold hover:underline"
            style={{ color: 'var(--accent)' }}
          >
            + Publier un titre
          </button>
        </div>
        {myTracks.length === 0 ? (
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Aucun titre publié pour le moment.
          </p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {myTracks.map((track) => (
              <SongCard key={track.id} track={track} queue={myTracks} />
            ))}
          </div>
        )}
      </section>

      {/* Albums de l'artiste */}
      <section className="space-y-4">
        <h2 className="font-display text-xl font-bold text-zinc-950 dark:text-white">
          Albums publiés ({myAlbums.length})
        </h2>
        {myAlbums.length === 0 ? (
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Aucun album publié pour le moment.
          </p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {myAlbums.map((album) => (
              <AlbumCard key={album.id} album={album} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
