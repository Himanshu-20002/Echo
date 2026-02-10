'use client';

import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getPendingLikes, likeUser, getOrCreateConversation } from '@/lib/firestore-service';
import { UserProfile } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function RequestsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [pendingLikes, setPendingLikes] = useState<Array<{ userId: string; profile: UserProfile | null }>>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [respondedTo, setRespondedTo] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      loadPendingLikes();
    }
  }, [user]);

  const loadPendingLikes = async () => {
    try {
      setIsLoading(true);
      console.log('[v0] Loading pending likes for user:', user!.uid);
      const pending = await getPendingLikes(user!.uid);
      console.log('[v0] Pending likes count:', pending.length, pending);
      setPendingLikes(pending);
    } catch (error) {
      console.error('[v0] Error loading pending likes:', error);
      alert('Error loading requests: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleAccept = async (likerUserId: string) => {
    if (!user) return;
    try {
      console.log('[v0] Accepting like from:', likerUserId);
      // Like them back
      await likeUser(user.uid, likerUserId);
      console.log('[v0] Like back saved');
      
      // Create conversation so they can message
      await getOrCreateConversation(user.uid, likerUserId);
      console.log('[v0] Conversation created');
      
      setRespondedTo(new Set([...respondedTo, likerUserId]));
      
      // Remove from pending list
      setPendingLikes(pendingLikes.filter(p => p.userId !== likerUserId));
      
      alert('Match! You can now message them.');
    } catch (error) {
      console.error('[v0] Error accepting like:', error);
      alert('Error accepting request: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  };

  const handleReject = async (likerUserId: string) => {
    setRespondedTo(new Set([...respondedTo, likerUserId]));
    setPendingLikes(pendingLikes.filter(p => p.userId !== likerUserId));
  };

  if (loading || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-100 p-4">
      <div className="max-w-2xl mx-auto space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Like Requests ({pendingLikes.length})</CardTitle>
            <p className="text-sm text-muted-foreground mt-2">
              People who like you. Accept to match and start chatting!
            </p>
          </CardHeader>
        </Card>

        {pendingLikes.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-muted-foreground mb-4">
                No pending requests yet. Keep discovering!
              </p>
              <Button onClick={() => router.push('/discover')} className="w-full">
                Continue Discovering
              </Button>
            </CardContent>
          </Card>
        ) : (
          pendingLikes.map((like) => {
            const profile = like.profile;
            if (!profile) return null;

            return (
              <Card key={like.userId} className="overflow-hidden">
                <CardContent className="pt-4">
                  <div className="flex gap-4">
                    <div className="w-24 h-24 flex-shrink-0">
                      {profile.photoURL ? (
                        <img
                          src={profile.photoURL || "/placeholder.svg"}
                          alt={profile.displayName}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      ) : (
                        <div className="w-full h-full bg-muted rounded-lg flex items-center justify-center">
                          {profile.displayName.charAt(0)}
                        </div>
                      )}
                    </div>

                    <div className="flex-1">
                      <h3 className="font-bold text-lg">
                        {profile.displayName}
                        {profile.age && `, ${profile.age}`}
                      </h3>
                      {profile.location && (
                        <p className="text-sm text-muted-foreground">
                          {profile.location}
                        </p>
                      )}
                      {profile.bio && (
                        <p className="text-sm mt-2 line-clamp-2">
                          {profile.bio}
                        </p>
                      )}

                      <div className="flex gap-2 mt-4">
                        <Button
                          onClick={() => handleAccept(like.userId)}
                          size="sm"
                          className="flex-1"
                        >
                          ❤️ Accept
                        </Button>
                        <Button
                          onClick={() => handleReject(like.userId)}
                          size="sm"
                          variant="outline"
                          className="flex-1"
                        >
                          Pass
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </main>
  );
}
