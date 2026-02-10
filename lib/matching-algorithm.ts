import { UserProfile } from './types';

export interface MatchScore {
  userId: string;
  score: number;
  commonEmotions: string[];
  commonInterests: string[];
}

export function calculateCompatibility(
  user1: UserProfile,
  user2: UserProfile,
): MatchScore {
  let score = 0;
  const commonEmotions: string[] = [];
  const commonInterests: string[] = [];

  const emotions1 = new Set(user1.emotions);
  const emotions2 = new Set(user2.emotions);

  emotions1.forEach((emotion) => {
    if (emotions2.has(emotion)) {
      commonEmotions.push(emotion);
      score += 40;
    }
  });

  if (
    user1.emotions.length > 0 &&
    user2.emotions.length > 0 &&
    commonEmotions.length > 0
  ) {
    const emotionScore =
      (commonEmotions.length /
        Math.max(user1.emotions.length, user2.emotions.length)) *
      40;
    score = Math.min(emotionScore + 10, 40);
  }

  const interests1 = new Set(user1.interests);
  const interests2 = new Set(user2.interests);

  interests1.forEach((interest) => {
    if (interests2.has(interest)) {
      commonInterests.push(interest);
      score += 35;
    }
  });

  if (
    user1.interests.length > 0 &&
    user2.interests.length > 0 &&
    commonInterests.length > 0
  ) {
    const interestScore =
      (commonInterests.length /
        Math.max(user1.interests.length, user2.interests.length)) *
      35;
    score += Math.min(interestScore, 35);
  }

  if (user1.age && user2.age) {
    const ageDiff = Math.abs(user1.age - user2.age);
    if (ageDiff <= 5) {
      score += 15;
    } else if (ageDiff <= 10) {
      score += 10;
    } else if (ageDiff <= 15) {
      score += 5;
    }
  } else {
    score += 10;
  }

  if (
    user1.location &&
    user2.location &&
    user1.location.toLowerCase() === user2.location.toLowerCase()
  ) {
    score += 10;
  }

  if (user2.bio && user2.photoURL) {
    score += 5;
  }

  return {
    userId: user2.uid,
    score: Math.min(score, 100),
    commonEmotions,
    commonInterests,
  };
}

export function rankMatches(
  currentUser: UserProfile,
  allUsers: UserProfile[],
): MatchScore[] {
  return allUsers
    .filter((user) => user.uid !== currentUser.uid)
    .map((user) => calculateCompatibility(currentUser, user))
    .sort((a, b) => b.score - a.score);
}

export function getTopMatches(
  currentUser: UserProfile,
  allUsers: UserProfile[],
  limit: number = 10,
): MatchScore[] {
  return rankMatches(currentUser, allUsers).slice(0, limit);
}
