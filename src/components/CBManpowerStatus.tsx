import React, { useMemo } from 'react';
import { CBStoreRecord } from '../types';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
} from 'recharts';
import {
  TrendingDown,
  TrendingUp,
  CheckCircle2,
  PieChart as PieIcon,
  Filter,
} from 'lucide-react';

interface CBManpowerStatusProps {
  stores: CBStoreRecord[];
  activeStatusFilter: string;
  onSelectStatus: (status: string) => void;
}

export const CBManpowerStatus: React.FC<CBManpowerStatusProps> = ({
  stores,
  activeStatusFilter,
  onSelectStatus,
}) => {
  const statusStats = useMemo(() => {
    const total = stores.length;

    const over = stores.filter((s) => s.status.toLowerCase().includes('over') || s.reduceNumber < 0);
    const under = stores.filter((s) => s.status.toLowerCase().includes('under') || s.reduceNumber > 0);
    const optimal = stores.filter(
      (s) => !s.status.toLowerCase().includes('over') && !s.status.toLowerCase().includes('under') && s.reduceNumber === 0
    );

    const overExisting = over.reduce((sum, s) => sum + s.mppExisting, 0);
    const overRec = over.reduce((sum, s) => sum + s.mppRecommendation, 0);
    const overImpact = over.reduce((sum, s) => sum + (s.reduceNumber < 0 ? s.reduceNumber : 0), 0);

    const underExisting = under.reduce((sum, s) => sum + s.mppExisting, 0);
    const underRec = under.reduce((sum, s) => sum + s.mppRecommendation, 0);
    const underImpact = under.reduce((sum, s) => sum + (s.reduceNumber > 0 ? s.reduceNumber : 0), 0);

    const optimalExisting = optimal.reduce((sum, s) => sum + s.mppExisting, 0);
    const optimalRec = optimal.reduce((sum, s) => sum + s.mppRecommendation, 0);

    const chartData = [
      {
        name: 'Overstaffed',
        value: over.length,
        color: '#E11D48',
        mppImpact: `${overImpact} HC`,
      },
      {
        name: 'Understaffed',
        value: under.length,
        color: '#D97706',
        mppImpact: `+${underImpact} HC`,
      },
      {
        name: 'Optimal',
        value: optimal.length,
        color: '#10B981',
        mppImpact: '0 HC',
      },
    ].filter((item) => item.value > 0);

    return {
      total,
      over: {
        count: over.length,
        pct: total > 0 ? Math.round((over.length / total) * 100) : 0,
        existing: overExisting,
        recommended: overRec,
        impact: overImpact,
      },
      under: {
        count: under.length,
        pct: total > 0 ? Math.round((under.length / total) * 100) : 0,
        existing: underExisting,
        recommended: underRec,
        impact: underImpact,
      },
      optimal: {
        count: optimal.length,
        pct: total > 0 ? Math.round((optimal.length / total) * 100) : 0,
        existing: optimalExisting,
        recommended: optimalRec,
        impact: 0,
      },
      chartData,
    };
  }, [stores]);

  return (
    <section className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-slate-100 text-slate-800 rounded-lg">
            <PieIcon className="w-4 h-4 text-slate-700" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Manpower Status Overview
            </h3>
            <p className="text-[11px] text-slate-500">
              Staffing balance distribution &amp; net headcount variance across stores
            </p>
          </div>
        </div>

        {activeStatusFilter && (
          <button
            onClick={() => onSelectStatus('')}
            className="self-start sm:self-auto text-xs font-semibold text-[#C8102E] hover:underline flex items-center gap-1"
          >
            Clear status filter ({activeStatusFilter})
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-4 items-center">
        
        {/* Donut Chart */}
        <div className="lg:col-span-5 flex flex-col items-center justify-center">
          <div className="w-full h-56 relative flex items-center justify-center">
            {statusStats.total > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusStats.chartData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={82}
                    paddingAngle={3}
                    stroke="#ffffff"
                    strokeWidth={2}
                    cursor="pointer"
                    onClick={(entry) => {
                      if (entry && entry.name) {
                        onSelectStatus(String(entry.name));
                      }
                    }}
                  >
                    {statusStats.chartData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.color}
                        opacity={
                          activeStatusFilter
                            ? activeStatusFilter.toLowerCase() === entry.name.toLowerCase()
                              ? 1
                              : 0.35
                            : 1
                        }
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const d = payload[0].payload;
                        const pct = statusStats.total > 0 ? Math.round((d.value / statusStats.total) * 100) : 0;
                        return (
                          <div className="bg-slate-900 text-white p-2.5 rounded-lg text-xs shadow-lg space-y-1">
                            <span className="font-bold block" style={{ color: d.color }}>
                              {d.name}
                            </span>
                            <div className="text-slate-300">
                              Stores: <strong className="text-white">{d.value}</strong> ({pct}%)
                            </div>
                            <div className="text-slate-300">
                              MPP Impact: <strong className="text-white">{d.mppImpact}</strong>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-xs text-slate-400">No stores found</div>
            )}
            
            {/* Center Label */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-2xl font-black text-slate-900 tabular-nums">
                {statusStats.total}
              </span>
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                Stores
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs mt-1">
            <span className="flex items-center gap-1.5 text-slate-600">
              <span className="w-2.5 h-2.5 rounded-full bg-[#E11D48]" /> Overstaffed
            </span>
            <span className="flex items-center gap-1.5 text-slate-600">
              <span className="w-2.5 h-2.5 rounded-full bg-[#D97706]" /> Understaffed
            </span>
            <span className="flex items-center gap-1.5 text-slate-600">
              <span className="w-2.5 h-2.5 rounded-full bg-[#10B981]" /> Optimal
            </span>
          </div>
        </div>

        {/* 3 Detailed Breakdown Cards */}
        <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-3">
          
          {/* Overstaffed Card */}
          <div
            onClick={() => onSelectStatus('Overstaffed')}
            className={`p-4 rounded-xl border transition-all cursor-pointer ${
              activeStatusFilter.toLowerCase() === 'overstaffed'
                ? 'bg-rose-50 border-rose-400 ring-2 ring-rose-200 shadow-sm'
                : 'bg-white border-slate-200/90 hover:border-rose-300 hover:bg-rose-50/20'
            }`}
          >
            <div className="flex items-center justify-between pb-2 border-b border-rose-100">
              <div className="flex items-center gap-1.5 text-rose-700">
                <TrendingDown className="w-4 h-4" />
                <span className="font-bold text-xs">Overstaffed</span>
              </div>
              <span className="text-xs font-bold px-1.5 py-0.5 rounded bg-rose-100 text-rose-800">
                {statusStats.over.pct}%
              </span>
            </div>

            <div className="mt-3 space-y-1.5 text-xs">
              <div className="flex items-baseline justify-between">
                <span className="text-slate-500 text-[11px]">Stores</span>
                <span className="font-black text-slate-900 text-base tabular-nums">
                  {statusStats.over.count}
                </span>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-slate-500 text-[11px]">Existing MPP</span>
                <span className="font-bold text-slate-700 tabular-nums">
                  {statusStats.over.existing} HC
                </span>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-slate-500 text-[11px]">Recommended</span>
                <span className="font-bold text-purple-900 tabular-nums">
                  {statusStats.over.recommended} HC
                </span>
              </div>
              <div className="pt-2 border-t border-slate-100 flex items-baseline justify-between">
                <span className="text-[11px] font-bold text-rose-700">Potential Reduction</span>
                <span className="text-sm font-black text-rose-700 tabular-nums">
                  {statusStats.over.impact} HC
                </span>
              </div>
            </div>
          </div>

          {/* Understaffed Card */}
          <div
            onClick={() => onSelectStatus('Understaffed')}
            className={`p-4 rounded-xl border transition-all cursor-pointer ${
              activeStatusFilter.toLowerCase() === 'understaffed'
                ? 'bg-amber-50 border-amber-400 ring-2 ring-amber-200 shadow-sm'
                : 'bg-white border-slate-200/90 hover:border-amber-300 hover:bg-amber-50/20'
            }`}
          >
            <div className="flex items-center justify-between pb-2 border-b border-amber-100">
              <div className="flex items-center gap-1.5 text-amber-700">
                <TrendingUp className="w-4 h-4" />
                <span className="font-bold text-xs">Understaffed</span>
              </div>
              <span className="text-xs font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800">
                {statusStats.under.pct}%
              </span>
            </div>

            <div className="mt-3 space-y-1.5 text-xs">
              <div className="flex items-baseline justify-between">
                <span className="text-slate-500 text-[11px]">Stores</span>
                <span className="font-black text-slate-900 text-base tabular-nums">
                  {statusStats.under.count}
                </span>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-slate-500 text-[11px]">Existing MPP</span>
                <span className="font-bold text-slate-700 tabular-nums">
                  {statusStats.under.existing} HC
                </span>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-slate-500 text-[11px]">Recommended</span>
                <span className="font-bold text-purple-900 tabular-nums">
                  {statusStats.under.recommended} HC
                </span>
              </div>
              <div className="pt-2 border-t border-slate-100 flex items-baseline justify-between">
                <span className="text-[11px] font-bold text-amber-700">Required Increase</span>
                <span className="text-sm font-black text-amber-700 tabular-nums">
                  +{statusStats.under.impact} HC
                </span>
              </div>
            </div>
          </div>

          {/* Optimal Card */}
          <div
            onClick={() => onSelectStatus('Optimal')}
            className={`p-4 rounded-xl border transition-all cursor-pointer ${
              activeStatusFilter.toLowerCase() === 'optimal'
                ? 'bg-emerald-50 border-emerald-400 ring-2 ring-emerald-200 shadow-sm'
                : 'bg-white border-slate-200/90 hover:border-emerald-300 hover:bg-emerald-50/20'
            }`}
          >
            <div className="flex items-center justify-between pb-2 border-b border-emerald-100">
              <div className="flex items-center gap-1.5 text-emerald-700">
                <CheckCircle2 className="w-4 h-4" />
                <span className="font-bold text-xs">Optimal</span>
              </div>
              <span className="text-xs font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">
                {statusStats.optimal.pct}%
              </span>
            </div>

            <div className="mt-3 space-y-1.5 text-xs">
              <div className="flex items-baseline justify-between">
                <span className="text-slate-500 text-[11px]">Stores</span>
                <span className="font-black text-slate-900 text-base tabular-nums">
                  {statusStats.optimal.count}
                </span>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-slate-500 text-[11px]">Existing MPP</span>
                <span className="font-bold text-slate-700 tabular-nums">
                  {statusStats.optimal.existing} HC
                </span>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-slate-500 text-[11px]">Recommended</span>
                <span className="font-bold text-purple-900 tabular-nums">
                  {statusStats.optimal.recommended} HC
                </span>
              </div>
              <div className="pt-2 border-t border-slate-100 flex items-baseline justify-between">
                <span className="text-[11px] font-bold text-emerald-700">Net Variance</span>
                <span className="text-sm font-black text-emerald-700 tabular-nums">
                  0 HC
                </span>
              </div>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
