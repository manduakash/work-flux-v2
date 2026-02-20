"use client";

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, Cell, PieChart, Pie, AreaChart, Area
} from 'recharts';
import { 
  TrendingUp, Users, Target, Zap, Clock, 
  Award, Bug, ArrowUpRight, ArrowDownRight,
  MoreHorizontal, ChevronRight, Activity,
  Dna, Sparkles, Filter
} from 'lucide-react';

import { useStore } from "@/store/useStore";
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { UserRole } from '@/types';

// --- Mock Professional Performance Data ---
const sprintThroughput = [
  { name: 'S12', achieved: 45, goal: 40 },
  { name: 'S13', achieved: 38, goal: 40 },
  { name: 'S14', achieved: 52, goal: 45 },
  { name: 'S15', achieved: 48, goal: 50 },
  { name: 'S16', achieved: 61, goal: 55 },
];

const defectVsFeature = [
  { name: 'Features', value: 65, color: '#6366f1' },
  { name: 'Bugs', value: 20, color: '#f43f5e' },
  { name: 'Refactors', value: 15, color: '#10b981' },
];

export default function TeamPerformance() {
  const { users, tasks } = useStore();

  // 1. Individual Performance Metrics Logic
  const developersPerformance = useMemo(() => {
    return users
      .filter(u => u.role === UserRole.DEVELOPER)
      .map(user => {
        const userTasks = tasks.filter(t => t.assignedDeveloperId === user.id);
        const completed = userTasks.filter(t => t.status === 'Completed').length;
        const avgProgress = userTasks.reduce((acc, t) => acc + t.progressPercentage, 0) / (userTasks.length || 1);
        
        return {
          id: user.id,
          name: user.name,
          completed,
          total: userTasks.length,
          efficiency: Math.round(avgProgress),
          cycleTime: (Math.random() * 2 + 3).toFixed(1), // Mock Cycle Time
          trend: Math.random() > 0.5 ? 'up' : 'down'
        };
      });
  }, [users, tasks]);

  return (
    <div className="max-w-[1600px] mx-auto space-y-8 animate-in fade-in duration-700">
      
      {/* Header */}
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white uppercase">Performance Intelligence</h1>
          <p className="text-slate-500 dark:text-slate-400">Advanced analytics on team velocity, delivery quality, and resource efficiency.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="h-11 rounded-xl px-5 border-slate-200 font-bold uppercase tracking-widest text-[10px]">
            <Filter size={14} className="mr-2" /> Quarter 4
          </Button>
          <Button className="h-11 rounded-xl bg-indigo-600 px-6 font-bold shadow-xl shadow-indigo-600/20 text-white">
            <Sparkles size={16} className="mr-2" /> AI Insights
          </Button>
        </div>
      </div>

      {/* 1. Core KPIs */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Sprint Velocity', val: '54.2', trend: '+12%', icon: Zap, color: 'text-indigo-600 bg-indigo-50' },
          { label: 'Avg Cycle Time', val: '3.8 Days', trend: '-0.4d', icon: Clock, color: 'text-emerald-600 bg-emerald-50' },
          { label: 'Success Rate', val: '94.8%', trend: '+2.1%', icon: Target, color: 'text-amber-600 bg-amber-50' },
          { label: 'Defect Density', val: '1.2%', trend: '-0.5%', icon: Bug, color: 'text-rose-600 bg-rose-50' },
        ].map((stat, i) => (
          <div key={i} className="rounded-[2rem] border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between">
              <div className={cn("p-3 rounded-2xl", stat.color)}><stat.icon size={22} /></div>
              <span className="text-[10px] font-black text-emerald-500">{stat.trend}</span>
            </div>
            <div className="mt-5">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{stat.label}</p>
              <h3 className="text-3xl font-black text-slate-900 dark:text-white">{stat.val}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* 2. Main Charts Section */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Team Throughput Bar Chart */}
        <div className="lg:col-span-2 rounded-[2.5rem] border border-slate-200 bg-white p-8 dark:border-slate-800 dark:bg-slate-900 shadow-sm">
          <div className="mb-8 flex items-center justify-between">
            <h3 className="text-xl font-black uppercase tracking-tight">Throughput History</h3>
            <div className="flex gap-4">
               <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400">
                 <div className="h-2 w-2 rounded-full bg-indigo-600" /> ACHIEVED
               </div>
               <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400">
                 <div className="h-2 w-2 rounded-full bg-slate-200" /> TARGET
               </div>
            </div>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sprintThroughput}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.1} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 800}} dy={10} />
                <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}} />
                <Bar dataKey="achieved" fill="#6366f1" radius={[6, 6, 0, 0]} barSize={32} />
                <Bar dataKey="goal" fill="#e2e8f0" radius={[6, 6, 0, 0]} barSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Output Composition Pie Chart */}
        <div className="rounded-[2.5rem] border border-slate-200 bg-white p-8 dark:border-slate-800 dark:bg-slate-900 shadow-sm">
           <h3 className="text-xl font-black uppercase tracking-tight mb-8 text-center">Output Mix</h3>
           <div className="h-64 w-full">
             <ResponsiveContainer width="100%" height="100%">
               <PieChart>
                 <Pie data={defectVsFeature} innerRadius={80} outerRadius={100} paddingAngle={8} dataKey="value">
                   {defectVsFeature.map((entry, index) => (
                     <Cell key={index} fill={entry.color} stroke="transparent" />
                   ))}
                 </Pie>
                 <Tooltip />
               </PieChart>
             </ResponsiveContainer>
           </div>
           <div className="mt-8 space-y-3">
              {defectVsFeature.map((item, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 transition-transform hover:scale-[1.02]">
                   <div className="flex items-center gap-3">
                      <div className="h-2 w-2 rounded-full" style={{backgroundColor: item.color}} />
                      <span className="text-[10px] font-black uppercase text-slate-500">{item.name}</span>
                   </div>
                   <span className="text-xs font-black">{item.value}%</span>
                </div>
              ))}
           </div>
        </div>
      </div>

      {/* 3. Developer Leaderboard/Performance Table */}
      <div className="rounded-[2.5rem] border border-slate-200 bg-white overflow-hidden shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="p-8 border-b border-slate-50 flex items-center justify-between dark:border-slate-800">
           <div>
              <h3 className="text-xl font-black uppercase tracking-tight leading-none">Resource Efficiency</h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase mt-2 tracking-widest">Individual Throughput & Quality Metrics</p>
           </div>
           <Button variant="ghost" size="icon" className="rounded-full"><MoreHorizontal /></Button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100 dark:bg-slate-800/50 dark:border-slate-800">
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Team Member</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Throughput</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Cycle Time</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Trend</th>
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
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Full Stack Dev</span>
                     </div>
                  </td>
                  <td className="px-8 py-6">
                     <div className="flex flex-col gap-1.5">
                        <div className="flex justify-between items-center text-[10px] font-black text-slate-400 uppercase">
                           <span>{dev.completed} / {dev.total} Tasks</span>
                           <span className="text-slate-900 dark:text-white">{dev.efficiency}%</span>
                        </div>
                        <div className="h-1.5 w-32 bg-slate-100 rounded-full overflow-hidden dark:bg-slate-800">
                           <motion.div initial={{width: 0}} animate={{width: `${dev.efficiency}%`}} className="h-full bg-indigo-600" />
                        </div>
                     </div>
                  </td>
                  <td className="px-8 py-6">
                     <span className="text-sm font-black text-slate-900 dark:text-white">{dev.cycleTime} Days</span>
                  </td>
                  <td className="px-8 py-6">
                     <div className={cn("flex items-center gap-1 text-[10px] font-black uppercase", dev.trend === 'up' ? 'text-emerald-500' : 'text-rose-500')}>
                        {dev.trend === 'up' ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                        {dev.trend === 'up' ? 'Improving' : 'Declining'}
                     </div>
                  </td>
                  <td className="px-8 py-6 text-right">
                     <Button variant="ghost" size="sm" className="h-9 px-4 rounded-xl font-black text-[10px] uppercase tracking-widest border border-slate-100 hover:bg-white dark:border-slate-800">
                       Full Profile
                     </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}