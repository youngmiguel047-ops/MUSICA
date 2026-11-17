/**
 * Moteur de synthèse audio WAV en mémoire pour les morceaux de démonstration du catalogue.
 * Permet à l'élément <audio> HTML5 de jouer de véritables progressions harmoniques musicales
 * avec lecture fluide, barre de progression réelle et contrôle de positionnement (seek),
 * sans dépendre d'URL externes fragiles.
 */

const generatedUrlCache = new Map<number, string>();

interface ChordProgression {
  bpm: number;
  chords: number[][];
  waveform: 'warm' | 'pluck' | 'pad';
}

const PROGRESSIONS: ChordProgression[] = [
  {
    // Synthwave / Électronique nocturne (La mineur -> Fa -> Do -> Sol)
    bpm: 96,
    chords: [
      [220.0, 261.63, 329.63, 440.0],
      [174.61, 220.0, 261.63, 349.23],
      [130.81, 196.0, 261.63, 329.63],
      [196.0, 246.94, 293.66, 392.0],
    ],
    waveform: 'warm',
  },
  {
    // Soul acoustique / Chaleureux (Ré majeur 7 -> Si mineur 7 -> Sol maj 7 -> La)
    bpm: 84,
    chords: [
      [146.83, 220.0, 277.18, 369.99],
      [123.47, 185.0, 220.0, 293.66],
      [196.0, 246.94, 293.66, 369.99],
      [110.0, 220.0, 277.18, 329.63],
    ],
    waveform: 'pluck',
  },
  {
    // Lo-Fi Parisien (Fa maj 7 -> Mi mineur 7 -> Ré mineur 7 -> Do maj 7)
    bpm: 78,
    chords: [
      [174.61, 220.0, 261.63, 329.63],
      [164.81, 196.0, 246.94, 293.66],
      [146.83, 174.61, 220.0, 261.63],
      [130.81, 164.81, 196.0, 246.94],
    ],
    waveform: 'warm',
  },
  {
    // Ambient / Expérimental (Do -> Sol sus4 -> La mineur 9 -> Fa)
    bpm: 66,
    chords: [
      [130.81, 196.0, 261.63, 392.0],
      [196.0, 261.63, 293.66, 392.0],
      [110.0, 164.81, 246.94, 329.63],
      [174.61, 261.63, 329.63, 440.0],
    ],
    waveform: 'pad',
  },
];

function writeString(view: DataView, offset: number, str: string) {
  for (let i = 0; i < str.length; i++) {
    view.setUint8(offset + i, str.charCodeAt(i));
  }
}

export function getProceduralAudioUrl(seed: number, durationSec = 42): string {
  if (generatedUrlCache.has(seed)) {
    return generatedUrlCache.get(seed)!;
  }

  const sampleRate = 22050;
  const totalSamples = Math.floor(sampleRate * durationSec);
  const buffer = new ArrayBuffer(44 + totalSamples * 2);
  const view = new DataView(buffer);

  // En-tête RIFF WAV PCM 16-bit mono
  writeString(view, 0, 'RIFF');
  view.setUint32(4, 36 + totalSamples * 2, true);
  writeString(view, 8, 'WAVE');
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeString(view, 36, 'data');
  view.setUint32(40, totalSamples * 2, true);

  const prog = PROGRESSIONS[Math.abs(seed) % PROGRESSIONS.length];
  const beatDuration = 60 / prog.bpm;
  const chordDuration = beatDuration * 4;
  const pitchShift = 1 + ((seed % 5) - 2) * 0.03;

  for (let i = 0; i < totalSamples; i++) {
    const t = i / sampleRate;
    const chordIdx = Math.floor(t / chordDuration) % prog.chords.length;
    const chord = prog.chords[chordIdx];
    const chordPos = (t % chordDuration) / chordDuration;

    // Enveloppe douce par mesure
    const attack = Math.min(1, chordPos / 0.08);
    const release = Math.min(1, (1 - chordPos) / 0.14);
    const env = attack * release;

    // Mélodie arpégée légère par-dessus les accords
    const stepIdx = Math.floor((t / beatDuration) * 2) % chord.length;
    const arpFreq = chord[stepIdx] * 2 * pitchShift;
    const stepPos = ((t / beatDuration) * 2) % 1;
    const arpEnv = Math.exp(-stepPos * 4.2) * 0.24;

    let sample = 0;
    for (let n = 0; n < chord.length; n++) {
      const freq = chord[n] * pitchShift;
      if (prog.waveform === 'warm') {
        sample += Math.sin(2 * Math.PI * freq * t) * 0.18 + Math.sin(4 * Math.PI * freq * t) * 0.04;
      } else if (prog.waveform === 'pluck') {
        const pluckDecay = Math.exp(-chordPos * (1.8 + n * 0.3));
        sample += Math.sin(2 * Math.PI * freq * t) * 0.2 * pluckDecay;
      } else {
        const lfo = 0.85 + 0.15 * Math.sin(2 * Math.PI * 0.25 * t + n);
        sample += Math.sin(2 * Math.PI * freq * t) * 0.16 * lfo;
      }
    }

    sample = sample * env + Math.sin(2 * Math.PI * arpFreq * t) * arpEnv;

    // Fondu d'entrée / sortie global sur le morceau
    const globalFadeIn = Math.min(1, t / 1.2);
    const globalFadeOut = Math.min(1, (durationSec - t) / 2.0);
    sample *= globalFadeIn * globalFadeOut;

    const clamped = Math.max(-0.92, Math.min(0.92, sample));
    view.setInt16(44 + i * 2, Math.floor(clamped * 32767), true);
  }

  const blob = new Blob([buffer], { type: 'audio/wav' });
  const url = URL.createObjectURL(blob);
  generatedUrlCache.set(seed, url);
  return url;
}

export function formatDuration(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export async function readAudioFileDuration(url: string): Promise<number> {
  return new Promise((resolve) => {
    const audio = new Audio();
    audio.preload = 'metadata';
    audio.onloadedmetadata = () => {
      const dur = Number.isFinite(audio.duration) && audio.duration > 0 ? Math.round(audio.duration) : 180;
      resolve(dur);
    };
    audio.onerror = () => resolve(180);
    audio.src = url;
  });
}

export function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error('Impossible de lire le fichier.'));
    reader.readAsDataURL(file);
  });
}

function sanitizeFileName(name: string): string {
  return name
    .replace(/[\\/:*?"<>|]+/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function extensionFromMime(mimeType: string): string {
  const lower = mimeType.toLowerCase();
  if (lower.includes('mpeg') || lower.includes('mp3')) return 'mp3';
  if (lower.includes('ogg')) return 'ogg';
  if (lower.includes('mp4') || lower.includes('aac') || lower.includes('m4a')) return 'm4a';
  if (lower.includes('flac')) return 'flac';
  return 'wav';
}

function triggerBrowserDownload(blob: Blob, fileName: string): void {
  const blobUrl = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = blobUrl;
  link.download = fileName;
  link.rel = 'noopener noreferrer';
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.setTimeout(() => URL.revokeObjectURL(blobUrl), 10000);
}

/**
 * Télécharge le fichier audio d'un titre directement dans le dossier Téléchargements
 * (mémoire interne du téléphone ou de l'ordinateur).
 */
export async function downloadTrackAudioFile(track: {
  title: string;
  artistName: string;
  audioUrl: string;
  audioSeed?: number;
  durationSec: number;
  trackNumber?: number;
}): Promise<string> {
  const sourceUrl =
    track.audioUrl && track.audioUrl.trim().length > 0
      ? track.audioUrl
      : getProceduralAudioUrl(track.audioSeed ?? 1, track.durationSec || 42);

  const response = await fetch(sourceUrl);
  if (!response.ok) {
    throw new Error('Impossible de préparer le fichier audio pour le téléchargement.');
  }
  const blob = await response.blob();
  const ext = extensionFromMime(blob.type || 'audio/wav');
  const prefix = track.trackNumber
    ? `${String(track.trackNumber).padStart(2, '0')} - `
    : '';
  const baseName = sanitizeFileName(`${prefix}${track.artistName} - ${track.title}`);
  const fileName = `${baseName || 'musica-titre'}.${ext}`;

  triggerBrowserDownload(blob, fileName);
  return fileName;
}

/**
 * Télécharge séquentiellement toutes les pistes d'un album sur l'appareil.
 */
export async function downloadAlbumAudioFiles(
  tracks: Array<{
    title: string;
    artistName: string;
    audioUrl: string;
    audioSeed?: number;
    durationSec: number;
    trackNumber?: number;
  }>
): Promise<number> {
  let count = 0;
  for (let i = 0; i < tracks.length; i++) {
    await downloadTrackAudioFile({
      ...tracks[i],
      trackNumber: tracks[i].trackNumber ?? i + 1,
    });
    count++;
    if (i < tracks.length - 1) {
      await new Promise((resolve) => window.setTimeout(resolve, 350));
    }
  }
  return count;
}

