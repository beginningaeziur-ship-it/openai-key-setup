import { useEffect, useRef, useState } from 'react';
import type { SceneType } from '@/components/sai-room/SceneBackground';

// Calming ambient sound URLs - using gentle, continuous sounds
const ambientSounds: Record<SceneType, string> = {
  bedroom: 'https://assets.mixkit.co/active_storage/sfx/212/212-preview.mp3', // Soft wind/white noise
  cabin: 'https://assets.mixkit.co/active_storage/sfx/1164/1164-preview.mp3', // Fire crackling
  ocean: 'https://assets.mixkit.co/active_storage/sfx/2432/2432-preview.mp3', // Ocean waves  
  woods: 'https://assets.mixkit.co/active_storage/sfx/2433/2433-preview.mp3', // Forest birds/nature
};

interface UseAmbientSoundOptions {
  volume?: number;
  enabled?: boolean;
}

export function useAmbientSound(
  scene: SceneType,
  options: UseAmbientSoundOptions = {}
) {
  const { volume = 0.15, enabled = true } = options;
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(() => {
    return localStorage.getItem('sai_ambient_muted') === 'true';
  });

  useEffect(() => {
    if (!enabled) return;

    const soundUrl = ambientSounds[scene];
    if (!soundUrl) return;

    // Clean up previous audio
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = '';
    }

    const audio = new Audio(soundUrl);
    audio.loop = true;
    audio.volume = isMuted ? 0 : volume;
    audioRef.current = audio;

    // Try to play (may be blocked by autoplay policies)
    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => setIsPlaying(true))
        .catch(() => {
          // Autoplay blocked - will need user interaction
          setIsPlaying(false);
        });
    }

    return () => {
      audio.pause();
      audio.src = '';
      audioRef.current = null;
    };
  }, [scene, enabled]);

  // Update volume when it changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  const toggleMute = () => {
    const newMuted = !isMuted;
    setIsMuted(newMuted);
    localStorage.setItem('sai_ambient_muted', String(newMuted));
  };

  const play = async () => {
    if (audioRef.current && !isPlaying) {
      try {
        await audioRef.current.play();
        setIsPlaying(true);
      } catch (err) {
        console.log('Audio play failed:', err);
      }
    }
  };

  const pause = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  return {
    isPlaying,
    isMuted,
    toggleMute,
    play,
    pause,
  };
}
