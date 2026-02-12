'use client';

import { useState, useEffect } from 'react';
import { Heart, Edit2 } from 'lucide-react';
import { differenceInYears, differenceInMonths, differenceInDays, differenceInHours, differenceInMinutes, parseISO, isValid } from 'date-fns';

interface TogetherForProps {
    startDate: string | null;
    onUpdateDate?: (date: string) => void;
}

export function TogetherFor({ startDate, onUpdateDate }: TogetherForProps) {
    const [timeLeft, setTimeLeft] = useState({
        years: 0,
        months: 0,
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0
    });
    const [isEditing, setIsEditing] = useState(false);
    const [newDate, setNewDate] = useState(startDate || '');

    useEffect(() => {
        if (startDate) {
            setNewDate(startDate);
        }
    }, [startDate]);

    useEffect(() => {
        if (!startDate) return;

        const calculateTime = () => {
            const now = new Date();
            const start = parseISO(startDate);

            if (!isValid(start)) return;

            let years = differenceInYears(now, start);
            let months = differenceInMonths(now, start) % 12;

            const tempDate = new Date(start);
            tempDate.setFullYear(start.getFullYear() + years);
            tempDate.setMonth(start.getMonth() + months);

            let days = differenceInDays(now, tempDate);
            tempDate.setDate(tempDate.getDate() + days);

            let hours = differenceInHours(now, tempDate);
            tempDate.setHours(tempDate.getHours() + hours);

            let minutes = differenceInMinutes(now, tempDate);
            tempDate.setMinutes(tempDate.getMinutes() + minutes);

            let seconds = Math.floor((now.getTime() - tempDate.getTime()) / 1000);

            setTimeLeft({ years, months, days, hours, minutes, seconds });
        };

        calculateTime();
        const interval = setInterval(calculateTime, 1000);
        return () => clearInterval(interval);
    }, [startDate]);

    if (!startDate) {
        return (
            <div className="glass-panel relative rounded-2xl py-3 px-6 flex items-center justify-between border-accent-pink/20">
                <div className="flex items-center gap-3">
                    <Heart className="w-4 h-4 text-accent-pink animate-pulse" />
                    <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Awaiting Anniversary...</p>
                </div>
                <button
                    onClick={() => setIsEditing(true)}
                    className="text-[9px] font-bold uppercase tracking-widest text-accent-pink hover:text-white transition-colors"
                >
                    Set Date
                </button>
                {isEditing && (
                    <div className="absolute inset-0 bg-black/95 rounded-2xl flex items-center justify-center px-4 z-50">
                        <input type="date" value={newDate} onChange={e => setNewDate(e.target.value)} className="bg-transparent text-white text-xs border-b border-white/20 outline-none p-1" />
                        <div className="flex gap-2 ml-4">
                            <button onClick={() => setIsEditing(false)} className="text-[8px] text-white/40">Cancel</button>
                            <button onClick={() => { if (newDate) onUpdateDate?.(newDate); setIsEditing(false); }} className="text-[8px] text-accent-pink">Save</button>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    const TimeBlock = ({ value, label }: { value: number; label: string }) => (
        <div className="flex items-baseline gap-1 group/unit">
            <span className="text-xl md:text-2xl font-black text-white tracking-tighter tabular-nums">
                {value}
            </span>
            <span className="text-[7px] font-bold uppercase tracking-widest text-white/20">
                {label[0]}
            </span>
        </div>
    );

    return (
        <div className="relative group w-full">
            <div className="glass-panel-heavy rounded-2xl border border-white/5 bg-black/60 backdrop-blur-3xl p-1 relative z-10">
                <div className="py-2.5 px-6 flex items-center justify-between relative">
                    <div className="flex items-center gap-2 w-24">
                        <div className="h-1 w-1 bg-accent-pink rounded-full shadow-[0_0_5px_rgba(232,48,140,0.5)]" />
                        <h2 className="text-[8px] font-black tracking-[0.3em] text-white/30 uppercase">TOGETHER</h2>
                    </div>

                    <div className="flex items-center gap-4 md:gap-6">
                        <TimeBlock value={timeLeft.years} label="years" />
                        <TimeBlock value={timeLeft.months} label="months" />
                        <TimeBlock value={timeLeft.days} label="days" />
                        <TimeBlock value={timeLeft.hours} label="hours" />
                        <TimeBlock value={timeLeft.minutes} label="minutes" />
                        <div className="flex items-baseline gap-0.5 min-w-[32px]">
                            <span className="text-xl md:text-2xl font-black text-accent-pink tracking-tighter tabular-nums">
                                {timeLeft.seconds}
                            </span>
                            <span className="text-[7px] font-bold uppercase tracking-widest text-accent-pink/40">S</span>
                        </div>
                    </div>

                    <div className="w-24 flex justify-end">
                        <button
                            onClick={() => setIsEditing(!isEditing)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-white/5 rounded-lg border border-white/5 shrink-0"
                        >
                            <Edit2 className="w-3 h-3 text-white/20" />
                        </button>
                    </div>

                    {isEditing && (
                        <div className="absolute inset-0 bg-black/95 rounded-2xl flex items-center justify-center px-6 z-50 animate-in fade-in duration-200">
                            <div className="flex items-center gap-3 w-full max-w-sm">
                                <input
                                    type="date"
                                    className="bg-white/5 border border-white/10 rounded-xl px-4 py-1 text-xs text-white outline-none focus:border-accent-pink flex-1"
                                    value={newDate}
                                    onChange={(e) => setNewDate(e.target.value)}
                                />
                                <button onClick={() => setIsEditing(false)} className="text-[9px] font-bold text-white/30">CANCEL</button>
                                <button
                                    onClick={() => { if (newDate) { onUpdateDate?.(newDate); setIsEditing(false); } }}
                                    className="px-4 py-1 bg-accent-pink text-white rounded-xl font-bold text-[9px]"
                                >
                                    SAVE
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
