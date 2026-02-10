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
} from 'firebase/firestore';
import { db } from './firebase';
import { UserProfile, Message, Conversation } from './types';

export async function createUserProfile(
  profile: Omit<UserProfile, 'createdAt'>,
) {
  const docRef = doc(db, 'users', profile.uid);
  await setDoc(docRef, { ...profile, createdAt: serverTimestamp() });
}

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const docRef = doc(db, 'users', uid);
  const docSnap = await getDoc(docRef);
  return docSnap.exists() ? (docSnap.data() as UserProfile) : null;
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
  const q = query(collection(db, 'likes'), where('userId', '==', userId));
  const qs = await getDocs(q);
  const likedByUser = qs.docs.map((doc) => doc.data().likedUserId);

  const q2 = query(collection(db, 'likes'), where('userId', '!=', userId));
  const qs2 = await getDocs(q2);
  const matches = qs2.docs
    .filter((doc) => likedByUser.includes(doc.data().userId))
    .map((doc) => doc.data().userId);

  return [...new Set(matches)];
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
  const q = query(messageRef, orderBy('timestamp', 'asc'));

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
