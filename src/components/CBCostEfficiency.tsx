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
  Cell,
  Legend,
} from 'recharts';
import {
  Percent,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Building,
} from 'lucide-react';

interface CBCostEfficiencyProps {
  stores: CBStoreRecord[];
  onSelectStore: (store: CBStoreRecord) => void;
}

export const CBCostEfficiency: React.FC<CBCostEfficiencyProps> = ({
  stores,
  onSelectStore,
}) => {
  const totalStores = stores.length;

  const avgCostEfficiency =
    totalStores > 0
      ? stores.reduce((sum, s) => sum + (s.costEfficiencyNum || 0), 0) / totalStores
      : 0;

  const overstaffed = stores.filter((s) => s.reduceNumber < 0);
  const totalReduction = overstaffed.reduce(
    (sum, s) => sum + Math.abs(s.reduceNumber),
    0
  );

  // Calculate estimated monthly manpower cost savings: sum of (avgSalary * abs(reduce))
  const monthlyCostSavingsMillion = overstaffed.reduce(
    (sum, s) => sum + (s.averageMppSalaryNum || 0) * Math.abs(s.reduceNumber),
    0
  );
  const annualCostSavingsBillion = (monthlyCostSavingsMillion * 12) / 1000;

  // Cost Efficiency by Territory
  const territoryData = useMemo(() => {
    const map: Record<string, { count: number; totalEff: number }> = {};
    stores.forEach((s) => {
      if (!map[s.territory]) {
        map[s.territory] = { count: 0, totalEff: 0 };
      }
      map[s.territory].count += 1;
      map[s.territory].totalEff += s.costEfficiencyNum;
    });

    return Object.entries(map).map(([territory, data]) => ({
      territory,
      avgEfficiency: parseFloat((data.totalEff / data.count).toFixed(2)),
      storesCount: data.count,
    })).sort((a, b) => b.avgEfficiency - a.avgEfficiency);
  }, [stores]);

  // Top positive efficiency stores & lowest efficiency stores
  const sortedByEfficiency = useMemo(() => {
    return [...stores].sort((a, b) => b.costEfficiencyNum - a.costEfficiencyNum);
  }, [stores]);

  const topEfficiencyStores = sortedByEfficiency.slice(0, 5);
  const lowestEfficiencyStores = [...sortedByEfficiency].reverse().slice(0, 5);

  return (
    <section className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-xs">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-emerald-50 text-emerald-700 rounded-lg">
            <DollarSign className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Cost Efficiency Analysis
            </h3>
            <p className="text-[11px] text-slate-500">
              Labor expenditure optimization and potential cost savings across territories
            </p>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 my-4">
        <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
            Average Cost Efficiency
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black text-slate-900 tabular-nums">
              {avgCostEfficiency.toFixed(2)}%
            </span>
            <span className="text-xs font-semibold text-emerald-700">
              Across {totalStores} stores
            </span>
          </div>
        </div>

        <div className="p-3.5 rounded-xl border border-rose-200 bg-rose-50/40">
          <span className="text-[11px] font-bold text-rose-700 uppercase tracking-wider block">
            Total Headcount Surplus
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black text-rose-700 tabular-nums">
              -{totalReduction} HC
            </span>
            <span className="text-xs font-semibold text-rose-600">
              Across {overstaffed.length} stores
            </span>
          </div>
        </div>

        <div className="p-3.5 rounded-xl border border-emerald-200 bg-emerald-50/40">
          <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider block">
            Est. Manpower Cost Impact
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black text-emerald-900 tabular-nums">
              Rp{monthlyCostSavingsMillion.toFixed(1)}M
            </span>
            <span className="text-xs font-semibold text-emerald-700">
              /mo (~Rp{annualCostSavingsBillion.toFixed(2)}B/yr)
            </span>
          </div>
        </div>
      </div>

      {/* Charts & Store Rankings */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-4">
        
        {/* Cost Efficiency by Territory Chart */}
        <div className="lg:col-span-6 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-600 mb-2 font-medium">
            <span>Average Cost Efficiency by Territory (%)</span>
            <span className="text-[11px] text-slate-400">Mean efficiency ratio</span>
          </div>

          <div className="h-64 w-full">
            {territoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={territoryData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis
                    dataKey="territory"
                    tick={{ fontSize: 11, fill: '#64748b' }}
                  />
                  <YAxis
                    unit="%"
                    tick={{ fontSize: 11, fill: '#64748b' }}
                  />
                  <Tooltip
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        const d = payload[0].payload;
                        return (
                          <div className="bg-slate-900 text-white p-2.5 rounded-lg text-xs shadow-lg space-y-1">
                            <span className="font-bold block text-white">{label}</span>
                            <div>Avg Cost Efficiency: <strong className="text-emerald-400">{d.avgEfficiency}%</strong></div>
                            <div>Stores Analyzed: <strong className="text-white">{d.storesCount}</strong></div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar
                    dataKey="avgEfficiency"
                    name="Avg Efficiency %"
                    fill="#10B981"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={32}
                  >
                    {territoryData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.avgEfficiency >= 10 ? '#10B981' : entry.avgEfficiency > 0 ? '#3B82F6' : '#94A3B8'}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                No territory data
              </div>
            )}
          </div>
        </div>

        {/* Highest and Lowest Store Rankings */}
        <div className="lg:col-span-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Highest Efficiency */}
          <div className="border border-slate-200 rounded-xl p-3.5 bg-slate-50/50">
            <div className="flex items-center gap-1.5 pb-2 mb-2 border-b border-slate-200 text-emerald-700">
              <TrendingUp className="w-3.5 h-3.5" />
              <h4 className="text-xs font-bold uppercase tracking-wider">
                Highest Cost Efficiency
              </h4>
            </div>

            <div className="space-y-2">
              {topEfficiencyStores.map((s, idx) => (
                <div
                  key={s.kode}
                  onClick={() => onSelectStore(s)}
                  className="p-2 bg-white rounded-lg border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/20 cursor-pointer transition-colors text-xs flex items-center justify-between"
                >
                  <div className="min-w-0 pr-2">
                    <span className="font-bold text-slate-800 truncate block">
                      {idx + 1}. {s.storeName}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {s.kode} &bull; {s.territory}
                    </span>
                  </div>
                  <span className="font-black text-emerald-700 shrink-0 text-xs tabular-nums">
                    {s.costEfficiency}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Lowest / Negative Efficiency */}
          <div className="border border-slate-200 rounded-xl p-3.5 bg-slate-50/50">
            <div className="flex items-center gap-1.5 pb-2 mb-2 border-b border-slate-200 text-rose-700">
              <TrendingDown className="w-3.5 h-3.5" />
              <h4 className="text-xs font-bold uppercase tracking-wider">
                Lowest Cost Efficiency
              </h4>
            </div>

            <div className="space-y-2">
              {lowestEfficiencyStores.map((s, idx) => (
                <div
                  key={s.kode}
                  onClick={() => onSelectStore(s)}
                  className="p-2 bg-white rounded-lg border border-slate-200 hover:border-rose-300 hover:bg-rose-50/20 cursor-pointer transition-colors text-xs flex items-center justify-between"
                >
                  <div className="min-w-0 pr-2">
                    <span className="font-bold text-slate-800 truncate block">
                      {idx + 1}. {s.storeName}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {s.kode} &bull; {s.territory}
                    </span>
                  </div>
                  <span className={`font-black shrink-0 text-xs tabular-nums ${s.costEfficiencyNum < 0 ? 'text-rose-700' : 'text-slate-700'}`}>
                    {s.costEfficiency}
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
