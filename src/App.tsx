import React from 'react';
import { CompensationBenefit } from './components/CompensationBenefit';

export default function App() {
  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex flex-col font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Top Brand Bar */}
      <nav className="bg-slate-900 border-b border-slate-800 text-white px-6 py-3.5 sticky top-0 z-30 shadow-xs">
        <div className="max-w-[1800px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#C8102E] text-white flex items-center justify-center font-black text-sm tracking-wider shadow-sm">
              CB
            </div>
            <div>
              <span className="font-bold text-sm tracking-tight text-white block">
                AZKO Enterprise &bull; Human Capital
              </span>
              <span className="text-[10px] text-slate-400 font-medium block">
                Compensation &amp; Benefit / MPP Management System
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs text-slate-300">
            <span className="hidden sm:inline text-slate-400">
              FY 2026 Planning &amp; Operational Analytics
            </span>
          </div>
        </div>
      </nav>

      {/* Main Viewport */}
      <main className="flex-1 max-w-[1800px] w-full mx-auto px-4 sm:px-6 py-6">
        <CompensationBenefit />
      </main>

      {/* Corporate Quiet Footer */}
      <footer className="bg-white border-t border-slate-200 mt-12 py-6 text-center text-xs text-slate-500">
        <div className="max-w-[1800px] mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <span>
            &copy; {new Date().getFullYear()} AZKO Human Capital Management &amp; Retail Operations. Confidential Corporate Analytics.
          </span>
          <div className="flex items-center gap-4 text-slate-400 text-[11px]">
            <span>Manpower Planning (MPP)</span>
            <span>&bull;</span>
            <span>Cost Efficiency</span>
            <span>&bull;</span>
            <span>Labor Budget Analytics</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
