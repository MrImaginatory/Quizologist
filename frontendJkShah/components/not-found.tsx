"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export function NotFound() {
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  useEffect(() => {
    setCurrentYear(new Date().getFullYear());
  }, []);

  return (
    <>
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-16px) rotate(2deg); }
        }
        @keyframes pulseRing {
          0% { transform: scale(0.85); opacity: 0.8; }
          50% { transform: scale(1.15); opacity: 0.3; }
          100% { transform: scale(0.85); opacity: 0.8; }
        }
        @keyframes twinkle {
          0%, 100% { opacity: 0.2; transform: scale(0.8); }
          50% { opacity: 1; transform: scale(1.2); }
        }
        @keyframes orbit {
          from { transform: rotate(0deg) translateX(45px) rotate(0deg); }
          to { transform: rotate(360deg) translateX(45px) rotate(-360deg); }
        }
        .animate-float { animation: float 5s ease-in-out infinite; transform-origin: center; }
        .animate-pulse-ring { animation: pulseRing 3.5s ease-in-out infinite; transform-origin: center; }
        .star-1 { animation: twinkle 2.2s infinite ease-in-out; }
        .star-2 { animation: twinkle 3.1s infinite ease-in-out 0.8s; }
        .star-3 { animation: twinkle 2.7s infinite ease-in-out 1.5s; }
        .star-4 { animation: twinkle 3.5s infinite ease-in-out 0.4s; }
        .orbit-item { animation: orbit 12s linear infinite; transform-origin: 200px 170px; }
      `}} />
      <div className="min-h-screen bg-slate-50 text-slate-800 dark:bg-slate-950 dark:text-slate-100 flex flex-col justify-between transition-colors duration-300 font-sans selection:bg-blue-600 selection:text-white antialiased">
        
        {/* Subtle Background Grid & Glow (Adapts to Light/Dark) */}
        <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
          <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-blue-500/10 dark:bg-blue-600/15 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-80 h-80 bg-indigo-500/10 dark:bg-indigo-600/10 rounded-full blur-3xl"></div>
        </div>

        {/* Main Content Section */}
        <main className="flex-1 flex flex-col items-center justify-center px-4 py-8 max-w-4xl mx-auto w-full text-center">
          
          {/* Brand Logo */}
          <Link 
            href="/" 
            className="inline-flex items-center justify-center mb-4 transition-transform duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-xl p-1"
            title="J.K. Shah Classes"
          >
            <img 
              src={process.env.NEXT_PUBLIC_APP_LOGO || "https://jkshahclasses.com/uploads/2026/09/6stOrpUo.png"} 
              alt="J.K. Shah Classes" 
              className="h-12 sm:h-16 w-auto max-w-[260px] object-contain drop-shadow-sm"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.onerror = null; 
                target.parentElement!.innerHTML = "<span class='text-2xl font-black tracking-tight text-blue-600 dark:text-blue-400'>J.K. SHAH CLASSES</span>";
              }}
            />
          </Link>

          {/* Status Pill directly below the logo */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs sm:text-sm font-semibold tracking-wide uppercase bg-blue-100 text-blue-800 dark:bg-blue-950/70 dark:text-blue-300 border border-blue-200 dark:border-blue-800/80 mb-6 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-blue-600 dark:bg-blue-400 animate-ping"></span>
            Error 404 • Page Not Found
          </div>

          {/* Animated Vector Illustration */}
          <div className="relative w-full max-w-[380px] sm:max-w-[460px] mb-8 select-none">
            <svg viewBox="0 0 400 320" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto drop-shadow-xl overflow-visible">
              
              {/* Background Ambient Stars */}
              <g className="text-blue-400/50 dark:text-blue-300/40">
                <circle cx="50" cy="50" r="2.5" fill="currentColor" className="star-1" />
                <circle cx="340" cy="70" r="3" fill="currentColor" className="star-2" />
                <circle cx="70" cy="220" r="2" fill="currentColor" className="star-3" />
                <circle cx="325" cy="240" r="3.5" fill="currentColor" className="star-4" />
                <path d="M90 100 L93 103 L90 106 L87 103 Z" fill="currentColor" className="star-2" />
                <path d="M310 140 L314 144 L310 148 L306 144 Z" fill="currentColor" className="star-3" />
              </g>

              {/* Base Platform Shadow */}
              <ellipse cx="200" cy="280" rx="130" ry="16" className="fill-slate-300/40 dark:fill-slate-900/60" />

              {/* Floating Group (Animated) */}
              <g className="animate-float">
                {/* Pulse Concentric Rings around central 0 */}
                <circle cx="200" cy="165" r="54" className="animate-pulse-ring stroke-blue-400/30 dark:stroke-blue-500/20" strokeWidth="2" strokeDasharray="4 4" fill="none" />
                <circle cx="200" cy="165" r="70" className="stroke-blue-500/20 dark:stroke-blue-400/10" strokeWidth="1.5" fill="none" />

                {/* Digit '4' (Left) */}
                <g className="drop-shadow-md">
                  <text x="75" y="205" fontSize="110" fontWeight="900" fontFamily="'Inter', sans-serif" className="fill-slate-800 dark:fill-slate-100" style={{letterSpacing: '-4px'}}>4</text>
                  <path d="M125 105 L80 180 H140 V205" stroke="currentColor" className="stroke-blue-500/20 dark:stroke-blue-400/20" strokeWidth="3" fill="none" />
                </g>

                {/* Central Portal / Radar Search '0' */}
                <g transform="translate(200, 165)">
                  {/* Outer Ring Base */}
                  <circle cx="0" cy="0" r="46" className="fill-white dark:fill-slate-900 stroke-blue-600 dark:stroke-blue-500" strokeWidth="6" />
                  
                  {/* Glass Center Inner */}
                  <circle cx="0" cy="0" r="36" className="fill-blue-50/80 dark:fill-blue-950/70" />
                  
                  {/* Magnifying/Compass Graticule */}
                  <line x1="-36" y1="0" x2="36" y2="0" className="stroke-blue-300/40 dark:stroke-blue-600/40" strokeWidth="1.5" />
                  <line x1="0" y1="-36" x2="0" y2="36" className="stroke-blue-300/40 dark:stroke-blue-600/40" strokeWidth="1.5" />
                  
                  {/* Cute Lost Compass Needle / Pointer */}
                  <polygon points="0,-24 7,-4 0,2 -7,-4" className="fill-blue-600 dark:fill-blue-400" />
                  <polygon points="0,24 7,4 0,-2 -7,4" className="fill-rose-500/80" />
                  <circle cx="0" cy="0" r="4.5" className="fill-white dark:fill-slate-950 stroke-blue-600 dark:stroke-blue-400" strokeWidth="2" />
                </g>

                {/* Orbiting Mini Satellite / Graduation Cap Book */}
                <g className="orbit-item">
                  <circle cx="0" cy="0" r="8" className="fill-amber-400 dark:fill-amber-300 shadow" />
                  <circle cx="0" cy="0" r="12" className="stroke-amber-400/40" strokeWidth="1" fill="none" />
                </g>

                {/* Digit '4' (Right) */}
                <g className="drop-shadow-md">
                  <text x="250" y="205" fontSize="110" fontWeight="900" fontFamily="'Inter', sans-serif" className="fill-slate-800 dark:fill-slate-100" style={{letterSpacing: '-4px'}}>4</text>
                </g>

                {/* Floating Compass Dot Left */}
                <g transform="translate(85, 75)">
                  <circle cx="10" cy="10" r="7" className="fill-emerald-500 dark:fill-emerald-400" />
                  <path d="M7 10 L9 12 L13 8" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                </g>
              </g>
            </svg>
          </div>

          {/* Main Headings */}
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-4">
            Looks like you&apos;re a bit lost!
          </h1>
          
          <p className="max-w-xl text-base sm:text-lg text-slate-600 dark:text-slate-300 font-normal leading-relaxed mb-8">
            The page or lecture you are searching for might have been moved, renamed, or is temporarily unavailable. Let&apos;s redirect you back to your learning track.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-3.5 w-full sm:w-auto mx-auto">
            {/* Primary Back to Home Button */}
            <Link 
              href="/" 
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold shadow-lg shadow-blue-600/25 hover:shadow-blue-600/40 hover:-translate-y-0.5 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-blue-500/30"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              <span>Back to Home</span>
            </Link>
          </div>
        </main>

        {/* Footer */}
        <footer className="w-full max-w-7xl mx-auto px-6 py-6 border-t border-slate-200/80 dark:border-slate-900 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 dark:text-slate-500 gap-4">
          <p>© <span>{currentYear}</span> J.K. Shah Classes. All rights reserved.</p>
        </footer>
      </div>
    </>
  );
}
