# Echo - React Native Implementation Guide

**Document Version:** 1.0  
**Target Platforms:** iOS & Android  
**Date:** April 14, 2026

---

## Executive Summary

Echo is an emotion-based social matching platform that connects couples and individuals through shared emotional states, interests, and compatibility. This document provides a comprehensive blueprint for migrating the Next.js web application to React Native while maintaining feature parity and improving mobile-specific functionality.

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Architecture & Design Patterns](#architecture--design-patterns)
3. [Core Features Implementation](#core-features-implementation)
4. [Technology Stack](#technology-stack)
5. [Data Models & Firestore Schema](#data-models--firestore-schema)
6. [Authentication System](#authentication-system)
7. [Component Architecture](#component-architecture)
8. [State Management](#state-management)
9. [Database & Backend Integration](#database--backend-integration)
10. [UI/UX Implementation](#uiux-implementation)
11. [Key Features Deep Dive](#key-features-deep-dive)
12. [Performance Optimizations](#performance-optimizations)
13. [Platform-Specific Considerations](#platform-specific-considerations)
14. [Testing Strategy](#testing-strategy)
15. [Deployment & Release](#deployment--release)
16. [Improvement Opportunities](#improvement-opportunities)

---

## Project Overview

### What is Echo?

Echo is an **emotion-aware social platform** that:
- Connects users through shared emotional states and interests
- Provides real-time mood synchronization between matched couples
- Enables meaningful conversations through shared interests
- Features emotional visualization and intimate connection tracking
- Supports messaging, profile discovery, and relationship milestones

### Current Web Stack (Source)

| Layer | Technology |
|-------|------------|
| **Framework** | Next.js 16.1.6 |
| **Language** | TypeScript 5.7.3 |
| **UI Library** | React 19 |
| **Component Library** | Radix UI (headless) + shadcn/ui |
| **Styling** | Tailwind CSS 3.4.17 |
| **Backend** | Firebase (Auth + Firestore + Storage) |
| **Data Visualization** | Recharts 2.15.0 |
| **Form Handling** | React Hook Form + Zod validation |
| **API Client** | Firebase SDK |
| **State Management** | React Context API |

### Target React Native Stack

| Layer | Recommended Technology |
|-------|------------------------|
| **Framework** | React Native with Expo / React Native CLI |
| **Language** | TypeScript 5.x |
| **UI Library** | React Native Paper / NativeBase / Tamagui |
| **Styling** | NativeWind / Tailwind CSS (via community package) |
| **Backend** | Firebase (no changes) |
| **Navigation** | React Navigation 6.x |
| **Data Visualization** | Victory Native / React Native SVG Charts |
| **Form Handling** | React Hook Form + Zod (same) |
| **API Client** | Firebase SDK (React Native compatible) |
| **State Management** | React Context API / Zustand (recommended) |
| **Video Playback** | React Native Video / expo-av |
| **Camera/Permissions** | expo-camera / react-native-permissions |

---

## Architecture & Design Patterns

### 1. **Layered Architecture**

```
┌─────────────────────────────────────┐
│        Presentation Layer            │
│  (Screens, Components, Navigation)   │
├─────────────────────────────────────┤
│        State Management Layer        │
│  (Context, Zustand, Redux)           │
├─────────────────────────────────────┤
│        Business Logic Layer          │
│  (Services, Algorithms, Validation)  │
├─────────────────────────────────────┤
│        Data/API Layer                │
│  (Firebase SDK, Firestore)           │
└─────────────────────────────────────┘
```

### 2. **Design Patterns to Implement**

| Pattern | Purpose | Implementation |
|---------|---------|-----------------|
| **Container/Presentational** | Separate logic from UI | Screen components with hooks vs. UI components |
| **Custom Hooks** | Reusable logic | `useAuth`, `useMatchingAlgorithm`, `useMood` |
| **Observer Pattern** | Real-time updates | Firebase listeners for mood, messages, relationships |
| **Dependency Injection** | Testability & flexibility | Context providers for services |
| **Factory Pattern** | Object creation | User profile factories, Mood creation |
| **Memoization** | Performance | `React.memo`, `useMemo`, `useCallback` |

### 3. **Folder Structure**

```
echo-mobile/
├── src/
│   ├── app/
│   │   ├── App.tsx                    # Root component
│   │   └── AppNavigator.tsx           # Navigation setup
│   ├── screens/
│   │   ├── auth/
│   │   │   ├── LandingScreen.tsx
│   │   │   └── LoginScreen.tsx
│   │   ├── home/
│   │   │   ├── HomeDashboardScreen.tsx
│   │   │   ├── MoodDisplayScreen.tsx
│   │   │   └── VideoGalleryScreen.tsx
│   │   ├── discovery/
│   │   │   ├── DiscoverScreen.tsx
│   │   │   ├── MatchDetailsScreen.tsx
│   │   │   └── CompatibilityScreen.tsx
│   │   ├── matches/
│   │   │   └── MatchesListScreen.tsx
│   │   ├── messages/
│   │   │   ├── MessagesListScreen.tsx
│   │   │   └── ChatScreen.tsx
│   │   ├── profile/
│   │   │   ├── ProfileScreen.tsx
│   │   │   ├── EditProfileScreen.tsx
│   │   │   └── SettingsScreen.tsx
│   │   └── relationship/
│   │       ├── PartnerCardScreen.tsx
│   │       └── RelationshipMilestones.tsx
│   │
│   ├── components/
│   │   ├── common/
│   │   │   ├── SafeAreaWrapper.tsx
│   │   │   ├── LoadingSpinner.tsx
│   │   │   ├── ErrorBoundary.tsx
│   │   │   └── NativeImage.tsx
│   │   ├── dashboard/
│   │   │   ├── MoodWindow.tsx
│   │   │   ├── HeartbeatGraph.tsx
│   │   │   ├── PartnerCard.tsx
│   │   │   ├── LoveBiteOverlay.tsx
│   │   │   └── SyncStrengthMeter.tsx
│   │   ├── discovery/
│   │   │   ├── ProfileCard.tsx
│   │   │   ├── CompatibilityBadge.tsx
│   │   │   └── CardStack.tsx
│   │   ├── messages/
│   │   │   ├── MessageBubble.tsx
│   │   │   ├── InputBox.tsx
│   │   │   └── ConversationItem.tsx
│   │   └── ui/
│   │       ├── Button.tsx
│   │       ├── Card.tsx
│   │       ├── Input.tsx
│   │       └── ...other base components
│   │
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── useFirestore.ts
│   │   ├── useMood.ts
│   │   ├── useMatching.ts
│   │   ├── useMessages.ts
│   │   ├── useDimensions.ts
│   │   ├── useKeyboard.ts
│   │   └── useAppState.ts
│   │
│   ├── context/
│   │   ├── AuthContext.tsx
│   │   ├── UserContext.tsx
│   │   ├── RelationshipContext.tsx
│   │   └── ThemeContext.tsx
│   │
│   ├── services/
│   │   ├── auth/
│   │   │   ├── authService.ts
│   │   │   └── googleAuth.ts
│   │   ├── firestore/
│   │   │   ├── userService.ts
│   │   │   ├── matchingService.ts
│   │   │   ├── messagingService.ts
│   │   │   ├── relationshipService.ts
│   │   │   └── moodService.ts
│   │   ├── storage/
│   │   │   └── imageUploadService.ts
│   │   └── matching/
│   │       ├── compatibilityAlgorithm.ts
│   │       └── emotionMatcher.ts
│   │
│   ├── utils/
│   │   ├── constants.ts
│   │   ├── validators.ts
│   │   ├── formatters.ts
│   │   ├── colors.ts
│   │   ├── moodConfig.ts
│   │   └── helpers.ts
│   │
│   ├── types/
│   │   ├── index.ts                  # All type exports
│   │   ├── models.ts
│   │   ├── api.ts
│   │   └── navigation.ts
│   │
│   ├── styles/
│   │   ├── theme.ts
│   │   ├── spacing.ts
│   │   └── typography.ts
│   │
│   ├── assets/
│   │   ├── images/
│   │   ├── animations/
│   │   └── fonts/
│   │
│   └── config/
│       ├── firebase.ts
│       ├── env.ts
│       └── globals.ts
│
├── __tests__/
│   ├── unit/
│   ├── integration/
│   └── e2e/
│
├── app.json
├── package.json
├── tsconfig.json
├── babel.config.js
├── metro.config.js
├── jest.config.js
└── README.md
```

---

## Core Features Implementation

### Feature 1: **Authentication & User Onboarding**

**Path:** `/screens/auth` + `/services/auth`

#### Implementation Steps:

1. **Landing Screen (Unauthenticated)**
   - Display app branding and value proposition
   - Google Sign-In button (primary CTA)
   - Terms & Privacy policy links
   - Animated background (similar to web version)

2. **Google Authentication Flow**
   ```typescript
   // services/auth/googleAuth.ts
   - Use @react-native-google-signin/google-signin
   - Integration with Firebase Auth
   - Automatic user profile sync in Firestore
   - Handle both iOS and Android flows
   ```

3. **Profile Creation Post-Auth**
   - Redirect to EditProfileScreen if new user
   - Collect: displayName, bio, age, location, height
   - Photo upload capability (camera + gallery)
   - Initial interests & mood selection

4. **Session Management**
   - Persist auth token in secure storage
   - Implement auto-refresh logic
   - Handle logout gracefully

#### Key Dependencies:
- `@react-native-google-signin/google-signin`
- `react-native-securely`
- `@react-native-AsyncStorage/async-storage` (fallback)

---

### Feature 2: **Discovery & Matching Algorithm**

**Path:** `/screens/discovery` + `/services/matching`

#### Cards Stack Implementation:
- **Swipeable Card Component** (Tinder-like)
  - Stack cards horizontally
  - Swipe left (pass) / right (like) gestures
  - Animated transitions
  - Library: `react-native-gesture-handler` + custom Animated API

#### Matching Algorithm (Compatibilty Score):
```typescript
// services/matching/compatibilityAlgorithm.ts

export interface MatchScore {
  userId: string;
  score: number;           // 0-100
  commonEmotions: string[];
  commonInterests: string[];
}

function calculateCompatibility(user1, user2): MatchScore {
  let score = 0;
  
  // 1. Emotional Compatibility (40 points)
  const commonEmotions = findIntersection(user1.emotions, user2.emotions);
  score += (commonEmotions.length / max(user1, user2)) * 40;
  
  // 2. Interest Compatibility (35 points)
  const commonInterests = findIntersection(user1.interests, user2.interests);
  score += (commonInterests.length / max(user1, user2)) * 35;
  
  // 3. Age Compatibility (15 points)
  const ageDiff = Math.abs(user1.age - user2.age);
  if (ageDiff <= 5) score += 15;
  else if (ageDiff <= 10) score += 10;
  else if (ageDiff <= 15) score += 5;
  
  // 4. Location Proximity (10 points)
  score += user1.location === user2.location ? 10 : 0;
  
  // 5. Profile Completeness (5 points)
  score += (user2.bio && user2.photoURL) ? 5 : 0;
  
  return {
    userId: user2.uid,
    score: Math.min(score, 100),
    commonEmotions,
    commonInterests
  };
}
```

#### UI Components:
1. **ProfileCard** - Individual card display
   - Profile photo
   - Name, age, location
   - Bio excerpt
   - Interests badges
   - Mood indicator
   - Match score percentage

2. **DiscoverScreen** - Card stack controller
   - Gesture handling
   - Card animation
   - Buttons: Like (❤️) / Pass (✕)
   - Current position indicator (X of Y)

#### Data Flow:
```
DiscoverScreen
├─ Load user profile (current user)
├─ Fetch discovery users (all - current user - already liked)
├─ Calculate compatibility scores
├─ Sort by score (highest first)
├─ Render CardStack
└─ Handle like/pass actions
   ├─ Save to 'likes' collection
   ├─ Check for mutual like
   └─ Create relationship if mutual match
```

---

### Feature 3: **Home Dashboard - Partner Connection**

**Path:** `/screens/home/HomeDashboardScreen.tsx`

#### Key Components:

1. **Partner Info Card**
   - Avatar with online status
   - Current mood visualization
   - BPM (heart rate) display
   - Connection strength meter
   - Intimacy level meter
   - Last message preview

2. **Dual Heartbeat Graph**
   - Real-time BPM tracking
   - User vs Partner comparison
   - 60-second sliding window
   - Color-coded lines
   - Synchronized animation

3. **Mood Window**
   - Both users' current moods
   - Intensity scale (1-5)
   - Animated mood visuals
   - Mood message display
   - Update mood capability

4. **Main Display Modes**
   - **Graph View**: Heartbeat graph (default)
   - **Video View**: YouTube-style embedded video player
   - **Game View**: Mini Dino game (interactive element)
   - **Video Gallery**: Collection of couple videos

5. **Action Buttons**
   - Send Love Bite (animated heart shower)
   - Video toggle
   - Message overlay
   - Mood update

#### Real-Time Synchronization:
```typescript
// Firestore listeners in relationships collection
const setupRelationshipListener = (relationshipId) => {
  const unsubscribe = onSnapshot(
    doc(db, 'relationships', relationshipId),
    (snapshot) => {
      const rel = snapshot.data();
      // Update partner data: mood, BPM, intimacy level
      // Trigger UI animations
    }
  );
  return unsubscribe;
};
```

#### Implementation Details:
- **Mood Updates**: When user changes mood
  ```typescript
  - Update user profile (mood, moodIntensity)
  - Update relationship document
  - Fetch partner mood in real-time
  - Animate transition
  ```

- **Love Bite Animation**:
  ```typescript
  - Trigger heart shower overlay
  - 10 hearts with random positions
  - Floating animation with fade-out
  - Duration: ~3 seconds
  - Haptic feedback on iOS/Android
  ```

- **Heartbeat Graph**:
  ```typescript
  - Generate mock BPM data (or connect to wearables)
  - Update every 1-2 seconds
  - Keep 60-point sliding window
  - Animate line transitions
  ```

---

### Feature 4: **Messaging System**

**Path:** `/screens/messages` + `/services/firestore/messagingService.ts`

#### Components:

1. **MessagesListScreen**
   - List of conversations
   - Unread count badges
   - Last message preview
   - Timestamp
   - Tap to enter conversation

2. **ChatScreen**
   - Message list (scrollable, paginated)
   - Input box with send button
   - Images/attachments support
   - Typing indicator
   - Read receipts
   - User presence indicator

#### Firestore Structure:
```
conversations/
├── {userId}_{partnerId}/
│   ├── participants: [userId, partnerId]
│   ├── createdAt: timestamp
│   ├── updatedAt: timestamp
│   └── collections:
│       └── messages/
│           ├── {messageId}:
│           │   ├── senderId: string
│           │   ├── content: string
│           │   ├── timestamp: timestamp
│           │   ├── read: boolean
│           │   └── attachments?: [{ type, url }]
```

#### Key Features:
- **Pagination**: Load 20 messages per batch
- **Real-time Updates**: onSnapshot on messages subcollection
- **Read Status**: Mark messages as read when viewed
- **Typing Indicator**: Temporary document update
- **Image Sharing**: Firebase Storage upload

---

### Feature 5: **User Profiles & Directory**

**Path:** `/screens/profile` + `/services/firestore/userService.ts`

#### My Profile Screen:
- Display user info (editable)
- Fields: Name, Age, Location, Height, Bio
- Interests list (add/remove)
- Music preferences
- Photo management (upload new, delete)
- Settings access

#### Edit Profile Screen:
- Form with all editable fields
- Photo picker (camera + gallery)
- Save button with validation
- Success/error feedback

#### Other User Profiles (from Discovery/Matches):
- Read-only view
- Profile info
- Interests, music
- Match percentage
- Option to message

#### Firestore Schema:
```
users/
├── {uid}:
│   ├── displayName: string
│   ├── email: string
│   ├── photoURL: string
│   ├── bio: string
│   ├── age: number
│   ├── location: string
│   ├── height: string
│   ├── emotions: string[]          # Last 10 emotions
│   ├── interests: string[]
│   ├── favoriteMusic: string[]
│   ├── mood: MoodType             # Current mood
│   ├── moodIntensity: 1-5         # Intensity scale
│   ├── dailyLoveCount: number     # Love bites sent today
│   ├── lastLoveResetDate: YYYY-MM-DD
│   ├── createdAt: timestamp
│   ├── matchDate: ISO string      # When user got first match
│   └── anniversaryDate: ISO string # With current partner
```

---

### Feature 6: **Mood System**

**Path:** `/components/dashboard/MoodWindow.tsx` + `/services/firestore/moodService.ts`

#### Mood Types:
- **Love** (🎀 Rose): Deep connection, intimacy
- **Happy** (✨ Golden): Joy, positive energy
- **Sad** (💙 Blue): Vulnerable, need support
- **Angry** (❤️ Red): Friction, conflict
- **Calm** (🌿 Teal): Peace, stability

#### Mood Visualization:
```typescript
export const MOOD_COLORS = {
  love: { primary: '#E94B7F', secondary: '#D4A574', glow: 'rgba(233,75,127,0.5)' },
  happy: { primary: '#F0D547', secondary: '#FFD700', glow: 'rgba(240,213,71,0.5)' },
  sad: { primary: '#5B8DBE', secondary: '#8BA8D1', glow: 'rgba(91,141,190,0.4)' },
  angry: { primary: '#E63946', secondary: '#A4161A', glow: 'rgba(230,57,70,0.5)' },
  calm: { primary: '#6BA896', secondary: '#9DD4C5', glow: 'rgba(107,168,150,0.4)' }
};

// Animated canvas/SVG background for mood:
// - Shifting color gradients
// - Particle effects
// - Pulsing animations
// - Custom canvas drawing (React Native Skia / expo-gl)
```

#### Intensity Scale (1-5):
- Visual intensity bar
- Mood strength representation
- User adjusts slider

#### Implementation:
- Update on user action (tap to change)
- Real-time sync to partner via Firestore
- Add to emotions list (history tracking)
- Trigger animations on partner's device

---

### Feature 7: **Relationship Milestones**

**Path:** `/screens/relationship`

#### Features:
1. **Anniversary Tracker**
   - Set anniversary date
   - Countdown timer
   - Celebration features

2. **Relationship Timeline**
   - Match date
   - First message
   - Milestone events
   - Custom events

3. **Memories**
   - Shared photos
   - Shared videos
   - Important moments

#### Firestore Collection:
```
relationships/
├── {userId1}_{userId2}:  # alphabetically sorted
│   ├── participants: [userId1, userId2]
│   ├── matchDate: timestamp
│   ├── anniversaryDate: ISO string
│   ├── updatedAt: timestamp
│   └── collections:
│       └── milestones/
│           ├── {milestoneId}:
│           │   ├── type: 'anniversary' | 'firstMessage' | 'custom'
│           │   ├── date: timestamp
│           │   ├── title: string
│           │   └── description: string
```

---

## Technology Stack

### Core Framework
```json
{
  "react-native": "^0.73+",
  "react": "^18.2+",
  "typescript": "^5.3+",
  "expo": "^50+" // OR use React Native CLI if not using Expo
}
```

### Navigation
```json
{
  "@react-navigation/native": "^6.1+",
  "@react-navigation/native-stack": "^6.9+",
  "@react-navigation/bottom-tabs": "^6.5+",
  "react-native-safe-area-context": "^4.7+",
  "react-native-screens": "^3.27+"
}
```

### Backend & Authentication
```json
{
  "firebase": "^11.0+",
  "@react-native-google-signin/google-signin": "^13.0+",
  "@react-native-async-storage/async-storage": "^1.23+"
}
```

### UI & Styling
```json
{
  "react-native-paper": "^5.11+" // OR NativeBase "^3.8+"
  "nativewind": "^2.0+" // Tailwind CSS for React Native
  "react-native-svg": "^14.0+",
  "react-native-skia": "^1.0+" // Optional: advanced graphics
}
```

### Gestures & Animations
```json
{
  "react-native-gesture-handler": "^2.14+",
  "react-native-reanimated": "^3.6+",
  "react-native-pager-view": "^6.2+"
}
```

### Video & Media
```json
{
  "react-native-video": "^6.1+",
  "expo-av": "^13.10+" // OR react-native-video
  "react-native-image-picker": "^7.0+",
  "react-native-fs": "^2.20+"
}
```

### Charts & Visualization
```json
{
  "victory-native": "^36.0+",
  "react-native-svg": "^14.0+"
}
```

### Forms & Validation
```json
{
  "react-hook-form": "^7.48+",
  "zod": "^3.22+"
}
```

### State Management
```json
{
  "zustand": "^4.4+" // Recommended, lightweight
  // OR
  "redux": "^4.2+",
  "@reduxjs/toolkit": "^1.9+"
}
```

### Development Tools
```json
{
  "eslint": "^8.54+",
  "prettier": "^3.1+",
  "@types/react-native": "^0.73+",
  "jest": "^29.7+",
  "@testing-library/react-native": "^12.4+"
}
```

---

## Data Models & Firestore Schema

### Complete Firestore Structure

#### 1. Users Collection
```
users/ {uid}
├── displayName: string
├── email: string
├── photoURL?: string
├── bio?: string
├── age?: number
├── location?: string
├── height?: string
├── emotions: string[]              # e.g., ["love", "happy"]
├── favoriteMusic: string[]
├── interests: string[]
├── mood: MoodType                 # Current mood: love|happy|sad|angry|calm
├── moodIntensity: 1-5             # Mood strength
├── dailyLoveCount: number
├── lastLoveResetDate: "YYYY-MM-DD"
├── matchDate?: ISO string         # First match date
├── anniversaryDate?: ISO string   # Current partner anniversary
├── createdAt: timestamp
└── updatedAt: timestamp
```

#### 2. Likes Collection
```
likes/ {documentId}
├── userId: string                 # Who liked
├── likedUserId: string            # Who was liked
├── timestamp: timestamp
└── _metadata: { createdAt: ... }
```

#### 3. Relationships Collection
```
relationships/ {userId1}_{userId2}  # Sorted alphabetically
├── participants: [userId1, userId2]
├── matchDate: timestamp
├── anniversaryDate: ISO string
├── updatedAt: timestamp
├── dailyLoveCount?: number
├── lastLoveResetDate?: "YYYY-MM-DD"
└── milestones/ {subcollection}
    ├── type: "anniversary" | "firstMessage" | "custom"
    ├── date: timestamp
    ├── title: string
    └── description: string
```

#### 4. Conversations Collection
```
conversations/ {userId1}_{userId2}  # Sorted alphabetically
├── participants: [userId1, userId2]
├── createdAt: timestamp
├── updatedAt: timestamp
├── messages/ {subcollection}
│   ├── senderId: string
│   ├── content: string
│   ├── timestamp: timestamp
│   ├── read: boolean
│   └── attachments?: [{ type: "image"|"video", url: string }]
└── readBy: { [userId]: timestamp }  # Track who read
```

#### 5. LoveBites Collection
```
lovebiteslog/ {documentId}
├── fromId: string
├── toId: string
├── timestamp: timestamp
├── relationshipId: string
└── _metadata: { createdAt: ... }
```

### TypeScript Type Definitions

```typescript
// types/models.ts

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
  mood?: MoodType;
  moodIntensity?: number;  // 1-5
  dailyLoveCount?: number;
  lastLoveResetDate?: string;  // YYYY-MM-DD
  matchDate?: string;  // ISO string
  anniversaryDate?: string;  // ISO string
  createdAt: Date;
  updatedAt?: Date;
}

export interface Like {
  id: string;
  userId: string;
  likedUserId: string;
  timestamp: Date;
}

export interface Relationship {
  id: string;  // userId1_userId2
  participants: [string, string];
  matchDate: Date;
  anniversaryDate?: Date;
  updatedAt: Date;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  timestamp: Date;
  read: boolean;
  attachments?: Attachment[];
}

export interface Attachment {
  type: 'image' | 'video';
  url: string;
  size?: number;
  metadata?: Record<string, any>;
}

export interface Conversation {
  id: string;
  participants: [string, string];
  createdAt: Date;
  updatedAt: Date;
}

export interface LoveBite {
  id: string;
  fromId: string;
  toId: string;
  timestamp: Date;
  relationshipId: string;
}

export interface MatchScore {
  userId: string;
  score: number;  // 0-100
  commonEmotions: string[];
  commonInterests: string[];
  matchReason: string;
}
```

---

## Authentication System

### Flow Diagram

```
┌─────────────────┐
│  Landing Screen │
│  (No Auth)      │
└────────┬────────┘
         │
         ├─> Sign In with Google
         │
         ▼
┌───────────────────────────┐
│ Firebase Auth + Google    │
│ Returns: User object      │
└────────┬────────────────────┘
         │
         ├─> Check if user exists in Firestore
         │
         ├─> NO: Create profile doc + redirect to EditProfile
         │
         ├─> YES: Check profile completeness
         │   ├─> Incomplete: Go to EditProfile
         │   │
         │   └─> Complete: Go to Home
         │
         └─> Store auth token in secure storage
```

### Implementation Services

#### 1. Auth Service
```typescript
// services/auth/authService.ts

export class AuthService {
  async signInWithGoogle() {
    // @react-native-google-signin/google-signin flow
    // Returns Firebase User object
  }

  async logout() {
    // Sign out from Firebase
    // Clear secure storage
  }

  async reauthenticate() {
    // Handle token refresh
  }

  async deleteAccount() {
    // Delete user & all associated data
  }
}
```

#### 2. Google Sign-In Setup
```typescript
// config/firebase.ts

import GoogleSignin from '@react-native-google-signin/google-signin';

GoogleSignin.configure({
  webClientId: 'YOUR_WEB_CLIENT_ID.apps.googleusercontent.com',
  iosClientId: 'YOUR_IOS_CLIENT_ID.apps.googleusercontent.com',
  offlineAccess: true,
});

// Integrate with Firebase
const authResponse = await GoogleSignin.signIn();
const { idToken } = authResponse;
const googleCredential = auth.GoogleAuthProvider.credential(idToken);
await auth().signInWithCredential(googleCredential);
```

#### 3. Secure Token Storage
```typescript
// utils/secureStorage.ts

import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store'; // or react-native-secure-randombytes

export async function saveAuthToken(token: string) {
  try {
    await SecureStore.setItemAsync('authToken', token);
  } catch (error) {
    console.error('Failed to save auth token', error);
  }
}

export async function getAuthToken(): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync('authToken');
  } catch (error) {
    return null;
  }
}
```

### Context Implementation

```typescript
// context/AuthContext.tsx

interface AuthContextType {
  user: User | null;
  loading: boolean;
  userProfile: UserProfile | null;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth().onAuthStateChanged(async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        const profile = await getUserProfile(currentUser.uid);
        setUserProfile(profile);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  // ... implementation
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
```

---

## Component Architecture

### Hierarchy Overview

```
App
├── AuthProvider
│   ├── Navigation Stack
│   │   ├── Auth Stack (if !user)
│   │   │   ├── LandingScreen
│   │   │   └── LoginScreen (if needed)
│   │   │
│   │   └── Main Stack (if user && profile complete)
│   │       ├── BottomTabNavigator
│   │       │   ├── HomeStack
│   │       │   │   ├── HomeDashboardScreen
│   │       │   │   └── MoodUpdateModal
│   │       │   │
│   │       │   ├── DiscoveryStack
│   │       │   │   ├── DiscoverScreen
│   │       │   │   └── ProfileDetailsScreen (modal)
│   │       │   │
│   │       │   ├── MatchesStack
│   │       │   │   └── MatchesListScreen
│   │       │   │
│   │       │   ├── MessagesStack
│   │       │   │   ├── MessagesListScreen
│   │       │   │   └── ChatScreen
│   │       │   │
│   │       │   └── ProfileStack
│   │       │       ├── ProfileScreen
│   │       │       ├── EditProfileScreen
│   │       │       └── SettingsScreen
│   │       │
│   │       └── Modal Stacks (overlays)
│   │           ├── MoodModal
│   │           └── VideoGalleryModal
│   │
│   └── Non-Modal Stacks
│       └── AuthProfileStack
│           └── EditProfileScreen
```

### Key Screen Components

#### 1. LandingScreen
```typescript
interface LandingScreenProps {
  navigation: NativeStackNavigationProp<...>;
}

// Components:
// - Animated background (hero parallax)
// - Logo & tagline
// - Value propositions (3-4 cards)
// - Google Sign-In button
// - Privacy/Terms buttons
// - Loading state
```

#### 2. HomeDashboardScreen
```typescript
interface HomeDashboardScreenProps {
  navigation: BottomTabNavigationProp<...>;
  route: RouteProp<...>;
}

// Sub-components:
// <PartnerCard />
// <MoodWindow />
// <HeartbeatGraph />
// <ViewModeToggle /> (Graph/Video/Game)
// <ActionButtons /> (LoveBite, Message, Mood)
// <LoveBiteOverlay />
// <VideoPlayer />
```

#### 3. DiscoverScreen
```typescript
interface DiscoverScreenProps {
  navigation: NativeStackNavigationProp<...>;
}

// Sub-components:
// <SwipableCardStack />
// <ProfileCard />
// <LikeButton /> / <PassButton />
// <CompatibilityScore />
// <NoMoreCards />
```

#### 4. ChatScreen
```typescript
interface ChatScreenProps {
  route: RouteProp<RootParamList, 'Chat'>;  // { partnerId }
  navigation: NativeStackNavigationProp<...>;
}

// Sub-components:
// <MessageList /> (FlatList)
// <MessageBubble /> (from/to)
// <InputBox /> (TextInput + Send button)
// <TypingIndicator />
// <ImageAttachmentPreview />
```

---

## State Management

### Recommended: Zustand (Lightweight)

```typescript
// store/authStore.ts
import { create } from 'zustand';

interface AuthStore {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  setUser: (user: User | null) => void;
  setUserProfile: (profile: UserProfile | null) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  userProfile: null,
  loading: true,
  setUser: (user) => set({ user }),
  setUserProfile: (profile) => set({ userProfile: profile }),
  logout: () => set({ user: null, userProfile: null }),
}));

// store/relationshipStore.ts
interface RelationshipStore {
  currentRelationship: Relationship | null;
  partnerProfile: UserProfile | null;
  partnerMood: { mood: MoodType; intensity: number } | null;
  partnerBpm: number;
  setCurrentRelationship: (rel: Relationship) => void;
  updatePartnerMood: (mood: MoodType, intensity: number) => void;
  updatePartnerBpm: (bpm: number) => void;
}

export const useRelationshipStore = create<RelationshipStore>((set) => ({
  // ... implementation
}));

// store/discoveryStore.ts
interface DiscoveryStore {
  users: UserProfile[];
  currentIndex: number;
  matchScores: Map<string, MatchScore>;
  setUsers: (users: UserProfile[]) => void;
  nextCard: () => void;
  resetStack: () => void;
}

export const useDiscoveryStore = create<DiscoveryStore>((set) => ({
  // ... implementation
}));
```

### Alternative: Redux Toolkit

```typescript
// For more complex state, use Redux:

import { createSlice, configureStore, PayloadAction } from '@reduxjs/toolkit';

const authSlice = createSlice({
  name: 'auth',
  initialState: { user: null, loading: true },
  reducers: {
    setUser: (state, action: PayloadAction<User | null>) => {
      state.user = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
  },
});

export const store = configureStore({
  reducer: {
    auth: authSlice.reducer,
    relationship: relationshipSlice.reducer,
    discovery: discoverySlice.reducer,
    messages: messagesSlice.reducer,
  },
});
```

### Context API (Current Web App Approach)

Keep the same pattern from web, but optimize for React Native:

```typescript
// context/UserContext.tsx
interface UserContextValue {
  currentUser: UserProfile | null;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  setMood: (mood: MoodType, intensity: number) => Promise<void>;
}

const UserContext = createContext<UserContextValue | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);

  // Memoize to prevent unnecessary re-renders
  const value = useMemo(() => ({
    currentUser,
    updateProfile,
    setMood,
  }), [currentUser]);

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
}
```

---

## Database & Backend Integration

### Firebase Setup

```typescript
// config/firebase.ts

import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Optimize Firestore
getFirestore().settings({
  ignoreUndefinedProperties: true,
  cacheSizeBytes: 40e6, // 40MB for offline persistence
});
```

### Core Service Implementations

#### 1. User Service
```typescript
// services/firestore/userService.ts

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  try {
    const docRef = doc(db, 'users', uid);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? (docSnap.data() as UserProfile) : null;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
}

export async function updateUserProfile(
  uid: string,
  updates: Partial<UserProfile>
): Promise<void> {
  try {
    await setDoc(doc(db, 'users', uid), updates, { merge: true });
  } catch (error) {
    console.error('Error updating profile:', error);
    throw error;
  }
}

export async function uploadProfileImage(
  uid: string,
  imageUri: string
): Promise<string> {
  try {
    const filename = `${uid}_${Date.now()}.jpg`;
    const imageRef = ref(storage, `profiles/${uid}/${filename}`);
    const blob = await uriToBlob(imageUri);
    const snapshot = await uploadBytes(imageRef, blob);
    const downloadUrl = await getDownloadURL(snapshot.ref);
    await updateUserProfile(uid, { photoURL: downloadUrl });
    return downloadUrl;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
}

export function subscribeToUserProfile(
  uid: string,
  callback: (profile: UserProfile | null) => void
): () => void {
  const unsubscribe = onSnapshot(
    doc(db, 'users', uid),
    (doc) => {
      callback(doc.exists() ? (doc.data() as UserProfile) : null);
    },
    (error) => {
      console.error('Error subscribing to user profile:', error);
      callback(null);
    }
  );
  return unsubscribe;
}
```

#### 2. Mood Service
```typescript
// services/firestore/moodService.ts

export async function updateUserMood(
  uid: string,
  mood: MoodType,
  intensity: number
): Promise<void> {
  try {
    const userRef = doc(db, 'users', uid);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) throw new Error('User not found');
    
    const currentEmotions = userDoc.data().emotions || [];
    const updatedEmotions = [mood, ...currentEmotions].slice(0, 10);
    
    await updateDoc(userRef, {
      mood,
      moodIntensity: intensity,
      emotions: updatedEmotions,
    });
  } catch (error) {
    console.error('Error updating mood:', error);
    throw error;
  }
}

export function subscribeToUserMood(
  uid: string,
  callback: (mood: { mood: MoodType; intensity: number } | null) => void
): () => void {
  const unsubscribe = onSnapshot(
    doc(db, 'users', uid),
    (doc) => {
      if (doc.exists()) {
        const { mood, moodIntensity } = doc.data();
        callback(mood && moodIntensity ? { mood, intensity: moodIntensity } : null);
      }
    },
    (error) => {
      console.error('Error subscribing to mood:', error);
      callback(null);
    }
  );
  return unsubscribe;
}
```

#### 3. Matching Service
```typescript
// services/firestore/matchingService.ts

export async function likeUser(userId: string, likedUserId: string): Promise<void> {
  try {
    await addDoc(collection(db, 'likes'), {
      userId,
      likedUserId,
      timestamp: serverTimestamp(),
    });

    // Check for mutual like
    const isMutual = await checkMutualLike(userId, likedUserId);
    if (isMutual) {
      const relId = [userId, likedUserId].sort().join('_');
      await setDoc(doc(db, 'relationships', relId), {
        participants: [userId, likedUserId],
        matchDate: new Date().toISOString(),
        updatedAt: serverTimestamp(),
      }, { merge: true });
    }
  } catch (error) {
    console.error('Error liking user:', error);
    throw error;
  }
}

export async function checkMutualLike(
  userId: string,
  likedUserId: string
): Promise<boolean> {
  try {
    const q = query(
      collection(db, 'likes'),
      where('userId', '==', likedUserId),
      where('likedUserId', '==', userId)
    );
    const snapshot = await getDocs(q);
    return !snapshot.empty;
  } catch (error) {
    console.error('Error checking mutual like:', error);
    return false;
  }
}

export async function getUserMatches(uid: string): Promise<UserProfile[]> {
  try {
    const likesRef = collection(db, 'likes');
    
    // Get users current user liked
    const userLikesQ = query(likesRef, where('userId', '==', uid));
    const userLikesSnap = await getDocs(userLikesQ);
    const userLikedIds = userLikesSnap.docs.map(doc => doc.data().likedUserId);
    
    // Get users who liked current user
    const whoLikedQ = query(likesRef, where('likedUserId', '==', uid));
    const whoLikedSnap = await getDocs(whoLikedQ);
    const whoLikedIds = whoLikedSnap.docs.map(doc => doc.data().userId);
    
    // Find mutual likes
    const matchIds = userLikedIds.filter(id => whoLikedIds.includes(id));
    
    const matches = await Promise.all(
      matchIds.map(id => getUserProfile(id))
    );
    
    return matches.filter(Boolean) as UserProfile[];
  } catch (error) {
    console.error('Error fetching matches:', error);
    return [];
  }
}
```

#### 4. Messaging Service
```typescript
// services/firestore/messagingService.ts

export async function sendMessage(
  senderId: string,
  recipientId: string,
  content: string
): Promise<void> {
  try {
    const conversationId = [senderId, recipientId].sort().join('_');
    const messagesRef = collection(db, 'conversations', conversationId, 'messages');
    
    await addDoc(messagesRef, {
      senderId,
      content,
      timestamp: serverTimestamp(),
      read: false,
    });
    
    // Update conversation metadata
    await setDoc(
      doc(db, 'conversations', conversationId),
      {
        participants: [senderId, recipientId],
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
}

export function subscribeToConversation(
  conversationId: string,
  callback: (messages: Message[]) => void
): () => void {
  const messagesRef = collection(
    db,
    'conversations',
    conversationId,
    'messages'
  );
  const q = query(messagesRef, orderBy('timestamp', 'desc'), limit(50));
  
  const unsubscribe = onSnapshot(
    q,
    (snapshot) => {
      const messages = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as Message[];
      callback(messages.reverse());
    },
    (error) => {
      console.error('Error subscribing to conversation:', error);
      callback([]);
    }
  );
  
  return unsubscribe;
}

export async function markMessageAsRead(
  conversationId: string,
  messageId: string
): Promise<void> {
  try {
    const messageRef = doc(
      db,
      'conversations',
      conversationId,
      'messages',
      messageId
    );
    await updateDoc(messageRef, { read: true });
  } catch (error) {
    console.error('Error marking message as read:', error);
  }
}
```

#### 5. Relationship Service
```typescript
// services/firestore/relationshipService.ts

export async function getRelationship(
  userId: string,
  partnerId: string
): Promise<Relationship | null> {
  try {
    const relId = [userId, partnerId].sort().join('_');
    const docRef = doc(db, 'relationships', relId);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? (docSnap.data() as Relationship) : null;
  } catch (error) {
    console.error('Error fetching relationship:', error);
    return null;
  }
}

export function subscribeToRelationship(
  relId: string,
  callback: (rel: Relationship | null) => void
): () => void {
  const unsubscribe = onSnapshot(
    doc(db, 'relationships', relId),
    (doc) => {
      callback(doc.exists() ? (doc.data() as Relationship) : null);
    },
    (error) => {
      console.error('Error subscribing to relationship:', error);
      callback(null);
    }
  );
  return unsubscribe;
}

export async function setAnniversaryDate(
  relId: string,
  anniversaryDate: Date
): Promise<void> {
  try {
    await updateDoc(doc(db, 'relationships', relId), {
      anniversaryDate: anniversaryDate.toISOString(),
    });
  } catch (error) {
    console.error('Error setting anniversary:', error);
    throw error;
  }
}
```

---

## UI/UX Implementation

### Design System

#### Color Palette
```typescript
// utils/colors.ts

export const Colors = {
  // Mood colors (from web version)
  mood: {
    love: { primary: '#E94B7F', secondary: '#D4A574', glow: 'rgba(233,75,127,0.5)' },
    happy: { primary: '#F0D547', secondary: '#FFD700', glow: 'rgba(240,213,71,0.5)' },
    sad: { primary: '#5B8DBE', secondary: '#8BA8D1', glow: 'rgba(91,141,190,0.4)' },
    angry: { primary: '#E63946', secondary: '#A4161A', glow: 'rgba(230,57,70,0.5)' },
    calm: { primary: '#6BA896', secondary: '#9DD4C5', glow: 'rgba(107,168,150,0.4)' },
  },
  
  // Semantic colors
  primary: '#6366F1', // Indigo
  secondary: '#EC4899', // Pink
  background: '#0F172A', // Dark slate
  surface: '#1E293B', // Lighter slate
  text: {
    primary: '#F1F5F9', // Light
    secondary: '#CBD5E1', // Medium
    tertiary: '#94A3B8', // Dark
  },
  border: '#334155',
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
};

// Mood colors consistent with web
export const MOOD_COLORS: Record<MoodType, MoodColorSet> = { /* ... */ };
```

#### Typography
```typescript
// styles/typography.ts

export const Typography = {
  heading1: {
    fontSize: 32,
    fontWeight: '700',
    lineHeight: 40,
  },
  heading2: {
    fontSize: 28,
    fontWeight: '600',
    lineHeight: 36,
  },
  heading3: {
    fontSize: 24,
    fontWeight: '600',
    lineHeight: 32,
  },
  body: {
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 24,
  },
  caption: {
    fontSize: 12,
    fontWeight: '400',
    lineHeight: 18,
  },
};
```

#### Spacing
```typescript
// styles/spacing.ts

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
};
```

### Component Library

#### 1. Base UI Components to Build

```typescript
// components/ui/Button.tsx
interface ButtonProps extends TouchableOpacityProps {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  children: React.ReactNode;
}

export function Button({ variant = 'primary', size = 'md', ...props }: ButtonProps) {
  // Implementation with styling
}

// components/ui/Card.tsx
interface CardProps extends ViewProps {
  children: React.ReactNode;
  variant?: 'default' | 'elevated';
}

export function Card({ variant = 'default', ...props }: CardProps) {
  // Implementation
}

// components/ui/Input.tsx
interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export function Input({ label, error, ...props }: InputProps) {
  // Implementation
}

// components/ui/Avatar.tsx
interface AvatarProps {
  uri?: string;
  size?: 'sm' | 'md' | 'lg';
  fallback?: string;
  onlineStatus?: boolean;
}

export function Avatar({ uri, size = 'md', ...props }: AvatarProps) {
  // Implementation
}

// components/ui/Badge.tsx
interface BadgeProps {
  label: string;
  variant?: 'primary' | 'secondary' | 'success' | 'error';
  icon?: React.ReactNode;
}

export function Badge({ label, variant = 'primary' }: BadgeProps) {
  // Implementation
}
```

#### 2. Custom Components

```typescript
// components/dashboard/HeartbeatGraph.tsx
// Uses data for line chart visualization

// components/dashboard/MoodWindow.tsx
// Animated mood display with canvas/SVG

// components/dashboard/PartnerCard.tsx
// Partner info display with progress bars

// components/discovery/ProfileCard.tsx
// Swipable card with profile info

// components/discovery/CompatibilityBadge.tsx
// Shows match percentage

// components/messages/MessageBubble.tsx
// Individual message display

// components/messages/InputBox.tsx
// Text input with send button
```

### Navigation Architecture

```typescript
// types/navigation.ts

export type RootStackParamList = {
  // Auth flow
  Landing: undefined;
  
  // Main app flow
  MainTabs: undefined;
  
  // Modals
  MoodSelector: undefined;
  VideoGallery: undefined;
};

export type MainTabsParamList = {
  Home: undefined;
  Discovery: undefined;
  Matches: undefined;
  Messages: undefined;
  Profile: undefined;
};

export type HomeStackParamList = {
  HomeDashboard: undefined;
  PartnerProfile: { partnerId: string };
};

export type DiscoveryStackParamList = {
  Discover: undefined;
  ProfileDetails: { userId: string };
};

// ... Additional stack types

// Navigation setup
function RootNavigator() {
  const { user, loading } = useAuth();
  
  if (loading) return <LoadingScreen />;
  
  return (
    <NavigationContainer>
      <RootStack.Navigator
        screenOptions={{ headerShown: false, animationEnabled: true }}
      >
        {!user ? (
          <RootStack.Group screenOptions={{ animationEnabled: false }}>
            <RootStack.Screen name="Landing" component={LandingScreen} />
          </RootStack.Group>
        ) : (
          <RootStack.Group>
            <RootStack.Screen name="MainTabs" component={MainTabsNavigator} />
            <RootStack.Group screenOptions={{ presentation: 'modal' }}>
              <RootStack.Screen name="MoodSelector" component={MoodSelectorModal} />
              <RootStack.Screen name="VideoGallery" component={VideoGalleryModal} />
            </RootStack.Group>
          </RootStack.Group>
        )}
      </RootStack.Navigator>
    </NavigationContainer>
  );
}

function MainTabsNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: true,
        tabBarPosition: 'bottom',
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeStackNavigator}
        options={{
          tabBarIcon: ({ color, size }) => <Home color={color} size={size} />,
        }}
      />
      {/* ... other tabs */}
    </Tab.Navigator>
  );
}
```

---

## Key Features Deep Dive

### Feature: Real-Time Mood Synchronization

**User Journey:**
1. User opens app → HOME screen shows partner
2. User taps mood selector button
3. Mood selector modal opens (5 mood options)
4. User selects mood + intensity slider
5. Mood updates in Firestore
6. Partner's device subscribed to same relationship doc receives update
7. Partner's screen updates with animation

**Implementation:**

```typescript
// hooks/useMood.ts

export function useMood(userId: string, relationshipId?: string) {
  const moodStore = useRelationshipStore();
  
  useEffect(() => {
    let unsubscribe = () => {};
    
    if (relationshipId) {
      // Subscribe to relationship mood changes
      unsubscribe = subscribeToRelationship(relationshipId, (rel) => {
        // Extract mood data
      });
    }
    
    return unsubscribe;
  }, [relationshipId]);
  
  const setMood = async (mood: MoodType, intensity: number) => {
    try {
      await updateUserMood(userId, mood, intensity);
      // Store will auto-update via Firestore listener
    } catch (error) {
      console.error('Failed to update mood', error);
      throw error;
    }
  };
  
  return { setMood, currentMood: moodStore.mood };
}
```

### Feature: Love Bite Gesture

**Trigger:**
- Partner sends "Love Bite"
- Animated hearts shower on user's screen
- Haptic feedback (vibration)
- Sound effect plays
- Toast notification

**Implementation:**

```typescript
// components/dashboard/LoveBiteOverlay.tsx

interface LoveBiteOverlayProps {
  isActive: boolean;
  onComplete?: () => void;
}

export function LoveBiteOverlay({ isActive, onComplete }: LoveBiteOverlayProps) {
  const animatedValues = useRef(
    Array(10).fill(0).map(() => new Animated.Value(0))
  ).current;
  
  useEffect(() => {
    if (isActive) {
      // Trigger haptic + sound
      triggerHaptic('Heavy');
      playLoveBiteSound();
      
      // Start animations
      animatedValues.forEach((value, index) => {
        Animated.sequence([
          Animated.delay(index * 50),
          Animated.timing(value, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: true,
          }),
        ]).start();
      });
      
      // Clean up after duration
      setTimeout(() => {
        onComplete?.();
        animatedValues.forEach(v => v.setValue(0));
      }, 2500);
    }
  }, [isActive]);
  
  return (
    <Animated.View style={[styles.overlay]}>
      {animatedValues.map((value, index) => (
        <Animated.View
          key={index}
          style={[
            styles.heart,
            {
              opacity: value.interpolate({
                inputRange: [0, 0.8, 1],
                outputRange: [0, 1, 0],
              }),
              transform: [
                {
                  translateY: value.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, -400],
                  }),
                },
              ],
            },
          ]}
        >
          <Heart size={32} color="#E94B7F" fill="#E94B7F" />
        </Animated.View>
      ))}
    </Animated.View>
  );
}
```

### Feature: Swipable Discovery Cards

**Tech Stack:**
- `react-native-gesture-handler` for gesture detection
- `react-native-reanimated` for smooth animations
- Custom card stack component

**Implementation:**

```typescript
// components/discovery/SwipableCardStack.tsx

interface SwipableCardStackProps {
  cards: UserProfile[];
  onLike: (userId: string) => void;
  onPass: (userId: string) => void;
  onEmpty: () => void;
}

export function SwipableCardStack({
  cards,
  onLike,
  onPass,
  onEmpty,
}: SwipableCardStackProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [deck, setDeck] = useState(cards);
  
  const currentCard = deck[currentIndex];
  
  if (currentIndex >= deck.length) {
    return <EmptyState onRefresh={onEmpty} />;
  }
  
  const handleSwipe = async (direction: 'left' | 'right') => {
    if (!currentCard) return;
    
    if (direction === 'right') {
      onLike(currentCard.uid);
    } else {
      onPass(currentCard.uid);
    }
    
    // Move to next card
    setCurrentIndex(currentIndex + 1);
    
    // Haptic feedback
    triggerHaptic('Selection');
  };
  
  return (
    <View style={styles.container}>
      <PanGestureHandler
        onGestureEvent={(e) => {
          if (e.nativeEvent.x > width / 2) {
            // Right swipe (like)
          } else {
            // Left swipe (pass)
          }
        }}
      >
        <Animated.View style={[styles.card]}>
          <ProfileCard
            user={currentCard}
            onSwipeLeft={() => handleSwipe('left')}
            onSwipeRight={() => handleSwipe('right')}
          />
        </Animated.View>
      </PanGestureHandler>
      
      <View style={styles.buttons}>
        <Button size="lg" variant="ghost" onPress={() => handleSwipe('left')}>
          <X size={24} />
        </Button>
        <Button size="lg" onPress={() => handleSwipe('right')}>
          <Heart size={24} fill="currentColor" />
        </Button>
      </View>
    </View>
  );
}
```

### Feature: Real-Time Messaging

**Architecture:**
```
ChatScreen
├─ useEffect: Subscribe to messages in conversation
├─ useEffect: Listen to typing indicator
├─ FlatList: Render messages
│   ├─ onViewableItemsChanged: Mark as read
│   └─ renderItem: MessageBubble
└─ InputBox: Send message
```

**Implementation:**

```typescript
// hooks/useMessages.ts

export function useMessages(conversationId: string, currentUserId: string) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const messageListRef = useRef<FlatList>(null);
  
  // Subscribe to messages
  useEffect(() => {
    setLoading(true);
    const unsubscribe = subscribeToConversation(conversationId, (msgs) => {
      setMessages(msgs);
      setLoading(false);
      // Scroll to bottom
      setTimeout(() => {
        messageListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    });
    
    return unsubscribe;
  }, [conversationId]);
  
  // Mark messages as read when viewed
  const markAsRead = useCallback((messageId: string) => {
    const message = messages.find(m => m.id === messageId);
    if (message && !message.read && message.senderId !== currentUserId) {
      markMessageAsRead(conversationId, messageId);
    }
  }, [messages, currentUserId, conversationId]);
  
  const sendMessage = useCallback(async (content: string) => {
    try {
      await sendMessageToFirestore(currentUserId, conversationId, content);
    } catch (error) {
      console.error('Failed to send message:', error);
      throw error;
    }
  }, [currentUserId, conversationId]);
  
  return { messages, loading, sendMessage, markAsRead, messageListRef };
}

// screens/messages/ChatScreen.tsx

export function ChatScreen({ route }: ChatScreenProps) {
  const { partnerId } = route.params;
  const { user } = useAuth();
  const conversationId = [user!.uid, partnerId].sort().join('_');
  
  const { messages, sendMessage, markAsRead, messageListRef } = useMessages(
    conversationId,
    user!.uid
  );
  
  const handleSendMessage = async (text: string) => {
    await sendMessage(text);
  };
  
  return (
    <View style={styles.container}>
      <FlatList
        ref={messageListRef}
        data={messages}
        keyExtractor={m => m.id}
        renderItem={({ item, index }) => (
          <MessageBubble
            message={item}
            isCurrentUser={item.senderId === user!.uid}
            onViewableItemsChanged={() => markAsRead(item.id)}
          />
        )}
        onViewableItemsChanged={({ viewableItems }) => {
          viewableItems.forEach(item => {
            if (item.isViewable) {
              markAsRead(messages[item.index!].id);
            }
          });
        }}
      />
      
      <InputBox onSend={handleSendMessage} />
    </View>
  );
}
```

---

## Performance Optimizations

### 1. **Memory Management**

```typescript
// Implement caching strategies
class FirestoreCache {
  private cache = new Map<string, CacheEntry>();
  private TTL = 5 * 60 * 1000; // 5 minutes
  
  set(key: string, value: any) {
    this.cache.set(key, { value, timestamp: Date.now() });
  }
  
  get(key: string) {
    const entry = this.cache.get(key);
    if (!entry) return null;
    if (Date.now() - entry.timestamp > this.TTL) {
      this.cache.delete(key);
      return null;
    }
    return entry.value;
  }
}

// Use in services
const cache = new FirestoreCache();

export async function getUserProfile(uid: string) {
  const cached = cache.get(`user_${uid}`);
  if (cached) return cached;
  
  const profile = await fetchFromFirestore(uid);
  cache.set(`user_${uid}`, profile);
  return profile;
}
```

### 2. **Network Optimization**

```typescript
// Batch Firestore writes
export async function batchUpdateProfiles(updates: Array<[string, Partial<UserProfile>]>) {
  const batch = writeBatch(db);
  
  updates.forEach(([uid, data]) => {
    batch.update(doc(db, 'users', uid), data);
  });
  
  await batch.commit();
}

// Implement offline persistence
getFirestore().enablePersistence().catch((err) => {
  if (err.code == 'failed-precondition') {
    console.log('Multiple tabs open');
  } else if (err.code == 'unimplemented') {
    console.log('Persistence not available');
  }
});
```

### 3. **Component Performance**

```typescript
// Use React.memo for list items
const MessageBubble = React.memo(
  ({ message, isCurrentUser }: Props) => {
    return (
      // Component JSX
    );
  },
  (prevProps, nextProps) => {
    // Custom comparison
    return prevProps.message.id === nextProps.message.id;
  }
);

// Memoize expensive calculations
const compatibilityScore = useMemo(() => {
  return calculateCompatibility(user1, user2);
}, [user1.id, user2.id]);

// Debounce search
const [searchQuery, setSearchQuery] = useState('');
const debouncedSearch = useCallback(
  debounce((query: string) => {
    performSearch(query);
  }, 500),
  []
);
```

### 4. **Image Optimization**

```typescript
// Resize and compress images before upload
export async function optimizeImage(imageUri: string): Promise<string> {
  const resized = await ImageResizer.createResizedImage(
    imageUri,
    1200,
    1200,
    'JPEG',
    80
  );
  return resized.uri;
}

// Use lazy loading for images
<Image
  source={{ uri: imageUrl }}
  placeholder={require('./placeholder.jpg')}
  PlaceholderContent={<ActivityIndicator />}
/>
```

### 5. **Animation Performance**

```typescript
// Use native driver for animations
Animated.timing(value, {
  toValue: 1,
  duration: 300,
  useNativeDriver: true, // GPU accelerated
}).start();

// Limit simultaneous animations
const animatedValues = useRef(
  Array(10).fill(0).map(() => new Animated.Value(0)) // Not 100+
).current;
```

---

## Platform-Specific Considerations

### iOS-Specific

```typescript
// ios/Podfile (add to your project)
target 'Echo' do
  # Required for Firebase
  post_install do |installer|
    installer.pods_project.targets.each do |target|
      flutter_additional_ios_build_settings(target)
    end
  end
end

// Handle iOS-specific permissions
import { check, request, PERMISSIONS, RESULTS } from 'react-native-permissions';

export async function requestCameraPermission() {
  const result = await request(PERMISSIONS.IOS.CAMERA);
  return result === RESULTS.GRANTED;
}

// Safe area handling
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export function MyComponent() {
  const insets = useSafeAreaInsets();
  
  return (
    <View style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}>
      {/* Content */}
    </View>
  );
}
```

### Android-Specific

```typescript
// android/build.gradle
android {
  compileSdkVersion 34
  minSdkVersion 21
  targetSdkVersion 34
}

// Handle Android back button
import { useFocusEffect } from '@react-navigation/native';
import { BackHandler } from 'react-native';

export function MyScreen() {
  useFocusEffect(
    useCallback(() => {
      const backHandler = BackHandler.addEventListener(
        'hardwareBackPress',
        () => {
          // Handle back press
          return true; // Prevent default behavior
        }
      );
      
      return () => backHandler.remove();
    }, [])
  );
}

// Permissions (Android 12+)
import { request, PERMISSIONS } from 'react-native-permissions';

export async function requestPhotoAccess() {
  const result = await request(PERMISSIONS.ANDROID.READ_MEDIA_IMAGES);
  return result === RESULTS.GRANTED;
}
```

### Responsive Design

```typescript
// utils/dimensions.ts

export function useResponsive() {
  const windowWidth = useWindowDimensions().width;
  const windowHeight = useWindowDimensions().height;
  const isTablet = windowWidth > 768;
  const isSmall = windowWidth < 375;
  
  return { windowWidth, windowHeight, isTablet, isSmall };
}

// Usage in components
export function MyComponent() {
  const { isTablet } = useResponsive();
  
  return (
    <View
      style={{
        flexDirection: isTablet ? 'row' : 'column',
        paddingHorizontal: isTablet ? 32 : 16,
      }}
    >
      {/* Content */}
    </View>
  );
}
```

---

## Testing Strategy

### Unit Tests

```typescript
// __tests__/unit/matching.test.ts

describe('Matching Algorithm', () => {
  it('should calculate high compatibility for users with common interests', () => {
    const user1: UserProfile = {
      uid: '1',
      interests: ['music', 'hiking', 'cooking'],
      emotions: ['happy', 'calm'],
      age: 25,
      location: 'NYC',
      email: 'user1@test.com',
      displayName: 'User 1',
      favoriteMusic: [],
      createdAt: new Date(),
    };
    
    const user2: UserProfile = {
      uid: '2',
      interests: ['music', 'hiking', 'gaming'],
      emotions: ['happy', 'love'],
      age: 26,
      location: 'NYC',
      email: 'user2@test.com',
      displayName: 'User 2',
      favoriteMusic: [],
      createdAt: new Date(),
    };
    
    const score = calculateCompatibility(user1, user2);
    
    expect(score.score).toBeGreaterThan(70);
    expect(score.commonInterests).toContain('music');
  });
});
```

### Integration Tests

```typescript
// __tests__/integration/auth.test.ts

describe('Authentication Flow', () => {
  it('should create user profile after Google sign-in', async () => {
    // Mock Google Sign-In
    const user = await signInWithGoogle();
    
    expect(user).toBeDefined();
    
    // Check if profile created in Firestore
    const profile = await getUserProfile(user.uid);
    expect(profile).toBeDefined();
    expect(profile?.uid).toBe(user.uid);
  });
});
```

### E2E Tests (Detox)

```typescript
// __tests__/e2e/discovery.e2e.ts

describe('Discovery Flow', () => {
  beforeAll(async () => {
    await device.launchApp();
  });
  
  beforeEach(async () => {
    await device.reloadReactNative();
  });
  
  it('should swipe card to like user', async () => {
    // Sign in
    await element(by.id('SignInButton')).multiTap();
    
    // Navigate to discovery
    await element(by.id('DiscoveryTab')).tap();
    
    // Swipe right on first card
    await element(by.id('ProfileCard')).multiSwipe(
      { direction: 'right', speed: 'fast' },
      { x: 200, y: 300 }
    );
    
    // Verify like notification
    await expect(element(by.text('Love sent!'))).toBeVisible();
  });
});
```

---

## Deployment & Release

### Build Configuration

#### iOS Build
```bash
# Build for iOS
cd ios && xcodebuild -scheme Echo -configuration Release

# Or using Expo
eas build --platform ios --auto-submit
```

#### Android Build
```bash
# Build APK
./gradlew assembleRelease

# Build AAB (for Google Play)
./gradlew bundleRelease

# Or using Expo
eas build --platform android
```

### App Store Submission

1. **iOS App Store:**
   - Configure signing certificates
   - Set app icon (1024x1024) & screenshots
   - Add privacy policy & terms
   - Submit for review (~48 hours)

2. **Google Play Store:**
   - Generate signed APK/AAB
   - Create app listing
   - Add screenshots (multiple sizes)
   - Set content rating
   - Submit (review ~24 hours)

### Release Checklist

- [ ] Version bumped (major.minor.patch)
- [ ] All tests passing
- [ ] Performance benchmarks met
- [ ] Privacy policy updated
- [ ] Terms of service updated
- [ ] App icons & splash screens finaliz ed
- [ ] Firebase project configured
- [ ] Signing certificates valid
- [ ] Beta testing completed
- [ ] Release notes prepared

---

## Improvement Opportunities

### 1. **Enhanced Features to Add**

#### Video Call Integration
- Add real-time video calling (WebRTC via Agora/Twilio)
- Screen sharing capability
- Automatic mood detection from video feed

#### AI-Powered Features
- Mood analysis from chat patterns (NLP)
- Personalized date suggestions
- Advanced compatibility scoring

#### Gamification
- Achievements/badges system
- Streaks (daily connection streaks)
- Leaderboards for couples
- Mini-games for couples

#### AR Features
- AR filters based on user moods
- Virtual date experiences
- Augmented reality photo frames

### 2. **Backend Improvements**

#### Scalability
- Migrate to Cloud Functions for complex logic
- Implement Cloud Tasks for background jobs
- Use Firestore Datastore for advanced querying
- Add caching layer (Redis)

#### Data Analysis
- User engagement analytics
- Feature usage metrics
- Churn prediction
- Mood trend analysis

#### Safety & Moderation
- Content moderation (automated + manual)
- Reporting system for inappropriate content
- Block/mute functionality
- Privacy enforcement

### 3. **Performance Enhancements**

#### App Performance
- Code splitting & lazy loading
- Service workers for offline mode
- Incremental app updates
- Progressive native optimizations

#### Network Optimization
- GraphQL instead of REST (if adding backend)
- WebSocket for real-time updates
- Compression of payloads
- CDN for media assets

### 4. **User Experience**

#### Onboarding Flow
- Skip/reorder interests selection
- Icebreaker questions for first match
- Tutorial overlays for new users
- Permission request optimization

#### Accessibility
- Voice-over support for all screens
- High contrast mode
- Adjustable text size
- Caption support for videos

#### Localization
- Multi-language support (i18n)
- RTL language support
- Local date/time formatting
- Cultural-aware features

### 5. **Social Features**

#### Community
- Group chat for similar interests
- Events discovery
- Relationship advice articles
- Success stories section

#### Sharing
- Share connection stats
- Anniversary invitations
- Couple challenges
- Social media integration

### 6. **Monetization** (If Applicable)

#### Premium Features
- Advanced filters in discovery
- Unlimited messages
- Priority matching
- Custom themes

#### Subscription Model
- Monthly ($4.99)
- Annual ($39.99)
- Premium+ tier ($9.99/month)

---

## Migration Checklist: Web → React Native

### Phase 1: Project Setup (Week 1)
- [ ] Initialize React Native project (Expo/CLI)
- [ ] Set up Firebase configuration
- [ ] Configure TypeScript
- [ ] Set up navigation structure
- [ ] Create base component library

### Phase 2: Authentication (Week 2)
- [ ] Implement Google Sign-In
- [ ] Set up Auth context
- [ ] Create landing & login screens
- [ ] Implement token persistence
- [ ] Add error handling

### Phase 3: Core Features (Weeks 3-5)
- [ ] **Feature 1: Profile Management**
  - Profile screen (view)
  - Edit profile screen
  - Photo upload
  
- [ ] **Feature 2: Discovery**
  - Discover screen with card stack
  - Matching algorithm
  - Like/pass functionality
  
- [ ] **Feature 3: Home Dashboard**
  - Partner info card
  - Mood system
  - Love bite feature
  - Heartbeat graph

### Phase 4: Messaging & Social (Weeks 6-7)
- [ ] Messaging system
- [ ] Conversations list
- [ ] Chat screen with real-time updates
- [ ] Matches list
- [ ] Relationship milestones

### Phase 5: Polish & Testing (Weeks 8-10)
- [ ] UI Polish & animations
- [ ] Performance optimization
- [ ] Comprehensive testing
- [ ] Beta release to testers
- [ ] Bug fixes based on feedback

### Phase 6: Deployment (Week 11+)
- [ ] iOS build & submission
- [ ] Android build & submission
- [ ] Play Store & App Store optimization
- [ ] Official launch
- [ ] Post-launch monitoring

---

## Conclusion

This comprehensive guide provides a detailed roadmap for implementing Echo as a React Native mobile application. Key takeaways:

1. **Architecture:** Follow a layered, modular architecture with clear separation of concerns
2. **State Management:** Use Zustand or Redux for predictable state handling
3. **Firebase Integration:** Maintain the same Firestore schema and real-time listener patterns
4. **UI/UX:** Adapt web components to native with platform-specific optimizations
5. **Performance:** Implement caching, memoization, and efficient animations
6. **Testing:** Comprehensive unit, integration, and e2e testing before release
7. **Scalability:** Plan for features like video calls, AI analysis, and gamification

The estimated development time is **10-12 weeks** for a feature-complete MVP with the same functionality as the web version, increasing to **16-20 weeks** with improved features and optimizations.

---

**Document Prepared By:** Architecture Team  
**Last Updated:** April 14, 2026  
**Status:** Ready for Development

