// 日历工具函数
import { getLunarDate as getLunar } from './lunarUtils';
import { getHolidayName as getHoliday, isHoliday } from './holidayData';

// 获取今天日期
export function getToday() {
  const today = new Date();
  return {
    year: today.getFullYear(),
    month: today.getMonth() + 1, // 月份从0开始，需要+1
    day: today.getDate()
  };
}

// 格式化日期
export function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// 获取月份天数
export function getDaysInMonth(year: number, month: number): number {
  // 月份从1开始，但new Date需要0-11的月份
  const nextMonth = month > 11 ? 0 : month;
  const nextYear = month > 11 ? year + 1 : year;
  
  return new Date(year, month, 0).getDate();
}

// 判断是否为周末
export function isWeekend(year: number, month: number, day: number): boolean {
  const date = new Date(year, month - 1, day); // 月份从0开始
  const dayOfWeek = date.getDay();
  return dayOfWeek === 0 || dayOfWeek === 6; // 0是周日，6是周六
}

// 获取农历日期
export function getLunarDate(year: number, month: number, day: number): string {
  return getLunar(year, month, day);
}

// 获取节假日信息
export function getHolidayInfo(year: number, month: number, day: number): string | null {
  return getHoliday(year, month, day);
}

// 检查是否为节假日
export function checkIsHoliday(year: number, month: number, day: number): boolean {
  return isHoliday(year, month, day);
}

// 获取指定日期的节假日信息
export function getHolidayName(year: number, month: number, day: number): string | null {
  return getHolidayInfo(year, month, day);
}