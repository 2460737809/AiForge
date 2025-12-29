import lunisolar from 'lunisolar';

// 二十四节气数据
export interface SolarTerm {
  name: string;
  month: number; // 月份 (1-12)
  day: number;   // 日期
  description: string;
}

// 获取指定年份的二十四节气
export function getSolarTermsForYear(year: number): SolarTerm[] {
  // 使用lunisolar库获取节气数据
  const yearTermList = lunisolar.SolarTerm.getYearTermDayList(year); // 获取指定年份的节气日列表
  const names = lunisolar.SolarTerm.getNames(); // 获取节气名称列表
  
  const terms: SolarTerm[] = [];
  
  for (let i = 0; i < 24; i++) {
    const name = names[i]; // 节气名
    const month = Math.floor(i / 2) + 1; // 月份，每两个节气为一个月
    const day = yearTermList[i]; // 日
    
    // 添加节气描述
    let description = '';
    switch (name) {
      case '立春': description = '春季开始，万物复苏'; break;
      case '雨水': description = '降雨开始，雨量渐增'; break;
      case '惊蛰': description = '春雷惊醒冬眠昆虫'; break;
      case '春分': description = '昼夜平分，春季过半'; break;
      case '清明': description = '天气清朗，草木繁茂'; break;
      case '谷雨': description = '雨量充足，利于谷物生长'; break;
      case '立夏': description = '夏季开始，万物繁茂'; break;
      case '小满': description = '夏熟作物籽粒开始饱满'; break;
      case '芒种': description = '麦类等有芒作物成熟'; break;
      case '夏至': description = '太阳直射北回归线，白天最长'; break;
      case '小暑': description = '天气开始炎热'; break;
      case '大暑': description = '一年中最热的时期'; break;
      case '立秋': description = '秋季开始，暑去凉来'; break;
      case '处暑': description = '炎热即将过去'; break;
      case '白露': description = '天气转凉，露水凝结'; break;
      case '秋分': description = '昼夜再次平分，秋季过半'; break;
      case '寒露': description = '气温更低，露水更冷'; break;
      case '霜降': description = '天气渐冷，开始有霜'; break;
      case '立冬': description = '冬季开始，万物收藏'; break;
      case '小雪': description = '开始降雪，雪量不大'; break;
      case '大雪': description = '雪量增大，地面可能积雪'; break;
      case '冬至': description = '太阳直射南回归线，白天最短'; break;
      case '小寒': description = '天气寒冷，但未到极点'; break;
      case '大寒': description = '一年中最冷的时期'; break;
      default: description = '二十四节气'; break;
    }
    
    terms.push({ name, month, day, description });
  }
  
  return terms;
}

// 获取指定日期的节气
export function getSolarTermForDate(year: number, month: number, day: number): SolarTerm | null {
  // 获取指定年份的节气数据
  const yearTerms = getSolarTermsForYear(year);
  
  // 在该年份的节气数据中查找匹配的节气
  const term = yearTerms.find(st => 
    st.month === month && st.day === day
  );
  return term || null;
}