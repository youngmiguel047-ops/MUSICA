import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { getProceduralAudioUrl } from '../services/audioEngine';
import { Track } from '../types/music';
import { useMusic } from './MusicContext';

interface AudioContextValue {
  currentTrack: Track | null;
  queue: Track[];
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  playTrack: (track: Track, newQueue?: Track[]) => void;
  togglePlay: () => void;
  playNext: () => void;
  playPrevious: () => void;
  seek: (seconds: number) => void;
  setVolume: (vol: number) => void;
  toggleMute: () => void;
}

const AudioContext = createContext<AudioContextValue | null>(null);

export function AudioProvider({ children }: { children: React.ReactNode }) {
  const { tracks, recordPlay } = useMusic();
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [queue, setQueue] = useState<Track[]>([]);
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);

  // Initialise le premier morceau sans lecture automatique au chargement
  useEffect(() => {
    if (!currentTrack && tracks.length > 0) {
      setCurrentTrack(tracks[0]);
      setQueue(tracks);
      setDuration(tracks[0].durationSec);
    }
  }, [tracks, currentTrack]);

  // Création de l'instance audio unique
  useEffect(() => {
    const audio = new Audio();
    audio.preload = 'metadata';
    audio.volume = volume;
    audioRef.current = audio;

    return () => {
      audio.pause();
      audio.src = '';
    };
  }, []);

  const resolveAudioSource = useCallback((track: Track): string => {
    if (track.audioUrl && track.audioUrl.trim().length > 0) {
      return track.audioUrl;
    }
    return getProceduralAudioUrl(track.audioSeed ?? 1, track.durationSec || 42);
  }, []);

  const loadAndPlay = useCallback(
    async (track: Track, shouldAutoPlay: boolean) => {
      const audio = audioRef.current;
      if (!audio) return;

      const src = resolveAudioSource(track);
      if (audio.src !== src) {
        audio.src = src;
        audio.load();
      }
      setCurrentTime(0);
      setDuration(track.durationSec || 42);

      if (shouldAutoPlay) {
        try {
          await audio.play();
          setIsPlaying(true);
        } catch {
          setIsPlaying(false);
        }
      }
    },
    [resolveAudioSource]
  );

  const playTrack = useCallback(
    (track: Track, newQueue?: Track[]) => {
      const activeQueue = newQueue && newQueue.length > 0 ? newQueue : queue.length > 0 ? queue : tracks;
      setQueue(activeQueue);

      if (currentTrack?.id === track.id && audioRef.current?.src) {
        if (isPlaying) {
          audioRef.current.pause();
          setIsPlaying(false);
        } else {
          audioRef.current
            .play()
            .then(() => setIsPlaying(true))
            .catch(() => setIsPlaying(false));
        }
        return;
      }

      setCurrentTrack(track);
      loadAndPlay(track, true);
      recordPlay(track.id);
    },
    [currentTrack, isPlaying, loadAndPlay, queue, recordPlay, tracks]
  );

  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || !currentTrack) return;

    if (!audio.src) {
      loadAndPlay(currentTrack, true);
      recordPlay(currentTrack.id);
      return;
    }

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => setIsPlaying(false));
    }
  }, [currentTrack, isPlaying, loadAndPlay, recordPlay]);

  const playNext = useCallback(() => {
    const list = queue.length > 0 ? queue : tracks;
    if (list.length === 0 || !currentTrack) return;
    const idx = list.findIndex((t) => t.id === currentTrack.id);
    const nextIdx = idx === -1 ? 0 : (idx + 1) % list.length;
    const nextTrack = list[nextIdx];
    setCurrentTrack(nextTrack);
    loadAndPlay(nextTrack, true);
    recordPlay(nextTrack.id);
  }, [currentTrack, loadAndPlay, queue, recordPlay, tracks]);

  const playPrevious = useCallback(() => {
    const audio = audioRef.current;
    if (audio && audio.currentTime > 3) {
      audio.currentTime = 0;
      setCurrentTime(0);
      return;
    }
    const list = queue.length > 0 ? queue : tracks;
    if (list.length === 0 || !currentTrack) return;
    const idx = list.findIndex((t) => t.id === currentTrack.id);
    const prevIdx = idx <= 0 ? list.length - 1 : idx - 1;
    const prevTrack = list[prevIdx];
    setCurrentTrack(prevTrack);
    loadAndPlay(prevTrack, true);
    recordPlay(prevTrack.id);
  }, [currentTrack, loadAndPlay, queue, recordPlay, tracks]);

  const seek = useCallback((seconds: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    const maxDur = Number.isFinite(audio.duration) && audio.duration > 0 ? audio.duration : duration;
    const clamped = Math.max(0, Math.min(seconds, maxDur));
    if (audio.src) {
      audio.currentTime = clamped;
    }
    setCurrentTime(clamped);
  }, [duration]);

  const setVolume = useCallback((vol: number) => {
    const clamped = Math.max(0, Math.min(1, vol));
    setVolumeState(clamped);
    setIsMuted(clamped === 0);
    if (audioRef.current) {
      audioRef.current.volume = clamped;
      audioRef.current.muted = clamped === 0;
    }
  }, []);

  const toggleMute = useCallback(() => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    if (audioRef.current) {
      audioRef.current.muted = nextMuted;
    }
  }, [isMuted]);

  // Synchronisation des événements de l'élément <audio>
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleLoadedMetadata = () => {
      if (Number.isFinite(audio.duration) && audio.duration > 0) {
        setDuration(audio.duration);
      }
    };
    const handleEnded = () => {
      playNext();
    };
    const handlePause = () => setIsPlaying(false);
    const handlePlay = () => setIsPlaying(true);

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('play', handlePlay);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('play', handlePlay);
    };
  }, [playNext]);

  return (
    <AudioContext.Provider
      value={{
        currentTrack,
        queue,
        isPlaying,
        currentTime,
        duration,
        volume,
        isMuted,
        playTrack,
        togglePlay,
        playNext,
        playPrevious,
        seek,
        setVolume,
        toggleMute,
      }}
    >
      {children}
    </AudioContext.Provider>
  );
}

export function useAudio() {
  const ctx = useContext(AudioContext);
  if (!ctx) throw new Error('useAudio doit être utilisé dans un AudioProvider.');
  return ctx;
}
