import React from 'react';

interface ToolHubLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}

export default function ToolHubLogo({ size = 'md', className = '', showText = true }: ToolHubLogoProps) {
  const sizeClasses = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-12 h-12',
  };

  const textSizes = {
    sm: 'text-base',
    md: 'text-xl',
    lg: 'text-2xl',
  };

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      {/* Geometric Icon Container */}
      <div className={`${sizeClasses[size]} rounded-xl bg-gradient-to-br from-indigo-600 via-indigo-700 to-indigo-900 p-0.5 shadow-md flex items-center justify-center shrink-0`}>
        <svg
          viewBox="0 0 36 36"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full p-1"
        >
          {/* Geometric Outer Hex-Diamond */}
          <rect x="4" y="4" width="28" height="28" rx="8" fill="url(#logo-grad)" />
          {/* Geometric Inner Wrench/Tool Overlapping Squares & Triangles */}
          <path
            d="M12 10L20 10L26 16L26 24L18 24L12 18Z"
            fill="white"
            fillOpacity="0.2"
          />
          <circle cx="15" cy="15" r="4.5" stroke="white" strokeWidth="2.5" />
          <path
            d="M18.5 18.5L25 25"
            stroke="white"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <path
            d="M21 11L25 15"
            stroke="#818CF8"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <defs>
            <linearGradient id="logo-grad" x1="4" y1="4" x2="32" y2="32" gradientUnits="userSpaceOnUse">
              <stop stopColor="#4F46E5" />
              <stop offset="1" stopColor="#312E81" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {showText && (
        <span className={`${textSizes[size]} font-black tracking-tight text-slate-900 dark:text-white leading-none`}>
          Nuvora<span className="text-indigo-600 dark:text-indigo-400">Tools</span>
        </span>
      )}
    </div>
  );
}
