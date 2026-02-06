'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageCircle, X, Send, Mic, MicOff, Loader2,
  GripVertical, Maximize2, Minimize2, Sparkles,
  ChevronDown, Heart, Sword, Map, Trophy
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTamboThread, useTamboVoice } from '@tambo-ai/react';

interface TamboGameChatProps {
  gameContext: {
    health: number;
    maxHealth: number;
    level: number;
    score: number;
    enemiesNearby: number;
    enemiesDefeated: number;
    currentQuest: string;
    playerX: number;
    playerY: number;
  };
  onGameAction?: (action: string) => void;
  docked?: boolean;
  className?: string; // Additional custom classes
}

// Quick prompts for common questions
const QUICK_PROMPTS = [
  { label: 'My Stats', prompt: 'Show my current player stats', icon: Heart },
  { label: 'How to Attack', prompt: 'How do I attack enemies?', icon: Sword },
  { label: 'Strategy', prompt: 'What should I do next?', icon: Map },
  { label: 'Quest Progress', prompt: 'Show my quest progress', icon: Trophy },
];

// Messages are now handled by Tambo SDK


export function TamboGameChat({ gameContext, onGameAction, docked = false, className = '' }: TamboGameChatProps) {
  // Tambo SDK hooks
  // Note: We're using the hook which provides streaming state. 
  // If the SDK version changes, ensure this destructuring matches.
  const { thread, sendThreadMessage, streaming } = useTamboThread();
  const { isRecording, startRecording, stopRecording } = useTamboVoice();

  const messages = thread?.messages || [];

  // Local state to track "thinking" if streaming hangs, or to provide immediate feedback
  const [isThinking, setIsThinking] = useState(false);
  const thinkingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Sync local thinking state with SDK streaming
    if (streaming) {
      setIsThinking(true);
      // Clear any existing timeout
      if (thinkingTimeoutRef.current) clearTimeout(thinkingTimeoutRef.current);

      // Safety timeout: if checking takes too long (e.g. 15s) without completion, force stop thinking UI
      thinkingTimeoutRef.current = setTimeout(() => {
        setIsThinking(false);
      }, 15000);
    } else {
      setIsThinking(false);
      if (thinkingTimeoutRef.current) clearTimeout(thinkingTimeoutRef.current);
    }

    return () => {
      if (thinkingTimeoutRef.current) clearTimeout(thinkingTimeoutRef.current);
    };
  }, [streaming]);

  const toggleListening = useCallback(() => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  }, [isRecording, startRecording, stopRecording]);

  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [showQuickPrompts, setShowQuickPrompts] = useState(true);
  const [input, setInput] = useState('');

  // Draggable state - position from bottom-left
  const [position, setPosition] = useState({ x: 70, y: 80 });
  const [isDragging, setIsDragging] = useState(false);
  const dragOffset = useRef({ x: 0, y: 0 });

  // Resizable state - slightly smaller default
  const [size, setSize] = useState({ width: 320, height: 380 });
  const [isResizing, setIsResizing] = useState(false);
  const resizeStart = useRef({ x: 0, y: 0, width: 320, height: 380 });

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isThinking]); // Scroll on new messages or streaming updates

  // Dragging handlers
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (docked) return; // Disable dragging when docked
    if ((e.target as HTMLElement).closest('.chat-header')) {
      setIsDragging(true);
      dragOffset.current = {
        x: e.clientX - position.x,
        y: e.clientY - position.y,
      };
    }
  }, [position]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (isDragging) {
      const newX = Math.max(0, Math.min(window.innerWidth - size.width, e.clientX - dragOffset.current.x));
      const newY = Math.max(0, Math.min(window.innerHeight - size.height, e.clientY - dragOffset.current.y));
      setPosition({ x: newX, y: newY });
    }
    if (isResizing) {
      const deltaX = e.clientX - resizeStart.current.x;
      const deltaY = e.clientY - resizeStart.current.y;
      const newWidth = Math.max(280, Math.min(500, resizeStart.current.width + deltaX));
      const newHeight = Math.max(300, Math.min(600, resizeStart.current.height + deltaY));
      setSize({ width: newWidth, height: newHeight });
    }
  }, [isDragging, isResizing, size.width, size.height]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setIsResizing(false);
  }, []);

  const handleResizeStart = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);
    resizeStart.current = {
      x: e.clientX,
      y: e.clientY,
      width: size.width,
      height: size.height,
    };
  }, [size]);

  useEffect(() => {
    if (isDragging || isResizing) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, isResizing, handleMouseMove, handleMouseUp]);

  // Voice recognition setup - Removed, now handled by useTamboVoice
  // useEffect(() => {
  //   if (typeof window !== 'undefined') {
  //     const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
  //     if (SpeechRecognitionAPI) {
  //       recognitionRef.current = new SpeechRecognitionAPI();
  //       recognitionRef.current.continuous = false;
  //       recognitionRef.current.interimResults = false;

  //       recognitionRef.current.onresult = (event: any) => {
  //         const transcript = event.results[0][0].transcript;
  //         setInput(transcript);
  //         setIsListening(false);
  //       };

  //       recognitionRef.current.onerror = () => {
  //         setIsListening(false);
  //       };

  //       recognitionRef.current.onend = () => {
  //         setIsListening(false);
  //       };
  //     }
  //   }
  // }, []);

  // const toggleVoice = () => {
  //   if (isListening) {
  //     recognitionRef.current?.stop();
  //     setIsListening(false);
  //   } else if (recognitionRef.current) {
  //     recognitionRef.current.start();
  //     setIsListening(true);
  //   }
  // };

  // Determine response type from input - Removed, now handled by Tambo SDK
  // const getResponseType = (text: string): string => {
  //   const lower = text.toLowerCase();
  //   if (lower.includes('stat') || lower.includes('health') || lower.includes('score') || lower.includes('level')) {
  //     return 'stats';
  //   }
  //   if (lower.includes('attack') || lower.includes('shoot') || lower.includes('fire') || lower.includes('control')) {
  //     return 'attack';
  //   }
  //   if (lower.includes('strateg') || lower.includes('what should') || lower.includes('help') || lower.includes('tip') || lower.includes('next')) {
  //     return 'strategy';
  //   }
  //   if (lower.includes('quest') || lower.includes('objective') || lower.includes('mission') || lower.includes('progress')) {
  //     return 'quest';
  //   }
  //   return 'default';
  // };

  // Send message via Tambo SDK
  const handleSend = async () => {
    if (!input.trim()) return;

    try {
      setIsThinking(true); // Immediate feedback
      await sendThreadMessage(input.trim());
      setInput('');
      setShowQuickPrompts(false);
    } catch (error) {
      console.error('Failed to send message:', error);
      setIsThinking(false);
    }
  };

  const handleQuickPrompt = (prompt: string) => {
    setInput(prompt);
    // Optional: auto-send
    // handleSendWithPrompt(prompt);
    // For now let's just populate input so user can confirm
  };

  // handleSendWithPrompt is removed as sendMessage handles it directly
  // const handleSendWithPrompt = async (prompt: string) => {
  //   if (isLoading) return;

  //   const userMessage: ChatMessage = {
  //     id: Date.now().toString(),
  //     role: 'user',
  //     content: prompt,
  //   };

  //   setMessages(prev => [...prev, userMessage]);
  //   setInput('');
  //   setShowQuickPrompts(false);
  //   setIsLoading(true);

  //   await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 500));

  //   const responseType = getResponseType(prompt);
  //   const responseGenerator = FALLBACK_RESPONSES[responseType] || FALLBACK_RESPONSES.default;
  //   const response = responseGenerator(gameContext);

  //   const assistantMessage: ChatMessage = {
  //     id: (Date.now() + 1).toString(),
  //     role: 'assistant',
  //     content: response.text,
  //     component: response.component,
  //   };

  //   setMessages(prev => [...prev, assistantMessage]);
  //   setIsLoading(false);
  // };

  // Toggle button when closed
  if (!isOpen) {
    return (
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(true)}
        className="absolute bottom-4 left-4 z-40 w-12 h-12 rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/30 flex items-center justify-center"
        aria-label="Open AI Chat"
      >
        <MessageCircle className="w-5 h-5" />
        <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-accent rounded-full flex items-center justify-center">
          <Sparkles className="w-2 h-2 text-accent-foreground" />
        </span>
      </motion.button>
    );
  }

  return (
    <motion.div
      ref={chatRef}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      style={{
        position: docked ? 'relative' : 'absolute',
        left: docked ? 'auto' : position.x,
        top: docked ? 'auto' : position.y,
        width: isMinimized ? 280 : size.width,
        height: isMinimized ? 'auto' : size.height,
        zIndex: 50,
      }}
      className={`bg-card/95 backdrop-blur-md border border-border rounded-lg shadow-2xl flex flex-col overflow-hidden ${className}`}
      onMouseDown={handleMouseDown}
    >
      {/* Header - Draggable only if not docked */}
      <div className={`chat-header flex items-center justify-between px-3 py-2 bg-muted/50 border-b border-border select-none ${docked ? '' : 'cursor-move'}`}>
        <div className="flex items-center gap-2">
          <GripVertical className="w-4 h-4 text-muted-foreground" />
          <Sparkles className="w-4 h-4 text-primary" />
          <span className="text-sm font-semibold text-foreground">Tambo AI Guide</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="p-1 hover:bg-muted rounded transition-colors"
            aria-label={isMinimized ? 'Maximize' : 'Minimize'}
          >
            {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
          </button>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1 hover:bg-muted rounded transition-colors"
            aria-label="Close chat"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Chat content */}
      {!isMinimized && (
        <>
          {/* Messages area */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3">
            {/* Welcome message if empty */}
            {messages.length === 0 && (
              <div className="text-center py-6">
                <Sparkles className="w-10 h-10 mx-auto text-primary mb-3" />
                <p className="text-sm text-muted-foreground mb-4">
                  I am your AI dungeon guide powered by Tambo. Ask me anything about the game!
                </p>

                {/* Quick prompts */}
                {showQuickPrompts && (
                  <div className="grid grid-cols-2 gap-2">
                    {QUICK_PROMPTS.map((qp) => (
                      <button
                        key={qp.label}
                        onClick={() => handleQuickPrompt(qp.prompt)}
                        className="flex items-center gap-2 px-3 py-2 text-xs bg-muted hover:bg-muted/80 rounded-lg transition-colors text-left"
                      >
                        <qp.icon className="w-4 h-4 text-primary shrink-0" />
                        <span>{qp.label}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Render messages from Tambo SDK */}
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-lg px-3 py-2 ${message.role === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-foreground'
                    }`}
                >
                  <p className="text-sm whitespace-pre-wrap">
                    {typeof message.content === 'string'
                      ? message.content
                      : Array.isArray(message.content)
                        ? message.content.map((part: any, i: number) => {
                          if (part.type === 'text') return part.text;
                          return '';
                        }).join('')
                        : ''}
                  </p>
                  {/* Tambo SDK handles component rendering automatically via context if implemented,
                      but typically we might need a renderer here.
                      Since we're using the higher-level hooks, let's assume raw text content for now
                      or check if message.component exists in the SDK type (it might not).
                      For custom components, the SDK usually renders them.
                      Let's check if the SDK provides a component renderer or if 'content' contains it.
                   */}
                  {/* In basic hook usage, standard components are rendered by the provider's context if configured.
                       If message objects contain components in 'content' or specific fields, we'd render them here.
                       Assuming this hook returns simple messages for now. */}
                </div>
              </div>
            ))}

            {/* Loading indicator */}
            {isThinking && (
              <div className="flex justify-start">
                <div className="bg-muted rounded-lg px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-primary" />
                    <span className="text-sm text-muted-foreground">Thinking...</span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick prompts toggle */}
          {messages.length > 0 && (
            <button
              onClick={() => setShowQuickPrompts(!showQuickPrompts)}
              className="mx-3 mb-2 flex items-center justify-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Quick prompts
              <ChevronDown className={`w-3 h-3 transition-transform ${showQuickPrompts ? 'rotate-180' : ''}`} />
            </button>
          )}

          <AnimatePresence>
            {showQuickPrompts && messages.length > 0 && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="px-3 pb-2 overflow-hidden"
              >
                <div className="flex flex-wrap gap-1.5">
                  {QUICK_PROMPTS.map((qp) => (
                    <button
                      key={qp.label}
                      onClick={() => handleQuickPrompt(qp.prompt)}
                      className="flex items-center gap-1 px-2 py-1 text-[10px] bg-muted hover:bg-muted/80 rounded-full transition-colors"
                    >
                      <qp.icon className="w-3 h-3" />
                      {qp.label}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Input area */}
          <div className="p-3 border-t border-border">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
                placeholder="Ask anything..."
                className="flex-1 bg-muted rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                disabled={isThinking}
              />

              {/* Voice button */}
              <Button
                size="icon"
                variant={isRecording ? 'destructive' : 'outline'}
                onClick={toggleListening}
                disabled={isThinking}
                className="shrink-0"
              >
                {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </Button>

              {/* Send button */}
              <Button
                size="icon"
                onClick={handleSend}
                disabled={isThinking || !input.trim()}
                className="shrink-0"
              >
                {isThinking ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </Button>
            </div>
          </div>

          {/* Resize handle */}
          <div
            onMouseDown={handleResizeStart}
            className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize"
            style={{
              background: 'linear-gradient(135deg, transparent 50%, hsl(var(--muted-foreground)/0.3) 50%)',
            }}
          />
        </>
      )}
    </motion.div>
  );
}
