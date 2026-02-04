'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useTambo } from "@tambo-ai/react";
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Mic, MicOff, Loader2, GripVertical, Minimize2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

// --- Types ---

interface SpeechRecognitionEvent extends Event {
  results: {
    [index: number]: {
      [index: number]: {
        transcript: string;
      };
    };
  } & { length: number };
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: any) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}

interface AIChatPopupProps {
  gameContext: {
    health: number;
    level: number;
    enemiesNearby: number;
    currentQuest: string;
  };
  activeEvent?: {
    id: string;
    text: string;
    type: string;
  };
  onResolve?: () => void;
  onSuggestion?: (action: string) => void;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

interface Position {
  x: number;
  y: number;
}

interface Size {
  width: number;
  height: number;
}

// --- Component ---

export function AIChatPopup({ gameContext, onSuggestion, activeEvent, onResolve }: AIChatPopupProps) {
  // Tambo Hook
  const tambo = useTambo();
  // Safe destructuring with fallbacks
  const { messages: tamboMessages, send, isThinking } = (tambo || { messages: [], send: () => { }, isThinking: false }) as any;

  // Local State
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [hasSpeechRecognition, setHasSpeechRecognition] = useState(false);

  // Window State
  const [position, setPosition] = useState<Position>({ x: 24, y: 100 });
  const [size, setSize] = useState<Size>({ width: 340, height: 450 });
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);

  // Refs
  const dragOffset = useRef<Position>({ x: 0, y: 0 });
  const resizeStart = useRef<{ x: number; y: number; width: number; height: number }>({ x: 0, y: 0, width: 0, height: 0 });
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  // --- Helpers ---

  // Map messages to our format
  const messages: ChatMessage[] = (tamboMessages || []).map((msg: any, index: number) => ({
    id: msg.id || `msg-${index}-${new Date().getTime()}`,
    role: msg.role === 'model' ? 'assistant' : msg.role,
    content: msg.content,
    timestamp: msg.createdAt ? new Date(msg.createdAt).getTime() : Date.now(),
  }));

  // Add welcome message if empty
  if (messages.length === 0) {
    messages.push({
      id: 'welcome',
      role: 'assistant',
      content: "I am the Dungeon Spirit. I see all. Ask me for guidance, or speak your will to control your fate.",
      timestamp: Date.now(),
    });
  }

  // --- Effects ---

  // 1. Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length, isOpen]);

  // 2. Initialize Speech Recognition
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognitionAPI) {
        setHasSpeechRecognition(true);
        recognitionRef.current = new SpeechRecognitionAPI();
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = false;

        recognitionRef.current.onresult = (event: SpeechRecognitionEvent) => {
          const transcript = event.results[0][0].transcript;
          if (transcript.trim()) {
            // Auto-submit voice
            handleSendMessage(transcript);
          }
          setIsListening(false);
        };

        recognitionRef.current.onerror = () => setIsListening(false);
        recognitionRef.current.onend = () => setIsListening(false);
      }
    }
  }, []); // Run once

  // 3. Handle Active Game Events (Narrative Interruption)
  useEffect(() => {
    if (activeEvent?.id) {
      setIsOpen(true);
      if (isMinimized) setIsMinimized(false);

      const contextStr = formatContext();
      const prompt = `[SYSTEM EVENT: The player just encountered "${activeEvent.text}". Pause the game narrative and describe this event dramatically in 2 sentences. Context: ${contextStr}]`;

      // We rely on the parent to not re-trigger this same event ID
      send({ role: 'user', content: prompt });
    }
  }, [activeEvent?.id]);

  // 4. Parse AI Responses for Commands
  useEffect(() => {
    const lastMsg = messages[messages.length - 1];
    if (lastMsg?.role === 'assistant' && onSuggestion) {
      // Regex to find [ACTION: COMMAND]
      const actionMatch = lastMsg.content.match(/\[ACTION:\s*([A-Z_]+)\]/i);
      if (actionMatch) {
        const action = actionMatch[1].toUpperCase();
        console.log('[AIChat] AI commanded:', action);
        onSuggestion(action);
      }
    }
  }, [messages.length]); // Only run when message count changes

  // --- Handlers ---

  const formatContext = () => {
    return `HP:${gameContext.health} | LVL:${gameContext.level} | Enm:${gameContext.enemiesNearby} | Q:${gameContext.currentQuest}`;
  };

  const handleSendMessage = async (textOverride?: string) => {
    const text = textOverride || input;
    if (!text.trim() || isThinking) return;

    setInput('');

    // Inject context seamlessly
    const fullContent = `${text} \n\n[System Context: ${formatContext()}. If the user asks to perform an action, append '[ACTION: COMMAND_NAME]' to the end of your response. Valid commands: ATTACK, INTERACT, MOVE_UP, MOVE_DOWN, MOVE_LEFT, MOVE_RIGHT]`;

    try {
      await send({ content: fullContent });
    } catch (err) {
      console.error("Failed to send to Tambo:", err);
    }
  };

  const toggleVoice = () => {
    if (!recognitionRef.current) return;
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  // Drag & Resize Logic
  const handleDragStart = (e: React.MouseEvent | React.TouchEvent) => {
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    setIsDragging(true);
    dragOffset.current = { x: clientX - position.x, y: clientY - position.y };
  };

  const handleResizeStart = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    setIsResizing(true);
    resizeStart.current = { x: clientX, y: clientY, width: size.width, height: size.height };
  };

  useEffect(() => {
    const handleMove = (e: MouseEvent | TouchEvent) => {
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

      if (isDragging) {
        // Clamp to screen
        const newX = Math.min(Math.max(0, clientX - dragOffset.current.x), window.innerWidth - 100);
        const newY = Math.min(Math.max(0, clientY - dragOffset.current.y), window.innerHeight - 100);
        setPosition({ x: newX, y: newY });
      }
      if (isResizing) {
        const dx = clientX - resizeStart.current.x;
        const dy = clientY - resizeStart.current.y;
        setSize({
          width: Math.max(280, Math.min(800, resizeStart.current.width + dx)),
          height: Math.max(300, Math.min(800, resizeStart.current.height + dy))
        });
      }
    };
    const handleUp = () => { setIsDragging(false); setIsResizing(false); };

    if (isDragging || isResizing) {
      window.addEventListener('mousemove', handleMove);
      window.addEventListener('mouseup', handleUp);
      window.addEventListener('touchmove', handleMove);
      window.addEventListener('touchend', handleUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleUp);
      window.removeEventListener('touchmove', handleMove);
      window.removeEventListener('touchend', handleUp);
    };
  }, [isDragging, isResizing]);

  // --- Render ---

  return (
    <>
      {/* 1. Floating Toggle Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, rotate: -90 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, rotate: 90 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsOpen(true)}
            className="absolute bottom-24 left-6 z-40 w-14 h-14 rounded-full bg-primary border-2 border-primary-foreground/20 shadow-[0_0_20px_rgba(0,0,0,0.5)] flex items-center justify-center text-primary-foreground overflow-hidden group"
          >
            <div className="absolute inset-0 bg-gradient-to-tr from-black/20 to-transparent" />
            <Sparkles className="w-6 h-6 animate-pulse" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* 2. Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", bounce: 0.3 }}
            style={{
              position: 'fixed',
              left: position.x,
              top: position.y,
              width: isMinimized ? 240 : size.width,
              height: isMinimized ? 'auto' : size.height,
              zIndex: 50
            }}
            className="flex flex-col bg-card/95 backdrop-blur-md border border-white/10 rounded-xl shadow-2xl overflow-hidden ring-1 ring-black/5"
          >
            {/* Header */}
            <div
              className="h-10 bg-gradient-to-r from-primary/10 to-transparent border-b border-border flex items-center px-2 gap-2 cursor-move select-none"
              onMouseDown={handleDragStart}
              onTouchStart={handleDragStart}
            >
              <GripVertical className="w-4 h-4 text-muted-foreground/50" />
              <span className="text-xs font-bold tracking-wider text-primary uppercase flex-1">
                AI Companion
              </span>

              {/* Controls */}
              <button onClick={() => setIsMinimized(!isMinimized)} className="p-1.5 hover:bg-white/10 rounded-md transition-colors">
                <Minimize2 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => {
                  setIsOpen(false);
                  onResolve?.(); // Resume game if paused
                }}
                className="p-1.5 hover:bg-destructive/20 hover:text-destructive rounded-md transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Body */}
            {!isMinimized && (
              <>
                <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-primary/20 scrollbar-track-transparent">
                  {messages.map((msg) => (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      key={msg.id}
                      className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`
                        max-w-[85%] rounded-2xl px-4 py-2.5 text-xs md:text-sm leading-relaxed shadow-sm
                        ${msg.role === 'user'
                          ? 'bg-primary text-primary-foreground rounded-br-none'
                          : 'bg-muted text-foreground rounded-bl-none border border-white/5'
                        }
                      `}>
                        {msg.content}
                      </div>
                    </motion.div>
                  ))}

                  {isThinking && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex justify-start"
                    >
                      <div className="bg-muted/50 rounded-full px-3 py-1 text-xs text-muted-foreground flex items-center gap-2">
                        <Loader2 className="w-3 h-3 animate-spin" />
                        <span>Divining response...</span>
                      </div>
                    </motion.div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Footer */}
                <div className="p-3 bg-muted/20 border-t border-white/5 space-y-3">
                  {/* Quick Prompts */}
                  <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                    {['Advice?', 'Heal me!', 'Attack!', 'Where to?'].map(txt => (
                      <button
                        key={txt}
                        onClick={() => handleSendMessage(txt)}
                        className="whitespace-nowrap px-3 py-1 rounded-full bg-background border border-border text-[10px] hover:bg-primary hover:text-primary-foreground transition-colors"
                      >
                        {txt}
                      </button>
                    ))}
                  </div>

                  {/* Input Area */}
                  <div className="flex gap-2 relative">
                    <input
                      value={input}
                      onChange={e => setInput(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
                      placeholder={isListening ? "Listening..." : "Message the spirit..."}
                      className="flex-1 bg-background/50 border border-input rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all placeholder:text-muted-foreground/50"
                      disabled={isThinking}
                    />

                    {hasSpeechRecognition && (
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={toggleVoice}
                        className={`
                          absolute right-12 top-0.5 h-[calc(100%-4px)] w-8
                          ${isListening ? 'text-destructive animate-pulse' : 'text-muted-foreground'}
                        `}
                      >
                        {isListening ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
                      </Button>
                    )}

                    <Button
                      size="icon"
                      onClick={() => handleSendMessage()}
                      disabled={!input.trim() || isThinking}
                      className="shrink-0"
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Rezizer */}
                <div
                  className="absolute bottom-0 right-0 w-6 h-6 cursor-se-resize flex items-end justify-end p-1 opacity-50 hover:opacity-100"
                  onMouseDown={handleResizeStart}
                  onTouchStart={handleResizeStart}
                >
                  <div className="w-2 h-2 border-r-2 border-b-2 border-foreground/30" />
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
