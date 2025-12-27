// 节假日数据

// 动态生成节假日数据
interface Holiday {
  name: string;
  startMonth: number;
  startDay: number;
  endMonth: number;
  endDay: number;
  type: string;
}

export function getHolidaysForYear(year: number): Holiday[] {
  const holidays: Holiday[] = [];
  
  // 添加固定日期的节假日（每年相同）
  // 元旦
  holidays.push({ name: '元旦', startMonth: 1, startDay: 1, endMonth: 1, endDay: 1, type: '法定节假日' });
  
  // 国庆节
  holidays.push({ name: '国庆节', startMonth: 10, startDay: 1, endMonth: 10, endDay: 7, type: '法定节假日' });
  
  // 劳动节
  holidays.push({ name: '劳动节', startMonth: 5, startDay: 1, endMonth: 5, endDay: 3, type: '法定节假日' });
  
  // 根据年份计算农历节假日
  const chineseNewYear = getChineseNewYearDate(year);
  if (chineseNewYear) {
    holidays.push({ name: '春节', startMonth: chineseNewYear.month, startDay: chineseNewYear.day, 
                  endMonth: chineseNewYear.month, endDay: chineseNewYear.day + 5, type: '法定节假日' });
  }
  
  // 清明节通常是公历4月4日或4月5日
  const qingmingDay = getQingmingDay(year);
  holidays.push({ name: '清明节', startMonth: 4, startDay: qingmingDay, endMonth: 4, endDay: qingmingDay, type: '法定节假日' });
  
  // 端午节通常是农历五月初五
  const dragonBoatFestival = getDragonBoatFestivalDate(year);
  if (dragonBoatFestival) {
    holidays.push({ name: '端午节', startMonth: dragonBoatFestival.month, startDay: dragonBoatFestival.day, 
                  endMonth: dragonBoatFestival.month, endDay: dragonBoatFestival.day, type: '法定节假日' });
  }
  
  // 中秋节通常是农历八月十五
  const midAutumnFestival = getMidAutumnFestivalDate(year);
  if (midAutumnFestival) {
    holidays.push({ name: '中秋节', startMonth: midAutumnFestival.month, startDay: midAutumnFestival.day, 
                  endMonth: midAutumnFestival.month, endDay: midAutumnFestival.day, type: '法定节假日' });
  }
  
  return holidays;
}

// 辅助函数：获取某年春节的公历日期
function getChineseNewYearDate(year: number) {
  // 使用lunisolar库来获取农历正月初一对应的公历日期
  try {
    // 由于我们已重构使用lunisolar库，但这里不能直接使用lunisolar
    // 我们使用一个近似算法，因为春节通常在1月21日到2月21日之间
    // 更精确的方式是使用预定义的春节日期表
    const chineseNewYearMap: { [key: number]: { month: number; day: number } } = {
      2024: { month: 2, day: 10 },
      2025: { month: 1, day: 29 },
      2026: { month: 2, day: 17 },
      2027: { month: 2, day: 6 },
      2028: { month: 1, day: 26 },
      2029: { month: 2, day: 13 },
      2030: { month: 2, day: 3 },
      2031: { month: 1, day: 23 },
      2032: { month: 2, day: 11 },
      2033: { month: 1, day: 31 },
      2034: { month: 2, day: 19 },
      2035: { month: 2, day: 8 },
      2036: { month: 1, day: 28 },
      2037: { month: 2, day: 15 },
      2038: { month: 2, day: 4 },
      2039: { month: 1, day: 24 },
      2040: { month: 2, day: 12 }
    };
    
    return chineseNewYearMap[year];
  } catch (error) {
    console.error('获取春节日期出错:', error);
    return null;
  }
}

// 辅助函数：获取某年清明节的日期
function getQingmingDay(year: number): number {
  // 清明节的计算公式：(Y*0.2422+5.59)-[(Y-1)/4]
  // Y为年份，结果为4月的第几天
  const base = Math.floor(year * 0.2422 + 5.59);
  const leapAdjustment = Math.floor((year - 1) / 4);
  let day = base - leapAdjustment;
  
  // 特殊年份调整
  if (year % 4 === 0 || [1954, 1962, 1970, 1983, 1991, 2004, 2012, 2020, 2028].includes(year)) {
    day = day - 1;
  }
  
  return day;
}

// 辅助函数：获取某年端午节的公历日期
function getDragonBoatFestivalDate(year: number) {
  // 端午节是农历五月初五，这里使用预定义映射
  const dragonBoatFestivalMap: { [key: number]: { month: number; day: number } } = {
    2024: { month: 5, day: 28 },
    2025: { month: 5, day: 31 },
    2026: { month: 5, day: 21 },
    2027: { month: 5, day: 10 },
    2028: { month: 5, day: 28 },
    2029: { month: 5, day: 17 },
    2030: { month: 5, day: 6 },
    2031: { month: 4, day: 25 },
    2032: { month: 5, day: 13 },
    2033: { month: 5, day: 2 },
    2034: { month: 4, day: 21 },
    2035: { month: 5, day: 10 },
    2036: { month: 4, day: 28 },
    2037: { month: 5, day: 16 },
    2038: { month: 5, day: 5 },
    2039: { month: 4, day: 24 },
    2040: { month: 5, day: 12 }
  };
  
  return dragonBoatFestivalMap[year];
}

// 辅助函数：获取某年中秋节的公历日期
function getMidAutumnFestivalDate(year: number) {
  // 中秋节是农历八月十五，这里使用预定义映射
  const midAutumnFestivalMap: { [key: number]: { month: number; day: number } } = {
    2024: { month: 9, day: 17 },
    2025: { month: 10, day: 6 },
    2026: { month: 9, day: 25 },
    2027: { month: 9, day: 15 },
    2028: { month: 10, day: 3 },
    2029: { month: 9, day: 22 },
    2030: { month: 9, day: 11 },
    2031: { month: 9, day: 1 },
    2032: { month: 9, day: 20 },
    2033: { month: 9, day: 8 },
    2034: { month: 9, day: 28 },
    2035: { month: 9, day: 17 },
    2036: { month: 10, day: 5 },
    2037: { month: 9, day: 24 },
    2038: { month: 9, day: 13 },
    2039: { month: 10, day: 2 },
    2040: { month: 9, day: 21 }
  };
  
  return midAutumnFestivalMap[year];
}

// 检查指定日期是否为节假日
export function isHoliday(year: number, month: number, day: number): boolean {
  const yearHolidays = getHolidaysForYear(year);
  return yearHolidays.some(h => {
    // 如果是跨月的节假日，需要分别检查
    if (h.startMonth === h.endMonth) {
      // 同一个月内的节假日
      return h.startMonth === month && day >= h.startDay && day <= h.endDay;
    } else {
      // 跨月的节假日
      if (month === h.startMonth) {
        return day >= h.startDay; // 当月开始的日期
      } else if (month === h.endMonth) {
        return day <= h.endDay; // 结束月的日期
      } else {
        return false; // 既不是开始月也不是结束月
      }
    }
  });
}

// 获取指定日期的节假日名称
export function getHolidayName(year: number, month: number, day: number): string | null {
  const yearHolidays = getHolidaysForYear(year);
  const holiday = yearHolidays.find(h => {
    // 如果是跨月的节假日，需要分别检查
    if (h.startMonth === h.endMonth) {
      // 同一个月内的节假日
      return h.startMonth === month && day >= h.startDay && day <= h.endDay;
    } else {
      // 跨月的节假日
      if (month === h.startMonth) {
        return day >= h.startDay; // 当月开始的日期
      } else if (month === h.endMonth) {
        return day <= h.endDay; // 结束月的日期
      } else {
        return false; // 既不是开始月也不是结束月
      }
    }
  });
  return holiday ? holiday.name : null;
}