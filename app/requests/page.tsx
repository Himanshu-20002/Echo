'use client';

import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getPendingLikes, likeUser, getOrCreateConversation } from '@/lib/firestore-service';
import { UserProfile } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import HeroBackground from '@/components/hero-background';
import { Heart, Home, MessageSquare, Sparkles, User, MapPin, Check, X } from 'lucide-react';

export default function RequestsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [pendingLikes, setPendingLikes] = useState<Array<{ userId: string; profile: UserProfile | null }>>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [respondedTo, setRespondedTo] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!loading && !user) router.push('/');
  }, [user, loading, router]);

  useEffect(() => {
    if (user) loadPendingLikes();
  }, [user]);

  const loadPendingLikes = async () => {
    try {
      setIsLoading(true);
      const pending = await getPendingLikes(user!.uid);
      setPendingLikes(pending);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAccept = async (likerUserId: string) => {
    if (!user) return;
    try {
      await likeUser(user.uid, likerUserId);
      await getOrCreateConversation(user.uid, likerUserId);
      setRespondedTo(new Set([...respondedTo, likerUserId]));
      setPendingLikes(pendingLikes.filter(p => p.userId !== likerUserId));
    } catch (error) {
      console.error(error);
    }
  };

  const handleReject = async (likerUserId: string) => {
    setRespondedTo(new Set([...respondedTo, likerUserId]));
    setPendingLikes(pendingLikes.filter(p => p.userId !== likerUserId));
  };

  if (loading || isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white">
        <HeroBackground />
        <div className="z-10 flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-accent-pink/20 border-t-accent-pink rounded-full animate-spin" />
          <p className="text-accent-pink font-bold animate-pulse uppercase tracking-[0.2em] text-xs">Loading Admirers...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden font-['Be_Vietnam_Pro'] px-4 pb-20">
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
          <h1 className="text-xl font-black tracking-tighter uppercase italic">Admirers</h1>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push('/messages')}
          className="text-white/60 hover:text-white hover:bg-white/10"
        >
          <MessageSquare className="w-5 h-5" />
        </Button>
      </nav>

      <main className="relative z-10 pt-24 max-w-2xl mx-auto space-y-6">
        <div className="glass-panel border-white/10 p-6 rounded-3xl flex items-center justify-between shadow-2xl">
          <div>
            <h2 className="text-xl font-black tracking-tight flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-accent-pink" />
              Who Likes You
            </h2>
            <p className="text-xs text-white/40 font-bold uppercase tracking-widest mt-1">
              {pendingLikes.length} Souls Seeking Connection
            </p>
          </div>
        </div>

        {pendingLikes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
            <div className="w-20 h-20 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
              <Heart className="w-8 h-8 text-white/20" />
            </div>
            <p className="text-white/40 font-bold uppercase tracking-widest text-xs">No pending likes for now</p>
            <Button onClick={() => router.push('/discover')} className="bg-accent-pink rounded-xl px-8 h-12 uppercase font-black tracking-widest text-[10px]">
              Discover more souls
            </Button>
          </div>
        ) : (
          <div className="grid gap-4">
            {pendingLikes.map((like) => {
              const profile = like.profile;
              if (!profile) return null;

              return (
                <Card key={like.userId} className="glass-panel border-white/5 overflow-hidden group animate-in slide-in-from-bottom-4 duration-500">
                  <CardContent className="p-0">
                    <div className="flex h-32">
                      <div className="w-32 h-full relative shrink-0">
                        {profile.photoURL ? (
                          <img
                            src={profile.photoURL || "/placeholder.svg"}
                            alt={profile.displayName}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-white/5 flex items-center justify-center">
                            <User className="w-8 h-8 opacity-10" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-black/60" />
                      </div>

                      <div className="flex-1 p-4 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between">
                            <h3 className="font-black text-lg tracking-tight">
                              {profile.displayName}, {profile.age}
                            </h3>
                          </div>
                          {profile.location && (
                            <p className="text-[10px] text-accent-pink font-black uppercase tracking-widest flex items-center gap-1">
                              <MapPin className="w-2 h-2" />
                              {profile.location}
                            </p>
                          )}
                          <p className="text-xs text-white/60 line-clamp-1 mt-1 font-medium">{profile.bio}</p>
                        </div>

                        <div className="flex gap-2">
                          <Button
                            onClick={() => handleAccept(like.userId)}
                            className="flex-1 bg-accent-pink hover:bg-accent-pink/80 h-10 rounded-xl text-[10px] font-black uppercase tracking-widest gap-2"
                          >
                            <Heart className="w-3 h-3 fill-current" />
                            Match
                          </Button>
                          <Button
                            onClick={() => handleReject(like.userId)}
                            variant="outline"
                            className="w-12 h-10 border-white/10 bg-white/5 hover:bg-white/10 rounded-xl text-white/40 transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </main>

      {/* Footer Nav */}
      <footer className="fixed bottom-0 left-0 right-0 h-16 flex items-center justify-around border-t border-white/5 bg-black/80 backdrop-blur-xl z-[40]">
        <button onClick={() => router.push('/home')} className="flex flex-col items-center gap-1 opacity-40 hover:opacity-100 transition-opacity">
          <Home className="w-5 h-5" />
          <span className="text-[8px] font-bold uppercase tracking-[0.2em]">Home</span>
        </button>
        <button onClick={() => router.push('/discover')} className="flex flex-col items-center gap-1 opacity-40 hover:opacity-100 transition-opacity">
          <Sparkles className="w-5 h-5" />
          <span className="text-[8px] font-bold uppercase tracking-[0.2em]">Discover</span>
        </button>
        <button className="flex flex-col items-center gap-1 text-accent-pink">
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
