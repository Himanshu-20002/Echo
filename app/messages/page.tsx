'use client';

import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  getUserConversations,
  getUserProfile,
  getUnreadCount,
} from '@/lib/firestore-service';
import { Conversation, UserProfile } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function MessagesPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [conversationUsers, setConversationUsers] = useState<
    Map<string, UserProfile | null>
  >(new Map());
  const [unreadCounts, setUnreadCounts] = useState<Map<string, number>>(
    new Map(),
  );
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      loadConversations();
    }
  }, [user]);

  const loadConversations = async () => {
    try {
      setIsLoading(true);
      const convs = await getUserConversations(user!.uid);
      setConversations(convs);

      const userMap = new Map<string, UserProfile | null>();
      const unreadMap = new Map<string, number>();

      for (const conv of convs) {
        const otherUserId = conv.participants.find((pid) => pid !== user!.uid);
        if (otherUserId) {
          const profile = await getUserProfile(otherUserId);
          userMap.set(conv.id, profile);
          const count = await getUnreadCount(user!.uid, otherUserId);
          unreadMap.set(conv.id, count);
        }
      }

      setConversationUsers(userMap);
      setUnreadCounts(unreadMap);
    } catch (error) {
      console.error('Error loading conversations:', error);
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
        {conversations.length === 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>No Messages Yet</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                When you match with someone, you can start messaging here.
              </p>
              <Button onClick={() => router.push('/discover')} className="w-full">
                Back to Discovery
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            <Button
              onClick={() => router.push('/discover')}
              variant="outline"
              className="w-full"
            >
              Back to Discovery
            </Button>
            {conversations.map((conv) => {
              const otherUserId = conv.participants.find(
                (pid) => pid !== user.uid,
              );
              const otherUser = conversationUsers.get(conv.id);
              const unread = unreadCounts.get(conv.id) || 0;

              if (!otherUser) return null;

              return (
                <Card
                  key={conv.id}
                  className="cursor-pointer hover:bg-muted transition"
                  onClick={() => {
                    if (otherUserId) {
                      router.push(`/messages/${otherUserId}`);
                    }
                  }}
                >
                  <CardContent className="pt-4 pb-4 flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      {otherUser.photoURL ? (
                        <img
                          src={otherUser.photoURL || "/placeholder.svg"}
                          alt={otherUser.displayName}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                          {otherUser.displayName.charAt(0)}
                        </div>
                      )}
                      <div className="flex-1">
                        <h3 className="font-semibold">{otherUser.displayName}</h3>
                        <p className="text-sm text-muted-foreground truncate">
                          {conv.lastMessage || 'No messages yet'}
                        </p>
                      </div>
                    </div>
                    {unread > 0 && (
                      <Badge variant="destructive">{unread}</Badge>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
