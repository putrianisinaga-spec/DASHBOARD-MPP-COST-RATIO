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
  Building2,
  Users,
  TrendingDown,
  TrendingUp,
  MapPin,
  ArrowRight,
} from 'lucide-react';

interface CBTerritoryAnalysisProps {
  stores: CBStoreRecord[];
  onSelectTerritory: (territory: string) => void;
  selectedTerritory: string;
}

export const CBTerritoryAnalysis: React.FC<CBTerritoryAnalysisProps> = ({
  stores,
  onSelectTerritory,
  selectedTerritory,
}) => {
  const territoryAggregates = useMemo(() => {
    const map: Record<
      string,
      {
        territory: string;
        stores: number;
        existingMpp: number;
        recMpp: number;
        reduction: number;
        increase: number;
        totalCostEff: number;
        totalProdMpp: number;
        totalWagesRatio: number;
      }
    > = {};

    stores.forEach((s) => {
      const t = s.territory || 'Unassigned';
      if (!map[t]) {
        map[t] = {
          territory: t,
          stores: 0,
          existingMpp: 0,
          recMpp: 0,
          reduction: 0,
          increase: 0,
          totalCostEff: 0,
          totalProdMpp: 0,
          totalWagesRatio: 0,
        };
      }
      map[t].stores += 1;
      map[t].existingMpp += s.mppExisting;
      map[t].recMpp += s.mppRecommendation;
      if (s.reduceNumber < 0) {
        map[t].reduction += s.reduceNumber; // negative
      } else if (s.reduceNumber > 0) {
        map[t].increase += s.reduceNumber; // positive
      }
      map[t].totalCostEff += s.costEfficiencyNum;
      map[t].totalProdMpp += s.prodMppNum;
      map[t].totalWagesRatio += s.wagesSalaryRatioTargetNum;
    });

    return Object.values(map).map((item) => ({
      ...item,
      avgCostEff: parseFloat((item.totalCostEff / item.stores).toFixed(2)),
      avgProdMpp: parseFloat((item.totalProdMpp / item.stores).toFixed(1)),
      avgWagesRatio: parseFloat((item.totalWagesRatio / item.stores).toFixed(2)),
      netChange: item.recMpp - item.existingMpp,
    })).sort((a, b) => b.stores - a.stores);
  }, [stores]);

  return (
    <section className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-slate-100 text-slate-800 rounded-lg">
            <Building2 className="w-4 h-4 text-slate-700" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Territory Performance &amp; Manpower Distribution
            </h3>
            <p className="text-[11px] text-slate-500">
              Aggregated headcounts, cost efficiency, and productivity comparisons by territory
            </p>
          </div>
        </div>

        {selectedTerritory && (
          <button
            onClick={() => onSelectTerritory('')}
            className="text-xs font-semibold text-[#C8102E] hover:underline"
          >
            Clear territory filter ({selectedTerritory})
          </button>
        )}
      </div>

      {/* Chart: Existing vs Recommended MPP by Territory */}
      <div className="mt-4">
        <div className="flex items-center justify-between text-xs text-slate-600 mb-2 font-medium">
          <span>Headcount Distribution by Territory (Existing vs Recommended)</span>
          <span className="text-[11px] text-slate-400">Click a row below to filter</span>
        </div>

        <div className="h-60 w-full">
          {territoryAggregates.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={territoryAggregates} margin={{ top: 10, right: 10, left: -15, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="territory" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      const d = payload[0].payload;
                      return (
                        <div className="bg-slate-900 text-white p-2.5 rounded-lg text-xs shadow-lg space-y-1">
                          <span className="font-bold block text-white">{label}</span>
                          <div>Stores: <strong className="text-white">{d.stores}</strong></div>
                          <div>Existing MPP: <strong className="text-slate-300">{d.existingMpp} HC</strong></div>
                          <div>Recommended MPP: <strong className="text-purple-300">{d.recMpp} HC</strong></div>
                          <div>Surplus (Reduce): <strong className="text-rose-400">{d.reduction} HC</strong></div>
                          <div>Shortage (Increase): <strong className="text-amber-400">+{d.increase} HC</strong></div>
                          <div>Avg Cost Efficiency: <strong className="text-emerald-400">{d.avgCostEff}%</strong></div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} iconType="circle" />
                <Bar dataKey="existingMpp" name="Existing MPP" fill="#94A3B8" radius={[4, 4, 0, 0]} maxBarSize={28} />
                <Bar dataKey="recMpp" name="Recommended MPP" fill="#7C3AED" radius={[4, 4, 0, 0]} maxBarSize={28} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-xs text-slate-400">
              No territory data
            </div>
          )}
        </div>
      </div>

      {/* Aggregate Territory Table */}
      <div className="mt-5 overflow-x-auto rounded-xl border border-slate-200">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 text-slate-600 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200">
            <tr>
              <th className="px-4 py-3">Territory</th>
              <th className="px-3 py-3 text-right">Stores</th>
              <th className="px-3 py-3 text-right">Existing MPP</th>
              <th className="px-3 py-3 text-right">Rec. MPP</th>
              <th className="px-3 py-3 text-right">MPP Reduction</th>
              <th className="px-3 py-3 text-right">MPP Increase</th>
              <th className="px-3 py-3 text-right">Net Change</th>
              <th className="px-3 py-3 text-right">Cost Efficiency</th>
              <th className="px-3 py-3 text-right">Avg Prod MPP</th>
              <th className="px-3 py-3 text-right">Avg Wages Ratio</th>
              <th className="px-3 py-3 text-center">Filter</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {territoryAggregates.map((row) => {
              const isSelected = selectedTerritory === row.territory;
              return (
                <tr
                  key={row.territory}
                  onClick={() => onSelectTerritory(isSelected ? '' : row.territory)}
                  className={`cursor-pointer transition-colors ${
                    isSelected
                      ? 'bg-red-50/60 font-semibold text-slate-900'
                      : 'hover:bg-slate-50/80'
                  }`}
                >
                  <td className="px-4 py-2.5 font-bold text-slate-900 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>{row.territory}</span>
                  </td>
                  <td className="px-3 py-2.5 text-right font-medium tabular-nums">
                    {row.stores}
                  </td>
                  <td className="px-3 py-2.5 text-right font-medium tabular-nums">
                    {row.existingMpp}
                  </td>
                  <td className="px-3 py-2.5 text-right font-bold text-purple-900 tabular-nums">
                    {row.recMpp}
                  </td>
                  <td className="px-3 py-2.5 text-right font-bold text-rose-700 tabular-nums">
                    {row.reduction !== 0 ? `${row.reduction} HC` : '—'}
                  </td>
                  <td className="px-3 py-2.5 text-right font-bold text-amber-700 tabular-nums">
                    {row.increase !== 0 ? `+${row.increase} HC` : '—'}
                  </td>
                  <td className="px-3 py-2.5 text-right font-black tabular-nums">
                    <span
                      className={
                        row.netChange < 0
                          ? 'text-rose-700'
                          : row.netChange > 0
                          ? 'text-amber-700'
                          : 'text-emerald-700'
                      }
                    >
                      {row.netChange > 0 ? `+${row.netChange}` : row.netChange} HC
                    </span>
                  </td>
                  <td className="px-3 py-2.5 text-right font-bold text-emerald-700 tabular-nums">
                    {row.avgCostEff}%
                  </td>
                  <td className="px-3 py-2.5 text-right tabular-nums">
                    Rp{row.avgProdMpp}M
                  </td>
                  <td className="px-3 py-2.5 text-right tabular-nums">
                    {row.avgWagesRatio}%
                  </td>
                  <td className="px-3 py-2.5 text-center">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        isSelected
                          ? 'bg-[#C8102E] text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {isSelected ? 'Active' : 'Apply'}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
};
