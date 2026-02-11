'use client';

import { useAuth } from '@/lib/auth-context';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { ShieldCheck, Activity, Heart, Lock, EyeOff, Timer, Star, LockKeyhole } from 'lucide-react';
import HeroBackground from './hero-background';
// import FaultyTerminal from './FaultyTerminal';

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
        <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-center px-6 py-6 lg:px-20">
          <div className="flex w-full max-w-7xl items-center justify-between glass-effect border border-white/10 px-8 py-3 rounded-full">
            <Image
              alt="Echo Logo"
              src="/echo_logo.png"
              width={62}
              height={72}
            />
            <div className="flex items-center gap-3">

              <div className="flex h-8 w-8  items-center justify-center rounded-full  text-white">

                {/* <span className="material-symbols-outlined text-[20px] font-bold">Echo</span> */}
              </div>
              {/* <h2 className="text-xl font-bold tracking-tight text-white">Echo</h2> */}
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
              className="flex min-w-[120px] cursor-pointer items-center justify-center rounded-full h-10 px-6 bg-accent-pink text-white text-sm font-bold transition-transform hover:scale-105 active:scale-95 shadow-lg shadow-accent-pink/20 disabled:opacity-50"
            >
              {isSigningIn ? 'Signing in...' : 'Get Started'}
            </button>
          </div>
        </header>

        <main className="flex-1 ">
          {/* Hero Section */}
          <section className="relative flex flex-col items-center justify-center px-4  h-screen text-center overflow-hidden">
            <HeroBackground />

            <div className="max-w-[840px] flex flex-col items-center gap-8 relative z-10">
              <div className="inline-flex items-center gap-2 rounded-full border border-accent-pink/20 bg-accent-pink/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-accent-pink">
                Variant 1: Intimacy Redefined
              </div>
              <h1 className="text-5xl font-black leading-[1.1] tracking-tight text-white md:text-7xl lg:text-8xl">
                One heart. <br />
                <span className="text-accent-pink">One Echo.</span>
              </h1>
              <p className="max-w-[600px] text-lg font-light leading-relaxed text-white/60 md:text-xl">
                Commitment, redefined. A private, exclusive digital sanctuary for you and your partner. No tracking. No ads. Just the two of
                you, connected.
              </p>
              <div className="flex flex-col items-center gap-4 w-full sm:w-auto">
                <button
                  onClick={handleSignIn}
                  disabled={isSigningIn}
                  className="flex min-w-[280px] cursor-pointer items-center justify-center gap-3 rounded-full h-14 px-8 bg-white text-background-dark text-base font-bold transition-all hover:bg-slate-100 glow-soft disabled:opacity-50"
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
                <p className="text-xs text-white/40">Secure, encrypted, and intentional.</p>
              </div>
            </div>

            {/* Hero Visual Mockup */}
            {/* <div className="mt-20 w-full max-w-5xl px-4">
              <div className="relative aspect-[16/9] w-full overflow-hidden rounded-xl border border-white/10 bg-surface-dark/50 shadow-2xl">
                <div className="absolute inset-0 bg-gradient-to-tr from-accent-pink/20 via-transparent to-accent-pink/5"></div>
                <img
                  alt="Abstract visualization of deep connection"
                  className="h-full w-full object-cover opacity-40 mix-blend-overlay"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuARvONsl3Bq_ktQ8zwV9_cLUPGeIHOab-jANI576WjdCcHr2DjjHS7RLjXs8OJVeLWB2BtQGhYoxn75n1QmUrHYbz6wxHveEGkXItCbnTg2a4zBraq75szQ1ccJIOZlQvL7MjOSQG9wWB-vrPiD2WKQ_vLdyTZPggA1zqHFB6yDfRXgDpJ8Qhy19jJ6daxb6MA2g75nIEl4SXzY-JADGAexADOjqQYEL-PfbOw7gX9nx_ay_wpLExpfQMLzO-KxngaVONotuKkHXuwN"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="flex flex-col items-center gap-6 glass-effect p-12 rounded-xl border border-white/20">
                    <Lock className="text-accent-pink w-16 h-16" />
                    <div className="text-center">
                      <h3 className="text-2xl font-bold text-white mb-2">The Sanctuary</h3>
                      <p className="text-white/60 text-sm">Waiting for your partner to lock...</p>
                    </div>
                  </div>
                </div>
              </div>
            </div> */}
          </section>

          {/* One Choice Philosophy */}
          <section id="philosophy" className="px-6 py-32 lg:px-20">
            <div className="mx-auto max-w-7xl">
              <div className="grid grid-cols-1 gap-20 lg:grid-cols-2 lg:items-center">
                <div>
                  <h2 className="text-4xl font-black tracking-tight text-white md:text-5xl lg:text-6xl">
                    The <span className="text-accent-pink">One Choice</span> <br /> Philosophy.
                  </h2>
                  <p className="mt-8 text-lg font-light leading-relaxed text-white/60">
                    In a world of infinite scrolling and endless options, Echo stands for the opposite. We believe digital intimacy
                    requires a boundary—a digital "lock" that signifies true commitment.
                  </p>
                  <div className="mt-12 flex flex-col gap-8">
                    <div className="flex gap-6">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-accent-pink/20 text-accent-pink">
                        <ShieldCheck className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-white">Private Sanctuary</h3>
                        <p className="text-white/50 mt-1">No data selling, no public profiles. Just a private line between two hearts.</p>
                      </div>
                    </div>
                    <div className="flex gap-6">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-accent-pink/20 text-accent-pink">
                        <Activity className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-white">Digital Bond</h3>
                        <p className="text-white/50 mt-1">Share thoughts, photos, and moments that stay within your private echo chamber.</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="relative">
                  <div className="aspect-square w-full rounded-full border-2 border-dashed border-accent-pink/30 p-8 flex items-center justify-center">
                    <div className="aspect-square w-full rounded-full bg-gradient-to-br from-accent-pink to-background-dark/80 p-1 flex items-center justify-center">
                      <div className="flex h-full w-full flex-col items-center justify-center rounded-full bg-surface-dark p-12 text-center">
                        <Heart className="text-accent-pink w-12 h-12 mb-4 fill-accent-pink" />
                        <p className="text-2xl font-bold text-white">Locked</p>
                        <p className="text-white/40 text-sm mt-2">nora & James</p>
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

          {/* The Locked Experience Card Grid */}
          <section id="features" className="bg-surface-dark py-32 px-6">
            <div className="mx-auto max-w-7xl">
              <div className="text-center mb-20">
                <h2 className="text-4xl font-bold text-white tracking-tight">Pure Intimacy</h2>
                <p className="text-white/50 mt-4 max-w-xl mx-auto">Designed to remove distractions and amplify the bond between you and your person.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Card 1 */}
                <div className="group flex flex-col gap-6 rounded-xl border border-white/5 bg-background-dark/50 p-10 transition-all hover:bg-background-dark hover:border-accent-pink/30">
                  <LockKeyhole className="text-accent-pink w-10 h-10" />
                  <h3 className="text-2xl font-bold text-white">The Lock</h3>
                  <p className="text-white/50 leading-relaxed font-light">The foundational step. A mutual digital pact that closes the door to outside noise.</p>
                </div>

                {/* Card 2 */}
                <div className="group flex flex-col gap-6 rounded-xl border border-white/5 bg-background-dark/50 p-10 transition-all hover:bg-background-dark hover:border-accent-pink/30">
                  <EyeOff className="text-accent-pink w-10 h-10" />
                  <h3 className="text-2xl font-bold text-white">Privacy First</h3>
                  <p className="text-white/50 leading-relaxed font-light">Encrypted messages and private gallery. Not even we can see what you share.</p>
                </div>

                {/* Card 3 */}
                <div className="group flex flex-col gap-6 rounded-xl border border-white/5 bg-background-dark/50 p-10 transition-all hover:bg-background-dark hover:border-accent-pink/30">
                  <Timer className="text-accent-pink w-10 h-10" />
                  <h3 className="text-2xl font-bold text-white">Deep Presence</h3>
                  <p className="text-white/50 leading-relaxed font-light">A shared timeline that focuses on quality interaction rather than quantity.</p>
                </div>
              </div>
            </div>
          </section>

          {/* Testimonial */}
          <section className="py-32 px-6">
            <div className="mx-auto max-w-4xl text-center">
              <div className="mb-10 flex justify-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="text-accent-pink w-6 h-6 fill-accent-pink" />
                ))}
              </div>
              <blockquote className="text-2xl italic font-light text-white md:text-4xl leading-snug">
                "Echo changed how we connect digitally. It's beautiful, private, and truly feels like our own little world away from the noise."
              </blockquote>
              <div className="mt-10 flex items-center justify-center gap-4">
                <div className="h-12 w-12 rounded-full bg-accent-pink/20 overflow-hidden">
                  <img
                    alt="Sarah & James"
                    className="h-full w-full object-cover"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuDbTwTq7Jo48Ej0iJHLx2zVdEdsDClPJH9qPeqxplFs0r_7LGOewY7PdYo8WlvlZT3s1zs2B9yNLghn0HaR6pd6BK6Hsm15Z7kmSx5eBWwCArsg77Blf6gqPyWUbgnA1qj_4NKPsKQRXj2G44jAju1vQSf6lRFppn0SCleAiwUMP46DDun_-fZgiv95hcXl6WR82x5kwFir31ltBC31GWpY2K8OpA72fO7ZRbHNGliMTbqXcFs6GFOoiV5IoPrZcr1iJtPyMr-viGLf"
                  />
                </div>
                <div className="text-left">
                  <p className="font-bold text-white">nora & James</p>
                  <p className="text-white/40 text-sm uppercase tracking-widest">March 2024</p>
                </div>
              </div>
            </div>
          </section>

          {/* Final CTA */}
          <section className="py-20 px-6">
            <div className="mx-auto max-w-5xl rounded-xl bg-gradient-to-r from-accent-pink/30 to-background-dark border border-accent-pink/20 p-12 lg:p-20 text-center overflow-hidden relative">
              <div className="absolute top-0 right-0 -mr-20 -mt-20 h-64 w-64 rounded-full bg-accent-pink/20 blur-[100px]"></div>
              <h2 className="text-4xl font-black text-white md:text-6xl mb-8 relative z-10">Ready to lock in?</h2>
              <p className="text-xl text-white/70 mb-12 max-w-2xl mx-auto relative z-10">
                Join thousands of couples rediscovering the beauty of intentional, private digital space.
              </p>
              <button
                onClick={handleSignIn}
                disabled={isSigningIn}
                className="flex mx-auto min-w-[240px] cursor-pointer items-center justify-center gap-3 rounded-full h-16 px-10 bg-accent-pink text-white text-lg font-bold transition-all hover:scale-105 active:scale-95 shadow-xl shadow-accent-pink/30 disabled:opacity-50 relative z-10"
              >
                {isSigningIn ? 'Creating your Echo...' : 'Create Your Echo'}
              </button>
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer className="border-t border-white/10 bg-background-dark py-12 px-6">
          <div className="mx-auto max-w-7xl flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex items-center gap-3 opacity-50">
              <Image
                alt="Echo Logo"
                src="/echo_logo.png"
                width={32}
                height={32}
              />
              <span className="text-lg font-bold tracking-tight text-white">Echo</span>
            </div>
            <div className="flex gap-8 text-sm text-white/40">
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
            <p className="text-xs text-white/30">© 2024 Echo Intimacy. One choice, forever.</p>
          </div>
        </footer>
      </div>
    </div>
  );
}
