"use client";

import React, { useEffect, useState } from "react";
import {
    Calendar,
    User,
    Globe,
    Smartphone,
    Monitor,
    LayoutGrid,
    MoreVertical,
    Clock,
    Folder
} from "lucide-react";
import { Badge } from "@/components/ui/badge"; // Assuming shadcn/ui
import { Button } from "@/components/ui/button";
import { callGetAPIWithToken } from "@/components/apis/commonAPIs";
// import { callGetAPIWithToken } from "./apis/commonAPIs"; // Uncomment to use your actual API

// --- INTERFACES ---
interface Project {
    ProjectID: number;
    ProjectTypeName: string;
    ProjectStatusName: string;
    ProjectPriorityName: string;
    ProjectName: string;
    ProgressPercentage: number;
    ProjectDeadline: string;
    CreatedByID: number;
    CreatedByName: string;
}

// --- HELPER UTILITIES ---

// Format date nicely (e.g., "Jul 31, 2026")
const formatDeadline = (dateString: string) => {
    if (!dateString) return "No Deadline";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
};

// Get Badge colors for Priority
const getPriorityBadge = (priority: string) => {
    switch (priority?.toLowerCase()) {
        case "critical": return "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400 border-rose-200 dark:border-rose-800";
        case "high": return "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 border-orange-200 dark:border-orange-800";
        case "medium": return "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800";
        case "low": return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800";
        default: return "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400 border-slate-200 dark:border-slate-700";
    }
};

// Get Badge colors for Status
const getStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
        case "planning": return "bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800";
        case "active": return "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800";
        case "completed": return "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800";
        case "on hold": return "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400 border-slate-200 dark:border-slate-700";
        default: return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400 border-gray-200";
    }
};

// Get Icon based on Project Type
const getProjectTypeIcon = (type: string) => {
    switch (type?.toLowerCase()) {
        case "web app": return <Globe className="h-5 w-5 text-blue-500" />;
        case "mobile app": return <Smartphone className="h-5 w-5 text-indigo-500" />;
        case "desktop app": return <Monitor className="h-5 w-5 text-purple-500" />;
        default: return <LayoutGrid className="h-5 w-5 text-slate-500" />;
    }
};

// Progress bar color based on completion percentage
const getProgressColor = (progress: number) => {
    // if (progress === 100) return "bg-emerald-500";
    // if (progress > 50) return "bg-blue-500";
    // if (progress > 0) return "bg-amber-500";
    return "bg-purple-600 dark:bg-indigo-700";
};

export default function AssignedProjectsPage() {
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchProjects = async () => {
        try {
            const response = await callGetAPIWithToken("projects/projects-by-user-id");
            setProjects(response?.data || []);
        } catch (error) {
            console.error("Failed to fetch projects", error);
        }
    };

    useEffect(() => {
        fetchProjects();
    }, []);

    return (
        <div className="min-h-screen p-6 md:p-10">
            <div className="max-w-7xl mx-auto space-y-8">

                {/* Page Header */}
                <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white uppercase text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-indigo-400">
                            My Projects
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400 font-medium">
                            Projects currently assigned to you for development.
                        </p>
                    </div>
                </div>

                {/* Projects Grid */}
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3].map((n) => (
                            <div key={n} className="h-64 rounded-xl bg-slate-200/50 dark:bg-slate-800/50 animate-pulse border border-slate-200 dark:border-slate-800"></div>
                        ))}
                    </div>
                ) : projects.length === 0 ? (
                    <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-xl border border-dashed border-slate-300 dark:border-slate-800">
                        <Folder className="mx-auto h-12 w-12 text-slate-400 mb-4" />
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">No Projects Assigned</h3>
                        <p className="text-slate-500 mt-2">You currently don't have any active projects assigned to you.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {projects?.map((project) => (
                            <div
                                key={project.ProjectID}
                                className="group relative flex flex-col bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden"
                            >
                                {/* Card Body */}
                                <div className="p-5 flex-1 flex flex-col">
                                    {/* Header (Icon + Title + Actions) */}
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2.5 bg-slate-100 dark:bg-slate-800 rounded-lg">
                                                {getProjectTypeIcon(project.ProjectTypeName)}
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-semibold text-slate-900 dark:text-white leading-tight group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                                    {project.ProjectName}
                                                </h3>
                                                <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                                    {project.ProjectTypeName}
                                                </span>
                                            </div>
                                        </div>
                                        {/* <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 -mr-2">
                                            <MoreVertical className="h-5 w-5" />
                                        </Button> */}
                                    </div>

                                    {/* Badges */}
                                    <div className="flex flex-wrap gap-2 mb-6">
                                        <Badge variant="outline" className={getStatusBadge(project.ProjectStatusName)}>
                                            {project.ProjectStatusName}
                                        </Badge>
                                        <Badge variant="outline" className={getPriorityBadge(project.ProjectPriorityName)}>
                                            {project.ProjectPriorityName} Priority
                                        </Badge>
                                    </div>

                                    {/* Spacer to push footer down */}
                                    <div className="flex-1"></div>

                                    {/* Progress Bar */}
                                    <div className="mb-6 space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span className="font-medium text-slate-700 dark:text-slate-300">Progress</span>
                                            <span className="font-bold text-slate-900 dark:text-white">{project.ProgressPercentage}%</span>
                                        </div>
                                        <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full rounded-full transition-all duration-1000 ease-out ${getProgressColor(project.ProgressPercentage)}`}
                                                style={{ width: `${project.ProgressPercentage}%` }}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Card Footer (Deadline & Lead) */}
                                <div className="bg-slate-50 dark:bg-slate-950/50 p-4 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between text-sm">
                                    <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400" title="Project Deadline">
                                        <Clock className="h-4 w-4" />
                                        <span className="font-medium">{formatDeadline(project.ProjectDeadline)}</span>
                                    </div>

                                    <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400" title="Project Lead">
                                        <User className="h-4 w-4" />
                                        <span className="truncate max-w-[100px]">{project.CreatedByName}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}