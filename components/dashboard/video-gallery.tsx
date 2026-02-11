'use client';

import { useState } from 'react';
import { PlayCircle } from 'lucide-react';

interface Video {
  id: string;
  videoId: string;
  title: string;
  url: string;
  addedAt: Date;
}

interface VideoGalleryProps {
  videos: Video[];
  onVideoSelect?: (videoId: string, title: string) => void;
  onAddVideo?: (video: Video) => void;
  onRemoveVideo?: (id: string) => void;
}

export function VideoGallery({ videos, onVideoSelect, onAddVideo, onRemoveVideo }: VideoGalleryProps) {
  const [urlInput, setUrlInput] = useState('');
  const [titleInput, setTitleInput] = useState('');
  const [error, setError] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const extractVideoId = (url: string): string | null => {
    try {
      if (url.includes('youtu.be/')) {
        const match = url.match(/youtu\.be\/([^?&]+)/);
        return match ? match[1] : null;
      }
      if (url.includes('youtube.com')) {
        const match = url.match(/v=([^&]+)/);
        return match ? match[1] : null;
      }
      return null;
    } catch {
      return null;
    }
  };

  const handleAddVideo = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!urlInput.trim()) {
      setError('Please enter a YouTube URL');
      return;
    }

    if (!titleInput.trim()) {
      setError('Please enter a title');
      return;
    }

    const videoId = extractVideoId(urlInput);
    if (!videoId) {
      setError('Invalid YouTube URL. Please use youtu.be or youtube.com links');
      return;
    }

    const newVideo: Video = {
      id: Date.now().toString(),
      videoId,
      title: titleInput,
      url: urlInput,
      addedAt: new Date(),
    };

    onAddVideo?.(newVideo);
    setUrlInput('');
    setTitleInput('');
    setIsAdding(false);
  };

  return (
    <div className="glass-panel rounded-2xl p-6 flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <PlayCircle className="text-accent-pink w-5 h-5 fill-accent-pink/20" />
          <h4 className="text-[10px] font-black tracking-widest text-white/40 uppercase">My Core</h4>
        </div>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="text-xs bg-accent-pink/20 hover:bg-accent-pink/30 text-accent-pink px-3 py-1 rounded-lg transition-colors"
        >
          {isAdding ? 'Cancel' : '+ Add Video'}
        </button>
      </div>

      {/* Add Video Form */}
      {isAdding && (
        <form onSubmit={handleAddVideo} className="mb-4 p-4 bg-white/5 rounded-xl border border-white/10 space-y-3">
          <div>
            <label className="block text-[9px] text-white/60 uppercase tracking-wider mb-2">Video Title</label>
            <input
              type="text"
              value={titleInput}
              onChange={(e) => setTitleInput(e.target.value)}
              placeholder="e.g., Our Love Story"
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-white/40 focus:outline-none focus:border-accent-pink"
            />
          </div>
          <div>
            <label className="block text-[9px] text-white/60 uppercase tracking-wider mb-2">YouTube URL</label>
            <input
              type="text"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="https://youtu.be/... or https://youtube.com/watch?v=..."
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-white/40 focus:outline-none focus:border-accent-pink"
            />
          </div>
          {error && <p className="text-[9px] text-red-400">{error}</p>}
          <button
            type="submit"
            className="w-full bg-accent-pink hover:bg-accent-pink/90 text-white text-[10px] font-bold py-2 rounded-lg transition-colors"
          >
            Add Video
          </button>
        </form>
      )}

      {/* Videos Grid */}
      <div className="flex-1 overflow-y-auto pr-1">
        {videos.length === 0 ? (
          <div className="flex items-center justify-center h-32 text-center">
            <p className="text-[10px] text-white/40">No videos yet. Add your first video to get started!</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {videos.map((video) => (
              <div
                key={video.id}
                className="group relative bg-black/40 rounded-lg overflow-hidden border border-white/10 hover:border-accent-pink/40 transition-all"
              >
                {/* Video Thumbnail - Click to Play */}
                <button
                  onClick={() => onVideoSelect?.(video.videoId, video.title)}
                  className="relative w-full aspect-video bg-black flex items-center justify-center hover:bg-black/80 transition-colors cursor-pointer"
                  title="Click to play"
                >
                  <img
                    src={`https://img.youtube.com/vi/${video.videoId}/hqdefault.jpg`}
                    alt={video.title}
                    className="w-full h-full object-cover group-hover:opacity-75 transition-opacity"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = `https://img.youtube.com/vi/${video.videoId}/hqdefault.jpg`;
                    }}
                  />

                </button>

                {/* Video Info */}
                <div className="p-2 bg-white/5 border-t border-white/10">
                  <p className="text-[9px] font-semibold text-white truncate">{video.title}</p>
                  <p className="text-[8px] text-white/40 mt-1">
                    {video.addedAt.toLocaleDateString()}
                  </p>
                </div>

                {/* Delete Button */}
                {/* <button
                  onClick={() => onRemoveVideo?.(video.id)}
                  className="absolute top-1 right-1 bg-red-500/80 hover:bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Delete video"
                >
                  <span className="material-symbols-outlined text-sm">close</span>
                </button> */}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
