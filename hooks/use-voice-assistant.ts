'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

export type AssistantStatus = 'disconnected' | 'idle' | 'listening' | 'thinking' | 'speaking';

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

export function useVoiceAssistant() {
  const [status, setStatus] = useState<AssistantStatus>('disconnected');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isMuted, setIsMuted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const recognitionRef = useRef<any>(null);
  const synthesisRef = useRef<SpeechSynthesis | null>(null);
  const currentUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const isMutedRef = useRef(isMuted);
  const welcomeSpokenRef = useRef(false);
  const hasInteractedRef = useRef(false);
  const pendingWelcomeTextRef = useRef<string | null>(null);

  const messagesLengthRef = useRef(0);

  // Sync messages length ref
  useEffect(() => {
    messagesLengthRef.current = messages.length;
  }, [messages]);

  // Sync mute ref
  useEffect(() => {
    isMutedRef.current = isMuted;
    if (isMuted && synthesisRef.current) {
      synthesisRef.current.cancel();
      if (status === 'speaking') {
        setStatus('idle');
      }
    }
  }, [isMuted, status]);

  // Initialize Speech Synthesis
  useEffect(() => {
    if (typeof window !== 'undefined') {
      synthesisRef.current = window.speechSynthesis;
    }
    return () => {
      if (synthesisRef.current) {
        synthesisRef.current.cancel();
      }
    };
  }, []);

  // Speak function helper
  const speakText = useCallback((text: string) => {
    // If we cannot speak (muted, no browser support, or no interaction yet), just add the message immediately
    if (!synthesisRef.current || isMutedRef.current || !hasInteractedRef.current) {
      setMessages(prev => {
        const newMessages = [...prev];
        const lastMsg = newMessages[newMessages.length - 1];
        if (lastMsg && lastMsg.role === 'assistant') {
          lastMsg.content = text;
        } else {
          newMessages.push({ role: 'assistant', content: text, timestamp: new Date() });
        }
        return newMessages;
      });
      return;
    }

    // Cancel current speaking
    synthesisRef.current.cancel();

    // Clean up text from symbols, markdown, and emojis
    const cleanText = text
      .replace(/[\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD00-\uDFFF]/g, '')
      .replace(/[*_`#]/g, '')
      .trim();

    if (!cleanText) return;

    // Add empty assistant message immediately so the user knows Nora started responding
    setMessages(prev => {
      const newMessages = [...prev];
      const lastMsg = newMessages[newMessages.length - 1];
      if (lastMsg && lastMsg.role === 'assistant') {
        lastMsg.content = '';
      } else {
        newMessages.push({ role: 'assistant', content: '', timestamp: new Date() });
      }
      return newMessages;
    });

    const utterance = new SpeechSynthesisUtterance(cleanText);
    currentUtteranceRef.current = utterance;

    utterance.onstart = () => {
      setStatus('speaking');
      welcomeSpokenRef.current = true;
    };

    utterance.onboundary = (event) => {
      if (event.name === 'word') {
        const index = event.charIndex;
        // Slice up to the current word boundary, plus some lookahead to get the next word space
        const nextSpace = cleanText.indexOf(' ', index);
        const visibleText = nextSpace === -1 ? cleanText : cleanText.slice(0, nextSpace);

        setMessages(prev => {
          const newMessages = [...prev];
          const lastMsg = newMessages[newMessages.length - 1];
          if (lastMsg && lastMsg.role === 'assistant') {
            lastMsg.content = visibleText;
          }
          return newMessages;
        });
      }
    };

    const finishSpeech = () => {
      setStatus('idle');
      setMessages(prev => {
        const newMessages = [...prev];
        const lastMsg = newMessages[newMessages.length - 1];
        if (lastMsg && lastMsg.role === 'assistant') {
          lastMsg.content = text; // Ensure original text is fully shown
        }
        return newMessages;
      });
    };

    utterance.onend = finishSpeech;
    utterance.onerror = (e) => {
      console.error('Speech synthesis error:', e);
      finishSpeech();
    };

    // Find a nice natural voice if available
    const voices = synthesisRef.current.getVoices();
    const naturalVoice = voices.find(
      v => v.lang.startsWith('en') && (v.name.includes('Google') || v.name.includes('Natural'))
    );
    if (naturalVoice) {
      utterance.voice = naturalVoice;
    }

    synthesisRef.current.speak(utterance);
  }, []);

  // Connect to HTTP assistant endpoint
  const connect = useCallback(() => {
    setStatus('idle');
    setError(null);
    console.log('Voice Assistant connected via API Routes');

    // Trigger greeting if no message history exists (mimics server.js intro logic)
    if (messagesLengthRef.current === 0 && !pendingWelcomeTextRef.current && !welcomeSpokenRef.current) {
      const introText = "Hi, I'm Nora. Ask me how to find someone, make friends, or navigate the sanctuary!";
      if (!hasInteractedRef.current) {
        pendingWelcomeTextRef.current = introText;
      } else {
        speakText(introText);
        welcomeSpokenRef.current = true;
        pendingWelcomeTextRef.current = null;
      }
    }
  }, [speakText]);

  const disconnect = useCallback(() => {
    if (synthesisRef.current) {
      synthesisRef.current.cancel();
    }
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setStatus('disconnected');
  }, []);

  // Send message over HTTP POST API
  const sendMessage = useCallback(async (text: string) => {
    setError(null);
    setStatus('thinking');

    const newUserMessage: ChatMessage = { role: 'user', content: text, timestamp: new Date() };
    const updatedMessages = [...messages, newUserMessage];
    setMessages(updatedMessages);

    try {
      const response = await fetch('/api/assistant', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: updatedMessages.map(m => ({ role: m.role, content: m.content }))
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || `HTTP error ${response.status}`);
      }

      const data = await response.json();
      const replyText = data.text;

      speakText(replyText);
    } catch (err: any) {
      console.error('API Error:', err);
      setError(err.message || 'Failed to get response from assistant.');
      setStatus('idle');
    }
  }, [messages, speakText]);

  // Initialize Speech Recognition
  const startListening = useCallback(() => {
    if (typeof window === 'undefined') return;

    if (synthesisRef.current) {
      synthesisRef.current.cancel();
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setError('Speech Recognition not supported in this browser.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setStatus('listening');
      setError(null);
    };

    recognition.onresult = (event: any) => {
      const resultText = event.results[0][0].transcript;
      if (resultText && resultText.trim()) {
        sendMessage(resultText);
      }
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      if (event.error !== 'no-speech') {
        setError(`Microphone error: ${event.error}`);
      }
      setStatus('idle');
    };

    recognition.onend = () => {
      // Transition back to idle if we aren't already thinking/speaking
      setStatus(current => (current === 'listening' ? 'idle' : current));
    };

    try {
      recognition.start();
    } catch (e) {
      console.error('Failed to start speech recognition:', e);
    }
  }, [sendMessage]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  }, []);

  const toggleMute = useCallback(() => {
    setIsMuted(prev => !prev);
  }, []);

  // Auto connect/disconnect on mount/unmount
  useEffect(() => {
    connect();
    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  // First interaction speech fallback (handles browser autoplay restriction)
  useEffect(() => {
    const handleFirstInteraction = () => {
      hasInteractedRef.current = true;
      if (!welcomeSpokenRef.current && pendingWelcomeTextRef.current) {
        const text = pendingWelcomeTextRef.current;
        speakText(text);
        welcomeSpokenRef.current = true;
        pendingWelcomeTextRef.current = null;
      }
      document.removeEventListener('click', handleFirstInteraction);
      document.removeEventListener('touchstart', handleFirstInteraction);
      window.removeEventListener('scroll', handleFirstInteraction);
    };

    document.addEventListener('click', handleFirstInteraction);
    document.addEventListener('touchstart', handleFirstInteraction);
    window.addEventListener('scroll', handleFirstInteraction);

    return () => {
      document.removeEventListener('click', handleFirstInteraction);
      document.removeEventListener('touchstart', handleFirstInteraction);
      window.removeEventListener('scroll', handleFirstInteraction);
    };
  }, [speakText]);

  return {
    status,
    messages,
    isMuted,
    error,
    startListening,
    stopListening,
    sendMessage,
    toggleMute,
    connect,
    disconnect
  };
}
