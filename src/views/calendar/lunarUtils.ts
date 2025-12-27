import lunisolar from 'lunisolar';

/**
 * 使用lunisolar库实现农历转换工具函数
 */

/**
 * 将公历转换为农历
 */
export function getLunarDate(year: number, month: number, day: number): string {
  try {
    // 创建指定日期
    const date = new Date(year, month - 1, day);
    
    // 使用lunisolar库转换为农历
    const lunarDate = lunisolar(date);
    
    // 获取农历信息
    const lunar = lunarDate.lunar;
    const lunarYear = lunar.year;
    const lunarMonth = lunar.month;
    const lunarDay = lunar.day;
    const isLeapMonth = lunar.isLeapMonth;
    
    // 获取干支纪年
    const ganZhiYear = `${lunarDate.char8.year.stem}${lunarDate.char8.year.branch}`;
    
    // 获取生肖
    const zodiac = getZodiacFromEarthlyBranch(lunarDate.char8.year.branch.toString());
    
    // 构建农历月份名称
    const monthStr = (isLeapMonth ? "闰" : "") + getLunarMonthName(lunarMonth);
    
    // 构建农历日期名称
    const dayStr = getLunarDayName(lunarDay);
    
    return `${ganZhiYear}${zodiac}年 ${monthStr}${dayStr}`;
  } catch (error) {
    console.error('农历计算错误:', error);
    return "计算错误";
  }
}

/**
 * 根据地支获取生肖
 */
function getZodiacFromEarthlyBranch(earthlyBranch: string): string {
  // 地支对应的生肖
  const zodiacMap: { [key: string]: string } = {
    '子': '鼠', '丑': '牛', '寅': '虎', '卯': '兔',
    '辰': '龙', '巳': '蛇', '午': '马', '未': '羊',
    '申': '猴', '酉': '鸡', '戌': '狗', '亥': '猪'
  };
  
  return zodiacMap[earthlyBranch] || '';
}

/**
 * 获取农历月份名称
 */
function getLunarMonthName(month: number): string {
  // 如果是闰月，需要特殊处理
  const isLeap = month > 100; // lunisolar 中闰月会返回 100+月份号
  const actualMonth = isLeap ? month - 100 : month;
  
  const monthNames = [
    '', '正月', '二月', '三月', '四月', '五月', '六月',
    '七月', '八月', '九月', '十月', '冬月', '腊月'
  ];
  
  const monthName = monthNames[actualMonth] || '';
  
  return isLeap ? `闰${monthName}` : monthName;
}

/**
 * 获取农历日期名称
 */
function getLunarDayName(day: number): string {
  const dayNames = [
    '', '初一', '初二', '初三', '初四', '初五', '初六', '初七', '初八', '初九', '初十',
    '十一', '十二', '十三', '十四', '十五', '十六', '十七', '十八', '十九', '二十',
    '廿一', '廿二', '廿三', '廿四', '廿五', '廿六', '廿七', '廿八', '廿九', '三十'
  ];
  
  return dayNames[day] || '';
}

/**
 * 获取干支纪年
 */
export function getGanZhiYear(year: number): string {
  try {
    const date = new Date(year, 0, 1); // 使用年初作为参考
    const lunarDate = lunisolar(date);
    return `${lunarDate.char8.year.stem}${lunarDate.char8.year.branch}`;
  } catch (error) {
    console.error('干支纪年计算错误:', error);
    return "";
  }
}

/**
 * 获取生肖
 */
export function getZodiac(year: number): string {
  try {
    const date = new Date(year, 0, 1); // 使用年初作为参考
    const lunarDate = lunisolar(date);
    return getZodiacFromEarthlyBranch(lunarDate.char8.year.branch.toString());
  } catch (error) {
    console.error('生肖计算错误:', error);
    return "";
  }
}

// 测试函数
function testLunarCalculation() {
  console.log("测试农历计算:");
  console.log("2024年2月10日: ", getLunarDate(2024, 2, 10)); // 应该是甲辰龙年 正月初一
  console.log("2025年1月29日: ", getLunarDate(2025, 1, 29)); // 应该是乙巳蛇年 正月初一
  console.log("今天: ", getLunarDate(new Date().getFullYear(), new Date().getMonth() + 1, new Date().getDate()));
}

// 在开发环境中运行测试
// testLunarCalculation();
