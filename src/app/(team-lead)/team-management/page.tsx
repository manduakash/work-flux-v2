"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, Search, UserPlus, UserMinus,
  FolderKanban, ArrowRight, ShieldCheck,
  Briefcase, Activity
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
  "Project : ": string;
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

  let tasks: AssignedTask[] = [];
  try {
    tasks = typeof dev.AssignedTaskJSON === 'string'
      ? JSON.parse(dev.AssignedTaskJSON)
      : (dev.AssignedTaskJSON || []);
  } catch (e) { }

  const currentSelectedProject = activeProjects.find((p: any) => p.ProjectID.toString() === selectedProjectId);
  const isAssigned = tasks.some(t =>
    t["Project : "]?.trim().toLowerCase() === currentSelectedProject?.ProjectName?.trim().toLowerCase()
  );

  const projectMap = new Map<string, string[]>();
  tasks.forEach(t => {
    const pName = t["Project : "]?.trim();
    const tName = t.Task?.trim();
    if (pName) {
      if (!projectMap.has(pName)) projectMap.set(pName, []);
      if (tName) projectMap.get(pName)!.push(tName);
    }
  });

  return (
    <motion.div
      layout
      className={cn(
        "group overflow-hidden rounded-[2rem] border transition-all duration-300",
        isAssigned
          ? "bg-indigo-50/30 border-indigo-100 dark:bg-indigo-950/20 dark:border-indigo-900/40"
          : "bg-white border-slate-100 dark:bg-slate-900/50 dark:border-slate-800"
      )}
    >
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center justify-between p-6 cursor-pointer"
      >
        <div className="flex items-center gap-5">
          <div className={cn(
            "h-14 w-14 rounded-2xl flex items-center justify-center font-black text-xl shadow-sm transition-all group-hover:scale-105",
            isAssigned ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-400 dark:bg-slate-800"
          )}>
            {dev.UserFullName.charAt(0)}
          </div>
          <div>
            <p className="text-base font-black text-slate-900 dark:text-white uppercase tracking-tight">{dev.UserFullName}</p>
            <div className="flex items-center gap-3 mt-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                <Briefcase size={12} className="text-indigo-400" />
                {projectMap.size} Projects
              </span>
              <span className="text-slate-200 dark:text-slate-700">|</span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                <Activity size={12} className="text-indigo-400" />
                {tasks.length} Tasks
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {!isAssigned && (
            <Button
              size="icon"
              variant="ghost"
              className="h-10 w-10 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-600/20 transition-all active:scale-95"
              onClick={(e) => {
                e.stopPropagation();
                onAssign(dev.UserID);
              }}
            >
              <UserPlus size={18} />
            </Button>
          )}
          <motion.div
            animate={{ rotate: isExpanded ? 90 : 0 }}
            className="text-slate-300"
          >
            <ArrowRight size={20} />
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
            <div className="p-8 space-y-8 bg-white/50 dark:bg-black/5">
              {projectMap.size > 0 ? (
                Array.from(projectMap.entries()).map(([pName, pTasks], pIdx) => (
                  <div key={pIdx} className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-1.5 rounded-full bg-indigo-600" />
                        <span className="text-[11px] font-black uppercase tracking-[0.2em] text-indigo-600 dark:text-indigo-400">
                          {pName}
                        </span>
                      </div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase">{pTasks.length} Units</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pl-4 border-l border-slate-100 dark:border-slate-800">
                      {pTasks.map((tn, tIdx) => (
                        <div key={tIdx} className="flex items-center gap-3 p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-50 dark:border-slate-800 group/task">
                          <div className="h-2 w-2 rounded-full bg-slate-200 dark:bg-slate-700 group-hover/task:bg-indigo-400 transition-colors" />
                          <span className="text-xs font-medium text-slate-600 dark:text-slate-400 group-hover/task:text-slate-900 dark:group-hover/task:text-slate-200 transition-colors cursor-default">
                            {tn}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-8 text-center bg-slate-50/50 dark:bg-slate-900/50 rounded-[2rem] border border-dashed border-slate-100 dark:border-slate-800">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Neutral Resource - No Active Directives</p>
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


  // 1. Fetch data from both APIs
  useEffect(() => {
    fetchData();
  }, [])

  const fetchData = async () => {
    try {
      const [projRes, devRes] = await Promise.all([
        callGetAPIWithToken("projects/projects-by-user-id"),
        callGetAPIWithToken("projects/available-developers")
      ]);
      setActiveProjects(projRes.data);
      setActiveDevelopers(devRes.data);
    } catch (error) {
      console.log("Error fetching team management data", error);
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
        toast.success(response.message || "Resource deployed to workstream");
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
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">Resource Deployment</h1>
          <p className="text-slate-500 dark:text-slate-400">Strategically assign technical personnel to active project workstreams.</p>
        </div>
        <div className="flex items-center gap-3 rounded-2xl bg-emerald-50 px-4 py-2 border border-emerald-100 dark:bg-emerald-950/20 dark:border-emerald-900/50">
          <ShieldCheck className="text-emerald-600" size={20} />
          <span className="text-xs font-black uppercase tracking-widest text-emerald-700 dark:text-emerald-400">Lead Authorization Active</span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">

        {/* Left Pane: Project Selector */}
        <div className="lg:col-span-4 space-y-4">
          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Active Workstreams</h3>
          <div className="space-y-3">
            {(activeProjects || []).map((project) => {
              const storeProject = projects.find(p => p.id === project.ProjectID.toString());

              const assignedCount = (activeDevelopers || []).filter(dev => {
                try {
                  const tasks = typeof dev.AssignedTaskJSON === 'string'
                    ? JSON.parse(dev.AssignedTaskJSON)
                    : (dev.AssignedTaskJSON || []);
                  return tasks.some((t: any) => t["Project : "]?.trim().toLowerCase() === project.ProjectName?.trim().toLowerCase());
                } catch (e) {
                  return false;
                }
              }).length;

              const progress = storeProject?.progressPercentage || 0;

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
                    <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white uppercase">Manage Team</h2>
                    <p className="text-sm text-slate-500 mt-1">Project: <span className="font-bold text-indigo-600">{selectedProject?.name}</span></p>
                  </div>
                  <div className="relative group w-full md:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      placeholder="Find developer..."
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
                    <p className="text-slate-400 font-bold italic uppercase tracking-widest text-xs">No matching resources found</p>
                  </div>
                )}
              </motion.div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center rounded-[2.5rem] border-2 border-dashed border-slate-200 p-20 text-center dark:border-slate-800">
                <div className="h-20 w-20 rounded-full bg-slate-50 flex items-center justify-center mb-6 dark:bg-slate-900">
                  <Briefcase className="text-slate-300" size={32} />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white leading-tight">Project Selection Required</h3>
                <p className="text-sm text-slate-500 mt-2 max-w-xs mx-auto">Please select an active workstream from the left panel to begin resource deployment.</p>
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