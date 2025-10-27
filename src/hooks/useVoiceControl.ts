/**
 * Voice Control Hook
 * Implements Web Speech API for voice commands in the California puzzle game
 * WCAG 2.1 AAA compliance for speech input alternative
 */

import { useEffect, useState, useCallback, useRef } from 'react';

export interface VoiceCommand {
  command: string;
  action: () => void;
  description: string;
  aliases?: string[];
}

export interface VoiceControlOptions {
  enabled: boolean;
  language?: string;
  continuous?: boolean;
  interimResults?: boolean;
  maxAlternatives?: number;
}

export interface VoiceControlState {
  isListening: boolean;
  isSupported: boolean;
  lastCommand: string | null;
  error: string | null;
  confidence: number;
}

const DEFAULT_LANGUAGE = 'en-US';
const CONFIDENCE_THRESHOLD = 0.7;

// Type for Web Speech API (may not be available in all browsers)
type SpeechRecognition = unknown;

export function useVoiceControl(
  commands: VoiceCommand[],
  options: VoiceControlOptions = { enabled: false }
) {
  const [state, setState] = useState<VoiceControlState>({
    isListening: false,
    isSupported: false,
    lastCommand: null,
    error: null,
    confidence: 0,
  });

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const commandMapRef = useRef<Map<string, VoiceCommand>>(new Map());

  // Check browser support
  useEffect(() => {
    const SpeechRecognition =
      (window as Window & { SpeechRecognition?: unknown; webkitSpeechRecognition?: unknown })
        .SpeechRecognition ||
      (window as Window & { SpeechRecognition?: unknown; webkitSpeechRecognition?: unknown })
        .webkitSpeechRecognition;

    if (SpeechRecognition) {
      setState((prev) => ({ ...prev, isSupported: true }));
    } else {
      setState((prev) => ({
        ...prev,
        isSupported: false,
        error: 'Speech recognition not supported',
      }));
    }
  }, []);

  // Build command map with aliases
  useEffect(() => {
    const commandMap = new Map<string, VoiceCommand>();

    commands.forEach((cmd) => {
      // Add main command
      commandMap.set(cmd.command.toLowerCase(), cmd);

      // Add aliases
      if (cmd.aliases) {
        cmd.aliases.forEach((alias) => {
          commandMap.set(alias.toLowerCase(), cmd);
        });
      }
    });

    commandMapRef.current = commandMap;
  }, [commands]);

  // Initialize speech recognition
  useEffect(() => {
    if (!state.isSupported || !options.enabled) {
      return;
    }

    const SpeechRecognition =
      (window as Window & { SpeechRecognition?: unknown; webkitSpeechRecognition?: unknown })
        .SpeechRecognition ||
      (window as Window & { SpeechRecognition?: unknown; webkitSpeechRecognition?: unknown })
        .webkitSpeechRecognition;

    // @ts-expect-error - SpeechRecognition API not fully typed
    const recognition = new SpeechRecognition();
    recognition.lang = options.language || DEFAULT_LANGUAGE;
    recognition.continuous = options.continuous ?? true;
    recognition.interimResults = options.interimResults ?? false;
    recognition.maxAlternatives = options.maxAlternatives ?? 1;

    recognition.onstart = () => {
      setState((prev) => ({
        ...prev,
        isListening: true,
        error: null,
      }));
    };

    recognition.onend = () => {
      setState((prev) => ({ ...prev, isListening: false }));

      // Auto-restart if still enabled
      if (options.enabled) {
        try {
          recognition.start();
        } catch {
          // Failed to restart recognition
        }
      }
    };

    recognition.onerror = (event: { error: string }) => {
      let errorMessage = 'Unknown error';
      switch (event.error) {
        case 'no-speech':
          errorMessage = 'No speech detected';
          break;
        case 'audio-capture':
          errorMessage = 'Microphone not available';
          break;
        case 'not-allowed':
          errorMessage = 'Microphone permission denied';
          break;
        case 'network':
          errorMessage = 'Network error';
          break;
        default:
          errorMessage = `Error: ${event.error}`;
      }

      setState((prev) => ({
        ...prev,
        error: errorMessage,
        isListening: false,
      }));
    };

    recognition.onresult = (event: {
      results: Array<Array<{ transcript: string; confidence: number }>>;
    }) => {
      const last = event.results.length - 1;
      const result = event.results[last];
      const transcript = result[0].transcript.toLowerCase().trim();
      const confidence = result[0].confidence;

      setState((prev) => ({
        ...prev,
        lastCommand: transcript,
        confidence,
        error: null,
      }));

      // Process command if confidence is high enough
      if (confidence >= CONFIDENCE_THRESHOLD) {
        processVoiceCommand(transcript);
      } else {
        setState((prev) => ({
          ...prev,
          error: `Low confidence (${Math.round(confidence * 100)}%). Please try again.`,
        }));
      }
    };

    recognitionRef.current = recognition;

    // Start recognition
    try {
      recognition.start();
    } catch {
      // Failed to start recognition
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
        recognitionRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.isSupported, options.enabled, options.language, options.continuous]);

  // Process voice command
  const processVoiceCommand = useCallback((transcript: string) => {
    const commandMap = commandMapRef.current;

    // Try exact match first
    let command = commandMap.get(transcript);

    // Try partial match if no exact match
    if (!command) {
      for (const [key, cmd] of commandMap.entries()) {
        if (transcript.includes(key) || key.includes(transcript)) {
          command = cmd;
          break;
        }
      }
    }

    if (command) {
      try {
        command.action();
      } catch {
        setState((prev) => ({
          ...prev,
          error: 'Failed to execute command',
        }));
      }
    } else {
      setState((prev) => ({
        ...prev,
        error: `Unknown command: "${transcript}"`,
      }));
    }
  }, []);

  // Manual controls
  const startListening = useCallback(() => {
    if (recognitionRef.current && !state.isListening) {
      try {
        recognitionRef.current.start();
      } catch {
        // Failed to start listening
      }
    }
  }, [state.isListening]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current && state.isListening) {
      recognitionRef.current.stop();
    }
  }, [state.isListening]);

  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  return {
    ...state,
    startListening,
    stopListening,
    clearError,
  };
}

// Common voice commands for the game
export const createGameVoiceCommands = (
  onDropCounty: () => void,
  onZoomIn: () => void,
  onZoomOut: () => void,
  onReset: () => void,
  onHint: () => void,
  onUndo: () => void,
  onSettings: () => void,
  onHelp: () => void
): VoiceCommand[] => [
  {
    command: 'drop county',
    action: onDropCounty,
    description: 'Drop the currently selected county',
    aliases: ['place county', 'drop', 'place'],
  },
  {
    command: 'zoom in',
    action: onZoomIn,
    description: 'Zoom in on the map',
    aliases: ['zoom', 'enlarge', 'bigger'],
  },
  {
    command: 'zoom out',
    action: onZoomOut,
    description: 'Zoom out of the map',
    aliases: ['unzoom', 'smaller', 'shrink'],
  },
  {
    command: 'reset',
    action: onReset,
    description: 'Reset the current puzzle',
    aliases: ['restart', 'start over', 'clear'],
  },
  {
    command: 'show hint',
    action: onHint,
    description: 'Show a hint for the puzzle',
    aliases: ['hint', 'help me', 'clue'],
  },
  {
    command: 'undo',
    action: onUndo,
    description: 'Undo the last move',
    aliases: ['go back', 'revert', 'undo last'],
  },
  {
    command: 'settings',
    action: onSettings,
    description: 'Open settings menu',
    aliases: ['options', 'preferences', 'configure'],
  },
  {
    command: 'help',
    action: onHelp,
    description: 'Show help information',
    aliases: ['instructions', 'how to play', 'tutorial'],
  },
];
