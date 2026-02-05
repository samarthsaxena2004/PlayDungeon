'use client';

import { useCallback, useRef, useEffect, useState } from 'react';

// Sound configuration
const SOUNDS = {
  // Background music - soft ambient dungeon theme
  bgMusic: {
    url: 'https://assets.mixkit.co/music/preview/mixkit-deep-urban-623.mp3',
    volume: 0.25,
    loop: true,
  },
  // Combat sounds - fireball whoosh/fire sound
  fireball: {
    url: 'https://assets.mixkit.co/active_storage/sfx/1669/1669-preview.mp3',
    volume: 0.5,
    loop: false,
  },
  hit: {
    url: 'https://assets.mixkit.co/active_storage/sfx/2785/2785-preview.mp3',
    volume: 0.5,
    loop: false,
  },
  enemyDeath: {
    url: 'https://assets.mixkit.co/active_storage/sfx/2019/2019-preview.mp3',
    volume: 0.4,
    loop: false,
  },
  playerHurt: {
    url: 'https://assets.mixkit.co/active_storage/sfx/2053/2053-preview.mp3',
    volume: 0.5,
    loop: false,
  },
  // Interaction sounds
  pickup: {
    url: 'https://assets.mixkit.co/active_storage/sfx/2000/2000-preview.mp3',
    volume: 0.5,
    loop: false,
  },
  npcTalk: {
    url: 'https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3',
    volume: 0.4,
    loop: false,
  },
  portal: {
    url: 'https://assets.mixkit.co/active_storage/sfx/1995/1995-preview.mp3',
    volume: 0.5,
    loop: false,
  },
  // UI sounds
  storyNotification: {
    url: 'https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3',
    volume: 0.3,
    loop: false,
  },
  levelUp: {
    url: 'https://assets.mixkit.co/active_storage/sfx/1997/1997-preview.mp3',
    volume: 0.5,
    loop: false,
  },
  victory: {
    url: 'https://assets.mixkit.co/active_storage/sfx/2020/2020-preview.mp3',
    volume: 0.5,
    loop: false,
  },
  gameOver: {
    url: 'https://assets.mixkit.co/active_storage/sfx/2028/2028-preview.mp3',
    volume: 0.5,
    loop: false,
  },
  danger: {
    url: 'https://assets.mixkit.co/active_storage/sfx/2867/2867-preview.mp3',
    volume: 0.4,
    loop: false,
  },
} as const;

type SoundName = keyof typeof SOUNDS;

export function useGameSounds() {
  const audioRefs = useRef<Map<SoundName, HTMLAudioElement>>(new Map());
  const bgMusicRef = useRef<HTMLAudioElement | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [musicVolume, setMusicVolume] = useState(0.3);
  const [sfxVolume, setSfxVolume] = useState(0.5);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize audio elements
  const initializeAudio = useCallback(() => {
    if (isInitialized) return;
    
    Object.entries(SOUNDS).forEach(([name, config]) => {
      const audio = new Audio();
      audio.src = config.url;
      audio.volume = config.volume;
      audio.loop = config.loop;
      audio.preload = 'auto';
      audioRefs.current.set(name as SoundName, audio);
      
      if (name === 'bgMusic') {
        bgMusicRef.current = audio;
      }
    });
    
    setIsInitialized(true);
  }, [isInitialized]);

  // Play a sound effect
  const playSound = useCallback((name: SoundName) => {
    if (isMuted) return;
    
    const audio = audioRefs.current.get(name);
    if (audio) {
      // Clone for overlapping sounds
      if (!SOUNDS[name].loop) {
        const clone = audio.cloneNode() as HTMLAudioElement;
        clone.volume = SOUNDS[name].volume * sfxVolume;
        clone.play().catch(() => {});
        clone.onended = () => clone.remove();
      } else {
        audio.volume = SOUNDS[name].volume * musicVolume;
        audio.play().catch(() => {});
      }
    }
  }, [isMuted, sfxVolume, musicVolume]);

  // Stop a sound
  const stopSound = useCallback((name: SoundName) => {
    const audio = audioRefs.current.get(name);
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }
  }, []);

  // Start background music with proper loop handling
  const startMusic = useCallback(() => {
    if (bgMusicRef.current && !isMuted) {
      bgMusicRef.current.volume = SOUNDS.bgMusic.volume * musicVolume;
      bgMusicRef.current.loop = true;
      
      // Handle loop continuity
      const handleEnded = () => {
        if (bgMusicRef.current) {
          bgMusicRef.current.currentTime = 0;
          bgMusicRef.current.play().catch(() => {});
        }
      };
      bgMusicRef.current.removeEventListener('ended', handleEnded);
      bgMusicRef.current.addEventListener('ended', handleEnded);
      
      bgMusicRef.current.play().catch(() => {});
    }
  }, [isMuted, musicVolume]);

  // Stop background music
  const stopMusic = useCallback(() => {
    if (bgMusicRef.current) {
      bgMusicRef.current.pause();
      bgMusicRef.current.currentTime = 0;
    }
  }, []);

  // Toggle mute
  const toggleMute = useCallback(() => {
    setIsMuted(prev => {
      const newMuted = !prev;
      if (newMuted && bgMusicRef.current) {
        bgMusicRef.current.pause();
      } else if (!newMuted && bgMusicRef.current) {
        bgMusicRef.current.play().catch(() => {});
      }
      return newMuted;
    });
  }, []);

  // Update volumes
  const updateMusicVolume = useCallback((vol: number) => {
    setMusicVolume(vol);
    if (bgMusicRef.current) {
      bgMusicRef.current.volume = SOUNDS.bgMusic.volume * vol;
    }
  }, []);

  const updateSfxVolume = useCallback((vol: number) => {
    setSfxVolume(vol);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      audioRefs.current.forEach(audio => {
        audio.pause();
        audio.src = '';
      });
      audioRefs.current.clear();
    };
  }, []);

  return {
    initializeAudio,
    playSound,
    stopSound,
    startMusic,
    stopMusic,
    toggleMute,
    isMuted,
    musicVolume,
    sfxVolume,
    updateMusicVolume,
    updateSfxVolume,
    isInitialized,
  };
}

export type { SoundName };
