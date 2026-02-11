import {
  doc,
  setDoc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  addDoc,
  serverTimestamp,
  orderBy,
  onSnapshot,
  limit,
  increment,
  runTransaction
} from 'firebase/firestore';
import { db } from './firebase';
import { UserProfile, Message, Conversation, MoodType } from './types';

// Simple in-memory cache to reduce reads
const profileCache: Record<string, UserProfile> = {};
const matchCache: Record<string, string[]> = {};

export async function createUserProfile(
  profile: Omit<UserProfile, 'createdAt'>,
) {
  const docRef = doc(db, 'users', profile.uid);
  await setDoc(docRef, { ...profile, createdAt: serverTimestamp() });
}

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  if (profileCache[uid]) return profileCache[uid];

  const docRef = doc(db, 'users', uid);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    const profile = { uid: docSnap.id, ...docSnap.data() } as UserProfile;
    profileCache[uid] = profile;
    return profile;
  }
  return null;
}

export async function updateUserProfile(
  uid: string,
  updates: Partial<UserProfile>,
) {
  const docRef = doc(db, 'users', uid);
  await updateDoc(docRef, updates);
}

export async function addEmotion(uid: string, emotion: string) {
  const userRef = doc(db, 'users', uid);
  const userDoc = await getDoc(userRef);
  if (userDoc.exists()) {
    const currentEmotions = userDoc.data().emotions || [];
    await updateDoc(userRef, {
      emotions: [emotion, ...currentEmotions].slice(0, 10),
    });
  }
}

export async function addFavoriteMusic(uid: string, track: string) {
  const userRef = doc(db, 'users', uid);
  const userDoc = await getDoc(userRef);
  if (userDoc.exists()) {
    const currentMusic = userDoc.data().favoriteMusic || [];
    await updateDoc(userRef, {
      favoriteMusic: [track, ...currentMusic].slice(0, 10),
    });
  }
}

export async function updateInterests(uid: string, interests: string[]) {
  const userRef = doc(db, 'users', uid);
  await updateDoc(userRef, { interests });
}

export async function getUsersForDiscovery(
  excludeUid: string,
): Promise<UserProfile[]> {
  const userRef = collection(db, 'users');
  const q = query(userRef, where('uid', '!=', excludeUid));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((doc) => doc.data() as UserProfile);
}

export async function likeUser(userId: string, likedUserId: string) {
  try {
    console.log('[v0] likeUser - Saving like to Firestore:', { userId, likedUserId });
    const likeRef = collection(db, 'likes');
    const docRef = await addDoc(likeRef, {
      userId,
      likedUserId,
      timestamp: serverTimestamp(),
    });
    console.log('[v0] likeUser - Like saved with ID:', docRef.id);
  } catch (error) {
    console.error('[v0] likeUser - Error saving like:', error);
    throw error;
  }
}

export async function checkMutualLike(
  userId: string,
  likedUserId: string,
): Promise<boolean> {
  const q = query(
    collection(db, 'likes'),
    where('userId', '==', likedUserId),
    where('likedUserId', '==', userId),
  );
  const qs = await getDocs(q);
  return !qs.empty;
}

export async function hasUserLiked(
  userId: string,
  likedUserId: string,
): Promise<boolean> {
  const q = query(
    collection(db, 'likes'),
    where('userId', '==', userId),
    where('likedUserId', '==', likedUserId),
  );
  const qs = await getDocs(q);
  return !qs.empty;
}

export async function getOrCreateConversation(
  userId: string,
  otherUserId: string,
): Promise<string> {
  const conversationId = [userId, otherUserId].sort().join('_');
  const conversationRef = doc(db, 'conversations', conversationId);
  const existing = await getDoc(conversationRef);

  if (!existing.exists()) {
    await setDoc(conversationRef, {
      participants: [userId, otherUserId],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  }

  return conversationId;
}

export async function sendMessage(
  senderId: string,
  recipientId: string,
  content: string,
): Promise<void> {
  try {
    console.log('[v0] sendMessage - Creating/getting conversation for:', senderId, recipientId);
    const conversationId = await getOrCreateConversation(
      senderId,
      recipientId,
    );
    console.log('[v0] sendMessage - Conversation ID:', conversationId);

    const messageRef = collection(
      db,
      'conversations',
      conversationId,
      'messages',
    );

    const docRef = await addDoc(messageRef, {
      senderId,
      recipientId,
      content,
      timestamp: serverTimestamp(),
      read: false,
    });
    console.log('[v0] sendMessage - Message saved with ID:', docRef.id);

    const conversationRef2 = doc(db, 'conversations', conversationId);
    await updateDoc(conversationRef2, {
      lastMessage: content,
      lastMessageTime: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('[v0] sendMessage - Error sending message:', error);
    throw error;
  }
}

export async function getConversationMessages(
  userId: string,
  otherUserId: string,
): Promise<Message[]> {
  try {
    const conversationId = [userId, otherUserId].sort().join('_');
    console.log('[v0] getConversationMessages - Conversation ID:', conversationId);

    const messageRef = collection(
      db,
      'conversations',
      conversationId,
      'messages',
    );
    const q = query(messageRef, orderBy('timestamp', 'asc'));

    const querySnapshot = await getDocs(q);
    console.log('[v0] getConversationMessages - Found messages:', querySnapshot.size);

    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      timestamp: doc.data().timestamp?.toDate() || new Date(),
    } as Message));
  } catch (error) {
    console.error('[v0] getConversationMessages - Error:', error);
    throw error;
  }
}

export async function markMessagesAsRead(
  userId: string,
  otherUserId: string,
): Promise<void> {
  const conversationId = [userId, otherUserId].sort().join('_');
  const messageRef = collection(
    db,
    'conversations',
    conversationId,
    'messages',
  );
  const q = query(
    messageRef,
    where('recipientId', '==', userId),
    where('read', '==', false),
  );

  const querySnapshot = await getDocs(q);
  for (const docSnap of querySnapshot.docs) {
    await updateDoc(docSnap.ref, { read: true });
  }
}

export async function getUserConversations(
  userId: string,
): Promise<Conversation[]> {
  const conversationRef = collection(db, 'conversations');
  const q = query(
    conversationRef,
    where('participants', 'array-contains', userId),
    orderBy('updatedAt', 'desc'),
  );

  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
    lastMessageTime: doc.data().lastMessageTime?.toDate(),
  } as Conversation));
}

export async function getUnreadCount(
  userId: string,
  otherUserId: string,
): Promise<number> {
  const conversationId = [userId, otherUserId].sort().join('_');
  const messageRef = collection(
    db,
    'conversations',
    conversationId,
    'messages',
  );
  const q = query(
    messageRef,
    where('recipientId', '==', userId),
    where('read', '==', false),
  );

  const querySnapshot = await getDocs(q);
  return querySnapshot.size;
}

export async function getUserMatches(userId: string): Promise<string[]> {
  if (matchCache[userId]) return matchCache[userId];

  try {
    // 1. Get everyone I liked
    const myLikesQuery = query(collection(db, 'likes'), where('userId', '==', userId));
    const myLikesSnap = await getDocs(myLikesQuery);
    const peopleILiked = myLikesSnap.docs.map((doc) => doc.data().likedUserId);

    if (peopleILiked.length === 0) return [];

    // 2. See if any of those people liked ME back
    const likesMeQuery = query(
      collection(db, 'likes'),
      where('likedUserId', '==', userId)
    );
    const likesMeSnap = await getDocs(likesMeQuery);

    // 3. Filter for mutual matches
    const mutualMatches = likesMeSnap.docs
      .map(doc => doc.data().userId)
      .filter(likerId => peopleILiked.includes(likerId));

    const finalMatches = [...new Set(mutualMatches)];
    matchCache[userId] = finalMatches;
    return finalMatches;
  } catch (error) {
    console.error('[v0] getUserMatches - Error:', error);
    return [];
  }
}

// Get pending likes (people who liked current user but current user hasn't liked back)
export async function getPendingLikes(
  userId: string,
): Promise<Array<{ userId: string; profile: UserProfile | null }>> {
  try {
    console.log('[v0] getPendingLikes - Starting for user:', userId);

    // Get all likes where this user is the liked person
    const likeRef = collection(db, 'likes');
    const q = query(likeRef, where('likedUserId', '==', userId));
    const qs = await getDocs(q);
    console.log('[v0] getPendingLikes - Found likes pointing to this user:', qs.size, 'docs');

    const likedByUserIds = qs.docs.map((doc) => {
      const data = doc.data();
      console.log('[v0] getPendingLikes - Like from:', data.userId);
      return data.userId;
    });

    console.log('[v0] getPendingLikes - All people who have liked this user:', likedByUserIds);

    // Get people current user has liked back
    const userLikesRef = collection(db, 'likes');
    const userLikes = query(userLikesRef, where('userId', '==', userId));
    const userLikesSnap = await getDocs(userLikes);
    const currentUserLikedIds = new Set(
      userLikesSnap.docs.map((doc) => doc.data().likedUserId),
    );
    console.log('[v0] getPendingLikes - Current user has liked:', Array.from(currentUserLikedIds));

    // Filter out mutual matches (people you've both liked each other)
    const pendingRequests = likedByUserIds.filter(
      (id) => !currentUserLikedIds.has(id),
    );
    console.log('[v0] getPendingLikes - After removing matches:', pendingRequests);

    // Get profiles for pending requests only
    const profiles = await Promise.all(
      pendingRequests.map(async (id) => ({
        userId: id,
        profile: await getUserProfile(id),
      })),
    );

    const filtered = profiles.filter((p) => p.profile !== null);
    console.log('[v0] getPendingLikes - Final requests to show:', filtered.length);
    return filtered;
  } catch (error) {
    console.error('[v0] getPendingLikes - Error:', error);
    throw error;
  }
}

// Real-time listener for conversation messages
export function subscribeToMessages(
  userId: string,
  otherUserId: string,
  callback: (messages: Message[]) => void,
): () => void {
  const conversationId = [userId, otherUserId].sort().join('_');
  console.log('[v0] subscribeToMessages - Conversation ID:', conversationId);

  const messageRef = collection(
    db,
    'conversations',
    conversationId,
    'messages',
  );
  const q = query(messageRef, orderBy('timestamp', 'asc'), limit(50));

  const unsubscribe = onSnapshot(
    q,
    (querySnapshot) => {
      console.log('[v0] subscribeToMessages - Received', querySnapshot.size, 'messages');
      const messages = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate() || new Date(),
      } as Message));
      callback(messages);
    },
    (error) => {
      console.error('[v0] subscribeToMessages - Error:', error);
    },
  );

  return unsubscribe;
}

// Get notification count
export async function getNotificationsCount(userId: string): Promise<number> {
  const likeRef = collection(db, 'likes');
  const q = query(likeRef, where('likedUserId', '==', userId));
  const qs = await getDocs(q);

  const likedByUserIds = qs.docs.map((doc) => doc.data().userId);

  const userLikesRef = collection(db, 'likes');
  const userLikes = query(userLikesRef, where('userId', '==', userId));
  const userLikesSnap = await getDocs(userLikes);
  const currentUserLikedIds = new Set(
    userLikesSnap.docs.map((doc) => doc.data().likedUserId),
  );

  const pendingCount = likedByUserIds.filter(
    (id) => !currentUserLikedIds.has(id),
  ).length;

  return pendingCount;
}

// --- MOOD & LOVE BITE INTEGRATION ---

export async function updateMood(userId: string, mood: MoodType, intensity: number) {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      mood,
      moodIntensity: intensity,
      moodUpdatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('[v0] updateMood - Error:', error);
    throw error;
  }
}

export function subscribeToUserMood(userId: string, callback: (data: { mood: MoodType, intensity: number, dailyLoveCount: number }) => void) {
  const userRef = doc(db, 'users', userId);
  return onSnapshot(userRef, (docSnap) => {
    if (docSnap.exists()) {
      const data = docSnap.data();
      const today = new Date().toISOString().split('T')[0];
      // Reset count locally if date is old
      const effectiveCount = data.lastLoveResetDate === today ? (data.dailyLoveCount || 0) : 0;

      callback({
        mood: (data.mood as MoodType) || 'calm',
        intensity: data.moodIntensity || 3,
        dailyLoveCount: effectiveCount
      });
    }
  }, (error) => {
    console.error('[v0] subscribeToUserMood - Error:', error);
  });
}

export async function sendLoveBite(fromId: string, toId: string) {
  try {
    const loveBiteRef = collection(db, 'loveBites');
    const recipientRef = doc(db, 'users', toId);
    const today = new Date().toISOString().split('T')[0];

    await runTransaction(db, async (transaction) => {
      // 1. PERFORM READ FIRST
      const recipientRef = doc(db, 'users', toId);
      const userSnap = await transaction.get(recipientRef);

      // 2. NOW PERFORM WRITES
      // Create the love bite record
      transaction.set(doc(collection(db, 'loveBites')), {
        fromId,
        toId,
        timestamp: serverTimestamp(),
      });

      if (userSnap.exists()) {
        const userData = userSnap.data();
        if (userData.lastLoveResetDate === today) {
          transaction.update(recipientRef, {
            dailyLoveCount: increment(1)
          });
        } else {
          transaction.update(recipientRef, {
            dailyLoveCount: 1,
            lastLoveResetDate: today
          });
        }
      }
    });

    console.log('[v0] sendLoveBite - Transmitted & Updated Daily Count');
  } catch (error) {
    console.error('[v0] sendLoveBite - Error:', error);
    throw error;
  }
}

export function subscribeToLoveBites(userId: string, callback: (loveBite: any) => void) {
  const loveBiteRef = collection(db, 'loveBites');
  const setupTime = Date.now();

  // Simplified query to avoid index requirement
  const q = query(
    loveBiteRef,
    where('toId', '==', userId)
  );

  return onSnapshot(q, (snapshot) => {
    if (snapshot.empty) return;

    snapshot.docChanges().forEach((change) => {
      if (change.type === 'added') {
        const data = change.doc.data();
        // serverTimestamp() might be null initially on the client due to latency compensation
        const ts = data.timestamp ? data.timestamp.toMillis() : Date.now();

        // Only trigger for bites added after the component mounted (with a 5s buffer)
        if (ts > setupTime - 5000) {
          console.log('[v0] subscribeToLoveBites - New love bite received:', change.doc.id);
          callback({ id: change.doc.id, ...data });
        }
      }
    });
  }, (error) => {
    console.error('[v0] subscribeToLoveBites - Error:', error);
  });
}
