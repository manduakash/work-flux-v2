"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search, CalendarDays, CheckCircle2, UserX, MapPin,
    CalendarOff, Save, Loader2, RotateCcw, Activity, ShieldAlert
} from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { callGetAPIWithToken, callAPIWithToken } from '@/components/apis/commonAPIs';
import moment from 'moment';
import { toast } from 'sonner';
import { ExcelImportModal } from '@/components/ExcelImportModal';

// --- Animations ---
const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
};

const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 }
};

// --- Interfaces ---
interface EmployeeEntry {
    id: number;
    name: string;
    dept: string;
    statusId: number | null; // 1=OnTime, 2=Late, 3=OOO, 4=Absent, 5=Leave, 7=WO/HO
    checkIn: string;
    checkOut: string;
    workLocationId: number; // 1=Office, 2=Remote, 3=Field
    isDirty?: boolean;
}

export default function RapidDataEntry() {
    const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
    const [employees, setEmployees] = useState<EmployeeEntry[]>([]);
    const [originalData, setOriginalData] = useState<EmployeeEntry[]>([]);
    const [weekoffs, setWeekoffs] = useState<any[]>([]);
    const [holidays, setHolidays] = useState<any[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [isSaving, setIsSaving] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const hasUnsavedChanges = employees.some(emp => emp.isDirty);

    // Contextual information about the current date selection
    const selectedDateMeta = useMemo(() => {
        const formattedSelectedDate = moment(date).format("DD MMM YYYY");
        const matchingWeekoff = weekoffs.find((w: any) => w.off_date === formattedSelectedDate);
        const matchingHoliday = holidays.find((h: any) => h.holiday_date === formattedSelectedDate);
        return {
            isWeekoff: !!matchingWeekoff,
            isHoliday: !!matchingHoliday,
            label: matchingHoliday ? matchingHoliday.holiday_name : matchingWeekoff ? "Scheduled Weekoff" : null
        };
    }, [date, weekoffs, holidays]);

    const isDataValid = useMemo(() => {
        // Active rows of status Present (1) or OOO (3) must have a check-in time specified.
        return employees.filter(emp => emp.isDirty).every(emp => {
            if (emp.statusId === 1 || emp.statusId === 3) {
                return (emp.checkIn && emp.checkIn.trim() !== "");
            }
            return true;
        });
    }, [employees]);

    // --- Fetch Daily Log & Date Metadata (Weekoffs and Holidays) ---
    const getDailyAttendanceLog = async (dateStr: string) => {
        setIsLoading(true);
        const mDate = moment(dateStr);
        const month = mDate.month() + 1;
        const year = mDate.year();

        try {
            // Parallel fetches to retrieve metadata along with actual attendance
            const [attendanceRes, weekoffsRes, holidaysRes] = await Promise.all([
                callGetAPIWithToken(`attendance?date=${dateStr}`),
                callGetAPIWithToken(`accountant/weekoffs?month=${month}&year=${year}`),
                callGetAPIWithToken(`accountant/holidays?month=0&year=${year}`)
            ]);

            let fetchedWeekoffs: any[] = [];
            let fetchedHolidays: any[] = [];

            if (weekoffsRes?.success && Array.isArray(weekoffsRes.data)) {
                fetchedWeekoffs = weekoffsRes.data;
                setWeekoffs(fetchedWeekoffs);
            }
            if (holidaysRes?.success && Array.isArray(holidaysRes.data)) {
                fetchedHolidays = holidaysRes.data;
                setHolidays(fetchedHolidays);
            }

            const formattedSelectedDate = mDate.format("DD MMM YYYY");
            const isWeekoffOrHolidayDate = fetchedWeekoffs.some(w => w.off_date === formattedSelectedDate) ||
                fetchedHolidays.some(h => h.holiday_date === formattedSelectedDate);

            if (attendanceRes?.success) {
                const mappedData: EmployeeEntry[] = attendanceRes.data.map((item: any) => {
                    const originalStatusId = item.StatusID !== null && item.StatusID !== undefined && item.StatusID !== ""
                        ? Number(item.StatusID)
                        : null;

                    // Apply status 7 automatically if no recorded status exists on a weekoff/holiday
                    const finalStatusId = originalStatusId === null && isWeekoffOrHolidayDate ? 7 : originalStatusId;

                    return {
                        id: item?.ID,
                        name: item?.EmpName,
                        dept: item?.RoleName,
                        statusId: finalStatusId,
                        checkIn: item?.CheckIn || "",
                        checkOut: item?.CheckOut || "",
                        workLocationId: item.Type === 'Remote' ? 2 : item.Type === 'Field' ? 3 : 1,
                        isDirty: originalStatusId !== finalStatusId
                    };
                });
                setEmployees(mappedData);
                setOriginalData(mappedData);
            } else {
                setEmployees([]);
                setOriginalData([]);
            }
        } catch (error) {
            console.error("Failed to retrieve operational data:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        const formattedDate = moment(date).format("YYYY-MM-DD");
        getDailyAttendanceLog(formattedDate);
    }, [date]);

    // --- Inline Modifications ---
    const handleStatusChange = (id: number, newStatusId: number) => {
        setEmployees(prev => prev.map(emp => {
            if (emp.id === id) {
                // Time entries are disabled for Absent (4), Leave (5), and WO/HO (7)
                const isDisabling = newStatusId === 4 || newStatusId === 5 || newStatusId === 7;
                return {
                    ...emp,
                    statusId: newStatusId,
                    checkIn: isDisabling ? "" : emp.checkIn,
                    checkOut: isDisabling ? "" : emp.checkOut,
                    isDirty: true
                };
            }
            return emp;
        }));
    };

    const handleTimeChange = (id: number, field: 'checkIn' | 'checkOut', value: string) => {
        setEmployees(prev => prev.map(emp => {
            if (emp.id === id) {
                return { ...emp, [field]: value, isDirty: true };
            }
            return emp;
        }));
    };

    const handleResetRow = (id: number) => {
        const original = originalData.find(e => e.id === id);
        if (original) {
            setEmployees(prev => prev.map(emp => emp.id === id ? { ...original, isDirty: false } : emp));
        }
    };

    const handleSaveAll = async () => {
        setIsSaving(true);
        try {
            const dirtyRecords = employees.filter(emp => emp.isDirty);

            const promises = dirtyRecords.map(emp => {
                const formatTime = (timeStr: string) => timeStr ? (timeStr.length === 5 ? `${timeStr}:00` : timeStr) : null;

                const payload = {
                    user_id: emp.id,
                    date: moment(date).format("YYYY-MM-DD"),
                    check_in: formatTime(emp.checkIn),
                    check_out: formatTime(emp.checkOut),
                    status_id: emp.statusId,
                    work_location_id: emp.workLocationId,
                    remarks: "-"
                };

                return callAPIWithToken('attendance/update-daily-attendance', payload);
            });

            const result = await Promise.all(promises);
            const res = result.every((res) => res?.success);

            if (res) {
                toast.success("Attendance updated successfully!");
            } else {
                toast.error("Failed to update one or more attendance logs");
            }

            await getDailyAttendanceLog(moment(date).format("YYYY-MM-DD"));

        } catch (error: any) {
            toast.error(error?.message || "Failed to submit operations update");
            console.error("Save operational error:", error);
        } finally {
            setIsSaving(false);
        }
    };

    const filteredEmployees = employees.filter(emp =>
        emp?.name?.toLowerCase()?.includes(searchTerm?.toLowerCase()) ||
        emp?.id?.toString()?.includes(searchTerm)
    );

    return (
        <div className="max-w-[1600px] mx-auto space-y-8 p-4 md:p-10 relative pb-32">

            {/* Header Section */}
            <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between relative">
                <div>
                    <div className="flex items-center gap-3 mb-4">
                        <span className="h-px w-8 bg-indigo-600/30" />
                        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-600">Rapid Data Entry</span>
                    </div>
                    <h1 className="text-5xl font-black tracking-tighter text-slate-900 dark:text-white uppercase leading-none">
                        Daily <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-indigo-400 to-indigo-600 animate-gradient-x">Attendance Log</span>
                    </h1>
                    <div className="mt-4 flex flex-wrap items-center gap-3">
                        <p className="text-sm font-medium text-slate-500 dark:text-slate-400 flex items-center gap-2">
                            <Activity className="h-4 w-4 text-emerald-500" />
                            Inline Edit Mode
                        </p>
                        {selectedDateMeta.label && (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-900/30">
                                <ShieldAlert className="h-3 w-3" /> {selectedDateMeta.label}
                            </span>
                        )}
                    </div>
                </div>

                {/* Date & Search Controls */}
                <div className="flex flex-wrap items-center gap-4 bg-white dark:bg-slate-900 p-2 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm w-full lg:w-auto">
                    <div className="relative flex-1 lg:flex-none">
                        <CalendarDays className="absolute left-6 top-1/2 -translate-y-1/2 h-4 w-4 text-indigo-500 pointer-events-none" />
                        <input
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            className="h-14 pl-14 pr-6 bg-slate-50 dark:bg-slate-800/50 border-none rounded-3xl text-xs font-black uppercase tracking-widest text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 cursor-pointer w-full"
                        />
                    </div>
                    <div className="relative flex-1 lg:flex-none lg:min-w-[300px]">
                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="SEARCH EMPLOYEE..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full h-14 pl-14 pr-6 bg-slate-50 dark:bg-slate-800/50 border-none rounded-3xl text-xs font-black uppercase tracking-widest text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500 transition-all"
                        />
                    </div>
                    <ExcelImportModal employees={employees} setEmployees={setEmployees} />
                </div>
            </div>

            {/* Main Interactive Table */}
            <motion.div
                initial="hidden"
                animate="visible"
                variants={containerVariants}
                className="rounded-[3.5rem] border border-slate-200 bg-white p-0 dark:border-slate-800 dark:bg-slate-900 shadow-sm overflow-hidden min-h-[400px]"
            >
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center h-64 opacity-50">
                        <Loader2 className="h-10 w-10 animate-spin text-indigo-600 mb-4" />
                        <span className="text-xs font-bold tracking-widest uppercase">Fetching Log...</span>
                    </div>
                ) : (
                    <div className="overflow-x-auto p-5">
                        <table className="w-full text-left min-w-[1000px]">
                            <thead>
                                <tr className="border-b border-slate-100 dark:border-slate-800 opacity-50">
                                    <th className="pb-4 px-4 font-black text-[10px] uppercase tracking-[0.2em] text-slate-500 w-[20%]">Personnel</th>
                                    <th className="pb-4 font-black text-[10px] uppercase tracking-[0.2em] text-slate-500 w-[45%] text-center">1-Click Status</th>
                                    <th className="pb-4 font-black text-[10px] uppercase tracking-[0.2em] text-slate-500 w-[12%] text-center">Check-In</th>
                                    <th className="pb-4 font-black text-[10px] uppercase tracking-[0.2em] text-slate-500 w-[12%] text-center">Check-Out</th>
                                    <th className="pb-4 font-black text-[10px] uppercase tracking-[0.2em] text-slate-500 w-[11%] text-right pr-4">Reset</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
                                {filteredEmployees.length === 0 ? (
                                    <tr><td colSpan={5} className="py-10 text-center text-slate-400 text-sm font-medium">No employees found.</td></tr>
                                ) : filteredEmployees.map((emp) => {
                                    // Disable time entry for Absent (4), Leave (5), or WO/HO (7)
                                    const isDisabling = emp.statusId === 4 || emp.statusId === 5 || emp.statusId === 7;

                                    return (
                                        <tr
                                            key={emp.id}
                                            className={cn(
                                                "group transition-all duration-300",
                                                emp.isDirty ? "bg-indigo-50/50 dark:bg-indigo-900/10" : "hover:bg-slate-50/50 dark:hover:bg-slate-800/30"
                                            )}
                                        >
                                            {/* 1. Employee Info */}
                                            <td className="py-4 px-4">
                                                <div className="flex items-center gap-4">
                                                    <div className="h-10 w-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-indigo-600 dark:text-slate-300 font-black text-sm uppercase flex-shrink-0">
                                                        {emp?.name?.split(' ').map(n => n[0]).join('')}
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="font-black text-sm text-slate-900 dark:text-white uppercase tracking-tight">
                                                            {emp.name}
                                                        </span>
                                                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">
                                                            ID: emp-{emp.id} • {emp.dept}
                                                        </span>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* 2. 1-Click Segmented Status Toggle */}
                                            <td className="py-4 text-center">
                                                <div className="inline-flex p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl flex-wrap justify-center gap-0.5">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleStatusChange(emp.id, 1)} // 1 = Present
                                                        className={cn(
                                                            "flex items-center gap-1.5 px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                                                            emp.statusId === 1 ? "bg-white dark:bg-slate-900 text-emerald-600 shadow-sm" : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                                                        )}
                                                    >
                                                        <CheckCircle2 className="h-3.5 w-3.5" /> Present
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleStatusChange(emp.id, 4)} // 4 = Absent
                                                        className={cn(
                                                            "flex items-center gap-1.5 px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                                                            emp.statusId === 4 ? "bg-white dark:bg-slate-900 text-rose-600 shadow-sm" : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                                                        )}
                                                    >
                                                        <UserX className="h-3.5 w-3.5" /> Absent
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleStatusChange(emp.id, 3)} // 3 = Out of Office
                                                        className={cn(
                                                            "flex items-center gap-1.5 px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                                                            emp.statusId === 3 ? "bg-white dark:bg-slate-900 text-purple-600 shadow-sm" : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                                                        )}
                                                    >
                                                        <MapPin className="h-3.5 w-3.5" /> OOO
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleStatusChange(emp.id, 5)} // 5 = On Leave
                                                        className={cn(
                                                            "flex items-center gap-1.5 px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                                                            emp.statusId === 5 ? "bg-white dark:bg-slate-900 text-amber-600 shadow-sm" : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                                                        )}
                                                    >
                                                        <CalendarOff className="h-3.5 w-3.5" /> Leave
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleStatusChange(emp.id, 7)} // 7 = On WO/HO
                                                        className={cn(
                                                            "flex items-center gap-1.5 px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                                                            emp.statusId === 7 ? "bg-white dark:bg-slate-900 text-indigo-600 shadow-sm" : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                                                        )}
                                                    >
                                                        <CalendarDays className="h-3.5 w-3.5" /> WO/HO
                                                    </button>
                                                </div>
                                            </td>

                                            {/* 3. Check-In Time Input */}
                                            <td className="py-4 text-center">
                                                <input
                                                    type="time"
                                                    disabled={isDisabling}
                                                    value={emp.checkIn}
                                                    onChange={(e) => handleTimeChange(emp.id, 'checkIn', e.target.value)}
                                                    className={cn(
                                                        "w-[110px] h-10 px-3 mx-auto bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-black tracking-widest text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all disabled:opacity-40 disabled:cursor-not-allowed",
                                                        emp.isDirty && "border-indigo-300 bg-indigo-50/30 dark:border-indigo-500/30"
                                                    )}
                                                />
                                            </td>

                                            {/* 4. Check-Out Time Input */}
                                            <td className="py-4 text-center">
                                                <input
                                                    type="time"
                                                    disabled={isDisabling}
                                                    value={emp.checkOut}
                                                    onChange={(e) => handleTimeChange(emp.id, 'checkOut', e.target.value)}
                                                    className={cn(
                                                        "w-[110px] h-10 px-3 mx-auto bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-black tracking-widest text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all disabled:opacity-40 disabled:cursor-not-allowed",
                                                        emp.isDirty && "border-indigo-300 bg-indigo-50/30 dark:border-indigo-500/30"
                                                    )}
                                                />
                                            </td>

                                            {/* 5. Undo Action */}
                                            <td className="py-4 text-right pr-4">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleResetRow(emp.id)}
                                                    disabled={!emp.isDirty}
                                                    className={cn(
                                                        "h-9 w-9 rounded-xl transition-all",
                                                        emp.isDirty ? "bg-amber-100 text-amber-600 hover:bg-amber-200 dark:bg-amber-900/30 dark:text-amber-400" : "opacity-0"
                                                    )}
                                                    title="Undo changes"
                                                >
                                                    <RotateCcw className="h-4 w-4" />
                                                </Button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </motion.div>

            {/* Floating Bulk Save Action Bar */}
            <AnimatePresence>
                {hasUnsavedChanges && (
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 50 }}
                        className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 flex items-center gap-6 bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-8 py-4 rounded-[2rem] shadow-2xl border border-slate-800 dark:border-slate-200"
                    >
                        <div className="flex flex-col">
                            <span className={cn(
                                "text-sm font-black uppercase tracking-widest",
                                !isDataValid ? "text-rose-500" : "text-white dark:text-slate-900"
                            )}>
                                {isDataValid ? "Unsaved Changes Detected" : "Warning: Incomplete Records"}
                            </span>
                            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                                {isDataValid ? "Click save to update the master database" : "PLEASE PROVIDE CHECK-IN TIMES FOR ALL PRESENT EMPLOYEES"}
                            </span>
                        </div>
                        <Button
                            onClick={handleSaveAll}
                            disabled={isSaving || !isDataValid}
                            className={cn(
                                "h-12 px-8 rounded-3xl font-black uppercase tracking-widest text-[11px] shadow-lg transition-all",
                                !isDataValid ? "bg-slate-700 cursor-not-allowed opacity-50" : "bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-600/20"
                            )}
                        >
                            {isSaving ? (
                                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</>
                            ) : (
                                <><Save className="mr-2 h-4 w-4" /> Save All Updates</>
                            )}
                        </Button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}