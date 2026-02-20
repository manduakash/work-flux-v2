import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function getStatusColor(status: string) {
  switch (status) {
    case 'Planning':
    case 'Pending':
      return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
    case 'Active':
    case 'In-Progress':
      return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
    case 'Testing':
    case 'Review':
      return 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400';
    case 'Deployed':
    case 'Completed':
      return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400';
    case 'Maintenance':
      return 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400';
    case 'Cancelled':
      return 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400';
    case 'On Hold':
    case 'Postponed':
      return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400';
    case 'Cancelled':
      return 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400';
    default:
      return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400';
  }
}

export function getPriorityColor(priority: string) {
  switch (priority) {
    case 'Low':
      return 'text-slate-700 dark:bg-slate-800 dark:text-slate-400';
    case 'Medium':
      return 'text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
    case 'High':
      return 'text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
    case 'Urgent':
      return 'text-rose-700 dark:bg-rose-900/30 dark:text-rose-400';
    default:
      return 'text-slate-700 dark:bg-slate-800 dark:text-slate-400';
  }
}