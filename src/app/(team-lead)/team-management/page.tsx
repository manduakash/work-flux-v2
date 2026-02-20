"use client";

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, Search, UserPlus, UserMinus, 
  FolderKanban, CheckCircle2, AlertCircle, 
  ArrowRight, ShieldCheck, Briefcase, Filter,
  TrendingUp, Activity
} from 'lucide-react';
import { toast } from 'sonner';

import { useStore } from "@/store/useStore";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { UserRole, ProjectStatus } from '@/types';

export default function TeamManagement() {
  const { projects, users, updateProject, currentUser } = useStore();
  
  // Local state for the selected project to manage
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // 1. Filter Active Projects managed by this Lead (or all if Management)
  const activeProjects = useMemo(() => {
    return projects.filter(p => {
      const isLead = p.assignedLeadId === currentUser?.id;
      const isActive = p.status === ProjectStatus.ACTIVE || p.status === ProjectStatus.PLANNING;
      return (currentUser?.role === UserRole.MANAGEMENT || isLead) && isActive;
    });
  }, [projects, currentUser]);

  const selectedProject = useMemo(() => 
    projects.find(p => p.id === selectedProjectId), 
  [projects, selectedProjectId]);

  // 2. Filter available developers
  const developers = useMemo(() => 
    users.filter(u => u.role === UserRole.DEVELOPER), 
  [users]);

  const filteredDevelopers = useMemo(() => {
    return developers.filter(d => 
      d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.username.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [developers, searchQuery]);

  // 3. Assignment Logic
  const handleToggleAssignment = (devId: string) => {
    if (!selectedProjectId || !selectedProject) {
      toast.error("Please select a project first");
      return;
    }

    const isCurrentlyAssigned = selectedProject.assignedDeveloperIds.includes(devId);
    let updatedIds: string[];

    if (isCurrentlyAssigned) {
      updatedIds = selectedProject.assignedDeveloperIds.filter(id => id !== devId);
      toast.info("Resource detached from workstream");
    } else {
      updatedIds = [...selectedProject.assignedDeveloperIds, devId];
      toast.success("Resource deployed to workstream");
    }

    updateProject(selectedProjectId, { assignedDeveloperIds: updatedIds });
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
            {activeProjects.map((project) => (
              <button
                key={project.id}
                onClick={() => setSelectedProjectId(project.id)}
                className={cn(
                  "w-full text-left p-5 rounded-[2rem] border transition-all duration-300",
                  selectedProjectId === project.id 
                    ? "bg-white border-indigo-600 shadow-xl shadow-indigo-500/10 ring-1 ring-indigo-600 dark:bg-slate-900" 
                    : "bg-white border-slate-100 hover:border-indigo-200 dark:bg-slate-900/50 dark:border-slate-800"
                )}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className={cn(
                    "h-10 w-10 rounded-xl flex items-center justify-center transition-colors",
                    selectedProjectId === project.id ? "bg-indigo-600 text-white" : "bg-slate-50 text-slate-400 dark:bg-slate-800"
                  )}>
                    <FolderKanban size={20} />
                  </div>
                  <div className="flex flex-col items-end">
                     <span className="text-[9px] font-black uppercase text-indigo-500">{project.status}</span>
                     <span className="text-[10px] font-bold text-slate-400">{project.assignedDeveloperIds.length} Assigned</span>
                  </div>
                </div>
                <h4 className="font-bold text-slate-900 dark:text-white leading-tight">{project.name}</h4>
                <div className="mt-4 flex items-center gap-2">
                   <div className="h-1 flex-1 bg-slate-100 rounded-full overflow-hidden dark:bg-slate-800">
                      <div className="h-full bg-indigo-600" style={{width: `${project.progressPercentage}%`}} />
                   </div>
                   <span className="text-[10px] font-black text-slate-400">{project.progressPercentage}%</span>
                </div>
              </button>
            ))}
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

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredDevelopers.map((dev) => {
                      const isAssigned = selectedProject?.assignedDeveloperIds.includes(dev.id);
                      
                      return (
                        <motion.div
                          key={dev.id}
                          layout
                          className={cn(
                            "group flex items-center justify-between p-5 rounded-[1.5rem] border transition-all",
                            isAssigned 
                              ? "bg-indigo-50/50 border-indigo-100 dark:bg-indigo-900/10 dark:border-indigo-900/30" 
                              : "bg-white border-slate-100 dark:bg-slate-900 dark:border-slate-800"
                          )}
                        >
                          <div className="flex items-center gap-4">
                            <div className={cn(
                              "h-12 w-12 rounded-2xl flex items-center justify-center font-black text-lg shadow-sm transition-transform group-hover:scale-105",
                              isAssigned ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-400 dark:bg-slate-800"
                            )}>
                              {dev.name.charAt(0)}
                            </div>
                            <div>
                               <p className="text-sm font-bold text-slate-900 dark:text-white">{dev.name}</p>
                               <div className="flex items-center gap-2 mt-1">
                                  <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Developer</span>
                                  <div className="h-1 w-1 rounded-full bg-slate-300" />
                                  <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-500">
                                     <Activity size={10} /> Active
                                  </div>
                               </div>
                            </div>
                          </div>

                          <Button
                            size="icon"
                            variant={isAssigned ? "secondary" : "ghost"}
                            className={cn(
                              "rounded-xl transition-all",
                              isAssigned ? "bg-rose-100 text-rose-600 hover:bg-rose-600 hover:text-white" : "bg-slate-50 text-indigo-600 hover:bg-indigo-600 hover:text-white"
                            )}
                            onClick={() => handleToggleAssignment(dev.id)}
                          >
                            {isAssigned ? <UserMinus size={18} /> : <UserPlus size={18} />}
                          </Button>
                        </motion.div>
                      );
                    })}
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