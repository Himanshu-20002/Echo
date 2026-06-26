'use client';

import { useAuth } from '@/lib/auth-context';
import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { ShieldCheck, Activity, Heart, Lock, EyeOff, Timer, Star, LockKeyhole, Mic, MicOff, Volume2, VolumeX, Send, Sparkles, Users, MessageSquare } from 'lucide-react';
import HeroBackground from './hero-background';
import { useVoiceAssistant } from '@/hooks/use-voice-assistant';
import { AudioVisualizer } from '@/components/assistant/audio-visualizer';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';

export default function LandingPage() {
  const { signInWithGoogle } = useAuth();
  const [isSigningIn, setIsSigningIn] = useState(false);

  const handleSignIn = async () => {
    try {
      setIsSigningIn(true);
      await signInWithGoogle();
    } catch (error) {
      console.error('Sign in failed:', error);
      setIsSigningIn(false);
    }
  };

  // Guest Voice Assistant Setup
  const {
    status,
    messages,
    isMuted,
    error: assistantError,
    startListening,
    stopListening,
    sendMessage,
    toggleMute
  } = useVoiceAssistant();

  const [textInput, setTextInput] = useState('');
  const [showHistory, setShowHistory] = useState(true);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!chatContainerRef.current) return;
    const viewport = chatContainerRef.current.querySelector('[data-radix-scroll-area-viewport]');
    if (viewport) {
      viewport.scrollTop = viewport.scrollHeight;
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

  return (
    <div className="dark bg-background-dark text-slate-100 w-screen transition-colors duration-500 overflow-x-hidden min-h-screen">
      {/* Subtle Background Glow Elements */}

      {/* <div className="absolute inset-0 opacity-30 overflow-hidden">  
        <div className="absolute top-0 left-0 w-96 h-96 bg-red-900 rounded-full mix-blend-multiply filter blur-3xl animate-pulse"></div>
        <div className="absolute top-1/2 right-0 w-96 h-96 bg-rose-900 rounded-full mix-blend-multiply filter blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-pink-900 rounded-full mix-blend-multiply filter blur-3xl animate-pulse" style={{ animationDelay: '4s' }}></div>
      </div> */}


      <div className="relative flex min-h-screen flex-col">
        {/* Top Navigation */}
        <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-center px-4 py-4 md:px-6 md:py-6 lg:px-20">
          <div className="flex w-full max-w-7xl items-center justify-between glass-effect border border-white/10 px-4 py-2 md:px-8 md:py-3 rounded-full">
            <div className="relative w-11 h-12 md:w-[62px] md:h-[72px]">
              <Image
                alt="Echo Logo"
                src="/echo_logo.png"
                fill
                priority
                className="object-contain"
                loading="eager"
              />
            </div>
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full text-white">
              </div>
            </div>
            <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-white/70">
              <a className="hover:text-accent-pink transition-colors" href="#philosophy">
                Philosophy
              </a>
              <a className="hover:text-accent-pink transition-colors" href="#features">
                The Lock
              </a>
              <a className="hover:text-accent-pink transition-colors" href="#safety">
                Safety
              </a>
            </nav>
            <button
              onClick={handleSignIn}
              disabled={isSigningIn}
              className="flex min-w-[100px] md:min-w-[120px] cursor-pointer items-center justify-center rounded-full h-9 md:h-10 px-4 md:px-6 bg-accent-pink text-white text-xs md:text-sm font-bold transition-transform hover:scale-105 active:scale-95 shadow-lg shadow-accent-pink/20 disabled:opacity-50"
            >
              {isSigningIn ? 'Signing in...' : 'Get Started'}
            </button>
          </div>
        </header>

        <main className="flex-1">
          {/* Hero Section */}
          <section className="relative flex flex-col items-center justify-center px-4 md:px-6 lg:px-20 pt-28 md:pt-32 pb-12 md:pb-20 min-h-screen text-left overflow-hidden">
            <div className="mx-auto max-w-7xl w-full grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center relative z-10">
              
              {/* Left Column: Slogan & Rebranding */}
              <div className="flex flex-col items-start gap-6 md:gap-8">
                <div className="inline-flex items-center gap-2 rounded-full border border-accent-pink/20 bg-accent-pink/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-accent-pink">
                  Companion & Social Sync
                </div>
                <h1 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-black leading-[1.1] tracking-tight text-white">
                  Connect. Chat. <br />
                  <span className="text-accent-pink">Real-Time Vibe.</span>
                </h1>
                <p className="max-w-[550px] text-base font-light leading-relaxed text-slate-300 md:text-lg">
                  Beyond standard messaging. A space to find AI companions, create genuine friendships, chat in real-time, and synchronise your moods. Experience the future of connection now.
                </p>
                <div className="flex flex-col items-stretch sm:items-start gap-4 w-full sm:w-auto">
                  <button
                    onClick={handleSignIn}
                    disabled={isSigningIn}
                    className="flex w-full sm:w-auto sm:min-w-[280px] cursor-pointer items-center justify-center gap-3 rounded-full h-14 px-8 bg-white text-background-dark text-base font-bold transition-all hover:bg-slate-100 shadow-xl disabled:opacity-50"
                  >
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                      <path
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        fill="#4285F4"
                      ></path>
                      <path
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        fill="#34A853"
                      ></path>
                      <path
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                        fill="#FBBC05"
                      ></path>
                      <path
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        fill="#EA4335"
                      ></path>
                    </svg>
                    {isSigningIn ? 'Signing in...' : 'Sign in with Google'}
                  </button>
                  <p className="text-xs text-white/40 text-center sm:text-left">Secure connection, no public profiles.</p>
                </div>
              </div>

              {/* Right Column: Embedded Voice Assistant */}
              <div className="glass-panel border-white/10 rounded-2xl md:rounded-[32px] p-4 md:p-6 flex flex-col w-full max-w-md mx-auto shadow-2xl relative min-h-[460px]">
                
                {/* Header */}
                <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-4">
                  <div>
                    <h3 className="text-md font-bold text-white flex items-center gap-2">
                      <Sparkles className="w-4.5 h-4.5 text-accent-pink" />
                      Meet Nora AI
                    </h3>
                    <p className="text-[10px] text-white/50">Your helper. Ask Nora how the sanctuary works.</p>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={toggleMute}
                      className={`h-8 w-8 rounded-full ${isMuted ? 'text-rose-500 bg-rose-500/10' : 'text-white/40 hover:text-white'}`}
                      title={isMuted ? 'Unmute Nora' : 'Mute Nora'}
                    >
                      {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                    </Button>
                    <div className="flex items-center gap-1 bg-white/5 px-2.5 py-1 rounded-full border border-white/5">
                      <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse shadow-[0_0_6px_#22c55e]" />
                      <span className="text-[8px] font-black uppercase tracking-wider text-green-400">Live</span>
                    </div>
                  </div>
                </div>

                {assistantError && (
                  <div className="bg-rose-500/10 border border-rose-500/25 text-rose-200 text-[10px] p-2.5 rounded-xl mb-4 text-center">
                    {assistantError}
                  </div>
                )}

                {/* Chat Message Area & Visualizer */}
                <div ref={chatContainerRef} className="flex-1 flex flex-col justify-between">
                  <ScrollArea className="flex-1 pr-1.5 h-[280px]">
                    {messages.length === 0 ? (
                      // Empty state shows the visualizer centered
                      <div className="flex flex-col items-center justify-center h-[260px]">
                        <AudioVisualizer status={status} compact />
                        <p className="text-[10px] text-white/30 text-center uppercase tracking-wider font-semibold mt-2">
                          {status === 'listening' ? 'Speak now...' : 'Click the Mic below to talk'}
                        </p>
                      </div>
                    ) : (
                      // Message list
                      <div className="space-y-3 pb-4">
                        {messages.map((msg, i) => (
                          <div
                            key={i}
                            className={`flex flex-col max-w-[85%] ${
                              msg.role === 'user' ? 'ml-auto items-end' : 'mr-auto items-start'
                            }`}
                          >
                            <span className="text-[8px] text-white/40 uppercase font-bold tracking-widest mb-0.5">
                              {msg.role === 'user' ? 'You' : 'Nora'}
                            </span>
                            <div
                              className={`p-3 rounded-2xl text-xs leading-relaxed ${
                                msg.role === 'user'
                                  ? 'bg-accent-pink text-white rounded-tr-none'
                                  : 'bg-white/5 text-white/90 border border-white/5 rounded-tl-none'
                              }`}
                            >
                              {msg.content}
                            </div>
                          </div>
                        ))}
                        
                        {/* Compact status indicator */}
                        {(status === 'thinking' || status === 'speaking' || status === 'listening') && (
                          <div className="flex items-center gap-2 ml-1 text-[10px] text-white/40 animate-pulse">
                            <span className="w-1.5 h-1.5 rounded-full bg-accent-pink" />
                            <span>
                              {status === 'thinking' && 'Nora is thinking...'}
                              {status === 'speaking' && 'Nora is speaking...'}
                              {status === 'listening' && 'Listening to you...'}
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </ScrollArea>
                </div>

                {/* Input Bar */}
                <form onSubmit={handleSendText} className="flex items-center gap-2 pt-3 border-t border-white/5">
                  <button
                    type="button"
                    onClick={handleMicPress}
                    disabled={status === 'disconnected' || status === 'thinking'}
                    className={`w-9 h-9 rounded-xl flex items-center justify-center border transition-all duration-350 shrink-0 ${
                      status === 'listening'
                        ? 'bg-rose-600 border-rose-500 shadow-[0_0_12px_rgba(225,29,72,0.5)] animate-pulse'
                        : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-accent-pink/40'
                    }`}
                  >
                    {status === 'listening' ? (
                      <MicOff className="w-4 h-4 text-white" />
                    ) : (
                      <Mic className="w-4 h-4 text-white" />
                    )}
                  </button>
                  
                  <Input
                    value={textInput}
                    onChange={(e) => setTextInput(e.target.value)}
                    placeholder={status === 'listening' ? 'Listening...' : 'Type a message...'}
                    disabled={status === 'listening'}
                    className="bg-white/5 border-white/10 focus-visible:ring-accent-pink h-9 rounded-xl text-xs flex-1"
                  />
                  
                  <Button
                    type="submit"
                    size="icon"
                    className="bg-accent-pink hover:bg-accent-pink/80 rounded-xl h-9 w-9 shrink-0 shadow-lg shadow-accent-pink/20"
                  >
                    <Send className="w-3.5 h-3.5 text-white" />
                  </Button>
                </form>
              </div>
          {/* AI Companion & Connection Philosophy */}
          <section id="philosophy" className="px-4 md:px-6 py-16 md:py-32 lg:px-20">
            <div className="mx-auto max-w-7xl">
              <div className="grid grid-cols-1 gap-12 lg:gap-20 lg:grid-cols-2 lg:items-center">
                <div>
                  <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                    The <span className="text-accent-pink">Echo Connection</span> <br /> Philosophy.
                  </h2>
                  <p className="mt-6 text-base md:text-lg font-light leading-relaxed text-white/60">
                    In a world of infinite scrolling and empty feeds, Echo stands for real presence. We combine state-of-the-art AI companions with private, real-time social synchronization to help you stay deeply connected to those who matter most.
                  </p>
                  <div className="mt-10 flex flex-col gap-6 md:gap-8">
                    <div className="flex gap-4 md:gap-6">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-accent-pink/20 text-accent-pink">
                        <ShieldCheck className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="text-lg md:text-xl font-bold text-white">Private Sanctuary</h3>
                        <p className="text-white/50 text-sm mt-1">No data selling, no public ads. Your conversations with friends and AI companions remain strictly yours.</p>
                      </div>
                    </div>
                    <div className="flex gap-4 md:gap-6">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-accent-pink/20 text-accent-pink">
                        <Activity className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="text-lg md:text-xl font-bold text-white">Interactive Sync</h3>
                        <p className="text-white/50 text-sm mt-1">Share live mood states, synchronise heartbeats, and check in with your circle effortlessly.</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="relative mt-8 lg:mt-0 max-w-md mx-auto w-full">
                  <div className="aspect-square w-full rounded-full border-2 border-dashed border-accent-pink/30 p-4 sm:p-8 flex items-center justify-center">
                    <div className="aspect-square w-full rounded-full bg-gradient-to-br from-accent-pink to-background-dark/80 p-1 flex items-center justify-center">
                      <div className="flex h-full w-full flex-col items-center justify-center rounded-full bg-surface-dark p-8 sm:p-12 text-center">
                        <Sparkles className="text-accent-pink w-10 h-10 sm:w-12 sm:h-12 mb-4 animate-pulse" />
                        <p className="text-xl sm:text-2xl font-bold text-white">Connected</p>
                        <p className="text-white/40 text-xs sm:text-sm mt-2">Nora & Echo AI</p>
                      </div>
                    </div>
                  </div>
                  {/* Floating decorative bits */}
                  <div className="absolute top-0 right-0 h-24 w-24 bg-accent-pink/20 rounded-full blur-xl"></div>
                  <div className="absolute bottom-10 left-0 h-16 w-16 bg-accent-pink/30 rounded-full blur-lg"></div>
                </div>
              </div>
            </div>
          </section>

          {/* Feature Grid */}
          <section id="features" className="bg-surface-dark py-16 md:py-32 px-4 md:px-6">
            <div className="mx-auto max-w-7xl">
              <div className="text-center mb-12 md:mb-20">
                <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight">Interactive Features</h2>
                <p className="text-white/50 mt-4 max-w-xl mx-auto text-sm md:text-base">Designed to remove digital noise and focus on genuine human-to-human and human-to-AI bonds.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
                {/* Card 1 */}
                <div className="group flex flex-col gap-6 rounded-xl border border-white/5 bg-background-dark/50 p-6 md:p-10 transition-all hover:bg-background-dark hover:border-accent-pink/30">
                  <Sparkles className="text-accent-pink w-10 h-10" />
                  <h3 className="text-xl md:text-2xl font-bold text-white">AI Companions</h3>
                  <p className="text-white/50 leading-relaxed text-sm md:text-base font-light">Customizable AI companions that understand you, offer advice, support your goals, and converse over real-time voice.</p>
                </div>

                {/* Card 2 */}
                <div className="group flex flex-col gap-6 rounded-xl border border-white/5 bg-background-dark/50 p-6 md:p-10 transition-all hover:bg-background-dark hover:border-accent-pink/30">
                  <MessageSquare className="text-accent-pink w-10 h-10" />
                  <h3 className="text-xl md:text-2xl font-bold text-white">Real-Time Chat</h3>
                  <p className="text-white/50 leading-relaxed text-sm md:text-base font-light">Private direct chats, synchronised mood indicators, love bites, and quick interactive states.</p>
                </div>

                {/* Card 3 */}
                <div className="group flex flex-col gap-6 rounded-xl border border-white/5 bg-background-dark/50 p-6 md:p-10 transition-all hover:bg-background-dark hover:border-accent-pink/30">
                  <Users className="text-accent-pink w-10 h-10" />
                  <h3 className="text-xl md:text-2xl font-bold text-white">Close Friends</h3>
                  <p className="text-white/50 leading-relaxed text-sm md:text-base font-light">Sync up with your closest friends or partner in an exclusive space away from public social media noise.</p>
                </div>
              </div>
            </div>
          </section>

          {/* Testimonial */}
          <section className="py-16 md:py-32 px-4 md:px-6">
            <div className="mx-auto max-w-4xl text-center">
              <div className="mb-8 md:mb-10 flex justify-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="text-accent-pink w-5 h-5 md:w-6 md:h-6 fill-accent-pink" />
                ))}
              </div>
              <blockquote className="text-lg sm:text-2xl md:text-4xl italic font-light text-white leading-snug">
                "Echo completely changed how I think about digital presence. My AI companion is supportive, and syncing with my friends keeps us feeling like we're in the same room."
              </blockquote>
              <div className="mt-8 md:mt-10 flex items-center justify-center gap-4">
                <div className="h-10 w-10 md:h-12 md:w-12 rounded-full bg-accent-pink/20 overflow-hidden">
                  <img
                    alt="Nora"
                    className="h-full w-full object-cover"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuDbTwTq7Jo48Ej0iJHLx2zVdEdsDClPJH9qPeqxplFs0r_7LGOewY7PdYo8WlvlZT3s1zs2B9yNLghn0HaR6pd6BK6Hsm15Z7kmSx5eBWwCArsg77Blf6gqPyWUbgnA1qj_4NKPsKQRXj2G44jAju1vQSf6lRFppn0SCleAiwUMP46DDun_-fZgiv95hcXl6WR82x5kwFir31ltBC31GWpY2K8OpA72fO7ZRbHNGliMTbqXcFs6GFOoiV5IoPrZcr1iJtPyMr-viGLf"
                  />
                </div>
                <div className="text-left">
                  <p className="font-bold text-white text-sm md:text-base">Nora & Echo AI</p>
                  <p className="text-white/40 text-xs uppercase tracking-widest">June 2026</p>
                </div>
              </div>
            </div>
          </section>

          {/* Final CTA */}
          <section className="py-12 md:py-20 px-4 md:px-6">
            <div className="mx-auto max-w-5xl rounded-xl bg-gradient-to-r from-accent-pink/30 to-background-dark border border-accent-pink/20 p-6 sm:p-12 lg:p-20 text-center overflow-hidden relative">
              <div className="absolute top-0 right-0 -mr-20 -mt-20 h-64 w-64 rounded-full bg-accent-pink/20 blur-[100px]"></div>
              <h2 className="text-3xl sm:text-4xl md:text-6xl font-black text-white mb-8 relative z-10">Ready to sync up?</h2>
              <p className="text-lg md:text-xl text-white/70 mb-8 md:mb-12 max-w-2xl mx-auto relative z-10">
                Join thousands of users building real-time connections with companions and friends.
              </p>
              <button
                onClick={handleSignIn}
                disabled={isSigningIn}
                className="flex mx-auto w-full sm:w-auto sm:min-w-[240px] cursor-pointer items-center justify-center gap-3 rounded-full h-16 px-10 bg-accent-pink text-white text-lg font-bold transition-all hover:scale-105 active:scale-95 shadow-xl shadow-accent-pink/30 disabled:opacity-50 relative z-10"
              >
                {isSigningIn ? 'Starting your Echo...' : 'Start Your Echo'}
              </button>
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer className="border-t border-white/10 bg-background-dark py-12 px-4 md:px-6">
          <div className="mx-auto max-w-7xl flex flex-col md:flex-row justify-between items-center gap-8 text-center md:text-left">
            <div className="flex items-center gap-3 opacity-50">
              <Image
                alt="Echo Logo"
                src="/echo_logo.png"
                width={32}
                height={32}
              />
              <span className="text-lg font-bold tracking-tight text-white">Echo</span>
            </div>
            <div className="flex flex-wrap justify-center gap-x-8 gap-y-4 text-sm text-white/40">
              <a className="hover:text-accent-pink transition-colors" href="#privacy">
                Privacy
              </a>
              <a className="hover:text-accent-pink transition-colors" href="#terms">
                Terms
              </a>
              <a className="hover:text-accent-pink transition-colors" href="#about">
                About
              </a>
              <a className="hover:text-accent-pink transition-colors" href="#twitter">
                Twitter
              </a>
            </div>
            <p className="text-xs text-white/30">© 2026 Echo Connection. All rights reserved.</p>
          </div>
        </footer>
      </div>
    </div>
  );
}
