// 补班调整数据
export interface WorkdayAdjustment {
  date: string; // YYYY-MM-DD
  isWorkday: boolean; // true表示补班，false表示节假日
  reason: string; // 调休原因
}

// 2024-2025年节假日调休安排
export const workdayAdjustments: WorkdayAdjustment[] = [
  // 2024年
  { date: '2024-02-04', isWorkday: true, reason: '春节调休' }, // 春节调休
  { date: '2024-02-18', isWorkday: true, reason: '春节调休' }, // 春节调休
  { date: '2024-02-25', isWorkday: true, reason: '春节调休' }, // 春节调休
  { date: '2024-04-07', isWorkday: true, reason: '清明节调休' }, // 清明节调休
  { date: '2024-04-28', isWorkday: true, reason: '劳动节调休' }, // 劳动节调休
  { date: '2024-05-11', isWorkday: true, reason: '劳动节调休' }, // 劳动节调休
  { date: '2024-09-14', isWorkday: true, reason: '中秋节调休' }, // 中秋节调休
  { date: '2024-09-29', isWorkday: true, reason: '国庆节调休' }, // 国庆节调休
  { date: '2024-10-12', isWorkday: true, reason: '国庆节调休' }, // 国庆节调休
  
  // 2025年
  { date: '2025-01-26', isWorkday: true, reason: '春节调休' }, // 春节调休
  { date: '2025-02-08', isWorkday: true, reason: '春节调休' }, // 春节调休
  { date: '2025-04-27', isWorkday: true, reason: '劳动节调休' }, // 劳动节调休
  { date: '2025-09-28', isWorkday: true, reason: '国庆节调休' }, // 国庆节调休
  { date: '2025-10-11', isWorkday: true, reason: '国庆节调休' }, // 国庆节调休
];

// 获取指定日期的补班调整信息
export function getWorkdayAdjustmentForDate(year: number, month: number, day: number): WorkdayAdjustment | null {
  const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  const adjustment = workdayAdjustments.find(adj => adj.date === dateStr);
  return adjustment || null;
}

// 检查指定日期是否为补班日
export function isWorkdayAdjustment(year: number, month: number, day: number): boolean {
  const adjustment = getWorkdayAdjustmentForDate(year, month, day);
  return adjustment ? adjustment.isWorkday : false;
}