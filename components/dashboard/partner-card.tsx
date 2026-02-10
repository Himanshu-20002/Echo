'use client';

import { Heart } from 'lucide-react';

interface PartnerData {
    name: string;
    status: string;
    bpm: number;
    connectionStrength: number;
    intimacyLevel: number;
    lastMessage?: string;
    isOnline: boolean;
    avatar?: string;
}

interface PartnerCardProps {
    partnerData: PartnerData | null;
    onSendLoveBite: () => void;
}

export function PartnerCard({ partnerData, onSendLoveBite }: PartnerCardProps) {
    return (
        <div className="glass-panel rounded-2xl p-6 flex flex-col items-center text-center">
            <div className="relative w-20 h-20 mb-4">
                <div className="absolute inset-0 bg-accent-pink/20 rounded-full scale-110 blur-md"></div>
                <img
                    alt="Partner"
                    className="w-full h-full rounded-full object-cover border-2 border-accent-pink/50 relative z-10"
                    src={partnerData?.avatar || 'https://via.placeholder.com/80'}
                />
                {partnerData?.isOnline && (
                    <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 rounded-full border-2 border-surface-dark z-20"></div>
                )}
            </div>
            <h3 className="text-xl font-bold">{partnerData?.name}</h3>
            <p className="text-[10px] text-white/40 mt-1 mb-6 italic truncate w-full">
                {partnerData?.lastMessage || 'Connected...'}
            </p>
            <div className="w-full space-y-3 text-left">
                <div className="space-y-1">
                    <div className="flex justify-between text-[8px] font-bold uppercase tracking-widest">
                        <span className="text-red-400">Connection</span>
                        <span>{partnerData?.connectionStrength || 0}%</span>
                    </div>
                    <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-accent-pink"
                            style={{ width: `${partnerData?.connectionStrength || 0}%` }}
                        ></div>
                    </div>
                </div>
                <div className="space-y-1">
                    <div className="flex justify-between text-[8px] font-bold uppercase tracking-widest">
                        <span className="text-purple-400">Intimacy</span>
                        <span>{partnerData?.intimacyLevel || 0}%</span>
                    </div>
                    <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-purple-500"
                            style={{ width: `${partnerData?.intimacyLevel || 0}%` }}
                        ></div>
                    </div>
                </div>
            </div>
            <button
                onClick={onSendLoveBite}
                className="mt-6 w-full py-2 bg-accent-pink/10 border border-accent-pink/30 rounded-lg text-accent-pink text-xs font-bold uppercase tracking-widest hover:bg-accent-pink hover:text-white transition-all shadow-[0_0_15px_rgba(236,72,153,0.1)] hover:shadow-[0_0_20px_rgba(236,72,153,0.4)] flex items-center justify-center gap-2 group"
            >
                <Heart className="w-3 h-3 group-hover:fill-current group-hover:scale-125 transition-transform" />
                Send Love Bite
            </button>
        </div>
    );
}
