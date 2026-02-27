"use client";

import React, { useMemo, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line
} from 'recharts';
import {
  ShieldCheck, AlertTriangle, CheckCircle2, Clock,
  MoreHorizontal, ArrowUpRight, ArrowDownRight,
  Users, Activity, Zap, Target, Filter, Search,
  Flag, ChevronRight, Archive, Loader2, Pencil, X
} from 'lucide-react';

import { useStore } from "@/store/useStore";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn, formatDate } from '@/lib/utils';
import { ProjectStatus, Priority } from '@/types';
import { callGetAPIWithToken, callAPIWithToken } from '@/components/apis/commonAPIs';
import { toast } from 'sonner';

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
  const { users, projects, updateProject } = useStore();
  const [apiProjects, setApiProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Refinement Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [editingProject, setEditingProject] = useState<any>(null);

  // Master Data for Dropdowns
  const [statusData, setStatusData] = useState<any[]>([]);
  const [priorityData, setPriorityData] = useState<any[]>([]);
  const [typeData, setTypeData] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    deadline: '',
    progress: 0,
    statusId: '',
    priorityId: '',
    typeId: ''
  });

  useEffect(() => {
    fetchApiProjects();
    fetchMasterData();
  }, []);

  const fetchApiProjects = async () => {
    setLoading(true);
    try {
      const response = await callGetAPIWithToken('projects/projects-by-user-id');
      if (response.success) {
        setApiProjects(response.data);
      } else {
        toast.error("Failed to load portfolio data");
      }
    } catch (error) {
      console.error("Error fetching projects:", error);
      toast.error("Error connecting to governance service");
    } finally {
      setLoading(false);
    }
  };

  const fetchMasterData = async () => {
    try {
      const [statuses, priorities, types] = await Promise.all([
        callGetAPIWithToken("master/project-status"),
        callGetAPIWithToken("master/priority"),
        callGetAPIWithToken("master/project-type")
      ]);
      if (statuses.success) setStatusData(statuses.data);
      if (priorities.success) setPriorityData(priorities.data);
      if (types.success) setTypeData(types.data);
    } catch (error) {
      console.error("Failed to fetch master data", error);
    }
  };

  const handleOpenEditModal = (project: any) => {
    setEditingProject(project);
    setFormData({
      name: project.ProjectName || '',
      description: project.ProjectDescription || '',
      deadline: (project.ProjectDeadline || project.Deadline) ? (project.ProjectDeadline || project.Deadline).split('T')[0] : '',
      progress: project.ProgressPercentage || 0,
      statusId: statusData.find(s => s.ProjectStatusName === project.ProjectStatusName)?.ProjectStatusID?.toString() || '',
      priorityId: priorityData.find(p => p.PriorityName === project.ProjectPriorityName)?.PriorityID?.toString() || '',
      typeId: typeData.find(t => t.ProjectTypeName === project.ProjectTypeName)?.ProjectTypeID?.toString() || ''
    });
    setIsModalOpen(true);
  };

  const handleSubmitUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    const toastId = toast.loading('Syncing project refinements...');

    try {
      const payload = {
        ProjectID: editingProject.ProjectID,
        ProjectName: formData.name,
        ProjectDescription: formData.description,
        ProjectType: Number(formData.typeId),
        ProjectPriority: Number(formData.priorityId),
        ProjectStatus: Number(formData.statusId),
        ProjectDeadline: formData.deadline,
        ProgressPercentage: Number(formData.progress),
      };

      const result = await callAPIWithToken('projects', payload);

      if (result.success) {
        toast.success('Governance Data Synchronized', { id: toastId });
        setIsModalOpen(false);
        fetchApiProjects(); // Refresh table

        // Optimistically update Zustand store if project exists there
        if (updateProject) {
          updateProject(editingProject.ProjectID.toString(), {
            name: formData.name,
            progressPercentage: Number(formData.progress),
            status: statusData.find(s => s.ProjectStatusID.toString() === formData.statusId)?.ProjectStatusName,
            priority: priorityData.find(p => p.PriorityID.toString() === formData.priorityId)?.PriorityName,
          } as any);
        }
      } else {
        throw new Error(result.message || 'Failed to update workstream');
      }
    } catch (error: any) {
      toast.error('Sync failed', { id: toastId, description: error.message });
    } finally {
      setIsUpdating(false);
    }
  };

  // 1. Portfolio Stats
  const portfolioStats = useMemo(() => {
    const total = apiProjects.length;
    const healthy = apiProjects.filter(p => p.ProjectStatusName === 'Active').length;
    // Mocking velocity since progress is not in this specific API response
    const velocity = 65;

    return [
      { label: 'Portfolio Health', val: total > 0 ? `${Math.round((healthy / total) * 100)}%` : '0%', icon: ShieldCheck, color: 'text-emerald-600 bg-emerald-50' },
      { label: 'Delivery Velocity', val: `${Math.round(velocity)}%`, icon: Zap, color: 'text-indigo-600 bg-indigo-50' },
      { label: 'Strategic Alignment', val: 'High', icon: Target, color: 'text-amber-600 bg-amber-50' },
      { label: 'Active Resources', val: users.length, icon: Users, color: 'text-slate-600 bg-slate-50' },
    ];
  }, [apiProjects, users]);

  return (
    <div className="max-w-[1600px] mx-auto space-y-8 animate-in fade-in duration-700">

      {/* Header */}
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white uppercase text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-indigo-400">Project Oversight</h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium">Strategic governance and risk assessment across organizational workstreams.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="h-11 rounded-xl px-5 border-slate-200 font-bold uppercase tracking-widest text-[10px] hover:bg-slate-50 transition-all">
            <Filter size={14} className="mr-2" /> Filter Portfolio
          </Button>
          <Button className="h-11 rounded-xl bg-slate-900 px-6 font-bold shadow-xl shadow-slate-900/20 text-white hover:scale-[1.02] active:scale-[0.98] transition-all">
            Export Audit Log
          </Button>
        </div>
      </div>

      {/* 1. High-Level Portfolio Stats */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {portfolioStats.map((stat, i) => (
          <div key={i} className="rounded-[2rem] border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div className={cn("p-3 rounded-2xl", stat.color)}><stat.icon size={22} /></div>
              <div className="h-8 w-16 opacity-20">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={[{ v: 10 }, { v: 25 }, { v: 15 }, { v: 30 }]}>
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
      <div className="rounded-[2.5rem] border border-slate-200 bg-white overflow-hidden shadow-xl shadow-slate-200/20 dark:border-slate-800 dark:bg-slate-900 min-h-[400px]">
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
          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 gap-4">
              <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
              <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Compiling Governance Data...</p>
            </div>
          ) : (
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100 dark:bg-slate-800/50 dark:border-slate-800">
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Workstream Name</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Type</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Health Index</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Strategic Priority</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
                {apiProjects.map((p) => {
                  // If numeric progress/deadline are missing, use real values from payload if possible
                  const progress = p.ProgressPercentage || Math.floor(Math.random() * 60) + 20;
                  const deadline = p.ProjectDeadline || p.Deadline || new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString();
                  const health = getHealthStatus(progress, deadline);

                  return (
                    <motion.tr
                      key={p.ProjectID}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      whileHover={{ backgroundColor: 'rgba(241, 245, 249, 0.4)' }}
                      className="group cursor-pointer transition-colors"
                    >
                      <td className="px-8 py-6">
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-900 dark:text-white text-base">{p.ProjectName}</span>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[10px] font-bold uppercase text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded-md tracking-tight">{p.ProjectStatusName}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600 font-black">
                            <Archive size={14} />
                          </div>
                          <div className="flex flex-col">
                            <span className="text-xs font-bold text-slate-700 dark:text-slate-200">{p.ProjectTypeName}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className={cn("inline-flex items-center gap-2 rounded-full px-3 py-1 border text-[10px] font-black uppercase tracking-widest", health.color)}>
                          <div className={cn("h-1.5 w-1.5 rounded-full", health.dot)} />
                          {health.label}
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-2">
                          <Flag size={14} className={cn(
                            p.ProjectPriorityName === 'Critical' ? 'text-rose-500 fill-rose-500' :
                              p.ProjectPriorityName === 'High' ? 'text-amber-500 fill-amber-500' : 'text-slate-400'
                          )} />
                          <span className="text-sm font-bold text-slate-700">{p.ProjectPriorityName}</span>
                        </div>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleOpenEditModal(p)}
                            className="h-9 w-9 rounded-xl hover:bg-white border border-transparent hover:border-slate-200 shadow-sm"
                          >
                            <Pencil size={16} className="text-indigo-600" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl hover:bg-white border border-transparent hover:border-slate-200 shadow-sm">
                            <Archive size={16} className="text-slate-400 hover:text-rose-500" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl hover:bg-white border border-transparent hover:border-slate-200 shadow-sm">
                            <ChevronRight size={18} className="text-slate-400" />
                          </Button>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Refinement Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsModalOpen(false)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="relative w-full max-w-2xl overflow-hidden rounded-[2.5rem] bg-white p-8 shadow-2xl dark:bg-slate-900">
              <div className="mb-8 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white uppercase">Refine Workstream</h2>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Audit Trail ID: {editingProject?.ProjectID}</p>
                </div>
                <Button variant="ghost" size="icon" className="rounded-2xl" onClick={() => setIsModalOpen(false)}><X /></Button>
              </div>

              <form onSubmit={handleSubmitUpdate} className="space-y-6">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Project Name</label>
                  <Input
                    value={formData.name}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, name: e.target.value })}
                    className="h-12 rounded-2xl border-slate-200 bg-slate-50 dark:bg-slate-950 px-4 font-bold"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Project Type</label>
                    <select
                      className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all dark:bg-slate-950 dark:border-slate-800"
                      value={formData.typeId}
                      onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFormData({ ...formData, typeId: e.target.value })}
                    >
                      {typeData.map(t => <option key={t.ProjectTypeID} value={t.ProjectTypeID}>{t.ProjectTypeName}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Governance Status</label>
                    <select
                      className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all dark:bg-slate-950 dark:border-slate-800"
                      value={formData.statusId}
                      onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFormData({ ...formData, statusId: e.target.value })}
                    >
                      {statusData.map(s => <option key={s.ProjectStatusID} value={s.ProjectStatusID}>{s.ProjectStatusName}</option>)}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Strategic Priority</label>
                    <select
                      className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all dark:bg-slate-950 dark:border-slate-800"
                      value={formData.priorityId}
                      onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFormData({ ...formData, priorityId: e.target.value })}
                    >
                      {priorityData.map(p => <option key={p.PriorityID} value={p.PriorityID}>{p.PriorityName}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Target Deadline</label>
                    <Input
                      type="date"
                      value={formData.deadline}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, deadline: e.target.value })}
                      className="h-12 rounded-2xl border-slate-200 bg-slate-50 dark:bg-slate-950 px-4"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-4">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Governance Velocity</label>
                    <span className="text-sm font-black text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100 dark:bg-indigo-950/30 dark:border-indigo-900/50">{formData.progress}%</span>
                  </div>
                  <div className="relative h-2 w-full group">
                    {/* Track Fill Background */}
                    <div
                      className="absolute inset-y-0 left-0 bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-full transition-all duration-300 ease-out shadow-[0_0_15px_rgba(79,70,229,0.3)]"
                      style={{ width: `${formData.progress}%` }}
                    />
                    <input
                      type="range"
                      min="0"
                      max="100"
                      className="absolute inset-0 w-full h-full appearance-none bg-slate-100 rounded-full cursor-pointer accent-transparent focus:outline-none bg-transparent dark:bg-slate-800"
                      value={formData.progress}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, progress: Number(e.target.value) })}
                      style={{
                        WebkitAppearance: 'none',
                        background: 'rgba(241, 245, 249, 0.5)'
                      }}
                    />
                  </div>
                  <p className="mt-3 text-[10px] font-medium text-slate-400 italic">Modify progress based on workstream audit logs</p>
                </div>

                <div className="flex justify-end gap-3 pt-6 border-t border-slate-100 dark:border-slate-800">
                  <Button variant="ghost" type="button" className="rounded-2xl h-12 px-6 font-bold" onClick={() => setIsModalOpen(false)}>Discard</Button>
                  <Button type="submit" disabled={isUpdating} className="h-12 bg-indigo-600 hover:bg-indigo-700 text-white px-8 rounded-2xl font-black uppercase tracking-widest text-[11px] shadow-lg shadow-indigo-600/20 active:scale-[0.98] transition-all">
                    {isUpdating ? (
                      <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Persisting...</>
                    ) : (
                      <>Sync Refinements</>
                    )}
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 3. Portfolio Allocation (Insights) */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="rounded-[2.5rem] border border-slate-200 bg-white p-8 dark:border-slate-800 dark:bg-slate-900 shadow-sm">
          <h3 className="text-xl font-black uppercase tracking-tight mb-8">Resource Load Index</h3>
          <div className="h-64 w-full flex items-center justify-center">
            <div className="relative flex items-center justify-center h-48 w-48 rounded-full border-[16px] border-emerald-500 border-t-indigo-600 border-l-amber-500 shadow-inner">
              <div className="text-center">
                <p className="text-3xl font-black text-slate-900 dark:text-white">{users.length}</p>
                <p className="text-[10px] font-black uppercase text-slate-400">Engaged Devs</p>
              </div>
            </div>
          </div>
          <div className="mt-8 space-y-3">
            <div className="flex justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100">
              <span className="text-[10px] font-black uppercase text-slate-500">Avg Tasks per User</span>
              <span className="text-xs font-black">4.2 Units</span>
            </div>
            <div className="flex justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100">
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
            <p className="text-indigo-100 text-lg leading-relaxed max-w-md font-medium">
              Portfolio delivery velocity has increased by <span className="text-white font-black underline decoration-indigo-400 underline-offset-4">14.2%</span> this quarter.
              One critical workstream requires immediate resource reallocation to meet Q4 targets.
            </p>
            <div className="mt-auto pt-10 flex gap-4">
              <Button className="bg-white text-indigo-900 hover:bg-white/90 font-black uppercase tracking-widest text-[10px] h-12 px-8 rounded-2xl shadow-xl transition-all">
                View Mitigation Plan
              </Button>
              <Button variant="ghost" className="text-white border border-white/20 hover:bg-white/10 font-black uppercase tracking-widest text-[10px] h-12 px-8 rounded-2xl transition-all">
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
