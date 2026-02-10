'use client';

import { useAuth } from '@/lib/auth-context';
import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import {
  getConversationMessages,
  getUserProfile,
  sendMessage,
  getOrCreateConversation,
  subscribeToMessages,
} from '@/lib/firestore-service';
import { UserProfile } from '@/lib/types';

interface Message {
  id: string;
  senderId: string;
  content: string;
  text?: string;
  timestamp: Date;
}
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const loadConversation = async (userUid: string, otherUserId: string, setMessages: any) => {
  const msgs = await getConversationMessages(userUid, otherUserId);
  setMessages(msgs);
};

export default function ConversationPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const otherUserId = params.userId as string;

  const [conversationId, setConversationId] = useState<string>('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [otherUser, setOtherUser] = useState<UserProfile | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user && otherUserId) {
      initializeChat();
    }
  }, [user, otherUserId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const initializeChat = async () => {
    try {
      setIsLoading(true);
      console.log('[v0] Initializing chat with user:', otherUserId);

      // Get or create conversation
      const convId = await getOrCreateConversation(user!.uid, otherUserId);
      console.log('[v0] Conversation ID:', convId);
      setConversationId(convId);

      // Load other user's profile
      const profile = await getUserProfile(otherUserId);
      console.log('[v0] Other user profile:', profile?.displayName);
      setOtherUser(profile);

      // Set up real-time listener for messages
      console.log('[v0] Setting up real-time listener');
      const unsubscribe = subscribeToMessages(user!.uid, otherUserId, (msgs) => {
        console.log('[v0] Real-time messages received:', msgs.length);
        setMessages(msgs);
      });

      setIsLoading(false);

      // Return cleanup function to unsubscribe when component unmounts
      return unsubscribe;
    } catch (error) {
      console.error('[v0] Error initializing chat:', error);
      alert('Error loading chat: ' + (error instanceof Error ? error.message : 'Unknown error'));
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user && otherUserId) {
      const cleanup = initializeChat();
      return () => {
        if (cleanup instanceof Function) {
          cleanup();
        }
      };
    }
  }, [user, otherUserId]);

  const handleSendMessage = async () => {
    if (!user || !newMessage.trim() || !otherUserId) return;

    try {
      setIsSending(true);
      console.log('[v0] Sending message:', newMessage, 'to', otherUserId);
      await sendMessage(user.uid, otherUserId, newMessage);
      console.log('[v0] Message sent successfully');
      setNewMessage('');
      // Real-time listener will automatically update messages
    } catch (error) {
      console.error('[v0] Error sending message:', error);
      alert('Error sending message: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setIsSending(false);
    }
  };

  if (loading || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Loading...
      </div>
    );
  }

  if (!user || !otherUser) return null;

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-100 p-4">
      <div className="max-w-2xl mx-auto h-screen flex flex-col">
        <Card className="flex-1 flex flex-col overflow-hidden">
          <CardHeader className="border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {otherUser.photoURL && (
                  <img
                    src={otherUser.photoURL || "/placeholder.svg"}
                    alt={otherUser.displayName}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                )}
                <CardTitle>{otherUser.displayName}</CardTitle>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/messages')}
              >
                Back
              </Button>
            </div>
          </CardHeader>

          <CardContent className="flex-1 overflow-y-auto p-4">
            {messages.length === 0 ? (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                <p>No messages yet. Say hello!</p>
              </div>
            ) : (
              messages.map((msg) => {
                const isOwn = msg.senderId === user.uid;
                const time =
                  msg.timestamp instanceof Date
                    ? msg.timestamp.toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })
                    : new Date(msg.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      });

                return (
                  <div
                    key={msg.id}
                    className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-3`}
                  >
                    <div
                      className={`max-w-xs px-4 py-2 rounded-lg ${
                        isOwn
                          ? 'bg-blue-500 text-white rounded-br-none'
                          : 'bg-muted text-foreground rounded-bl-none'
                      }`}
                    >
                      <p className="text-sm break-words">{msg.content || msg.text}</p>
                      <p
                        className={`text-xs mt-1 ${
                          isOwn ? 'text-blue-100' : 'text-muted-foreground'
                        }`}
                      >
                        {time}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </CardContent>

          <div className="border-t p-4 flex gap-2">
            <Input
              placeholder="Type a message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !isSending) {
                  handleSendMessage();
                }
              }}
              disabled={isSending}
            />
            <Button
              onClick={handleSendMessage}
              disabled={isSending || !newMessage.trim()}
            >
              Send
            </Button>
          </div>
        </Card>
      </div>
    </main>
  );
}
