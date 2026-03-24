"use client";

import React from 'react';
import { LogIn, Clock, ArrowLeft, ShieldAlert, Hourglass } from 'lucide-react';

const SessionExpired = () => {
    return (
        <div className="min-h-screen bg-slate-100 flex items-center justify-center p-6">
            <div className="max-w-md w-full">
                {/* Card Container */}
                <div className="bg-white rounded-[2.5rem] p-10 shadow-xl shadow-slate-200/60 border border-slate-100 text-center relative overflow-hidden">

                    {/* Decorative Background Element */}
                    <div className="absolute -top-10 -right-10 w-32 h-32 bg-indigo-50 rounded-full blur-3xl opacity-50" />

                    {/* Icon Header */}
                    <div className="relative mb-8 flex justify-center">
                        <div className="w-20 h-20 bg-orange-50 rounded-3xl flex items-center justify-center rotate-3">
                            <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center -rotate-3 transition-transform hover:rotate-0 duration-300">
                                <Hourglass className="text-orange-600 animate-caret-blink" size={32} strokeWidth={2.5} />
                            </div>
                        </div>
                        {/* Small floating alert badge */}
                        <div className="absolute top-0 right-[35%] bg-white p-1.5 rounded-full shadow-sm border border-slate-100">
                            <ShieldAlert size={16} className="text-red-500" />
                        </div>
                    </div>

                    {/* Content */}
                    <h1 className="text-2xl font-black text-slate-800 mb-3 tracking-tight">
                        Session Expired
                    </h1>
                    <p className="text-slate-500 text-sm leading-relaxed mb-10">
                        For your security, you have been automatically logged out due to inactivity. Don't worry, your progress has been saved.
                    </p>

                    {/* Action Buttons */}
                    <div className="space-y-3">
                        <a
                            href="/login"
                            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-indigo-200 flex items-center justify-center gap-2 group"
                        >
                            <LogIn size={18} className="group-hover:translate-x-1 transition-transform" />
                            Sign In Again
                        </a>

                        <a
                            href="/"
                            className="w-full bg-white hover:bg-slate-50 text-slate-600 font-semibold py-4 rounded-2xl border border-slate-200 transition-all flex items-center justify-center gap-2"
                        >
                            <ArrowLeft size={16} />
                            Back to Homepage
                        </a>
                    </div>
                </div>

                {/* Support Link */}
                <p className="text-center mt-8 text-sm text-slate-400">
                    Having trouble? <a href="#" className="text-indigo-600 font-semibold hover:underline">Contact Support</a>
                </p>
            </div>
        </div>
    );
};

export default SessionExpired;