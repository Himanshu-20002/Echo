'use client';

import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  getUsersForDiscovery,
  likeUser,
  getUserProfile,
} from '@/lib/firestore-service';
import { UserProfile } from '@/lib/types';
import {
  calculateCompatibility,
  MatchScore,
} from '@/lib/matching-algorithm';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import HeroBackground from '@/components/hero-background';
import { Heart, X, MessageSquare, Home, Sparkles, MapPin, User } from 'lucide-react';
import Image from 'next/image';

export default function DiscoverPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [matchScores, setMatchScores] = useState<Map<string, MatchScore>>(
    new Map(),
  );
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [matchNotification, setMatchNotification] = useState('');
  const [hasCheckedProfile, setHasCheckedProfile] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.push('/');
      return;
    }
    if (!hasCheckedProfile) {
      checkAndLoadProfile();
    }
  }, [user, loading, hasCheckedProfile, router]);

  const checkAndLoadProfile = async () => {
    try {
      setIsLoading(true);
      setHasCheckedProfile(true);
      const userProfile = await getUserProfile(user!.uid);

      if (!userProfile) {
        router.replace('/profile');
        return;
      }

      setCurrentUser(userProfile);
      let discoveryUsers = await getUsersForDiscovery(user!.uid);

      // Filter logic
      const userLikesRef = collection(db, 'likes');
      const userLikes = query(userLikesRef, where('userId', '==', user!.uid));
      const userLikesSnap = await getDocs(userLikes);
      const userLikedIds = new Set(userLikesSnap.docs.map((doc) => doc.data().likedUserId));

      discoveryUsers = discoveryUsers.filter((u) => !userLikedIds.has(u.uid));

      const scores = new Map<string, MatchScore>();
      discoveryUsers.forEach((u) => {
        const score = calculateCompatibility(userProfile, u);
        scores.set(u.uid, score);
      });

      const sorted = discoveryUsers.sort((a, b) => {
        const scoreA = scores.get(a.uid)?.score || 0;
        const scoreB = scores.get(b.uid)?.score || 0;
        return scoreB - scoreA;
      });

      setUsers(sorted);
      setMatchScores(scores);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLike = async () => {
    if (currentIndex >= users.length || !user) return;
    const likedUser = users[currentIndex];
    try {
      await likeUser(user.uid, likedUser.uid);
      setMatchNotification(`Sending love to ${likedUser.displayName}...`);
      setTimeout(() => setMatchNotification(''), 2000);
      setCurrentIndex(currentIndex + 1);
    } catch (error) {
      console.error(error);
    }
  };

  const handlePass = () => setCurrentIndex(currentIndex + 1);

  if (loading || isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white">
        <HeroBackground />
        <div className="z-10 flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-accent-pink/20 border-t-accent-pink rounded-full animate-spin" />
          <p className="text-accent-pink font-bold animate-pulse uppercase tracking-[0.2em] text-xs">Seeking Connections...</p>
        </div>
      </div>
    );
  }

  if (!user || !currentUser) return null;

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden font-['Be_Vietnam_Pro']">
      <HeroBackground className="opacity-40" />

      {/* Navigation Header */}
      <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-4 flex items-center justify-between backdrop-blur-md bg-black/40 border-b border-white/5">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push('/home')}
            className="text-white/60 hover:text-white hover:bg-white/10"
          >
            <Home className="w-5 h-5" />
          </Button>
          <h1 className="text-xl font-black tracking-tighter uppercase italic">Discover</h1>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push('/messages')}
          className="text-white/60 hover:text-white hover:bg-white/10 relative"
        >
          <MessageSquare className="w-5 h-5" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-accent-pink rounded-full animate-pulse shadow-[0_0_8px_#ec4899]" />
        </Button>
      </nav>

      <main className="relative z-10 pt-24 pb-12 px-4 max-w-xl mx-auto flex flex-col min-h-screen">
        {matchNotification && (
          <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[60] animate-in fade-in slide-in-from-top-4 duration-300">
            <div className="bg-accent-pink/20 backdrop-blur-xl border border-accent-pink/40 px-6 py-2 rounded-full shadow-[0_0_20px_rgba(236,72,153,0.3)]">
              <p className="text-white font-bold text-sm tracking-wide">{matchNotification}</p>
            </div>
          </div>
        )}

        {currentIndex >= users.length ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center space-y-6">
            <div className="w-24 h-24 rounded-full bg-white/5 border border-white/10 flex items-center justify-center animate-bounce">
              <Sparkles className="w-10 h-10 text-accent-pink" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-black">All Caught Up!</h2>
              <p className="text-white/40 text-sm max-w-[280px]">You've reviewed everyone for now. Check back later for fresh souls!</p>
            </div>
            <div className="flex flex-col w-full gap-3 pt-4">
              <Button onClick={() => router.push('/requests')} className="bg-accent-pink hover:bg-accent-pink/80 h-12 rounded-xl font-bold uppercase tracking-widest text-xs">
                Check My Likes
              </Button>
              <Button onClick={() => checkAndLoadProfile()} variant="outline" className="border-white/10 bg-white/5 h-12 rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-white/10">
                Refresh Discovery
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col space-y-6 animate-in fade-in zoom-in duration-500">
            <Card className="flex-1 glass-panel border border-white/10 rounded-[32px] overflow-hidden relative group">
              {/* Profile Image */}
              <div className="relative aspect-[4/5] w-full">
                {users[currentIndex].photoURL ? (
                  <img
                    src={users[currentIndex].photoURL || "/placeholder.svg"}
                    alt={users[currentIndex].displayName}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-white/5 text-white/20">
                    <User className="w-20 h-20 mb-2 opacity-10" />
                    <p className="text-xs uppercase tracking-widest font-bold">No Vision Found</p>
                  </div>
                )}

                {/* Visual Overlays */}
                <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

                {/* Compatibility Badge */}
                {matchScores.get(users[currentIndex].uid) && (
                  <div className="absolute top-6 right-6 backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl px-4 py-2 flex flex-col items-center shadow-2xl">
                    <span className="text-[10px] uppercase tracking-widest font-black text-accent-pink/80">Match</span>
                    <span className="text-xl font-black leading-none">{Math.round(matchScores.get(users[currentIndex].uid)!.score)}%</span>
                  </div>
                )}

                {/* Info Text Overlay */}
                <div className="absolute inset-x-0 bottom-0 p-8 space-y-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <h2 className="text-3xl font-black tracking-tighter">
                        {users[currentIndex].displayName}
                        <span className="text-white/60 ml-2">{users[currentIndex].age}</span>
                      </h2>
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_#22c55e]" />
                    </div>
                    {users[currentIndex].location && (
                      <div className="flex items-center gap-1.5 text-white/60 text-xs font-bold uppercase tracking-widest">
                        <MapPin className="w-3 h-3 text-accent-pink" />
                        {users[currentIndex].location}
                      </div>
                    )}
                  </div>

                  <p className="text-sm text-white/80 leading-relaxed font-medium line-clamp-3">
                    {users[currentIndex].bio}
                  </p>

                  <div className="flex flex-wrap gap-2 pt-2">
                    {users[currentIndex].emotions.slice(0, 3).map((emo, i) => (
                      <Badge key={i} className="bg-white/10 hover:bg-white/20 text-white/90 border-none px-3 py-1 text-[10px] uppercase font-black tracking-widest">
                        {emo}
                      </Badge>
                    ))}
                    {matchScores.get(users[currentIndex].uid)?.commonInterests.length! > 0 && (
                      <Badge className="bg-accent-pink/20 text-accent-pink border border-accent-pink/30 px-3 py-1 text-[10px] uppercase font-black tracking-widest">
                        Shared Hobby
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </Card>

            {/* Actions */}
            <div className="grid grid-cols-2 gap-4 h-16 shrink-0 pb-12">
              <Button
                onClick={handlePass}
                variant="outline"
                className="h-full border-white/5 bg-white/5 hover:bg-white/10 hover:border-white/10 rounded-[20px] group transition-all"
              >
                <X className="w-6 h-6 text-white/40 group-hover:text-white transition-colors" />
              </Button>
              <Button
                onClick={handleLike}
                className="h-full bg-accent-pink hover:bg-accent-pink/80 shadow-[0_4px_20px_rgba(236,72,153,0.3)] rounded-[20px] group transition-all"
              >
                <Heart className="w-6 h-6 text-white group-hover:fill-white group-hover:scale-110 transition-transform" />
              </Button>
            </div>
          </div>
        )}
      </main>

      {/* Footer Nav Hint */}
      <footer className="fixed bottom-0 left-0 right-0 h-16 flex items-center justify-around border-t border-white/5 bg-black/80 backdrop-blur-xl z-[40]">
        <button onClick={() => router.push('/home')} className="flex flex-col items-center gap-1 opacity-40 hover:opacity-100 transition-opacity">
          <Home className="w-5 h-5" />
          <span className="text-[8px] font-bold uppercase tracking-[0.2em]">Home</span>
        </button>
        <button className="flex flex-col items-center gap-1 text-accent-pink">
          <Sparkles className="w-5 h-5" />
          <span className="text-[8px] font-bold uppercase tracking-[0.2em]">Discover</span>
        </button>
        <button onClick={() => router.push('/requests')} className="flex flex-col items-center gap-1 opacity-40 hover:opacity-100 transition-opacity">
          <Heart className="w-5 h-5" />
          <span className="text-[8px] font-bold uppercase tracking-[0.2em]">Likes</span>
        </button>
        <button onClick={() => router.push('/messages')} className="flex flex-col items-center gap-1 opacity-40 hover:opacity-100 transition-opacity">
          <MessageSquare className="w-5 h-5" />
          <span className="text-[8px] font-bold uppercase tracking-[0.2em]">Chat</span>
        </button>
      </footer>
    </div>
  );
}
