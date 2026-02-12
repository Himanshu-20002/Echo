export type MoodType = 'love' | 'happy' | 'sad' | 'angry' | 'calm';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  bio?: string;
  age?: number;
  location?: string;
  height?: string;
  emotions: string[];
  favoriteMusic: string[];
  interests: string[];
  createdAt: Date;
  mood?: MoodType;
  moodIntensity?: number;
  dailyLoveCount?: number;
  lastLoveResetDate?: string; // YYYY-MM-DD
  anniversaryDate?: string; // ISO string
  matchDate?: string; // ISO string
}

export interface Message {
  id: string;
  senderId: string;
  recipientId: string;
  content: string;
  timestamp: Date;
  read: boolean;
}

export interface Conversation {
  id: string;
  participants: string[];
  lastMessage?: string;
  lastMessageTime?: Date;
}

export interface LoveBite {
  id: string;
  fromId: string;
  toId: string;
  timestamp: Date;
}
