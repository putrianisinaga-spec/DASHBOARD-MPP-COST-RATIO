export interface CBFilters {
  gm: string;
  am: string;
  territory: string;
  province: string;
  city: string;
  store: string;
  storeStatus: string; // SSG, Non-SSG, etc.
  status: string; // Understaffed, Overstaffed, Optimal
  size: string;
  search: string;
}

/**
 * Exact 34 Fields for C&B / MPP Dataset
 */
export interface CBStoreRecord {
  gm: string; // "GM"
  am: string; // "AM"
  kode: string; // "Kode"
  storeName: string; // "Store Name"
  storeStatus: string; // "Status" (e.g. SSG, Non-SSG, New Store)
  subBu: string; // "Sub BU"
  territory: string; // "Teritorry"
  province: string; // "Province"
  city: string; // "City"
  size: number | string; // "Size"
  sqm: number; // "SQM"
  wagesSalaryRatioTarget: string; // "Wages Salary Ratio Target" (e.g. "11.40%")
  wagesSalaryRatioTargetNum: number; // e.g. 11.40
  budgetFinance: string; // "Budget Finance" (e.g. "11.40%")
  budgetFinanceNum: number; // e.g. 11.40
  salesTgt2026: string; // "Sales Tgt 2026" (e.g. "Rp158.9B")
  salesTgt2026Num: number; // in Billions IDR (e.g. 158.9)
  averageMppSalary: string; // "Average MPP Salary based on Finance Budget" (e.g. "Rp8.2M")
  averageMppSalaryNum: number; // in Millions IDR (e.g. 8.2)
  mppExisting: number; // "MPP Existing"
  prodMpp: string; // "Prod MPP" (e.g. "Rp82.8M")
  prodMppNum: number; // in Millions IDR (e.g. 82.8)
  monthlySalesBudgetAverage: string; // "Monthly Sales Budget Average" (e.g. "Rp13.2B")
  monthlySalesBudgetAverageNum: number; // in Billions IDR (e.g. 13.2)
  wagesSalaryBudgetFinance: string; // "Wages Salary Budget Finance" (e.g. "Rp18.1B")
  wagesSalaryBudgetFinanceNum: number; // in Billions IDR (e.g. 18.1)
  salesScale: string; // "Sales Scale" (e.g. "Rp13B–14B")
  sqmProductivity: string; // "SQM Productivity" (e.g. "Rp1.9M")
  sqmProductivityNum: number; // in Millions IDR (e.g. 1.9)
  salaryTargetNewProdMpp: string; // "Salary Target New Prod MPP"
  mppRecommendation: number; // "MPP Recommendation"
  existingPer31Mei: number; // "Existing Per 31 Mei"
  status: string; // "status" (e.g. "Understaffed", "Overstaffed", "Optimal")
  reduceNumber: number; // "Reduce Number" (negative for reduction, e.g. -18, 0, +6)
  prodMppIncreaseTarget: string; // "Prod Mpp Increase Target in %" (e.g. "0%", "17%")
  prodMppIncreaseTargetNum: number; // e.g. 0, 17
  newProdMppTarget: string; // "New Prod MPP Target" (e.g. "Rp82.8M", "Rp98.5M")
  newProdMppTargetNum: number; // in Millions IDR (e.g. 82.8, 98.5)
  remarks: string; // "Remarks"
  pic: string; // "PIC"
  currentSqmCoverageMpp: number; // "Current SQM Coverage MPP" (e.g. 42.9)
  newSqmCoverageMpp: number; // "New SQM Coverage MPP" (e.g. 42.94, 67.46)
  costEfficiency: string; // "Cost Efficiency" (e.g. "0%", "17.14%")
  costEfficiencyNum: number; // e.g. 0, 17.14
  productivityM2ToBe: number; // "Productivity M2 to be" (e.g. 43, 67)
  monthlyMppHistory?: Record<string, number>; // Optional extensible monthly data structure: { "Jan": 150, "Feb": 152, ... }
}

export interface MonthlyTrendItem {
  month: string;
  totalMpp: number;
  prevMpp: number | null;
  change: number;
  growthRate: number | null; // ((current - prev) / prev) * 100
  trendStatus: 'increase' | 'decrease' | 'neutral' | 'baseline';
  formattedRate: string;
}
