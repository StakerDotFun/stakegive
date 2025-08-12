"use client";

import { useState } from "react";
import { useTheme } from "next-themes";
import { SunIcon, MoonIcon, ComputerDesktopIcon } from "@heroicons/react/24/outline";

export function ThemeSwitcher() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { theme, setTheme } = useTheme();

  return (
    <div className="relative inline-block">
      <button 
        onClick={() => setMenuOpen(!menuOpen)}
        className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400 transition-colors"
      >
        {theme === 'light' ? (
          <>
            <SunIcon className="w-4 h-4" /> Light
          </>
        ) : theme === 'dark' ? (
          <>
            <MoonIcon className="w-4 h-4" /> Dark
          </>
        ) : (
          <>
            <ComputerDesktopIcon className="w-4 h-4" /> System
          </>
        )}
      </button>
      
      {menuOpen && (
        <div className="absolute left-0 mt-2 w-40 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-10">
          <button 
            onClick={() => {
              setTheme('light');
              setMenuOpen(false);
            }}
            className={`w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 ${
              theme === 'light' ? 'text-blue-500' : 'text-gray-700 dark:text-gray-300'
            }`}
          >
            <SunIcon className="w-4 h-4" /> Light
          </button>
          <button 
            onClick={() => {
              setTheme('dark');
              setMenuOpen(false);
            }}
            className={`w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 ${
              theme === 'dark' ? 'text-blue-500' : 'text-gray-700 dark:text-gray-300'
            }`}
          >
            <MoonIcon className="w-4 h-4" /> Dark
          </button>
          <button 
            onClick={() => {
              setTheme('system');
              setMenuOpen(false);
            }}
            className={`w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 ${
              theme === 'system' ? 'text-blue-500' : 'text-gray-700 dark:text-gray-300'
            }`}
          >
            <ComputerDesktopIcon className="w-4 h-4" /> System
          </button>
        </div>
      )}
    </div>
  );
}