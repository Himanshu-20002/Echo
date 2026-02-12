'use client';

import { useState, useRef, useEffect } from 'react';
import { HeartbeatDisplay } from './heartbeat-display';
import { DualHeartbeatGraph } from './dual-heartbeat-graph';
import { ChatInterface } from './chat-interface';
import { DinoGame } from './dino-game';
import {
    Activity,
    Video,
    MessageSquare,
    Maximize2,
    Minimize2,
    RefreshCw, // For Sync
    Wifi,
    WifiOff,
    Mic,
    MicOff,
    Phone,
    Settings,
    Layout,
    Music,
    Gamepad
} from 'lucide-react';

interface MainDisplayProps {
    videoId?: string;
    videoTitle?: string;
    partnerName?: string;
    partnerBpm?: number;
    videos?: { videoId: string; title?: string; id?: string }[];
    onPlayVideo?: (videoId: string, title?: string) => void;
    userBpm?: number;
    userName?: string;
    partnerId?: string;
}

export type ViewMode = 'graph' | 'video' | 'chat' | 'games';

interface MainDisplayProps {
    videoId?: string;
    videoTitle?: string;
    partnerName?: string;
    partnerBpm?: number;
    videos?: { videoId: string; title?: string; id?: string }[];
    onPlayVideo?: (videoId: string, title?: string) => void;
    userBpm?: number;
    userName?: string;
    partnerId?: string;
    viewMode?: ViewMode;
    onViewModeChange?: (mode: ViewMode) => void;
}

export function MainDisplay({
    videoId = 'ch8pwy-V1E8',
    videoTitle = 'Our Song',
    partnerName = 'Your Partner',
    partnerBpm = 72,
    videos,
    onPlayVideo,
    userBpm = 68,
    userName = 'You',
    partnerId,
    viewMode: externalViewMode,
    onViewModeChange,
}: MainDisplayProps) {
    const [internalViewMode, setInternalViewMode] = useState<ViewMode>('graph');

    // Use external view mode if provided, otherwise internal
    const viewMode = externalViewMode || internalViewMode;

    const handleViewModeChange = (mode: ViewMode) => {
        if (onViewModeChange) {
            onViewModeChange(mode);
        } else {
            setInternalViewMode(mode);
        }
    };

    const [isFullscreen, setIsFullscreen] = useState(false);
    const [isSynced, setIsSynced] = useState(true);
    const [isMicOn, setIsMicOn] = useState(false); // UI toggle

    // Video player logic
    const containerRef = useRef<HTMLDivElement | null>(null);
    const ytPlayerRef = useRef<any>(null);

    // Load YouTube IFrame API
    useEffect(() => {
        // Only initialize player if we are in video mode
        if (viewMode !== 'video') return;

        let mounted = true;

        const loadAPI = () =>
            new Promise<any>((resolve) => {
                if (typeof window === 'undefined') return resolve(null);
                if ((window as any).YT && (window as any).YT.Player) return resolve((window as any).YT);
                const tag = document.createElement('script');
                tag.src = 'https://www.youtube.com/iframe_api';
                document.body.appendChild(tag);
                (window as any).onYouTubeIframeAPIReady = () => resolve((window as any).YT);
            });

        loadAPI().then((YT) => {
            if (!mounted || !YT) return;

            const createOrUpdate = () => {
                if (!containerRef.current) return;

                if (ytPlayerRef.current && ytPlayerRef.current.loadVideoById) {
                    try {
                        ytPlayerRef.current.loadVideoById(videoId);
                    } catch (e) {
                        // ignore
                    }
                    return;
                }

                ytPlayerRef.current = new YT.Player(containerRef.current, {
                    width: '100%',
                    height: '100%',
                    videoId,
                    playerVars: {
                        autoplay: 1,
                        controls: 1,
                        modestbranding: 1,
                        rel: 0,
                        playsinline: 1,
                        origin: typeof window !== 'undefined' ? window.location.origin : undefined,
                        enablejsapi: 1,
                    },
                    events: {
                        onStateChange: (e: any) => {
                            const YT = (window as any).YT;
                            if (!YT) return;
                            if (e.data === YT.PlayerState.ENDED) {
                                try {
                                    if (!videos || videos.length === 0) return;
                                    const idx = videos.findIndex((v) => v.videoId === videoId);
                                    const next = videos[(idx + 1) % videos.length];
                                    if (next) {
                                        onPlayVideo?.(next.videoId, next.title);
                                        ytPlayerRef.current.loadVideoById(next.videoId);
                                    }
                                } catch (err) { }
                            }
                        },
                    },
                });
            };

            createOrUpdate();
        });

        return () => {
            mounted = false;
            if (ytPlayerRef.current && ytPlayerRef.current.destroy) {
                try {
                    ytPlayerRef.current.destroy();
                } catch { }
                ytPlayerRef.current = null;
            }
        };
    }, [videoId, viewMode]);

    return (
        <div
            className={`glass-panel rounded-2xl border neon-border overflow-hidden transition-all duration-500 flex flex-col ${isFullscreen
                ? 'fixed inset-0 z-50 rounded-none'
                : 'min-h-[500px] h-[75svh] sm:h-[650px] lg:h-[750px] mb-8 relative'
                }`}
        >
            {/* SHARED SPACE HEADER */}
            <div className="bg-gradient-to-r from-accent-pink/10 via-transparent to-transparent border-b border-white/10 px-4 py-3 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                    <div className="flex gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-full bg-red-500/80 shadow-red-500/50 shadow-sm"></div>
                        <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80 shadow-yellow-500/50 shadow-sm"></div>
                        <div className="w-2.5 h-2.5 rounded-full bg-green-500/80 shadow-green-500/50 shadow-sm"></div>
                    </div>
                    <div className="h-4 w-px bg-white/10 mx-1"></div>
                    <span className="text-xs font-bold text-white/80 uppercase tracking-widest flex items-center gap-2">
                        <Layout className="w-3 h-3 text-accent-pink" />
                        Shared Space
                    </span>
                </div>

                {/* Right: Sync & Window Controls */}
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setIsSynced(!isSynced)}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-[10px] font-bold transition-all ${isSynced
                            ? 'border-green-500/30 bg-green-500/10 text-green-400'
                            : 'border-white/10 bg-white/5 text-white/40'
                            }`}
                    >
                        {isSynced ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
                        <span className="hidden sm:inline">{isSynced ? 'Live Sync' : 'Offline'}</span>
                    </button>

                    <div className="w-px h-4 bg-white/10" />

                    <button
                        onClick={() => setIsFullscreen(!isFullscreen)}
                        className="p-2 text-white/40 hover:text-white transition-colors"
                        title="Toggle Fullscreen"
                    >
                        {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                    </button>
                </div>
            </div>

            {/* NAVIGATION TABS */}
            <div className="px-4 pt-2 shrink-0">
                <div className="flex p-1 bg-black/20 border border-white/5 rounded-xl w-full overflow-x-auto scrollbar-hide gap-1">
                    <button
                        onClick={() => handleViewModeChange('graph')}
                        className={`flex-1 sm:flex-none px-3 sm:px-4 py-2 rounded-lg text-[9px] sm:text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 min-w-fit ${viewMode === 'graph'
                            ? 'bg-white/10 text-white shadow-lg border border-white/10'
                            : 'text-white/40 hover:text-white hover:bg-white/5'
                            }`}
                    >
                        <Activity className="w-3.5 h-3.5" />
                        Heartbeat
                    </button>
                    <button
                        onClick={() => handleViewModeChange('video')}
                        className={`flex-1 sm:flex-none px-3 sm:px-4 py-2 rounded-lg text-[9px] sm:text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 min-w-fit ${viewMode === 'video'
                            ? 'bg-white/10 text-white shadow-lg border border-white/10'
                            : 'text-white/40 hover:text-white hover:bg-white/5'
                            }`}
                    >
                        <Music className="w-3.5 h-3.5" />
                        Video Room
                    </button>
                    <button
                        onClick={() => handleViewModeChange('chat')}
                        className={`flex-1 sm:flex-none px-3 sm:px-4 py-2 rounded-lg text-[9px] sm:text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 min-w-fit ${viewMode === 'chat'
                            ? 'bg-white/10 text-white shadow-lg border border-white/10'
                            : 'text-white/40 hover:text-white hover:bg-white/5'
                            }`}
                    >
                        <MessageSquare className="w-3.5 h-3.5" />
                        Live Chat
                    </button>
                    <button
                        onClick={() => handleViewModeChange('games')}
                        className={`flex-1 sm:flex-none px-3 sm:px-4 py-2 rounded-lg text-[9px] sm:text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 min-w-fit ${viewMode === 'games'
                            ? 'bg-white/10 text-white shadow-lg border border-white/10'
                            : 'text-white/40 hover:text-white hover:bg-white/5'
                            }`}
                    >
                        <Gamepad className="w-3.5 h-3.5" />
                        Games
                    </button>
                </div>
            </div>

            {/* MAIN CONTENT AREA */}
            <div className="flex-1 overflow-hidden relative p-4">

                {/* GRAPH VIEW */}
                <div className={`absolute inset-4 transition-all duration-500 flex flex-col ${viewMode === 'graph' ? 'opacity-100 z-10 translate-y-0' : 'opacity-0 z-0 translate-y-4 pointer-events-none'}`}>
                    <div className="flex-1 bg-black/20 border border-white/5 rounded-xl overflow-hidden backdrop-blur-sm p-1">
                        <DualHeartbeatGraph
                            userName={userName}
                            partnerName={partnerName}
                            liveUserBpm={userBpm}
                            livePartnerBpm={partnerBpm}
                        />
                    </div>
                </div>

                {/* VIDEO VIEW */}
                <div className={`absolute inset-4 transition-all duration-500 flex gap-4 ${viewMode === 'video' ? 'opacity-100 z-10 translate-y-0' : 'opacity-0 z-0 translate-y-4 pointer-events-none'}`}>
                    {/* Main Video Player Area - Centered and Constrained */}
                    <div className="flex-1 flex items-center justify-center h-full relative group">
                        {/* Constrained Player - Enforces 16:9 and fits within available space */}
                        <div className="w-[92%] sm:w-[85%] lg:w-auto lg:h-[85%] aspect-video max-w-full max-h-full bg-black rounded-xl overflow-hidden border border-white/10 shadow-2xl relative">
                            {videoId ? (
                                <div className="w-full h-full relative">
                                    <div ref={containerRef} className="absolute inset-0 w-full h-full" />
                                </div>
                            ) : (
                                <div className="flex items-center justify-center h-full text-white/30 bg-black/50">
                                    <div className="text-center">
                                        <Video className="w-12 h-12 mx-auto mb-4 opacity-20" />
                                        <p>Select a video to start watching together</p>
                                    </div>
                                </div>
                            )}

                            {/* Overlay Controls */}
                            <div className="absolute top-4 left-4 right-4 flex justify-between items-start opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                                <div className="bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10 pointer-events-auto">
                                    <p className="text-xs font-bold text-white shadow-black drop-shadow-md">{videoTitle}</p>
                                </div>

                                <button
                                    onClick={() => setIsMicOn(!isMicOn)}
                                    className={`pointer-events-auto p-2.5 rounded-full backdrop-blur-md border transition-colors ${isMicOn
                                        ? 'bg-green-500/20 border-green-500/50 text-green-400'
                                        : 'bg-black/60 border-white/10 text-white/60 hover:text-white'
                                        }`}
                                >
                                    {isMicOn ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar Stats (Hidden on mobile) */}
                    <div className="hidden lg:flex w-64 flex-col gap-4 shrink-0">
                        <div className="bg-white/5 border border-white/5 rounded-xl p-4 flex-1 flex flex-col justify-center items-center text-center">
                            <div className="w-16 h-16 rounded-full bg-accent-pink/10 flex items-center justify-center mb-4 animate-pulse">
                                <div className="w-12 h-12 rounded-full bg-accent-pink/20 flex items-center justify-center">
                                    <Activity className="w-6 h-6 text-accent-pink" />
                                </div>
                            </div>
                            <p className="text-2xl font-black text-white mb-1">{partnerBpm}</p>
                            <p className="text-[10px] uppercase tracking-widest text-white/40">{partnerName}'s Heartbeat</p>
                        </div>
                        <div className="bg-white/5 border border-white/5 rounded-xl p-4 h-1/3 flex flex-col justify-center">
                            <p className="text-[10px] text-white/40 uppercase tracking-widest mb-2">Sync Status</p>
                            <div className="flex items-center gap-2 text-green-400 text-xs font-bold">
                                <Wifi className="w-4 h-4" />
                                Connection Stable
                            </div>
                        </div>
                    </div>
                </div>

                {/* CHAT VIEW */}
                <div className={`absolute inset-4 transition-all duration-500 flex flex-col ${viewMode === 'chat' ? 'opacity-100 z-10 translate-y-0' : 'opacity-0 z-0 translate-y-4 pointer-events-none'}`}>
                    <ChatInterface partnerId={partnerId} />
                </div>

                {/* GAMES VIEW */}
                <div className={`absolute inset-4 transition-all duration-500 flex flex-col ${viewMode === 'games' ? 'opacity-100 z-10 translate-y-0' : 'opacity-0 z-0 translate-y-4 pointer-events-none'}`}>
                    <div className="flex-1 bg-black/20 border border-white/5 rounded-xl overflow-hidden backdrop-blur-sm p-1">
                        <DinoGame />
                    </div>
                </div>
            </div>

            {/* Bottom Status Bar */}
            <div className="bg-black/40 border-t border-white/10 px-6 py-3 shrink-0 flex items-center justify-between">


                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-3">
                        <div className="text-right  sm:block">
                            <div className="text-[8px] uppercase text-white/30 tracking-wider">You</div>
                            <div className="text-sm font-bold text-cyan-400 tabular-nums">{userBpm}</div>
                        </div>
                        <div className="h-8 w-px bg-white/10  sm:block" />
                        <div className="text-right  sm:block">
                            <div className="text-[8px] uppercase text-white/30 tracking-wider font-mono">{partnerName}</div>
                            <div className="text-sm font-bold text-accent-pink tabular-nums">{partnerBpm}</div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 pl-4 border-l border-white/10">
                        <div className={`w-2 h-2 rounded-full ${isSynced ? 'bg-green-500 animate-pulse' : 'bg-red-500'} shadow-[0_0_8px_currentColor]`} />
                        <span className="text-[9px] text-white/40 uppercase tracking-widest hidden sm:inline">
                            Live
                        </span>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="flex flex-col">
                            <span className="text-[10px] uppercase tracking-widest font-bold text-accent-pink">
                                Calm & Steady
                            </span>
                            <span className="text-[9px] text-white/40 font-medium">
                                Resting State
                            </span>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
