# Echo React Native - Quick Reference & Resources

## Quick Start Commands

### Project Initialization
```bash
# Using Expo (Recommended for quick setup)
npx create-expo-app echo-mobile
cd echo-mobile
npx expo install

# OR Using React Native CLI
npx @react-native-community/cli init EchoMobile --template react-native-template-typescript
cd EchoMobile
```

### Essential First Dependencies
```bash
# Core
npm install react react-native typescript @types/react-native

# Navigation
npm install @react-navigation/native @react-navigation/native-stack @react-navigation/bottom-tabs
npm install react-native-screens react-native-safe-area-context

# Firebase
npm install firebase

# Google Sign-In
npm install @react-native-google-signin/google-signin

# UI & Styling
npm install react-native-paper nativewind tailwindcss

# Forms & Validation
npm install react-hook-form zod @hookform/resolvers

# Gestures & Animations
npm install react-native-gesture-handler react-native-reanimated
npm install react-native-pager-view

# State Management
npm install zustand
# OR
npm install redux @reduxjs/toolkit react-redux

# AsyncStorage
npm install @react-native-async-storage/async-storage

# Dev Tools
npm install --save-dev eslint prettier @typescript-eslint/eslint-plugin
npm install --save-dev @testing-library/react-native jest @testing-library/jest-native
```

---

## File Templates

### 1. Screen Template
```typescript
// screens/[FeatureName]/MyScreen.tsx

import React, { useEffect, useState } from 'react';
import { View, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '@/types/navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'MyScreen'>;

export function MyScreen({ navigation, route }: Props) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      // Fetch data
      setData([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#6366F1" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ color: '#EF4444' }}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#0F172A' }}>
      <FlatList
        data={data}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          // Render item
          <View />
        )}
      />
    </View>
  );
}
```

### 2. Hook Template
```typescript
// hooks/useMyHook.ts

import { useState, useEffect, useCallback } from 'react';

export function useMyHook(dependency: string) {
  const [state, setState] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      try {
        setLoading(true);
        const result = await fetchData(dependency);
        if (isMounted) setState(result);
      } catch (err) {
        if (isMounted) setError(err as Error);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, [dependency]);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const result = await fetchData(dependency);
      setState(result);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [dependency]);

  return { state, loading, error, refresh };
}
```

### 3. Service Template
```typescript
// services/myService.ts

import { db } from '@/config/firebase';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';

interface MyData {
  id: string;
  // ... fields
}

export async function fetchMyData(id: string): Promise<MyData | null> {
  try {
    const docRef = doc(db, 'collection', id);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? (docSnap.data() as MyData) : null;
  } catch (error) {
    console.error('Error fetching data:', error);
    throw error;
  }
}

export function subscribeToMyData(
  id: string,
  callback: (data: MyData | null) => void
): () => void {
  const unsubscribe = onSnapshot(
    doc(db, 'collection', id),
    (doc) => {
      callback(doc.exists() ? (doc.data() as MyData) : null);
    },
    (error) => {
      console.error('Error subscribing:', error);
      callback(null);
    }
  );
  return unsubscribe;
}

export async function updateMyData(id: string, updates: Partial<MyData>): Promise<void> {
  try {
    await setDoc(doc(db, 'collection', id), updates, { merge: true });
  } catch (error) {
    console.error('Error updating data:', error);
    throw error;
  }
}
```

### 4. Custom Component Template
```typescript
// components/MyComponent.tsx

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors } from '@/utils/colors';

interface MyComponentProps {
  title: string;
  onPress?: () => void;
  variant?: 'primary' | 'secondary';
}

export const MyComponent: React.FC<MyComponentProps> = ({
  title,
  onPress,
  variant = 'primary',
}) => {
  return (
    <TouchableOpacity
      style={[
        styles.container,
        variant === 'primary' ? styles.primary : styles.secondary,
      ]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Text style={styles.text}>{title}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  primary: {
    backgroundColor: Colors.primary,
  },
  secondary: {
    backgroundColor: Colors.secondary,
  },
  text: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
```

---

## Key API Endpoints Mapping

| Feature | Web Path | API Used | Mobile Implementation |
|---------|----------|----------|----------------------|
| Authentication | `/api/auth` | Firebase Auth | `@react-native-google-signin` + Firebase |
| User Profiles | `/lib/firestore-service.ts` | Firestore | Same service layer |
| Matching | `/lib/matching-algorithm.ts` | Algorithm | Same logic, React Native UI |
| Messages | `/messages` | Firestore Realtime | onSnapshot listeners |
| Mood System | `/components/dashboard/MoodWindow` | Firestore | Canvas/SVG animations |
| Relationships | `/lib/firestore-service.ts` | Firestore | Subscription-based updates |

---

## State Management Decision Tree

```
START: Choosing state mgmt
│
├─ Simple app (<10 screens)?
│  └─ Use React Context API ✓
│
├─ Medium complexity (10-20 screens)?
│  ├─ Zustand (lightweight) ✓
│  └─ Context + useReducer
│
├─ Complex app (20+ screens, lots of shared state)?
│  ├─ Redux Toolkit ✓✓
│  └─ MobX (if you prefer decorators)
│
└─ Real-time heavy (many listeners)?
   └─ Zustand + Firestore listeners ✓✓
```

**For Echo Mobile:** Zustand is recommended for its simplicity and performance.

---

## Performance Checkpoints

### Before Each Release

```typescript
// Performance audit
□ Bundle size < 50MB
□ App startup time < 3s
□ Animations 60 FPS
□ No memory leaks (ProfileScreeenshot)
□ Image load time < 2s
□ Message send latency < 1s
□ Firestore query time < 500ms
```

### Monitoring Commands

```bash
# Check bundle size
npx react-native bundle --platform android --dev false --reset-cache --entry-file index.js
npx react-native bundle --platform ios --dev false --reset-cache --entry-file index.js

# Profile performance
npm run android -- --verbose
npm run ios -- --verbose

# Check dependencies size
npm ls --depth=0
npm dedupe
```

---

## Common Implementation Patterns

### Pattern 1: Real-time Data Subscription
```typescript
useEffect(() => {
  let unsubscribe: (() => void) | null = null;

  const subscribe = async () => {
    unsubscribe = subscribeToData(id, (data) => {
      setData(data);
    });
  };

  subscribe();

  return () => {
    if (unsubscribe) unsubscribe();
  };
}, [id]);
```

### Pattern 2: Loading & Error States
```typescript
if (loading) return <LoadingScreen />;
if (error) return <ErrorScreen error={error} onRetry={retry} />;
if (!data) return <EmptyState />;
return <ContentScreen data={data} />;
```

### Pattern 3: Infinite Scroll Pagination
```typescript
const [page, setPage] = useState(1);
const [data, setData] = useState<Item[]>([]);
const [hasMore, setHasMore] = useState(true);

const loadMore = async () => {
  if (!hasMore || loading) return;
  const newData = await fetchData(page + 1);
  setData([...data, ...newData]);
  setPage(page + 1);
  setHasMore(newData.length === PAGE_SIZE);
};

<FlatList
  data={data}
  onEndReached={loadMore}
  onEndReachedThreshold={0.5}
/>
```

### Pattern 4: Debounced Search
```typescript
const [searchQuery, setSearchQuery] = useState('');
const debouncedSearch = useRef(
  debounce((query: string) => {
    performSearch(query);
  }, 500)
).current;

const handleSearch = (query: string) => {
  setSearchQuery(query);
  debouncedSearch(query);
};
```

### Pattern 5: Gesture-Based Swipe
```typescript
const gesture = Gesture.Pan()
  .onUpdate((event) => {
    animatedX.value = event.translationX;
  })
  .onEnd(() => {
    if (animatedX.value > 100) {
      // Swiped right
      handleSwipeRight();
    } else if (animatedX.value < -100) {
      // Swiped left
      handleSwipeLeft();
    }
    animatedX.value = withSpring(0);
  });
```

---

## Troubleshooting Guide

### Issue: Firebase Auth Not Working on Android
**Solution:**
```bash
# Update Google Services configuration
# 1. Download updated google-services.json from Firebase Console
# 2. Place in android/app/
# 3. Run: ./gradlew clean && ./gradlew build
```

### Issue: Images Not Loading
**Solution:**
```typescript
// Add required permissions
// android/AndroidManifest.xml
<uses-permission android:name="android.permission.INTERNET" />

// Request permission at runtime
import { request, PERMISSIONS, RESULTS } from 'react-native-permissions';
await request(PERMISSIONS.ANDROID.READ_MEDIA_IMAGES);
```

### Issue: Animations Laggy
**Solution:**
```typescript
// Use native driver
Animated.timing(value, {
  toValue: 1,
  useNativeDriver: true, // Enable GPU acceleration
}).start();

// Or use Reanimated 3 (better performance)
import { runOnUI, withSpring } from 'react-native-reanimated';
```

### Issue: Real-time Updates Not Showing
**Solution:**
```typescript
// Ensure Firestore listener is properly set up
useEffect(() => {
  const unsubscribe = onSnapshot(
    docRef,
    (doc) => {
      console.log('Data updated:', doc.data()); // Debug log
      setData(doc.data());
    },
    (error) => {
      console.error('Firestore error:', error);
    }
  );

  return () => unsubscribe();
}, [id]);
```

### Issue: High Bundle Size
**Solution:**
```bash
# Analyze bundle
npm run build:analyze

# Code split lazy components
const ProfileScreen = lazy(() => import('./ProfileScreen'));

# Remove unused dependencies
npm prune

# Use minification
npx metro-config set minify true
```

---

## Design System Quick Reference

### Colors
```typescript
Primary: #6366F1 (Indigo)
Secondary: #EC4899 (Pink)
Background: #0F172A (Dark)
Surface: #1E293B (Lighter)
Text Primary: #F1F5F9
Border: #334155
```

### Spacing
```
xs: 4px
sm: 8px
md: 12px
lg: 16px
xl: 24px
xxl: 32px
```

### Typography
```
Heading 1: 32px, 700
Heading 2: 28px, 600
Body: 16px, 400
Caption: 12px, 400
```

### Border Radius
```
sm: 4px
md: 8px
lg: 16px
full: 999px
```

---

## Firebase Security Rules Template

```javascript
// firestore.rules

rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // User profiles - readable by all, writable by owner
    match /users/{userId} {
      allow read: if true;
      allow create, update, delete: if request.auth.uid == userId;
    }
    
    // Likes - user's own likes readable, others not readable
    match /likes/{document=**} {
      allow read: if request.auth != null && 
        (resource.data.userId == request.auth.uid || 
         resource.data.likedUserId == request.auth.uid);
      allow create: if request.auth != null;
      allow update, delete: if request.auth.uid == resource.data.userId;
    }
    
    // Messages - readable by participants only
    match /conversations/{conversationId} {
      allow read: if request.auth.uid in resource.data.participants;
      allow create: if request.auth.uid in request.resource.data.participants;
      
      match /messages/{messageId} {
        allow read: if request.auth.uid in get(/databases/$(database)/documents/conversations/$(conversationId)).data.participants;
        allow create: if request.auth.uid == request.resource.data.senderId;
        allow update: if request.auth.uid == resource.data.senderId;
      }
    }
    
    // Relationships
    match /relationships/{relationshipId} {
      allow read, write: if request.auth.uid in resource.data.participants;
    }
  }
}
```

---

## Testing Checklist

### Unit Tests
```
□ Matching algorithm
□ Validation functions
□ Utility helpers
□ Formatters
```

### Integration Tests
```
□ Auth flow (sign in)
□ Profile creation
□ Like/match functionality
□ Message sending
```

### E2E Tests
```
□ Full discovery flow
□ Message exchange
□ Mood update sync
□ Profile editing
```

---

## Environment Setup

### .env.local
```
EXPO_PUBLIC_FIREBASE_API_KEY=xxxxx
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=xxxxx
EXPO_PUBLIC_FIREBASE_PROJECT_ID=xxxxx
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=xxxxx
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=xxxxx
EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=xxxxx
```

### app.json (Expo)
```json
{
  "expo": {
    "name": "echo",
    "slug": "echo-mobile",
    "version": "1.0.0",
    "assetBundlePatterns": [
      "**/*"
    ],
    "ios": {
      "supportsTabletMode": true,
      "bundleIdentifier": "com.yourdomain.echo"
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#0F172A"
      },
      "package": "com.yourdomain.echo"
    },
    "plugins": [
      "@react-native-google-signin/google-signin",
      "expo-camera",
      "expo-media-library"
    ]
  }
}
```

---

## Useful Resources

### Documentation
- [React Native Docs](https://reactnative.dev/docs/getting-started)
- [React Navigation](https://reactnavigation.org/)
- [Firebase React Native SDK](https://rnfirebase.io/)
- [Expo Documentation](https://docs.expo.dev/)

### Libraries
- [React Native Gesture Handler](https://docs.swmansion.com/react-native-gesture-handler/)
- [React Native Reanimated](https://docs.swmansion.com/react-native-reanimated/)
- [React Native Paper](https://callstack.github.io/react-native-paper/)
- [Zustand](https://github.com/pmndrs/zustand)

### Tools
- [React Native Debugger](https://github.com/jhen0409/react-native-debugger)
- [Flipper](https://fbflipper.com/)
- [Reactotron](https://infinite.red/reactotron)

### Communities
- [React Native Discussions](https://github.com/facebook/react-native/discussions)
- [Expo Community Forums](https://forums.expo.dev/)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/react-native)

---

## Release Checklist

### Pre-Release
- [ ] All tests passing (unit + integration + e2e)
- [ ] No console errors or warnings
- [ ] Bundle size optimized
- [ ] Performance metrics checked
- [ ] Privacy policy updated
- [ ] Terms reviewed
- [ ] App icons & splashes finalized

### iOS Release
- [ ] Certificates & profiles valid
- [ ] Version bumped in app.json & ios/Podfile
- [ ] Built archive with xcodebuild
- [ ] Tested on multiple iOS versions
- [ ] Submitted to App Store
- [ ] Release notes prepared

### Android Release
- [ ] Keystore generated & safe
- [ ] Build variant set to release
- [ ] Version code incremented
- [ ] Built AAB or APK
- [ ] Tested on multiple Android versions
- [ ] Submitted to Google Play
- [ ] Screenshots uploaded

### Post-Release
- [ ] Monitor crash reports
- [ ] Track user feedback
- [ ] Monitor analytics
- [ ] Prepare v1.1 roadmap
- [ ] Plan next feature releases

---

## Git Workflow

### Branch Naming
```
feature/feature-name
bugfix/bug-name
hotfix/critical-bug
release/v1.0.0
```

### Commit Messages
```
feat: Add mood selection feature
fix: Fix message loading on Android
refactor: Optimize heartbeat animation
docs: Update README with setup instructions
test: Add tests for matching algorithm
```

### Pre-commit Checks
```bash
# .husky/pre-commit
npm run lint
npm run format
npm test -- --bail
```

---

## Notes for Your Team

### Communication
- Daily standups (15 min)
- Weekly sprint reviews
- Bi-weekly planning sessions
- Async updates in Slack/Discord

### Code Review Checklist
- [ ] Follows project conventions
- [ ] Includes tests
- [ ] No console logs
- [ ] Performance acceptable
- [ ] Accessibility considered
- [ ] Documentation updated

### Documentation Standards
- TypeScript types for all props
- JSDoc comments for complex functions
- README in each major folder
- Change log maintained

---

**Last Updated:** April 14, 2026  
**Maintained By:** Development Team  

