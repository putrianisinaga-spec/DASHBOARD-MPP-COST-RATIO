import React from 'react';
import { CBStoreRecord } from '../types';
import {
  Store,
  Users,
  TrendingDown,
  TrendingUp,
  CheckCircle2,
  AlertTriangle,
  Percent,
  DollarSign,
  Scale,
} from 'lucide-react';

interface CBExecutiveKPIsProps {
  stores: CBStoreRecord[];
}

export const CBExecutiveKPIs: React.FC<CBExecutiveKPIsProps> = ({ stores }) => {
  const totalStores = stores.length;

  const totalMppExisting = stores.reduce((sum, s) => sum + (s.mppExisting || 0), 0);
  const totalMppRec = stores.reduce((sum, s) => sum + (s.mppRecommendation || 0), 0);

  // Overstaffed stores: reduceNumber < 0 (surplus)
  const overstaffedStores = stores.filter((s) => s.status.toLowerCase().includes('over') || s.reduceNumber < 0);
  const totalReduction = overstaffedStores.reduce((sum, s) => sum + (s.reduceNumber < 0 ? s.reduceNumber : 0), 0);

  // Understaffed stores: reduceNumber > 0 (shortage)
  const understaffedStores = stores.filter((s) => s.status.toLowerCase().includes('under') || s.reduceNumber > 0);
  const totalIncrease = understaffedStores.reduce((sum, s) => sum + (s.reduceNumber > 0 ? s.reduceNumber : 0), 0);

  // Optimal stores: reduceNumber === 0
  const optimalStores = stores.filter(
    (s) => !s.status.toLowerCase().includes('over') && !s.status.toLowerCase().includes('under') && s.reduceNumber === 0
  );

  const avgCostEfficiency =
    totalStores > 0
      ? stores.reduce((sum, s) => sum + (s.costEfficiencyNum || 0), 0) / totalStores
      : 0;

  const avgWagesRatio =
    totalStores > 0
      ? stores.reduce((sum, s) => sum + (s.wagesSalaryRatioTargetNum || 0), 0) / totalStores
      : 0;

  const avgBudgetFinance =
    totalStores > 0
      ? stores.reduce((sum, s) => sum + (s.budgetFinanceNum || 0), 0) / totalStores
      : 0;

  const overPct = totalStores > 0 ? Math.round((overstaffedStores.length / totalStores) * 100) : 0;
  const underPct = totalStores > 0 ? Math.round((understaffedStores.length / totalStores) * 100) : 0;
  const optimalPct = totalStores > 0 ? Math.round((optimalStores.length / totalStores) * 100) : 0;

  return (
    <section>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
          Executive KPI Summary
        </h3>
        <span className="text-xs text-slate-500">
          Evaluated across <strong className="text-slate-800">{totalStores}</strong> active stores
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        
        {/* 1. Total Stores */}
        <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-bold uppercase tracking-wider">Total Stores</span>
            <div className="p-1.5 bg-slate-100 text-slate-700 rounded-lg">
              <Store className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2.5">
            <span className="text-2xl font-black text-slate-900 tracking-tight tabular-nums">
              {totalStores}
            </span>
            <span className="text-[11px] text-slate-500 block mt-0.5">Operating retail units</span>
          </div>
        </div>

        {/* 2. Total MPP Existing */}
        <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-bold uppercase tracking-wider">Total MPP Existing</span>
            <div className="p-1.5 bg-slate-100 text-slate-700 rounded-lg">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2.5">
            <span className="text-2xl font-black text-slate-900 tracking-tight tabular-nums">
              {totalMppExisting.toLocaleString()}
            </span>
            <span className="text-[11px] text-slate-500 block mt-0.5">Current headcount (HC)</span>
          </div>
        </div>

        {/* 3. Total MPP Recommendation */}
        <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-bold uppercase tracking-wider">Total MPP Rec.</span>
            <div className="p-1.5 bg-purple-50 text-purple-700 rounded-lg">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2.5">
            <span className="text-2xl font-black text-purple-900 tracking-tight tabular-nums">
              {totalMppRec.toLocaleString()}
            </span>
            <span className="text-[11px] text-purple-700 block mt-0.5">Recommended headcount</span>
          </div>
        </div>

        {/* 4. MPP Reduction Opportunity */}
        <div className="bg-white p-4 rounded-xl border border-rose-200 shadow-xs flex flex-col justify-between bg-gradient-to-br from-rose-50/30 to-white">
          <div className="flex items-center justify-between text-rose-700">
            <span className="text-[11px] font-bold uppercase tracking-wider">MPP Reduction</span>
            <div className="p-1.5 bg-rose-100 text-rose-700 rounded-lg">
              <TrendingDown className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2.5">
            <span className="text-2xl font-black text-rose-700 tracking-tight tabular-nums">
              {totalReduction} HC
            </span>
            <span className="text-[11px] text-rose-600 block mt-0.5">
              Across {overstaffedStores.length} surplus stores
            </span>
          </div>
        </div>

        {/* 5. MPP Increase Requirement */}
        <div className="bg-white p-4 rounded-xl border border-amber-200 shadow-xs flex flex-col justify-between bg-gradient-to-br from-amber-50/30 to-white">
          <div className="flex items-center justify-between text-amber-700">
            <span className="text-[11px] font-bold uppercase tracking-wider">MPP Increase</span>
            <div className="p-1.5 bg-amber-100 text-amber-800 rounded-lg">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2.5">
            <span className="text-2xl font-black text-amber-800 tracking-tight tabular-nums">
              +{totalIncrease} HC
            </span>
            <span className="text-[11px] text-amber-700 block mt-0.5">
              Across {understaffedStores.length} shortage stores
            </span>
          </div>
        </div>

        {/* 6. Understaffed Stores */}
        <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-bold uppercase tracking-wider">Understaffed Stores</span>
            <div className="p-1.5 bg-amber-50 text-amber-700 rounded-lg">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2.5">
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-black text-amber-800 tracking-tight tabular-nums">
                {understaffedStores.length}
              </span>
              <span className="text-xs font-semibold text-slate-500">
                ({underPct}%)
              </span>
            </div>
            <span className="text-[11px] text-slate-500 block mt-0.5">Need additional HC</span>
          </div>
        </div>

        {/* 7. Overstaffed Stores */}
        <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-bold uppercase tracking-wider">Overstaffed Stores</span>
            <div className="p-1.5 bg-rose-50 text-rose-700 rounded-lg">
              <TrendingDown className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2.5">
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-black text-rose-700 tracking-tight tabular-nums">
                {overstaffedStores.length}
              </span>
              <span className="text-xs font-semibold text-slate-500">
                ({overPct}%)
              </span>
            </div>
            <span className="text-[11px] text-slate-500 block mt-0.5">Surplus headcount</span>
          </div>
        </div>

        {/* 8. Optimal Stores */}
        <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-bold uppercase tracking-wider">Optimal Stores</span>
            <div className="p-1.5 bg-emerald-50 text-emerald-700 rounded-lg">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2.5">
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-black text-emerald-700 tracking-tight tabular-nums">
                {optimalStores.length}
              </span>
              <span className="text-xs font-semibold text-slate-500">
                ({optimalPct}%)
              </span>
            </div>
            <span className="text-[11px] text-slate-500 block mt-0.5">Balanced headcount</span>
          </div>
        </div>

        {/* 9. Average Cost Efficiency */}
        <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-bold uppercase tracking-wider">Avg Cost Efficiency</span>
            <div className="p-1.5 bg-slate-100 text-slate-700 rounded-lg">
              <Percent className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2.5">
            <span className="text-2xl font-black text-slate-900 tracking-tight tabular-nums">
              {avgCostEfficiency.toFixed(2)}%
            </span>
            <span className="text-[11px] text-slate-500 block mt-0.5">Mean store efficiency</span>
          </div>
        </div>

        {/* 10. Average Wages Salary Ratio */}
        <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-bold uppercase tracking-wider">Avg Wages Ratio</span>
            <div className="p-1.5 bg-slate-100 text-slate-700 rounded-lg">
              <Scale className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2.5">
            <span className="text-2xl font-black text-slate-900 tracking-tight tabular-nums">
              {avgWagesRatio.toFixed(2)}%
            </span>
            <span className="text-[11px] text-slate-500 block mt-0.5">
              vs Budget: {avgBudgetFinance.toFixed(2)}%
            </span>
          </div>
        </div>

      </div>
    </section>
  );
};
