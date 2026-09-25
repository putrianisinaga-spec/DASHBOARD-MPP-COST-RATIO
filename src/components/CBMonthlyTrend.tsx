import React, { useMemo } from 'react';
import { CBStoreRecord, MonthlyTrendItem } from '../types';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Cell,
} from 'recharts';
import {
  Calendar,
  TrendingUp,
  TrendingDown,
  Minus,
  Info,
  Layers,
  ArrowRight,
} from 'lucide-react';

interface CBMonthlyTrendProps {
  stores: CBStoreRecord[];
}

export const CBMonthlyTrend: React.FC<CBMonthlyTrendProps> = ({ stores }) => {
  // Aggregate monthly MPP trend from filtered stores
  const trendData = useMemo<MonthlyTrendItem[]>(() => {
    if (stores.length === 0) return [];

    // Check if any stores have custom monthlyMppHistory populated
    const allMonthsSet = new Set<string>();
    stores.forEach((s) => {
      if (s.monthlyMppHistory) {
        Object.keys(s.monthlyMppHistory).forEach((m) => allMonthsSet.add(m));
      }
    });

    const monthOrder = [
      'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'May', 'Jun', 'Jul', 'Aug', 'Agu', 'Sep', 'Okt', 'Oct', 'Nov', 'Des', 'Dec'
    ];

    let monthlySeries: { month: string; totalMpp: number }[] = [];

    if (allMonthsSet.size > 0) {
      // Sort months according to standard calendar order
      const sortedMonths = Array.from(allMonthsSet).sort((a, b) => {
        const idxA = monthOrder.indexOf(a);
        const idxB = monthOrder.indexOf(b);
        if (idxA !== -1 && idxB !== -1) return idxA - idxB;
        return a.localeCompare(b);
      });

      monthlySeries = sortedMonths.map((m) => {
        const total = stores.reduce((sum, s) => {
          return sum + (s.monthlyMppHistory?.[m] || 0);
        }, 0);
        return { month: m, totalMpp: total };
      });
    } else {
      // Use existing verified data fields:
      // Month 1: Mei (Baseline Existing per 31 Mei)
      // Month 2: Juni (Current MPP Existing)
      const totalMei = stores.reduce((sum, s) => sum + (s.existingPer31Mei || 0), 0);
      const totalCurrent = stores.reduce((sum, s) => sum + (s.mppExisting || 0), 0);

      monthlySeries = [
        { month: 'Mei (31 Mei)', totalMpp: totalMei },
        { month: 'Juni (Berjalan)', totalMpp: totalCurrent },
      ];
    }

    // Calculate MoM comparisons and Growth %:
    // Formula: ((MPP bulan ini - MPP bulan lalu) / MPP bulan lalu) * 100%
    return monthlySeries.map((item, index) => {
      if (index === 0) {
        return {
          month: item.month,
          totalMpp: item.totalMpp,
          prevMpp: null,
          change: 0,
          growthRate: null,
          trendStatus: 'baseline',
          formattedRate: 'Baseline',
        };
      }

      const prev = monthlySeries[index - 1].totalMpp;
      const change = item.totalMpp - prev;
      const rate = prev > 0 ? ((item.totalMpp - prev) / prev) * 100 : 0;
      const formattedRate = `${rate > 0 ? '+' : ''}${rate.toFixed(2)}%`;

      let trendStatus: 'increase' | 'decrease' | 'neutral' = 'neutral';
      if (rate > 0) trendStatus = 'increase';
      else if (rate < 0) trendStatus = 'decrease';

      return {
        month: item.month,
        totalMpp: item.totalMpp,
        prevMpp: prev,
        change,
        growthRate: rate,
        trendStatus,
        formattedRate,
      };
    });
  }, [stores]);

  // Current latest month vs previous month summary
  const latestMonth = trendData.length > 0 ? trendData[trendData.length - 1] : null;
  const previousMonth = trendData.length > 1 ? trendData[trendData.length - 2] : null;

  const momGrowthRate = latestMonth?.growthRate ?? null;
  const momChange = latestMonth?.change ?? 0;
  const isPositiveGrowth = momGrowthRate !== null && momGrowthRate > 0;
  const isNegativeGrowth = momGrowthRate !== null && momGrowthRate < 0;

  return (
    <section className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-xs">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-blue-50 text-blue-700 rounded-lg">
            <Calendar className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              MPP Existing Monthly Trend
            </h3>
            <p className="text-[11px] text-slate-500">
              Pergerakan total MPP Existing antar bulan dan analisis pertumbuhan MoM (Month-over-Month)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-[11px] font-medium bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200 text-slate-600">
          <Info className="w-3.5 h-3.5 text-blue-600 shrink-0" />
          <span>
            Formula: <code className="font-mono text-slate-800">((Bulan Ini − Bulan Lalu) / Bulan Lalu) × 100%</code>
          </span>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 my-4">
        
        {/* 1. MPP Bulan Ini */}
        <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 flex flex-col justify-between">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
            MPP Bulan Ini ({latestMonth?.month || 'Berjalan'})
          </span>
          <div className="mt-1.5">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-slate-900 tabular-nums">
                {latestMonth?.totalMpp.toLocaleString() ?? 0}
              </span>
              <span className="text-xs font-semibold text-slate-500">HC</span>
            </div>
            <span className="text-[11px] text-slate-500 block mt-0.5">
              Total MPP Existing aktif
            </span>
          </div>
        </div>

        {/* 2. MPP Bulan Sebelumnya */}
        <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 flex flex-col justify-between">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
            MPP Bulan Lalu ({previousMonth?.month || 'Baseline'})
          </span>
          <div className="mt-1.5">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-slate-700 tabular-nums">
                {previousMonth?.totalMpp.toLocaleString() ?? '—'}
              </span>
              <span className="text-xs font-semibold text-slate-500">HC</span>
            </div>
            <span className="text-[11px] text-slate-500 block mt-0.5">
              Baseline per 31 Mei
            </span>
          </div>
        </div>

        {/* 3. Perubahan Headcount (HC) */}
        <div className={`p-3.5 rounded-xl border flex flex-col justify-between ${
          isPositiveGrowth
            ? 'bg-amber-50/40 border-amber-200'
            : isNegativeGrowth
            ? 'bg-emerald-50/40 border-emerald-200'
            : 'bg-slate-50/70 border-slate-200'
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block">
              Perubahan Headcount
            </span>
            {isPositiveGrowth ? (
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800">
                Bertambah
              </span>
            ) : isNegativeGrowth ? (
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">
                Berkurang
              </span>
            ) : null}
          </div>
          <div className="mt-1.5">
            <span className={`text-2xl font-black tabular-nums ${
              momChange > 0 ? 'text-amber-800' : momChange < 0 ? 'text-emerald-700' : 'text-slate-800'
            }`}>
              {momChange > 0 ? `+${momChange.toLocaleString()}` : momChange.toLocaleString()} HC
            </span>
            <span className="text-[11px] text-slate-500 block mt-0.5">
              Selisih absolut terhadap bulan lalu
            </span>
          </div>
        </div>

        {/* 4. MoM Growth (%) */}
        <div className={`p-3.5 rounded-xl border flex flex-col justify-between ${
          isPositiveGrowth
            ? 'bg-amber-50/50 border-amber-200'
            : isNegativeGrowth
            ? 'bg-emerald-50/50 border-emerald-200'
            : 'bg-slate-50/70 border-slate-200'
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block">
              MoM Growth Rate
            </span>
            {isPositiveGrowth ? (
              <div className="flex items-center gap-1 text-xs font-bold text-amber-700">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>Kenaikan</span>
              </div>
            ) : isNegativeGrowth ? (
              <div className="flex items-center gap-1 text-xs font-bold text-emerald-700">
                <TrendingDown className="w-3.5 h-3.5" />
                <span>Penurunan</span>
              </div>
            ) : (
              <div className="flex items-center gap-1 text-xs font-bold text-slate-600">
                <Minus className="w-3.5 h-3.5" />
                <span>Stabil</span>
              </div>
            )}
          </div>
          <div className="mt-1.5">
            <span className={`text-2xl font-black tabular-nums ${
              isPositiveGrowth ? 'text-amber-800' : isNegativeGrowth ? 'text-emerald-700' : 'text-slate-800'
            }`}>
              {momGrowthRate !== null ? `${momGrowthRate > 0 ? '+' : ''}${momGrowthRate.toFixed(2)}%` : '—'}
            </span>
            <span className="text-[11px] text-slate-500 block mt-0.5">
              {isPositiveGrowth
                ? `Kenaikan sebesar +${momGrowthRate?.toFixed(2)}% MoM`
                : isNegativeGrowth
                ? `Penurunan sebesar ${momGrowthRate?.toFixed(2)}% MoM`
                : 'Pertumbuhan stabil'}
            </span>
          </div>
        </div>

      </div>

      {/* Main Bar Chart & Table Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-4">
        
        {/* Bar Chart per Bulan */}
        <div className="lg:col-span-7 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-600 mb-2 font-medium">
            <span>Bar Chart Total MPP Existing per Bulan</span>
            <span className="text-[11px] text-slate-400">Nilai dalam Headcount (HC)</span>
          </div>

          <div className="h-64 w-full">
            {trendData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={trendData}
                  margin={{ top: 20, right: 20, left: -10, bottom: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis
                    dataKey="month"
                    tick={{ fontSize: 11, fill: '#64748b' }}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: '#64748b' }}
                    domain={['dataMin - 100', 'dataMax + 100']}
                  />
                  <Tooltip
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        const d = payload[0].payload as MonthlyTrendItem;
                        return (
                          <div className="bg-slate-900 text-white p-3 rounded-xl text-xs shadow-xl space-y-1.5 border border-slate-700">
                            <span className="font-bold block text-white text-sm">
                              {label}
                            </span>
                            <div className="text-slate-300">
                              Total MPP Existing: <strong className="text-white text-sm tabular-nums">{d.totalMpp.toLocaleString()} HC</strong>
                            </div>
                            {d.prevMpp !== null && (
                              <>
                                <div className="text-slate-400 text-[11px]">
                                  Bulan Sebelumnya: <strong className="text-slate-200 tabular-nums">{d.prevMpp.toLocaleString()} HC</strong>
                                </div>
                                <div className="text-slate-400 text-[11px]">
                                  Selisih: <strong className="text-slate-200 tabular-nums">{d.change > 0 ? `+${d.change}` : d.change} HC</strong>
                                </div>
                                <div className="pt-1 border-t border-slate-800 flex items-center justify-between gap-3">
                                  <span className="text-slate-400 text-[11px]">MoM Growth:</span>
                                  <span className={`font-bold text-xs ${
                                    d.trendStatus === 'increase'
                                      ? 'text-amber-400'
                                      : d.trendStatus === 'decrease'
                                      ? 'text-emerald-400'
                                      : 'text-slate-300'
                                  }`}>
                                    {d.formattedRate} {d.trendStatus === 'increase' ? '(Kenaikan)' : d.trendStatus === 'decrease' ? '(Penurunan)' : ''}
                                  </span>
                                </div>
                              </>
                            )}
                            {d.prevMpp === null && (
                              <div className="text-blue-300 text-[11px]">
                                Titik awal acuan (Baseline)
                              </div>
                            )}
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar
                    dataKey="totalMpp"
                    name="Total MPP Existing"
                    radius={[6, 6, 0, 0]}
                    maxBarSize={48}
                  >
                    {trendData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={index === trendData.length - 1 ? '#0284C7' : '#94A3B8'}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                Tidak ada data toko
              </div>
            )}
          </div>
        </div>

        {/* Tabel Komparasi Bulanan MoM */}
        <div className="lg:col-span-5 border border-slate-200 rounded-xl p-3.5 bg-slate-50/50 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-200">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Detail Komparasi Bulanan
              </h4>
              <span className="text-[10px] text-slate-500">
                {trendData.length} Periode Tercatat
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="text-[10px] uppercase font-bold text-slate-500 border-b border-slate-200">
                    <th className="py-2 pr-2">Bulan</th>
                    <th className="py-2 px-2 text-right">MPP Existing</th>
                    <th className="py-2 px-2 text-right">Bulan Lalu</th>
                    <th className="py-2 px-2 text-right">Selisih</th>
                    <th className="py-2 pl-2 text-right">MoM Growth</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200/60">
                  {trendData.map((row) => (
                    <tr key={row.month} className="hover:bg-white/80 transition-colors">
                      <td className="py-2.5 pr-2 font-bold text-slate-900">
                        {row.month}
                      </td>
                      <td className="py-2.5 px-2 text-right font-black text-slate-900 tabular-nums">
                        {row.totalMpp.toLocaleString()}
                      </td>
                      <td className="py-2.5 px-2 text-right text-slate-500 tabular-nums">
                        {row.prevMpp !== null ? row.prevMpp.toLocaleString() : '—'}
                      </td>
                      <td className="py-2.5 px-2 text-right font-bold tabular-nums">
                        {row.prevMpp !== null ? (
                          <span className={row.change > 0 ? 'text-amber-700' : row.change < 0 ? 'text-emerald-700' : 'text-slate-600'}>
                            {row.change > 0 ? `+${row.change}` : row.change}
                          </span>
                        ) : (
                          '—'
                        )}
                      </td>
                      <td className="py-2.5 pl-2 text-right font-black tabular-nums">
                        {row.prevMpp !== null ? (
                          <span className={`inline-block px-1.5 py-0.5 rounded text-[11px] ${
                            row.trendStatus === 'increase'
                              ? 'bg-amber-100 text-amber-800'
                              : row.trendStatus === 'decrease'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-slate-100 text-slate-700'
                          }`}>
                            {row.formattedRate}
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                            Baseline
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Extensibility & Historical Note */}
          <div className="mt-3 pt-3 border-t border-slate-200 text-[10px] text-slate-500 leading-relaxed">
            <span className="font-bold text-slate-700 block mb-0.5">Catatan Struktur Data Historis:</span>
            Bagian ini menampilkan tren berdasarkan data riil yang tersedia pada dataset (<code className="text-slate-700 font-mono">existingPer31Mei</code> dan <code className="text-slate-700 font-mono">mppExisting</code>). Model data <code className="text-slate-700 font-mono">monthlyMppHistory</code> telah diimplementasikan sehingga sheet dengan kolom bulanan baru (<code className="text-slate-700 font-mono">MPP Jan</code>, <code className="text-slate-700 font-mono">MPP Feb</code>, dst.) akan otomatis dipetakan secara dinamis.
          </div>
        </div>

      </div>
    </section>
  );
};
