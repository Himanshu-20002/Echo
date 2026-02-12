'use client';

import { useAuth } from '@/lib/auth-context';
import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import HeroBackground from '../hero-background';
import { VideoGallery } from './video-gallery';
import { MainDisplay, ViewMode } from './main-display';
import { PartnerCard } from './partner-card';
import { LoveBiteOverlay } from './love-bite-overlay';
import { TogetherFor } from './together-for';
import { MoodWindow } from './MoodWindow/mood-window'
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
import {
  updateMood,
  subscribeToUserMood,
  sendLoveBite,
  subscribeToLoveBites,
  getUserMatches,
  getUserProfile,
  updateUserProfile,
  subscribeToRelationship,
  updateAnniversary,
  syncUserProfile,
  createOrUpdateRelationship
} from '@/lib/firestore-service';
import { MoodType } from '@/lib/types';
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
  const lastSyncedMood = useRef<{ mood: MoodType; intensity: number } | null>(null);
  const router = useRouter(); // Use useRouter
  const [partnerData, setPartnerData] = useState<PartnerData | null>(null);
  const [syncStrength, setSyncStrength] = useState(98.4);
  const [userBpm, setUserBpm] = useState(72); // Add user BPM state
  const [userMood, setUserMood] = useState<{ mood: MoodType; intensity: number; dailyLoveCount: number }>({
    mood: 'love',
    intensity: 4,
    dailyLoveCount: 0,
  })

  const [partnerMood, setPartnerMood] = useState<{ mood: MoodType; intensity: number; dailyLoveCount: number }>({
    mood: 'love',
    intensity: 4,
    dailyLoveCount: 0,
  })
  const [selectedVideo, setSelectedVideo] = useState({
    videoId: 'ch8pwy-V1E8',
    title: 'Our Connection',
  });

  const [viewMode, setViewMode] = useState<ViewMode>('graph');
  const [currentUserProfile, setCurrentUserProfile] = useState<any>(null);
  const [anniversaryDate, setAnniversaryDate] = useState<string | null>(null);
  const [relationshipId, setRelationshipId] = useState<string | null>(null);

  const [partnerId, setPartnerId] = useState<string | null>(null);
  const [userSendingKiss, setUserSendingKiss] = useState(false);
  const [partnerSendingKiss, setPartnerSendingKiss] = useState(false);
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
        window.location.href = '/'; // Hard redirect to ensure auth state clears
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



  // Fetch user and partner data
  useEffect(() => {
    if (!user?.uid) return;

    const fetchData = async () => {
      try {
        // Sync user profile immediately
        await syncUserProfile(user as any);

        // Fetch current user profile
        const myProfile = await getUserProfile(user.uid);
        if (myProfile) {
          setCurrentUserProfile(myProfile);

          // Check for profile completion
          const isComplete = myProfile.displayName && myProfile.bio && myProfile.age;
          if (!isComplete) {
            console.log('[v0] fetchData - Profile incomplete, redirecting...');
            router.push('/profile');
          }
        }

        const matches = await getUserMatches(user.uid);
        if (matches.length > 0) {
          const pId = matches[0];
          setPartnerId(pId);
          const profile = await getUserProfile(pId);
          if (profile) {
            setPartnerData({
              name: profile.displayName,
              status: profile.mood ? `Feeling ${profile.mood}` : 'Calm & Steady',
              bpm: 72,
              connectionStrength: 94,
              intimacyLevel: 88,
              isOnline: true,
              avatar: profile.photoURL || 'https://lh3.googleusercontent.com/aida-public/AB6AXuBkSXUgY0b5DkrugzoSrDwid1UQG-pa3iigkzdXqVWdgZD1GkBCqFInn_SOJxe6Nwh4H_R30nAu6wbAJ332XV7UEuicwRtLxDFU5AGWWOe84X9oO7acECJ1fAS5ki071CI-paHDZygFil5cc7K5oFCRHcmbhQno7jEGgipOYXaUuTzwDOeNxDXQ55KwZ_68jY_nG6xJIeMgdQLj0s4a73jFunYwJ8yHAcWrTG9uEyDPPcDhNMVg3DSqYEiWby1U2Q83Cxg_8dv4BTev',
            });
          }
        }
      } catch (err) {
        console.error('[v0] fetchData - Error:', err);
      }
    };
    fetchData();
  }, [user?.uid]);

  // Subscribe to shared relationship data
  useEffect(() => {
    if (!user?.uid) return;
    const unsubscribe = subscribeToRelationship(user.uid, (rel) => {
      if (rel) {
        setRelationshipId(rel.id);
        setAnniversaryDate(rel.anniversaryDate || rel.matchDate || null);
      }
    });
    return () => unsubscribe();
  }, [user?.uid]);

  const handleUpdateAnniversary = async (date: string) => {
    if (!user?.uid) return;

    try {
      if (!relationshipId && partnerId) {
        // No relationship doc exists yet - create one with the anniversary
        console.log('[Anniversary] Creating new relationship document');
        const newRelId = await createOrUpdateRelationship(user.uid, partnerId, {
          anniversaryDate: date
        });
        setRelationshipId(newRelId);
        setAnniversaryDate(date);
      } else if (relationshipId) {
        // Relationship exists - update it
        console.log('[Anniversary] Updating existing relationship:', relationshipId);
        await updateAnniversary(relationshipId, date);
        setAnniversaryDate(date);
      } else {
        // Fallback: No partner yet, save to user profile
        console.log('[Anniversary] No partner found, saving to user profile');
        await updateUserProfile(user.uid, { anniversaryDate: date });
        setAnniversaryDate(date);
      }
    } catch (err) {
      console.error('[Anniversary] Failed to update anniversary:', err);
    }
  };

  // Sync User Mood to Firestore (Optimized: Only sync on actual change)
  useEffect(() => {
    if (!user?.uid || !userMood) return;

    // Skip if this mood+intensity was already synced
    if (lastSyncedMood.current?.mood === userMood.mood &&
      lastSyncedMood.current?.intensity === userMood.intensity) {
      return;
    }

    updateMood(user.uid, userMood.mood, userMood.intensity);
    lastSyncedMood.current = { mood: userMood.mood, intensity: userMood.intensity };
    console.log('[v0] Syncing mood to cloud (optimized):', userMood.mood);
  }, [userMood.mood, userMood.intensity, user?.uid]);

  // Subscribe to Partner Mood
  useEffect(() => {
    if (!partnerId) return;

    console.log('[v0] Subscribing to partner mood for:', partnerId);
    const unsubscribe = subscribeToUserMood(partnerId, (data) => {
      console.log('[v0] Partner mood updated from cloud:', data);
      setPartnerMood(prev => ({ ...prev, ...data }));

      // Update the status text in partner card
      setPartnerData(prev => prev ? ({
        ...prev,
        status: `Feeling ${data.mood}`,
        dailyLoveCount: data.dailyLoveCount,
      }) : null);
    });
    return () => unsubscribe();
  }, [partnerId]);

  // Subscribe to User's own Profile (to get Real-time Love Bites count)
  useEffect(() => {
    if (!user?.uid) return;
    const unsubscribe = subscribeToUserMood(user.uid, (data) => {
      setUserMood(prev => ({
        ...prev,
        ...data
      }));
    });
    return () => unsubscribe();
  }, [user?.uid]);

  // Subscribe to Love Bites
  useEffect(() => {
    if (!user?.uid) return;
    const unsubscribe = subscribeToLoveBites(user.uid, (bite) => {
      // Trigger animation
      setPartnerSendingKiss(true);
      setTimeout(() => setPartnerSendingKiss(false), 2000);
      handleLoveBite();
    });
    return () => unsubscribe();
  }, [user?.uid]);

  // Simulate user BPM updates
  useEffect(() => {
    const interval = setInterval(() => {
      setUserBpm(prev => {
        const change = Math.random() > 0.5 ? 1 : -1;
        return Math.max(60, Math.min(100, prev + change));
      });
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Sync strength fluctuates slightly
  useEffect(() => {
    const interval = setInterval(() => {
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
    <div className="w-full min-h-screen mx-auto bg-black text-white relative">
      {/* Background Layers - Moved out of space-y flow to fix the 'teleportation/shift' bug */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <HeroBackground />
        <LoveBiteOverlay isActive={isLoveBiteActive} />
      </div>

      <div className="relative z-10 px-4 lg:px-6 py-6 space-y-6 pb-32 md:pb-6 overflow-x-hidden">
        {/* Header */}
        <header className="flex lg:flex-row flex-row items-center justify-between gap-6 px-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/5 backdrop-blur-xl rounded-2xl flex items-center justify-center border border-white/10 shadow-2xl">
              <Image
                alt="Echo Logo"
                src="/echo_logo.png"
                width={36}
                height={36}
                priority
                loading="eager"
                className="drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]"
              />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tighter text-white leading-none">Echo</h1>
              <div className="flex items-center gap-2 mt-1.5">
                <div className="w-2 h-2 bg-green-500 rounded-full shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div>
                <span className="text-[10px] font-bold tracking-[0.2em] text-accent-pink uppercase opacity-80">Sync Active</span>
              </div>
            </div>
          </div>

          {/* User Profile Info - Adjusted for Aesthetics */}
          <div className="flex items-center gap-6 bg-white/5 backdrop-blur-md px-6 py-3 rounded-3xl border border-white/10 shadow-xl">
            <div className="hidden sm:flex flex-col text-right">
              <span className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-bold">Sync Strength</span>
              <span className="text-sm font-black text-accent-pink">{syncStrength.toFixed(1)}%</span>
            </div>
            <div className="h-8 w-px bg-white/10 hidden sm:block"></div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-black leading-none">{user?.displayName || 'You'}</p>
                <div className="flex items-center gap-1 justify-end mt-1">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                  <p className="text-[9px] font-bold text-green-400/80 uppercase tracking-tighter">Online</p>
                </div>
              </div>
              <Link href="/profile" className="relative cursor-pointer group/profile">
                <div className="absolute inset-0 bg-accent-pink blur-md opacity-0 group-hover/profile:opacity-40 transition-opacity rounded-full"></div>
                <div className="w-12 h-12 rounded-full border-2 border-accent-pink/50 p-1 relative transition-transform group-hover/profile:scale-105">
                  <img
                    alt="User"
                    className="w-full h-full rounded-full object-cover shadow-2xl"
                    src={currentUserProfile?.photoURL || user?.photoURL || 'https://via.placeholder.com/40'}
                  />
                </div>
              </Link>
            </div>
          </div>
        </header>

        {/* Together For Section - Balanced for mobile */}
        <div className="max-w-4xl mx-auto w-full px-2 sm:px-0">
          <TogetherFor
            startDate={anniversaryDate}
            onUpdateDate={handleUpdateAnniversary}
          />
        </div>

        <MoodWindow
          userMood={userMood}
          partnerMood={partnerMood}
          userName="You"
          partnerName={partnerData?.name || 'Partner'}
          userSendingKiss={userSendingKiss}
          partnerSendingKiss={partnerSendingKiss}
          onMoodChange={(mood) => setUserMood(prev => ({ ...prev, mood }))}
          onSendLoveBite={async () => {
            if (!user || !partnerId) return;
            setUserSendingKiss(true);
            setTimeout(() => setUserSendingKiss(false), 2000);
            handleLoveBite(); // trigger local effect
            await sendLoveBite(user.uid, partnerId);
          }}
        />


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
            partnerId={partnerId || undefined}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
          />

          {/* Grid Section */}
          <div className=" pt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Partner Card */}
            <PartnerCard
              partnerData={partnerData}
              onSendLoveBite={async () => {
                if (!user || !partnerId) return;
                // Trigger both the full-screen overlay and the stickman animation
                setUserSendingKiss(true);
                setTimeout(() => setUserSendingKiss(false), 2000);
                handleLoveBite();
                await sendLoveBite(user.uid, partnerId);
              }}
            />

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
          <p className="text-[10px] uppercase tracking-[0.5em] text-white/60">Intimacy  Harmony • Echo 2026</p>
        </footer>
      </div>

      {/* Floating Bottom Navigation - Mobile Optimized - Fixed to viewport */}
      <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 md:left-8 md:translate-x-0 z-[100] flex flex-row md:flex-col gap-3">
        <div className="glass-panel-heavy p-2 rounded-[2.5rem] md:rounded-[2rem] flex flex-row md:flex-col gap-2 border border-white/10 shadow-2xl backdrop-blur-2xl">
          <button
            onClick={() => setViewMode('chat')}
            className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center transition-all ${viewMode === 'chat'
              ? 'bg-accent-pink text-white shadow-[0_0_20px_rgba(236,72,153,0.4)]'
              : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white'
              }`}
            title="Live Chat"
          >
            <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
          <Link
            href="/requests"
            className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-white/5 flex items-center justify-center hover:bg-white/10 transition-all text-white/60 hover:text-white group"
            title="View Requests"
          >
            <HeartHandshake className="w-5 h-5 sm:w-6 sm:h-6 group-hover:scale-110 transition-transform" />
          </Link>
          <Link
            href="/discover"
            className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-white/5 flex items-center justify-center hover:bg-white/10 transition-all text-white/60 hover:text-white group"
            title="Global Feed"
          >
            <Compass className="w-5 h-5 sm:w-6 sm:h-6 group-hover:scale-110 transition-transform" />
          </Link>
          <button
            className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-white/5 flex items-center justify-center hover:bg-white/10 transition-all text-white/60 hover:text-white group"
            title="Interests"
          >
            <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 group-hover:scale-110 transition-transform" />
          </button>
        </div>
      </nav>
    </div>
  );
}
