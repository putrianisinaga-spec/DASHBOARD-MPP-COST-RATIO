import React, { useMemo } from 'react';
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
  Activity,
  TrendingUp,
  Maximize2,
  Sparkles,
  ArrowRight,
} from 'lucide-react';

interface CBProductivityAnalysisProps {
  stores: CBStoreRecord[];
  onSelectStore: (store: CBStoreRecord) => void;
}

export const CBProductivityAnalysis: React.FC<CBProductivityAnalysisProps> = ({
  stores,
  onSelectStore,
}) => {
  const totalStores = stores.length;

  // Average Metrics
  const avgProdMpp =
    totalStores > 0
      ? stores.reduce((sum, s) => sum + (s.prodMppNum || 0), 0) / totalStores
      : 0;

  const avgNewProdMpp =
    totalStores > 0
      ? stores.reduce((sum, s) => sum + (s.newProdMppTargetNum || 0), 0) / totalStores
      : 0;

  const avgCurrentSqmCoverage =
    totalStores > 0
      ? stores.reduce((sum, s) => sum + (s.currentSqmCoverageMpp || 0), 0) / totalStores
      : 0;

  const avgNewSqmCoverage =
    totalStores > 0
      ? stores.reduce((sum, s) => sum + (s.newSqmCoverageMpp || 0), 0) / totalStores
      : 0;

  const productivityDelta = avgNewProdMpp - avgProdMpp;
  const productivityDeltaPct =
    avgProdMpp > 0 ? ((productivityDelta / avgProdMpp) * 100).toFixed(1) : '0.0';

  // Top stores by productivity improvement target
  const topImprovementStores = useMemo(() => {
    return [...stores]
      .sort((a, b) => (b.prodMppIncreaseTargetNum || 0) - (a.prodMppIncreaseTargetNum || 0))
      .slice(0, 5);
  }, [stores]);

  // Chart data for sample stores (top 8 stores with highest productivity target changes)
  const chartData = useMemo(() => {
    return [...stores]
      .sort((a, b) => Math.abs(b.prodMppIncreaseTargetNum || 0) - Math.abs(a.prodMppIncreaseTargetNum || 0))
      .slice(0, 8)
      .map((s) => ({
        kode: s.kode,
        name: s.storeName,
        Current: parseFloat(s.prodMppNum.toFixed(1)),
        Target: parseFloat(s.newProdMppTargetNum.toFixed(1)),
        increase: s.prodMppIncreaseTarget,
        store: s,
      }));
  }, [stores]);

  return (
    <section className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-xs">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-purple-50 text-purple-700 rounded-lg">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              MPP Productivity &amp; Floor Coverage
            </h3>
            <p className="text-[11px] text-slate-500">
              Sales productivity per headcount (Prod MPP) and SQM floor coverage ratios
            </p>
          </div>
        </div>
      </div>

      {/* 4 Diagnostic Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 my-4">
        
        <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
            Avg Prod MPP (Existing)
          </span>
          <div className="mt-1">
            <span className="text-2xl font-black text-slate-900 tabular-nums">
              Rp{avgProdMpp.toFixed(1)}M
            </span>
            <span className="text-[11px] text-slate-500 block mt-0.5">
              Sales / Headcount
            </span>
          </div>
        </div>

        <div className="p-3.5 rounded-xl border border-purple-200 bg-purple-50/40">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-purple-800 uppercase tracking-wider block">
              New Prod MPP Target
            </span>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-purple-100 text-purple-800">
              +{productivityDeltaPct}%
            </span>
          </div>
          <div className="mt-1">
            <span className="text-2xl font-black text-purple-900 tabular-nums">
              Rp{avgNewProdMpp.toFixed(1)}M
            </span>
            <span className="text-[11px] text-purple-700 block mt-0.5">
              Target sales / HC
            </span>
          </div>
        </div>

        <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
            Current SQM Coverage
          </span>
          <div className="mt-1">
            <span className="text-2xl font-black text-slate-900 tabular-nums">
              {avgCurrentSqmCoverage.toFixed(1)} m²
            </span>
            <span className="text-[11px] text-slate-500 block mt-0.5">
              Floor area per HC
            </span>
          </div>
        </div>

        <div className="p-3.5 rounded-xl border border-emerald-200 bg-emerald-50/40">
          <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider block">
            New SQM Coverage Target
          </span>
          <div className="mt-1">
            <span className="text-2xl font-black text-emerald-900 tabular-nums">
              {avgNewSqmCoverage.toFixed(1)} m²
            </span>
            <span className="text-[11px] text-emerald-700 block mt-0.5">
              Optimized floor coverage
            </span>
          </div>
        </div>

      </div>

      {/* Charts & Store Highlights */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-4">
        
        {/* Productivity Comparison Chart */}
        <div className="lg:col-span-7 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-600 mb-2 font-medium">
            <span>Existing Productivity vs. New Target (Rp Million / HC)</span>
            <span className="text-[11px] text-slate-400">Stores with largest target shift</span>
          </div>

          <div className="h-64 w-full">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -15, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="kode" tick={{ fontSize: 11, fill: '#64748b' }} />
                  <YAxis unit="M" tick={{ fontSize: 11, fill: '#64748b' }} />
                  <Tooltip
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        const d = payload[0].payload;
                        return (
                          <div className="bg-slate-900 text-white p-2.5 rounded-lg text-xs shadow-lg space-y-1">
                            <span className="font-bold block text-white">{d.name} ({label})</span>
                            <div>Current Prod: <strong className="text-slate-300">Rp{d.Current}M</strong></div>
                            <div>Target Prod: <strong className="text-purple-300">Rp{d.Target}M</strong></div>
                            <div>Improvement Target: <strong className="text-emerald-400">{d.increase}</strong></div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} iconType="circle" />
                  <Bar dataKey="Current" name="Existing Prod MPP" fill="#94A3B8" radius={[4, 4, 0, 0]} maxBarSize={24} />
                  <Bar dataKey="Target" name="New Prod MPP Target" fill="#9333EA" radius={[4, 4, 0, 0]} maxBarSize={24} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                No store data
              </div>
            )}
          </div>
        </div>

        {/* Highest Productivity Improvement Target Stores */}
        <div className="lg:col-span-5 border border-slate-200 rounded-xl p-3.5 bg-slate-50/50 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-1.5 pb-2 mb-2 border-b border-slate-200 text-purple-800">
              <Sparkles className="w-3.5 h-3.5 text-purple-600" />
              <h4 className="text-xs font-bold uppercase tracking-wider">
                Highest Productivity Uplift Targets
              </h4>
            </div>

            <div className="space-y-2">
              {topImprovementStores.map((s, idx) => (
                <div
                  key={s.kode}
                  onClick={() => onSelectStore(s)}
                  className="p-2 bg-white rounded-lg border border-slate-200 hover:border-purple-300 hover:bg-purple-50/20 cursor-pointer transition-colors text-xs flex items-center justify-between"
                >
                  <div className="min-w-0 pr-2">
                    <span className="font-bold text-slate-800 truncate block">
                      {idx + 1}. {s.storeName}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {s.kode} &bull; {s.prodMpp} &rarr; {s.newProdMppTarget}
                    </span>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="font-black text-purple-800 text-xs tabular-nums block">
                      +{s.prodMppIncreaseTarget}
                    </span>
                    <span className="text-[9px] text-slate-400">Uplift goal</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-2 text-[10px] text-slate-400 text-right">
            Stores targeted for largest workforce productivity gains
          </div>
        </div>

      </div>
    </section>
  );
};
