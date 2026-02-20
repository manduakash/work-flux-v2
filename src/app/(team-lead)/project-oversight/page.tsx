"use client";

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line
} from 'recharts';
import { 
  ShieldCheck, AlertTriangle, CheckCircle2, Clock, 
  MoreHorizontal, ArrowUpRight, ArrowDownRight,
  Users, Activity, Zap, Target, Filter, Search,
  Flag, ChevronRight, Archive
} from 'lucide-react';

import { useStore } from "@/store/useStore";
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn, formatDate } from '@/lib/utils';
import { ProjectStatus, Priority } from '@/types';

// --- Helper: Risk Assessment ---
const getHealthStatus = (progress: number, deadline: string) => {
  const today = new Date();
  const dueDate = new Date(deadline);
  const diffDays = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  if (progress < 20 && diffDays < 7) return { label: 'Critical', color: 'text-rose-500 bg-rose-50 border-rose-100', dot: 'bg-rose-500' };
  if (progress < 50 && diffDays < 14) return { label: 'At Risk', color: 'text-amber-500 bg-amber-50 border-amber-100', dot: 'bg-amber-500' };
  return { label: 'Healthy', color: 'text-emerald-500 bg-emerald-50 border-emerald-100', dot: 'bg-emerald-500' };
};

export default function ProjectOversight() {
  const { projects, users, tasks } = useStore();

  // 1. Portfolio Stats
  const portfolioStats = useMemo(() => {
    const total = projects.length;
    const healthy = projects.filter(p => p.status === ProjectStatus.ACTIVE).length;
    const velocity = projects.reduce((acc, p) => acc + p.progressPercentage, 0) / (total || 1);
    
    return [
      { label: 'Portfolio Health', val: `${Math.round((healthy/total)*100)}%`, icon: ShieldCheck, color: 'text-emerald-600 bg-emerald-50' },
      { label: 'Delivery Velocity', val: `${Math.round(velocity)}%`, icon: Zap, color: 'text-indigo-600 bg-indigo-50' },
      { label: 'Strategic Alignment', val: 'High', icon: Target, color: 'text-amber-600 bg-amber-50' },
      { label: 'Active Resources', val: users.length, icon: Users, color: 'text-slate-600 bg-slate-50' },
    ];
  }, [projects, users]);

  return (
    <div className="max-w-[1600px] mx-auto space-y-8 animate-in fade-in duration-700">
      
      {/* Header */}
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white uppercase">Project Oversight</h1>
          <p className="text-slate-500 dark:text-slate-400">Strategic governance and risk assessment across organizational workstreams.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="h-11 rounded-xl px-5 border-slate-200 font-bold uppercase tracking-widest text-[10px]">
            <Filter size={14} className="mr-2" /> Filter Portfolio
          </Button>
          <Button className="h-11 rounded-xl bg-slate-900 px-6 font-bold shadow-xl shadow-slate-900/20 text-white">
            Export Audit Log
          </Button>
        </div>
      </div>

      {/* 1. High-Level Portfolio Stats */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {portfolioStats.map((stat, i) => (
          <div key={i} className="rounded-[2rem] border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 shadow-sm">
            <div className="flex items-center justify-between">
              <div className={cn("p-3 rounded-2xl", stat.color)}><stat.icon size={22} /></div>
              <div className="h-8 w-16 opacity-20">
                 <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={[{v: 10}, {v: 25}, {v: 15}, {v: 30}]}>
                       <Line type="monotone" dataKey="v" stroke="currentColor" strokeWidth={2} dot={false} />
                    </LineChart>
                 </ResponsiveContainer>
              </div>
            </div>
            <div className="mt-5">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{stat.label}</p>
              <h3 className="text-3xl font-black text-slate-900 dark:text-white">{stat.val}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* 2. Oversight Matrix Table */}
      <div className="rounded-[2.5rem] border border-slate-200 bg-white overflow-hidden shadow-xl shadow-slate-200/20 dark:border-slate-800 dark:bg-slate-900">
        <div className="px-8 py-6 border-b border-slate-50 flex items-center justify-between dark:border-slate-800">
           <h3 className="text-xl font-black uppercase tracking-tight">Governance Matrix</h3>
           <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                 <div className="h-2 w-2 rounded-full bg-emerald-500" />
                 <span className="text-[10px] font-bold text-slate-400 uppercase">Healthy</span>
              </div>
              <div className="flex items-center gap-2">
                 <div className="h-2 w-2 rounded-full bg-rose-500" />
                 <span className="text-[10px] font-bold text-slate-400 uppercase">Risk Detected</span>
              </div>
           </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100 dark:bg-slate-800/50 dark:border-slate-800">
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Workstream Name</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Owner</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Health Index</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Roadmap Progress</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
              {projects.map((p) => {
                const health = getHealthStatus(p.progressPercentage, p.deadline);
                const lead = users.find(u => u.id === p.assignedLeadId);

                return (
                  <motion.tr 
                    key={p.id}
                    whileHover={{ backgroundColor: 'rgba(241, 245, 249, 0.4)' }}
                    className="group cursor-pointer transition-colors"
                  >
                    <td className="px-8 py-6">
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-900 dark:text-white text-base">{p.name}</span>
                        <div className="flex items-center gap-2 mt-1">
                          <Flag size={10} className={cn(p.priority === Priority.HIGH ? 'text-rose-500' : 'text-slate-400')} />
                          <span className="text-[10px] font-bold uppercase text-slate-400 tracking-tight">Due {formatDate(p.deadline)}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                       <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center font-black text-white text-[10px]">
                            {lead?.name.charAt(0)}
                          </div>
                          <div className="flex flex-col">
                             <span className="text-xs font-bold text-slate-700 dark:text-slate-200">{lead?.name}</span>
                             <span className="text-[9px] font-bold text-slate-400 uppercase leading-none">Team Lead</span>
                          </div>
                       </div>
                    </td>
                    <td className="px-8 py-6">
                       <div className={cn("inline-flex items-center gap-2 rounded-full px-3 py-1 border text-[10px] font-black uppercase tracking-widest", health.color)}>
                          <div className={cn("h-1.5 w-1.5 rounded-full", health.dot)} />
                          {health.label}
                       </div>
                    </td>
                    <td className="px-8 py-6 min-w-[200px]">
                       <div className="space-y-1.5">
                          <div className="flex justify-between items-center text-[10px] font-black uppercase text-slate-400">
                             <span>Phased Completion</span>
                             <span className="text-slate-900 dark:text-white">{p.progressPercentage}%</span>
                          </div>
                          <Progress value={p.progressPercentage} className="h-1.5" />
                       </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                       <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl hover:bg-white border border-transparent hover:border-slate-200">
                             <Archive size={16} className="text-slate-400 hover:text-rose-500" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl hover:bg-white border border-transparent hover:border-slate-200">
                             <ChevronRight size={18} className="text-slate-400" />
                          </Button>
                       </div>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 3. Portfolio Allocation (Donut + Insights) */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
         <div className="rounded-[2.5rem] border border-slate-200 bg-white p-8 dark:border-slate-800 dark:bg-slate-900">
            <h3 className="text-xl font-black uppercase tracking-tight mb-8">Resource Load Index</h3>
            <div className="h-64 w-full flex items-center justify-center">
               {/* Simplified Pie Vis */}
               <div className="relative flex items-center justify-center h-48 w-48 rounded-full border-[16px] border-emerald-500 border-t-indigo-600 border-l-amber-500">
                  <div className="text-center">
                     <p className="text-3xl font-black text-slate-900 dark:text-white">12</p>
                     <p className="text-[10px] font-black uppercase text-slate-400">Engaged Devs</p>
                  </div>
               </div>
            </div>
            <div className="mt-8 space-y-3">
               <div className="flex justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-800">
                  <span className="text-[10px] font-black uppercase text-slate-500">Avg Tasks per User</span>
                  <span className="text-xs font-black">4.2 Units</span>
               </div>
               <div className="flex justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-800">
                  <span className="text-[10px] font-black uppercase text-slate-500">Saturation Level</span>
                  <span className="text-xs font-black text-emerald-500">Optimal</span>
               </div>
            </div>
         </div>

         <div className="lg:col-span-2 rounded-[2.5rem] bg-indigo-900 p-10 text-white shadow-2xl relative overflow-hidden group">
            <div className="relative z-10 flex flex-col h-full">
               <div className="flex items-center gap-3 mb-6">
                  <Activity size={24} className="text-indigo-400" />
                  <h3 className="text-2xl font-black uppercase tracking-tight">Oversight Insights</h3>
               </div>
               <p className="text-indigo-100 text-lg leading-relaxed max-w-md">
                 Portfolio delivery velocity has increased by <span className="text-white font-bold">14.2%</span> this quarter. 
                 One critical workstream requires immediate resource reallocation to meet Q4 targets.
               </p>
               <div className="mt-auto pt-10 flex gap-4">
                  <Button className="bg-white text-indigo-900 hover:bg-indigo-50 font-black uppercase tracking-widest text-[10px] h-12 px-8 rounded-2xl">
                    View Mitigation Plan
                  </Button>
                  <Button variant="ghost" className="text-white border border-white/20 hover:bg-white/10 font-black uppercase tracking-widest text-[10px] h-12 px-8 rounded-2xl">
                    Strategic Roadmap
                  </Button>
               </div>
            </div>
            {/* Visual background decoration */}
            <div className="absolute -right-20 -bottom-20 h-80 w-80 rounded-full bg-indigo-500/20 blur-3xl group-hover:bg-indigo-500/30 transition-all duration-700" />
         </div>
      </div>
    </div>
  );
}