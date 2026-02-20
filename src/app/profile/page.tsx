"use client";

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    User, Mail, Phone, Github, Globe,
    Camera, Plus, X, Save, Briefcase,
    Code2, ShieldCheck, MapPin, Link as LinkIcon
} from 'lucide-react';
import { toast } from 'sonner';

import { useStore } from "@/store/useStore";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

export default function ProfileSettings() {
    const { currentUser, updateCurrentUser } = useStore();

    // Local state for profile data
    const [formData, setFormData] = useState({
        name: currentUser?.name || '',
        username: currentUser?.username || '',
        bio: 'Senior Software Architect specializing in distributed systems and cloud infrastructure.',
        github: 'https://github.com/marcusthorne',
        location: 'San Francisco, CA',
        phone: '+1 (555) 000-0000',
        email: `${currentUser?.username}@nexintel.com`,
    });

    const [designations, setDesignations] = useState<string[]>(['Lead Architect', 'Security Auditor']);
    const [techStack, setTechStack] = useState<string[]>(['Next.js', 'Go', 'Rust', 'Kubernetes']);
    const [profileImg, setProfileImg] = useState<string | null>(null);

    const [newTag, setNewTag] = useState({ designation: '', tech: '' });
    const fileInputRef = useRef<HTMLInputElement>(null);

    // --- Handlers ---
    const handleSave = () => {
        // In a real app, you'd merge this and send to API
        toast.success("Identity parameters synchronized");
    };

    const addDesignation = () => {
        if (newTag.designation && !designations.includes(newTag.designation)) {
            setDesignations([...designations, newTag.designation]);
            setNewTag({ ...newTag, designation: '' });
        }
    };

    const addTech = () => {
        if (newTag.tech && !techStack.includes(newTag.tech)) {
            setTechStack([...techStack, newTag.tech]);
            setNewTag({ ...newTag, tech: '' });
        }
    };

    const removeTag = (list: string[], setList: Function, tag: string) => {
        setList(list.filter(t => t !== tag));
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => setProfileImg(reader.result as string);
            reader.readAsDataURL(file);
            toast.info("Avatar buffer updated");
        }
    };

    return (
        <div className="max-w-5xl mx-auto space-y-8 pb-20 animate-in fade-in duration-700">

            {/* 1. Profile Header / Hero */}
            <div className="relative h-64 rounded-[3rem] bg-indigo-600 overflow-hidden shadow-2xl shadow-indigo-500/20">
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-700 to-violet-700 opacity-50" />
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20" />

                {/* Avatar Upload */}
                <div className="absolute -bottom-16 left-12 group">
                    <div className="relative h-40 w-40 rounded-[2.5rem] border-[6px] border-white bg-slate-100 dark:bg-slate-800 dark:border-slate-950 overflow-hidden shadow-xl transition-transform group-hover:scale-[1.02]">
                        {profileImg ? (
                            <img src={profileImg} className="h-full w-full object-cover" alt="Profile" />
                        ) : (
                            <div className="h-full w-full flex items-center justify-center bg-indigo-100 text-indigo-600 font-black text-4xl">
                                {currentUser?.name.charAt(0)}
                            </div>
                        )}
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                            <Camera className="text-white" size={28} />
                        </button>
                        <input type="file" ref={fileInputRef} className="hidden" onChange={handleImageUpload} accept="image/*" />
                    </div>
                </div>
            </div>

            <div className="pt-16 grid grid-cols-1 lg:grid-cols-12 gap-8">

                {/* Left Column: Basic Info */}
                <div className="lg:col-span-7 space-y-8">
                    <section className="rounded-[2.5rem] border border-slate-200 bg-white p-8 dark:border-slate-800 dark:bg-slate-900 shadow-sm">
                        <h3 className="text-xl font-black uppercase tracking-tight mb-8 flex items-center gap-3">
                            <User className="text-indigo-600" size={20} /> Personal Parameters
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Legal Name</Label>
                                <Input value={formData.name} className="h-12 rounded-2xl" onChange={e => setFormData({ ...formData, name: e.target.value })} />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">System ID</Label>
                                <Input value={formData.username} className="h-12 rounded-2xl" onChange={e => setFormData({ ...formData, username: e.target.value })} />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Primary Email</Label>
                                <Input value={formData.email} className="h-12 rounded-2xl" type="email" readOnly />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Direct Phone</Label>
                                <Input value={formData.phone} className="h-12 rounded-2xl" readOnly />
                            </div>
                            <div className="md:col-span-2 space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Executive Summary (Bio)</Label>
                                <textarea
                                    className="w-full min-h-[120px] rounded-3xl border border-slate-200 bg-white p-4 text-sm focus:border-indigo-600 outline-none dark:bg-slate-950 dark:border-slate-800"
                                    value={formData.bio}
                                    onChange={e => setFormData({ ...formData, bio: e.target.value })}
                                />
                            </div>
                        </div>
                    </section>

                    {/* GitHub & Social */}
                    <section className="rounded-[2.5rem] border border-slate-200 bg-white p-8 dark:border-slate-800 dark:bg-slate-900 shadow-sm">
                        <h3 className="text-xl font-black uppercase tracking-tight mb-8 flex items-center gap-3">
                            <Globe className="text-indigo-600" size={20} /> External Integrations
                        </h3>
                        <div className="space-y-4">
                            <div className="relative group">
                                <Github className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-indigo-600" />
                                <Input
                                    placeholder="GitHub Profile URL"
                                    value={formData.github}
                                    className="pl-12 h-14 rounded-2xl bg-slate-50 border-none dark:bg-slate-800"
                                    onChange={e => setFormData({ ...formData, github: e.target.value })}
                                />
                            </div>
                            <div className="relative group">
                                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-indigo-600" />
                                <Input
                                    placeholder="Operational Base (Location)"
                                    value={formData.location}
                                    className="pl-12 h-14 rounded-2xl bg-slate-50 border-none dark:bg-slate-800"
                                    onChange={e => setFormData({ ...formData, location: e.target.value })}
                                />
                            </div>
                        </div>
                    </section>
                </div>

                {/* Right Column: Skills & Roles */}
                <div className="lg:col-span-5 space-y-8">

                    {/* Designations Section */}
                    <section className="rounded-[2.5rem] border border-slate-200 bg-white p-8 dark:border-slate-800 dark:bg-slate-900 shadow-sm">
                        <h3 className="text-xl font-black uppercase tracking-tight mb-6 flex items-center gap-3">
                            <Briefcase className="text-indigo-600" size={20} /> Designations
                        </h3>
                        <div className="flex flex-wrap gap-2 mb-6">
                            <AnimatePresence>
                                {designations.map(tag => (
                                    <motion.span
                                        key={tag}
                                        initial={{ scale: 0.8, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        exit={{ scale: 0.8, opacity: 0 }}
                                        className="flex items-center gap-2 rounded-xl bg-indigo-50 px-3 py-1.5 text-xs font-black uppercase tracking-wider text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300"
                                    >
                                        {tag}
                                        <X size={14} className="cursor-pointer hover:text-rose-500" onClick={() => removeTag(designations, setDesignations, tag)} />
                                    </motion.span>
                                ))}
                            </AnimatePresence>
                        </div>
                        <div className="flex gap-2">
                            <Input
                                placeholder="Add Role..."
                                className="h-11 rounded-xl"
                                value={newTag.designation}
                                onChange={e => setNewTag({ ...newTag, designation: e.target.value })}
                                onKeyDown={e => e.key === 'Enter' && addDesignation()}
                            />
                            <Button onClick={addDesignation} className="h-11 w-11 rounded-xl bg-indigo-600 p-0 shadow-lg shadow-indigo-500/20">
                                <Plus size={20} />
                            </Button>
                        </div>
                    </section>

                    {/* Tech Stack Section */}
                    <section className="rounded-[2.5rem] border border-slate-200 bg-white p-8 dark:border-slate-800 dark:bg-slate-900 shadow-sm">
                        <h3 className="text-xl font-black uppercase tracking-tight mb-6 flex items-center gap-3">
                            <Code2 className="text-indigo-600" size={20} /> Tech Stack
                        </h3>
                        <div className="flex flex-wrap gap-2 mb-6">
                            <AnimatePresence>
                                {techStack.map(tag => (
                                    <motion.span
                                        key={tag}
                                        initial={{ opacity: 0, y: 5 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 5 }}
                                        className="flex items-center gap-2 rounded-xl bg-slate-100 px-3 py-1.5 text-xs font-black uppercase tracking-wider text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                                    >
                                        {tag}
                                        <X size={14} className="cursor-pointer hover:text-rose-500" onClick={() => removeTag(techStack, setTechStack, tag)} />
                                    </motion.span>
                                ))}
                            </AnimatePresence>
                        </div>
                        <div className="flex gap-2">
                            <Input
                                placeholder="Add Skill (e.g. AWS)..."
                                className="h-11 rounded-xl"
                                value={newTag.tech}
                                onChange={e => setNewTag({ ...newTag, tech: e.target.value })}
                                onKeyDown={e => e.key === 'Enter' && addTech()}
                            />
                            <Button onClick={addTech} className="h-11 w-11 rounded-xl bg-slate-900 p-0 shadow-lg shadow-slate-900/20">
                                <Plus size={20} />
                            </Button>
                        </div>
                    </section>

                    {/* Verification Status */}
                    <div className="rounded-[2.5rem] bg-slate-900 p-8 text-white shadow-2xl relative overflow-hidden">
                        <div className="relative z-10 flex items-center justify-between">
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400">Account Status</p>
                                <h4 className="text-xl font-black mt-1">Lead Verified</h4>
                            </div>
                            <ShieldCheck size={40} className="text-indigo-500 opacity-50" />
                        </div>
                        <p className="relative z-10 mt-6 text-xs text-slate-400 leading-relaxed font-medium">
                            Your profile is verified within the NexIntel Synergy network. Strategic deployment access is currently <span className="text-emerald-400 font-bold uppercase">Authorized</span>.
                        </p>
                        <div className="absolute -right-10 -bottom-10 h-40 w-40 bg-indigo-600/20 rounded-full blur-3xl" />
                    </div>

                    <Button onClick={handleSave} className="w-full h-14 rounded-[1.5rem] bg-indigo-600 hover:bg-indigo-700 font-black uppercase tracking-widest text-xs shadow-xl shadow-indigo-500/20">
                        <Save className="mr-3" size={18} /> Synchronize Profile
                    </Button>

                </div>
            </div>
        </div>
    );
}