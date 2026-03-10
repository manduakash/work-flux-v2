"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, Search, UserPlus, UserMinus,
  FolderKanban, ArrowRight, ShieldCheck,
  Briefcase, Activity, ChevronRight, Target
} from 'lucide-react';
import { toast } from 'sonner';

import { useStore } from "@/store/useStore";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { UserRole } from '@/types';
import { callGetAPIWithToken, callAPIWithToken } from '@/components/apis/commonAPIs';

export interface AssignedTask {
  Task: string;
  Project?: string;
  "Project : "?: string;
}

export interface APIProject {
  ProjectID: number;
  ProjectTypeName: string;
  ProjectStatusName: string;
  ProjectPriorityName: string;
  ProjectName: string;
}

export interface APIDeveloper {
  UserID: number;
  UserFullName: string;
  AssignedTaskJSON: string | AssignedTask[];
}

// --- Sub-Component: Expandable Developer Card ---
const DeveloperCard = ({ dev, activeProjects, selectedProjectId, onAssign }: any) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const tasks: AssignedTask[] = useMemo(() => {
    try {
      return typeof dev.AssignedTaskJSON === 'string'
        ? JSON.parse(dev.AssignedTaskJSON)
        : (dev.AssignedTaskJSON || []);
    } catch (e) {
      return [];
    }
  }, [dev.AssignedTaskJSON]);

  const getProjectName = (t: AssignedTask) => (t["Project : "] || t["Project"] || "").trim();

  const currentSelectedProject = useMemo(() =>
    activeProjects.find((p: any) => p.ProjectID.toString() === selectedProjectId),
    [activeProjects, selectedProjectId]
  );

  const isAssigned = useMemo(() =>
    tasks.some(t =>
      getProjectName(t).toLowerCase() === currentSelectedProject?.ProjectName?.trim().toLowerCase()
    ),
    [tasks, currentSelectedProject]
  );

  const projectMap = useMemo(() => {
    const map = new Map<string, string[]>();
    tasks.forEach(t => {
      const pName = getProjectName(t);
      const tName = t.Task?.trim();
      if (pName) {
        if (!map.has(pName)) map.set(pName, []);
        if (tName) map.get(pName)!.push(tName);
      }
    });
    return map;
  }, [tasks]);

  const totalValidTasks = useMemo(() => {
    let count = 0;
    projectMap.forEach(tasksList => {
      count += tasksList.length;
    });
    return count;
  }, [projectMap]);

  return (
    <motion.div
      layout
      className={cn(
        "group overflow-hidden rounded-[2.5rem] border transition-all duration-500",
        isAssigned
          ? "bg-indigo-50/40 border-indigo-200 dark:bg-indigo-950/20 dark:border-indigo-900/40 shadow-lg shadow-indigo-600/5"
          : "bg-white border-slate-100 hover:border-slate-300 dark:bg-slate-900/50 dark:border-slate-800 dark:hover:border-slate-700 shadow-sm"
      )}
    >
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center justify-between p-7 cursor-pointer"
      >
        <div className="flex items-center gap-6">
          <div className="relative">
            <div className={cn(
              "h-16 w-16 rounded-[1.5rem] flex items-center justify-center font-black text-2xl shadow-inner transition-all duration-500 group-hover:scale-105 group-hover:rotate-1",
              isAssigned ? "bg-indigo-600 text-white shadow-indigo-600/20" : "bg-slate-100 text-slate-400 dark:bg-slate-800"
            )}>
              {dev.UserFullName.charAt(0)}
            </div>
            {isAssigned && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-indigo-600 border-2 border-white dark:border-slate-950"
              >
                <ShieldCheck size={12} className="text-white" />
              </motion.div>
            )}
          </div>
          <div>
            <p className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter leading-none">{dev.UserFullName}</p>
            <div className="flex items-center gap-4 mt-2">
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                <Briefcase size={12} className="text-indigo-500" />
                <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">{projectMap.size} Projects</span>
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                <Activity size={12} className="text-indigo-500" />
                <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">{totalValidTasks} Tasks</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-5">
          {!isAssigned && (
            <Button
              className="h-12 rounded-2xl bg-indigo-600 px-6 font-black uppercase tracking-widest text-[10px] shadow-xl shadow-indigo-600/20 hover:bg-indigo-700 hover:scale-[1.02] active:scale-[0.98] transition-all"
              onClick={(e) => {
                e.stopPropagation();
                onAssign(dev.UserID);
              }}
            >
              <UserPlus size={16} className="mr-2" />
              Assign
            </Button>
          )}
          <motion.div
            animate={{ rotate: isExpanded ? 90 : 0 }}
            className="h-10 w-10 flex items-center justify-center rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-400"
          >
            <ChevronRight size={20} />
          </motion.div>
        </div>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-slate-100 dark:border-slate-800/50"
          >
            <div className="p-8 space-y-10 bg-slate-50/30 dark:bg-black/10">
              {projectMap.size > 0 ? (
                Array.from(projectMap.entries()).map(([pName, pTasks], pIdx) => (
                  <motion.div
                    key={pIdx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: pIdx * 0.1 }}
                    className="space-y-5"
                  >
                    <div className="flex items-center justify-between px-2">
                      <div className="flex items-center gap-3">
                        <div className="h-5 w-1 bg-indigo-600 rounded-full" />
                        <h4 className="text-[13px] font-black uppercase tracking-[0.2em] text-slate-800 dark:text-slate-200">
                          {pName}
                        </h4>
                      </div>
                      <span className="px-3 py-1 rounded-full bg-white dark:bg-slate-800 text-[9px] font-black text-slate-400 uppercase shadow-sm border border-slate-100 dark:border-slate-700">
                        {pTasks.length} Active Tasks
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {pTasks.map((tn: string, tIdx: number) => (
                        <div
                          key={tIdx}
                          className="group/task relative flex items-center justify-between p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 hover:border-indigo-200 dark:hover:border-indigo-900/50 transition-all hover:shadow-md"
                        >
                          <div className="flex items-center gap-4">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400">
                              <Target size={18} />
                            </div>
                            <div>
                              <p className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-tight">{tn}</p>
                              <p className="text-[9px] font-medium text-slate-400 uppercase tracking-widest mt-0.5">Assigned Task</p>
                            </div>
                          </div>
                          <div className="flex items-center">
                            <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" title="In Progress" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="py-12 text-center rounded-[2.5rem] border border-dashed border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-950/50">
                  <div className="h-14 w-14 rounded-full bg-slate-50 dark:bg-slate-900 flex items-center justify-center mx-auto mb-4 border border-slate-100 dark:border-slate-800">
                    <Activity size={24} className="text-slate-300" />
                  </div>
                  <h5 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">No Active Work</h5>
                  <p className="text-[10px] font-medium text-slate-500 mt-2">No tasks currently assigned to this member.</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default function TeamManagement() {
  const { projects, users, updateProject } = useStore();

  // Local state for the selected project to manage
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeProjects, setActiveProjects] = useState<APIProject[]>([]);
  const [activeDevelopers, setActiveDevelopers] = useState<APIDeveloper[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 1. Fetch data from both APIs
  useEffect(() => {
    fetchData();
  }, [])

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [projRes, devRes] = await Promise.all([
        callGetAPIWithToken("projects/projects-by-user-id"),
        callGetAPIWithToken("projects/available-developers")
      ]);

      if (projRes?.success) setActiveProjects(projRes.data || []);
      if (devRes?.success) setActiveDevelopers(devRes.data || []);
    } catch (error) {
      console.error("Error fetching team management data", error);
      toast.error("Update Failed", { description: "Unable to retrieve team data." });
    } finally {
      setIsLoading(false);
    }
  }

  const selectedProject = useMemo(() =>
    projects.find(p => p.id === selectedProjectId),
    [projects, selectedProjectId]);

  // 2. Filter available developers from API
  const filteredDevelopers = useMemo(() => {
    return (activeDevelopers || []).filter(d =>
      d.UserFullName?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [activeDevelopers, searchQuery]);

  // 3. Assignment Logic
  const handleToggleAssignment = async (devUserId: number) => {
    if (!selectedProjectId) {
      toast.error("Please select a project first");
      return;
    }

    // We only support assignment for now as per user request
    try {
      const response = await callAPIWithToken("projects/assign-user", {
        userId: devUserId,
        projectId: parseInt(selectedProjectId)
      });

      if (response?.success) {
        toast.success(response.message || "Member assigned to project");
        // Refresh data to reflect changes
        fetchData();
      } else {
        toast.error(response?.message || "Failed to assign resource");
      }
    } catch (error: any) {
      console.error("Assignment error:", error);
      toast.error(error.message || "An error occurred during assignment");
    }
  };

  return (
    <div className="max-w-[1400px] mx-auto space-y-8 animate-in fade-in duration-700">

      {/* Header Section */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">Team Assignment</h1>
          <p className="text-slate-500 dark:text-slate-400">Assign team members to projects.</p>
        </div>
        <div className="flex items-center gap-3 rounded-2xl bg-emerald-50 px-4 py-2 border border-emerald-100 dark:bg-emerald-950/20 dark:border-emerald-900/50">
          <ShieldCheck className="text-emerald-600" size={20} />
          <span className="text-xs font-black uppercase tracking-widest text-emerald-700 dark:text-emerald-400">Team Lead Access</span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">

        {/* Left Pane: Project Selector */}
        <div className="lg:col-span-4 space-y-4">
          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Active Projects</h3>
          <div className="space-y-3">
            {isLoading ? (
              <div className="space-y-3 animate-pulse">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-24 w-full rounded-[2rem] bg-slate-100 dark:bg-slate-800" />
                ))}
              </div>
            ) : (
              <>
                {(activeProjects || []).map((project) => {
                  const storeProject = projects.find(p => p.id === project.ProjectID.toString());

                  const assignedCount = (activeDevelopers || []).filter(dev => {
                    try {
                      const tasks = typeof dev.AssignedTaskJSON === 'string'
                        ? JSON.parse(dev.AssignedTaskJSON)
                        : (dev.AssignedTaskJSON || []);
                      return tasks.some((t: any) => {
                        const pName = (t["Project : "] || t["Project"] || "").trim();
                        return pName.toLowerCase() === project.ProjectName?.trim().toLowerCase();
                      });
                    } catch (e) {
                      return false;
                    }
                  }).length;

                  return (
                    <button
                      key={project.ProjectID}
                      onClick={() => setSelectedProjectId(project.ProjectID.toString())}
                      className={cn(
                        "w-full text-left p-5 rounded-[2rem] border transition-all duration-300",
                        selectedProjectId === project.ProjectID.toString()
                          ? "bg-white border-indigo-600 shadow-xl shadow-indigo-500/10 ring-1 ring-indigo-600 dark:bg-slate-900"
                          : "bg-white border-slate-100 hover:border-indigo-200 dark:bg-slate-900/50 dark:border-slate-800"
                      )}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className={cn(
                          "h-10 w-10 rounded-xl flex items-center justify-center transition-colors",
                          selectedProjectId === project.ProjectID.toString() ? "bg-indigo-600 text-white" : "bg-slate-50 text-slate-400 dark:bg-slate-800"
                        )}>
                          <FolderKanban size={20} />
                        </div>
                        <div className="flex flex-col items-end">
                          <span className="text-[9px] font-black uppercase text-indigo-500">{project.ProjectStatusName}</span>
                          <span className="text-[10px] font-bold text-slate-400">{assignedCount} Assigned</span>
                        </div>
                      </div>
                      <h4 className="font-bold text-slate-900 dark:text-white leading-tight mt-1">{project.ProjectName}</h4>
                    </button>
                  );
                })}
                {activeProjects.length === 0 && (
                  <div className="p-10 text-center rounded-[2.5rem] border-2 border-dashed border-slate-100 dark:border-slate-800">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">No active projects found</p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Right Pane: Resource Allocation */}
        <div className="lg:col-span-8">
          <AnimatePresence mode="wait">
            {selectedProjectId ? (
              <motion.div
                key={selectedProjectId}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="rounded-[2.5rem] border border-slate-200 bg-white p-8 dark:border-slate-800 dark:bg-slate-900 shadow-sm"
              >
                <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between mb-8">
                  <div>
                    <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white uppercase">Assign Members</h2>
                    <p className="text-sm text-slate-500 mt-1">Project: <span className="font-bold text-indigo-600">{selectedProject?.name}</span></p>
                  </div>
                  <div className="relative group w-full md:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      placeholder="Find team member..."
                      className="pl-10 h-11 rounded-2xl bg-slate-50 border-none dark:bg-slate-800"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  {filteredDevelopers.map((dev) => (
                    <DeveloperCard
                      key={dev.UserID}
                      dev={dev}
                      activeProjects={activeProjects}
                      selectedProjectId={selectedProjectId}
                      onAssign={handleToggleAssignment}
                    />
                  ))}
                </div>

                {filteredDevelopers.length === 0 && (
                  <div className="py-20 text-center flex flex-col items-center">
                    <Users size={48} className="text-slate-200 mb-4" />
                    <p className="text-slate-400 font-bold italic uppercase tracking-widest text-xs">No team members found</p>
                  </div>
                )}
              </motion.div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center rounded-[2.5rem] border-2 border-dashed border-slate-200 p-20 text-center dark:border-slate-800">
                <div className="h-20 w-20 rounded-full bg-slate-50 flex items-center justify-center mb-6 dark:bg-slate-900">
                  <Briefcase className="text-slate-300" size={32} />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white leading-tight">Project Selection Required</h3>
                <p className="text-sm text-slate-500 mt-2 max-w-xs mx-auto">Please select a project from the left panel to start assigning team members.</p>
                <div className="mt-8 flex items-center gap-2 text-indigo-600">
                  <ArrowRight size={20} className="animate-bounce-x" />
                </div>
              </div>
            )}
          </AnimatePresence>
        </div>

      </div>
    </div>
  );
}