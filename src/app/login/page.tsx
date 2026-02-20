"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { FolderKanban, Lock, User, Loader2, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";

// If you are using Shadcn UI, import their components. 
// Otherwise, I've provided a clean styled version below.
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useStore } from "@/store/useStore";


export default function LoginPage() {
    const login = useStore((state) => state.login);
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const [formData, setFormData] = useState({
        username: "",
        password: "",
    });

    // Mock login function - replace with your useStore logic
    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        // Simulate API delay
        await new Promise((resolve) => setTimeout(resolve, 1000));

        const currentUser: any = login(formData?.username);
        console.log(currentUser);

        // Basic logic check (Replace with your useStore/Auth logic)
        if (currentUser) {
            toast.success("Authentication successful", {
                description: "Welcome back to NexIntel Synergy.",
            });

            if (currentUser?.role == 'ADMIN') {
                router.push("/admin-dashboard");
            } else if (currentUser?.role == 'TEAM_LEAD') {
                router.push("/team-lead-dashboard");
            } else if (currentUser?.role == 'DEVELOPER') {
                router.push("/developer-dashboard");
            } else {
                toast.error("Invalid Role", {
                    description: "You are not authorized to login.",
                });
                setIsLoading(false);
                return;
            }
        } else {
            toast.error("Invalid credentials", {
                description: "Please check your username and password.",
            });
            setIsLoading(false);
        }
    };

    return (
        <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden font-sans">

            {/* Background Video Layer */}
            <div className="absolute inset-0 z-0">
                <video
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="h-full w-full object-cover" // scale-105 prevents white edges
                >
                    <source src="/bg.mp4" type="video/mp4" />
                </video>
                {/* Multi-layered overlay for depth */}
                <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-[5px]" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-slate-950/20" />
            </div>

            {/* Login Card Container */}
            <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="relative z-10 w-full max-w-[420px] px-6"
            >
                <div className="overflow-hidden rounded-3xl border border-white/20 bg-white/10 p-8 shadow-2xl backdrop-blur-xl dark:bg-slate-900/40">

                    {/* Header/Logo */}
                    <div className="mb-8 text-center">
                        <motion.div
                            initial={{ scale: 0.5 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                            className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-xl shadow-indigo-500/20"
                        >
                            <FolderKanban size={30} />
                        </motion.div>
                        <h2 className="mt-6 text-2xl font-bold tracking-tight text-white">
                            NexIntel Synergy
                        </h2>
                        <p className="mt-2 text-sm text-slate-200/70">
                            Enterprise Project Management
                        </p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-5">
                        {/* Username Field */}
                        <div className="space-y-2">
                            <label className="text-xs font-semibold uppercase tracking-wider text-slate-200/80 ml-1">
                                Username
                            </label>
                            <div className="relative group">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-white transition-colors" />
                                <input
                                    type="text"
                                    required
                                    placeholder="Enter your username"
                                    value={formData.username}
                                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                    className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 pl-10 pr-4 text-white placeholder:text-slate-400 focus:border-indigo-500/50 focus:bg-white/10 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all"
                                />
                            </div>
                        </div>

                        {/* Password Field */}
                        <div className="space-y-2">
                            <label className="text-xs font-semibold uppercase tracking-wider text-slate-200/80 ml-1">
                                Password
                            </label>
                            <div className="relative group">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-white transition-colors" />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    required
                                    placeholder="••••••••"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 pl-10 pr-12 text-white placeholder:text-slate-400 focus:border-indigo-500/50 focus:bg-white/10 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        {/* Utilities */}
                        <div className="flex items-center justify-between px-1">
                            <div className="flex items-center space-x-2">
                                <Checkbox id="remember" className="border-white/20 data-[state=checked]:bg-indigo-600" />
                                <label htmlFor="remember" className="text-sm text-slate-300 cursor-pointer select-none">
                                    Remember me
                                </label>
                            </div>
                            <button type="button" className="text-sm font-medium text-indigo-400 hover:text-indigo-300 transition-colors">
                                Forgot Password?
                            </button>
                        </div>

                        {/* Submit Button */}
                        <Button
                            disabled={isLoading}
                            className="relative w-full overflow-hidden rounded-xl bg-indigo-600 py-6 text-base font-semibold text-white hover:bg-indigo-500 shadow-lg shadow-indigo-600/20 active:scale-[0.98] transition-all"
                        >
                            <AnimatePresence mode="wait">
                                {isLoading ? (
                                    <motion.div
                                        key="loader"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="flex items-center justify-center gap-2"
                                    >
                                        <Loader2 className="h-5 w-5 animate-spin" />
                                        Signing in...
                                    </motion.div>
                                ) : (
                                    <motion.span key="text" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                        Sign In
                                    </motion.span>
                                )}
                            </AnimatePresence>
                        </Button>
                    </form>
                </div>

                {/* Optional: Footer text */}
                <p className="mt-8 text-center text-sm text-slate-400">
                    Secure & end-to-end encrypted AES-256. <br />
                    &copy; {new Date().getFullYear()} NexIntel Synergy
                </p>
            </motion.div>
        </div>
    );
}