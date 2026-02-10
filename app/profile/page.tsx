'use client';

import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import {
  createUserProfile,
} from '@/lib/firestore-service';

export default function ProfilePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [profile, setProfile] = useState({
    displayName: '',
    bio: '',
    age: '',
    height: '',
    location: ''
  });

  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    }
    if (user && !profile.displayName) {
      setProfile(prev => ({ ...prev, displayName: user.displayName || '' }));
    }
  }, [user, loading, router, profile.displayName]);

  const handleSaveProfile = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!user) return;

    try {
      setIsSaving(true);
      await createUserProfile({
        uid: user.uid,
        email: user.email || '',
        displayName: profile.displayName || 'User',
        photoURL: user.photoURL || '',
        bio: profile.bio,
        age: profile.age ? parseInt(profile.age) : undefined,
        location: profile.location,
        height: profile.height,
        emotions: ['peaceful'],
        interests: [],
        favoriteMusic: [],
      });

      router.replace('/discover');
    } catch (error) {
      console.error('Error saving profile:', error);
      setIsSaving(false);
      alert('Error creating profile');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#211119] text-white">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-[#e8308c] border-t-transparent rounded-full animate-spin"></div>
          <p className="font-bold tracking-widest uppercase text-xs opacity-50">Opening your heart...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#f8f6f7] dark:bg-[#211119] text-slate-900 dark:text-slate-100 font-display transition-colors duration-500">
      {/* Material Symbols Import */}
      <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
      <link href="https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@100;300;400;500;700;900&display=swap" rel="stylesheet" />

      <style jsx global>{`
        body { font-family: 'Be Vietnam Pro', sans-serif; }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #472436; border-radius: 10px; }
      `}</style>

      <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden">
        <div className="layout-container flex h-full grow flex-col">
          {/* Navigation Header */}
          <header className="flex items-center justify-between border-b border-solid border-slate-200 dark:border-[#e8308c]/20 px-6 md:px-20 py-4 bg-[#f8f6f7]/80 dark:bg-[#211119]/80 backdrop-blur-md sticky top-0 z-50">
            <div className="flex items-center gap-3">
              <div className="size-8 text-[#e8308c]">
                <svg fill="currentColor" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                  <path d="M44 11.2727C44 14.0109 39.8386 16.3957 33.69 17.6364C39.8386 18.877 44 21.2618 44 24C44 26.7382 39.8386 29.123 33.69 30.3636C39.8386 31.6043 44 33.9891 44 36.7273C44 40.7439 35.0457 44 24 44C12.9543 44 4 40.7439 4 36.7273C4 33.9891 8.16144 31.6043 14.31 30.3636C8.16144 29.123 4 26.7382 4 24C4 21.2618 8.16144 18.877 14.31 17.6364C8.16144 16.3957 4 14.0109 4 11.2727C4 7.25611 12.9543 4 24 4C35.0457 4 44 7.25611 44 11.2727Z"></path>
                </svg>
              </div>
              <h2 className="text-xl font-bold leading-tight tracking-tight text-slate-900 dark:text-white">Echo</h2>
            </div>
            <div className="flex items-center gap-4">
              <div className="hidden md:flex flex-col items-end mr-2">
                <span className="text-xs font-semibold text-[#e8308c] uppercase tracking-widest">Step 2 of 5</span>
                <div className="w-32 h-1.5 bg-[#e8308c]/20 rounded-full mt-1 overflow-hidden">
                  <div className="bg-[#e8308c] h-full w-2/5 rounded-full"></div>
                </div>
              </div>
              <button className="flex items-center justify-center rounded-full size-10 bg-[#e8308c]/10 text-[#e8308c] hover:bg-[#e8308c]/20 transition-colors">
                <span className="material-symbols-outlined">help</span>
              </button>
            </div>
          </header>

          <main className="flex flex-1 justify-center py-12 px-6">
            <div className="max-w-[800px] w-full flex flex-col gap-10">
              {/* Hero Title Section */}
              <div className="text-center md:text-left">
                <h1 className="text-4xl md:text-5xl font-black leading-tight tracking-tight text-slate-900 dark:text-white">
                  Create Your <span className="text-[#e8308c]">Profile</span>
                </h1>
                <p className="mt-3 text-slate-600 dark:text-[#e8308c]/60 text-lg max-w-lg">
                  Set the foundation for your private connection. Authenticity is the bridge to intimacy.
                </p>
              </div>

              {/* Profile Form Card */}
              <div className="bg-white dark:bg-[#e8308c]/5 border border-slate-200 dark:border-[#e8308c]/20 rounded-xl p-8 md:p-12 shadow-2xl shadow-[#e8308c]/5">
                <form onSubmit={handleSaveProfile} className="flex flex-col gap-10">

                  {/* Profile Photo Section */}
                  <div className="flex flex-col md:flex-row items-center gap-8">
                    <div className="relative group">
                      <div className="size-36 rounded-full border-4 border-[#e8308c] p-1 bg-[#f8f6f7] dark:bg-[#211119] overflow-hidden">
                        <div
                          className="w-full h-full rounded-full bg-cover bg-center"
                          style={{ backgroundImage: `url(${user.photoURL || 'https://lh3.googleusercontent.com/aida-public/AB6AXuAPJ3JSPuUfXA1RkNO8ZO6LY6RcgRdww3d2jEmdXMyKPOt9OeJjYWyg3nkeGh8xxuG_7vgwzDVRuWScVCCbkm2gyqtVBWTRCn9Ed2Af_5bs9WaIXe5FhzwdPfpEUlu_XauHKrs5xUDGODNdmtglyBL58k0wW_MSDB2iBDlLpOr9N-8Ob_s9pOet5QqaD1hAzzcEEXURpilFShbtaRqhnHicP-PHPSPII3jeyskb0rvIug6xocvN-mUdnLx_PfkWDxwEIwe5-WIyN6Xn'})` }}
                        ></div>
                      </div>
                      <button className="absolute bottom-1 right-1 size-10 bg-[#e8308c] text-white rounded-full flex items-center justify-center shadow-lg hover:scale-105 transition-transform" type="button">
                        <span className="material-symbols-outlined">photo_camera</span>
                      </button>
                    </div>
                    <div className="flex flex-col items-center md:items-start text-center md:text-left">
                      <h3 className="text-xl font-bold dark:text-white">Profile Photo</h3>
                      <p className="text-slate-500 dark:text-[#e8308c]/60">Upload a photo that represents you.</p>
                      <p className="text-xs text-slate-400 dark:text-[#e8308c]/40 mt-1 uppercase font-bold tracking-tighter">JPG, PNG or HEIC — Max 5MB</p>
                    </div>
                  </div>

                  <hr className="border-slate-100 dark:border-[#e8308c]/10" />

                  {/* Personal Details Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex flex-col gap-2 md:col-span-2">
                      <label className="text-sm font-bold uppercase tracking-widest text-[#e8308c] ml-1">Display Name</label>
                      <input
                        className="w-full px-6 py-4 rounded-full border border-slate-200 dark:border-[#e8308c]/30 bg-slate-50 dark:bg-[#211119]/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#e8308c] focus:border-transparent transition-all outline-none text-lg"
                        placeholder="How should we call you?"
                        type="text"
                        required
                        value={profile.displayName}
                        onChange={(e) => setProfile({ ...profile, displayName: e.target.value })}
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-bold uppercase tracking-widest text-[#e8308c] ml-1">Age</label>
                      <input
                        className="w-full px-6 py-4 rounded-full border border-slate-200 dark:border-[#e8308c]/30 bg-slate-50 dark:bg-[#211119]/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#e8308c] focus:border-transparent transition-all outline-none text-lg"
                        placeholder="e.g. 28"
                        type="number"
                        value={profile.age}
                        onChange={(e) => setProfile({ ...profile, age: e.target.value })}
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-bold uppercase tracking-widest text-[#e8308c] ml-1">Height</label>
                      <input
                        className="w-full px-6 py-4 rounded-full border border-slate-200 dark:border-[#e8308c]/30 bg-slate-50 dark:bg-[#211119]/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#e8308c] focus:border-transparent transition-all outline-none text-lg"
                        placeholder="e.g. 511"
                        type="text"
                        value={profile.height}
                        onChange={(e) => setProfile({ ...profile, height: e.target.value })}
                      />
                    </div>
                  </div>

                  {/* Profile Letter Section */}
                  <div className="flex flex-col gap-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                      <label className="text-sm font-bold uppercase tracking-widest text-[#e8308c] ml-1 flex items-center gap-2">
                        <span className="material-symbols-outlined text-lg">favorite</span>
                        The Profile Letter
                      </label>
                      <span className="text-xs text-slate-400 font-medium">Mandatory Section</span>
                    </div>
                    <div className="relative group">
                      <div className="absolute -inset-0.5 bg-gradient-to-r from-[#e8308c]/30 to-purple-500/30 rounded-xl blur opacity-30 group-focus-within:opacity-60 transition duration-1000"></div>
                      <div className="relative">
                        <textarea
                          className="custom-scrollbar w-full p-6 rounded-xl border border-slate-200 dark:border-[#e8308c]/30 bg-white dark:bg-[#211119]/80 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#e8308c] focus:border-transparent transition-all outline-none text-lg resize-none leading-relaxed"
                          placeholder="Express your intentions, values, and feelings. This is the first thing your future partner will truly feel about you..."
                          rows={6}
                          required
                          value={profile.bio}
                          onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                        ></textarea>
                      </div>
                    </div>
                    <p className="text-sm text-slate-500 dark:text-[#e8308c]/50 italic px-2">
                      Tip: Write from the heart. Echo is about commitment, not swiping.
                    </p>
                  </div>

                  {/* Footer Actions */}
                  <div className="flex flex-col gap-6 pt-4">
                    <button
                      className="w-full bg-[#e8308c] hover:bg-[#e8308c]/90 text-white font-bold py-5 rounded-full text-xl shadow-lg shadow-[#e8308c]/20 transition-all flex items-center justify-center gap-3 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                      type="submit"
                      disabled={isSaving}
                    >
                      {isSaving ? 'Connecting...' : 'Begin My Journey'}
                      <span className="material-symbols-outlined">arrow_forward</span>
                    </button>
                    <div className="flex items-center justify-center gap-2 text-slate-400 dark:text-[#e8308c]/40 text-xs">
                      <span className="material-symbols-outlined text-sm">lock</span>
                      <span>Your profile is only visible to people you choose to lock with.</span>
                    </div>
                  </div>
                </form>
              </div>

              {/* Subtle Pagination Dots */}
              <div className="flex justify-center gap-2 pb-12">
                <div className="size-2 rounded-full bg-[#e8308c]/20"></div>
                <div className="size-2 rounded-full bg-[#e8308c]"></div>
                <div className="size-2 rounded-full bg-[#e8308c]/20"></div>
                <div className="size-2 rounded-full bg-[#e8308c]/20"></div>
                <div className="size-2 rounded-full bg-[#e8308c]/20"></div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
