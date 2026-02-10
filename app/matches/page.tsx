'use client';

import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { getUserProfile } from '@/lib/firestore-service';
import { UserProfile } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function MatchesPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [matches, setMatches] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      loadMatches();
    }
  }, [user]);

  const loadMatches = async () => {
    try {
      setIsLoading(true);
      const likeRef = collection(db, 'likes');
      const q1 = query(likeRef, where('userId', '==', user!.uid));
      const qs1 = await getDocs(q1);
      const likedByUser = qs1.docs.map((doc) => doc.data().likedUserId);

      const q2 = query(likeRef, where('likedUserId', '==', user!.uid));
      const qs2 = await getDocs(q2);
      const whoLikedUser = qs2.docs.map((doc) => doc.data().userId);

      const matchedIds = likedByUser.filter((id) =>
        whoLikedUser.includes(id),
      );

      const matchProfiles = await Promise.all(
        matchedIds.map((id) => getUserProfile(id)),
      );

      setMatches(matchProfiles.filter(Boolean) as UserProfile[]);
    } catch (error) {
      console.error('Error loading matches:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (loading || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Loading...
      </div>
    );
  }

  if (!user) return null;

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-100 p-4">
      <div className="max-w-2xl mx-auto">
        <Card className="mb-4">
          <CardHeader>
            <CardTitle>Your Matches ({matches.length})</CardTitle>
          </CardHeader>
        </Card>

        {matches.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <p className="text-muted-foreground text-center mb-4">
                No matches yet. Keep discovering!
              </p>
              <Button onClick={() => router.push('/discover')} className="w-full">
                Back to Discovery
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {matches.map((match) => (
              <Card key={match.uid} className="overflow-hidden hover:shadow-lg transition">
                <div className="aspect-square bg-muted">
                  {match.photoURL && (
                    <img
                      src={match.photoURL || "/placeholder.svg"}
                      alt={match.displayName}
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
                <CardContent className="pt-4">
                  <h3 className="font-bold text-lg">{match.displayName}</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    {match.location}
                  </p>
                  <Button
                    onClick={() => router.push(`/messages/${match.uid}`)}
                    className="w-full"
                  >
                    Message
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
