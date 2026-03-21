"use client";

import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
    BarChart, Bar, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import {
    Activity, Loader2, ChevronRight,
    Users, UserCheck, UserX, CalendarOff,
    Clock, TrendingUp, CalendarDays, MapPin, AlertCircle, CheckCircle2,
    ArrowRightLeft,
    Timer
} from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

// --- Animations ---
const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.2 } }
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 100 } }
};

// --- Exact StatCard from your reference ---
const StatCard = ({
    title, value, icon: Icon,
    description, bgColor, iconColor, borderColor, link
}: any) => {
    return (
        <motion.div
            variants={itemVariants}
            className={cn(
                "group relative overflow-hidden rounded-3xl p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl border border-none",
                bgColor
            )}
        >
            <Link href={link || "#"}>
                <div
                    className="absolute inset-0 opacity-[0.8] pointer-events-none"
                    style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/diamond-upholstery.png")' }}
                />
                <div className="absolute inset-0 bg-gradient-to-br from-white/30 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100 pointer-events-none" />
                <div className="absolute inset-0 rounded-3xl ring-1 ring-inset ring-white/20 pointer-events-none" />

                <div className="relative z-10 flex flex-col h-full">
                    <div className="grid grid-cols-4 items-center justify-start">
                        <div className={cn(
                            `flex h-14 w-14 items-center justify-center rounded-full transition-transform duration-300 shadow-sm shadow-white/70 group-hover:scale-110 group-hover:-rotate-6 backdrop-blur-sm text-white bg-white/80 ${borderColor}`,
                        )}>
                            <Icon className={`h-7 w-7 ${iconColor}`} />
                        </div>
                        <div className="col-span-3 text-xl font-bold uppercase tracking-widest text-white/80 leading-tight">
                            {title}
                        </div>
                    </div>

                    <div className="mt-8">
                        <h3 className="mt-2 text-4xl font-black tracking-tight text-white drop-shadow-md">
                            {value}
                        </h3>
                        {description && (
                            <p className="mt-2 text-sm tracking-tight line-height-tighter font-medium text-white/65">
                                {description}
                            </p>
                        )}
                    </div>
                </div>
            </Link>
        </motion.div>
    );
};

export default function AttendanceExecutiveDashboard() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [currentUser, setCurrentUser] = useState<any>({ name: "Admin" });
    const [page, setPage] = useState(1);

    // MOCK DATA: Stats
    const totalStaff = 245;
    const [stats, setStats] = useState({
        TotalCheckIns: 205,
        OnTime: 160,
        Late: 25,
        OutOfOffice: 20,
        Absent: 15,
        OnLeave: 25,
    });

    // MOCK DATA: Last 7 Days (Day-wise Trend)
    const dayWiseTrendData = [
        { date: 'Mon', OnTime: 170, Late: 15, OOO: 18, Absent: 12, Leave: 30 },
        { date: 'Tue', OnTime: 165, Late: 20, OOO: 20, Absent: 10, Leave: 30 },
        { date: 'Wed', OnTime: 180, Late: 10, OOO: 15, Absent: 5, Leave: 35 },
        { date: 'Thu', OnTime: 175, Late: 12, OOO: 22, Absent: 8, Leave: 28 },
        { date: 'Fri', OnTime: 150, Late: 30, OOO: 25, Absent: 15, Leave: 25 },
        { date: 'Sat', OnTime: 40, Late: 5, OOO: 10, Absent: 180, Leave: 10 },
        { date: 'Sun', OnTime: 160, Late: 25, OOO: 20, Absent: 15, Leave: 25 }, // "Today"
    ];

    // MOCK DATA: All Employees Attendance List
    const [attendanceList, setAttendanceList] = useState<any[]>([]);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            setTimeout(() => {
                setAttendanceList([
                    { ID: 1, EmpName: "Sarah Jenkins", Dept: "Engineering", Status: "On Time", CheckIn: "08:50 AM", CheckOut: "--:--", Type: "Office" },
                    { ID: 2, EmpName: "Michael Chang", Dept: "Design", Status: "Late", CheckIn: "09:45 AM", CheckOut: "--:--", Type: "Office" },
                    { ID: 3, EmpName: "David Kumar", Dept: "Sales", Status: "Out of Office", CheckIn: "09:00 AM", CheckOut: "--:--", Type: "Field" },
                    { ID: 4, EmpName: "Emily Ross", Dept: "HR", Status: "On Leave", CheckIn: "--:--", CheckOut: "--:--", Type: "N/A" },
                    { ID: 5, EmpName: "James Wilson", Dept: "Engineering", Status: "Absent", CheckIn: "--:--", CheckOut: "--:--", Type: "N/A" },
                    { ID: 6, EmpName: "Anita Desai", Dept: "Marketing", Status: "On Time", CheckIn: "08:55 AM", CheckOut: "--:--", Type: "Remote" },
                ]);
                setLoading(false);
            }, 800);
        } catch (error) {
            console.error("Dashboard error:", error);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const greeting = useMemo(() => {
        const hour = new Date().getHours();
        if (hour < 12) return "Good Morning";
        if (hour < 18) return "Good Afternoon";
        return "Good Evening";
    }, []);

    // Pagination Logic for Table
    const itemsPerPage = 4;
    const totalPages = Math.ceil(attendanceList.length / itemsPerPage);
    const paginatedAttendance = attendanceList.slice((page - 1) * itemsPerPage, page * itemsPerPage);

    // Helpers for Table Badges
    const getStatusStyles = (status: string) => {
        switch (status) {
            case "On Time": return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400";
            case "Late": return "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400";
            case "Out of Office": return "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400";
            case "Absent": return "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400";
            case "On Leave": return "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400";
            default: return "bg-gray-100 text-gray-700";
        }
    };

    // Colors for Charts
    const CHART_COLORS = {
        OnTime: '#10b981', // Emerald
        Late: '#f59e0b',   // Amber
        OOO: '#8b5cf6',    // Purple
        Absent: '#ef4444', // Rose
        Leave: '#64748b'   // Slate
    };

    if (loading) {
        return (
            <div className="flex h-[80vh] w-full flex-col items-center justify-center gap-4">
                <div className="relative">
                    <Loader2 className="h-12 w-12 animate-spin text-indigo-600" />
                </div>
                <p className="text-sm font-black uppercase tracking-[0.3em] text-slate-400">Loading Records...</p>
            </div>
        );
    }

    return (
        <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="max-w-[1600px] mx-auto space-y-12 p-4 md:p-10 relative"
        >
            {/* Header Section */}
            <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between relative">
                <div>
                    <div className="flex items-center gap-3 mb-4">
                        <span className="h-px w-8 bg-indigo-600/30" />
                        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-600">Daily Attendance Control</span>
                    </div>
                    <h1 className="text-5xl font-black tracking-tighter text-slate-900 dark:text-white uppercase leading-none">
                        {greeting}, <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-indigo-400 to-indigo-600 animate-gradient-x">{currentUser?.name || "User"}</span>
                    </h1>
                    <p className="mt-4 text-lg font-medium text-slate-500 dark:text-slate-400 flex items-center gap-2">
                        <Activity className="h-4 w-4 text-emerald-500" />
                        Status: <span className="font-bold text-emerald-500 uppercase tracking-widest text-xs">Live Tracking</span> — Managing {totalStaff} personnel records today.
                    </p>
                </div>
            </div>

            {/* 6 Stat Cards Grid */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                <StatCard
                    title="Total Check-ins"
                    value={stats.TotalCheckIns}
                    icon={Users}
                    color="bg-indigo-600"
                    description={`Out of ${totalStaff} total employees`}
                    bgColor="bg-gradient-to-br from-indigo-600 via-indigo-500 to-indigo-800 dark:from-indigo-700 dark:via-indigo-600 dark:to-indigo-950"
                    iconColor="text-indigo-500"
                    borderColor="border-2 border-indigo-400"
                />

                <StatCard
                    title="On-Time Check-in"
                    value={stats.OnTime}
                    icon={CheckCircle2}
                    description="Employees who arrived before grace period"
                    bgColor="bg-gradient-to-br from-emerald-600 via-emerald-500 to-emerald-700 dark:from-emerald-700 dark:via-emerald-600 dark:to-emerald-950"
                    iconColor="text-emerald-500"
                    borderColor="border-2 border-emerald-400"
                />

                <StatCard
                    title="Late Check-ins"
                    value={stats.Late}
                    icon={AlertCircle}
                    description="Employees who missed the cut-off time"
                    bgColor="bg-gradient-to-br from-amber-400 via-orange-500 to-orange-600 dark:from-amber-700 dark:via-orange-600 dark:to-orange-950"
                    iconColor="text-orange-500"
                    borderColor="border-2 border-orange-400"
                />

                <StatCard
                    title="Out of Office"
                    value={stats.OutOfOffice}
                    icon={MapPin}
                    description="Remote, Field Work, or Client Site"
                    bgColor="bg-gradient-to-br from-purple-600 via-purple-500 to-purple-800 dark:from-purple-700 dark:via-purple-600 dark:to-purple-950"
                    iconColor="text-purple-500"
                    borderColor="border-2 border-purple-400"
                />

                <StatCard
                    title="Absent Today"
                    value={stats.Absent}
                    icon={UserX}
                    description="No-shows without prior approval"
                    bgColor="bg-gradient-to-br from-rose-600 via-rose-500 to-red-800 dark:from-rose-700 dark:via-rose-600 dark:to-red-950"
                    iconColor="text-rose-500"
                    borderColor="border-2 border-rose-400"
                />

                <StatCard
                    title="On Leave"
                    value={stats.OnLeave}
                    icon={CalendarOff}
                    description="Approved planned absences"
                    bgColor="bg-gradient-to-br from-cyan-600 via-cyan-500 to-cyan-800 dark:from-cyan-700 dark:via-cyan-600 dark:to-cyan-950"
                    iconColor="text-cyan-500"
                    borderColor="border-2 border-cyan-400"
                />
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                {/* 7-Day Trend (Bar Chart) */}
                <motion.div variants={itemVariants} className="lg:col-span-2 rounded-[3.5rem] border border-slate-200 bg-white p-10 dark:border-slate-800 dark:bg-slate-900 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8">
                        <CalendarDays className="text-slate-100 dark:text-slate-800 h-32 w-32 group-hover:text-indigo-500/10 transition-colors duration-700" />
                    </div>
                    <div className="mb-10 relative z-10">
                        <h3 className="text-2xl font-black uppercase tracking-tight text-slate-900 dark:text-white">7-Day Attendance Trend</h3>
                        <p className="text-sm font-bold text-slate-400 mt-1 uppercase tracking-widest">Day-wise distribution of workforce status</p>
                    </div>
                    <div className="h-[350px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={dayWiseTrendData} margin={{ top: 20, right: 30, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" strokeOpacity={0.5} />
                                <XAxis dataKey="date" tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 'bold' }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 'bold' }} axisLine={false} tickLine={false} />
                                <Tooltip
                                    cursor={{ fill: 'rgba(99, 102, 241, 0.05)' }}
                                    contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '16px', color: '#fff' }}
                                />
                                <Legend wrapperStyle={{ paddingTop: '20px', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase' }} />
                                {/* Stacked bars to show total headcount per day */}
                                <Bar dataKey="OnTime" name="On Time" stackId="a" fill={CHART_COLORS.OnTime} radius={[0, 0, 4, 4]} />
                                <Bar dataKey="Late" name="Late" stackId="a" fill={CHART_COLORS.Late} />
                                <Bar dataKey="OOO" name="Out of Office" stackId="a" fill={CHART_COLORS.OOO} />
                                <Bar dataKey="Leave" name="Leave" stackId="a" fill={CHART_COLORS.Leave} />
                                <Bar dataKey="Absent" name="Absent" stackId="a" fill={CHART_COLORS.Absent} radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>

                {/* Today's Pie Chart */}
                <motion.div variants={itemVariants} className="rounded-[3.5rem] border border-slate-200 bg-white p-10 dark:border-slate-800 dark:bg-slate-900 shadow-sm">
                    <h3 className="text-2xl font-black uppercase tracking-tight text-slate-900 dark:text-white">Today's Ratio</h3>
                    <p className="mb-6 text-sm font-bold text-slate-400 uppercase tracking-widest">Current availability</p>
                    <div className="h-[250px] w-full relative">
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                            <p className="text-4xl font-black text-slate-900 dark:text-white leading-none">{totalStaff}</p>
                            <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mt-1">Total</p>
                        </div>
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={[
                                        { name: 'On Time', value: stats.OnTime, color: CHART_COLORS.OnTime },
                                        { name: 'Late', value: stats.Late, color: CHART_COLORS.Late },
                                        { name: 'Out of Office', value: stats.OutOfOffice, color: CHART_COLORS.OOO },
                                        { name: 'Absent', value: stats.Absent, color: CHART_COLORS.Absent },
                                        { name: 'Leave', value: stats.OnLeave, color: CHART_COLORS.Leave },
                                    ]}
                                    cx="50%" cy="50%"
                                    innerRadius={75}
                                    outerRadius={100}
                                    paddingAngle={3}
                                    dataKey="value"
                                    stroke="transparent"
                                >
                                    {([
                                        { color: CHART_COLORS.OnTime }, { color: CHART_COLORS.Late },
                                        { color: CHART_COLORS.OOO }, { color: CHART_COLORS.Absent }, { color: CHART_COLORS.Leave }
                                    ]).map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', fontWeight: 'bold' }} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="mt-4 grid grid-cols-2 gap-2">
                        {/* Custom compact legend */}
                        <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> <span className="text-[10px] font-black uppercase text-slate-500">On Time</span></div>
                        <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-amber-500" /> <span className="text-[10px] font-black uppercase text-slate-500">Late</span></div>
                        <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-purple-500" /> <span className="text-[10px] font-black uppercase text-slate-500">OOO</span></div>
                        <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-rose-500" /> <span className="text-[10px] font-black uppercase text-slate-500">Absent</span></div>
                    </div>
                </motion.div>
            </div>

            {/* Bottom Section: All Employees Table & Analytics Panel */}
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">

                {/* All Employees Attendance Table */}
                <motion.div variants={itemVariants} className="lg:col-span-2 rounded-[3.5rem] border border-slate-200 bg-white p-0 dark:border-slate-800 dark:bg-slate-900 shadow-sm flex flex-col justify-between">
                    <div>
                        <div className="mb-6 p-10 pb-0 flex items-center justify-between">
                            <div>
                                <h3 className="text-2xl font-black uppercase tracking-tight text-slate-900 dark:text-white">
                                    Live Employee Log
                                </h3>
                                <p className="text-sm font-bold text-slate-400 mt-1 uppercase tracking-widest">
                                    Real-time tracking for all personnel
                                </p>
                            </div>
                        </div>

                        <div className="overflow-x-auto p-5">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="border-b border-slate-100 dark:border-slate-800 opacity-50">
                                        <th className="pb-4 px-4 font-black text-[10px] uppercase tracking-[0.2em] text-slate-500">Employee</th>
                                        <th className="pb-4 font-black text-[10px] uppercase tracking-[0.2em] text-slate-500">Status</th>
                                        <th className="pb-4 font-black text-[10px] uppercase tracking-[0.2em] text-slate-500">Check-In</th>
                                        <th className="pb-4 font-black text-[10px] uppercase tracking-[0.2em] text-slate-500">Check-Out</th>
                                        <th className="pb-4 font-black text-[10px] uppercase tracking-[0.2em] text-slate-500 text-right pr-4">Work Type</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
                                    {paginatedAttendance.map((emp: any) => (
                                        <tr key={emp.ID} className="group transition-colors hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                                            <td className="py-4 px-4">
                                                <div className="flex flex-col">
                                                    <span className="font-black text-sm text-slate-900 dark:text-white uppercase tracking-tight">
                                                        {emp.EmpName}
                                                    </span>
                                                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">
                                                        {emp.Dept}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="py-4">
                                                <span className={cn(
                                                    "inline-flex items-center rounded-xl px-3 py-1.5 text-[9px] font-black uppercase tracking-widest",
                                                    getStatusStyles(emp.Status)
                                                )}>
                                                    {emp.Status}
                                                </span>
                                            </td>
                                            <td className="py-4">
                                                <span className="text-[11px] font-black text-slate-900 dark:text-white uppercase tracking-widest">
                                                    {emp.CheckIn}
                                                </span>
                                            </td>
                                            <td className="py-4">
                                                <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">
                                                    {emp.CheckOut}
                                                </span>
                                            </td>
                                            <td className="py-4 text-right pr-4">
                                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md">
                                                    {emp.Type}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Table Pagination */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-between p-8 pt-0 mt-4 border-t border-slate-100 dark:border-slate-800">
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-6">
                                Page {page} of {totalPages}
                            </p>
                            <div className="flex gap-2 mt-6">
                                <Button
                                    variant="ghost"
                                    disabled={page === 1}
                                    onClick={() => setPage((p) => Math.max(p - 1, 1))}
                                    className="rounded-xl text-xs font-black uppercase tracking-widest"
                                >
                                    Previous
                                </Button>
                                <Button
                                    variant="ghost"
                                    disabled={page === totalPages}
                                    onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                                    className="rounded-xl text-xs font-black uppercase tracking-widest"
                                >
                                    Next
                                </Button>
                            </div>
                        </div>
                    )}
                </motion.div>

                {/* Performance Analytics Panel */}
                <motion.div variants={itemVariants} className="rounded-[3.5rem] bg-indigo-900 p-10 text-white shadow-2xl relative overflow-hidden group">
                    <div className="relative z-10">
                        <div className="mb-10 flex items-center justify-between">
                            <h3 className="text-2xl font-black uppercase tracking-tight">
                                Today's Pulse
                            </h3>
                            <Activity className="h-6 w-6 text-emerald-400 animate-pulse" />
                        </div>

                        <p className="text-5xl font-black tracking-tighter mb-2">
                            83.6%
                        </p>

                        <p className="text-sm font-bold text-indigo-300/60 uppercase tracking-widest mb-10">
                            Punctuality Rate
                        </p>

                        <div className="space-y-8">
                            {/* Target Progress */}
                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Company Target: 90%</span>
                                    <span className="text-[10px] font-black text-amber-400 uppercase tracking-widest">Slightly Below</span>
                                </div>
                                <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-amber-400 shadow-[0_0_12px_rgba(251,191,36,0.4)]"
                                        style={{ width: `83.6%` }}
                                    />
                                </div>
                            </div>

                            {/* Quick Stats Grid */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-6 rounded-[2rem] bg-white/5 border border-white/10 backdrop-blur-md">
                                    <p className="text-[10px] font-black uppercase opacity-40">Total Exceptions</p>
                                    <p className="text-2xl font-black mt-1 text-rose-400">40</p>
                                </div>

                                <div className="p-6 rounded-[2rem] bg-white/5 border border-white/10 backdrop-blur-md">
                                    <p className="text-[10px] font-black uppercase opacity-40">Avg Check-in</p>
                                    <p className="text-2xl font-black mt-1">09:12</p>
                                </div>
                            </div>

                            {/* Data Entry Action CTA */}
                            <div className="mt-8 p-6 rounded-[2rem] bg-gradient-to-r from-indigo-500 to-purple-500 border border-white/20 shadow-lg cursor-pointer hover:scale-[1.02] transition-transform">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-[11px] font-black uppercase tracking-widest text-white/80">
                                            Quick Action
                                        </p>
                                        <p className="text-lg font-black mt-1">
                                            Export Daily Log
                                        </p>
                                    </div>
                                    <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center">
                                        <ChevronRight className="h-5 w-5 text-white" />
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>
                </motion.div>
            </div>
        </motion.div>
    );
}