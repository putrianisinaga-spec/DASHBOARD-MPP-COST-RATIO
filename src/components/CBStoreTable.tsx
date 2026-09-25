import React, { useState, useMemo } from 'react';
import { CBStoreRecord } from '../types';
import {
  Search,
  ArrowUpDown,
  Download,
  Eye,
  ChevronLeft,
  ChevronRight,
  Filter,
} from 'lucide-react';

interface CBStoreTableProps {
  stores: CBStoreRecord[];
  onSelectStore: (store: CBStoreRecord) => void;
  onExportCSV: () => void;
}

export const CBStoreTable: React.FC<CBStoreTableProps> = ({
  stores,
  onSelectStore,
  onExportCSV,
}) => {
  const [search, setSearch] = useState<string>('');
  const [sortField, setSortField] = useState<keyof CBStoreRecord>('storeName');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);

  // Filter stores based on internal table search
  const filtered = useMemo(() => {
    if (!search.trim()) return stores;
    const q = search.toLowerCase().trim();
    return stores.filter((s) => {
      return (
        s.storeName.toLowerCase().includes(q) ||
        s.kode.toLowerCase().includes(q) ||
        s.gm.toLowerCase().includes(q) ||
        s.am.toLowerCase().includes(q) ||
        s.city.toLowerCase().includes(q) ||
        s.province.toLowerCase().includes(q) ||
        s.territory.toLowerCase().includes(q) ||
        s.pic.toLowerCase().includes(q) ||
        s.status.toLowerCase().includes(q) ||
        s.remarks.toLowerCase().includes(q)
      );
    });
  }, [stores, search]);

  // Sort
  const sorted = useMemo(() => {
    const list = [...filtered];
    list.sort((a, b) => {
      const valA = a[sortField];
      const valB = b[sortField];
      if (typeof valA === 'number' && typeof valB === 'number') {
        return sortDir === 'asc' ? valA - valB : valB - valA;
      }
      return sortDir === 'asc'
        ? String(valA || '').localeCompare(String(valB || ''))
        : String(valB || '').localeCompare(String(valA || ''));
    });
    return list;
  }, [filtered, sortField, sortDir]);

  const totalPages = Math.ceil(sorted.length / pageSize) || 1;
  const paginated = useMemo(() => {
    const start = (page - 1) * pageSize;
    return sorted.slice(start, start + pageSize);
  }, [sorted, page, pageSize]);

  const handleSort = (field: keyof CBStoreRecord) => {
    if (sortField === field) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir('asc');
    }
  };

  const renderSortIndicator = (field: keyof CBStoreRecord) => {
    return (
      <ArrowUpDown
        className={`w-3 h-3 ml-1 inline ${
          sortField === field ? 'text-slate-900 font-bold' : 'text-slate-400 opacity-60'
        }`}
      />
    );
  };

  return (
    <section className="bg-white rounded-xl border border-slate-200/90 shadow-xs overflow-hidden">
      
      {/* Table Header Controls */}
      <div className="p-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-slate-900">
            Store Performance &amp; Manpower Master Table
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Showing <strong className="text-slate-800">{filtered.length}</strong> stores &bull; Click any row to view complete store details
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative">
            <input
              type="text"
              placeholder="Search code, name, city, PIC..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="text-xs bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-slate-800 w-64 focus:bg-white focus:border-[#C8102E] focus:outline-hidden font-medium"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          </div>

          <div className="flex items-center gap-1.5 text-xs text-slate-600">
            <span>Rows:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setPage(1);
              }}
              className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 font-medium"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </div>

          <button
            onClick={onExportCSV}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors shadow-2xs"
          >
            <Download className="w-3.5 h-3.5 text-slate-600" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Responsive Horizontal Scroll Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs whitespace-nowrap">
          <thead className="bg-slate-50/90 text-slate-600 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200 sticky top-0 z-10">
            <tr>
              <th
                onClick={() => handleSort('kode')}
                className="px-4 py-3 cursor-pointer hover:text-slate-900"
              >
                Kode {renderSortIndicator('kode')}
              </th>
              <th
                onClick={() => handleSort('storeName')}
                className="px-4 py-3 cursor-pointer hover:text-slate-900 min-w-[200px]"
              >
                Store Name {renderSortIndicator('storeName')}
              </th>
              <th className="px-3 py-3">GM / AM</th>
              <th
                onClick={() => handleSort('territory')}
                className="px-3 py-3 cursor-pointer hover:text-slate-900"
              >
                Territory {renderSortIndicator('territory')}
              </th>
              <th className="px-3 py-3">Province / City</th>
              <th className="px-3 py-3">Size</th>
              <th
                onClick={() => handleSort('sqm')}
                className="px-3 py-3 text-right cursor-pointer hover:text-slate-900"
              >
                SQM {renderSortIndicator('sqm')}
              </th>
              <th
                onClick={() => handleSort('status')}
                className="px-3 py-3 text-center cursor-pointer hover:text-slate-900"
              >
                Status {renderSortIndicator('status')}
              </th>
              <th
                onClick={() => handleSort('mppExisting')}
                className="px-3 py-3 text-right cursor-pointer hover:text-slate-900"
              >
                Existing MPP {renderSortIndicator('mppExisting')}
              </th>
              <th
                onClick={() => handleSort('mppRecommendation')}
                className="px-3 py-3 text-right cursor-pointer hover:text-slate-900"
              >
                Rec. MPP {renderSortIndicator('mppRecommendation')}
              </th>
              <th
                onClick={() => handleSort('reduceNumber')}
                className="px-3 py-3 text-right cursor-pointer hover:text-slate-900"
              >
                Reduce No {renderSortIndicator('reduceNumber')}
              </th>
              <th className="px-3 py-3 text-right">Wages Target</th>
              <th className="px-3 py-3 text-right">Budget Finance</th>
              <th className="px-3 py-3 text-right">Sales Tgt 2026</th>
              <th className="px-3 py-3 text-right">Avg MPP Salary</th>
              <th className="px-3 py-3 text-right">Prod MPP</th>
              <th className="px-3 py-3 text-right">New Prod Target</th>
              <th
                onClick={() => handleSort('costEfficiencyNum')}
                className="px-3 py-3 text-right cursor-pointer hover:text-slate-900"
              >
                Cost Eff. {renderSortIndicator('costEfficiencyNum')}
              </th>
              <th className="px-3 py-3 text-right">SQM Cov (Ext &rarr; New)</th>
              <th className="px-4 py-3 min-w-[150px]">Remarks</th>
              <th className="px-3 py-3">PIC</th>
              <th className="px-4 py-3 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {paginated.length > 0 ? (
              paginated.map((store) => {
                const isOver = store.status.toLowerCase().includes('over');
                const isUnder = store.status.toLowerCase().includes('under');
                const badgeClass = isOver
                  ? 'bg-rose-50 text-rose-700 border-rose-200'
                  : isUnder
                  ? 'bg-amber-50 text-amber-700 border-amber-200'
                  : 'bg-emerald-50 text-emerald-700 border-emerald-200';

                const isBudgetOverTarget =
                  store.budgetFinanceNum > store.wagesSalaryRatioTargetNum;

                return (
                  <tr
                    key={store.kode}
                    onClick={() => onSelectStore(store)}
                    className="hover:bg-slate-50 cursor-pointer transition-colors"
                  >
                    <td className="px-4 py-3 font-mono font-bold text-slate-900">
                      {store.kode}
                    </td>
                    <td className="px-4 py-3 font-bold text-slate-900">
                      {store.storeName}
                    </td>
                    <td className="px-3 py-3 text-[11px] text-slate-600">
                      {store.gm} &bull; {store.am}
                    </td>
                    <td className="px-3 py-3 font-medium text-slate-800">
                      {store.territory}
                    </td>
                    <td className="px-3 py-3 text-[11px] text-slate-600">
                      {store.city}, {store.province}
                    </td>
                    <td className="px-3 py-3 text-slate-700">
                      Size {store.size}
                    </td>
                    <td className="px-3 py-3 text-right tabular-nums text-slate-800">
                      {store.sqm.toLocaleString()}
                    </td>
                    <td className="px-3 py-3 text-center">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${badgeClass}`}>
                        {store.status}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-right font-bold text-slate-900 tabular-nums">
                      {store.mppExisting}
                    </td>
                    <td className="px-3 py-3 text-right font-bold text-purple-900 tabular-nums">
                      {store.mppRecommendation}
                    </td>
                    <td className="px-3 py-3 text-right font-black tabular-nums">
                      <span
                        className={
                          store.reduceNumber < 0
                            ? 'text-rose-700'
                            : store.reduceNumber > 0
                            ? 'text-amber-800'
                            : 'text-emerald-700'
                        }
                      >
                        {store.reduceNumber > 0 ? `+${store.reduceNumber}` : store.reduceNumber}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-right tabular-nums text-slate-600">
                      {store.wagesSalaryRatioTarget}
                    </td>
                    <td className="px-3 py-3 text-right tabular-nums">
                      <span
                        className={
                          isBudgetOverTarget
                            ? 'text-rose-700 font-bold bg-rose-50 px-1.5 py-0.5 rounded'
                            : 'text-slate-800'
                        }
                      >
                        {store.budgetFinance}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-right tabular-nums text-slate-800">
                      {store.salesTgt2026}
                    </td>
                    <td className="px-3 py-3 text-right tabular-nums text-slate-600">
                      {store.averageMppSalary}
                    </td>
                    <td className="px-3 py-3 text-right tabular-nums text-slate-800">
                      {store.prodMpp}
                    </td>
                    <td className="px-3 py-3 text-right tabular-nums font-bold text-purple-900">
                      {store.newProdMppTarget}
                    </td>
                    <td className="px-3 py-3 text-right tabular-nums font-bold">
                      <span
                        className={
                          store.costEfficiencyNum > 0
                            ? 'text-emerald-700'
                            : store.costEfficiencyNum < 0
                            ? 'text-rose-700'
                            : 'text-slate-600'
                        }
                      >
                        {store.costEfficiency}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-right tabular-nums text-[11px] text-slate-600">
                      {store.currentSqmCoverageMpp} &rarr; {store.newSqmCoverageMpp} m²
                    </td>
                    <td className="px-4 py-3 text-[11px] text-slate-600 truncate max-w-xs">
                      {store.remarks}
                    </td>
                    <td className="px-3 py-3 text-slate-700 text-[11px] font-medium">
                      {store.pic}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectStore(store);
                        }}
                        className="p-1.5 hover:bg-slate-200 text-slate-600 hover:text-slate-900 rounded-lg transition-colors"
                        title="View store detail modal"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={22} className="px-6 py-12 text-center text-slate-400">
                  No stores match the active filter or search criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Bar */}
      <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
        <div>
          Showing page <strong className="text-slate-800">{page}</strong> of <strong className="text-slate-800">{totalPages}</strong> ({sorted.length} total filtered stores)
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-30 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="font-bold text-slate-800 px-2">{page}</span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-30 transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

    </section>
  );
};
