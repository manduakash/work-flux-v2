"use client";

import React, { useMemo, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
    AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, PieChart, Pie, Cell, Legend, ComposedChart, Line
} from 'recharts';
import {
    Activity, ShieldCheck, AlertCircle, TrendingUp, Clock,
    Zap, FolderKanban, Users, Briefcase, Calendar,
    CheckCircle2, Timer, Flame, ChevronRight, BarChart3,
    AlertTriangle, ChevronDown, ChevronUp
} from 'lucide-react';

import { useStore } from '@/store/useStore';
import { cn } from '@/lib/utils';
import { UserRole } from '@/types';
import { callGetAPIWithToken } from '@/components/apis/commonAPIs';
import { Button } from '@/components/ui/button';

// --- Theme Colors ---
const COLORS = {
    active: '#6366f1',    // Indigo
    uat: '#8b5cf6',       // Violet
    deployed: '#10b981',  // Emerald
    completed: '#22c55e', // Green
    onHold: '#f59e0b',    // Amber
    planning: '#94a3b8',  // Slate
    pending: '#ef4444',   // Rose
    inProgress: '#3b82f6' // Blue
};

const STATUS_MAP: Record<string, string> = {
    'Active': COLORS.active,
    'UAT': COLORS.uat,
    'Deployed': COLORS.deployed,
    'Completed': COLORS.completed,
    'On Hold': COLORS.onHold,
    'Planning': COLORS.planning
};

const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
};

const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

export default function ProfessionalDashboard() {
    const { currentUser } = useStore();
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<any>({
        projects: [],
        weeklyTasks: [],
        devStats: [],
        urgentTasks: [],
        staleTasks: []
    });

    const [isOverdueExpanded, setIsOverdueExpanded] = useState(false);

    const [projectDashboardData, setProjectDashboardData] = useState<any>(null);

    useEffect(() => {
        callGetAPIWithToken('lead/dashboard/team-member-graph').then((res) => {
            setProjectDashboardData(res.data);
        }).catch((err) => {
            console.error("Dashboard Data Fetch Error:", err);
        })
    }, []);
    useEffect(() => {
        const fetchAllData = async () => {
            try {
                // In a real scenario, you'd have specific endpoints for these.
                // Simulating comprehensive data fetch:
                const [projectsRes, devRes, weeklyRes, overdueRes] = await Promise.all([
                    callGetAPIWithToken('projects/projects-by-user-id'),
                    callGetAPIWithToken('lead/dashboard/developer-wise-team-progress-graph'),
                    callGetAPIWithToken('lead/dashboard/weekly-task-progress-graph'),
                    callGetAPIWithToken('lead/dashboard/deadline-crossed')
                ]);

                const transformedDevStats = (devRes.data || []).map((dev: any) => ({
                    name: dev.DeveloperName,
                    pending: Number(dev.NoOfInProgressTask),
                    completed: Number(dev.NoOfCompletedTask),
                }));

                const transformedWeeklyTasks = (weeklyRes.data || []).map((item: any) => ({
                    week: `W${item.week_number}`,
                    pending: Number(item.Pending),
                    completed: Number(item.Completed),
                }));

                const transformedOverdueTasks = (overdueRes.data || []).map((task: any) => ({
                    id: task.TaskID,
                    title: task.TaskTitle,
                    deadline: task.TaskDeadline,
                    owner: task.AssignedToName,
                    progress: task.TaskProgress
                }));

                const mockUrgentTasks = [
                    { id: 1, title: 'API Authentication Fix', project: 'NexIntel', priority: 'Critical' },
                    { id: 2, title: 'Database Migration', project: 'CloudSync', priority: 'High' },
                ];

                setData({
                    projects: projectsRes.data || [],
                    weeklyTasks: transformedWeeklyTasks,
                    devStats: transformedDevStats,
                    urgentTasks: mockUrgentTasks,
                    staleTasks: transformedOverdueTasks
                });
            } catch (error) {
                console.error("Data Fetch Error:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchAllData();
    }, []);

    // 2. All Projects Donut Calculation
    const projectStatusData = useMemo(() => {
        const counts: any = {};
        data.projects.forEach((p: any) => {
            counts[p.ProjectStatusName] = (counts[p.ProjectStatusName] || 0) + 1;
        });
        return Object.entries(counts).map(([name, value]) => ({ name, value }));
    }, [data.projects]);

    // 4. Task Summary Total Calculation
    // const taskSummary = {
    //     pending: 12,
    //     inProgress: 8,
    //     review: 5,
    //     completed: 45
    // };
    const [taskSummary, setTaskSummary] = useState({
        pending: 0,
        inProgress: 0,
        review: 0,
        completed: 0,
        rejected: 0,
        total: 0,
        projects: 0
    });

    useEffect(() => {
        callGetAPIWithToken('lead/dashboard/count').then((res) => {
            setTaskSummary({
                pending: Number(res.data.PendingTasks),
                inProgress: Number(res.data.InProgressTasks),
                review: Number(res.data.ReviewTasks),
                completed: Number(res.data.CompletedTasks),
                rejected: Number(res.data.RejectedTasks),
                total: Number(res.data.TotalTasks),
                projects: Number(res.data.ActiveProjects)
            });
        }).catch((err) => {
            console.error("Dashboard Data Fetch Error:", err);
        })
    }, []);

    if (loading) return <div className="p-20 text-center font-black animate-pulse">LOADING DASHBOARD DATA...</div>;

    return (
        <motion.div
            initial="hidden" animate="visible" variants={containerVariants}
            className="max-w-[1600px] mx-auto p-6 space-y-8  dark:bg-transparent min-h-screen"
        >
            {/* Header section with Requirement 9: Total Active Project Days */}
            <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                <div>
                    <h1 className="text-4xl font-black tracking-tighter uppercase">Management <span className="text-indigo-600">Overview</span></h1>
                    <p className="text-slate-500 font-bold uppercase text-xs tracking-widest mt-1 flex items-center gap-2">
                        Tracking {data?.projects?.length} Projects
                    </p>
                </div>

                {/* 9. Total Project Days if Active (Stat Card) */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-3xl shadow-sm flex items-center gap-4">
                    <div className="h-12 w-12 bg-indigo-50 dark:bg-indigo-900/30 rounded-2xl flex items-center justify-center text-indigo-600">
                        <Calendar className="h-6 w-6" />
                    </div>
                    <div>
                        <p className="text-[10px] font-black uppercase text-slate-400">Total Project Time</p>
                        <p className="text-xl font-black">1,240 <span className="text-sm text-slate-400 tracking-normal">Days</span></p>
                    </div>
                </div>
            </header>

            {/* Second Row: 3. Resources/Devs & 4. Task Summary */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* 4. Task Summary Total */}
                <motion.div variants={itemVariants} className="lg:col-span-4 grid grid-cols-6 gap-4">
                    <SummaryCard label="Total Tasks" value={taskSummary.total} color="text-rose-500" bgColor="bg-gradient-to-br from-purple-600 via-purple-500 to-purple-700" icon={Clock} />
                    <SummaryCard label="Task Submmision Pending" value={taskSummary.pending} color="text-rose-500" bgColor="bg-gradient-to-br from-amber-600 via-orange-500 to-amber-700" icon={Clock} />
                    <SummaryCard label="Waiting for Your Review" value={taskSummary.review} color="text-amber-500" bgColor="bg-gradient-to-br from-cyan-600 via-teal-500 to-cyan-700" icon={ShieldCheck} />
                    <SummaryCard label="Rejected Tasks by You" value={taskSummary.rejected} color="text-rose-500" bgColor="bg-gradient-to-br from-rose-600 via-rose-500 to-red-700" icon={Clock} />
                    <SummaryCard label="Active Projects" value={taskSummary.inProgress} color="text-blue-500" bgColor="bg-gradient-to-br from-indigo-600 via-indigo-500 to-blue-700" icon={Activity} />
                    <SummaryCard label="Task Approved by You" value={taskSummary.completed} color="text-emerald-500" bgColor="bg-gradient-to-br from-emerald-600 via-emerald-500 to-emerald-700" icon={CheckCircle2} />
                </motion.div>

                {/* 3. Resources (Developers) per Project */}
                <motion.div variants={itemVariants} className="lg:col-span-4 bg-white dark:bg-slate-950 p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm">
                    <h3 className="font-black uppercase tracking-tight mb-6 flex items-center gap-2">
                        <Users className="h-5 w-5 text-indigo-500" /> Team Member Distribution
                    </h3>
                    <div className="h-[250px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={projectDashboardData?.slice(0, 6)}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="ProjectName" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700 }} />
                                <YAxis axisLine={false} tickLine={false} />
                                <Tooltip />
                                <Bar dataKey="NoOfDevelopers" name="Team Members" fill={COLORS.active} radius={[6, 6, 0, 0]} barSize={30} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>

            </div>

            {/* Top Row: 1. Wave Graph & 2. Donut Chart */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* 1. Pending vs Completed Weekly (Wave) */}
                <motion.div variants={itemVariants} className="lg:col-span-2 bg-white dark:bg-slate-950 p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="font-black uppercase tracking-tight flex items-center gap-2">
                            <TrendingUp className="h-5 w-5 text-indigo-500" /> Daily Task Trend
                        </h3>
                    </div>
                    <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={data.weeklyTasks}>
                                <defs>
                                    <linearGradient id="colorComp" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor={COLORS.completed} stopOpacity={0.3} />
                                        <stop offset="95%" stopColor={COLORS.completed} stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="colorPend" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor={COLORS.pending} stopOpacity={0.3} />
                                        <stop offset="95%" stopColor={COLORS.pending} stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                <XAxis dataKey="week" axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 700 }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 700 }} />
                                <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
                                <Area type="monotone" dataKey="completed" stroke={COLORS.completed} fillOpacity={1} fill="url(#colorComp)" strokeWidth={3} />
                                <Area type="monotone" dataKey="pending" stroke={COLORS.pending} fillOpacity={1} fill="url(#colorPend)" strokeWidth={3} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>

                {/* 2. All Projects Donut */}
                <motion.div variants={itemVariants} className="bg-white dark:bg-slate-950 p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm">
                    <h3 className="font-black uppercase tracking-tight mb-6">Status Breakdown</h3>
                    <div className="h-[250px] relative">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={projectStatusData}
                                    innerRadius={70}
                                    outerRadius={90}
                                    paddingAngle={8}
                                    dataKey="value"
                                >
                                    {projectStatusData.map((entry, index) => (
                                        <Cell key={index} fill={STATUS_MAP[entry.name] || COLORS.planning} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                            <span className="text-3xl font-black">{data.projects.length}</span>
                            <span className="text-[10px] font-bold text-slate-400 uppercase">Total</span>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 mt-4">
                        {projectStatusData.map((entry: any, i: number) => (
                            <div key={i} className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-500">
                                <div className="h-2 w-2 rounded-full" style={{ backgroundColor: STATUS_MAP[entry.name] }} />
                                {entry.name}: {entry.value}
                            </div>
                        ))}
                    </div>
                </motion.div>
            </div>

            {/* Third Row: 5. Completion Progress & 6. Developer Stats */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* 5. All Projects Percentage Completion */}
                <motion.div variants={itemVariants} className="bg-white dark:bg-slate-950 p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm">
                    <h3 className="font-black uppercase tracking-tight mb-6 flex items-center gap-2">
                        <BarChart3 className="h-5 w-5 text-indigo-500" /> Project Progress
                    </h3>
                    <div className="space-y-6">
                        {data.projects.slice(0, 5).map((project: any) => (
                            <div key={project.ProjectID} className="space-y-2">
                                <div className="flex justify-between text-[11px] font-black uppercase tracking-widest">
                                    <span>{project.ProjectName}</span>
                                    <span className="text-indigo-600">{project.ProgressPercentage}%</span>
                                </div>
                                <div className="h-3 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${project.ProgressPercentage}%` }}
                                        className="h-full bg-indigo-600 rounded-full"
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* 6. Developers Stats (Pending vs Completed) */}
                <motion.div variants={itemVariants} className="bg-white dark:bg-slate-950 p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm">
                    <h3 className="font-black uppercase tracking-tight mb-6">Team Progress</h3>
                    <div className="h-[250px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data.devStats} layout="vertical">
                                <XAxis type="number" hide />
                                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 900 }} />
                                <Tooltip cursor={{ fill: 'transparent' }} />
                                <Legend />
                                <Bar dataKey="completed" stackId="a" fill={COLORS.completed} radius={[0, 0, 0, 0]} barSize={20} />
                                <Bar dataKey="pending" stackId="a" fill={COLORS.pending} radius={[0, 4, 4, 0]} barSize={20} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>
            </div>

            {/* Bottom Row: Lists 7 & 8 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* 7. Pending tasks more than 3 weeks */}
                <motion.div variants={itemVariants} className="bg-white dark:bg-slate-950 p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="h-10 w-10 bg-rose-100 text-rose-600 rounded-xl flex items-center justify-center">
                            <AlertTriangle className="h-6 w-6" />
                        </div>
                        <h3 className="font-black uppercase tracking-tight">Breached Deadlines</h3>
                    </div>
                    <div className={cn("space-y-4 pr-2 transition-all duration-500 overflow-hidden", isOverdueExpanded ? "max-h-[800px] overflow-y-auto" : "max-h-[360px]")}>
                        {data.staleTasks.length > 0 ? (
                            <>
                                {(isOverdueExpanded ? data.staleTasks : data.staleTasks.slice(0, 3)).map((task: any) => (
                                    <div key={task.id} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 hover:border-rose-200 transition-colors group">
                                        <div className="min-w-0 flex-1 pr-4">
                                            <p className="text-sm font-bold uppercase truncate text-slate-900 dark:text-white group-hover:text-rose-600 transition-colors">{task.title}</p>
                                            <div className="flex items-center gap-2 mt-1">
                                                <p className="text-[10px] text-slate-400 font-bold uppercase truncate">Assigned to: {task.owner}</p>
                                                <div className="w-1 h-1 rounded-full bg-slate-300" />
                                                <p className="text-[10px] text-indigo-500 font-bold uppercase">{task.progress}% Done</p>
                                            </div>
                                        </div>
                                        <div className="text-right shrink-0">
                                            <p className="text-[9px] font-black text-rose-500 uppercase tracking-widest">Missed On</p>
                                            <p className="text-[11px] font-black text-slate-700 dark:text-slate-300">{formatDate(task.deadline)}</p>
                                        </div>
                                    </div>
                                ))}

                                {data.staleTasks.length > 3 && (
                                    <button
                                        onClick={() => setIsOverdueExpanded(!isOverdueExpanded)}
                                        className="w-full py-3 flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-indigo-600 transition-colors group/btn"
                                    >
                                        {isOverdueExpanded ? (
                                            <>Show Less <ChevronUp size={14} className="group-hover/btn:-translate-y-0.5 transition-transform" /></>
                                        ) : (
                                            <>View All Breached ({data.staleTasks.length}) <ChevronDown size={14} className="group-hover/btn:translate-y-0.5 transition-transform" /></>
                                        )}
                                    </button>
                                )}
                            </>
                        ) : (
                            <div className="text-center py-10">
                                <p className="text-xs font-bold text-slate-300 uppercase italic">No deadlines breached</p>
                            </div>
                        )}
                    </div>
                </motion.div>

                {/* 8. Urgent task list */}
                <motion.div variants={itemVariants} className="bg-slate-900 p-8 rounded-[2.5rem] shadow-2xl shadow-indigo-500/10 text-white">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="h-10 w-10 bg-rose-500 rounded-xl flex items-center justify-center text-white">
                            <Flame className="h-6 w-6 animate-pulse" />
                        </div>
                        <h3 className="font-black uppercase tracking-tight">Urgent Tasks</h3>
                    </div>
                    <div className="space-y-4">
                        {data.urgentTasks.map((task: any) => (
                            <div key={task.id} className="group flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
                                <div>
                                    <p className="text-sm font-bold uppercase">{task.title}</p>
                                    <p className="text-[10px] text-indigo-400 font-bold uppercase">{task.project}</p>
                                </div>
                                <Button size="sm" className="h-8 rounded-xl bg-indigo-600 font-black text-[9px] uppercase hover:bg-indigo-500">
                                    Open <ChevronRight className="ml-1 h-3 w-3" />
                                </Button>
                            </div>
                        ))}
                    </div>
                </motion.div>
            </div>
        </motion.div>
    );
}

// Sub-component for Task Summary Cards
function SummaryCard({ label, value, color, bgColor, icon: Icon }: any) {
    return (
        <div
            className={cn(
                "relative hover:translate-y-1.5 hover:shadow-2xl cursor-pointer overflow-hidden p-6 rounded-[2rem] border shadow-sm transition-all duration-600",
                "border-slate-200 dark:border-slate-800",
                bgColor || "bg-white dark:bg-slate-950"
            )}
        >
            {/* 🔹 Pattern Overlay */}
            <div
                className="absolute inset-0 opacity-[0.9] pointer-events-none"
                style={{
                    backgroundImage:
                        'url("https://www.transparenttextures.com/patterns/diamond-upholstery.png")',
                }}
            />

            {/* 🔹 Content */}
            <div className="relative z-10">
                <div
                    className={cn(
                        "h-10 w-10 rounded-xl flex items-center justify-center bg-white/5 text-white border border-slate-100/40 backdrop-blur-2xl mb-4 shadow-lg"
                    )}
                >
                    <Icon className="h-5 w-5" />
                </div>

                <p className="text-[10px] font-black uppercase text-slate-100 tracking-widest">
                    {label}
                </p>

                <p className="text-3xl font-black mt-1 text-slate-200 dark:text-white">
                    {value}
                </p>
            </div>
        </div>
    );
}