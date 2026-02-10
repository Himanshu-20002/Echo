'use client';

import { useAuth } from '@/lib/auth-context';
import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import HeroBackground from '../hero-background';
import { VideoGallery } from './video-gallery';
import { MainDisplay, ViewMode } from './main-display';
import { PartnerCard } from './partner-card';
import { LoveBiteOverlay } from './love-bite-overlay';
import {
  Phone,
  Video,
  Pin,
  Heart,
  Calendar,
  UserMinus,
  Activity,
  MapPin,
  MessageCircle,
  Music,
  Gamepad2,
  Sparkles,
  HeartHandshake,
  Compass,
  LogOut
} from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Video {
  id: string;
  videoId: string;
  title: string;
  url: string;
  addedAt: Date;
}

interface PartnerData {
  name: string;
  status: string;
  bpm: number;
  connectionStrength: number;
  intimacyLevel: number;
  lastMessage?: string;
  isOnline: boolean;
  avatar?: string;
}

export function HomeDashboard() {
  const { user, logout } = useAuth();
  const router = useRouter(); // Use useRouter
  const [partnerData, setPartnerData] = useState<PartnerData | null>(null);
  const [syncStrength, setSyncStrength] = useState(98.4);
  const [userBpm, setUserBpm] = useState(72); // Add user BPM state
  const [selectedVideo, setSelectedVideo] = useState({
    videoId: 'ch8pwy-V1E8',
    title: 'Our Connection',
  });

  const [viewMode, setViewMode] = useState<ViewMode>('graph');

  const [isLoveBiteActive, setIsLoveBiteActive] = useState(false);
  const [activeActions, setActiveActions] = useState<string[]>([]);

  const [videos, setVideos] = useState<Video[]>([
    {
      id: '1',
      videoId: 'ch8pwy-V1E8',
      title: 'First Video',
      url: 'https://youtu.be/ch8pwy-V1E8?si=j0i3IoOCAtk1SU6e',
      addedAt: new Date(),
    },
    {
      id: '2',
      videoId: '2QeLP0Pm1gU',
      title: 'Second Video',
      url: 'https://youtu.be/2QeLP0Pm1gU?si=VTr-caeuyaA2usUV',
      addedAt: new Date(),
    },
    {
      id: '3',
      videoId: 'BIfCpf1gk6I',
      title: 'Third Video',
      url: 'https://youtu.be/BIfCpf1gk6I?si=6oPlGDfy1r9Y8ZMW',
      addedAt: new Date(),
    },
  ]);

  const handleAddVideo = (video: Video) => setVideos((s) => [video, ...s]);
  const handleRemoveVideo = (id: string) => setVideos((s) => s.filter((v) => v.id !== id));

  const handleLoveBite = () => {
    setIsLoveBiteActive(true);
    // Vibrate device if supported
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate([200, 100, 200]);
    }
    setTimeout(() => setIsLoveBiteActive(false), 4000);
  };

  const toggleAction = async (label: string, actionType?: string) => {
    if (actionType === 'logout') {
      try {
        await logout();
        router.push('/'); // Redirect to landing page after logout
      } catch (error) {
        console.error("Logout failed", error);
      }
      return;
    }

    setActiveActions(prev =>
      prev.includes(label)
        ? prev.filter(l => l !== label)
        : [...prev, label]
    );
  };



  useEffect(() => {
    // Mock partner data - replace with real data from Firestore
    setPartnerData({
      name: 'Your Partner',
      status: 'Calm & Steady',
      bpm: 72,
      connectionStrength: 94,
      intimacyLevel: 88,
      lastMessage: 'Thinking about our next adventure...',
      isOnline: true,
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBkSXUgY0b5DkrugzoSrDwid1UQG-pa3iigkzdXqVWdgZD1GkBCqFInn_SOJxe6Nwh4H_R30nAu6wbAJ332XV7UEuicwRtLxDFU5AGWWOe84X9oO7acECJ1fAS5ki071CI-paHDZygFil5cc7K5oFCRHcmbhQno7jEGgipOYXaUuTzwDOeNxDXQ55KwZ_68jY_nG6xJIeMgdQLj0s4a73jFunYwJ8yHAcWrTG9uEyDPPcDhNMVg3DSqYEiWby1U2Q83Cxg_8dv4BTev',
    });
  }, []);

  // Simulate real-time data updates
  useEffect(() => {
    const interval = setInterval(() => {
      // Update user BPM
      setUserBpm(prev => {
        const change = Math.random() > 0.5 ? 1 : -1;
        const newVal = prev + change;
        return Math.max(60, Math.min(100, newVal));
      });

      // Update Partner Data (BPM and Sync)
      setPartnerData(prev => {
        if (!prev) return null;
        const bpmChange = Math.random() > 0.5 ? 1 : -1;
        const newBpm = Math.max(60, Math.min(100, prev.bpm + bpmChange));

        // Sync strength fluctuates slightly
        const syncChange = (Math.random() - 0.5) * 0.2;

        return {
          ...prev,
          bpm: newBpm,
          connectionStrength: Math.min(100, Math.max(80, prev.connectionStrength + (Math.random() - 0.5)))
        };
      });

      setSyncStrength(prev => Math.min(100, Math.max(90, prev + (Math.random() - 0.5) * 0.5)));

    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const quickActions = [
    { icon: Phone, label: 'Available for Call', color: 'text-green-400' },
    { icon: Video, label: 'Video', color: 'text-pink-500' },
    { icon: Calendar, label: 'Schedule Date', color: 'text-yellow-400' },
    { icon: Pin, label: 'Share Location', color: 'text-blue-400' },
    { icon: UserMinus, label: 'Incognito', color: 'text-purple-400' },
    { icon: LogOut, label: 'Logout', color: 'text-red-500', action: 'logout' },
  ];

  const liveUpdates = [
    { icon: Activity, title: 'Heart rate spiked', time: '2m ago', status: 'Excitement', color: 'text-accent-pink' },
    { icon: MapPin, title: 'At "The Coffee House"', time: '15m ago', status: '', color: 'text-white' },
    { icon: MessageCircle, title: 'Sent a love note', time: '5m ago', status: 'Message', color: 'text-accent-pink' },
    { icon: Music, title: 'Listening to "Us"', time: '24m ago', status: 'Vibing', color: 'text-accent-pink' },
    { icon: Gamepad2, title: 'Beat High Score', time: '1h ago', status: 'Dino Run', color: 'text-accent-pink' },
  ];

  return (
    <div className="w-screen mx-auto bg-pink-900/30 px-4 lg:px-6 py-6 space-y-3">
      <LoveBiteOverlay isActive={isLoveBiteActive} />
      {/* Header */}
      <HeroBackground />
      <header className=" rounded-2xl px-6 lg:px-8 py-4 flex flex-col lg:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-black/40 rounded-lg flex items-center justify-center text-white neon-border">
            <Image
              alt="Echo Logo"
              src="/echo_logo.png"
              width={32}
              height={32}
            />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tighter text-white leading-none">Echo</h1>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="material-symbols-outlined text-accent-pink text-[10px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                lock
              </span>
              <span className="text-[10px] font-bold tracking-[0.15em] text-accent-pink uppercase">Connected</span>
            </div>
          </div>
        </div>

        {/* Navigation Icons */}
        <nav className="flex items-center  gap-2">
          <button
            onClick={() => setViewMode('chat')}
            className="w-10  h-10 rounded-xl  border border-accent-pink/90 flex items-center justify-center hover:bg-accent-pink/20 hover:border-accent-pink/40 transition-all text-white/70 hover:text-accent-pink"
            title="Live Chat"
          >
            <MessageCircle className="w-5 h-5" />
          </button>
          <Link
            href="/requests"
            className="w-10 h-10 rounded-xl  border border-accent-pink/90 flex items-center justify-center hover:bg-accent-pink/20 hover:border-accent-pink/40 transition-all text-white/70 hover:text-accent-pink"
            title="View Requests"
          >
            <HeartHandshake className="w-5 h-5" />
          </Link>
          <Link
            href="/discover"
            className="w-10 h-10 rounded-xl  border border-accent-pink/90 flex items-center justify-center hover:bg-accent-pink/20 hover:border-accent-pink/40 transition-all text-white/70 hover:text-accent-pink"
            title="Global Feed"
          >
            <Compass className="w-5 h-5" />
          </Link>
          <button className="w-10 h-10 rounded-xl bg-  border border-accent-pink/90 flex items-center justify-center hover:bg-accent-pink/20 hover:border-accent-pink/40 transition-all text-white/70 hover:text-accent-pink" title="Interests">
            <Sparkles className="w-5 h-5" />
          </button>
        </nav>

        {/* User Info */}
        <div className="flex items-center gap-6">
          <div className="hidden sm:flex flex-col text-right">
            <span className="text-[10px] uppercase tracking-[0.2em] text-white/40">Sync Strength</span>
            <span className="text-sm font-bold">{syncStrength.toFixed(1)}%</span>
          </div>
          <div className="h-8 w-px bg-white/10 hidden sm:block"></div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm font-bold leading-none">You</p>
              <p className="text-[10px] text-green-400 mt-1">Online</p>
            </div>
            <div className="w-10 h-10 rounded-full border-2 border-accent-pink p-0.5">
              <img
                alt="User"
                className="w-full h-full rounded-full object-cover"
                src={user?.photoURL || 'https://via.placeholder.com/40'}
              />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="space-y-0">
        {/* Main Display with Video Player and Heartbeat */}
        <MainDisplay
          videoId={selectedVideo.videoId}
          videoTitle={selectedVideo.title}
          partnerName={partnerData?.name || 'Your Partner'}
          partnerBpm={partnerData?.bpm || 72}
          videos={videos}
          onPlayVideo={(videoId, title) => setSelectedVideo({ videoId, title: title || selectedVideo.title })}
          userBpm={userBpm}
          userName="You"
          viewMode={viewMode}
          onViewModeChange={setViewMode}
        />

        {/* Grid Section */}
        <div className=" pt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Partner Card */}
          <PartnerCard partnerData={partnerData} onSendLoveBite={handleLoveBite} />

          {/* Live Updates */}
          <div className="glass-panel rounded-2xl p-6 flex flex-col">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-white/40 mb-4 flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-accent-pink rounded-full animate-pulse"></span>
              Live Updates
            </h3>
            <div className="space-y-3 overflow-y-auto max-h-[250px] pr-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
              {liveUpdates.map((update, idx) => (
                <div key={idx} className="flex items-center gap-3 bg-white/5 p-3 rounded-xl border border-white/5">
                  <div className={`w-8 h-8 shrink-0 bg-accent-pink/20 rounded-full flex items-center justify-center ${update.color}`}>
                    <update.icon className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold">{update.title}</p>
                    <p className="text-[9px] text-white/40">{update.time} {update.status && `• ${update.status}`}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="glass-panel rounded-2xl p-6">
            <h4 className="text-[10px] font-black tracking-widest text-white/40 uppercase mb-4">Quick Actions</h4>
            <div className="grid grid-cols-3 gap-2">
              {quickActions.map((action, idx) => {
                const isActive = activeActions.includes(action.label);
                return (
                  <button
                    key={idx}
                    onClick={() => toggleAction(action.label, (action as any).action)}
                    className={`py-3 rounded-xl border transition-all flex flex-col items-center gap-1 group ${isActive
                      ? 'bg-accent-pink/20 border-accent-pink shadow-[0_0_10px_rgba(236,72,153,0.2)]'
                      : 'bg-white/5 border-white/5 hover:bg-white/10 hover:border-accent-pink/30'
                      }`}
                  >
                    <action.icon className={`w-5 h-5 transition-transform ${isActive ? 'text-accent-pink scale-110' : `${action.color} group-hover:scale-110`
                      }`} />
                    <span className={`text-[8px] font-bold tracking-wider uppercase ${isActive ? 'text-accent-pink' : ''
                      }`}>{action.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Availability */}
          <div className="glass-panel rounded-2xl p-6 flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center  flex-col">
                <h4 className="text-[10px] font-black tracking-widest text-white/40 uppercase">Availability</h4>

              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input defaultChecked className="sr-only peer" type="checkbox" />
                <div className="w-9 h-5 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-accent-pink"></div>
              </label>
            </div>
            <p className="text-[10px] text-white/40 leading-relaxed mb-auto">Your heart metrics are currently visible to {partnerData?.name}.</p>
            <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-[8px] font-bold uppercase tracking-wider text-white/30">
              <span>visibilityOff</span>
              <span>Healthy</span>
            </div>
          </div>

          <VideoGallery
            videos={videos}
            onVideoSelect={(videoId: string, title: string) => {
              setSelectedVideo({ videoId, title });
              setViewMode('video');
              window.scrollTo({ top: 0, behavior: 'smooth' }); // Optional: Scroll to top to see the video
            }}
            onAddVideo={handleAddVideo}
            onRemoveVideo={handleRemoveVideo}
          />
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center py-8">
        <p className="text-[10px] uppercase tracking-[0.5em] text-white/20">Symmetry &amp; Harmony • Echo 2024</p>
      </footer>
    </div>
  );
}
