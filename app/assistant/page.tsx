'use client';

import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import { useVoiceAssistant } from '@/hooks/use-voice-assistant';
import { AudioVisualizer } from '@/components/assistant/audio-visualizer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import HeroBackground from '@/components/hero-background';
import { Home, Mic, MicOff, Volume2, VolumeX, Send, Trash2, ArrowLeft } from 'lucide-react';

export default function AssistantPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  
  const {
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
  } = useVoiceAssistant();

  const [textInput, setTextInput] = useState('');
  const [showHistory, setShowHistory] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.push('/');
    }
  }, [user, loading, router]);

  // Scroll message log to bottom on new messages
  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendText = (e: React.FormEvent) => {
    e.preventDefault();
    if (!textInput.trim()) return;
    sendMessage(textInput.trim());
    setTextInput('');
  };

  const handleMicPress = () => {
    if (status === 'listening') {
      stopListening();
    } else {
      startListening();
    }
  };

  if (loading || !user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white">
        <HeroBackground />
        <div className="z-10 flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-accent-pink/20 border-t-accent-pink rounded-full animate-spin" />
          <p className="text-white/60">Connecting to system...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden font-sans">
      <HeroBackground className="opacity-30" />

      {/* Navigation Header */}
      <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-4 flex items-center justify-between backdrop-blur-md bg-black/40 border-b border-white/5">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push('/home')}
            className="text-white/60 hover:text-white hover:bg-white/10"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-xl font-black tracking-tighter uppercase italic flex items-center gap-2">
            Echo Voice <span className="text-accent-pink">Assistant</span>
          </h1>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleMute}
            className={`rounded-full ${isMuted ? 'text-rose-500 bg-rose-500/10' : 'text-white/60'}`}
            title={isMuted ? 'Unmute voice feedback' : 'Mute voice feedback'}
          >
            {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
          </Button>
        </div>
      </nav>

      <main className="relative z-10 pt-24 pb-24 px-4 max-w-xl mx-auto flex flex-col min-h-screen justify-between">
        
        {/* Connection/Microphone Error Banner */}
        {error && (
          <div className="bg-rose-500/10 border border-rose-500/30 text-rose-200 text-xs px-4 py-3 rounded-xl text-center backdrop-blur-md shadow-lg animate-in fade-in slide-in-from-top-4 duration-300">
            {error}
          </div>
        )}

        {/* Visualizer and Conversation State */}
        <div className="flex-1 flex flex-col items-center justify-center py-6">
          <AudioVisualizer status={status} />
        </div>

        {/* Control Section */}
        <div className="space-y-6 w-full pb-6">
          <div className="flex justify-center gap-4 items-center">
            {/* Toggle History Log View */}
            <Button
              variant="outline"
              onClick={() => setShowHistory(!showHistory)}
              className="rounded-full border-white/10 bg-white/5 text-xs font-bold uppercase tracking-wider h-11 px-6 hover:bg-white/10"
            >
              {showHistory ? 'Hide Transcription' : 'Show Transcription'}
            </Button>
          </div>

          {/* Interactive Mic Button */}
          <div className="flex flex-col items-center gap-3">
            <button
              onClick={handleMicPress}
              disabled={status === 'disconnected' || status === 'thinking'}
              className={`w-20 h-20 rounded-full flex items-center justify-center border transition-all duration-300 shadow-xl relative group ${
                status === 'listening'
                  ? 'bg-rose-600 border-rose-500 shadow-[0_0_25px_rgba(225,29,72,0.6)] animate-pulse'
                  : status === 'thinking'
                  ? 'bg-purple-900/50 border-purple-500/30 cursor-not-allowed opacity-50'
                  : 'bg-white/5 border-white/15 hover:bg-white/10 hover:border-accent-pink/50'
              }`}
            >
              {status === 'listening' ? (
                <MicOff className="w-8 h-8 text-white" />
              ) : (
                <Mic className="w-8 h-8 text-white group-hover:scale-110 transition-transform" />
              )}
            </button>
            <span className="text-[10px] text-white/40 uppercase font-black tracking-widest">
              {status === 'listening' ? 'Tap to Send' : 'Tap to Talk'}
            </span>
          </div>

          {/* Speech Transcript/History Log panel */}
          {showHistory && (
            <Card className="glass-panel border-white/10 rounded-2xl overflow-hidden mt-4">
              <CardContent className="p-4 flex flex-col h-64">
                <ScrollArea className="flex-1 pr-2" viewportRef={scrollContainerRef}>
                  <div className="space-y-3">
                    {messages.length === 0 ? (
                      <p className="text-white/30 text-xs text-center py-10 font-semibold uppercase tracking-wider">No voice transcript yet.</p>
                    ) : (
                      messages.map((msg, i) => (
                        <div
                          key={i}
                          className={`flex flex-col max-w-[85%] ${
                            msg.role === 'user' ? 'ml-auto items-end' : 'mr-auto items-start'
                          }`}
                        >
                          <span className="text-[9px] text-white/40 uppercase font-bold tracking-widest mb-0.5">
                            {msg.role === 'user' ? 'You' : 'Echo'}
                          </span>
                          <div
                            className={`p-3 rounded-2xl text-sm leading-relaxed ${
                              msg.role === 'user'
                                ? 'bg-accent-pink text-white rounded-tr-none'
                                : 'bg-white/5 text-white/90 border border-white/5 rounded-tl-none'
                            }`}
                          >
                            {msg.content}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </ScrollArea>

                {/* Text input fallback */}
                <form onSubmit={handleSendText} className="flex gap-2 pt-3 mt-2 border-t border-white/5">
                  <Input
                    value={textInput}
                    onChange={(e) => setTextInput(e.target.value)}
                    placeholder="Type a message to Echo..."
                    className="bg-white/5 border-white/10 focus-visible:ring-accent-pink h-10 rounded-xl"
                  />
                  <Button
                    type="submit"
                    size="icon"
                    className="bg-accent-pink hover:bg-accent-pink/80 rounded-xl h-10 w-10 shrink-0"
                  >
                    <Send className="w-4 h-4 text-white" />
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}
        </div>
      </main>

      {/* Static Footer Navigation Hint */}
      <footer className="fixed bottom-0 left-0 right-0 h-16 flex items-center justify-around border-t border-white/5 bg-black/80 backdrop-blur-xl z-[40]">
        <button onClick={() => router.push('/home')} className="flex flex-col items-center gap-1 opacity-40 hover:opacity-100 transition-opacity">
          <Home className="w-5 h-5" />
          <span className="text-[8px] font-bold uppercase tracking-[0.2em]">Home</span>
        </button>
        <button onClick={() => router.push('/discover')} className="flex flex-col items-center gap-1 opacity-40 hover:opacity-100 transition-opacity">
          <svg
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M8.684 10.742l-2.616-.872L9 3l2.932 6.87-2.616.872zm0 0L9 21l2.932-11.128M15 15h.01M19 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
          <span className="text-[8px] font-bold uppercase tracking-[0.2em]">Discover</span>
        </button>
        <button className="flex flex-col items-center gap-1 text-accent-pink">
          <Mic className="w-5 h-5" />
          <span className="text-[8px] font-bold uppercase tracking-[0.2em]">Assistant</span>
        </button>
      </footer>
    </div>
  );
}
