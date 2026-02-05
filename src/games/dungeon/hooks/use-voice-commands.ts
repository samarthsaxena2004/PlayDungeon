'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import SpeechRecognition from 'SpeechRecognition'; // Import SpeechRecognition

// Command types that the voice system can handle
export interface VoiceCommand {
  type: 'move' | 'turn' | 'attack' | 'interact' | 'stop' | 'help' | 'unknown';
  direction?: 'up' | 'down' | 'left' | 'right' | 'forward' | 'backward';
  count?: number;
  raw: string;
}

interface UseVoiceCommandsProps {
  onCommand: (command: VoiceCommand) => void;
  onTranscript?: (text: string) => void;
  enabled?: boolean;
}

// Number words to digits mapping
const NUMBER_WORDS: Record<string, number> = {
  'one': 1, 'two': 2, 'three': 3, 'four': 4, 'five': 5,
  'six': 6, 'seven': 7, 'eight': 8, 'nine': 9, 'ten': 10,
  'eleven': 11, 'twelve': 12, 'thirteen': 13, 'fourteen': 14, 'fifteen': 15,
  'sixteen': 16, 'seventeen': 17, 'eighteen': 18, 'nineteen': 19, 'twenty': 20,
  'once': 1, 'twice': 2, 'thrice': 3,
};

// Direction aliases
const DIRECTION_ALIASES: Record<string, 'up' | 'down' | 'left' | 'right'> = {
  'up': 'up', 'north': 'up', 'forward': 'up', 'forwards': 'up', 'ahead': 'up',
  'down': 'down', 'south': 'down', 'backward': 'down', 'backwards': 'down', 'back': 'down',
  'left': 'left', 'west': 'left',
  'right': 'right', 'east': 'right',
};

// Parse a number from text (handles both digits and words)
function parseNumber(text: string): number | undefined {
  // Check for digit
  const digitMatch = text.match(/\d+/);
  if (digitMatch) {
    return parseInt(digitMatch[0], 10);
  }

  // Check for number words
  const words = text.toLowerCase().split(/\s+/);
  for (const word of words) {
    if (NUMBER_WORDS[word]) {
      return NUMBER_WORDS[word];
    }
  }

  return undefined;
}

// Parse direction from text
function parseDirection(text: string): 'up' | 'down' | 'left' | 'right' | undefined {
  const lower = text.toLowerCase();

  for (const [alias, direction] of Object.entries(DIRECTION_ALIASES)) {
    if (lower.includes(alias)) {
      return direction;
    }
  }

  return undefined;
}

// Parse a voice command from natural language
export function parseVoiceCommand(text: string): VoiceCommand {
  const lower = text.toLowerCase().trim();

  // Stop commands
  if (lower.includes('stop') || lower.includes('halt') || lower.includes('wait') || lower.includes('pause')) {
    return { type: 'stop', raw: text };
  }

  // Help commands
  if (lower.includes('help') || lower.includes('what can') || lower.includes('how do')) {
    return { type: 'help', raw: text };
  }

  // Attack/shoot commands
  if (lower.includes('attack') || lower.includes('shoot') || lower.includes('fire') ||
    lower.includes('blast') || lower.includes('hit') || lower.includes('kill')) {
    const count = parseNumber(lower) || 1;
    return { type: 'attack', count, raw: text };
  }

  // Interact commands
  if (lower.includes('interact') || lower.includes('use') || lower.includes('pick') ||
    lower.includes('grab') || lower.includes('collect') || lower.includes('open') ||
    lower.includes('click e') || lower.includes('press e') || lower.includes('talk')) {
    return { type: 'interact', raw: text };
  }

  // Turn commands (change direction without moving)
  if (lower.includes('turn') || lower.includes('face') || lower.includes('look')) {
    const direction = parseDirection(lower);
    if (direction) {
      return { type: 'turn', direction, raw: text };
    }
  }

  // Move commands
  if (lower.includes('move') || lower.includes('go') || lower.includes('walk') ||
    lower.includes('run') || lower.includes('step') || lower.includes('block')) {
    const direction = parseDirection(lower);
    const count = parseNumber(lower) || 1;

    if (direction) {
      return { type: 'move', direction, count, raw: text };
    }

    // If no direction specified but has a number, assume forward
    if (count > 1) {
      return { type: 'move', direction: 'up', count, raw: text };
    }
  }

  // Direction-only commands (e.g., "left 5", "up", "right 10 times")
  const direction = parseDirection(lower);
  if (direction) {
    const count = parseNumber(lower) || 1;
    return { type: 'move', direction, count, raw: text };
  }

  return { type: 'unknown', raw: text };
}

export function useVoiceCommands({ onCommand, onTranscript, enabled = true }: UseVoiceCommandsProps) {
  const [isListening, setIsListening] = useState(false);
  const [isContinuousMode, setIsContinuousMode] = useState(false);
  const [lastTranscript, setLastTranscript] = useState('');
  const [isSupported, setIsSupported] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const restartTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && (window.SpeechRecognition || window.webkitSpeechRecognition)) {
      setIsSupported(true);
    }
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined' && (window.SpeechRecognition || window.webkitSpeechRecognition)) {
      setIsSupported(true);
    }
  }, []);

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (SpeechRecognitionAPI && typeof window !== 'undefined') {
      recognitionRef.current = new SpeechRecognitionAPI();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event) => {
        const result = event.results[event.results.length - 1];
        const transcript = result[0].transcript;

        setLastTranscript(transcript);
        onTranscript?.(transcript);

        // Only process final results
        if (result.isFinal) {
          const command = parseVoiceCommand(transcript);
          onCommand(command);
        }
      };

      recognitionRef.current.onerror = (event) => {
        console.error('[v0] Voice recognition error:', event.error);
        if (event.error !== 'no-speech' && event.error !== 'aborted') {
          setIsListening(false);
        }
      };

      recognitionRef.current.onend = () => {
        // If in continuous mode, restart after a brief pause
        if (isContinuousMode && enabled) {
          restartTimeoutRef.current = setTimeout(() => {
            if (recognitionRef.current && isContinuousMode) {
              try {
                recognitionRef.current.start();
              } catch {
                // Already started, ignore
              }
            }
          }, 100);
        } else {
          setIsListening(false);
        }
      };
    }

    return () => {
      if (restartTimeoutRef.current) {
        clearTimeout(restartTimeoutRef.current);
      }
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, [onCommand, onTranscript, isContinuousMode, enabled]);

  // Start listening for a single command
  const startListening = useCallback(() => {
    if (!recognitionRef.current || !enabled) return;

    try {
      setIsListening(true);
      setIsContinuousMode(false);
      recognitionRef.current.start();
    } catch {
      // Already started
    }
  }, [enabled]);

  // Stop listening
  const stopListening = useCallback(() => {
    if (!recognitionRef.current) return;

    setIsListening(false);
    setIsContinuousMode(false);

    if (restartTimeoutRef.current) {
      clearTimeout(restartTimeoutRef.current);
    }

    try {
      recognitionRef.current.stop();
    } catch {
      // Not started
    }
  }, []);

  // Toggle continuous listening mode (for hands-free gameplay)
  const toggleContinuousMode = useCallback(() => {
    if (!recognitionRef.current || !enabled) return;

    if (isContinuousMode) {
      stopListening();
    } else {
      setIsContinuousMode(true);
      setIsListening(true);
      try {
        recognitionRef.current.start();
      } catch {
        // Already started
      }
    }
  }, [isContinuousMode, stopListening, enabled]);

  return {
    isListening,
    isContinuousMode,
    isSupported,
    lastTranscript,
    startListening,
    stopListening,
    toggleContinuousMode,
  };
}
