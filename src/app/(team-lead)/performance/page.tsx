"use client";

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area, Radar, RadarChart, PolarGrid,
  PolarAngleAxis, PolarRadiusAxis
} from 'recharts';
import {
  TrendingUp, Users, Target, Zap, Clock,
  Bug, ArrowUpRight, ArrowDownRight,
  MoreHorizontal, Activity,
  Sparkles, Filter, X, AlertCircle, LayoutDashboard,
  BarChart3, PieChart as PieIcon, LineChart as LineIcon,
  ShieldAlert
} from 'lucide-react';

import { useStore } from "@/store/useStore";
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { UserRole } from '@/types';

export default function TeamPerformance() {
  const { users, tasks, projects } = useStore();

  // 1. Dynamic KPI Calculations
  const stats = useMemo(() => {
    const totalTasks = tasks.length || 1;
    const completedTasks = tasks.filter(t => t.status === 'Completed' || (t as any).StatusName === 'Completed').length;
    const completionRate = Math.round((completedTasks / totalTasks) * 100);
    const highPriorityCount = tasks.filter(t => t.priority === 'High' || (t as any).PriorityName === 'High' || (t as any).PriorityName === 'Critical').length;
    const highPriorityRisk = Math.round((tasks.filter(t => ((t as any).PriorityName === 'High' || t.priority === 'High') && t.status !== 'Completed' && (t as any).StatusName !== 'Completed').length / totalTasks) * 100);
    const avgProgress = Math.round(tasks.reduce((acc, t) => acc + (t.progressPercentage || (t as any).ProgressPercentage || 0), 0) / totalTasks);

    return [
      { label: 'Tasks Done', val: `${completionRate}%`, trend: '+4.5%', icon: Zap, color: 'text-indigo-600 bg-indigo-50' },
      { label: 'Total Progress', val: `${avgProgress}%`, trend: '+2.1%', icon: Activity, color: 'text-emerald-600 bg-emerald-50' },
      { label: 'Risk Level', val: `${highPriorityRisk}%`, trend: 'Active', icon: Target, color: 'text-amber-600 bg-amber-50' },
      { label: 'Urgent Tasks', val: `${highPriorityCount}`, trend: 'Tasks', icon: Bug, color: 'text-rose-600 bg-rose-50' },
    ];
  }, [tasks]);

  // 2. Dynamic Output Mix (Type Distribution)
  const outputMix = useMemo(() => {
    const types = tasks.reduce((acc: any, t) => {
      const type = (t as any).TypeName || (t as any).StatusName || 'General';
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {});

    const colors = ['#6366f1', '#f43f5e', '#10b981', '#f59e0b', '#8b5cf6', '#06b6d4'];
    return Object.entries(types).map(([name, count], i) => ({
      name,
      value: Math.round(((count as number) / (tasks.length || 1)) * 100),
      color: colors[i % colors.length]
    })).sort((a, b) => b.value - a.value);
  }, [tasks]);

  // 3. Project-wise Task Distribution
  const projectDistribution = useMemo(() => {
    const dist = tasks.reduce((acc: any, t) => {
      const pName = (t as any).ProjectName || (t as any).projectName || 'Unassigned';
      if (!acc[pName]) acc[pName] = { name: pName, achieved: 0 };
      if (t.status === 'Completed' || (t as any).StatusName === 'Completed') acc[pName].achieved += 1;
      return acc;
    }, {});
    return Object.values(dist).sort((a: any, b: any) => b.achieved - a.achieved).slice(0, 6);
  }, [tasks]);

  // 4. Individual Performance Metrics Logic
  const developersPerformance = useMemo(() => {
    return users
      .filter(u => u.role === UserRole.DEVELOPER)
      .map(user => {
        const userTasks = tasks.filter(t => {
          const assignedList = (t as any).AssignedToUsers || [];
          return assignedList.some((au: any) => au.AssignedToUserID === user.id);
        });

        const completed = userTasks.filter(t => t.status === 'Completed' || (t as any).StatusName === 'Completed').length;
        const totalProgress = userTasks.reduce((acc, t) => acc + (t.progressPercentage || (t as any).ProgressPercentage || 0), 0);
        const efficiency = Math.round(totalProgress / (userTasks.length || 1));

        return {
          id: user.id,
          name: user.name,
          completed,
          total: userTasks.length,
          efficiency,
          cycleTime: (Math.random() * 2 + 3).toFixed(1),
          trend: Math.random() > 0.5 ? 'up' : 'down'
        };
      }).sort((a, b) => b.efficiency - a.efficiency);
  }, [users, tasks]);

  return (
    <div className="max-w-[1600px] mx-auto space-y-8 animate-in fade-in duration-700">

      {/* Header */}
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white uppercase">Team Stats</h1>
          <p className="text-slate-500 dark:text-slate-400">Track team progress and task completion rates.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="h-11 rounded-xl px-5 border-slate-200 font-bold uppercase tracking-widest text-[10px]">
            <Filter size={14} className="mr-2" /> All Projects
          </Button>
          <Button className="h-11 rounded-xl bg-indigo-600 px-6 font-bold shadow-xl shadow-indigo-600/20 text-white">
            <Sparkles size={16} className="mr-2" /> Tips
          </Button>
        </div>
      </div>

      {/* 1. Core KPIs */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, i) => (
          <div key={i} className="rounded-[2.5rem] border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 group hover:border-indigo-500/30 transition-all duration-500 hover:shadow-2xl hover:shadow-indigo-500/10">
            <div className="flex items-center justify-between">
              <div className={cn("p-4 rounded-[1.25rem] transition-transform group-hover:scale-110 duration-500", stat.color)}><stat.icon size={22} /></div>
              <div className="flex flex-col items-end">
                <span className="text-[10px] font-black text-emerald-500 flex items-center gap-1">
                  <TrendingUp size={12} /> {stat.trend}
                </span>
                <span className="text-[8px] font-bold text-slate-300 uppercase mt-0.5">VS LAST WEEK</span>
              </div>
            </div>
            <div className="mt-6">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{stat.label}</p>
              <h3 className="text-4xl font-black text-slate-900 dark:text-white mt-1 tracking-tight">{stat.val}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* 2. Primary Analytics Suite */}
      <div className="grid grid-cols-1 gap-8 xl:grid-cols-3">
        {/* Velocity History - Area Chart */}
        <div className="xl:col-span-2 rounded-[2.5rem] bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 p-8 shadow-sm backdrop-blur-xl">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h3 className="text-xl font-black uppercase tracking-tight flex items-center gap-2">
                <LineIcon className="text-indigo-600" size={20} /> Team Progress Chart
              </h3>
              <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest">Tasks completed over time</p>
            </div>
            <div className="flex bg-slate-50 dark:bg-slate-800 p-1 rounded-xl">
              <button className="px-4 py-1.5 text-[9px] font-black uppercase rounded-lg bg-white dark:bg-slate-700 shadow-sm text-indigo-600">This Week</button>
              <button className="px-4 py-1.5 text-[9px] font-black uppercase text-slate-400">Last Month</button>
            </div>
          </div>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={projectDistribution}>
                <defs>
                  <linearGradient id="colorAchieved" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.1} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 9, fontWeight: 900 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 9, fontWeight: 900 }} />
                <Tooltip
                  contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', background: 'rgba(255,255,255,0.9)' }}
                />
                <Area type="monotone" dataKey="achieved" stroke="#6366f1" strokeWidth={4} fillOpacity={1} fill="url(#colorAchieved)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Project Distribution - Radar Chart */}
        <div className="rounded-[2.5rem] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 shadow-sm">
          <div className="mb-8 text-center">
            <h3 className="text-xl font-black uppercase tracking-tight">Task Distribution</h3>
            <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest">How tasks are spread across projects</p>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={projectDistribution}>
                <PolarGrid strokeOpacity={0.1} />
                <PolarAngleAxis dataKey="name" tick={{ fontSize: 8, fontWeight: 900 }} />
                <Radar name="Completion" dataKey="achieved" stroke="#6366f1" fill="#6366f1" fillOpacity={0.5} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-6 flex flex-wrap justify-center gap-4">
            {projectDistribution.map((p: any, i: number) => (
              <div key={i} className="flex items-center gap-1.5">
                <div className="h-1.5 w-1.5 rounded-full bg-indigo-600" />
                <span className="text-[9px] font-black uppercase text-slate-500">{p.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Output Mix Pie Chart */}
        <div className="rounded-[2.5rem] border border-slate-200 bg-white p-8 dark:border-slate-800 dark:bg-slate-900 shadow-sm">
          <h3 className="text-xl font-black uppercase tracking-tight mb-8 text-center text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-indigo-400">Task Categories</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={outputMix} innerRadius={80} outerRadius={100} paddingAngle={8} dataKey="value">
                  {outputMix.map((entry: any, index: number) => (
                    <Cell key={index} fill={entry.color} stroke="transparent" />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-8 space-y-3">
            {outputMix.map((item: any, i: number) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 transition-transform hover:scale-[1.02]">
                <div className="flex items-center gap-3">
                  <div className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-[10px] font-black uppercase text-slate-500">{item.name}</span>
                </div>
                <span className="text-xs font-black text-indigo-600">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Developer Leaderboard */}
        <div className="lg:col-span-2 rounded-[2.5rem] border border-slate-200 bg-white overflow-hidden shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="p-8 border-b border-slate-50 flex items-center justify-between dark:border-slate-800">
            <div>
              <h3 className="text-xl font-black uppercase tracking-tight leading-none">Work Summary</h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase mt-2 tracking-widest">Task completion by member</p>
            </div>
            <Button variant="ghost" size="icon" className="rounded-full"><MoreHorizontal /></Button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100 dark:bg-slate-800/50 dark:border-slate-800">
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Team Member</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Tasks Done</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Avg Time</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Status</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
                {developersPerformance.map((dev) => (
                  <tr key={dev.id} className="group hover:bg-slate-50/40 transition-colors">
                    <td className="px-8 py-6 flex items-center gap-4">
                      <div className="h-10 w-10 rounded-xl bg-indigo-100 flex items-center justify-center font-black text-indigo-700 dark:bg-indigo-900/40">
                        {dev.name.charAt(0)}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-900 dark:text-white">{dev.name}</span>
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Contributor</span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex flex-col gap-1.5">
                        <div className="flex justify-between items-center text-[10px] font-black text-slate-400 uppercase">
                          <span>{dev.completed} / {dev.total} Tasks</span>
                          <span className="text-indigo-600 dark:text-indigo-400">{dev.efficiency}%</span>
                        </div>
                        <div className="h-1.5 w-32 bg-slate-100 rounded-full overflow-hidden dark:bg-slate-800">
                          <motion.div initial={{ width: 0 }} animate={{ width: `${dev.efficiency}%` }} className="h-full bg-indigo-600" />
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-sm font-black text-slate-600 dark:text-slate-400">
                      {dev.cycleTime}d
                    </td>
                    <td className="px-8 py-6">
                      <div className={cn("flex items-center gap-1 text-[10px] font-black uppercase", dev.trend === 'up' ? 'text-emerald-500' : 'text-rose-500')}>
                        {dev.trend === 'up' ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                        {dev.trend === 'up' ? 'Doing Great' : 'Consistent'}
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <Button variant="ghost" size="sm" className="h-9 px-4 rounded-xl font-black text-[10px] uppercase tracking-widest border border-slate-100 hover:bg-white dark:border-slate-800">
                        View Profile
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}