import {
  AlertTriangle,
  CheckCircle2,
  Disc3,
  ImagePlus,
  Music,
  Plus,
  Trash2,
  Upload,
} from 'lucide-react';
import { useState } from 'react';
import { MUSIC_GENRES } from '../data/seedCatalog';
import { useAudio } from '../contexts/AudioContext';
import { useMusic } from '../contexts/MusicContext';
import { formatDuration, readAudioFileDuration, readFileAsDataUrl } from '../services/audioEngine';
import { PublishAlbumTrackInput } from '../types/music';
import { CoverImage } from './CoverImage';

type PublishMode = 'single' | 'album';

interface DraftAlbumTrack {
  localId: string;
  trackNumber: number;
  title: string;
  audioUrl: string;
  audioFileName: string;
  durationSec: number;
  lyrics: string;
}

export function PublishForm() {
  const { currentUser, setAuthModalOpen, publishTrack, publishAlbum, setActiveTab } = useMusic();
  const { playTrack } = useAudio();

  const [mode, setMode] = useState<PublishMode>('single');
  const [rightsConfirmed, setRightsConfirmed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // État Option 1 : Publier un Titre
  const [singleTitle, setSingleTitle] = useState('');
  const [singleArtist, setSingleArtist] = useState(currentUser?.artistName ?? '');
  const [singleGenre, setSingleGenre] = useState<string>(MUSIC_GENRES[0]);
  const [singleDescription, setSingleDescription] = useState('');
  const [singleLyrics, setSingleLyrics] = useState('');
  const [singleCoverUrl, setSingleCoverUrl] = useState('');
  const [singleAudioUrl, setSingleAudioUrl] = useState('');
  const [singleAudioName, setSingleAudioName] = useState('');
  const [singleDuration, setSingleDuration] = useState(180);

  // État Option 2 : Publier un Album
  const [albumTitle, setAlbumTitle] = useState('');
  const [albumArtist, setAlbumArtist] = useState(currentUser?.artistName ?? '');
  const [albumGenre, setAlbumGenre] = useState<string>(MUSIC_GENRES[0]);
  const [albumDescription, setAlbumDescription] = useState('');
  const [albumCoverUrl, setAlbumCoverUrl] = useState('');
  const [albumTracks, setAlbumTracks] = useState<DraftAlbumTrack[]>([
    {
      localId: 'draft-1',
      trackNumber: 1,
      title: '',
      audioUrl: '',
      audioFileName: '',
      durationSec: 180,
      lyrics: '',
    },
  ]);

  const handleCoverUpload = async (
    file: File | undefined,
    target: 'single' | 'album'
  ) => {
    if (!file) return;
    setErrorMsg(null);
    try {
      const dataUrl = await readFileAsDataUrl(file);
      if (target === 'single') {
        setSingleCoverUrl(dataUrl);
      } else {
        setAlbumCoverUrl(dataUrl);
      }
    } catch {
      setErrorMsg('Impossible de charger cette image de pochette.');
    }
  };

  const handleSingleAudioUpload = async (file: File | undefined) => {
    if (!file) return;
    setErrorMsg(null);
    const objectUrl = URL.createObjectURL(file);
    const duration = await readAudioFileDuration(objectUrl);
    setSingleAudioUrl(objectUrl);
    setSingleAudioName(file.name);
    setSingleDuration(duration);
  };

  const handleAlbumTrackAudioUpload = async (localId: string, file: File | undefined) => {
    if (!file) return;
    setErrorMsg(null);
    const objectUrl = URL.createObjectURL(file);
    const duration = await readAudioFileDuration(objectUrl);
    setAlbumTracks((prev) =>
      prev.map((track) =>
        track.localId === localId
          ? { ...track, audioUrl: objectUrl, audioFileName: file.name, durationSec: duration }
          : track
      )
    );
  };

  const addAlbumTrack = () => {
    setAlbumTracks((prev) => [
      ...prev,
      {
        localId: `draft-${Date.now()}`,
        trackNumber: prev.length + 1,
        title: '',
        audioUrl: '',
        audioFileName: '',
        durationSec: 180,
        lyrics: '',
      },
    ]);
  };

  const removeAlbumTrack = (localId: string) => {
    setAlbumTracks((prev) => {
      if (prev.length <= 1) return prev;
      return prev
        .filter((t) => t.localId !== localId)
        .map((t, index) => ({ ...t, trackNumber: index + 1 }));
    });
  };

  const updateAlbumTrack = (localId: string, patch: Partial<DraftAlbumTrack>) => {
    setAlbumTracks((prev) =>
      prev.map((track) => (track.localId === localId ? { ...track, ...patch } : track))
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!currentUser) {
      setAuthModalOpen(true);
      return;
    }

    if (!rightsConfirmed) {
      setErrorMsg(
        'Vous devez certifier détenir les droits de diffusion avant de publier.'
      );
      return;
    }

    setIsSubmitting(true);
    try {
      if (mode === 'single') {
        if (!singleTitle.trim()) {
          setErrorMsg('Veuillez saisir le titre de la chanson.');
          return;
        }
        if (!singleCoverUrl) {
          setErrorMsg('Veuillez importer une pochette pour votre titre.');
          return;
        }
        if (!singleAudioUrl) {
          setErrorMsg('Veuillez importer un fichier audio (MP3, WAV, OGG).');
          return;
        }

        const created = await publishTrack({
          title: singleTitle,
          artistName: singleArtist || currentUser.artistName,
          genre: singleGenre,
          description: singleDescription,
          lyrics: singleLyrics,
          coverUrl: singleCoverUrl,
          audioUrl: singleAudioUrl,
          durationSec: singleDuration,
        });

        setSingleTitle('');
        setSingleDescription('');
        setSingleLyrics('');
        setSingleCoverUrl('');
        setSingleAudioUrl('');
        setSingleAudioName('');
        setRightsConfirmed(false);
        setSuccessMsg(`Votre titre « ${created.title} » est désormais en ligne !`);
        playTrack(created);
      } else {
        if (!albumTitle.trim()) {
          setErrorMsg('Veuillez saisir le titre de l’album.');
          return;
        }
        if (!albumCoverUrl) {
          setErrorMsg('Veuillez importer la pochette de l’album.');
          return;
        }
        const invalidTrack = albumTracks.find((t) => !t.title.trim() || !t.audioUrl);
        if (invalidTrack) {
          setErrorMsg(
            `La piste ${invalidTrack.trackNumber} doit contenir un titre et un fichier audio.`
          );
          return;
        }

        const formattedTracks: PublishAlbumTrackInput[] = albumTracks.map((t) => ({
          trackNumber: Number(t.trackNumber) || 1,
          title: t.title,
          audioUrl: t.audioUrl,
          durationSec: t.durationSec,
          lyrics: t.lyrics,
        }));

        const created = await publishAlbum({
          title: albumTitle,
          artistName: albumArtist || currentUser.artistName,
          genre: albumGenre,
          description: albumDescription,
          coverUrl: albumCoverUrl,
          tracks: formattedTracks,
        });

        setAlbumTitle('');
        setAlbumDescription('');
        setAlbumCoverUrl('');
        setAlbumTracks([
          {
            localId: `draft-${Date.now()}`,
            trackNumber: 1,
            title: '',
            audioUrl: '',
            audioFileName: '',
            durationSec: 180,
            lyrics: '',
          },
        ]);
        setRightsConfirmed(false);
        setSuccessMsg(
          `Album « ${created.album.title} » publié avec ${created.tracks.length} pistes !`
        );
        if (created.tracks[0]) {
          playTrack(created.tracks[0], created.tracks);
        }
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!currentUser) {
    return (
      <div className="max-w-2xl mx-auto rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/80 p-8 text-center space-y-5">
        <div
          className="w-14 h-14 mx-auto rounded-2xl flex items-center justify-center"
          style={{ backgroundColor: 'var(--accent-soft)', color: 'var(--accent)' }}
        >
          <Upload className="w-7 h-7" aria-hidden="true" />
        </div>
        <div className="space-y-2">
          <h2 className="font-display text-2xl font-bold text-zinc-950 dark:text-white">
            Connectez-vous pour publier gratuitement
          </h2>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 max-w-md mx-auto">
            La publication sur Musica est ouverte à tous, sans abonnement ni limite. Créez votre profil en quelques secondes.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setAuthModalOpen(true)}
          className="px-6 py-3 rounded-xl text-sm font-semibold transition-transform active:scale-[0.98]"
          style={{
            backgroundColor: 'var(--accent)',
            color: 'var(--accent-foreground)',
          }}
        >
          Se connecter ou créer un compte
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Avertissement juridique obligatoire */}
      <div
        role="note"
        className="rounded-2xl border border-amber-500/30 bg-amber-500/10 dark:bg-amber-500/10 p-4 sm:p-5 flex items-start gap-3.5"
      >
        <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" aria-hidden="true" />
        <div className="space-y-1 text-sm">
          <p className="font-semibold text-zinc-950 dark:text-amber-200">
            Avertissement important sur les droits d’auteur
          </p>
          <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed">
            Vous ne pouvez publier que du contenu dont vous possédez les droits. Les musiques protégées par le droit d’auteur sans autorisation sont strictement interdites.
          </p>
        </div>
      </div>

      {/* Choix initial obligatoire : Option 1 (Titre) ou Option 2 (Album) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4" role="tablist" aria-label="Type de publication">
        <button
          type="button"
          role="tab"
          aria-selected={mode === 'single'}
          onClick={() => {
            setMode('single');
            setErrorMsg(null);
          }}
          className={`flex items-start gap-4 p-5 rounded-2xl border text-left transition-all ${
            mode === 'single'
              ? 'bg-white dark:bg-zinc-900 border-zinc-900 dark:border-white shadow-sm'
              : 'bg-white/60 dark:bg-zinc-900/40 border-zinc-200 dark:border-zinc-800 hover:bg-white dark:hover:bg-zinc-900/80'
          }`}
        >
          <div
            className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
            style={
              mode === 'single'
                ? { backgroundColor: 'var(--accent)', color: 'var(--accent-foreground)' }
                : { backgroundColor: 'var(--accent-soft)', color: 'var(--accent)' }
            }
          >
            <Music className="w-5 h-5" aria-hidden="true" />
          </div>
          <div>
            <span className="block font-display text-base font-bold text-zinc-950 dark:text-white">
              Option 1 : Publier un Titre
            </span>
            <span className="block text-xs text-zinc-500 dark:text-zinc-400 mt-1">
              Un morceau seul avec pochette, paroles et fichier MP3.
            </span>
          </div>
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={mode === 'album'}
          onClick={() => {
            setMode('album');
            setErrorMsg(null);
          }}
          className={`flex items-start gap-4 p-5 rounded-2xl border text-left transition-all ${
            mode === 'album'
              ? 'bg-white dark:bg-zinc-900 border-zinc-900 dark:border-white shadow-sm'
              : 'bg-white/60 dark:bg-zinc-900/40 border-zinc-200 dark:border-zinc-800 hover:bg-white dark:hover:bg-zinc-900/80'
          }`}
        >
          <div
            className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
            style={
              mode === 'album'
                ? { backgroundColor: 'var(--accent)', color: 'var(--accent-foreground)' }
                : { backgroundColor: 'var(--accent-soft)', color: 'var(--accent)' }
            }
          >
            <Disc3 className="w-5 h-5" aria-hidden="true" />
          </div>
          <div>
            <span className="block font-display text-base font-bold text-zinc-950 dark:text-white">
              Option 2 : Publier un Album
            </span>
            <span className="block text-xs text-zinc-500 dark:text-zinc-400 mt-1">
              Un projet complet avec plusieurs pistes ordonnées et paroles.
            </span>
          </div>
        </button>
      </div>

      {/* Formulaire actif */}
      <form
        onSubmit={handleSubmit}
        className="rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/75 p-5 sm:p-8 space-y-6"
      >
        {mode === 'single' ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Upload pochette */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  Pochette du titre *
                </label>
                <label className="group relative aspect-square w-full rounded-2xl border border-dashed border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950/60 flex flex-col items-center justify-center cursor-pointer overflow-hidden hover:border-zinc-500 dark:hover:border-zinc-500 transition-colors">
                  {singleCoverUrl ? (
                    <CoverImage
                      src={singleCoverUrl}
                      alt="Aperçu de la pochette"
                      className="w-full h-full"
                    />
                  ) : (
                    <div className="p-4 text-center space-y-2">
                      <ImagePlus className="w-8 h-8 mx-auto text-zinc-400" aria-hidden="true" />
                      <span className="block text-xs font-medium text-zinc-600 dark:text-zinc-400">
                        Importer une image (JPG, PNG)
                      </span>
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    onChange={(e) => handleCoverUpload(e.target.files?.[0], 'single')}
                  />
                </label>
              </div>

              {/* Champs texte */}
              <div className="md:col-span-2 space-y-4">
                <div>
                  <label
                    htmlFor="single-title"
                    className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5"
                  >
                    Titre de la chanson *
                  </label>
                  <input
                    id="single-title"
                    type="text"
                    value={singleTitle}
                    onChange={(e) => setSingleTitle(e.target.value)}
                    placeholder="Ex. Lumière d’Octobre"
                    className="w-full h-11 px-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-sm text-zinc-950 dark:text-white focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="single-artist"
                      className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5"
                    >
                      Nom de l’artiste *
                    </label>
                    <input
                      id="single-artist"
                      type="text"
                      value={singleArtist}
                      onChange={(e) => setSingleArtist(e.target.value)}
                      placeholder={currentUser.artistName}
                      className="w-full h-11 px-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-sm text-zinc-950 dark:text-white focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="single-genre"
                      className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5"
                    >
                      Genre *
                    </label>
                    <select
                      id="single-genre"
                      value={singleGenre}
                      onChange={(e) => setSingleGenre(e.target.value)}
                      className="w-full h-11 px-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-sm text-zinc-950 dark:text-white focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                    >
                      {MUSIC_GENRES.map((g) => (
                        <option key={g} value={g}>
                          {g}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                    Fichier audio (MP3, WAV, OGG) *
                  </label>
                  <label className="flex items-center justify-between gap-3 h-12 px-4 rounded-xl border border-dashed border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950/60 cursor-pointer hover:border-zinc-500 transition-colors">
                    <span className="text-xs text-zinc-600 dark:text-zinc-300 truncate">
                      {singleAudioName
                        ? `${singleAudioName} (${formatDuration(singleDuration)})`
                        : 'Sélectionner un fichier audio...'}
                    </span>
                    <Upload className="w-4 h-4 text-zinc-500 shrink-0" aria-hidden="true" />
                    <input
                      type="file"
                      accept="audio/*"
                      className="sr-only"
                      onChange={(e) => handleSingleAudioUpload(e.target.files?.[0])}
                    />
                  </label>
                </div>
              </div>
            </div>

            <div>
              <label
                htmlFor="single-desc"
                className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5"
              >
                Description
              </label>
              <textarea
                id="single-desc"
                rows={2}
                value={singleDescription}
                onChange={(e) => setSingleDescription(e.target.value)}
                placeholder="Racontez l’histoire ou l’ambiance de ce morceau..."
                className="w-full p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-sm text-zinc-950 dark:text-white focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
              />
            </div>

            <div>
              <label
                htmlFor="single-lyrics"
                className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5"
              >
                Paroles
              </label>
              <textarea
                id="single-lyrics"
                rows={5}
                value={singleLyrics}
                onChange={(e) => setSingleLyrics(e.target.value)}
                placeholder="Saisissez les paroles de votre chanson (optionnel)..."
                className="w-full p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-sm text-zinc-950 dark:text-white focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
              />
            </div>
          </>
        ) : (
          <>
            {/* Formulaire Album */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  Pochette de l’album *
                </label>
                <label className="relative aspect-square w-full rounded-2xl border border-dashed border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950/60 flex flex-col items-center justify-center cursor-pointer overflow-hidden hover:border-zinc-500 transition-colors">
                  {albumCoverUrl ? (
                    <CoverImage
                      src={albumCoverUrl}
                      alt="Aperçu de la pochette d'album"
                      className="w-full h-full"
                    />
                  ) : (
                    <div className="p-4 text-center space-y-2">
                      <ImagePlus className="w-8 h-8 mx-auto text-zinc-400" aria-hidden="true" />
                      <span className="block text-xs font-medium text-zinc-600 dark:text-zinc-400">
                        Importer la pochette (JPG, PNG)
                      </span>
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    onChange={(e) => handleCoverUpload(e.target.files?.[0], 'album')}
                  />
                </label>
              </div>

              <div className="md:col-span-2 space-y-4">
                <div>
                  <label
                    htmlFor="album-title"
                    className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5"
                  >
                    Titre de l’album *
                  </label>
                  <input
                    id="album-title"
                    type="text"
                    value={albumTitle}
                    onChange={(e) => setAlbumTitle(e.target.value)}
                    placeholder="Ex. Horizons Parallèles"
                    className="w-full h-11 px-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-sm text-zinc-950 dark:text-white focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="album-artist"
                      className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5"
                    >
                      Nom de l’artiste *
                    </label>
                    <input
                      id="album-artist"
                      type="text"
                      value={albumArtist}
                      onChange={(e) => setAlbumArtist(e.target.value)}
                      placeholder={currentUser.artistName}
                      className="w-full h-11 px-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-sm text-zinc-950 dark:text-white focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="album-genre"
                      className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5"
                    >
                      Genre principal *
                    </label>
                    <select
                      id="album-genre"
                      value={albumGenre}
                      onChange={(e) => setAlbumGenre(e.target.value)}
                      className="w-full h-11 px-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-sm text-zinc-950 dark:text-white focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                    >
                      {MUSIC_GENRES.map((g) => (
                        <option key={g} value={g}>
                          {g}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="album-desc"
                    className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5"
                  >
                    Description de l’album
                  </label>
                  <textarea
                    id="album-desc"
                    rows={3}
                    value={albumDescription}
                    onChange={(e) => setAlbumDescription(e.target.value)}
                    placeholder="Présentez l’univers, les inspirations et l’enregistrement de l’album..."
                    className="w-full p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-sm text-zinc-950 dark:text-white focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                  />
                </div>
              </div>
            </div>

            {/* Liste dynamique des pistes de l'album */}
            <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800 space-y-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h3 className="font-display text-base font-bold text-zinc-950 dark:text-white">
                    Pistes de l’album
                  </h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    Ajoutez autant de morceaux que vous le souhaitez.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={addAlbumTrack}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-white hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors whitespace-nowrap shrink-0"
                >
                  <Plus className="w-4 h-4" aria-hidden="true" />
                  <span>Ajouter une piste</span>
                </button>
              </div>

              <div className="space-y-4">
                {albumTracks.map((track, idx) => (
                  <div
                    key={track.localId}
                    className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-950/60 p-4 space-y-3"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="font-mono-tabular text-xs font-semibold text-zinc-600 dark:text-zinc-400">
                        Piste #{idx + 1}
                      </span>
                      {albumTracks.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeAlbumTrack(track.localId)}
                          className="inline-flex items-center gap-1 text-xs text-red-600 dark:text-red-400 hover:underline"
                        >
                          <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                          <span>Supprimer</span>
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                      <div className="sm:col-span-2">
                        <label className="block text-[11px] font-medium text-zinc-500 dark:text-zinc-400 mb-1">
                          N°
                        </label>
                        <input
                          type="number"
                          min={1}
                          value={track.trackNumber}
                          onChange={(e) =>
                            updateAlbumTrack(track.localId, {
                              trackNumber: Number(e.target.value),
                            })
                          }
                          className="w-full h-10 px-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm font-mono-tabular text-zinc-950 dark:text-white"
                        />
                      </div>

                      <div className="sm:col-span-5">
                        <label className="block text-[11px] font-medium text-zinc-500 dark:text-zinc-400 mb-1">
                          Titre de la piste *
                        </label>
                        <input
                          type="text"
                          value={track.title}
                          onChange={(e) =>
                            updateAlbumTrack(track.localId, { title: e.target.value })
                          }
                          placeholder={`Titre de la piste ${idx + 1}`}
                          className="w-full h-10 px-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm text-zinc-950 dark:text-white"
                        />
                      </div>

                      <div className="sm:col-span-5">
                        <label className="block text-[11px] font-medium text-zinc-500 dark:text-zinc-400 mb-1">
                          Fichier audio *
                        </label>
                        <label className="flex items-center justify-between gap-2 h-10 px-3 rounded-xl border border-dashed border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 cursor-pointer">
                          <span className="text-xs text-zinc-600 dark:text-zinc-300 truncate">
                            {track.audioFileName
                              ? `${track.audioFileName} (${formatDuration(track.durationSec)})`
                              : 'Importer MP3...'}
                          </span>
                          <Upload className="w-3.5 h-3.5 text-zinc-500 shrink-0" aria-hidden="true" />
                          <input
                            type="file"
                            accept="audio/*"
                            className="sr-only"
                            onChange={(e) =>
                              handleAlbumTrackAudioUpload(track.localId, e.target.files?.[0])
                            }
                          />
                        </label>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium text-zinc-500 dark:text-zinc-400 mb-1">
                        Paroles (optionnel)
                      </label>
                      <textarea
                        rows={2}
                        value={track.lyrics}
                        onChange={(e) =>
                          updateAlbumTrack(track.localId, { lyrics: e.target.value })
                        }
                        placeholder="Paroles de cette piste..."
                        className="w-full p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs text-zinc-950 dark:text-white"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Confirmation des droits */}
        <label className="flex items-start gap-3 cursor-pointer pt-2">
          <input
            type="checkbox"
            checked={rightsConfirmed}
            onChange={(e) => setRightsConfirmed(e.target.checked)}
            className="mt-0.5 w-4 h-4 rounded accent-[var(--accent)]"
          />
          <span className="text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed">
            Je certifie être l’auteur ou détenir l’intégralité des droits de diffusion sur cette œuvre, et je confirme qu’elle ne contient aucune musique protégée sans autorisation.
          </span>
        </label>

        {errorMsg && (
          <p role="alert" className="text-sm font-medium text-red-600 dark:text-red-400">
            {errorMsg}
          </p>
        )}

        {successMsg && (
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3.5 text-sm text-emerald-700 dark:text-emerald-300">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" aria-hidden="true" />
              <span>{successMsg}</span>
            </div>
            <button
              type="button"
              onClick={() => setActiveTab('library')}
              className="text-xs font-semibold underline underline-offset-4"
            >
              Voir dans ma bibliothèque
            </button>
          </div>
        )}

        <div className="flex items-center justify-end pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="min-h-[44px] px-7 py-3 rounded-xl text-sm font-semibold transition-transform active:scale-[0.98] disabled:opacity-60"
            style={{
              backgroundColor: 'var(--accent)',
              color: 'var(--accent-foreground)',
            }}
          >
            {isSubmitting
              ? 'Publication en cours...'
              : mode === 'single'
                ? 'Publier le titre'
                : 'Publier l’album'}
          </button>
        </div>
      </form>
    </div>
  );
}
