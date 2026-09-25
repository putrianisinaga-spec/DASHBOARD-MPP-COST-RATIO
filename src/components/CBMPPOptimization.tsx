import React, { useMemo, useState } from 'react';
import { CBStoreRecord } from '../types';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import {
  Users,
  TrendingDown,
  TrendingUp,
  Eye,
  ArrowUpDown,
} from 'lucide-react';

interface CBMPPOptimizationProps {
  stores: CBStoreRecord[];
  onSelectStore: (store: CBStoreRecord) => void;
}

export const CBMPPOptimization: React.FC<CBMPPOptimizationProps> = ({
  stores,
  onSelectStore,
}) => {
  // Largest MPP Reduction (stores with most negative reduceNumber)
  const topReductionStores = useMemo(() => {
    return [...stores]
      .filter((s) => s.reduceNumber < 0)
      .sort((a, b) => a.reduceNumber - b.reduceNumber)
      .slice(0, 5);
  }, [stores]);

  // Largest MPP Increase (stores with highest positive reduceNumber)
  const topIncreaseStores = useMemo(() => {
    return [...stores]
      .filter((s) => s.reduceNumber > 0)
      .sort((a, b) => b.reduceNumber - a.reduceNumber)
      .slice(0, 5);
  }, [stores]);

  // Stores to display in the comparison bar chart (top stores by absolute change or highest headcount)
  const chartData = useMemo(() => {
    return [...stores]
      .sort((a, b) => Math.abs(b.reduceNumber) - Math.abs(a.reduceNumber))
      .slice(0, 10)
      .map((s) => ({
        kode: s.kode,
        name: s.storeName,
        Existing: s.mppExisting,
        Recommendation: s.mppRecommendation,
        change: s.reduceNumber,
        store: s,
      }));
  }, [stores]);

  return (
    <section className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-xs">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-blue-50 text-blue-700 rounded-lg">
            <Users className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              MPP Existing vs. Recommendation
            </h3>
            <p className="text-[11px] text-slate-500">
              Comparative analysis of current headcount against optimized operational model
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-4">
        
        {/* Comparison Bar Chart */}
        <div className="lg:col-span-6 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-600 mb-2 font-medium">
            <span>Headcount Comparison (Top 10 Stores by Delta)</span>
            <span className="text-[11px] text-slate-400">Values in Headcount (HC)</span>
          </div>

          <div className="h-72 w-full">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis
                    dataKey="kode"
                    tick={{ fontSize: 11, fill: '#64748b' }}
                    interval={0}
                  />
                  <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                  <Tooltip
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        const d = payload[0].payload;
                        return (
                          <div className="bg-slate-900 text-white p-2.5 rounded-lg text-xs shadow-xl space-y-1">
                            <span className="font-bold block text-white">
                              {d.name} ({label})
                            </span>
                            <div className="text-slate-300">
                              Existing: <strong className="text-white">{d.Existing} HC</strong>
                            </div>
                            <div className="text-purple-300">
                              Recommendation: <strong className="text-white">{d.Recommendation} HC</strong>
                            </div>
                            <div className="text-amber-300">
                              Variance: <strong className="text-white">{d.change > 0 ? `+${d.change}` : d.change} HC</strong>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Legend
                    wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }}
                    iconType="circle"
                  />
                  <Bar
                    dataKey="Existing"
                    name="Existing MPP"
                    fill="#94A3B8"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={22}
                  />
                  <Bar
                    dataKey="Recommendation"
                    name="Recommended MPP"
                    fill="#7C3AED"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={22}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                No stores available
              </div>
            )}
          </div>
        </div>

        {/* Dual Priority Tables */}
        <div className="lg:col-span-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Largest MPP Reduction Opportunity */}
          <div className="border border-slate-200 rounded-xl p-3.5 bg-slate-50/50 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-1.5 pb-2 mb-2 border-b border-slate-200 text-rose-700">
                <TrendingDown className="w-3.5 h-3.5" />
                <h4 className="text-xs font-bold uppercase tracking-wider">
                  Largest MPP Reduction
                </h4>
              </div>

              <div className="space-y-2">
                {topReductionStores.length > 0 ? (
                  topReductionStores.map((s) => (
                    <div
                      key={s.kode}
                      onClick={() => onSelectStore(s)}
                      className="p-2 bg-white rounded-lg border border-slate-200 hover:border-rose-300 hover:bg-rose-50/20 cursor-pointer transition-colors text-xs flex items-center justify-between"
                    >
                      <div className="min-w-0 pr-2">
                        <div className="font-bold text-slate-800 truncate">
                          {s.storeName}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          {s.kode} &bull; Ext: {s.mppExisting} &rarr; Rec: {s.mppRecommendation}
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="font-black text-rose-700 text-xs tabular-nums block">
                          {s.reduceNumber} HC
                        </span>
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-rose-100 text-rose-800 font-bold">
                          Overstaffed
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-8 text-center text-xs text-slate-400">
                    No overstaffed stores in selection
                  </div>
                )}
              </div>
            </div>
            <div className="mt-2 text-[10px] text-slate-400 text-right">
              Sorted by largest surplus headcount
            </div>
          </div>

          {/* Largest MPP Increase Requirement */}
          <div className="border border-slate-200 rounded-xl p-3.5 bg-slate-50/50 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-1.5 pb-2 mb-2 border-b border-slate-200 text-amber-700">
                <TrendingUp className="w-3.5 h-3.5" />
                <h4 className="text-xs font-bold uppercase tracking-wider">
                  Largest MPP Increase
                </h4>
              </div>

              <div className="space-y-2">
                {topIncreaseStores.length > 0 ? (
                  topIncreaseStores.map((s) => (
                    <div
                      key={s.kode}
                      onClick={() => onSelectStore(s)}
                      className="p-2 bg-white rounded-lg border border-slate-200 hover:border-amber-300 hover:bg-amber-50/20 cursor-pointer transition-colors text-xs flex items-center justify-between"
                    >
                      <div className="min-w-0 pr-2">
                        <div className="font-bold text-slate-800 truncate">
                          {s.storeName}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          {s.kode} &bull; Ext: {s.mppExisting} &rarr; Rec: {s.mppRecommendation}
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="font-black text-amber-800 text-xs tabular-nums block">
                          +{s.reduceNumber} HC
                        </span>
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 font-bold">
                          Understaffed
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-8 text-center text-xs text-slate-400">
                    No understaffed stores in selection
                  </div>
                )}
              </div>
            </div>
            <div className="mt-2 text-[10px] text-slate-400 text-right">
              Sorted by highest shortage headcount
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
