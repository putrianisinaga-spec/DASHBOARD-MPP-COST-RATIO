import React, { useState, useEffect } from 'react';
import {
  X,
  FileSpreadsheet,
  Link,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  HelpCircle,
  RotateCcw,
} from 'lucide-react';
import {
  getCBApiUrl,
  saveCBApiUrl,
  clearCBApiUrl,
  loadCBGoogleSheetData,
  CB_REQUIRED_COLUMNS,
} from '../data/cbGoogleSheetsLoader';

interface CBSheetsConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDataRefreshed: () => void;
  isLiveData: boolean;
  lastUpdated: string;
}

export const CBSheetsConfigModal: React.FC<CBSheetsConfigModalProps> = ({
  isOpen,
  onClose,
  onDataRefreshed,
  isLiveData,
  lastUpdated,
}) => {
  const [apiUrl, setApiUrl] = useState('');
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
    count?: number;
    missingColumns?: string[];
  } | null>(null);

  useEffect(() => {
    if (isOpen) {
      setApiUrl(getCBApiUrl());
      setTestResult(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleTestAndSave = async () => {
    setIsTesting(true);
    setTestResult(null);

    const trimmed = apiUrl.trim();
    saveCBApiUrl(trimmed);

    try {
      const result = await loadCBGoogleSheetData();
      if (result.isLiveData) {
        setTestResult({
          success: true,
          message: `Connection successful! Loaded ${result.data.length} C&B store records from live sheet.`,
          count: result.data.length,
        });
        onDataRefreshed();
      } else if (result.error) {
        setTestResult({
          success: false,
          message: result.error,
          missingColumns: result.missingColumns,
        });
      } else {
        setTestResult({
          success: true,
          message: 'Saved in Demo Mode (No URL specified).',
        });
        onDataRefreshed();
      }
    } catch (e: any) {
      setTestResult({
        success: false,
        message: `Connection failed: ${e.message || 'Check Apps Script Web App permissions and CORS'}`,
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleResetToDemo = () => {
    clearCBApiUrl();
    setApiUrl('');
    setTestResult({
      success: true,
      message: 'Reset to default C&B Demo Dataset.',
    });
    onDataRefreshed();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-xl overflow-hidden animate-in fade-in duration-200">
        
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-xl border border-emerald-500/30">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Google Sheets / API Configuration</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Connect live C&amp;B dataset via Google Apps Script Web App
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          
          {/* Current Status Indicator */}
          <div className="p-3.5 rounded-xl border flex items-center justify-between bg-slate-50 border-slate-200">
            <div className="flex items-center gap-2.5">
              <div
                className={`w-3 h-3 rounded-full ${
                  isLiveData ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
                }`}
              />
              <div>
                <span className="text-xs font-bold text-slate-800">
                  {isLiveData ? 'Active Live Connection' : 'Demo Dataset Mode'}
                </span>
                <span className="text-[11px] text-slate-500 block">
                  Last Updated: {lastUpdated || 'Not yet synced'}
                </span>
              </div>
            </div>
            <span
              className={`px-2.5 py-1 text-[11px] font-bold rounded-lg border ${
                isLiveData
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-amber-50 text-amber-700 border-amber-200'
              }`}
            >
              {isLiveData ? 'LIVE DATA' : 'DEMO DATA — C&B'}
            </span>
          </div>

          {/* Endpoint Input */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Google Apps Script Web App URL (<code className="text-[#C8102E] font-mono">CB_API_URL</code>)
            </label>
            <div className="relative">
              <input
                type="url"
                placeholder="https://script.google.com/macros/s/.../exec"
                value={apiUrl}
                onChange={(e) => setApiUrl(e.target.value)}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2.5 text-slate-800 font-mono focus:bg-white focus:border-[#C8102E] focus:outline-hidden"
              />
              <Link className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Deploy your Google Sheet with Apps Script as a Web App (Execute as: <em>Me</em>, Who has access: <em>Anyone</em>). When fetched, it returns store objects matching the 34 standard C&amp;B columns.
            </p>
          </div>

          {/* Test & Save Result */}
          {testResult && (
            <div
              className={`p-3.5 rounded-xl border text-xs flex items-start gap-2.5 ${
                testResult.success
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                  : 'bg-rose-50 border-rose-200 text-rose-900'
              }`}
            >
              {testResult.success ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              )}
              <div className="flex-1 min-w-0">
                <span className="font-bold block">
                  {testResult.success ? 'Connection Validated' : 'Connection Warning'}
                </span>
                <p className="mt-0.5 leading-relaxed">{testResult.message}</p>
                {testResult.missingColumns && testResult.missingColumns.length > 0 && (
                  <div className="mt-2 text-[11px] bg-white/80 p-2.5 rounded-lg border border-rose-200">
                    <span className="font-bold text-rose-800 block">Missing Columns:</span>
                    <span className="font-mono text-rose-700">{testResult.missingColumns.join(', ')}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Column Schema Guide */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
            <div className="flex items-center gap-1.5 text-slate-800 font-bold">
              <HelpCircle className="w-4 h-4 text-blue-600" />
              <span>34 Standard C&amp;B Sheet Columns</span>
            </div>
            <p className="text-[11px] text-slate-600">
              The loader automatically parses numbers, currencies, percentages, and handles common column aliases:
            </p>
            <div className="max-h-28 overflow-y-auto bg-white p-2.5 rounded-lg border border-slate-200 text-[10px] font-mono text-slate-700 grid grid-cols-2 gap-1">
              {CB_REQUIRED_COLUMNS.map((col, idx) => (
                <div key={col} className="truncate">
                  {idx + 1}. {col}
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="bg-slate-50 border-t border-slate-200 p-4 flex items-center justify-between">
          <button
            onClick={handleResetToDemo}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 px-3 py-2 rounded-xl transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset to Demo Data</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="text-xs font-semibold text-slate-600 hover:text-slate-900 px-4 py-2 rounded-xl transition-colors"
            >
              Close
            </button>
            <button
              onClick={handleTestAndSave}
              disabled={isTesting}
              className="flex items-center gap-1.5 text-xs font-bold text-white bg-[#C8102E] hover:bg-[#A00C22] px-4 py-2 rounded-xl shadow-xs transition-colors disabled:opacity-50"
            >
              {isTesting ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Connecting...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                  <span>Save &amp; Fetch</span>
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
