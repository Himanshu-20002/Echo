'use client';

import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import {
  getUserProfile,
  updateUserProfile,
  uploadUserProfileImage,
} from '@/lib/firestore-service';
import { UserProfile } from '@/lib/types';
import {
  Heart,
  User,
  MapPin,
  Calendar,
  Music,
  Sparkles,
  ArrowLeft,
  Camera,
  Save,
  Loader2,
  Plus,
  X
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export default function ProfilePage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Local state for form fields to avoid frequent Firestore calls
  const [formData, setFormData] = useState({
    displayName: '',
    bio: '',
    age: '',
    location: '',
    height: '',
    interests: [] as string[],
    favoriteMusic: [] as string[],
  });

  const [newInterest, setNewInterest] = useState('');
  const [newMusic, setNewMusic] = useState('');

  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user?.uid) {
      const fetchProfile = async () => {
        const data = await getUserProfile(user.uid);
        if (data) {
          setProfile(data);
          setFormData({
            displayName: data.displayName || '',
            bio: data.bio || '',
            age: data.age?.toString() || '',
            location: data.location || '',
            height: data.height || '',
            interests: data.interests || [],
            favoriteMusic: data.favoriteMusic || [],
          });
        } else {
          // Fallback if sync hasn't happened yet
          setFormData(prev => ({ ...prev, displayName: user.displayName || '' }));
          setProfile({
            uid: user.uid,
            displayName: user.displayName || 'User',
            photoURL: user.photoURL || '',
            email: user.email || '',
            createdAt: new Date(),
          } as any);
        }
      };
      fetchProfile();
    }
  }, [user?.uid]);

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user?.uid) return;

    try {
      setIsUploading(true);
      const url = await uploadUserProfileImage(user.uid, file);
      setProfile(prev => prev ? { ...prev, photoURL: url } : null);
    } catch (err) {
      console.error('Upload failed:', err);
      alert('Failed to upload image');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = async () => {
    if (!user?.uid) return;

    try {
      setIsSaving(true);

      // Filter out undefined values to prevent Firestore errors
      const updates: any = {
        displayName: formData.displayName,
        bio: formData.bio,
        location: formData.location,
        height: formData.height,
        interests: formData.interests,
        favoriteMusic: formData.favoriteMusic,
      };

      if (formData.age) {
        updates.age = parseInt(formData.age);
      }

      await updateUserProfile(user.uid, updates);
      setProfile(prev => prev ? { ...prev, ...updates } as any : null);
      setIsEditing(false);
    } catch (err) {
      console.error('Save failed:', err);
      alert('Failed to save profile');
    } finally {
      setIsSaving(false);
    }
  };

  const addInterest = () => {
    if (newInterest.trim() && !formData.interests.includes(newInterest.trim())) {
      setFormData(prev => ({ ...prev, interests: [...prev.interests, newInterest.trim()] }));
      setNewInterest('');
    }
  };

  const removeInterest = (item: string) => {
    setFormData(prev => ({ ...prev, interests: prev.interests.filter(i => i !== item) }));
  };

  const addMusic = () => {
    if (newMusic.trim() && !formData.favoriteMusic.includes(newMusic.trim())) {
      setFormData(prev => ({ ...prev, favoriteMusic: [...prev.favoriteMusic, newMusic.trim()] }));
      setNewMusic('');
    }
  };

  const removeMusic = (item: string) => {
    setFormData(prev => ({ ...prev, favoriteMusic: prev.favoriteMusic.filter(i => i !== item) }));
  };

  if (loading || !profile) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black text-white">
        <Loader2 className="w-8 h-8 animate-spin text-accent-pink" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white pb-20">
      {/* Top Banner / Cover */}
      <div className="h-48 w-full bg-gradient-to-b from-accent-pink/20 to-transparent relative">
        <Link href="/home" className="absolute top-6 left-6 p-2 bg-black/40 backdrop-blur-md rounded-full border border-white/10 hover:bg-black/60 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
      </div>

      <div className="max-w-4xl mx-auto px-6 -mt-24">
        {/* Completion Banner */}
        {(!profile.displayName || !profile.bio || !profile.age) && (
          <div className="mb-6 p-4 bg-accent-pink/10 border border-accent-pink/30 rounded-2xl flex items-center justify-between animate-pulse">
            <div className="flex items-center gap-3">
              <Sparkles className="w-5 h-5 text-accent-pink" />
              <span className="text-sm font-bold text-accent-pink">Your profile is incomplete. Fill in your name, bio, and age to unlock all features!</span>
            </div>
            <button onClick={() => setIsEditing(true)} className="text-xs font-black uppercase tracking-widest bg-accent-pink text-white px-4 py-2 rounded-xl">Fix Now</button>
          </div>
        )}

        {/* Profile Header Card */}
        <div className="glass-panel-heavy rounded-[2.5rem] p-8 relative border border-white/10">
          <div className="flex flex-col md:flex-row items-center gap-8">
            {/* Avatar Section */}
            <div className="relative group cursor-pointer" onClick={handleImageClick}>
              <div className="w-32 h-32 rounded-full border-4 border-accent-pink/50 p-1 relative overflow-hidden">
                {isUploading ? (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-10">
                    <Loader2 className="w-6 h-6 animate-spin text-accent-pink" />
                  </div>
                ) : null}
                <img
                  src={profile.photoURL || 'https://via.placeholder.com/128'}
                  className="w-full h-full rounded-full object-cover"
                  alt="Profile"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Camera className="w-6 h-6 text-white" />
                </div>
              </div>
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleImageChange}
              />
            </div>

            {/* Basic Info */}
            <div className="flex-1 text-center md:text-left space-y-2">
              <div className="flex flex-col md:flex-row md:items-center gap-4">
                {isEditing ? (
                  <input
                    className="bg-white/5 border border-white/10 rounded-xl px-4 py-1 text-2xl font-black outline-none focus:border-accent-pink transition-colors"
                    value={formData.displayName}
                    onChange={e => setFormData({ ...formData, displayName: e.target.value })}
                  />
                ) : (
                  <h1 className="text-4xl font-black tracking-tight">{profile.displayName}</h1>
                )}

                <button
                  onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                  className={`px-6 py-2 rounded-full font-bold text-sm transition-all flex items-center gap-2 ${isEditing ? 'bg-accent-pink text-white' : 'bg-white/5 border border-white/10 hover:bg-white/10'
                    }`}
                  disabled={isSaving}
                >
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : (isEditing ? <Save className="w-4 h-4" /> : 'Edit Profile')}
                </button>
              </div>

              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-white/60 text-sm">
                <span className="flex items-center gap-1.5 font-medium">
                  <Heart className="w-4 h-4 text-accent-pink" /> {profile.age || '??'} Years
                </span>
                <span className="flex items-center gap-1.5 font-medium">
                  <MapPin className="w-4 h-4 text-accent-pink" /> {profile.location || 'Echo Universe'}
                </span>
                <span className="flex items-center gap-1.5 font-medium">
                  <Calendar className="w-4 h-4 text-accent-pink" /> Joined {new Date(profile.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 pt-8 border-t border-white/5">
            <div className="bg-white/5 rounded-2xl p-4 text-center">
              <span className="block text-2xl font-black text-accent-pink">{profile.dailyLoveCount || 0}</span>
              <span className="text-[10px] uppercase font-bold tracking-widest text-white/30">Love Received</span>
            </div>
            <div className="bg-white/5 rounded-2xl p-4 text-center">
              <span className="block text-2xl font-black text-cyan-400">84</span>
              <span className="text-[10px] uppercase font-bold tracking-widest text-white/30">Love Sent</span>
            </div>
            <div className="bg-white/5 rounded-2xl p-4 text-center">
              <span className="block text-2xl font-black text-purple-400">92%</span>
              <span className="text-[10px] uppercase font-bold tracking-widest text-white/30">Sync Score</span>
            </div>
            <div className="bg-white/5 rounded-2xl p-4 text-center">
              <span className="block text-2xl font-black text-green-400">Active</span>
              <span className="text-[10px] uppercase font-bold tracking-widest text-white/30">Status</span>
            </div>
          </div>
        </div>

        {/* Details Sections */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          {/* Main Info Column */}
          <div className="md:col-span-2 space-y-6">
            {/* Bio Card */}
            <div className="glass-panel rounded-3xl p-6 border border-white/5">
              <h3 className="text-sm font-black uppercase tracking-widest text-accent-pink mb-4 flex items-center gap-2">
                <User className="w-4 h-4" /> About Me
              </h3>
              {isEditing ? (
                <textarea
                  className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm outline-none focus:border-accent-pink transition-colors resize-none"
                  rows={4}
                  value={formData.bio}
                  onChange={e => setFormData({ ...formData, bio: e.target.value })}
                />
              ) : (
                <p className="text-white/80 leading-relaxed italic">
                  "{profile.bio || "No bio yet. Tell us your story..."}"
                </p>
              )}
            </div>

            {/* Specifics Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
                <span className="text-[10px] uppercase font-bold tracking-widest text-white/30 block mb-1">Age</span>
                {isEditing ? (
                  <input
                    type="number"
                    className="bg-transparent border-b border-white/10 w-full text-sm outline-none focus:border-accent-pink transition-colors"
                    value={formData.age}
                    onChange={e => setFormData({ ...formData, age: e.target.value })}
                    placeholder="e.g. 25"
                  />
                ) : (
                  <span className="text-sm font-bold">{profile.age || '??'} Years</span>
                )}
              </div>
              <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
                <span className="text-[10px] uppercase font-bold tracking-widest text-white/30 block mb-1">Location</span>
                {isEditing ? (
                  <input className="bg-transparent border-b border-white/10 w-full text-sm outline-none focus:border-accent-pink transition-colors" value={formData.location} onChange={e => setFormData({ ...formData, location: e.target.value })} placeholder="e.g. New York" />
                ) : (
                  <span className="text-sm font-bold">{profile.location || 'Unknown'}</span>
                )}
              </div>
              <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
                <span className="text-[10px] uppercase font-bold tracking-widest text-white/30 block mb-1">Height</span>
                {isEditing ? (
                  <input className="bg-transparent border-b border-white/10 w-full text-sm outline-none focus:border-accent-pink transition-colors" value={formData.height} onChange={e => setFormData({ ...formData, height: e.target.value })} placeholder="e.g. 5ft 11in" />
                ) : (
                  <span className="text-sm font-bold">{profile.height || '???"'}</span>
                )}
              </div>
            </div>
          </div>

          {/* Interests & Music Sidebar */}
          <div className="space-y-6">
            {/* Interests Card */}
            <div className="glass-panel rounded-3xl p-6 border border-white/5">
              <h3 className="text-sm font-black uppercase tracking-widest text-white/40 mb-4 flex items-center gap-2">
                <Sparkles className="w-4 h-4" /> Interests
              </h3>
              <div className="flex flex-wrap gap-2">
                {formData.interests.map((item, idx) => (
                  <span key={idx} className="px-3 py-1 bg-accent-pink/10 border border-accent-pink/20 rounded-lg text-xs font-bold text-accent-pink flex items-center gap-2">
                    {item}
                    {isEditing && <X className="w-3 h-3 cursor-pointer" onClick={() => removeInterest(item)} />}
                  </span>
                ))}
                {isEditing && (
                  <div className="flex items-center gap-2 w-full mt-2">
                    <input
                      className="bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-xs outline-none flex-1"
                      placeholder="Add interest..."
                      value={newInterest}
                      onChange={e => setNewInterest(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && addInterest()}
                    />
                    <Plus className="w-4 h-4 text-accent-pink cursor-pointer" onClick={addInterest} />
                  </div>
                )}
              </div>
            </div>

            {/* Music Card */}
            <div className="glass-panel rounded-3xl p-6 border border-white/5">
              <h3 className="text-sm font-black uppercase tracking-widest text-white/40 mb-4 flex items-center gap-2">
                <Music className="w-4 h-4" /> Favorite Music
              </h3>
              <div className="space-y-2">
                {formData.favoriteMusic.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2 bg-white/5 rounded-xl border border-white/5 group">
                    <span className="text-xs font-medium text-white/70">{item}</span>
                    {isEditing && <X className="w-3 h-3 text-white/20 hover:text-red-500 cursor-pointer" onClick={() => removeMusic(item)} />}
                  </div>
                ))}
                {isEditing && (
                  <div className="flex items-center gap-2 w-full mt-2">
                    <input
                      className="bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-xs outline-none flex-1"
                      placeholder="Add artist/track..."
                      value={newMusic}
                      onChange={e => setNewMusic(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && addMusic()}
                    />
                    <Plus className="w-4 h-4 text-accent-pink cursor-pointer" onClick={addMusic} />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
