"use client";

import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
    BarChart, Bar, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import {
    Loader2, ChevronRight,
    UserCheck, UserX, CalendarOff,
    Clock, CalendarDays, Palmtree, HelpCircle, LayoutDashboard,
    FileSpreadsheet, FileText, Settings, Award, ListFilter, MapPin, CheckCircle2
} from 'lucide-react';

import { cn } from '@/lib/utils';
import { callGetAPIWithToken } from '@/components/apis/commonAPIs';

// --- Animations ---
const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.1 } }
};

const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 100 } }
};

// --- Custom Month Order from Reference Screen ---
const MONTH_GRID_ORDER = [
    { name: 'All', val: 0 },
    { name: 'Jan', val: 1 },
    { name: 'Feb', val: 2 },
    { name: 'Mar', val: 3 },
    { name: 'Apr', val: 4 },
    { name: 'May', val: 5 },
    { name: 'Jun', val: 6 },
    { name: 'Jul', val: 7 },
    { name: 'Aug', val: 8 },
    { name: 'Sep', val: 9 },
    { name: 'Oct', val: 10 },
    { name: 'Nov', val: 11 },
    { name: 'Dec', val: 12 },
];

// --- Classic StatCard ---
const StatCard = ({
    title, value, icon: Icon,
    description, bgColor, iconColor, borderColor
}: any) => {
    return (
        <motion.div
            variants={itemVariants}
            className={cn(
                "group relative overflow-hidden rounded-3xl p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl border border-none flex-1",
                bgColor
            )}
        >
            <div
                className="absolute inset-0 opacity-[0.8] pointer-events-none"
                style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/diamond-upholstery.png")' }}
            />
            <div className="absolute inset-0 bg-gradient-to-br from-white/30 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100 pointer-events-none" />
            <div className="absolute inset-0 rounded-3xl ring-1 ring-inset ring-white/20 pointer-events-none" />

            <div className="relative z-10 flex flex-col h-full justify-between">
                <div className="flex items-center justify-between gap-4">
                    <div className={cn(
                        `flex h-12 w-12 items-center justify-center rounded-full transition-transform duration-300 shadow-sm shadow-white/70 group-hover:scale-110 group-hover:-rotate-6 backdrop-blur-sm text-white bg-white/80 ${borderColor}`,
                    )}>
                        <Icon className={`h-6 w-6 ${iconColor}`} />
                    </div>
                    <div className="text-[10px] font-black uppercase tracking-widest text-white/80 leading-tight text-right">
                        {title}
                    </div>
                </div>

                <div className="mt-6">
                    <h3 className="text-3xl font-black tracking-tight text-white drop-shadow-md">
                        {value}
                    </h3>
                    {description && (
                        <p className="mt-1 text-xs tracking-tight font-medium text-white/65">
                            {description}
                        </p>
                    )}
                </div>
            </div>
        </motion.div>
    );
};

// --- Smaller StatCard ---
const SmallStatCard = ({
    title, value, icon: Icon, bgColor, iconColor, borderColor
}: any) => {
    return (
        <div
            className={cn(
                "group relative overflow-hidden rounded-2xl p-4 transition-all duration-300 hover:shadow-lg border border-none flex items-center justify-between",
                bgColor
            )}
        >
            <div
                className="absolute inset-0 opacity-[0.5] pointer-events-none"
                style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/diamond-upholstery.png")' }}
            />
            <div className="relative z-10">
                <h5 className="text-[9px] font-black uppercase tracking-widest text-white/80">{title}</h5>
                <p className="text-xl font-black text-white mt-0.5">{value}</p>
            </div>
            <div className={cn(
                `relative z-10 flex h-9 w-9 items-center justify-center rounded-xl transition-transform duration-300 backdrop-blur-sm text-white bg-white/80 ${borderColor}`,
            )}>
                <Icon className={`h-4.5 w-4.5 ${iconColor}`} />
            </div>
        </div>
    );
};

export default function AttendanceExecutiveDashboard() {
    const [loading, setLoading] = useState(true);

    // Filters
    const [employees, setEmployees] = useState<any[]>([]);
    const [selectedUserId, setSelectedUserId] = useState<number | string>("0"); // Default '0' represents All Employees
    const [selectedMonth, setSelectedMonth] = useState<number>(5);
    const [selectedYear, setSelectedYear] = useState<number>(2026);

    // Final Parsed States
    const [summary, setSummary] = useState<any>(null);
    const [attendanceReport, setAttendanceReport] = useState<any>(null);
    const [discipline, setDiscipline] = useState<any>(null);
    const [salary, setSalary] = useState<any>(null);
    const [leaves, setLeaves] = useState<any>(null);
    const [working, setWorking] = useState<any>(null);

    const greeting = useMemo(() => {
        const hour = new Date().getHours();
        if (hour < 12) return "Good Morning";
        if (hour < 18) return "Good Afternoon";
        return "Good Evening";
    }, []);

    const THEME_COLORS = {
        emerald: '#10b981',
        rose: '#ef4444',
        amber: '#f59e0b',
        purple: '#8b5cf6',
        slate: '#64748b'
    };

    // Helper: Safely isolate single employee data or combine target array values
    const getTargetData = (rawArray: any, userId: string | number) => {
        if (!Array.isArray(rawArray)) return [];
        if (userId === "0" || userId === 0) {
            return rawArray; // Aggregate all records if 0 is selected
        }
        return rawArray.filter((item: any) => Number(item.employee_id || item.user_id) === Number(userId));
    };

    // Parsing & Aggregating response data based on selectedUserId
    const parseSummary = (rawArray: any, userId: string | number) => {
        const targets = getTargetData(rawArray, userId);
        if (targets.length === 0) return null;
        return targets.reduce((acc: any, curr: any) => ({
            total_present: (acc.total_present || 0) + (Number(curr.total_present) || 0),
            total_leave: (acc.total_leave || 0) + (Number(curr.total_leave) || 0),
            weeks_off: (acc.weeks_off || 0) + (Number(curr.weeks_off) || 0),
            holidays: (acc.holidays || 0) + (Number(curr.holidays) || 0),
            half_days: (acc.half_days || 0) + (Number(curr.half_days) || 0),
            absent: (acc.absent || 0) + (Number(curr.absent) || 0),
            out_of_office: (acc.out_of_office || 0) + (Number(curr.out_of_office) || 0),
            late: (acc.late || 0) + (Number(curr.late) || 0),
            late_checkins: (acc.late_checkins || 0) + (Number(curr.late_checkins) || 0),
        }), {});
    };

    const parseAttendanceReport = (rawArray: any, userId: string | number) => {
        const targets = getTargetData(rawArray, userId);
        if (targets.length === 0) return null;
        return targets.reduce((acc: any, curr: any) => ({
            present: (acc.present || 0) + (Number(curr.present) || 0),
            late: (acc.late || 0) + (Number(curr.late) || 0),
            out_of_office: (acc.out_of_office || 0) + (Number(curr.out_of_office) || 0),
            absent: (acc.absent || 0) + (Number(curr.absent) || 0),
            on_leave: (acc.on_leave || 0) + (Number(curr.on_leave) || 0),
            half_day: (acc.half_day || 0) + (Number(curr.half_day) || 0),
            month_label: curr.month_label || acc.month_label || 'Selected'
        }), {});
    };

    const parseDiscipline = (rawArray: any, userId: string | number) => {
        const targets = getTargetData(rawArray, userId);
        if (targets.length === 0) return null;

        const totals = targets.reduce((acc: any, curr: any) => ({
            discipline_permissible: (acc.discipline_permissible || 0) + (Number(curr.discipline_permissible) || 0),
            discipline_breach: (acc.discipline_breach || 0) + (Number(curr.discipline_breach) || 0),
            absent_count: (acc.absent_count || 0) + (Number(curr.absent_count) || 0),
            on_leave: (acc.on_leave || 0) + (Number(curr.on_leave) || 0),
        }), {});

        const grandTotal = totals.discipline_permissible + totals.discipline_breach + totals.absent_count + totals.on_leave;
        return {
            ...totals,
            permissible_pct: grandTotal > 0 ? ((totals.discipline_permissible / grandTotal) * 100).toFixed(2) : "0.00",
            breach_pct: grandTotal > 0 ? ((totals.discipline_breach / grandTotal) * 100).toFixed(2) : "0.00",
            absent_pct: grandTotal > 0 ? ((totals.absent_count / grandTotal) * 100).toFixed(2) : "0.00",
            leave_pct: grandTotal > 0 ? ((totals.on_leave / grandTotal) * 100).toFixed(2) : "0.00",
            period_label: targets[0]?.period_label || 'Selected'
        };
    };

    const parseSalary = (rawArray: any, userId: string | number) => {
        const targets = getTargetData(rawArray, userId);
        if (targets.length === 0) return null;
        return targets.reduce((acc: any, curr: any) => ({
            gross_salary: (acc.gross_salary || 0) + (Number(curr.gross_salary) || 0),
            total_deduction: (acc.total_deduction || 0) + (Number(curr.total_deduction) || 0),
            net_salary: (acc.net_salary || 0) + (Number(curr.net_salary) || 0),
            payment_status: targets.length > 1 ? 'Various' : (curr.payment_status || 'Unpaid'),
            payment_date: targets.length > 1 ? 'Various' : (curr.payment_date || '--'),
            salary_month: curr.salary_month || acc.salary_month || 'Selected'
        }), {});
    };

    const parseLeaves = (rawArray: any, userId: string | number) => {
        const targets = getTargetData(rawArray, userId);
        if (targets.length === 0) return null;
        return targets.reduce((acc: any, curr: any) => ({
            elr_yearly_leave: (acc.elr_yearly_leave || 0) + (Number(curr.elr_yearly_leave) || 0),
            elr_bf_leave: (acc.elr_bf_leave || 0) + (Number(curr.elr_bf_leave) || 0),
            elr_cf_leave: (acc.elr_cf_leave || 0) + (Number(curr.elr_cf_leave) || 0),
            elr_privileged_leave: (acc.elr_privileged_leave || 0) + (Number(curr.elr_privileged_leave) || 0),
            elr_casual_leave: (acc.elr_casual_leave || 0) + (Number(curr.elr_casual_leave) || 0),
            elr_sick_leave: (acc.elr_sick_leave || 0) + (Number(curr.elr_sick_leave) || 0),
            elr_permissible_leave: (acc.elr_permissible_leave || 0) + (Number(curr.elr_permissible_leave) || 0),
            elr_total_leave: (acc.elr_total_leave || 0) + (Number(curr.elr_total_leave) || 0),
            elr_excess_leave: (acc.elr_excess_leave || 0) + (Number(curr.elr_excess_leave) || 0),
        }), {});
    };

    const parseWorking = (rawArray: any, userId: string | number) => {
        const targets = getTargetData(rawArray, userId);
        if (targets.length === 0) return null;
        return targets.reduce((acc: any, curr: any) => ({
            total_days: (acc.total_days || 0) + (Number(curr.total_days) || 0),
            holiday_count: (acc.holiday_count || 0) + (Number(curr.holiday_count) || 0),
            week_off_count: (acc.week_off_count || 0) + (Number(curr.week_off_count) || 0),
            working_days: (acc.working_days || 0) + (Number(curr.working_days) || 0),
            present: (acc.present || 0) + (Number(curr.present) || 0),
            late: (acc.late || 0) + (Number(curr.late) || 0),
            out_of_office: (acc.out_of_office || 0) + (Number(curr.out_of_office) || 0),
            absent: (acc.absent || 0) + (Number(curr.absent) || 0),
            on_leave: (acc.on_leave || 0) + (Number(curr.on_leave) || 0),
            half_day: (acc.half_day || 0) + (Number(curr.half_day) || 0),
            month_label: curr.month_label || acc.month_label || 'Selected'
        }), {});
    };

    // Load initial employee list
    useEffect(() => {
        const fetchEmployeesList = async () => {
            try {
                const response = await callGetAPIWithToken(`users/employees`);
                if (response?.success && response?.data) {
                    const dataList = Array.isArray(response.data) ? response.data : [response.data];
                    setEmployees(dataList);
                }
            } catch (error) {
                console.error("Error loading employees:", error);
            }
        };
        fetchEmployeesList();
    }, []);

    // Sync Dashboard Modules
    useEffect(() => {
        const loadDashboardData = async () => {
            try {
                setLoading(true);
                const query = `user_id=${selectedUserId}&month=${selectedMonth}&year=${selectedYear}`;

                const [
                    summaryRes,
                    attendanceReportRes,
                    disciplineRes,
                    salaryRes,
                    leavesRes,
                    workingRes
                ] = await Promise.all([
                    callGetAPIWithToken(`accountant/dashboard/summary?${query}`),
                    callGetAPIWithToken(`accountant/dashboard/attendance-report?${query}`),
                    callGetAPIWithToken(`accountant/dashboard/discipline?${query}`),
                    callGetAPIWithToken(`accountant/dashboard/salary?${query}`),
                    callGetAPIWithToken(`accountant/dashboard/leaves?${query}`),
                    callGetAPIWithToken(`accountant/dashboard/working?${query}`)
                ]);

                setSummary(parseSummary(summaryRes?.data, selectedUserId));
                setAttendanceReport(parseAttendanceReport(attendanceReportRes?.data, selectedUserId));
                setDiscipline(parseDiscipline(disciplineRes?.data, selectedUserId));
                setSalary(parseSalary(salaryRes?.data, selectedUserId));
                setLeaves(parseLeaves(leavesRes?.data, selectedUserId));
                setWorking(parseWorking(workingRes?.data, selectedUserId));

            } catch (error) {
                console.error("Error loading dashboard metrics:", error);
            } finally {
                setLoading(false);
            }
        };

        loadDashboardData();
    }, [selectedUserId, selectedMonth, selectedYear]);

    const activeEmployee = useMemo(() => {
        if (selectedUserId === "0" || selectedUserId === 0) {
            return {
                employee_name: "All Employees",
                designation: "Enterprise Consolidated Overview",
                nspl_id: "ALL-ENT"
            };
        }
        return employees.find(emp => Number(emp.user_id || emp.employee_id) === Number(selectedUserId));
    }, [employees, selectedUserId]);

    // Graph Data Parsers
    const barChartData = useMemo(() => {
        if (!attendanceReport) return [];
        return [{
            name: attendanceReport.month_label || 'Selected',
            'Present': attendanceReport.present || 0,
            'Late Checkins': attendanceReport.late || 0,
            'Out of Office': attendanceReport.out_of_office || 0,
            'Absent': attendanceReport.absent || 0,
            'On Leave': attendanceReport.on_leave || 0,
            'Half Day': attendanceReport.half_day || 0
        }];
    }, [attendanceReport]);

    const disciplinePieData = useMemo(() => {
        if (!discipline) return [];
        return [
            { name: 'Permissible', value: Number(discipline.permissible_pct) || 0, color: '#10b981' },
            { name: 'Breach', value: Number(discipline.breach_pct) || 0, color: '#ef4444' },
            { name: 'Absent', value: Number(discipline.absent_pct) || 0, color: '#f59e0b' },
            { name: 'Leave', value: Number(discipline.leave_pct) || 0, color: '#8b5cf6' }
        ].filter(item => item.value > 0);
    }, [discipline]);

    const leavesPieData = useMemo(() => {
        if (!leaves) return [];
        const data = [
            { name: 'Privileged', value: leaves.elr_privileged_leave || 0, color: '#06b6d4' },
            { name: 'Casual', value: leaves.elr_casual_leave || 0, color: '#f59e0b' },
            { name: 'Sick', value: leaves.elr_sick_leave || 0, color: '#ef4444' }
        ];
        const validData = data.filter(item => item.value > 0);
        if (validData.length === 0) {
            return [{ name: 'No Leaves Taken', value: 1, color: '#64748b' }];
        }
        return validData;
    }, [leaves]);

    const workingStackedData = useMemo(() => {
        if (!working) return [];
        return [{
            name: working.month_label || 'Selected',
            'Present': working.present || 0,
            'Late': working.late || 0,
            'On Leave': working.on_leave || 0,
            'Absent': working.absent || 0,
            'Half Day': working.half_day || 0,
            'Week Off': working.week_off_count || 0,
            'Holiday': working.holiday_count || 0,
            'OOO': working.out_of_office || 0,
        }];
    }, [working]);

    if (loading && !summary) {
        return (
            <div className="flex h-screen w-full flex-col items-center justify-center gap-4 bg-slate-50 dark:bg-slate-950">
                <Loader2 className="h-12 w-12 animate-spin text-indigo-600" />
                <p className="text-xs font-black uppercase tracking-[0.3em] text-slate-400">Loading Enterprise Metrics...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen text-slate-900 dark:text-white p-4 md:p-10 space-y-8 max-w-[1600px] mx-auto font-sans">


            {/* ==================== TOP FILTER & CONTROLS PANEL ==================== */}
            <section className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 p-6 shadow-sm grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">

                {/* Employee Selector Dropdown (Including 'All Employees') */}
                <div className="lg:col-span-4 border-b lg:border-b-0 lg:border-r border-slate-100 dark:border-slate-800 pb-6 lg:pb-0 lg:pr-8">
                    <div className="flex items-center gap-2 mb-3">
                        <ListFilter className="h-4 w-4 text-indigo-500" />
                        <label className="text-xs font-black uppercase tracking-widest text-slate-400">
                            Employee List
                        </label>
                    </div>
                    <div className="relative">
                        <select
                            value={selectedUserId}
                            onChange={(e) => setSelectedUserId(e.target.value)}
                            className="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-black py-3.5 px-4 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500 appearance-none uppercase tracking-widest"
                        >
                            <option value="0">All Employees</option>
                            {employees.map((emp) => (
                                <option key={emp.user_id || emp.employee_id} value={emp.user_id || emp.employee_id}>
                                    {emp.employee_name}
                                </option>
                            ))}
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-400">
                            <ChevronRight className="h-4 w-4 rotate-90" />
                        </div>
                    </div>
                </div>

                {/* 12-Month Selector Grid */}
                <div className="lg:col-span-8">
                    <span className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-3.5">
                        Month Selection
                    </span>
                    <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-13 gap-2">
                        {MONTH_GRID_ORDER.map((item) => {
                            const isActive = selectedMonth === item.val;
                            return (
                                <button
                                    key={item.name}
                                    onClick={() => setSelectedMonth(item.val)}
                                    className={cn(
                                        "py-2.5 rounded-xl text-xs font-black tracking-widest transition-all duration-200 border uppercase text-center",
                                        isActive
                                            ? "bg-indigo-600 text-white border-transparent shadow-md shadow-indigo-600/20"
                                            : "bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700"
                                    )}
                                >
                                    {item.name}
                                </button>
                            );
                        })}
                    </div>
                </div>

            </section>

            {/* ==================== CONTENT BODY GRID ==================== */}
            <motion.div
                initial="hidden"
                animate="visible"
                variants={containerVariants}
                className="space-y-10"
            >
                {/* --- HEADER PROFILE & SUMMARY STATS ROW --- */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6 items-stretch">

                    {/* Employee Profile Display Card */}
                    <div className="lg:col-span-4 bg-gradient-to-br from-indigo-600 via-indigo-500 to-indigo-800 rounded-3xl p-6 flex flex-col justify-between shadow-lg relative overflow-hidden">
                        <div
                            className="absolute inset-0 opacity-[0.4] pointer-events-none"
                            style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/diamond-upholstery.png")' }}
                        />
                        <div className="relative z-10">
                            <span className="text-[10px] font-black uppercase tracking-widest text-white/75">Active Profile</span>
                            <h2 className="text-3xl font-black tracking-tighter text-white uppercase leading-none mt-2">
                                {activeEmployee?.employee_name || 'All Employees'}
                            </h2>
                            <p className="text-xs font-bold text-indigo-200 uppercase tracking-widest mt-1">
                                {activeEmployee?.designation || 'Enterprise Consolidated'}
                            </p>
                        </div>
                        <div className="mt-8 flex items-center justify-between relative z-10">
                            <span className="bg-white/20 text-white text-[10px] font-black px-3.5 py-2 rounded-xl uppercase tracking-widest backdrop-blur-sm">
                                ID: {activeEmployee?.nspl_id || 'ALL-ENT'}
                            </span>
                            <span className="text-[10px] font-black uppercase tracking-widest text-white/50">{greeting}</span>
                        </div>
                    </div>

                    {/* Summary Stat: Present */}
                    <div className="lg:col-span-2">
                        <StatCard
                            title="Total Present"
                            value={summary?.total_present ?? 0}
                            icon={UserCheck}
                            bgColor="bg-gradient-to-br from-emerald-600 via-emerald-500 to-emerald-700"
                            iconColor="text-emerald-500"
                            borderColor="border-2 border-emerald-400"
                            description="Working days"
                        />
                    </div>

                    {/* Summary Stat: Leave */}
                    <div className="lg:col-span-2">
                        <StatCard
                            title="Total Leave"
                            value={summary?.total_leave ?? 0}
                            icon={CalendarOff}
                            bgColor="bg-gradient-to-br from-indigo-600 via-indigo-500 to-indigo-800"
                            iconColor="text-indigo-500"
                            borderColor="border-2 border-indigo-400"
                            description="Approved leaves"
                        />
                    </div>

                    {/* Summary Stat: Weeks Off */}
                    <div className="lg:col-span-2">
                        <StatCard
                            title="Weeks Off"
                            value={summary?.weeks_off ?? 0}
                            icon={CalendarDays}
                            bgColor="bg-gradient-to-br from-slate-600 via-slate-500 to-slate-700"
                            iconColor="text-slate-500"
                            borderColor="border-2 border-slate-400"
                            description="Rest days"
                        />
                    </div>

                    {/* Summary Stat: Holidays */}
                    <div className="lg:col-span-2">
                        <StatCard
                            title="Holidays"
                            value={summary?.holidays ?? 0}
                            icon={Palmtree}
                            bgColor="bg-gradient-to-br from-rose-600 via-rose-500 to-red-800"
                            iconColor="text-rose-500"
                            borderColor="border-2 border-rose-400"
                            description="Public holiday"
                        />
                    </div>

                </div>

                {/* --- ROW 2 (CHARTS & SMALL GRADIENT STACK) --- */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">

                    {/* Attendance Reports - Horizontal Bar Chart */}
                    <motion.div variants={itemVariants} className="lg:col-span-5 rounded-[3.5rem] border border-slate-200 bg-white p-8 dark:border-slate-800 dark:bg-slate-900 shadow-sm relative overflow-hidden flex flex-col justify-between min-h-[350px]">
                        <div>
                            <h3 className="text-xl font-black uppercase tracking-tight text-slate-900 dark:text-white">Attendance Reports</h3>
                            <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-widest">Aggregate comparison metrics</p>
                        </div>
                        <div className="h-56 w-full mt-6">
                            {barChartData.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={barChartData} layout="vertical" margin={{ top: 20, right: 10, left: -25, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" strokeOpacity={0.6} />
                                        <XAxis type="number" tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 'bold' }} axisLine={false} />
                                        <YAxis dataKey="name" type="category" tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 'bold' }} axisLine={false} />
                                        <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '16px', color: '#fff' }} />
                                        <Legend wrapperStyle={{ fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase', paddingTop: '10px' }} />

                                        <Bar dataKey="Present" fill={THEME_COLORS.emerald} radius={[0, 4, 4, 0]} />
                                        <Bar dataKey="Late Checkins" fill={THEME_COLORS.rose} radius={[0, 4, 4, 0]} />
                                        <Bar dataKey="Out of Office" fill="#6366f1" radius={[0, 4, 4, 0]} />
                                        <Bar dataKey="Absent" fill="#334155" radius={[0, 4, 4, 0]} />
                                        <Bar dataKey="On Leave" fill={THEME_COLORS.purple} radius={[0, 4, 4, 0]} />
                                        <Bar dataKey="Half Day" fill={THEME_COLORS.amber} radius={[0, 4, 4, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="h-full flex items-center justify-center text-xs font-bold text-slate-400 uppercase tracking-widest">No parameters loaded</div>
                            )}
                        </div>
                    </motion.div>

                    {/* Discipline Donut Chart */}
                    <motion.div variants={itemVariants} className="lg:col-span-4 rounded-[3.5rem] border border-slate-200 bg-white p-8 dark:border-slate-800 dark:bg-slate-900 shadow-sm relative overflow-hidden flex flex-col justify-between min-h-[350px]">
                        <div>
                            <h3 className="text-xl font-black uppercase tracking-tight text-slate-900 dark:text-white">Discipline</h3>
                            <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-widest">Compliance indicator metrics</p>
                        </div>

                        <div className="h-48 w-full relative mt-4">
                            {disciplinePieData.length > 0 ? (
                                <>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={disciplinePieData}
                                                cx="50%" cy="50%"
                                                innerRadius={60}
                                                outerRadius={75}
                                                paddingAngle={3}
                                                dataKey="value"
                                                stroke="transparent"
                                            >
                                                {disciplinePieData.map((entry: any, index: number) => (
                                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                                ))}
                                            </Pie>
                                            <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', fontWeight: 'bold' }} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                        <span className="text-2xl font-black text-slate-900 dark:text-white leading-none">
                                            {discipline?.permissible_pct ?? 0}%
                                        </span>
                                        <span className="text-[8px] font-black uppercase text-slate-400 tracking-widest mt-1">Permissible</span>
                                    </div>
                                </>
                            ) : (
                                <div className="h-full flex items-center justify-center text-xs font-bold text-slate-400 uppercase tracking-widest">No discipline records</div>
                            )}
                        </div>

                        <div className="flex justify-center gap-4 text-[9px] font-black uppercase tracking-widest mt-4">
                            <div className="flex items-center gap-1.5">
                                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                                <span className="text-slate-500">Permissible: {discipline?.discipline_permissible ?? 0}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <div className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                                <span className="text-slate-500">Breach: {discipline?.discipline_breach ?? 0}</span>
                            </div>
                        </div>
                    </motion.div>

                    {/* Small Colored Stat Widgets Grid Column Stack */}
                    <div className="lg:col-span-3 flex flex-col gap-3 justify-between">
                        <SmallStatCard
                            title="Half Days"
                            value={summary?.half_days ?? 0}
                            icon={Clock}
                            bgColor="bg-gradient-to-br from-amber-400 via-orange-500 to-orange-600"
                            iconColor="text-orange-500"
                            borderColor="border-2 border-orange-400"
                        />
                        <SmallStatCard
                            title="Absent"
                            value={summary?.absent ?? 0}
                            icon={UserX}
                            bgColor="bg-gradient-to-br from-rose-600 via-rose-500 to-red-800"
                            iconColor="text-rose-500"
                            borderColor="border-2 border-rose-400"
                        />
                        <SmallStatCard
                            title="Out of Office"
                            value={summary?.out_of_office ?? 0}
                            icon={MapPin}
                            bgColor="bg-gradient-to-br from-cyan-600 via-cyan-500 to-cyan-800"
                            iconColor="text-cyan-500"
                            borderColor="border-2 border-cyan-400"
                        />
                        <SmallStatCard
                            title="Late Check-ins"
                            value={summary?.late_checkins ?? 0}
                            icon={Clock}
                            bgColor="bg-gradient-to-br from-emerald-600 via-emerald-500 to-emerald-700"
                            iconColor="text-emerald-500"
                            borderColor="border-2 border-emerald-400"
                        />
                        <SmallStatCard
                            title="Permissible Leaves Balance"
                            value={leaves?.elr_permissible_leave ?? 0}
                            icon={HelpCircle}
                            bgColor="bg-gradient-to-br from-purple-600 via-purple-500 to-purple-800"
                            iconColor="text-purple-500"
                            borderColor="border-2 border-purple-400"
                        />
                    </div>

                </div>

                {/* --- ROW 3 (SALARY, LEAVES, WORKING STACKED) --- */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">

                    {/* Salary Parameters Card */}
                    <motion.div variants={itemVariants} className="lg:col-span-4 rounded-[3.5rem] border border-slate-200 bg-white p-8 dark:border-slate-800 dark:bg-slate-900 shadow-sm relative overflow-hidden flex flex-col justify-between min-h-[320px]">
                        <div>
                            <h3 className="text-xl font-black uppercase tracking-tight text-slate-900 dark:text-white">Salary</h3>
                            <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-widest">Consolidated Payroll Metrics</p>
                        </div>

                        <div className="space-y-4 my-auto">
                            {/* Gross Salary Block */}
                            <div>
                                <div className="flex justify-between text-xs font-black uppercase tracking-widest text-slate-500 mb-1.5">
                                    <span>Gross Salary</span>
                                    <span className="text-slate-900 dark:text-white">
                                        ₹ {salary?.gross_salary ? Number(salary.gross_salary).toLocaleString('en-IN', { minimumFractionDigits: 2 }) : '0.00'}
                                    </span>
                                </div>
                                <div className="w-full bg-slate-100 dark:bg-slate-800 h-3.5 rounded-lg overflow-hidden">
                                    <div className="bg-gradient-to-r from-indigo-500 to-cyan-500 h-full rounded-lg" style={{ width: salary?.gross_salary ? '80%' : '0%' }} />
                                </div>
                            </div>

                            {/* Deductions Segment */}
                            <div className="flex justify-between items-center text-xs font-black uppercase tracking-widest border-y border-slate-100 dark:border-slate-800 py-3 text-slate-500">
                                <span>Total Deductions</span>
                                <span className="text-rose-500 font-black">
                                    ₹ {salary?.total_deduction ? Number(salary.total_deduction).toLocaleString('en-IN', { minimumFractionDigits: 2 }) : '0.00'}
                                </span>
                            </div>

                            {/* Net Salary Block */}
                            <div>
                                <div className="flex justify-between text-xs font-black uppercase tracking-widest text-slate-500 mb-1.5">
                                    <span>Net Salary</span>
                                    <span className="text-slate-900 dark:text-white">
                                        ₹ {salary?.net_salary ? Number(salary.net_salary).toLocaleString('en-IN', { minimumFractionDigits: 2 }) : '0.00'}
                                    </span>
                                </div>
                                <div className="w-full bg-slate-100 dark:bg-slate-800 h-3.5 rounded-lg overflow-hidden">
                                    <div className="bg-gradient-to-r from-emerald-500 to-teal-500 h-full rounded-lg" style={{ width: salary?.net_salary ? '88%' : '0%' }} />
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-slate-400 border-t border-slate-100 dark:border-slate-800 pt-3">
                            <span>Status: {salary?.payment_status || 'Various'}</span>
                            <span>Date: {salary?.payment_date || '--:--'}</span>
                        </div>
                    </motion.div>

                    {/* Leaves pie tracking metrics */}
                    <motion.div variants={itemVariants} className="lg:col-span-4 rounded-[3.5rem] border border-slate-200 bg-white p-8 dark:border-slate-800 dark:bg-slate-900 shadow-sm relative overflow-hidden flex flex-col justify-between min-h-[320px]">
                        <div>
                            <h3 className="text-xl font-black uppercase tracking-tight text-slate-900 dark:text-white">Leaves Breakdown</h3>
                            <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-widest">Categorized leave count usage</p>
                        </div>

                        <div className="h-40 w-full relative">
                            {leavesPieData.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={leavesPieData}
                                            cx="50%" cy="50%"
                                            innerRadius={50}
                                            outerRadius={65}
                                            paddingAngle={3}
                                            dataKey="value"
                                            stroke="transparent"
                                        >
                                            {leavesPieData.map((entry: any, index: number) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', fontWeight: 'bold' }} />
                                    </PieChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="h-full flex items-center justify-center text-xs font-bold text-slate-400 uppercase tracking-widest">No parameters loaded</div>
                            )}
                            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                <span className="text-lg font-black text-slate-900 dark:text-white leading-none">
                                    {leaves?.elr_total_leave ?? 0}
                                </span>
                                <span className="text-[8px] font-black uppercase text-slate-400 tracking-widest mt-1">Total Leaves</span>
                            </div>
                        </div>

                        <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-slate-400 border-t border-slate-100 dark:border-slate-800 pt-3">
                            <span>Permissible: {leaves?.elr_permissible_leave ?? 0}</span>
                            <span>Excess: {leaves?.elr_excess_leave ?? 0}</span>
                        </div>
                    </motion.div>

                    {/* Working Stacked parameters */}
                    <motion.div variants={itemVariants} className="lg:col-span-4 rounded-[3.5rem] border border-slate-200 bg-white p-8 dark:border-slate-800 dark:bg-slate-900 shadow-sm relative overflow-hidden flex flex-col justify-between min-h-[320px]">
                        <div>
                            <h3 className="text-xl font-black uppercase tracking-tight text-slate-900 dark:text-white">Working</h3>
                            <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-widest">Consolidated metric parameters</p>
                        </div>

                        <div className="h-36 w-full mt-2">
                            {workingStackedData.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={workingStackedData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" strokeOpacity={0.6} />
                                        <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 'bold' }} axisLine={false} tickLine={false} />
                                        <YAxis tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 'bold' }} axisLine={false} tickLine={false} />
                                        <Tooltip contentStyle={{ backgroundColor: '#0f172a', color: '#fff', border: 'none', borderRadius: '12px' }} />

                                        <Bar dataKey="Present" stackId="working_stack" fill={THEME_COLORS.emerald} />
                                        <Bar dataKey="Week Off" stackId="working_stack" fill={THEME_COLORS.slate} />
                                        <Bar dataKey="On Leave" stackId="working_stack" fill={THEME_COLORS.purple} />
                                        <Bar dataKey="Holiday" stackId="working_stack" fill={THEME_COLORS.rose} />
                                        <Bar dataKey="Half Day" stackId="working_stack" fill={THEME_COLORS.amber} />
                                        <Bar dataKey="Absent" stackId="working_stack" fill="#ef4444" />
                                        <Bar dataKey="OOO" stackId="working_stack" fill="#06b6d4" />
                                        <Bar dataKey="Late" stackId="working_stack" fill="#a855f7" />
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="h-full flex items-center justify-center text-xs font-bold text-slate-400 uppercase tracking-widest">No working parameters</div>
                            )}
                        </div>

                        <div className="grid grid-cols-3 gap-1 text-[8px] font-black uppercase tracking-widest text-center border-t border-slate-100 dark:border-slate-800 pt-3">
                            <span className="text-emerald-500 truncate">Present: {working?.present ?? 0}</span>
                            <span className="text-slate-400 truncate">Week-off: {working?.week_off_count ?? 0}</span>
                            <span className="text-rose-500 truncate">Absent: {working?.absent ?? 0}</span>
                        </div>
                    </motion.div>

                </div>
            </motion.div>

        </div>
    );
}