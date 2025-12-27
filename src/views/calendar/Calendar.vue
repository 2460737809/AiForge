<template>
  <div class="calendar-container">
    <header class="calendar-header">
      <h1 class="calendar-title">公历农历日历</h1>
      <div class="calendar-controls">
        <div class="year-selector">
          <button @click="changeYear(-1)" class="nav-btn">←</button>
          <select v-model="selectedYear" @change="onYearChange" class="year-select">
            <option v-for="year in yearOptions" :key="year" :value="year">{{ year }}年</option>
          </select>
          <button @click="changeYear(1)" class="nav-btn">→</button>
        </div>
        <div class="month-selector">
          <button @click="changeMonth(-1)" class="nav-btn">←</button>
          <select v-model="selectedMonth" @change="onMonthChange" class="month-select">
            <option v-for="month in 12" :key="month" :value="month">{{ month }}月</option>
          </select>
          <button @click="changeMonth(1)" class="nav-btn">→</button>
        </div>
        <button @click="goToToday" class="today-btn">今天</button>
      </div>
    </header>

    <div class="calendar-body">
      <div class="week-header">
        <div v-for="day in weekDays" :key="day" class="week-day">{{ day }}</div>
      </div>
      <div class="calendar-grid">
        <div 
          v-for="day in calendarDays" 
          :key="day.date" 
          :class="['calendar-day', {
            'today': day.isToday,
            'other-month': day.isOtherMonth,
            'holiday': day.isHoliday,
            'weekend': day.isWeekend
          }]"
          @click="selectDay(day)"
        >
          <div class="day-number">{{ day.day }}</div>
          <div class="lunar-date">{{ day.lunar }}</div>
          <div v-if="day.holiday" class="holiday-name">{{ day.holiday }}</div>
        </div>
      </div>
    </div>

    <div class="holidays-section">
      <h2>法定节假日</h2>
      <div class="holidays-list">
        <div 
          v-for="holiday in holidays" 
          :key="holiday.name" 
          :class="['holiday-item', { 'current': isHolidayToday(holiday) }]"
        >
          <div class="holiday-name">{{ holiday.name }}</div>
          <div class="holiday-date">{{ holiday.date }}</div>
          <div class="holiday-countdown">
            <span v-if="holiday.daysLeft > 0">距离: {{ holiday.daysLeft }}天</span>
            <span v-else-if="holiday.daysLeft === 0" class="today-highlight">今天!</span>
            <span v-else>已过期</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { getLunarDate, getHolidayInfo, checkIsHoliday, getDaysInMonth, isWeekend, getToday, formatDate } from './calendarUtils';
import { getHolidaysForYear } from './holidayData';

// 数据定义
interface CalendarDay {
  date: string;
  day: number;
  lunar: string;
  isToday: boolean;
  isOtherMonth: boolean;
  isWeekend: boolean;
  isHoliday: boolean;
  holiday?: string;
}

interface Holiday {
  name: string;
  date: string;
  daysLeft: number;
}

// 响应式数据
const current = getToday();
const selectedYear = ref(current.year);
const selectedMonth = ref(current.month);
const selectedDay = ref(current.day);

// 常量
const weekDays = ['日', '一', '二', '三', '四', '五', '六'];
const yearOptions = computed(() => {
  const currentYear = new Date().getFullYear();
  return Array.from({ length: 20 }, (_, i) => currentYear - 10 + i);
});

// 计算属性
const calendarDays = computed(() => {
  const days: CalendarDay[] = [];
  const today = getToday();
  const daysInMonth = getDaysInMonth(selectedYear.value, selectedMonth.value);
  const firstDay = new Date(selectedYear.value, selectedMonth.value - 1, 1);
  const startDayOfWeek = firstDay.getDay(); // 0 = Sunday, 1 = Monday, etc.
  
  // 添加上个月的日期
  const prevMonthDays = getDaysInMonth(selectedYear.value, selectedMonth.value - 1);
  for (let i = startDayOfWeek - 1; i >= 0; i--) {
    const day = prevMonthDays - i;
    const dateStr = `${selectedYear.value}-${selectedMonth.value - 1}-${day}`;
    const lunar = getLunarDate(selectedYear.value, selectedMonth.value - 1, day);
    const holidayInfo = getHolidayInfo(selectedYear.value, selectedMonth.value - 1, day);
    
    days.push({
      date: dateStr,
      day: day,
      lunar: lunar,
      isToday: today.year === selectedYear.value && 
               today.month === selectedMonth.value - 1 && 
               today.day === day,
      isOtherMonth: true,
      isWeekend: isWeekend(selectedYear.value, selectedMonth.value - 1, day),
      isHoliday: !!holidayInfo || checkIsHoliday(selectedYear.value, selectedMonth.value - 1, day),
      holiday: holidayInfo || undefined
    });
  }
  
  // 添加当前月的日期
  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${selectedYear.value}-${selectedMonth.value}-${day}`;
    const lunar = getLunarDate(selectedYear.value, selectedMonth.value, day);
    const holidayInfo = getHolidayInfo(selectedYear.value, selectedMonth.value, day);
    
    days.push({
      date: dateStr,
      day: day,
      lunar: lunar,
      isToday: today.year === selectedYear.value && 
               today.month === selectedMonth.value && 
               today.day === day,
      isOtherMonth: false,
      isWeekend: isWeekend(selectedYear.value, selectedMonth.value, day),
      isHoliday: !!holidayInfo || checkIsHoliday(selectedYear.value, selectedMonth.value, day),
      holiday: holidayInfo || undefined
    });
  }
  
  // 添加下个月的日期
  const totalCells = 42; // 6行 * 7天
  const remainingCells = totalCells - days.length;
  for (let day = 1; day <= remainingCells; day++) {
    const dateStr = `${selectedYear.value}-${selectedMonth.value + 1}-${day}`;
    const lunar = getLunarDate(selectedYear.value, selectedMonth.value + 1, day);
    const holidayInfo = getHolidayInfo(selectedYear.value, selectedMonth.value + 1, day);
    
    days.push({
      date: dateStr,
      day: day,
      lunar: lunar,
      isToday: today.year === selectedYear.value && 
               today.month === selectedMonth.value + 1 && 
               today.day === day,
      isOtherMonth: true,
      isWeekend: isWeekend(selectedYear.value, selectedMonth.value + 1, day),
      isHoliday: !!holidayInfo || checkIsHoliday(selectedYear.value, selectedMonth.value + 1, day),
      holiday: holidayInfo || undefined
    });
  }
  
  return days;
});

const holidays = computed(() => {
  let yearHolidays = getHolidaysForYear(selectedYear.value);
  const holidayList: Holiday[] = [];
  const today = new Date();
  
  // 检查当前年份是否还有未过的节假日
  let hasFutureHolidays = false;
  for (const holiday of yearHolidays) {
    const holidayStartDate = new Date(selectedYear.value, holiday.startMonth - 1, holiday.startDay);
    if (holidayStartDate >= today) {
      hasFutureHolidays = true;
      break;
    }
  }
  
  // 如果当前年份没有未来节假日，显示下一年的节假日
  if (!hasFutureHolidays) {
    yearHolidays = getHolidaysForYear(selectedYear.value + 1);
  }
  
  yearHolidays.forEach(holiday => {
    // 根据是否显示下一年的节假日来确定年份
    const displayYear = !hasFutureHolidays ? selectedYear.value + 1 : selectedYear.value;
    const holidayStartDate = new Date(displayYear, holiday.startMonth - 1, holiday.startDay);
    const holidayEndDate = new Date(displayYear, holiday.endMonth - 1, holiday.endDay);
    const timeDiff = holidayStartDate.getTime() - today.getTime();
    const daysLeft = Math.ceil(timeDiff / (1000 * 3600 * 24));
    
    // 只显示未过的节假日
    if (daysLeft >= 0) {
      holidayList.push({
        name: holiday.name,
        date: `${formatDate(holidayStartDate)}-${formatDate(holidayEndDate)}`,
        daysLeft: daysLeft
      });
    }
  });
  
  return holidayList.sort((a, b) => a.daysLeft - b.daysLeft);
});

// 方法
const changeYear = (direction: number) => {
  selectedYear.value += direction;
};

const changeMonth = (direction: number) => {
  let newMonth = selectedMonth.value + direction;
  let newYear = selectedYear.value;
  
  if (newMonth > 12) {
    newYear++;
    newMonth = 1;
  } else if (newMonth < 1) {
    newYear--;
    newMonth = 12;
  }
  
  selectedYear.value = newYear;
  selectedMonth.value = newMonth;
};

const onYearChange = () => {
  // 年份改变时更新日历
};

const onMonthChange = () => {
  // 月份改变时更新日历
};

const goToToday = () => {
  const today = getToday();
  selectedYear.value = today.year;
  selectedMonth.value = today.month;
  selectedDay.value = today.day;
};

const selectDay = (day: CalendarDay) => {
  // 选择某一天的处理逻辑
  console.log('Selected day:', day);
};

const isHolidayToday = (holiday: Holiday): boolean => {
  const today = new Date();
  const holidayDate = new Date(holiday.date);
  return today.toDateString() === holidayDate.toDateString();
};

onMounted(() => {
  // 组件挂载时的初始化逻辑
});
</script>

<style scoped>
.calendar-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  font-family: 'Microsoft YaHei', Arial, sans-serif;
}

.calendar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 15px;
}

.calendar-title {
  font-size: 1.8rem;
  color: #333;
  margin: 0;
}

.calendar-controls {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.year-selector, .month-selector {
  display: flex;
  align-items: center;
  gap: 5px;
}

.nav-btn {
  background: #f0f0f0;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 5px 10px;
  cursor: pointer;
  font-size: 1rem;
}

.nav-btn:hover {
  background: #e0e0e0;
}

.year-select, .month-select {
  padding: 6px 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: white;
  font-size: 1rem;
}

.today-btn {
  background: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 8px 15px;
  cursor: pointer;
  font-size: 1rem;
}

.today-btn:hover {
  background: #45a049;
}

.calendar-body {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  overflow: hidden;
  margin-bottom: 30px;
}

.week-header {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  background: #f5f5f5;
  border-bottom: 1px solid #eee;
}

.week-day {
  padding: 12px;
  text-align: center;
  font-weight: bold;
  color: #555;
}

.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 1px;
  background: #eee;
}

.calendar-day {
  background: white;
  padding: 10px;
  min-height: 100px;
  cursor: pointer;
  transition: background-color 0.2s;
  position: relative;
}

.calendar-day:hover {
  background-color: #f9f9f9;
}

.calendar-day.today {
  background-color: #e3f2fd;
  border: 2px solid #2196f3;
}

.calendar-day.other-month {
  color: #aaa;
  background-color: #fafafa;
}

.calendar-day.holiday {
  background-color: #ffebee;
  color: #c62828;
}

.calendar-day.weekend {
  background-color: #f3e5f5;
}

.day-number {
  font-size: 1.2rem;
  font-weight: bold;
  margin-bottom: 4px;
}

.lunar-date {
  font-size: 0.8rem;
  color: #666;
}

.holiday-name {
  font-size: 0.8rem;
  color: #c62828;
  font-weight: bold;
  margin-top: 2px;
}

.holidays-section {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  padding: 20px;
}

.holidays-section h2 {
  margin-top: 0;
  color: #333;
  border-bottom: 2px solid #4CAF50;
  padding-bottom: 10px;
}

.holidays-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 15px;
}

.holiday-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  border: 1px solid #eee;
  border-radius: 6px;
  background: #f9f9f9;
}

.holiday-item.current {
  background: #e8f5e9;
  border-color: #4CAF50;
  font-weight: bold;
}

.holiday-name {
  font-weight: bold;
  color: #333;
}

.holiday-date {
  color: #666;
}

.holiday-countdown {
  font-weight: bold;
}

.today-highlight {
  color: #f44336;
  animation: pulse 1s infinite;
}

@keyframes pulse {
  0% { opacity: 1; }
  50% { opacity: 0.5; }
  100% { opacity: 1; }
}

@media (max-width: 768px) {
  .calendar-container {
    padding: 10px;
  }
  
  .calendar-header {
    flex-direction: column;
    align-items: stretch;
  }
  
  .calendar-controls {
    justify-content: center;
  }
  
  .calendar-day {
    min-height: 80px;
    padding: 6px;
  }
  
  .day-number {
    font-size: 1rem;
  }
  
  .lunar-date, .holiday-name {
    font-size: 0.7rem;
  }
  
  .holidays-list {
    grid-template-columns: 1fr;
  }
}
</style>