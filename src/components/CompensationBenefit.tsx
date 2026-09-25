import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { CBStoreRecord, CBFilters } from '../types';
import {
  loadCBGoogleSheetData,
  CBLoaderResult,
} from '../data/cbGoogleSheetsLoader';
import { extractUniqueOptions } from '../data/cbDummyData';
import { CBSheetsConfigModal } from './CBSheetsConfigModal';
import { CBStoreDetailModal } from './CBStoreDetailModal';
import { CBExecutiveKPIs } from './CBExecutiveKPIs';
import { CBInsights } from './CBInsights';
import { CBManpowerStatus } from './CBManpowerStatus';
import { CBMonthlyTrend } from './CBMonthlyTrend';
import { CBMPPOptimization } from './CBMPPOptimization';
import { CBCostEfficiency } from './CBCostEfficiency';
import { CBProductivityAnalysis } from './CBProductivityAnalysis';
import { CBWagesBudgetAnalysis } from './CBWagesBudgetAnalysis';
import { CBTerritoryAnalysis } from './CBTerritoryAnalysis';
import { CBStoreTable } from './CBStoreTable';
import {
  Filter,
  RotateCcw,
  Search,
  RefreshCw,
  Settings2,
  Download,
  AlertTriangle,
  X,
  FileSpreadsheet,
} from 'lucide-react';

const initialFilters: CBFilters = {
  gm: '',
  am: '',
  territory: '',
  province: '',
  city: '',
  store: '',
  storeStatus: '',
  status: '',
  size: '',
  search: '',
};

interface FilterSelectProps {
  label: string;
  value: string;
  onChange: (val: string) => void;
  options: (string | number)[];
  placeholder: string;
}

const FilterSelect: React.FC<FilterSelectProps> = ({
  label,
  value,
  onChange,
  options,
  placeholder,
}) => (
  <div>
    <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
      {label}
    </label>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 focus:bg-white focus:border-[#C8102E] focus:outline-hidden font-medium text-slate-800 transition-colors"
    >
      <option value="">{placeholder}</option>
      {options.map((opt) => (
        <option key={String(opt)} value={String(opt)}>
          {label === 'Store Size' ? `Size ${opt}` : opt}
        </option>
      ))}
    </select>
  </div>
);

export const CompensationBenefit: React.FC = () => {
  const [stores, setStores] = useState<CBStoreRecord[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isLiveData, setIsLiveData] = useState<boolean>(false);
  const [lastUpdated, setLastUpdated] = useState<string>('');
  const [loaderError, setLoaderError] = useState<string | undefined>(undefined);
  const [missingColumns, setMissingColumns] = useState<string[] | undefined>(undefined);

  // Filters State
  const [filters, setFilters] = useState<CBFilters>(initialFilters);

  // Modal States
  const [isConfigOpen, setIsConfigOpen] = useState<boolean>(false);
  const [selectedStore, setSelectedStore] = useState<CBStoreRecord | null>(null);

  // Fetch Data
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const res: CBLoaderResult = await loadCBGoogleSheetData();
      setStores(res.data);
      setIsLiveData(res.isLiveData);
      setLastUpdated(res.lastUpdated);
      setLoaderError(res.error);
      setMissingColumns(res.missingColumns);
    } catch (err: any) {
      setLoaderError(`Failed to load C&B data: ${err.message || 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Extract dynamic unique filter options from whatever data is currently loaded
  const dynamicOptions = useMemo(() => {
    return extractUniqueOptions(stores);
  }, [stores]);

  const updateFilter = (key: keyof CBFilters, val: string) => {
    setFilters((prev) => ({ ...prev, [key]: val }));
  };

  const resetFilters = () => {
    setFilters(initialFilters);
  };

  // Filter stores according to active filter panel
  const filteredStores = useMemo(() => {
    return stores.filter((store) => {
      if (filters.gm && store.gm !== filters.gm) return false;
      if (filters.am && store.am !== filters.am) return false;
      if (filters.territory && store.territory !== filters.territory) return false;
      if (filters.province && store.province !== filters.province) return false;
      if (filters.city && store.city !== filters.city) return false;
      if (filters.store && store.kode !== filters.store && store.storeName !== filters.store) return false;
      if (filters.storeStatus && store.storeStatus.toLowerCase() !== filters.storeStatus.toLowerCase()) return false;
      if (filters.status && store.status.toLowerCase() !== filters.status.toLowerCase()) return false;
      if (filters.size && String(store.size) !== String(filters.size)) return false;
      if (filters.search) {
        const q = filters.search.toLowerCase().trim();
        const matches =
          store.storeName.toLowerCase().includes(q) ||
          store.kode.toLowerCase().includes(q) ||
          store.pic.toLowerCase().includes(q) ||
          store.city.toLowerCase().includes(q) ||
          store.remarks.toLowerCase().includes(q);
        if (!matches) return false;
      }
      return true;
    });
  }, [stores, filters]);

  // Applied filter items for chips
  const activeFilterChips = useMemo(() => {
    const list: { key: keyof CBFilters; label: string; value: string }[] = [];
    if (filters.gm) list.push({ key: 'gm', label: 'GM', value: filters.gm });
    if (filters.am) list.push({ key: 'am', label: 'AM', value: filters.am });
    if (filters.territory) list.push({ key: 'territory', label: 'Territory', value: filters.territory });
    if (filters.province) list.push({ key: 'province', label: 'Province', value: filters.province });
    if (filters.city) list.push({ key: 'city', label: 'City', value: filters.city });
    if (filters.storeStatus) list.push({ key: 'storeStatus', label: 'Store Status', value: filters.storeStatus });
    if (filters.status) list.push({ key: 'status', label: 'MPP Status', value: filters.status });
    if (filters.size) list.push({ key: 'size', label: 'Size', value: `Size ${filters.size}` });
    if (filters.search) list.push({ key: 'search', label: 'Search', value: filters.search });
    return list;
  }, [filters]);

  // Export CSV
  const handleExportCSV = () => {
    if (filteredStores.length === 0) return;
    const headers = [
      'Kode',
      'Store Name',
      'GM',
      'AM',
      'Territory',
      'Province',
      'City',
      'Size',
      'SQM',
      'Status',
      'Wages Salary Ratio Target',
      'Budget Finance',
      'Sales Tgt 2026',
      'Avg MPP Salary',
      'MPP Existing',
      'MPP Recommendation',
      'Reduce Number',
      'Prod MPP',
      'New Prod MPP Target',
      'Cost Efficiency',
      'Current SQM Coverage',
      'New SQM Coverage',
      'Remarks',
      'PIC',
    ];

    const rows = filteredStores.map((s) => [
      `"${s.kode}"`,
      `"${s.storeName}"`,
      `"${s.gm}"`,
      `"${s.am}"`,
      `"${s.territory}"`,
      `"${s.province}"`,
      `"${s.city}"`,
      s.size,
      s.sqm,
      `"${s.status}"`,
      `"${s.wagesSalaryRatioTarget}"`,
      `"${s.budgetFinance}"`,
      `"${s.salesTgt2026}"`,
      `"${s.averageMppSalary}"`,
      s.mppExisting,
      s.mppRecommendation,
      s.reduceNumber,
      `"${s.prodMpp}"`,
      `"${s.newProdMppTarget}"`,
      `"${s.costEfficiency}"`,
      s.currentSqmCoverageMpp,
      s.newSqmCoverageMpp,
      `"${(s.remarks || '').replace(/"/g, '""')}"`,
      `"${s.pic}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `CB_MPP_Optimization_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      
      {/* ========================================================
          A. HEADER
         ======================================================== */}
      <header className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${
                isLiveData
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-amber-50 text-amber-700 border-amber-200'
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  isLiveData ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
                }`}
              />
              {isLiveData ? 'LIVE DATA' : 'DEMO DATA'}
            </span>

            <span className="text-xs text-slate-500 font-medium">
              Data Source: <strong className="text-slate-800">{isLiveData ? 'Google Sheets API' : 'AZKO Retail Master Dataset'}</strong>
            </span>

            <span className="text-slate-300" aria-hidden="true">&bull;</span>

            <span className="text-xs text-slate-500 font-medium">
              Last Data Update: <strong className="text-slate-800">{lastUpdated || 'Loaded'}</strong>
            </span>
          </div>

          <h1 className="text-2xl font-black text-slate-900 mt-2 tracking-tight">
            C&amp;B | MPP Optimization Dashboard
          </h1>
          <p className="text-xs text-slate-500 mt-0.5 font-medium">
            Manpower Planning &amp; Cost Efficiency Monitoring &bull; Operations &amp; Human Capital
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
          <button
            onClick={fetchData}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors disabled:opacity-50"
            title="Refresh dataset"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-[#C8102E]' : ''}`} />
            <span>Refresh Data</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors shadow-2xs"
            title="Download CSV report"
          >
            <Download className="w-3.5 h-3.5 text-slate-600" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => setIsConfigOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-[#C8102E] hover:bg-[#A00C22] text-white rounded-xl text-xs font-bold transition-colors shadow-xs"
            title="Configure Google Sheets Web App URL"
          >
            <Settings2 className="w-3.5 h-3.5" />
            <span>Google Sheets Config</span>
          </button>
        </div>
      </header>

      {/* Warning Alert if live connection failed */}
      {loaderError && (
        <div className="bg-amber-50 border border-amber-200 text-amber-900 p-4 rounded-xl text-xs flex items-start gap-3">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <span className="font-bold block">Notice: Running in Demo Dataset Mode</span>
            <p className="mt-0.5 leading-relaxed">{loaderError}</p>
            {missingColumns && missingColumns.length > 0 && (
              <div className="mt-2 text-[11px] bg-white/80 p-2.5 rounded-lg border border-amber-200">
                <span className="font-bold text-amber-800 block">Missing Columns in Sheet:</span>
                <span className="font-mono text-amber-700">{missingColumns.join(', ')}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================
          B. FILTER PANEL
         ======================================================== */}
      <section className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-red-50 text-[#C8102E] rounded-lg">
              <Filter className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Interactive Filter Panel
              </h2>
              <p className="text-xs text-slate-500">
                Refine analytics across organizational, geographic, and manpower dimensions
              </p>
            </div>
          </div>

          {activeFilterChips.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold px-2.5 py-1 bg-red-50 text-[#C8102E] rounded-md border border-red-100">
                {activeFilterChips.length} filter aktif
              </span>
              <button
                onClick={resetFilters}
                className="flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-[#C8102E] bg-slate-100 hover:bg-slate-200 px-2.5 py-1 rounded-md transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Filter</span>
              </button>
            </div>
          )}
        </div>

        {/* Filter Select Controls Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-9 gap-3 mt-3">
          <FilterSelect
            label="GM"
            value={filters.gm}
            onChange={(v) => updateFilter('gm', v)}
            options={dynamicOptions.gms}
            placeholder="Semua GM"
          />
          <FilterSelect
            label="AM"
            value={filters.am}
            onChange={(v) => updateFilter('am', v)}
            options={dynamicOptions.ams}
            placeholder="Semua AM"
          />
          <FilterSelect
            label="Territory"
            value={filters.territory}
            onChange={(v) => updateFilter('territory', v)}
            options={dynamicOptions.territories}
            placeholder="Semua Teritori"
          />
          <FilterSelect
            label="Provinsi"
            value={filters.province}
            onChange={(v) => updateFilter('province', v)}
            options={dynamicOptions.provinces}
            placeholder="Semua Provinsi"
          />
          <FilterSelect
            label="Kota"
            value={filters.city}
            onChange={(v) => updateFilter('city', v)}
            options={dynamicOptions.cities}
            placeholder="Semua Kota"
          />
          <FilterSelect
            label="Store Status"
            value={filters.storeStatus}
            onChange={(v) => updateFilter('storeStatus', v)}
            options={dynamicOptions.storeStatuses}
            placeholder="Semua Tipe"
          />
          <FilterSelect
            label="Status MPP"
            value={filters.status}
            onChange={(v) => updateFilter('status', v)}
            options={dynamicOptions.statuses}
            placeholder="Semua Status"
          />
          <FilterSelect
            label="Store Size"
            value={filters.size}
            onChange={(v) => updateFilter('size', v)}
            options={dynamicOptions.sizes}
            placeholder="Semua Ukuran"
          />
          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
              Search Store
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="Name, code, PIC..."
                value={filters.search}
                onChange={(e) => updateFilter('search', e.target.value)}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg pl-8 pr-2.5 py-1.5 focus:bg-white focus:border-[#C8102E] focus:outline-hidden font-medium text-slate-800"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            </div>
          </div>
        </div>

        {/* Active Filter Chips */}
        {activeFilterChips.length > 0 && (
          <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-100 flex-wrap text-xs">
            <span className="text-slate-400 font-semibold text-[11px]">Active Filters:</span>
            {activeFilterChips.map((chip) => (
              <span
                key={chip.key}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-800 font-medium text-[11px] border border-slate-200"
              >
                <span className="text-slate-500 font-normal">{chip.label}:</span>
                <strong className="text-slate-900">{chip.value}</strong>
                <button
                  onClick={() => updateFilter(chip.key, '')}
                  className="p-0.5 hover:bg-slate-200 rounded text-slate-500 hover:text-slate-900 transition-colors"
                  title={`Remove ${chip.label} filter`}
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
            <button
              onClick={resetFilters}
              className="text-[11px] font-bold text-[#C8102E] hover:underline ml-2"
            >
              Clear All Filters
            </button>
          </div>
        )}
      </section>

      {/* ========================================================
          C. EXECUTIVE KPI CARDS (10 metrics)
         ======================================================== */}
      <CBExecutiveKPIs stores={filteredStores} />

      {/* ========================================================
          17. EXECUTIVE INSIGHTS
         ======================================================== */}
      <CBInsights stores={filteredStores} />

      {/* ========================================================
          4. MANPOWER STATUS OVERVIEW
         ======================================================== */}
      <CBManpowerStatus
        stores={filteredStores}
        activeStatusFilter={filters.status}
        onSelectStatus={(st) => updateFilter('status', st)}
      />

      {/* ========================================================
          MPP EXISTING MONTHLY TREND
         ======================================================== */}
      <CBMonthlyTrend stores={filteredStores} />

      {/* ========================================================
          5. MPP OPTIMIZATION (Existing vs Recommendation)
         ======================================================== */}
      <CBMPPOptimization
        stores={filteredStores}
        onSelectStore={setSelectedStore}
      />

      {/* ========================================================
          6. COST EFFICIENCY ANALYSIS
         ======================================================== */}
      <CBCostEfficiency
        stores={filteredStores}
        onSelectStore={setSelectedStore}
      />

      {/* ========================================================
          7. PRODUCTIVITY ANALYSIS
         ======================================================== */}
      <CBProductivityAnalysis
        stores={filteredStores}
        onSelectStore={setSelectedStore}
      />

      {/* ========================================================
          8. WAGES SALARY RATIO VS FINANCE BUDGET
         ======================================================== */}
      <CBWagesBudgetAnalysis stores={filteredStores} />

      {/* ========================================================
          9. TERRITORY PERFORMANCE ANALYSIS
         ======================================================== */}
      <CBTerritoryAnalysis
        stores={filteredStores}
        selectedTerritory={filters.territory}
        onSelectTerritory={(terr) => updateFilter('territory', terr)}
      />

      {/* ========================================================
          10. STORE DETAIL TABLE
         ======================================================== */}
      <CBStoreTable
        stores={filteredStores}
        onSelectStore={setSelectedStore}
        onExportCSV={handleExportCSV}
      />

      {/* ========================================================
          11 & 12. MODALS (Sheets Config & Store Detail)
         ======================================================== */}
      <CBSheetsConfigModal
        isOpen={isConfigOpen}
        onClose={() => setIsConfigOpen(false)}
        onDataRefreshed={fetchData}
        isLiveData={isLiveData}
        lastUpdated={lastUpdated}
      />

      <CBStoreDetailModal
        store={selectedStore}
        onClose={() => setSelectedStore(null)}
      />

    </div>
  );
};
