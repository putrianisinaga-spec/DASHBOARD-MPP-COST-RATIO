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
  Scale,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
} from 'lucide-react';

interface CBWagesBudgetAnalysisProps {
  stores: CBStoreRecord[];
}

export const CBWagesBudgetAnalysis: React.FC<CBWagesBudgetAnalysisProps> = ({ stores }) => {
  const totalStores = stores.length;

  const storesAboveTarget = stores.filter(
    (s) => s.budgetFinanceNum > s.wagesSalaryRatioTargetNum
  );
  const storesWithinTarget = stores.filter(
    (s) => s.budgetFinanceNum <= s.wagesSalaryRatioTargetNum
  );

  const avgVariance =
    totalStores > 0
      ? stores.reduce(
          (sum, s) => sum + (s.budgetFinanceNum - s.wagesSalaryRatioTargetNum),
          0
        ) / totalStores
      : 0;

  const avgTarget =
    totalStores > 0
      ? stores.reduce((sum, s) => sum + s.wagesSalaryRatioTargetNum, 0) / totalStores
      : 0;

  const avgBudget =
    totalStores > 0
      ? stores.reduce((sum, s) => sum + s.budgetFinanceNum, 0) / totalStores
      : 0;

  // Chart data per territory
  const territoryData = useMemo(() => {
    const map: Record<string, { targetSum: number; budgetSum: number; count: number }> = {};
    stores.forEach((s) => {
      if (!map[s.territory]) {
        map[s.territory] = { targetSum: 0, budgetSum: 0, count: 0 };
      }
      map[s.territory].targetSum += s.wagesSalaryRatioTargetNum;
      map[s.territory].budgetSum += s.budgetFinanceNum;
      map[s.territory].count += 1;
    });

    return Object.entries(map).map(([territory, d]) => {
      const target = parseFloat((d.targetSum / d.count).toFixed(2));
      const budget = parseFloat((d.budgetSum / d.count).toFixed(2));
      return {
        territory,
        Target: target,
        Budget: budget,
        variance: parseFloat((budget - target).toFixed(2)),
        isExceeded: budget > target,
      };
    });
  }, [stores]);

  return (
    <section className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-xs">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-slate-100 text-slate-800 rounded-lg">
            <Scale className="w-4 h-4 text-slate-700" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Wages Salary Ratio vs. Finance Budget
            </h3>
            <p className="text-[11px] text-slate-500">
              Alignment of store labor budgets against operational wages salary ratio guidelines
            </p>
          </div>
        </div>
      </div>

      {/* Metric Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3.5 my-4">
        
        <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
            Avg Ratio Target
          </span>
          <div className="mt-1">
            <span className="text-2xl font-black text-slate-900 tabular-nums">
              {avgTarget.toFixed(2)}%
            </span>
            <span className="text-[11px] text-slate-500 block mt-0.5">
              Target Wages / Sales
            </span>
          </div>
        </div>

        <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
            Avg Finance Budget
          </span>
          <div className="mt-1">
            <span className="text-2xl font-black text-slate-900 tabular-nums">
              {avgBudget.toFixed(2)}%
            </span>
            <span className="text-[11px] text-slate-500 block mt-0.5">
              Budgeted labor ratio
            </span>
          </div>
        </div>

        <div className="p-3.5 rounded-xl border border-rose-200 bg-rose-50/40">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-rose-700 uppercase tracking-wider block">
              Above Ratio Target
            </span>
            <AlertTriangle className="w-4 h-4 text-rose-600" />
          </div>
          <div className="mt-1">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-rose-700 tabular-nums">
                {storesAboveTarget.length}
              </span>
              <span className="text-xs font-semibold text-rose-600">
                ({totalStores > 0 ? Math.round((storesAboveTarget.length / totalStores) * 100) : 0}% of stores)
              </span>
            </div>
            <span className="text-[11px] text-rose-600 block mt-0.5">
              Budget exceeds target ratio
            </span>
          </div>
        </div>

        <div className="p-3.5 rounded-xl border border-emerald-200 bg-emerald-50/40">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider block">
              Within Target
            </span>
            <CheckCircle className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-1">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-emerald-800 tabular-nums">
                {storesWithinTarget.length}
              </span>
              <span className="text-xs font-semibold text-emerald-700">
                ({totalStores > 0 ? Math.round((storesWithinTarget.length / totalStores) * 100) : 0}% of stores)
              </span>
            </div>
            <span className="text-[11px] text-emerald-700 block mt-0.5">
              Within budget discipline
            </span>
          </div>
        </div>

      </div>

      {/* Territory Comparison Chart */}
      <div className="mt-4">
        <div className="flex items-center justify-between text-xs text-slate-600 mb-2 font-medium">
          <span>Target vs. Finance Budget by Territory (%)</span>
          <span className="text-[11px] text-slate-400">
            Average variance: <strong className={avgVariance > 0 ? 'text-rose-600' : 'text-emerald-600'}>{avgVariance > 0 ? `+${avgVariance.toFixed(2)}%` : `${avgVariance.toFixed(2)}%`}</strong>
          </span>
        </div>

        <div className="h-64 w-full">
          {territoryData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={territoryData} margin={{ top: 10, right: 10, left: -15, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="territory" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis unit="%" tick={{ fontSize: 11, fill: '#64748b' }} domain={[0, 'dataMax + 2']} />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      const d = payload[0].payload;
                      return (
                        <div className="bg-slate-900 text-white p-2.5 rounded-lg text-xs shadow-lg space-y-1">
                          <span className="font-bold block text-white">{label}</span>
                          <div>Wages Target: <strong className="text-slate-300">{d.Target}%</strong></div>
                          <div>Finance Budget: <strong className={d.isExceeded ? 'text-rose-400' : 'text-emerald-400'}>{d.Budget}%</strong></div>
                          <div>Variance: <strong className={d.variance > 0 ? 'text-rose-400' : 'text-emerald-400'}>{d.variance > 0 ? `+${d.variance}%` : `${d.variance}%`}</strong></div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} iconType="circle" />
                <Bar dataKey="Target" name="Wages Ratio Target" fill="#94A3B8" radius={[4, 4, 0, 0]} maxBarSize={28} />
                <Bar dataKey="Budget" name="Budget Finance" fill="#0284C7" radius={[4, 4, 0, 0]} maxBarSize={28} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-xs text-slate-400">
              No territory data
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
