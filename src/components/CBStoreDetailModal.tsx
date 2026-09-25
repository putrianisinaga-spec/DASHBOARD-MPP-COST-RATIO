import React from 'react';
import { CBStoreRecord } from '../types';
import {
  X,
  Store,
  Building,
  MapPin,
  DollarSign,
  TrendingUp,
  Users,
  AlertTriangle,
  CheckCircle2,
  TrendingDown,
  User,
  Activity,
  Layers,
  Scale,
} from 'lucide-react';

interface CBStoreDetailModalProps {
  store: CBStoreRecord | null;
  onClose: () => void;
}

export const CBStoreDetailModal: React.FC<CBStoreDetailModalProps> = ({ store, onClose }) => {
  if (!store) return null;

  const isOverstaffed = store.status.toLowerCase().includes('over');
  const isUnderstaffed = store.status.toLowerCase().includes('under');
  const statusBadgeColor = isOverstaffed
    ? 'bg-rose-50 text-rose-700 border-rose-200'
    : isUnderstaffed
    ? 'bg-amber-50 text-amber-700 border-amber-200'
    : 'bg-emerald-50 text-emerald-700 border-emerald-200';

  const isBudgetOverTarget = store.budgetFinanceNum > store.wagesSalaryRatioTargetNum;
  const budgetVariance = (store.budgetFinanceNum - store.wagesSalaryRatioTargetNum).toFixed(2);

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl overflow-hidden animate-in fade-in duration-200 flex flex-col max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="bg-slate-900 text-white p-5 flex items-start justify-between shrink-0 border-b border-slate-800">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-white/10 text-white flex items-center justify-center font-bold text-lg border border-white/20">
              <Store className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-mono font-bold text-xs px-2.5 py-0.5 rounded bg-white/20 tracking-wider">
                  {store.kode}
                </span>
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full border bg-white/10 text-slate-200 border-white/20">
                  {store.storeStatus}
                </span>
                <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${statusBadgeColor}`}>
                  {store.status}
                </span>
              </div>
              <h3 className="text-lg font-bold text-white mt-1 tracking-tight">
                {store.storeName}
              </h3>
              <p className="text-xs text-slate-300 flex items-center gap-1.5 mt-0.5">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                <span>{store.city}, {store.province} &bull; Territory {store.territory}</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-6 space-y-6 overflow-y-auto">
          
          {/* Section 1: Store Overview */}
          <div>
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Building className="w-4 h-4 text-[#C8102E]" /> Store Overview
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-500 font-bold uppercase block">General Manager (GM)</span>
                <span className="text-xs font-bold text-slate-800 mt-1 block">{store.gm}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-500 font-bold uppercase block">Area Manager (AM)</span>
                <span className="text-xs font-bold text-slate-800 mt-1 block">{store.am}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-500 font-bold uppercase block">Store Size Tier</span>
                <span className="text-xs font-bold text-slate-800 mt-1 block">Size {store.size}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-500 font-bold uppercase block">Floor Area (SQM)</span>
                <span className="text-xs font-bold text-slate-800 mt-1 block tabular-nums">{store.sqm.toLocaleString()} m²</span>
              </div>
            </div>
          </div>

          {/* Section 2: Manpower Headcount Optimization */}
          <div>
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-600" /> Manpower Headcount &amp; Recommendation
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-500 font-bold uppercase block">MPP Existing</span>
                <span className="text-2xl font-black text-slate-900 mt-1 block tabular-nums">{store.mppExisting}</span>
                <span className="text-[10px] text-slate-400">Headcount (HC)</span>
              </div>
              <div className="p-3 bg-purple-50/70 rounded-xl border border-purple-200">
                <span className="text-[10px] text-purple-700 font-bold uppercase block">MPP Recommendation</span>
                <span className="text-2xl font-black text-purple-900 mt-1 block tabular-nums">{store.mppRecommendation}</span>
                <span className="text-[10px] text-purple-600">Optimized Target HC</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-500 font-bold uppercase block">Existing per 31 Mei</span>
                <span className="text-2xl font-black text-slate-800 mt-1 block tabular-nums">{store.existingPer31Mei}</span>
                <span className="text-[10px] text-slate-400">Historical baseline</span>
              </div>
              <div className={`p-3 rounded-xl border ${store.reduceNumber < 0 ? 'bg-rose-50 border-rose-200' : store.reduceNumber > 0 ? 'bg-amber-50 border-amber-200' : 'bg-emerald-50 border-emerald-200'}`}>
                <span className="text-[10px] font-bold uppercase block text-slate-600">MPP Difference (Reduce)</span>
                <span className={`text-2xl font-black mt-1 block tabular-nums ${store.reduceNumber < 0 ? 'text-rose-700' : store.reduceNumber > 0 ? 'text-amber-700' : 'text-emerald-700'}`}>
                  {store.reduceNumber > 0 ? `+${store.reduceNumber}` : store.reduceNumber} HC
                </span>
                <span className="text-[10px] text-slate-500">
                  {store.reduceNumber < 0 ? 'Surplus to reduce' : store.reduceNumber > 0 ? 'Shortage to increase' : 'Optimal staffing'}
                </span>
              </div>
            </div>
          </div>

          {/* Section 3: Financial & Labor Cost Budget */}
          <div>
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3 flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-emerald-600" /> Financial &amp; Labor Budget
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-500 font-bold uppercase block">Sales Target 2026</span>
                <span className="text-sm font-bold text-slate-900 mt-1 block tabular-nums">{store.salesTgt2026}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-500 font-bold uppercase block">Monthly Sales Budget Avg</span>
                <span className="text-sm font-bold text-slate-900 mt-1 block tabular-nums">{store.monthlySalesBudgetAverage}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-500 font-bold uppercase block">Wages Salary Budget Finance</span>
                <span className="text-sm font-bold text-slate-900 mt-1 block tabular-nums">{store.wagesSalaryBudgetFinance}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-500 font-bold uppercase block">Wages Salary Ratio Target</span>
                <span className="text-sm font-bold text-slate-900 mt-1 block tabular-nums">{store.wagesSalaryRatioTarget}</span>
              </div>
              <div className={`p-3 rounded-xl border ${isBudgetOverTarget ? 'bg-rose-50/70 border-rose-200' : 'bg-slate-50 border-slate-200'}`}>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-slate-500 font-bold uppercase block">Budget Finance</span>
                  {isBudgetOverTarget && (
                    <span className="text-[9px] font-bold px-1.5 py-0.5 bg-rose-100 text-rose-800 rounded">
                      +{budgetVariance}% over
                    </span>
                  )}
                </div>
                <span className={`text-sm font-bold mt-1 block tabular-nums ${isBudgetOverTarget ? 'text-rose-900' : 'text-slate-900'}`}>
                  {store.budgetFinance}
                </span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-500 font-bold uppercase block">Average MPP Salary</span>
                <span className="text-sm font-bold text-slate-900 mt-1 block tabular-nums">{store.averageMppSalary}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-500 font-bold uppercase block">Cost Efficiency</span>
                <span className={`text-sm font-bold mt-1 block tabular-nums ${store.costEfficiencyNum > 0 ? 'text-emerald-700' : store.costEfficiencyNum < 0 ? 'text-rose-700' : 'text-slate-700'}`}>
                  {store.costEfficiency}
                </span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-500 font-bold uppercase block">Sales Scale</span>
                <span className="text-sm font-bold text-slate-900 mt-1 block">{store.salesScale}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-500 font-bold uppercase block">Salary Target New Prod MPP</span>
                <span className="text-sm font-bold text-slate-900 mt-1 block tabular-nums">{store.salaryTargetNewProdMpp}</span>
              </div>
            </div>
          </div>

          {/* Section 4: Productivity & SQM Coverage */}
          <div>
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Activity className="w-4 h-4 text-purple-600" /> Manpower Productivity &amp; Floor Coverage
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-500 font-bold uppercase block">Prod MPP (Current)</span>
                <span className="text-sm font-bold text-slate-900 mt-1 block tabular-nums">{store.prodMpp}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-500 font-bold uppercase block">New Prod MPP Target</span>
                <span className="text-sm font-bold text-slate-900 mt-1 block tabular-nums">{store.newProdMppTarget}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-500 font-bold uppercase block">Prod MPP Increase Target</span>
                <span className="text-sm font-bold text-purple-900 mt-1 block tabular-nums">{store.prodMppIncreaseTarget}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-500 font-bold uppercase block">SQM Productivity</span>
                <span className="text-sm font-bold text-slate-900 mt-1 block tabular-nums">{store.sqmProductivity}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-500 font-bold uppercase block">Current SQM Coverage</span>
                <span className="text-sm font-bold text-slate-900 mt-1 block tabular-nums">{store.currentSqmCoverageMpp} m²/HC</span>
              </div>
              <div className="p-3 bg-purple-50/70 rounded-xl border border-purple-200">
                <span className="text-[10px] text-purple-700 font-bold uppercase block">New SQM Coverage</span>
                <span className="text-sm font-bold text-purple-900 mt-1 block tabular-nums">{store.newSqmCoverageMpp} m²/HC</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 col-span-2">
                <span className="text-[10px] text-slate-500 font-bold uppercase block">Productivity M² to be</span>
                <span className="text-sm font-bold text-slate-900 mt-1 block tabular-nums">{store.productivityM2ToBe} m²</span>
              </div>
            </div>
          </div>

          {/* Section 5: Operational Recommendation & Assigned PIC */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <span className="font-bold text-slate-600 uppercase text-[10px] block mb-1">Operational Remarks / Recommendation</span>
              <p className="text-slate-800 font-medium leading-relaxed bg-white p-3 rounded-lg border border-slate-200">
                {store.remarks || 'No specific operational notes recorded for this store.'}
              </p>
            </div>
            <div>
              <span className="font-bold text-slate-600 uppercase text-[10px] block mb-1">Assigned HCBP PIC</span>
              <div className="bg-white p-3 rounded-lg border border-slate-200 flex items-center gap-2.5">
                <div className="p-1.5 bg-slate-100 rounded-md text-slate-600">
                  <User className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-bold text-slate-900 block">{store.pic || 'HCBP Operations'}</span>
                  <span className="text-[11px] text-slate-500">Human Capital Business Partner</span>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 border-t border-slate-200 p-4 flex items-center justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors"
          >
            Close Detail
          </button>
        </div>

      </div>
    </div>
  );
};
