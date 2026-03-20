"use client";

import React, { useMemo, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldCheck, CheckCircle2, Clock, Users, Zap, Target, Filter,
  Flag, ChevronRight, Archive, Loader2, Pencil, X, UserCircle2,
  ChevronDown
} from 'lucide-react';

import { useStore } from "@/store/useStore";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { callGetAPIWithToken, callAPIWithToken, getUserIdFromToken } from '@/components/apis/commonAPIs';
import { toast } from 'sonner';

export default function ProjectOversight() {
  const { users, updateProject } = useStore();
  const [apiProjects, setApiProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Track which project's team is currently visible
  const [expandedTeamId, setExpandedTeamId] = useState<number | null>(null);

  // ... [Existing Modal States: isModalOpen, isUpdating, editingProject, etc.]
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [editingProject, setEditingProject] = useState<any>(null);

  // Developer popover state
  const [devPopover, setDevPopover] = useState<{ open: boolean; devs: string[]; anchor: HTMLElement | null }>({ open: false, devs: [], anchor: null });

  // Master Data for Dropdowns
  const [statusData, setStatusData] = useState<any[]>([]);
  const [priorityData, setPriorityData] = useState<any[]>([]);
  const [typeData, setTypeData] = useState<any[]>([]);
  const [formData, setFormData] = useState({ name: '', description: '', deadline: '', progress: 0, statusId: '', priorityId: '', typeId: '' });

  useEffect(() => {
    fetchApiProjects();
    fetchMasterData();
  }, []);

  // Safe Parsing for DeveloperArray
  const parseDevelopers = (devString: string): string[] => {
    try {
      return JSON.parse(devString || "[]");
    } catch (e) {
      return [];
    }
  };

  const fetchApiProjects = async () => {
    setLoading(true);
    try {
      const response = await callGetAPIWithToken('projects/projects-by-user-id');
      if (response.success) setApiProjects(response.data);
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
    } catch (e) { console.error(e); }
  };

  const handleOpenEditModal = (project: any) => {
    setEditingProject(project);
    setFormData({
      name: project.ProjectName || '',
      description: project.ProjectDescription || '',
      deadline: (project.ProjectDeadline || project.Deadline) ? (project.ProjectDeadline || project.Deadline).split('T')[0] : '',
      progress: project.ProgressPercentage || 0,
      statusId: statusData.find(s => s.ProjectStatusName === project.ProjectStatusName)?.ProjectStatusID?.toString() || '',
      priorityId: priorityData.find(p => p?.PriorityName === project.ProjectPriorityName)?.PriorityID?.toString() || '',
      typeId: typeData.find(t => t.ProjectTypeName === project.ProjectTypeName)?.ProjectTypeID?.toString() || ''
    });
    setIsModalOpen(true);
  };

  const handleSubmitUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    const toastId = toast.loading('Saving changes...');
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
        ProjectLeadID: Number(getUserIdFromToken() || 0),
      };
      const result = await callAPIWithToken('projects', payload);
      if (result.success) {
        toast.success('Updated successfully', { id: toastId });
        setIsModalOpen(false);
        fetchApiProjects();
      }
    } finally { setIsUpdating(false); }
  };

  return (
    <div className="max-w-[1600px] mx-auto space-y-8 animate-in fade-in duration-700">

      {/* Header */}
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <h1 className="text-3xl font-black tracking-tight uppercase text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-indigo-400">
          Project Oversight
        </h1>
      </div>

      <div className="rounded-[2.5rem] border border-slate-200 bg-white overflow-hidden shadow-xl shadow-slate-200/20 dark:border-slate-800 dark:bg-slate-900 min-h-[400px]">
        {/* <div className="px-8 py-6 border-b border-slate-50 flex items-center justify-between dark:border-slate-800">
          <h3 className="text-xl font-black uppercase tracking-tight leading-none">Project Details & List</h3>
          <Button variant="outline" className="h-10 rounded-xl font-bold text-[10px] uppercase tracking-widest border-slate-200">
            <Filter size={14} className="mr-2" /> Global Filter
          </Button>
        </div> */}

        <div className={`p-6 bg-gradient-to-r to-purple-400 from-indigo-600 text-white relative overflow-hidden mb-0`}>
          <div className="absolute inset-0 opacity-70 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/straws.png')] " />
          <div className="relative flex items-center justify-between">
            <h1 className="text-3xl font-bold text-white">Project List & Details</h1>
            <Button variant="outline" className="h-10 rounded-xl font-bold text-[10px] bg-transparent uppercase tracking-widest border-slate-200">
              <Filter size={14} className="mr-2" /> Global Filter
            </Button>
          </div>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 gap-4">
              <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
              <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Hydrating data pools...</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100 dark:bg-slate-800/50 dark:border-slate-800">
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Project Workspace</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Category</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Stage</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Progress</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Priority</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
                {apiProjects.map((p) => (
                  <React.Fragment key={p?.ProjectID}>
                    <motion.tr
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className={cn(
                        "group transition-all duration-300",
                        expandedTeamId === p?.ProjectID ? "bg-indigo-50/30 dark:bg-indigo-900/10" : "hover:bg-slate-50/40"
                      )}
                    >
                      <td className="px-8 py-6">
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-900 dark:text-white text-base leading-tight">{p?.ProjectName}</span>
                        </div>
                      </td>

                      <td className="px-8 py-6">
                        <div className="flex items-center gap-2.5">
                          <div className="h-7 w-7 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 dark:bg-indigo-950">
                            <Archive size={12} />
                          </div>
                          <span className="text-xs font-bold text-slate-600 dark:text-slate-300">{p?.ProjectTypeName}</span>
                        </div>
                      </td>

                      <td className="px-8 py-6">
                        <span className={cn(
                          "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border",
                          p?.ProjectStatusName === 'Active' ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-slate-50 text-slate-500 border-slate-100"
                        )}>
                          <div className={cn("h-1.5 w-1.5 rounded-full", p?.ProjectStatusName === 'Active' ? "bg-emerald-500" : "bg-slate-400")} />
                          {p?.ProjectStatusName}
                        </span>
                      </td>

                      <td className="px-8 py-6 min-w-[150px]">
                        <div className="flex items-center gap-3">
                          <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden dark:bg-slate-800">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${p?.ProgressPercentage || 0}%` }}
                              className="h-full bg-indigo-600 rounded-full"
                            />
                          </div>
                          <span className="text-xs font-black text-slate-700">{p?.ProgressPercentage || 0}%</span>
                        </div>
                      </td>

                      <td className="px-8 py-6">
                        <div className="flex items-center gap-2">
                          <Flag size={14} className={p?.ProjectPriorityName === 'Critical' ? 'text-rose-500 fill-rose-500' : 'text-slate-300'} />
                          <span className="text-xs font-bold text-slate-600">{p?.ProjectPriorityName}</span>
                        </div>
                      </td>

                      <td className="px-8 py-6 text-right">
                        <div className="flex justify-end gap-2">
                          {/* EDIT BUTTON */}
                          <Button variant="ghost" size="icon" onClick={() => handleOpenEditModal(p)} className="h-9 w-9 rounded-xl hover:bg-white border border-transparent hover:border-slate-200">
                            <Pencil size={15} className="text-slate-400 group-hover:text-indigo-600 transition-colors" />
                          </Button>

                          {/* MIDDLE BUTTON: TEAM DISPLAY */}
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setExpandedTeamId(expandedTeamId === p?.ProjectID ? null : p?.ProjectID)}
                            className={cn(
                              "h-9 w-9 rounded-xl border transition-all duration-300",
                              expandedTeamId === p?.ProjectID
                                ? "bg-indigo-600 text-white border-indigo-600"
                                : "hover:bg-white border-transparent hover:border-slate-200 text-slate-400 hover:text-indigo-600"
                            )}
                          >
                            <Users size={16} />
                          </Button>

                        </div>
                      </td>
                    </motion.tr>

                    {/* EXPANDED TEAM SECTION */}
                    <AnimatePresence>
                      {expandedTeamId === p?.ProjectID && (
                        <tr>
                          <td colSpan={6} className="p-0 border-none overflow-hidden">
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="bg-slate-50/80 dark:bg-slate-800/20 border-b border-slate-100"
                            >
                              <div className="px-10 py-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
                                <div className="space-y-1">
                                  <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-indigo-600">Assigned Resources</h4>
                                  <p className="text-xs text-slate-400 font-medium italic">Active contributors on this workspace</p>
                                </div>

                                <div className="flex flex-wrap gap-4">
                                  {parseDevelopers(p?.DeveloperArray).length > 0 ? (
                                    parseDevelopers(p?.DeveloperArray).map((dev, i) => (
                                      <motion.div
                                        key={i}
                                        initial={{ x: -10, opacity: 0 }}
                                        animate={{ x: 0, opacity: 1 }}
                                        transition={{ delay: i * 0.05 }}
                                        className="flex items-center gap-3 bg-white dark:bg-slate-900 px-4 py-2.5 rounded-2xl border border-slate-200 shadow-sm"
                                      >
                                        <div className="h-8 w-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-black text-[10px] text-slate-500 border-2 border-slate-200">
                                          {dev.split(' ').map(n => n[0]).join('')}
                                        </div>
                                        <span className="text-[11px] font-bold text-slate-700 dark:text-slate-200">{dev}</span>
                                      </motion.div>
                                    ))
                                  ) : (
                                    <div className="flex items-center gap-2 text-slate-400">
                                      <UserCircle2 size={16} />
                                      <span className="text-[10px] font-bold uppercase tracking-widest italic">No developers synced</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </motion.div>
                          </td>
                        </tr>
                      )}
                    </AnimatePresence>
                  </React.Fragment>
                ))}
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
                  <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white uppercase">Edit Project</h2>
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
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Project Status</label>
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
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Priority</label>
                    <select
                      className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all dark:bg-slate-950 dark:border-slate-800"
                      value={formData.priorityId}
                      onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFormData({ ...formData, priorityId: e.target.value })}
                    >
                      {priorityData.map(p => <option key={p.PriorityID} value={p.PriorityID}>{p.PriorityName}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Deadline</label>
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
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Project Progress</label>
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
                  <p className="mt-3 text-[10px] font-medium text-slate-400 italic">Update progress based on recent work</p>
                </div>

                <div className="flex justify-end gap-3 pt-6 border-t border-slate-100 dark:border-slate-800">
                  <Button variant="ghost" type="button" className="rounded-2xl h-12 px-6 font-bold" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                  <Button type="submit" disabled={isUpdating} className="h-12 bg-indigo-600 hover:bg-indigo-700 text-white px-8 rounded-2xl font-black uppercase tracking-widest text-[11px] shadow-lg shadow-indigo-600/20 active:scale-[0.98] transition-all">
                    {isUpdating ? (
                      <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Persisting...</>
                    ) : (
                      <>Save Changes</>
                    )}
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 3. Portfolio Allocation (Insights) */}
      {/* Team Workload and Updates & Tips sections removed as requested */}
      {/* Developer Popover */}
      {devPopover.open && (
        <div
          className="fixed inset-0 z-50"
          onClick={() => setDevPopover({ open: false, devs: [], anchor: null })}
          style={{ pointerEvents: 'auto' }}
        >
          <div
            className="absolute"
            style={{
              left: devPopover.anchor?.getBoundingClientRect().left ?? 0,
              top: (devPopover.anchor?.getBoundingClientRect().bottom ?? 0) + window.scrollY + 8,
              minWidth: 200,
              background: 'white',
              borderRadius: '1rem',
              boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
              border: '1px solid #e2e8f0',
              padding: '1rem',
              zIndex: 1000
            }}
            onClick={e => e.stopPropagation()}
          >
            <div className="mb-2 text-xs font-bold uppercase tracking-widest text-slate-400">Developers</div>
            {devPopover.devs.length > 0 ? (
              <ul className="space-y-1">
                {devPopover.devs.map((dev, idx) => (
                  <li key={idx} className="text-sm font-semibold text-slate-700 py-1 px-2 rounded hover:bg-slate-100">{dev}</li>
                ))}
              </ul>
            ) : (
              <div className="text-xs text-slate-400 italic">No developers assigned</div>
            )}
            <button
              className="mt-4 w-full py-1.5 rounded-lg bg-indigo-50 text-indigo-600 font-bold text-xs hover:bg-indigo-100 transition"
              onClick={() => setDevPopover({ open: false, devs: [], anchor: null })}
            >Close</button>
          </div>
        </div>
      )}
    </div>
  );
}