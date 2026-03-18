// components/GlobalLoader.tsx
'use client';

import { useState, useEffect } from 'react';
import Lottie from 'lottie-react';
// Import your downloaded Lottie JSON file here:
import loadingAnimation from '@/assets/loading-animation.json';

export default function GlobalLoader() {
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const show = () => setIsLoading(true);
        const hide = () => setIsLoading(false);

        window.addEventListener('showGlobalLoader', show);
        window.addEventListener('hideGlobalLoader', hide);

        return () => {
            window.removeEventListener('showGlobalLoader', show);
            window.removeEventListener('hideGlobalLoader', hide);
        };
    }, []);

    if (!isLoading) return null;

    return (
        // Background overlay
        <div className="fixed inset-0 z-[9999] flex items-center justify-center dark:bg-black/50 bg-white/50 backdrop-blur-sm">

            {/* Lottie Container - Adjust w-40 h-40 to change the size of your animation */}
            <div className="w-60 h-60 flex items-center justify-center">
                <Lottie
                    animationData={loadingAnimation}
                    loop={true}
                    autoplay={true}
                />
            </div>

        </div>
    );
}