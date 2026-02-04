'use client';

import React from "react"
// Native SpeechRecognition types
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

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Mic, MicOff, Loader2, GripVertical, Minimize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AIChatPopupProps {
  gameContext: {
    health: number;
    level: number;
    enemiesNearby: number;
    currentQuest: string;
  };
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

export function AIChatPopup({ gameContext, onSuggestion }: AIChatPopupProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: 'Greetings, adventurer! I am your dungeon guide. Ask me anything about the game or request strategic advice!',
      timestamp: Date.now(),
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [hasSpeechRecognition, setHasSpeechRecognition] = useState(false);

  // Draggable state
  const [position, setPosition] = useState<Position>({ x: 24, y: 100 });
  const [isDragging, setIsDragging] = useState(false);
  const dragOffset = useRef<Position>({ x: 0, y: 0 });

  // Resizable state
  const [size, setSize] = useState<Size>({ width: 320, height: 380 });
  const [isResizing, setIsResizing] = useState(false);
  const resizeStart = useRef<{ x: number; y: number; width: number; height: number }>({ x: 0, y: 0, width: 320, height: 380 });

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  // Handle dragging
  const handleDragStart = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    setIsDragging(true);
    dragOffset.current = {
      x: clientX - position.x,
      y: clientY - position.y,
    };
  }, [position]);

  const handleMouseMove = useCallback((e: MouseEvent | TouchEvent) => {
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    if (isDragging) {
      const newX = Math.max(0, Math.min(window.innerWidth - size.width, clientX - dragOffset.current.x));
      const newY = Math.max(0, Math.min(window.innerHeight - size.height, clientY - dragOffset.current.y));
      setPosition({ x: newX, y: newY });
    }
    if (isResizing) {
      const deltaX = clientX - resizeStart.current.x;
      const deltaY = clientY - resizeStart.current.y;
      const newWidth = Math.max(280, Math.min(500, resizeStart.current.width + deltaX));
      const newHeight = Math.max(280, Math.min(600, resizeStart.current.height + deltaY));
      setSize({ width: newWidth, height: newHeight });
    }
  }, [isDragging, isResizing, size.width, size.height]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setIsResizing(false);
  }, []);

  // Handle resize
  const handleResizeStart = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    setIsResizing(true);
    resizeStart.current = {
      x: clientX,
      y: clientY,
      width: size.width,
      height: size.height,
    };
  }, [size]);

  useEffect(() => {
    if (isDragging || isResizing) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('touchmove', handleMouseMove);
      window.addEventListener('touchend', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
        window.removeEventListener('touchmove', handleMouseMove);
        window.removeEventListener('touchend', handleMouseUp);
      };
    }
  }, [isDragging, isResizing, handleMouseMove, handleMouseUp]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Initialize speech recognition
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
          setInput(transcript);
          setIsListening(false);
        };

        recognitionRef.current.onerror = () => {
          setIsListening(false);
        };

        recognitionRef.current.onend = () => {
          setIsListening(false);
        };
      }
    }
  }, []);

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

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: input.trim(),
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage.content,
          gameContext,
        }),
      });

      if (response.ok) {
        const { reply, suggestedAction } = await response.json();

        const assistantMessage: ChatMessage = {
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          content: reply,
          timestamp: Date.now(),
        };

        setMessages((prev) => [...prev, assistantMessage]);

        if (suggestedAction && onSuggestion) {
          onSuggestion(suggestedAction);
        }
      } else {
        throw new Error('Failed to get response');
      }
    } catch {
      const errorMessage: ChatMessage = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: 'The magical connection seems unstable. Try again in a moment.',
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      e.stopPropagation();
      sendMessage();
    }
  };

  const quickPrompts = [
    'How do I attack?',
    'Where should I go?',
    'Any tips?',
  ];

  return (
    <>
      {/* Toggle Button - positioned absolutely within game container */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className={`
          absolute bottom-24 left-4 z-30
          w-12 h-12 rounded-full
          flex items-center justify-center
          border-2 transition-all duration-200
          ${isOpen
            ? 'bg-muted border-border text-muted-foreground'
            : 'bg-primary/90 border-primary text-primary-foreground shadow-lg shadow-primary/30'
          }
        `}
        aria-label="Toggle AI Chat"
      >
        {isOpen ? <X className="w-5 h-5" /> : <MessageCircle className="w-5 h-5" />}
      </motion.button>

      {/* Chat Popup - Draggable & Resizable */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            style={{
              position: 'fixed',
              left: position.x,
              top: position.y,
              width: isMinimized ? 200 : size.width,
              height: isMinimized ? 'auto' : size.height,
              zIndex: 50,
            }}
            className="bg-card border border-border rounded-lg shadow-2xl overflow-hidden flex flex-col"
          >
            {/* Draggable Header */}
            <div
              className="chat-header p-2.5 border-b border-border bg-muted/50 flex items-center gap-2 cursor-move select-none"
              onMouseDown={handleDragStart}
              onTouchStart={handleDragStart}
            >
              <GripVertical className="w-4 h-4 text-muted-foreground" />
              <MessageCircle className="w-4 h-4 text-primary" />
              <span className="text-xs font-medium text-foreground flex-1">Dungeon Guide</span>

              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="p-1 hover:bg-muted rounded transition-colors"
                aria-label={isMinimized ? 'Expand' : 'Minimize'}
              >
                <Minimize2 className="w-3 h-3 text-muted-foreground" />
              </button>

              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-destructive/20 rounded transition-colors"
                aria-label="Close"
              >
                <X className="w-3 h-3 text-muted-foreground" />
              </button>
            </div>

            {!isMinimized && (
              <>
                {/* Messages */}
                <div
                  className="flex-1 overflow-y-auto p-3 space-y-2.5"
                  style={{ maxHeight: size.height - 140 }}
                >
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`
                          max-w-[85%] rounded-lg px-2.5 py-1.5 text-xs leading-relaxed
                          ${msg.role === 'user'
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted text-foreground'
                          }
                        `}
                      >
                        {msg.content}
                      </div>
                    </div>
                  ))}

                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="bg-muted rounded-lg px-2.5 py-1.5 text-xs text-muted-foreground flex items-center gap-1.5">
                        <Loader2 className="w-3 h-3 animate-spin" />
                        Thinking...
                      </div>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>

                {/* Quick prompts */}
                <div className="px-2.5 pb-2 flex gap-1 flex-wrap">
                  {quickPrompts.map((prompt) => (
                    <button
                      key={prompt}
                      onClick={() => setInput(prompt)}
                      className="text-[9px] px-2 py-0.5 bg-muted hover:bg-muted/80 rounded-full text-muted-foreground transition-colors"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>

                {/* Input */}
                <div className="p-2.5 border-t border-border bg-muted/20">
                  <div className="flex gap-1.5">
                    <input
                      type="text"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="Ask for help..."
                      className="flex-1 bg-input border border-border rounded px-2.5 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50"
                      disabled={isLoading}
                    />

                    {/* Voice button */}
                    {hasSpeechRecognition && (
                      <Button
                        size="icon"
                        variant={isListening ? 'destructive' : 'outline'}
                        onClick={toggleVoice}
                        disabled={isLoading}
                        className="shrink-0 h-7 w-7"
                      >
                        {isListening ? <MicOff className="w-3 h-3" /> : <Mic className="w-3 h-3" />}
                      </Button>
                    )}

                    {/* Send button */}
                    <Button
                      size="icon"
                      onClick={sendMessage}
                      disabled={!input.trim() || isLoading}
                      className="shrink-0 h-7 w-7"
                    >
                      <Send className="w-3 h-3" />
                    </Button>
                  </div>
                </div>

                {/* Resize handle */}
                <div
                  className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize"
                  onMouseDown={handleResizeStart}
                  onTouchStart={handleResizeStart}
                >
                  <svg
                    className="w-4 h-4 text-muted-foreground/50"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M22 22H20V20H22V22ZM22 18H20V16H22V18ZM18 22H16V20H18V22ZM22 14H20V12H22V14ZM18 18H16V16H18V18ZM14 22H12V20H14V22Z" />
                  </svg>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
