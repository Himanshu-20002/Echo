'use client';

import { useAuth } from '@/lib/auth-context';
import { useState, useEffect, useRef } from 'react';
import {
    getConversationMessages,
    getUserProfile,
    sendMessage,
    getOrCreateConversation,
    subscribeToMessages,
    getUserConversations
} from '@/lib/firestore-service';
import { UserProfile, Conversation } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MessageSquare, Send, User } from 'lucide-react';

interface Message {
    id: string;
    senderId: string;
    content: string;
    text?: string;
    timestamp: Date;
}

interface ChatInterfaceProps {
    partnerId?: string;
}

export function ChatInterface({ partnerId: initialPartnerId }: ChatInterfaceProps) {
    const { user } = useAuth();
    const [partnerId, setPartnerId] = useState<string | undefined>(initialPartnerId);
    const [conversationId, setConversationId] = useState<string>('');
    const [messages, setMessages] = useState<Message[]>([]);
    const [partnerProfile, setPartnerProfile] = useState<UserProfile | null>(null);
    const [newMessage, setNewMessage] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Sync partnerId with prop when it becomes available
    useEffect(() => {
        if (initialPartnerId) {
            setPartnerId(initialPartnerId);
        }
    }, [initialPartnerId]);

    // If no partnerId provided, try to find the most recent conversation
    useEffect(() => {
        const findPartner = async () => {
            if (!user || partnerId) return;

            try {
                const convs = await getUserConversations(user.uid);
                if (convs.length > 0) {
                    // Get the most recent conversation
                    const recent = convs[0];
                    const pid = recent.participants.find(p => p !== user.uid);
                    if (pid) setPartnerId(pid);
                }
            } catch (err) {
                console.error("Error finding recent conversation:", err);
            }
        };

        findPartner();
    }, [user?.uid, partnerId]);

    // Initialize chat when we have user and partnerId
    useEffect(() => {
        if (user && partnerId) {
            const initializeChat = async () => {
                try {
                    setIsLoading(true);

                    // Get or create conversation
                    const convId = await getOrCreateConversation(user.uid, partnerId);
                    setConversationId(convId);

                    // Get partner profile
                    const profile = await getUserProfile(partnerId);
                    setPartnerProfile(profile);

                    // Subscribe to messages
                    const unsubscribe = subscribeToMessages(user.uid, partnerId, (msgs) => {
                        // Adapt message format if needed (firestore-service might return 'text' or 'content')
                        const formattedMsgs = msgs.map((m: any) => ({
                            ...m,
                            content: m.content || m.text || '',
                            timestamp: m.timestamp?.toDate ? m.timestamp.toDate() : new Date(m.timestamp)
                        }));
                        setMessages(formattedMsgs);
                        setIsLoading(false);
                    });

                    return unsubscribe;
                } catch (error) {
                    console.error('Error initializing chat:', error);
                    setIsLoading(false);
                }
            };

            const cleanupPromise = initializeChat();
            return () => {
                cleanupPromise.then(cleanup => cleanup && cleanup());
            };
        } else {
            setIsLoading(false);
        }
    }, [user?.uid, partnerId]);

    // Auto-scroll disabled to prevent page jumping
    // Auto-scroll to bottom of chat container only
    useEffect(() => {
        if (messagesEndRef.current?.parentElement) {
            const container = messagesEndRef.current.parentElement;
            container.scrollTo({
                top: container.scrollHeight,
                behavior: 'smooth'
            });
        }
    }, [messages]);

    const handleSendMessage = async () => {
        if (!user || !newMessage.trim() || !partnerId) return;

        try {
            setIsSending(true);
            await sendMessage(user.uid, partnerId, newMessage);
            setNewMessage('');
        } catch (error) {
            console.error('Error sending message:', error);
        } finally {
            setIsSending(false);
        }
    };

    const formatTime = (date: Date) => {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    if (isLoading) {
        return (
            <div className="w-full h-full flex items-center justify-center text-white/30 flex-col gap-2">
                <div className="w-6 h-6 border-2 border-accent-pink/30 border-t-accent-pink rounded-full animate-spin" />
                <p className="text-xs uppercase tracking-widest">Connecting...</p>
            </div>
        );
    }

    if (!partnerId) {
        return (
            <div className="w-full h-full flex items-center justify-center text-white/30 flex-col gap-4 p-6 text-center">
                <MessageSquare className="w-12 h-12 opacity-20" />
                <div>
                    <p className="text-sm font-bold text-white/60 mb-1">No Active Chat</p>
                    <p className="text-xs">Start a conversation from the Messages page first.</p>
                </div>
                <Button variant="outline" className="bg-white/5 border-white/10 text-xs hover:bg-white/10" onClick={() => window.location.href = '/messages'}>
                    Go to Messages
                </Button>
            </div>
        );
    }

    return (
        <div className="w-full h-full flex flex-col bg-black/20 rounded-xl overflow-hidden backdrop-blur-sm border border-white/5">
            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none'] overscroll-contain">
                {messages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-white/30 space-y-2">
                        <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center mb-2">
                            <User className="w-5 h-5 opacity-50" />
                        </div>
                        <p className="text-xs text-center">
                            Send a message to start chatting with <br />
                            <span className="text-accent-pink font-bold">{partnerProfile?.displayName || 'Partner'}</span>
                        </p>
                    </div>
                ) : (
                    messages.map((msg) => {
                        const isOwn = msg.senderId === user?.uid;
                        return (
                            <div key={msg.id} className={`flex w-full ${isOwn ? 'justify-end' : 'justify-start'} group animate-in fade-in slide-in-from-bottom-2 duration-300`}>
                                <div className={`max-w-[85%] sm:max-w-[70%] flex flex-col ${isOwn ? 'items-end' : 'items-start'}`}>
                                    <div className="flex items-center gap-2 mb-1 px-1">
                                        <span className={`text-[10px] font-bold ${isOwn ? 'text-accent-pink' : 'text-white/40'}`}>
                                            {isOwn ? 'You' : (partnerProfile?.displayName || 'Partner')}
                                        </span>
                                        <span className="text-[9px] text-white/20">
                                            {formatTime(msg.timestamp)}
                                        </span>
                                    </div>

                                    <div className={`
                        p-3 sm:p-4 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-sm transition-all break-words
                        ${isOwn
                                            ? 'bg-accent-pink/20 border border-accent-pink/20 text-white/90 rounded-tr-sm '
                                            : 'bg-white/10 border border-white/5 text-white/90 rounded-tl-sm '
                                        }
                    `}>
                                        {msg.content}
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-3 sm:p-4 bg-white/5 border-t border-white/10">
                <div className="flex gap-2 items-end bg-black/40 p-1.5 rounded-[20px] border border-white/10 focus-within:border-accent-pink/50 focus-within:ring-1 focus-within:ring-accent-pink/50 transition-all">
                    <Input
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSendMessage();
                            }
                        }}
                        placeholder="Type your message..."
                        className="flex-1 bg-transparent border-none focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-white/30 text-white min-h-[40px] py-2 px-4 resize-none text-xs sm:text-sm"
                        autoComplete="off"
                    />
                    <Button
                        onClick={handleSendMessage}
                        disabled={isSending || !newMessage.trim()}
                        size="icon"
                        className={`w-9 h-9 rounded-full shrink-0 transition-all ${newMessage.trim()
                            ? 'bg-accent-pink hover:bg-accent-pink/90 text-white shadow-[0_0_10px_rgba(236,72,153,0.3)]'
                            : 'bg-white/10 text-white/30 hover:bg-white/20'
                            }`}
                    >
                        <Send className="w-4 h-4 ml-0.5" />
                    </Button>
                </div>
            </div>
        </div>
    );
}
