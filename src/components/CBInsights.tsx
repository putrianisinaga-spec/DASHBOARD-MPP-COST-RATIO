import React, { useMemo } from 'react';
import { CBStoreRecord } from '../types';
import {
  Sparkles,
  TrendingDown,
  TrendingUp,
  AlertCircle,
  Building2,
  CheckCircle,
  Scale,
} from 'lucide-react';

interface CBInsightsProps {
  stores: CBStoreRecord[];
}

export const CBInsights: React.FC<CBInsightsProps> = ({ stores }) => {
  const insights = useMemo(() => {
    if (stores.length === 0) return [];

    const totalStores = stores.length;
    const overstaffed = stores.filter((s) => s.status.toLowerCase().includes('over') || s.reduceNumber < 0);
    const understaffed = stores.filter((s) => s.status.toLowerCase().includes('under') || s.reduceNumber > 0);
    const optimal = stores.filter(
      (s) => !s.status.toLowerCase().includes('over') && !s.status.toLowerCase().includes('under') && s.reduceNumber === 0
    );

    const totalReduction = overstaffed.reduce((acc, s) => acc + (s.reduceNumber < 0 ? Math.abs(s.reduceNumber) : 0), 0);
    const totalIncrease = understaffed.reduce((acc, s) => acc + (s.reduceNumber > 0 ? s.reduceNumber : 0), 0);

    const avgCostEfficiency =
      stores.reduce((acc, s) => acc + (s.costEfficiencyNum || 0), 0) / totalStores;

    // Territory with largest reduction opportunity
    const territoryReductionMap: Record<string, number> = {};
    stores.forEach((s) => {
      if (s.reduceNumber < 0) {
        territoryReductionMap[s.territory] =
          (territoryReductionMap[s.territory] || 0) + Math.abs(s.reduceNumber);
      }
    });

    let topReductionTerritory = '';
    let maxTerritoryReduction = 0;
    Object.entries(territoryReductionMap).forEach(([terr, red]) => {
      if (red > maxTerritoryReduction) {
        maxTerritoryReduction = red;
        topReductionTerritory = terr;
      }
    });

    // Stores where budget finance > wages target
    const overBudgetStores = stores.filter(
      (s) => s.budgetFinanceNum > s.wagesSalaryRatioTargetNum
    );
    const avgVariance =
      overBudgetStores.length > 0
        ? (
            overBudgetStores.reduce(
              (acc, s) => acc + (s.budgetFinanceNum - s.wagesSalaryRatioTargetNum),
              0
            ) / overBudgetStores.length
          ).toFixed(2)
        : '0.00';

    // Estimated monthly cost impact for overstaffed stores (in Million IDR)
    const estimatedCostSavingsMillion = overstaffed.reduce(
      (acc, s) => acc + (s.averageMppSalaryNum || 0) * Math.abs(s.reduceNumber),
      0
    );

    const list: {
      type: 'positive' | 'warning' | 'neutral' | 'info';
      title: string;
      description: string;
    }[] = [];

    // Overstaffed Insight
    if (overstaffed.length > 0) {
      list.push({
        type: 'warning',
        title: `${overstaffed.length} stores (${Math.round((overstaffed.length / totalStores) * 100)}%) are currently overstaffed`,
        description: `Potential headcount rationalization of ${totalReduction} MPP identified. Estimated labor budget impact is ~Rp${estimatedCostSavingsMillion.toFixed(1)}M/month based on current store salary baselines.`,
      });
    }

    // Understaffed Insight
    if (understaffed.length > 0) {
      list.push({
        type: 'info',
        title: `${understaffed.length} stores require additional staffing allocation`,
        description: `Shortage of +${totalIncrease} MPP identified to meet recommended customer service, inventory, and floor area coverage standards.`,
      });
    }

    // Territory Insight
    if (topReductionTerritory && maxTerritoryReduction > 0) {
      list.push({
        type: 'neutral',
        title: `Territory ${topReductionTerritory} has the highest manpower surplus`,
        description: `Accounts for ${maxTerritoryReduction} of ${totalReduction} total potential MPP reductions (${Math.round((maxTerritoryReduction / (totalReduction || 1)) * 100)}% of total surplus).`,
      });
    }

    // Finance Budget vs Target Insight
    if (overBudgetStores.length > 0) {
      list.push({
        type: 'warning',
        title: `${overBudgetStores.length} stores exceed Wages Salary Ratio targets`,
        description: `Finance Budget exceeds operational wages ratio targets with an average unfavorable variance of +${avgVariance}%. Prioritize these stores for headcount restructuring.`,
      });
    } else {
      list.push({
        type: 'positive',
        title: 'All stores are within Wages Salary Ratio targets',
        description: `Finance budget allocations align with or stay below the targeted wages ratio for all selected locations.`,
      });
    }

    // Efficiency summary
    list.push({
      type: 'info',
      title: `Portfolio Cost Efficiency stands at ${avgCostEfficiency.toFixed(2)}%`,
      description: `${optimal.length} stores (${Math.round((optimal.length / totalStores) * 100)}%) maintain optimal staffing with zero headcount variance.`,
    });

    return list;
  }, [stores]);

  if (insights.length === 0) return null;

  return (
    <section className="bg-white rounded-xl border border-slate-200/90 p-4 shadow-xs">
      <div className="flex items-center gap-2 mb-3 pb-2.5 border-b border-slate-100">
        <div className="p-1.5 bg-slate-900 text-white rounded-lg">
          <Sparkles className="w-4 h-4 text-amber-400" />
        </div>
        <div>
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            Executive Insights &amp; Operational Takeaways
          </h3>
          <p className="text-[11px] text-slate-500">
            Automated diagnostic findings synthesized from current filtered dataset
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {insights.map((item, idx) => (
          <div
            key={idx}
            className={`p-3.5 rounded-xl border text-xs flex flex-col justify-between ${
              item.type === 'warning'
                ? 'bg-rose-50/40 border-rose-200/90 text-rose-950'
                : item.type === 'positive'
                ? 'bg-emerald-50/40 border-emerald-200/90 text-emerald-950'
                : item.type === 'info'
                ? 'bg-amber-50/40 border-amber-200/90 text-amber-950'
                : 'bg-slate-50/80 border-slate-200 text-slate-900'
            }`}
          >
            <div>
              <div className="flex items-start gap-2">
                {item.type === 'warning' ? (
                  <TrendingDown className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                ) : item.type === 'positive' ? (
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                ) : item.type === 'info' ? (
                  <TrendingUp className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                ) : (
                  <Building2 className="w-4 h-4 text-slate-600 shrink-0 mt-0.5" />
                )}
                <span className="font-bold text-slate-900 leading-snug">
                  {item.title}
                </span>
              </div>
              <p className="mt-1.5 text-[11px] text-slate-600 leading-relaxed pl-6">
                {item.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
