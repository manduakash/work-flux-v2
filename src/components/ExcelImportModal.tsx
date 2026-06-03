"use client";

import React, { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    FileSpreadsheet, Upload, X, AlertCircle,
    CheckCircle2, Loader2, ArrowRight, FileUp,
    Users, Clock, UserX
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import * as XLSX from "xlsx";

// ─── Types ────────────────────────────────────────────────────────────────────

interface EmployeeEntry {
    id: number;
    name: string;
    dept: string;
    statusId: number | null;
    checkIn: string;
    checkOut: string;
    workLocationId: number;
    isDirty?: boolean;
}

interface ParsedRow {
    id: number;
    name: string;
    dept: string;
    statusId: number;
    checkIn: string;
    checkOut: string;
    workLocationId: number;
}

interface ImportSummary {
    total: number;
    present: number;
    absent: number;
    matched: number;
    unmatched: number;
}

interface ExcelImportModalProps {
    /** Current employees loaded on the page */
    employees: EmployeeEntry[];
    /** Setter from parent useState */
    setEmployees: React.Dispatch<React.SetStateAction<EmployeeEntry[]>>;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Maps ESSL "Status" column → internal statusId
 *   Present     → 1 (On Time)
 *   Not Present → 4 (Absent)
 */
const mapStatus = (statusStr: string): number => {
    const s = (statusStr ?? "").toLowerCase().trim();
    if (s === "present") return 1;
    return 4; // Not Present → Absent
};

/**
 * Extracts the FIRST punch time from PunchRecords (comma-separated list)
 * e.g. "09:30,11:23,13:06," → "09:30"
 */
const extractFirstPunch = (punchRecords: string): string => {
    if (!punchRecords) return "";
    const punches = punchRecords
        .split(",")
        .map((p) => p.trim())
        .filter(Boolean);
    return punches[0] ?? "";
};

/**
 * Extracts the LAST punch time from PunchRecords
 * e.g. "09:30,11:23,13:06," → "13:06"
 */
const extractLastPunch = (punchRecords: string): string => {
    if (!punchRecords) return "";
    const punches = punchRecords
        .split(",")
        .map((p) => p.trim())
        .filter(Boolean);
    return punches[punches.length - 1] ?? "";
};

/**
 * Parses the raw XLSX sheet rows into our internal ParsedRow shape.
 * Columns: EmployeeCode, EmployeeName, Company, Department,
 *          LastPunch, Direction, PunchRecords, Status
 */
const parseSheetRows = (rows: Record<string, string>[]): ParsedRow[] => {
    return rows
        .filter((r) => r.EmployeeCode && !isNaN(Number(r.EmployeeCode)))
        .map((r) => {
            const statusId = mapStatus(r.Status ?? "");
            const isPresent = statusId === 1;

            const checkIn = isPresent ? extractFirstPunch(r.PunchRecords ?? "") : "";
            // If LastPunch exists and differs from first punch, use it as check-out
            const checkOut = isPresent ? extractLastPunch(r.PunchRecords ?? "") : "";

            return {
                id: Number(r.EmployeeCode),
                name: (r.EmployeeName ?? "").trim(),
                dept: (r.Department ?? "").trim(),
                statusId,
                checkIn,
                // Only set checkout if it's different from checkin (i.e. multiple punches)
                checkOut: checkOut !== checkIn ? checkOut : "",
                workLocationId: 1, // Default to Office; ESSL data doesn't carry location
            };
        });
};

// ─── Component ────────────────────────────────────────────────────────────────

export function ExcelImportModal({ employees, setEmployees }: ExcelImportModalProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const [parsedRows, setParsedRows] = useState<ParsedRow[]>([]);
    const [summary, setSummary] = useState<ImportSummary | null>(null);
    const [step, setStep] = useState<"upload" | "preview" | "done">("upload");
    const [error, setError] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // ── Reset modal state ──────────────────────────────────────────────────
    const resetModal = () => {
        setFile(null);
        setParsedRows([]);
        setSummary(null);
        setStep("upload");
        setError(null);
        setIsProcessing(false);
    };

    const handleClose = () => {
        setIsOpen(false);
        setTimeout(resetModal, 300);
    };

    // ── File parsing ───────────────────────────────────────────────────────
    const processFile = useCallback(async (f: File) => {
        setError(null);
        setIsProcessing(true);

        try {
            const buffer = await f.arrayBuffer();
            const wb = XLSX.read(buffer, { type: "array" });
            const ws = wb.Sheets[wb.SheetNames[0]];
            const rawRows = XLSX.utils.sheet_to_json<Record<string, string>>(ws, {
                defval: "",
                raw: false,
            });

            if (!rawRows.length) {
                setError("The file appears to be empty or has no recognisable rows.");
                setIsProcessing(false);
                return;
            }

            const parsed = parseSheetRows(rawRows);

            if (!parsed.length) {
                setError("Could not find an EmployeeCode column. Make sure you're uploading an ESSL attendance export.");
                setIsProcessing(false);
                return;
            }

            // Build summary
            const matched = parsed.filter((p) =>
                employees.some((e) => e.id === p.id)
            ).length;

            setSummary({
                total: parsed.length,
                present: parsed.filter((p) => p.statusId === 1).length,
                absent: parsed.filter((p) => p.statusId === 4).length,
                matched,
                unmatched: parsed.length - matched,
            });

            setParsedRows(parsed);
            setFile(f);
            setStep("preview");
        } catch (err) {
            setError("Failed to read the file. Please make sure it's a valid .xls or .xlsx file.");
        } finally {
            setIsProcessing(false);
        }
    }, [employees]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const f = e.target.files?.[0];
        if (f) processFile(f);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const f = e.dataTransfer.files?.[0];
        if (f) processFile(f);
    };

    // ── Apply import to parent state ───────────────────────────────────────
    const handleApplyImport = () => {
        setEmployees((prev) =>
            prev.map((emp) => {
                const match = parsedRows.find((p) => p.id === emp.id);
                if (!match) return emp; // No data for this employee in the XLS → leave untouched

                return {
                    ...emp,
                    statusId: match.statusId,
                    checkIn: match.checkIn,
                    checkOut: match.checkOut,
                    workLocationId: match.workLocationId,
                    isDirty: true, // Mark as dirty so Save All picks it up
                };
            })
        );

        setStep("done");
    };

    // ─── Render ─────────────────────────────────────────────────────────────
    return (
        <>
            {/* ── Trigger Button ── */}
            <Button
                onClick={() => setIsOpen(true)}
                variant="outline"
                className="h-14 px-6 rounded-3xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-black uppercase tracking-widest text-slate-700 dark:text-slate-300 hover:bg-indigo-50 hover:border-indigo-300 hover:text-indigo-700 dark:hover:bg-indigo-900/20 dark:hover:border-indigo-500 dark:hover:text-indigo-400 transition-all gap-2.5 shadow-sm"
            >
                <FileSpreadsheet className="h-4 w-4" />
                Import Excel
            </Button>

            {/* ── Modal Overlay ── */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-100 overflow-auto flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm"
                        onClick={(e) => e.target === e.currentTarget && handleClose()}
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden"
                        >
                            {/* Modal Header */}
                            <div className="flex items-center justify-between px-8 pt-8 pb-6 border-b border-slate-100 dark:border-slate-800">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="h-px w-5 bg-indigo-500/40" />
                                        <span className="text-[9px] font-black uppercase tracking-[0.4em] text-indigo-500">ESSL Import</span>
                                    </div>
                                    <h2 className="text-2xl font-black uppercase tracking-tight text-slate-900 dark:text-white">
                                        Excel Attendance
                                    </h2>
                                </div>
                                <button
                                    onClick={handleClose}
                                    className="h-10 w-10 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 hover:bg-rose-100 hover:text-rose-600 dark:hover:bg-rose-900/30 dark:hover:text-rose-400 transition-all"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            </div>

                            {/* Step Indicator */}
                            <div className="flex items-center gap-2 px-8 pt-5">
                                {["upload", "preview", "done"].map((s, i) => (
                                    <React.Fragment key={s}>
                                        <div className={cn(
                                            "flex items-center gap-2 text-[9px] font-black uppercase tracking-widest transition-all",
                                            step === s ? "text-indigo-600" :
                                                ["upload", "preview", "done"].indexOf(step) > i
                                                    ? "text-emerald-500" : "text-slate-300 dark:text-slate-600"
                                        )}>
                                            <div className={cn(
                                                "h-5 w-5 rounded-full flex items-center justify-center text-[9px] font-black transition-all",
                                                step === s ? "bg-indigo-600 text-white" :
                                                    ["upload", "preview", "done"].indexOf(step) > i
                                                        ? "bg-emerald-500 text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-400"
                                            )}>{i + 1}</div>
                                            {s}
                                        </div>
                                        {i < 2 && <ArrowRight className="h-3 w-3 text-slate-200 dark:text-slate-700 flex-shrink-0" />}
                                    </React.Fragment>
                                ))}
                            </div>

                            {/* Modal Body */}
                            <div className="px-8 py-6">

                                {/* ── STEP 1: Upload ── */}
                                {step === "upload" && (
                                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                        <div
                                            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                                            onDragLeave={() => setIsDragging(false)}
                                            onDrop={handleDrop}
                                            onClick={() => fileInputRef.current?.click()}
                                            className={cn(
                                                "relative flex flex-col items-center justify-center gap-4 p-10 rounded-[2rem] border-2 border-dashed cursor-pointer transition-all",
                                                isDragging
                                                    ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 scale-[1.01]"
                                                    : "border-slate-200 dark:border-slate-700 hover:border-indigo-300 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                                            )}
                                        >
                                            {isProcessing ? (
                                                <>
                                                    <Loader2 className="h-10 w-10 text-indigo-500 animate-spin" />
                                                    <span className="text-xs font-black uppercase tracking-widest text-slate-500">Reading file...</span>
                                                </>
                                            ) : (
                                                <>
                                                    <div className="h-16 w-16 rounded-[1.25rem] bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center">
                                                        <FileUp className="h-8 w-8 text-indigo-500" />
                                                    </div>
                                                    <div className="text-center">
                                                        <p className="text-sm font-black uppercase tracking-widest text-slate-800 dark:text-white">
                                                            Drop your ESSL export here
                                                        </p>
                                                        <p className="mt-1 text-[11px] font-medium text-slate-400 uppercase tracking-wider">
                                                            or click to browse · .xls / .xlsx
                                                        </p>
                                                    </div>
                                                </>
                                            )}
                                        </div>

                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            accept=".xls,.xlsx,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                                            className="hidden"
                                            onChange={handleFileChange}
                                        />

                                        {error && (
                                            <motion.div
                                                initial={{ opacity: 0, y: 4 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className="mt-4 flex items-start gap-3 p-4 bg-rose-50 dark:bg-rose-900/20 rounded-2xl border border-rose-200 dark:border-rose-800"
                                            >
                                                <AlertCircle className="h-4 w-4 text-rose-500 mt-0.5 flex-shrink-0" />
                                                <p className="text-xs font-bold text-rose-600 dark:text-rose-400">{error}</p>
                                            </motion.div>
                                        )}

                                        {/* Format hint */}
                                        <div className="mt-5 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl">
                                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Expected columns</p>
                                            <div className="flex flex-wrap gap-2">
                                                {["EmployeeCode", "EmployeeName", "Department", "PunchRecords", "Status"].map((col) => (
                                                    <span key={col} className="px-2 py-1 bg-white dark:bg-slate-700 rounded-lg text-[10px] font-bold text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-600">
                                                        {col}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </motion.div>
                                )}

                                {/* ── STEP 2: Preview ── */}
                                {step === "preview" && summary && (
                                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
                                        {/* File name badge */}
                                        <div className="flex items-center gap-3 p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl border border-emerald-200 dark:border-emerald-800">
                                            <FileSpreadsheet className="h-5 w-5 text-emerald-600 flex-shrink-0" />
                                            <div className="min-w-0">
                                                <p className="text-xs font-black uppercase tracking-widest text-emerald-700 dark:text-emerald-400 truncate">{file?.name}</p>
                                                <p className="text-[10px] text-emerald-600/70 font-bold uppercase">File parsed successfully</p>
                                            </div>
                                            <CheckCircle2 className="h-5 w-5 text-emerald-500 ml-auto flex-shrink-0" />
                                        </div>

                                        {/* Summary stats */}
                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <Users className="h-3.5 w-3.5 text-slate-400" />
                                                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Total Rows</span>
                                                </div>
                                                <p className="text-3xl font-black text-slate-900 dark:text-white">{summary.total}</p>
                                            </div>
                                            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <CheckCircle2 className="h-3.5 w-3.5 text-indigo-400" />
                                                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Matched IDs</span>
                                                </div>
                                                <p className="text-3xl font-black text-indigo-600">{summary.matched}</p>
                                            </div>
                                            <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <Clock className="h-3.5 w-3.5 text-emerald-500" />
                                                    <span className="text-[9px] font-black uppercase tracking-widest text-emerald-600/70">Present</span>
                                                </div>
                                                <p className="text-3xl font-black text-emerald-600">{summary.present}</p>
                                            </div>
                                            <div className="p-4 bg-rose-50 dark:bg-rose-900/20 rounded-2xl">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <UserX className="h-3.5 w-3.5 text-rose-500" />
                                                    <span className="text-[9px] font-black uppercase tracking-widest text-rose-600/70">Absent</span>
                                                </div>
                                                <p className="text-3xl font-black text-rose-500">{summary.absent}</p>
                                            </div>
                                        </div>

                                        {summary.unmatched > 0 && (
                                            <div className="flex items-start gap-3 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-2xl border border-amber-200 dark:border-amber-800">
                                                <AlertCircle className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
                                                <p className="text-[11px] font-bold text-amber-700 dark:text-amber-400">
                                                    {summary.unmatched} employee{summary.unmatched > 1 ? "s" : ""} in the XLS don't match any loaded employee ID and will be skipped.
                                                </p>
                                            </div>
                                        )}

                                        {/* Mapping explanation */}
                                        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl space-y-2">
                                            <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-3">Field Mapping</p>
                                            {[
                                                ["EmployeeCode", "ua_id (Employee ID)"],
                                                ["PunchRecords[0]", "Check-In Time"],
                                                ["PunchRecords[last]", "Check-Out Time"],
                                                ["Status: Present", "statusId → 1 (Present)"],
                                                ["Status: Not Present", "statusId → 4 (Absent)"],
                                            ].map(([from, to]) => (
                                                <div key={from} className="flex items-center justify-between text-[10px]">
                                                    <span className="font-bold text-slate-500 font-mono">{from}</span>
                                                    <ArrowRight className="h-3 w-3 text-slate-300 mx-2 flex-shrink-0" />
                                                    <span className="font-black text-slate-700 dark:text-slate-300">{to}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}

                                {/* ── STEP 3: Done ── */}
                                {step === "done" && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="flex flex-col items-center py-6 gap-4 text-center"
                                    >
                                        <motion.div
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.1 }}
                                            className="h-20 w-20 rounded-[2rem] bg-emerald-500 flex items-center justify-center"
                                        >
                                            <CheckCircle2 className="h-10 w-10 text-white" />
                                        </motion.div>
                                        <div>
                                            <p className="text-2xl font-black uppercase tracking-tight text-slate-900 dark:text-white">Import Applied!</p>
                                            <p className="text-sm text-slate-500 font-medium mt-1">
                                                {summary?.matched} records marked as dirty — ready to save.
                                            </p>
                                        </div>
                                        <p className="text-xs font-bold text-indigo-600 uppercase tracking-widest bg-indigo-50 dark:bg-indigo-900/20 px-4 py-2 rounded-2xl">
                                            Click "Save All Updates" in the floating bar to push to the API
                                        </p>
                                    </motion.div>
                                )}
                            </div>

                            {/* Modal Footer */}
                            <div className="flex items-center justify-end gap-3 px-8 pb-8">
                                {step === "upload" && (
                                    <Button variant="ghost" onClick={handleClose} className="rounded-2xl font-black uppercase tracking-widest text-xs text-slate-500">
                                        Cancel
                                    </Button>
                                )}
                                {step === "preview" && (
                                    <>
                                        <Button
                                            variant="ghost"
                                            onClick={() => { setStep("upload"); setFile(null); setParsedRows([]); setSummary(null); }}
                                            className="rounded-2xl font-black uppercase tracking-widest text-xs text-slate-500"
                                        >
                                            Re-upload
                                        </Button>
                                        <Button
                                            onClick={handleApplyImport}
                                            className="h-11 px-6 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black uppercase tracking-widest text-xs shadow-lg shadow-indigo-600/20"
                                        >
                                            Apply Import
                                            <ArrowRight className="ml-2 h-4 w-4" />
                                        </Button>
                                    </>
                                )}
                                {step === "done" && (
                                    <Button
                                        onClick={handleClose}
                                        className="h-11 px-6 rounded-2xl bg-slate-900 dark:bg-white dark:text-slate-900 text-white font-black uppercase tracking-widest text-xs"
                                    >
                                        Close & Review
                                    </Button>
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
