'use client';

import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  getUsersForDiscovery,
  likeUser,
  checkMutualLike,
  getUserProfile,
} from '@/lib/firestore-service';
import { UserProfile } from '@/lib/types';
import {
  calculateCompatibility,
  MatchScore,
} from '@/lib/matching-algorithm';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase'; // Assuming db is imported from firebase

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

    // Check profile only once
    if (!hasCheckedProfile) {
      checkAndLoadProfile();
    }
  }, [user, loading, hasCheckedProfile, router]);

  const checkAndLoadProfile = async () => {
    try {
      setIsLoading(true);
      setHasCheckedProfile(true);
      
      console.log('[v0] Checking profile for user:', user?.uid);
      
      // Add 5 second timeout for profile check
      const timeoutPromise = new Promise<UserProfile | null>((resolve) => {
        const timer = setTimeout(() => {
          console.log('[v0] Profile check timeout');
          resolve(null);
        }, 5000);
      });

      const profilePromise = getUserProfile(user!.uid).catch((error) => {
        console.error('[v0] Firestore error:', error);
        return null;
      });

      const userProfile = await Promise.race([profilePromise, timeoutPromise]);
      console.log('[v0] Profile result:', userProfile ? 'exists' : 'not found');

      if (!userProfile) {
        console.log('[v0] No profile found, redirecting to /profile');
        setIsLoading(false);
        router.replace('/profile');
        return;
      }

      // Profile exists, load discovery
      setCurrentUser(userProfile);
      let discoveryUsers = await getUsersForDiscovery(user!.uid);
      console.log('[v0] Found discovery users:', discoveryUsers.length);

      // Filter out users you've already matched with (mutual likes)
      const userLikesRef = collection(db, 'likes');
      const userLikes = query(userLikesRef, where('userId', '==', user!.uid));
      const userLikesSnap = await getDocs(userLikes);
      const userLikedIds = new Set(
        userLikesSnap.docs.map((doc) => doc.data().likedUserId),
      );

      const likedByUserRef = collection(db, 'likes');
      const likedByUserQuery = query(likedByUserRef, where('likedUserId', '==', user!.uid));
      const likedByUserSnap = await getDocs(likedByUserQuery);
      const likedByUserIds = new Set(
        likedByUserSnap.docs.map((doc) => doc.data().userId),
      );

      // Remove mutual matches from discovery
      discoveryUsers = discoveryUsers.filter(
        (u) => !(userLikedIds.has(u.uid) && likedByUserIds.has(u.uid)),
      );
      console.log('[v0] After filtering matches:', discoveryUsers.length);

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
      setIsLoading(false);
    } catch (error) {
      console.error('[v0] Error in checkAndLoadProfile:', error);
      console.log('[v0] Redirecting to /profile due to error');
      setIsLoading(false);
      router.replace('/profile');
    }
  };

  const handleLike = async () => {
    if (currentIndex >= users.length || !user) return;

    try {
      const likedUser = users[currentIndex];
      console.log('[v0] Liking user:', {
        currentUserId: user.uid,
        likedUserId: likedUser.uid,
        likedUserName: likedUser.displayName,
      });
      
      await likeUser(user.uid, likedUser.uid);
      console.log('[v0] Like saved successfully');
      
      // Show simple like notification
      setMatchNotification(`Liked ${likedUser.displayName}`);
      setTimeout(() => setMatchNotification(''), 2000);

      setCurrentIndex(currentIndex + 1);
    } catch (error) {
      console.error('[v0] Error liking user:', error);
      alert('Error saving like: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  };

  const handlePass = () => {
    setCurrentIndex(currentIndex + 1);
  };

  const loadUsers = async () => {
    // Implement the loadUsers function here
    if (!user) return;

    try {
      setIsLoading(true);
      const discoveryUsers = await getUsersForDiscovery(user!.uid);
      console.log('[v0] Found discovery users:', discoveryUsers.length);

      const scores = new Map<string, MatchScore>();
      discoveryUsers.forEach((u) => {
        const score = calculateCompatibility(currentUser!, u);
        scores.set(u.uid, score);
      });

      const sorted = discoveryUsers.sort((a, b) => {
        const scoreA = scores.get(a.uid)?.score || 0;
        const scoreB = scores.get(b.uid)?.score || 0;
        return scoreB - scoreA;
      });

      setUsers(sorted);
      setMatchScores(scores);
      setIsLoading(false);
    } catch (error) {
      console.error('[v0] Error in loadUsers:', error);
      setIsLoading(false);
    }
  };

  if (loading || isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
        <p className="text-muted-foreground">Setting up your profile...</p>
      </div>
    );
  }

  if (!user || !currentUser) return null;

  if (currentIndex >= users.length) {
    return (
      <main className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-slate-100 p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>No More Profiles</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              You've reviewed all available profiles. Check back later for more
              users!
            </p>
            <div className="flex gap-2">
              <Button onClick={() => router.push('/messages')} className="flex-1">
                View Matches
              </Button>
              <Button onClick={loadUsers} variant="outline" className="flex-1 bg-transparent">
                Refresh
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    );
  }

  const currentProfileUser = users[currentIndex];
  const matchScore = matchScores.get(currentProfileUser.uid);

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-100 p-4">
      <div className="max-w-2xl mx-auto space-y-4">
        {matchNotification && (
          <Card className="border-green-300 bg-green-50">
            <CardContent className="pt-6">
              <p className="text-green-900 font-semibold text-center">
                {matchNotification}
              </p>
            </CardContent>
          </Card>
        )}

        <Card className="w-full overflow-hidden">
          <div className="relative">
            <div className="aspect-square bg-muted relative">
              {currentProfileUser.photoURL ? (
                <img
                  src={currentProfileUser.photoURL || "/placeholder.svg"}
                  alt={currentProfileUser.displayName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                  No photo
                </div>
              )}
            </div>
            {matchScore && (
              <div className="absolute top-4 right-4 bg-white rounded-full px-3 py-1 font-bold text-lg">
                {Math.round(matchScore.score)}%
              </div>
            )}
          </div>

          <CardContent className="pt-6">
            <div className="mb-4">
              <h2 className="text-2xl font-bold">
                {currentProfileUser.displayName}
                {currentProfileUser.age && `, ${currentProfileUser.age}`}
              </h2>
              {currentProfileUser.location && (
                <p className="text-sm text-muted-foreground">
                  {currentProfileUser.location}
                </p>
              )}
            </div>

            {currentProfileUser.bio && (
              <p className="text-sm mb-4 line-clamp-3">{currentProfileUser.bio}</p>
            )}

            {currentProfileUser.emotions.length > 0 && (
              <div className="mb-4">
                <p className="text-xs font-semibold text-muted-foreground mb-2">
                  Feeling
                </p>
                <div className="flex flex-wrap gap-2">
                  {currentProfileUser.emotions.slice(0, 4).map((emotion, i) => (
                    <Badge key={i} variant="secondary" className="text-xs">
                      {emotion}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {matchScore?.commonEmotions.length > 0 && (
              <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                <p className="text-xs font-semibold text-blue-900 mb-2">
                  Common Feelings
                </p>
                <div className="flex flex-wrap gap-2">
                  {matchScore.commonEmotions.map((emotion, i) => (
                    <span
                      key={i}
                      className="text-xs bg-blue-200 text-blue-900 px-2 py-1 rounded"
                    >
                      {emotion}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {matchScore?.commonInterests.length > 0 && (
              <div className="p-3 bg-green-50 rounded-lg">
                <p className="text-xs font-semibold text-green-900 mb-2">
                  Shared Interests
                </p>
                <div className="flex flex-wrap gap-2">
                  {matchScore.commonInterests.map((interest, i) => (
                    <span
                      key={i}
                      className="text-xs bg-green-200 text-green-900 px-2 py-1 rounded"
                    >
                      {interest}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex gap-3">
          <Button onClick={handlePass} variant="outline" className="flex-1 bg-transparent" size="lg">
            Pass
          </Button>
          <Button onClick={handleLike} className="flex-1" size="lg">
            Like
          </Button>
        </div>

        <div className="text-center text-sm text-muted-foreground">
          {currentIndex + 1} of {users.length}
        </div>
      </div>
    </main>
  );
}
