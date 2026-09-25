import { CBStoreRecord } from '../types';
import { DEMO_CB_STORES } from './cbDummyData';

export interface CBLoaderResult {
  data: CBStoreRecord[];
  isLiveData: boolean;
  statusMessage: string;
  lastUpdated: string;
  error?: string;
  missingColumns?: string[];
  totalRecords: number;
}

export const CB_REQUIRED_COLUMNS: string[] = [
  'GM',
  'AM',
  'Kode',
  'Store Name',
  'Status',
  'Sub BU',
  'Teritorry',
  'Province',
  'City',
  'Size',
  'SQM',
  'Wages Salary Ratio Target',
  'Budget Finance',
  'Sales Tgt 2026',
  'Average MPP Salary based on Finance Budget',
  'MPP Existing',
  'Prod MPP',
  'Monthly Sales Budget Average',
  'Wages Salary Budget Finance',
  'Sales Scale',
  'SQM Productivity',
  'Salary Target New Prod MPP',
  'MPP Recommendation',
  'Existing Per 31 Mei',
  'status',
  'Reduce Number',
  'Prod Mpp Increase Target in %',
  'New Prod MPP Target',
  'Remarks',
  'PIC',
  'Current SQM Coverage MPP',
  'New SQM Coverage MPP',
  'Cost Efficiency',
  'Productivity M2 to be',
];

const LOCAL_STORAGE_URL_KEY = 'azko_cb_api_url';
const LOCAL_STORAGE_CACHE_KEY = 'azko_cb_sheet_data';
const LOCAL_STORAGE_TIMESTAMP_KEY = 'azko_cb_last_updated';

export const getCBApiUrl = (): string => {
  try {
    const saved = localStorage.getItem(LOCAL_STORAGE_URL_KEY);
    if (saved && saved.trim()) return saved.trim();
  } catch (e) {}

  if (typeof process !== 'undefined' && process.env && process.env.CB_API_URL) {
    return process.env.CB_API_URL.trim();
  }
  try {
    // Vite client env support
    if (typeof import.meta !== 'undefined' && (import.meta as any).env && (import.meta as any).env.VITE_CB_API_URL) {
      return (import.meta as any).env.VITE_CB_API_URL.trim();
    }
  } catch (e) {}

  return '';
};

export const saveCBApiUrl = (url: string): void => {
  try {
    localStorage.setItem(LOCAL_STORAGE_URL_KEY, url.trim());
  } catch (e) {
    console.error('Failed to save CB API URL to localStorage', e);
  }
};

export const clearCBApiUrl = (): void => {
  try {
    localStorage.removeItem(LOCAL_STORAGE_URL_KEY);
    localStorage.removeItem(LOCAL_STORAGE_CACHE_KEY);
    localStorage.removeItem(LOCAL_STORAGE_TIMESTAMP_KEY);
  } catch (e) {}
};

// Helper to normalize column keys for comparison
const cleanKey = (k: string): string => {
  return k.toLowerCase().replace(/[^a-z0-9]/g, '');
};

// Robust parser for percentage, currency, billions, millions, and numbers
export const parseNumberWithUnit = (val: any, fallback = 0): { num: number; formatted: string } => {
  if (val === null || val === undefined || val === '') {
    return { num: fallback, formatted: String(fallback) };
  }
  const str = String(val).trim();

  // If already a pure number
  if (typeof val === 'number') {
    return { num: val, formatted: String(val) };
  }

  // Handle percentages like "11.40%" or "17%"
  if (str.endsWith('%')) {
    const cleaned = str.replace('%', '').trim().replace(',', '.');
    const n = parseFloat(cleaned);
    return { num: isNaN(n) ? fallback : n, formatted: str };
  }

  // Handle Billions like "Rp158.9B" or "158.9B" or "158,9B"
  if (str.toUpperCase().includes('B')) {
    const cleaned = str
      .replace(/rp/gi, '')
      .replace(/b/gi, '')
      .replace(/\s+/g, '')
      .replace(',', '.');
    const n = parseFloat(cleaned);
    return { num: isNaN(n) ? fallback : n, formatted: str };
  }

  // Handle Millions like "Rp8.2M" or "8.2M" or "8,2M"
  if (str.toUpperCase().includes('M') && !str.toUpperCase().includes('MEI')) {
    const cleaned = str
      .replace(/rp/gi, '')
      .replace(/m/gi, '')
      .replace(/\s+/g, '')
      .replace(',', '.');
    const n = parseFloat(cleaned);
    return { num: isNaN(n) ? fallback : n, formatted: str };
  }

  // Standard numeric string (handling currency prefix Rp and thousand separators)
  const cleanedNum = str
    .replace(/rp/gi, '')
    .replace(/\s+/g, '')
    .replace(/\.(?=\d{3}(?:\.|$))/g, '') // remove thousand dot
    .replace(',', '.');
  const n = parseFloat(cleanedNum);
  return { num: isNaN(n) ? fallback : n, formatted: str };
};

export const normalizeCBRecord = (raw: any, index: number): CBStoreRecord => {
  const keyMap: Record<string, any> = {};
  for (const k of Object.keys(raw)) {
    keyMap[cleanKey(k)] = raw[k];
  }

  const getVal = (aliases: string[], fallback: any = ''): any => {
    for (const alias of aliases) {
      const cleaned = cleanKey(alias);
      if (cleaned in keyMap && keyMap[cleaned] !== undefined && keyMap[cleaned] !== null) {
        const val = keyMap[cleaned];
        if (typeof val === 'string' && val.trim() === '') continue;
        return val;
      }
    }
    return fallback;
  };

  const parseStr = (val: any, fallback = ''): string => {
    if (val === null || val === undefined) return fallback;
    return String(val).trim();
  };

  const gm = parseStr(getVal(['GM', 'gm', 'general_manager', 'gm_ops'], 'GM Ops 1'));
  const am = parseStr(getVal(['AM', 'am', 'area_manager'], 'AM 01'));
  const kode = parseStr(getVal(['Kode', 'kode', 'store_code', 'storeCode', 'site_id'], `A${300 + index}`));
  const storeName = parseStr(getVal(['Store Name', 'storeName', 'store_name', 'store'], `ST AZKO ${kode}`));
  const storeStatus = parseStr(getVal(['Status', 'storeStatus', 'store_status'], 'SSG'));
  const subBu = parseStr(getVal(['Sub BU', 'subBu', 'sub_bu'], 'AZKO'));
  const territory = parseStr(getVal(['Teritorry', 'Territory', 'territory', 'zone'], 'JABODETABEK'));
  const province = parseStr(getVal(['Province', 'province'], 'DKI JAKARTA'));
  const city = parseStr(getVal(['City', 'city'], 'JAKARTA'));
  const size = getVal(['Size', 'size'], 4);
  const sqmParsed = parseNumberWithUnit(getVal(['SQM', 'sqm', 'luas_sqm'], 4000));
  const sqm = sqmParsed.num;

  const wagesRatioParsed = parseNumberWithUnit(getVal(['Wages Salary Ratio Target', 'wagesSalaryRatioTarget', 'wages_ratio_target'], '10.50%'));
  const budgetFinanceParsed = parseNumberWithUnit(getVal(['Budget Finance', 'budgetFinance', 'budget_finance'], '11.00%'));

  const salesTgtParsed = parseNumberWithUnit(getVal(['Sales Tgt 2026', 'salesTgt2026', 'sales_tgt_2026'], 'Rp100.0B'));
  const avgMppSalaryParsed = parseNumberWithUnit(getVal(['Average MPP Salary based on Finance Budget', 'averageMppSalary', 'avg_mpp_salary'], 'Rp8.0M'));

  const mppExistingParsed = parseNumberWithUnit(getVal(['MPP Existing', 'mppExisting', 'mpp_existing'], 100));
  const prodMppParsed = parseNumberWithUnit(getVal(['Prod MPP', 'prodMpp', 'prod_mpp'], 'Rp85.0M'));

  const monthlySalesParsed = parseNumberWithUnit(getVal(['Monthly Sales Budget Average', 'monthlySalesBudgetAverage', 'monthly_sales_budget_avg'], 'Rp8.5B'));
  const wagesSalaryBudgetParsed = parseNumberWithUnit(getVal(['Wages Salary Budget Finance', 'wagesSalaryBudgetFinance', 'wages_salary_budget_finance'], 'Rp11.0B'));

  const salesScale = parseStr(getVal(['Sales Scale', 'salesScale', 'sales_scale'], 'Rp8B–9B'));
  const sqmProdParsed = parseNumberWithUnit(getVal(['SQM Productivity', 'sqmProductivity', 'sqm_productivity'], 'Rp1.7M'));

  const salaryTargetNewProdMpp = parseStr(getVal(['Salary Target New Prod MPP', 'salaryTargetNewProdMpp'], avgMppSalaryParsed.formatted));
  const mppRecParsed = parseNumberWithUnit(getVal(['MPP Recommendation', 'mppRecommendation', 'mpp_recommendation'], mppExistingParsed.num));
  const existingPer31MeiParsed = parseNumberWithUnit(getVal(['Existing Per 31 Mei', 'existingPer31Mei', 'existing_per_31_mei'], mppExistingParsed.num));

  // Determine staffing status objectively if missing
  const defaultStatus = mppRecParsed.num < mppExistingParsed.num ? 'Overstaffed' : mppRecParsed.num > mppExistingParsed.num ? 'Understaffed' : 'Optimal';
  const status = parseStr(getVal(['status', 'Status_MPP', 'mpp_status', 'staffing_status'], defaultStatus));
  const reduceNumberParsed = parseNumberWithUnit(getVal(['Reduce Number', 'reduceNumber', 'reduce_number'], mppRecParsed.num - mppExistingParsed.num));

  const prodMppIncParsed = parseNumberWithUnit(getVal(['Prod Mpp Increase Target in %', 'prodMppIncreaseTarget', 'prod_mpp_increase_target'], '0%'));
  const newProdMppParsed = parseNumberWithUnit(getVal(['New Prod MPP Target', 'newProdMppTarget', 'new_prod_mpp_target'], prodMppParsed.formatted));

  const remarks = parseStr(getVal(['Remarks', 'remarks', 'note'], 'Standard operational review'));
  const pic = parseStr(getVal(['PIC', 'pic', 'hcbp_pic'], 'HCBP Team'));

  const currentSqmCovParsed = parseNumberWithUnit(getVal(['Current SQM Coverage MPP', 'currentSqmCoverageMpp', 'current_sqm_coverage'], sqm / Math.max(1, mppExistingParsed.num)));
  const newSqmCovParsed = parseNumberWithUnit(getVal(['New SQM Coverage MPP', 'newSqmCoverageMpp', 'new_sqm_coverage'], sqm / Math.max(1, mppRecParsed.num)));

  const costEffParsed = parseNumberWithUnit(getVal(['Cost Efficiency', 'costEfficiency', 'cost_efficiency'], '0%'));
  const prodM2Parsed = parseNumberWithUnit(getVal(['Productivity M2 to be', 'productivityM2ToBe', 'productivity_m2_to_be'], Math.round(newSqmCovParsed.num)));

  // Extract optional monthly MPP history if provided in sheet or raw object
  const monthlyMppHistory: Record<string, number> = {};
  const monthNames = ['jan', 'feb', 'mar', 'apr', 'mei', 'may', 'jun', 'jul', 'aug', 'agu', 'sep', 'okt', 'oct', 'nov', 'des', 'dec'];
  for (const k of Object.keys(raw)) {
    const ck = cleanKey(k);
    for (const m of monthNames) {
      if (ck === `mpp${m}` || ck === `mppexisting${m}` || ck === `existing${m}`) {
        const parsed = parseNumberWithUnit(raw[k], 0);
        if (parsed.num > 0) {
          const capitalized = m.charAt(0).toUpperCase() + m.slice(1);
          monthlyMppHistory[capitalized] = Math.round(parsed.num);
        }
      }
    }
  }
  if (raw.monthlyMppHistory && typeof raw.monthlyMppHistory === 'object') {
    Object.assign(monthlyMppHistory, raw.monthlyMppHistory);
  }

  return {
    gm,
    am,
    kode,
    storeName,
    storeStatus,
    subBu,
    territory,
    province,
    city,
    size,
    sqm,
    wagesSalaryRatioTarget: wagesRatioParsed.formatted,
    wagesSalaryRatioTargetNum: wagesRatioParsed.num,
    budgetFinance: budgetFinanceParsed.formatted,
    budgetFinanceNum: budgetFinanceParsed.num,
    salesTgt2026: salesTgtParsed.formatted,
    salesTgt2026Num: salesTgtParsed.num,
    averageMppSalary: avgMppSalaryParsed.formatted,
    averageMppSalaryNum: avgMppSalaryParsed.num,
    mppExisting: Math.round(mppExistingParsed.num),
    prodMpp: prodMppParsed.formatted,
    prodMppNum: prodMppParsed.num,
    monthlySalesBudgetAverage: monthlySalesParsed.formatted,
    monthlySalesBudgetAverageNum: monthlySalesParsed.num,
    wagesSalaryBudgetFinance: wagesSalaryBudgetParsed.formatted,
    wagesSalaryBudgetFinanceNum: wagesSalaryBudgetParsed.num,
    salesScale,
    sqmProductivity: sqmProdParsed.formatted,
    sqmProductivityNum: sqmProdParsed.num,
    salaryTargetNewProdMpp,
    mppRecommendation: Math.round(mppRecParsed.num),
    existingPer31Mei: Math.round(existingPer31MeiParsed.num),
    status,
    reduceNumber: Math.round(reduceNumberParsed.num),
    prodMppIncreaseTarget: prodMppIncParsed.formatted,
    prodMppIncreaseTargetNum: prodMppIncParsed.num,
    newProdMppTarget: newProdMppParsed.formatted,
    newProdMppTargetNum: newProdMppParsed.num,
    remarks,
    pic,
    currentSqmCoverageMpp: parseFloat(currentSqmCovParsed.num.toFixed(2)),
    newSqmCoverageMpp: parseFloat(newSqmCovParsed.num.toFixed(2)),
    costEfficiency: costEffParsed.formatted,
    costEfficiencyNum: costEffParsed.num,
    productivityM2ToBe: Math.round(prodM2Parsed.num),
    monthlyMppHistory: Object.keys(monthlyMppHistory).length > 0 ? monthlyMppHistory : undefined,
  };
};

export const validateCBHeaders = (headers: string[]): { valid: boolean; missing: string[] } => {
  const normalizedIncoming = new Set(headers.map(cleanKey));
  const missing: string[] = [];

  for (const req of CB_REQUIRED_COLUMNS) {
    if (!normalizedIncoming.has(cleanKey(req))) {
      missing.push(req);
    }
  }

  return {
    valid: missing.length === 0,
    missing,
  };
};

export const loadCBGoogleSheetData = async (): Promise<CBLoaderResult> => {
  const apiUrl = getCBApiUrl();

  // If no URL configured, return DEMO DATA immediately
  if (!apiUrl) {
    return {
      data: DEMO_CB_STORES,
      isLiveData: false,
      statusMessage: 'DEMO DATA — C&B (No API URL configured)',
      lastUpdated: 'Demo Initialized',
      totalRecords: DEMO_CB_STORES.length,
    };
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12000);

    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        Accept: 'application/json, text/plain, */*',
      },
      mode: 'cors',
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const text = await response.text();
    let rawRecords: any[] = [];

    // Attempt JSON parse
    try {
      const json = JSON.parse(text);
      if (Array.isArray(json)) {
        rawRecords = json;
      } else if (json && Array.isArray(json.data)) {
        rawRecords = json.data;
      } else if (json && Array.isArray(json.records)) {
        rawRecords = json.records;
      } else {
        throw new Error('API JSON payload is missing an array of store records');
      }
    } catch (parseErr: any) {
      // Fallback CSV parser if plain CSV returned
      const lines = text.split('\n').filter((l) => l.trim().length > 0);
      if (lines.length > 1) {
        const headers = lines[0].split(',').map((h) => h.replace(/^["']|["']$/g, '').trim());
        rawRecords = lines.slice(1).map((line) => {
          const vals = line.split(',').map((v) => v.replace(/^["']|["']$/g, '').trim());
          const obj: Record<string, string> = {};
          headers.forEach((h, i) => {
            obj[h] = vals[i] || '';
          });
          return obj;
        });
      } else {
        throw new Error('Could not parse JSON or CSV response from C&B endpoint');
      }
    }

    if (rawRecords.length === 0) {
      throw new Error('The C&B API returned 0 records');
    }

    // Validate headers
    const sampleHeaders = Object.keys(rawRecords[0]);
    const validation = validateCBHeaders(sampleHeaders);

    if (!validation.valid) {
      return {
        data: DEMO_CB_STORES,
        isLiveData: false,
        statusMessage: `Validation Warning: ${validation.missing.length} columns missing in C&B sheet`,
        lastUpdated: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        error: `Unable to load live C&B data: Google Sheet is missing required columns. Displaying demo dataset.`,
        missingColumns: validation.missing,
        totalRecords: DEMO_CB_STORES.length,
      };
    }

    // Normalize all records
    const normalizedData = rawRecords.map((r, idx) => normalizeCBRecord(r, idx));

    const nowFormatted = new Date().toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    try {
      localStorage.setItem(LOCAL_STORAGE_CACHE_KEY, JSON.stringify(normalizedData));
      localStorage.setItem(LOCAL_STORAGE_TIMESTAMP_KEY, nowFormatted);
    } catch (e) {}

    return {
      data: normalizedData,
      isLiveData: true,
      statusMessage: `Live Google Sheet Active (${normalizedData.length} Stores Synced)`,
      lastUpdated: nowFormatted,
      totalRecords: normalizedData.length,
    };
  } catch (err: any) {
    console.error('Failed to load C&B live data:', err);

    return {
      data: DEMO_CB_STORES,
      isLiveData: false,
      statusMessage: 'Unable to load live C&B data — displaying DEMO dataset',
      lastUpdated: 'Fallback to Demo',
      error: `Live fetch failed: ${err.message || 'Connection error'}. Falling back to default C&B demo dataset.`,
      totalRecords: DEMO_CB_STORES.length,
    };
  }
};
