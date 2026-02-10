'use client';

import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from 'recharts';

interface DualHeartbeatGraphProps {
    data?: { time: string; userBpm: number; partnerBpm: number }[];
    userName?: string;
    partnerName?: string;
    liveUserBpm?: number;
    livePartnerBpm?: number;
}

const generateMockData = () => {
    // Generate initial 60 seconds of data
    const data = [];
    const now = new Date();
    for (let i = 60; i > 0; i--) {
        const time = new Date(now.getTime() - i * 1000);
        data.push({
            time: time.toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }),
            userBpm: 70 + Math.random() * 10,
            partnerBpm: 72 + Math.random() * 10,
        });
    }
    return data;
};

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-black/80 backdrop-blur-md border border-white/10 p-3 rounded-lg shadow-xl">
                <p className="text-white/60 text-xs mb-2 font-mono">{label}</p>
                {payload.map((entry: any, index: number) => (
                    <div key={index} className="flex items-center gap-2 text-xs font-bold mb-1 last:mb-0">
                        <div
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: entry.stroke }}
                        />
                        <span className="text-white/80">{entry.name}:</span>
                        <span className="text-white">{entry.value} BPM</span>
                    </div>
                ))}
            </div>
        );
    }
    return null;
};

import { useState, useEffect } from 'react';

export function DualHeartbeatGraph({
    userName = 'You',
    partnerName = 'Partner',
    liveUserBpm,
    livePartnerBpm
}: DualHeartbeatGraphProps) {
    const [data, setData] = useState<{ time: string; userBpm: number; partnerBpm: number }[]>([]);

    // Initialize with some history
    useEffect(() => {
        setData(generateMockData());
    }, []);

    // Update with live data
    useEffect(() => {
        if (liveUserBpm === undefined || livePartnerBpm === undefined) return;

        setData(prevData => {
            const now = new Date();
            const newPoint = {
                time: now.toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }),
                userBpm: liveUserBpm,
                partnerBpm: livePartnerBpm
            };
            // Keep last 60 points (approx 1 minute window if updating every second)
            return [...prevData.slice(-60), newPoint];
        });
    }, [liveUserBpm, livePartnerBpm]);

    return (
        <div className="w-full h-full min-h-[400px] flex flex-col">
            <div className="flex items-center justify-between mb-4 px-2">
                <div className="flex gap-4">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.6)]"></div>
                        <span className="text-xs text-white/60 font-medium uppercase tracking-wider">{userName}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-accent-pink shadow-[0_0_8px_rgba(255,105,180,0.6)]"></div>
                        <span className="text-xs text-white/60 font-medium uppercase tracking-wider">{partnerName}</span>
                    </div>
                </div>
                <div className="text-[10px] text-white/30 uppercase tracking-widest font-mono">
                    Live
                </div>
            </div>

            <div className="flex-1 w-full relative">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                        data={data}
                        margin={{
                            top: 10,
                            right: 10,
                            left: -20,
                            bottom: 0,
                        }}
                    >
                        <defs>
                            <linearGradient id="colorUser" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#22d3ee" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="colorPartner" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#ff69b4" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#ff69b4" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                        <XAxis
                            dataKey="time"
                            stroke="rgba(255,255,255,0.2)"
                            tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }}
                            tickLine={false}
                            axisLine={false}
                            interval={5} // Show label every ~5 seconds
                        />
                        <YAxis
                            stroke="rgba(255,255,255,0.2)"
                            tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }}
                            tickLine={false}
                            axisLine={false}
                            domain={[40, 140]}
                        />
                        <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 1 }} />
                        <Line
                            type="monotone"
                            dataKey="userBpm"
                            name={userName}
                            stroke="#22d3ee"
                            strokeWidth={2}
                            dot={false}
                            activeDot={{ r: 4, fill: '#22d3ee', stroke: '#fff', strokeWidth: 2 }}
                            animationDuration={1500}
                        />
                        <Line
                            type="monotone"
                            dataKey="partnerBpm"
                            name={partnerName}
                            stroke="#ff69b4"
                            strokeWidth={2}
                            dot={false}
                            activeDot={{ r: 4, fill: '#ff69b4', stroke: '#fff', strokeWidth: 2 }}
                            animationDuration={1500}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
