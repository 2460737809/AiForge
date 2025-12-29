<template>
  <div class="calendar-container">
    <!-- 天气信息显示区域 -->
    <div class="weather-info" v-if="weatherInfo">
      <div class="weather-main">
        <div class="weather-location">
          <span class="location-icon">📍</span>
          <div class="city-selector-container" v-clickOutsideDirective="() => (isCityDropdownOpen = false)">
            <div class="city-selector" @click="isCityDropdownOpen = !isCityDropdownOpen">
              <span class="selected-city">{{ currentCityName }}</span>
              <span class="arrow-icon" :class="{ rotate: isCityDropdownOpen }">▼</span>
            </div>
            <transition name="fade-slide">
              <div v-if="isCityDropdownOpen" class="city-dropdown">
                <input 
                  type="text" 
                  v-model="citySearchQuery" 
                  placeholder="搜索城市..." 
                  class="city-search-input"
                  @click.stop
                />
                <div class="city-list">
                  <div 
                    v-for="city in filteredCities" 
                    :key="city.areaid"
                    class="city-item"
                    :class="{ active: city.areaid === currentCity }"
                    @click="selectCity(city)"
                  >
                    {{ city.name }}
                  </div>
                  <div v-if="filteredCities.length === 0" class="no-results">
                    未找到相关城市
                  </div>
                </div>
              </div>
            </transition>
          </div>
        </div>
        <div class="weather-temperature">{{ weatherInfo.real }}</div>
        <div class="weather-condition-wrapper">
          <img :src="currentWeatherIcon" :alt="weatherInfo.weather" class="weather-icon" />
          <span class="weather-condition">{{ weatherInfo.weather }}</span>
        </div>
        <div class="weather-details">
          <div class="detail-row">
            <span class="detail-item"><span class="detail-label">最高：</span>{{ weatherInfo.highest }}</span>
            <span class="detail-item"><span class="detail-label">最低：</span>{{ weatherInfo.lowest }}</span>
            <span class="detail-item"><span class="detail-label">湿度：</span>{{ weatherInfo.humidity }}%</span>
            <span class="detail-item"><span class="detail-label">AQI：</span>{{ weatherInfo.aqi }}</span>
            <span class="detail-item"><span class="detail-label">空气质量：</span>{{ weatherInfo.quality }}</span>
            <span class="detail-item"><span class="detail-label">日落时间：</span>{{ weatherInfo.sunset }}</span>
          </div>
        </div>
        <div class="weather-tips">{{ weatherInfo.tips }}</div>
      </div>
    </div>
    
    <header class="calendar-header">
      <h1 class="calendar-title">日历</h1>
      <div class="calendar-controls">
        <div class="custom-select-group">
          <button @click="changeYear(-1)" class="nav-btn">←</button>
          <div class="custom-dropdown" v-clickOutsideDirective="() => (isYearOpen = false)">
            <div class="dropdown-trigger" @click="isYearOpen = !isYearOpen">
              {{ selectedYear }}年
              <span class="arrow-icon" :class="{ rotate: isYearOpen }">▼</span>
            </div>
            <transition name="fade-slide">
              <ul v-if="isYearOpen" class="dropdown-menu">
                <li v-for="year in yearOptions" :key="year" :class="{ active: year === selectedYear }" @click="selectYear(year)">{{ year }}年</li>
              </ul>
            </transition>
          </div>
          <button @click="changeYear(1)" class="nav-btn">→</button>
        </div>

        <div class="custom-select-group">
          <button @click="changeMonth(-1)" class="nav-btn">←</button>
          <div class="custom-dropdown" v-clickOutsideDirective="() => (isMonthOpen = false)">
            <div class="dropdown-trigger" @click="isMonthOpen = !isMonthOpen">
              {{ selectedMonth }}月
              <span class="arrow-icon" :class="{ rotate: isMonthOpen }">▼</span>
            </div>
            <transition name="fade-slide">
              <ul v-if="isMonthOpen" class="dropdown-menu">
                <li v-for="month in 12" :key="month" :class="{ active: month === selectedMonth }" @click="selectMonth(month)">{{ month }}月</li>
              </ul>
            </transition>
          </div>
          <button @click="changeMonth(1)" class="nav-btn">→</button>
        </div>

        <div class="button-group">
          <button @click="goToToday" class="today-btn">今天</button>
          <button @click="toggleDarkMode" class="theme-btn" :class="{ 'dark-mode-active': isDarkMode }">
            {{ isDarkMode ? '🌙' : '☀️' }}
          </button>
        </div>
      </div>
    </header>

    <div class="calendar-body">
      <div class="week-header">
        <div v-for="day in weekDays" :key="day" class="week-day">{{ day }}</div>
      </div>
      <transition name="slide-month" mode="out-in">
        <div :key="`${selectedYear}-${selectedMonth}`" class="calendar-grid">
          <div
            v-for="day in calendarDays"
            :key="day.date"
            :class="[
              'calendar-day',
              {
                today: day.isToday,
                'other-month': day.isOtherMonth,
                holiday: day.isHoliday,
                weekend: day.isWeekend,
              },
            ]"
            @click="selectDay(day)"
          >
            <div class="day-number">{{ day.day }}</div>
            <div class="lunar-date">{{ day.lunar }}</div>
            <div v-if="day.holiday" class="holiday-name">{{ day.holiday }}</div>
            <!-- 显示补班信息 -->
            <div v-if="day.workdayAdjustment" class="workday-adjustment">{{ day.workdayAdjustment }}</div>
            <!-- 显示二十四节气 -->
            <div v-if="day.solarTerm" class="solar-term">{{ day.solarTerm }}</div>
            <!-- 显示当天任务数 -->
            <div v-if="day.taskCount && day.taskCount > 0" class="task-indicator">{{ day.taskCount }}</div>
          </div>
        </div>
      </transition>
    </div>

    <div class="calendar-sections">
      <div class="holidays-section">
        <h2>法定节假日</h2>
        <div class="holidays-list">
          <div v-for="holiday in holidays" :key="holiday.name" :class="['holiday-item', { current: isHolidayToday(holiday) }]">
            <div class="holiday-info">
              <div class="holiday-name">{{ holiday.name }}</div>
              <div class="holiday-date">{{ holiday.date }}</div>
            </div>
            <div class="holiday-countdown">
              <span v-if="holiday.daysLeft > 0">距离: {{ holiday.daysLeft }}天</span>
              <span v-else-if="holiday.daysLeft === 0" class="today-highlight">今天!</span>
              <span v-else>已过期</span>
            </div>
          </div>
          
          <div v-if="holidays.length === 0" class="empty-state">
            <div class="empty-icon">🗓️</div>
            <p>暂无节假日安排</p>
            <p class="empty-subtitle">节假日安排通常在前一年年底公布</p>
          </div>
        </div>
      </div>
      
      <div class="tasks-wrapper">
        <div class="task-section">
          <h2>日程管理
            <span class="task-date">{{ selectedDateForTasks ? formatDateDisplay(selectedDateForTasks) : '选择日期添加任务' }}</span>
          </h2>
          <TaskManager :selectedDate="selectedDateForTasks || undefined" :showCustomModal="showCustomModal" />
        </div>
      </div>
    </div>
    
    <!-- 重要日倒计时 -->
    <div class="milestone-section">
      <MilestoneCountdown :showCustomModal="showCustomModal" />
    </div>
    
    <!-- 自定义模态框 -->
    <div v-if="showModal" class="custom-modal-overlay" @click="closeModal">
      <div class="custom-modal" @click.stop>
        <div class="custom-modal-header">
          <h3>{{ modalTitle }}</h3>
        </div>
        <div class="custom-modal-body">
          <p>{{ modalContent }}</p>
        </div>
        <div class="custom-modal-footer">
          <button @click="closeModal" class="btn-cancel">取消</button>
          <button @click="executeModalAction" class="btn-confirm">确定</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from "vue"
import { getLunarDate, getHolidayInfo, checkIsHoliday, getDaysInMonth, isWeekend, getToday, formatDate } from "./calendarUtils"
import { getHolidaysForYear } from "./holidayData"
import TaskManager from './TaskManager.vue'; // 导入任务管理组件
import { dbService } from './indexedDBService'; // 导入数据库服务
import vClickOutside from './vClickOutside'; // 导入自定义指令
import { getSolarTermForDate } from './solarTerms'; // 导入二十四节气数据
import { getWorkdayAdjustmentForDate } from './workdayAdjustments'; // 导入补班调整数据
import MilestoneCountdown from './MilestoneCountdown.vue'; // 导入重要日倒计时组件
// @ts-ignore
import { weatherApi } from '@/api/tianApi.js'; // 导入天气API
import weatherCities from '@/assets/mockData/weather_code.json';
import qing from '@/assets/mockData/weather-img/qing.svg';
import duoyun from '@/assets/mockData/weather-img/duoyun.svg';
import yin from '@/assets/mockData/weather-img/yin.svg';
import yu from '@/assets/mockData/weather-img/yu.svg';
import xue from '@/assets/mockData/weather-img/xue.svg';
import wu from '@/assets/mockData/weather-img/wu.svg';
import mai from '@/assets/mockData/weather-img/mai.svg';
import shachenbao from '@/assets/mockData/weather-img/shachenbao.svg';
import bingbao from '@/assets/mockData/weather-img/bingbao.svg';
import leizhenyu from '@/assets/mockData/weather-img/leizhenyu.svg';
import zhenyu from '@/assets/mockData/weather-img/zhenyu.svg';
import xiaoyu from '@/assets/mockData/weather-img/xiaoyu.svg';
import zhongyu from '@/assets/mockData/weather-img/zhongyu.svg';
import dayu from '@/assets/mockData/weather-img/dayu.svg';
import baoyu from '@/assets/mockData/weather-img/baoyu.svg';
import dabaoyu from '@/assets/mockData/weather-img/dabaoyu.svg';
import tedabaoyu from '@/assets/mockData/weather-img/tedabaoyu.svg';
import xiaoxue from '@/assets/mockData/weather-img/xiaoxue.svg';
import zhongxue from '@/assets/mockData/weather-img/zhongxue.svg';
import daxue from '@/assets/mockData/weather-img/daxue.svg';
import baoxue from '@/assets/mockData/weather-img/baoxue.svg';
import yujiaxue from '@/assets/mockData/weather-img/yujiaxue.svg';
import dongyu from '@/assets/mockData/weather-img/dongyu.svg';
import dawu from '@/assets/mockData/weather-img/dawu.svg';
import fuchen from '@/assets/mockData/weather-img/fuchen.svg';
import yangsha from '@/assets/mockData/weather-img/yangsha.svg';

// 注册自定义指令
const vClickOutsideDirective = vClickOutside;

// 深色模式相关
const isDarkMode = ref(false);

// 获取天气信息
const fetchWeather = async (city = currentCity.value) => {
  const today = new Date().toLocaleDateString('zh-CN');
  const cacheKey = `weather_${city}`;
  
  // 检查是否有缓存
  const cachedData = localStorage.getItem(cacheKey);
  if (cachedData) {
    const cache = JSON.parse(cachedData);
    if (cache.date === today) {
      weatherInfo.value = cache.data;
      console.log('使用缓存天气数据');
      return;
    }
  }
  
  try {
    const response: any = await weatherApi.getWeather(city);
    console.log(response);
    
    
    if (response.data.code === 200) {
      weatherInfo.value = response.data.result;
      // 保存到 localStorage，包含当前日期
      localStorage.setItem(cacheKey, JSON.stringify({
        date: today,
        data: response.data.result
      }));
    } else {
      console.error('获取天气信息失败:', response.data.msg);
    }
  } catch (error) {
    console.error('获取天气信息出错:', error);
  }
};

// 更改城市
const selectCity = (city: City) => {
  currentCity.value = city.areaid;
  currentCityName.value = city.name;
  isCityDropdownOpen.value = false;
  citySearchQuery.value = '';
  fetchWeather(city.areaid);
};

// 数据定义
interface CalendarDay {
  date: string
  day: number
  lunar: string
  isToday: boolean
  isOtherMonth: boolean
  isWeekend: boolean
  isHoliday: boolean
  holiday?: string
  solarTerm?: string // 新增：二十四节气
  workdayAdjustment?: string // 新增：补班调整
  taskCount: number // 修改：任务数量，必须存在
}

interface Holiday {
  name: string
  date: string
  daysLeft: number
}

// 天气相关接口定义
interface WeatherResult {
  aqi: string;
  vis: string;
  area: string;
  date: string;
  pcpn: string;
  real: string;
  tips: string;
  week: string;
  wind: string;
  areaid: string;
  lowest: string;
  sunset: string;
  windsc: string;
  highest: string;
  quality: string;
  sunrise: string;
  weather: string;
  humidity: string;
  moondown: string;
  moonrise: string;
  province: string;
  uv_index: string;
  windspeed: string;
  weatherimg: string;
  weathercode: string;
  alarmlist?: Array<any>;
}

interface City {
  areaid: string;
  name: string;
}

// 天气相关
const weatherInfo = ref<WeatherResult | null>(null);
const currentCity = ref('410100'); // 默认郑州市
const currentCityName = ref('郑州市');
const citySearchQuery = ref('');
const isCityDropdownOpen = ref(false);
const filteredCities = computed(() => {
  if (!citySearchQuery.value) {
    return weatherCities.slice(0, 50); // 默认显示前50个城市
  }
  const query = citySearchQuery.value.toLowerCase();
  return weatherCities.filter((city: City) => 
    city.name.toLowerCase().includes(query)
  ).slice(0, 50);
});

const weatherIconMap: Record<string, any> = {
  '晴': qing,
  '多云': duoyun,
  '阴': yin,
  '雨': yu,
  '雷阵雨': leizhenyu,
  '阵雨': zhenyu,
  '小雨': xiaoyu,
  '中雨': zhongyu,
  '大雨': dayu,
  '暴雨': baoyu,
  '大暴雨': dabaoyu,
  '特大暴雨': tedabaoyu,
  '雪': xue,
  '小雪': xiaoxue,
  '中雪': zhongxue,
  '大雪': daxue,
  '暴雪': baoxue,
  '雨夹雪': yujiaxue,
  '冻雨': dongyu,
  '雾': wu,
  '霾': mai,
  '浮尘': fuchen,
  '沙尘暴': shachenbao,
  '冰雹': bingbao,
  '扬沙': yangsha,
  '大雾': dawu,
};

const currentWeatherIcon = computed(() => {
  if (!weatherInfo.value?.weathercode) return qing;
  return weatherIconMap[weatherInfo.value.weathercode] || qing;
});
const current = getToday()
const selectedYear = ref(current.year)
const selectedMonth = ref(current.month)
const selectedDay = ref(current.day)
const isYearOpen = ref(false)
const isMonthOpen = ref(false)
const selectedDateForTasks = ref<string | null>(null) // 新增：选中的日期用于任务管理

// 常量
const weekDays = ["日", "一", "二", "三", "四", "五", "六"]
const yearOptions = computed(() => {
  const currentYear = new Date().getFullYear()
  return Array.from({ length: 20 }, (_, i) => currentYear - 10 + i)
})

// 计算属性
const calendarDays = computed(() => {
  const days: CalendarDay[] = []
  const today = getToday()
  const daysInMonth = getDaysInMonth(selectedYear.value, selectedMonth.value)
  const firstDay = new Date(selectedYear.value, selectedMonth.value - 1, 1)
  const startDayOfWeek = firstDay.getDay() // 0 = Sunday, 1 = Monday, etc.

  // 添加上个月的日期
  const prevMonthDays = getDaysInMonth(selectedYear.value, selectedMonth.value - 1)
  for (let i = startDayOfWeek - 1; i >= 0; i--) {
    const day = prevMonthDays - i
    const dateStr = `${selectedYear.value}-${selectedMonth.value - 1}-${day}`
    const lunar = getLunarDate(selectedYear.value, selectedMonth.value - 1, day)
    const holidayInfo = getHolidayInfo(selectedYear.value, selectedMonth.value - 1, day)

    const solarTerm = getSolarTermForDate(selectedYear.value, selectedMonth.value - 1, day);
    const workdayAdjustment = getWorkdayAdjustmentForDate(selectedYear.value, selectedMonth.value - 1, day);
    days.push({
      date: dateStr,
      day: day,
      lunar: lunar,
      isToday: today.year === selectedYear.value && today.month === selectedMonth.value - 1 && today.day === day,
      isOtherMonth: true,
      isWeekend: isWeekend(selectedYear.value, selectedMonth.value - 1, day),
      isHoliday: !!holidayInfo || checkIsHoliday(selectedYear.value, selectedMonth.value - 1, day),
      holiday: holidayInfo || undefined,
      solarTerm: solarTerm?.name,
      workdayAdjustment: workdayAdjustment?.reason,
      taskCount: 0, // 初始化任务数量为0
    })
  }

  // 添加当前月的日期
  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${selectedYear.value}-${selectedMonth.value}-${day}`
    const lunar = getLunarDate(selectedYear.value, selectedMonth.value, day)
    const holidayInfo = getHolidayInfo(selectedYear.value, selectedMonth.value, day)

    const solarTerm = getSolarTermForDate(selectedYear.value, selectedMonth.value, day);
    const workdayAdjustment = getWorkdayAdjustmentForDate(selectedYear.value, selectedMonth.value, day);
    days.push({
      date: dateStr,
      day: day,
      lunar: lunar,
      isToday: today.year === selectedYear.value && today.month === selectedMonth.value && today.day === day,
      isOtherMonth: false,
      isWeekend: isWeekend(selectedYear.value, selectedMonth.value, day),
      isHoliday: !!holidayInfo || checkIsHoliday(selectedYear.value, selectedMonth.value, day),
      holiday: holidayInfo || undefined,
      solarTerm: solarTerm?.name,
      workdayAdjustment: workdayAdjustment?.reason,
      taskCount: 0, // 初始化任务数量为0
    })
  }

  // 添加下个月的日期
  const totalCells = 42 // 6行 * 7天
  const remainingCells = totalCells - days.length
  for (let day = 1; day <= remainingCells; day++) {
    const dateStr = `${selectedYear.value}-${selectedMonth.value + 1}-${day}`
    const lunar = getLunarDate(selectedYear.value, selectedMonth.value + 1, day)
    const holidayInfo = getHolidayInfo(selectedYear.value, selectedMonth.value + 1, day)

    const solarTerm = getSolarTermForDate(selectedYear.value, selectedMonth.value + 1, day);
    const workdayAdjustment = getWorkdayAdjustmentForDate(selectedYear.value, selectedMonth.value + 1, day);
    days.push({
      date: dateStr,
      day: day,
      lunar: lunar,
      isToday: today.year === selectedYear.value && today.month === selectedMonth.value + 1 && today.day === day,
      isOtherMonth: true,
      isWeekend: isWeekend(selectedYear.value, selectedMonth.value + 1, day),
      isHoliday: !!holidayInfo || checkIsHoliday(selectedYear.value, selectedMonth.value + 1, day),
      holiday: holidayInfo || undefined,
      solarTerm: solarTerm?.name,
      workdayAdjustment: workdayAdjustment?.reason,
      taskCount: 0, // 初始化任务数量为0
    })
  }

  return days
})

const holidays = computed(() => {
  let yearHolidays = getHolidaysForYear(selectedYear.value)
  const holidayList: Holiday[] = []
  const today = new Date()

  // 检查当前年份是否还有未过的节假日
  let hasFutureHolidays = false
  for (const holiday of yearHolidays) {
    const holidayStartDate = new Date(selectedYear.value, holiday.startMonth - 1, holiday.startDay)
    if (holidayStartDate >= today) {
      hasFutureHolidays = true
      break
    }
  }

  // 如果当前年份没有未来节假日，显示下一年的节假日
  if (!hasFutureHolidays) {
    yearHolidays = getHolidaysForYear(selectedYear.value + 1)
  }

  yearHolidays.forEach((holiday) => {
    // 根据是否显示下一年的节假日来确定年份
    const displayYear = !hasFutureHolidays ? selectedYear.value + 1 : selectedYear.value
    const holidayStartDate = new Date(displayYear, holiday.startMonth - 1, holiday.startDay)
    const holidayEndDate = new Date(displayYear, holiday.endMonth - 1, holiday.endDay)
    const timeDiff = holidayStartDate.getTime() - today.getTime()
    const daysLeft = Math.ceil(timeDiff / (1000 * 3600 * 24))

    // 只显示未过的节假日
    if (daysLeft >= 0) {
      // 如果节假日只有一天（开始日期等于结束日期），则只显示单个日期
      const dateStr = holidayStartDate.getTime() === holidayEndDate.getTime() ? formatDate(holidayStartDate) : `${formatDate(holidayStartDate)}-${formatDate(holidayEndDate)}`

      holidayList.push({
        name: holiday.name,
        date: dateStr,
        daysLeft: daysLeft,
      })
    }
  })

  return holidayList.sort((a, b) => a.daysLeft - b.daysLeft)
})

// 方法
const changeYear = (direction: number) => {
  selectedYear.value += direction
}

const changeMonth = (direction: number) => {
  let newMonth = selectedMonth.value + direction
  let newYear = selectedYear.value

  if (newMonth > 12) {
    newYear++
    newMonth = 1
  } else if (newMonth < 1) {
    newYear--
    newMonth = 12
  }

  selectedYear.value = newYear
  selectedMonth.value = newMonth
}

// 选择方法
const selectYear = (year: number) => {
  selectedYear.value = year
  isYearOpen.value = false
}

const selectMonth = (month: number) => {
  selectedMonth.value = month
  isMonthOpen.value = false
}

const goToToday = () => {
  const today = getToday()
  selectedYear.value = today.year
  selectedMonth.value = today.month
  selectedDay.value = today.day
}

const selectDay = (day: CalendarDay) => {
  // 选择某一天的处理逻辑
  console.log("Selected day:", day)
  // 设置选中的日期用于任务管理
  selectedDateForTasks.value = day.date
}

const isHolidayToday = (holiday: Holiday): boolean => {
  const today = new Date()
  const holidayDate = new Date(holiday.date)
  return today.toDateString() === holidayDate.toDateString()
}

const toggleDarkMode = () => {
  isDarkMode.value = !isDarkMode.value;
  document.body.classList.toggle('dark-mode', isDarkMode.value);
}

// 自定义模态框相关
const showModal = ref(false);
const modalTitle = ref('');
const modalContent = ref('');
const modalAction = ref<(() => void) | null>(null);

const showCustomModal = (title: string, content: string, action?: () => void) => {
  modalTitle.value = title;
  modalContent.value = content;
  modalAction.value = action || null;
  showModal.value = true;
};

const closeModal = () => {
  showModal.value = false;
  modalTitle.value = '';
  modalContent.value = '';
  modalAction.value = null;
};

const executeModalAction = () => {
  if (modalAction.value) {
    modalAction.value();
  }
  closeModal();
};

// 组件挂载后获取天气信息
onMounted(() => {
  fetchWeather();
});

// 新增方法：获取指定日期的任务数量
const getTaskCountForDate = async (date: string) => {
  try {
    const tasks = await dbService.getTasksByDate(date);
    return tasks.length;
  } catch (error) {
    console.error('获取任务数量失败:', error);
    return 0;
  }
}

// 新增方法：格式化日期显示
const formatDateDisplay = (dateString: string) => {
  const date = new Date(dateString);
  return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
}

onMounted(async () => {
  // 组件挂载时的初始化逻辑
  // 初始化日历上的任务数量
  const days = calendarDays.value;
  for (const day of days) {
    day.taskCount = await getTaskCountForDate(day.date);
  }
})
</script>
<style lang="scss" scoped>
@use "sass:color";





// --- 混合宏：毛玻璃效果 ---
@mixin glass-effect {
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(0, 118, 255, 0.15);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.05);
}

@mixin dark-glass-effect {
  background: rgba(30, 30, 30, 0.7);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(100, 150, 255, 0.15);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
}

.calendar-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 30px 20px;
  font-family:
    "Segoe UI",
    system-ui,
    -apple-system,
    sans-serif;
  background-color: #f0f4f8;
  color: #1a1c1e;
  min-height: 100vh;
  // 背景装饰性光晕
  background-image: radial-gradient(circle at 10% 10%, rgba(0, 118, 255, 0.05) 0%, transparent 40%), radial-gradient(circle at 90% 90%, rgba(110, 86, 207, 0.05) 0%, transparent 40%);
}

// 深色模式
.dark-mode {
  .calendar-container {
    background-color: #1a1c1e;
    color: #e0e0e0;
    background-image: radial-gradient(circle at 10% 10%, rgba(0, 118, 255, 0.3) 0%, transparent 40%), radial-gradient(circle at 90% 90%, rgba(110, 86, 207, 0.3) 0%, transparent 40%);
  }
  
  .calendar-header {
    @include dark-glass-effect;
    .calendar-title {
      font-size: 1.6rem;
      font-weight: 800;
      letter-spacing: -0.5px;
      background: linear-gradient(135deg, #0076ff, #6e56cf);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      margin: 0;
      text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }
  }
  
  .calendar-body {
    @include dark-glass-effect;
  }
  
  .calendar-day {
    background: #2a2a2a;
    
    &.today {
      background: rgba(0, 118, 255, 0.15);
      .day-number {
        color: #3399ff;
      }
    }
    
    &.other-month {
      opacity: 0.35;
      background: #222;
    }
    
    &.holiday {
      background: rgba(255, 59, 48, 0.15);
      .day-number {
        color: #ff6b6b;
      }
      .holiday-name {
        color: #ff6b6b;
      }
    }
    
    &.weekend {
      background: rgba(110, 86, 207, 0.15);
      .day-number {
        color: #a799e6;
      }
    }
    
    .day-number {
      color: #6e56cf;
    }
    
    .lunar-date {
      color: #a0a0a0;
    }
    
    .holiday-name {
      color: #ff6b6b;
    }
    
    .solar-term {
      color: #9f86e3;
    }
    
    .workday-adjustment {
      color: #80c4ff;
    }
  }
  
  .holidays-section {
    @include dark-glass-effect;
    
    .holiday-name {
      color: #e0e0e0;
    }
    
    .holiday-date {
      color: #a0a0a0;
    }
    
    .holiday-countdown {
      color: #3399ff;
      
      .today-highlight {
        color: #ff6b6b;
      }
    }
  }
  
  .task-section {
    @include dark-glass-effect;
  }
  
  .milestone-section {
    @include glass-effect;
    padding: 24px;
    border-radius: 20px;
    margin-top: 20px;
  
    h3 {
      margin-top: 0;
      font-size: 1.3rem;
      display: flex;
      align-items: center;
      gap: 10px;
  
      &::before {
        content: "";
        width: 4px;
        height: 20px;
        background: #ff6b35; // 橙色，表示重要事件
        border-radius: 10px;
        box-shadow: 0 0 8px rgba(255, 107, 53, 0.4);
      }
    }
  }
  
  .custom-select-group {
    background: #333;
    border: 1px solid rgba(100, 150, 255, 0.15);
    
    &:hover {
      border-color: #3399ff;
    }
  }
  
  .nav-btn {
    color: #a0a0a0;
    
    &:hover {
      background: rgba(26, 153, 255, 0.1);
      color: #3399ff;
    }
  }
  
  .dropdown-trigger {
    color: #e0e0e0;
  }
  
  .dropdown-menu {
    background-color: #333;
    border: 1px solid rgba(100, 150, 255, 0.15);
    
    li {
      color: #a0a0a0;
      
      &:hover {
        background-color: #444;
        color: #3399ff;
      }
      
      &.active {
        color: #3399ff;
        background-color: rgba(51, 153, 255, 0.2);
      }
    }
  }
  
  .today-btn {
    background: #1a8cff;
    color: #fff;
    
    &:hover {
      background: #3399ff;
    }
  }
}

// --- 头部与控制器优化 ---
.calendar-header {
  @include glass-effect;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
  padding: 16px 24px;
  border-radius: 16px;
  position: relative;
  z-index: 20;

  .calendar-title {
    font-size: 1.6rem;
    font-weight: 800;
    letter-spacing: -0.5px;
    background: linear-gradient(135deg, #0076ff, #6e56cf);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    margin: 0;
  }
}

.custom-select-group {
  display: flex;
  align-items: center;
  background: white;
  border-radius: 12px;
  padding: 4px;
  border: 1px solid rgba(0, 0, 0, 0.1);
  transition: all 0.3s;

  &:hover {
    border-color: #0076ff;
  }
}

.calendar-controls {
  display: flex;
  align-items: center;
  gap: 16px;

  .year-selector,
  .month-selector {
    display: flex;
    align-items: center;
    background: white;
    border: 1px solid rgba(0, 0, 0, 0.08);
    border-radius: 8px;
    padding: 2px;
    transition: all 0.3s;

    &:hover {
      border-color: #0076ff;
      box-shadow: 0 0 0 3px rgba(0, 118, 255, 0.1);
    }
  }

  .nav-btn {
    background: transparent;
    border: none;
    color: #64748b;
    width: 32px;
    height: 32px;
    cursor: pointer;
    font-size: 1.1rem;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 6px;
    transition: all 0.2s;

    &:hover {
      background: rgba(0, 118, 255, 0.05);
      color: #0076ff;
    }
  }

  .custom-dropdown {
    position: relative;
    min-width: 90px;
    user-select: none;

    .dropdown-trigger {
      padding: 0 10px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
      color: #1d1d1f;
      cursor: pointer;
      gap: 6px;

      .arrow-icon {
        font-size: 8px;
        transition: transform 0.3s;

        &.rotate {
          transform: rotate(180deg);
        }
      }
    }
    .dropdown-menu {
      // 定位与层级
      position: absolute;
      top: 100%;
      left: 0;
      z-index: 1000;

      // 布局
      margin: 4px 0 0;
      padding: 6px 0;
      min-width: 120px;
      max-height: 280px;
      overflow-y: auto;
      list-style: none;

      // 视觉样式
      background-color: #ffffff;
      border: 1px solid #e4e7ed;
      border-radius: 4px;
      box-shadow: 0 4px 12px 0 rgba(0, 0, 0, 0.1);

      // 自定义滚动条样式
      &::-webkit-scrollbar {
        width: 5px;
      }
      &::-webkit-scrollbar-thumb {
        background: #dcdfe6;
        border-radius: 10px;
      }
      &::-webkit-scrollbar-track {
        background: transparent;
      }

      li {
        font-size: 14px;
        padding: 10px 20px;
        color: #606266;
        cursor: pointer;
        white-space: nowrap;
        transition: all 0.2s cubic-bezier(0.645, 0.045, 0.355, 1);

        // 悬浮状态
        &:hover {
          background-color: #f5f7fa;
          color: #409eff;
        }

        // 选中状态
        &.active {
          color: #409eff;
          background-color: #ecf5ff;
          font-weight: 500;

          // 选中时左侧加一个小指示条 (可选设计)
          position: relative;
          &::before {
            content: "";
            position: absolute;
            left: 0;
            top: 0;
            bottom: 0;
            width: 3px;
            background-color: #409eff;
          }
        }

        // 最后一个元素去掉底边距
        &:last-child {
          border-bottom: none;
        }
      }
    }
  }

  // --- 动画效果 ---
  .fade-slide-enter-active,
  .fade-slide-leave-active {
    transition: all 0.2s ease;
  }

  .fade-slide-enter-from,
  .fade-slide-leave-to {
    opacity: 0;
    transform: translate(-50%, -10px);
  }

  .today-btn {
    background: #0076ff;
    border: none;
    color: white;
    padding: 8px 20px;
    border-radius: 8px;
    font-weight: 600;
    font-size: 0.9rem;
    cursor: pointer;
    transition: all 0.3s;
    box-shadow: 0 4px 12px rgba(0, 118, 255, 0.2);

    &:hover {
      background: #006ce6;
      transform: translateY(-1px);
      box-shadow: 0 6px 16px rgba(0, 118, 255, 0.3);
    }

    &:active {
      transform: translateY(0);
    }
  }
  
  .button-group {
    display: flex;
    gap: 10px;
    align-items: center;
  }
  
  .theme-btn {
    background: #6e56cf;
    border: none;
    color: white;
    width: 36px;
    height: 36px;
    border-radius: 8px;
    font-size: 1rem;
    cursor: pointer;
    transition: all 0.3s;
    box-shadow: 0 4px 12px rgba(#6e56cf, 0.2);
    display: flex;
    align-items: center;
    justify-content: center;
    
    &:hover {
      background: #654db7;
      transform: translateY(-1px);
      box-shadow: 0 6px 16px rgba(#6e56cf, 0.3);
    }
    
    &.dark-mode-active {
      background: #333;
      box-shadow: 0 0 10px rgba(255, 255, 255, 0.2);
    }
  }
  
  // 月份切换动画
  .slide-month-enter-active,
  .slide-month-leave-active {
    transition: all 0.3s ease;
  }
  
  .slide-month-enter-from {
    opacity: 0;
    transform: translateX(-20px);
  }
  
  .slide-month-leave-to {
    opacity: 0;
    transform: translateX(20px);
  }
}

// --- 日历主体优化 ---
.calendar-body {
  @include glass-effect;
  border-radius: 20px;
  overflow: hidden;
  margin-bottom: 30px;
  background: rgba(255, 255, 255, 0.5);
}

.week-header {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  background: rgba(0, 0, 0, 0.02);
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);

  .week-day {
    padding: 16px;
    text-align: center;
    color: #86868b;
    font-weight: 700;
    font-size: 0.85rem;
    text-transform: uppercase;
    letter-spacing: 1px;
  }
}

.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 1px;
  background: rgba(0, 0, 0, 0.04); // 网格线颜色
}

.calendar-day {
  background: white;
  padding: 14px;
  min-height: 110px;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  flex-direction: column;
  position: relative;

  &:hover {
    background: rgba(#0076ff, 0.02);
    z-index: 2;
    transform: scale(1.02);
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.05);
  }

  &.today {
    background: rgba(#0076ff, 0.03);
    &::after {
      content: "";
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 3px;
      background: #0076ff;
    }
    .day-number {
      color: #0076ff;
      font-weight: 800;
    }
  }

  &.other-month {
    opacity: 0.35;
    background: #fafafa;
  }

  &.holiday {
    background: rgba(#ff3b30, 0.02);
    .day-number {
      color: #ff3b30;
    }
    .holiday-name {
      color: #ff3b30;
    }
  }

  &.weekend {
    background: rgba(#6e56cf, 0.01);
    .day-number {
      color: #7d68d6;
    }
  }

  .day-number {
    font-size: 1.25rem;
    font-weight: 500;
    margin-bottom: 4px;
    font-family: "JetBrains Mono", "Courier New", monospace;
  }

  .lunar-date {
    font-size: 0.75rem;
    color: #86868b;
  }

  .holiday-name {
    margin-top: auto;
    font-size: 0.7rem;
    font-weight: 700;
    padding: 2px 6px;
    background: rgba(255, 59, 48, 0.1);
    border-radius: 4px;
    width: fit-content;
  }
  
  // 补班调整
  .workday-adjustment {
    font-size: 0.6rem;
    color: #409eff; // 蓝色，表示补班
    font-weight: bold;
    margin-top: 2px;
    text-align: center;
    padding: 1px 4px;
    border-radius: 3px;
    background-color: rgba(64, 158, 255, 0.1); // 淡蓝色背景
    width: fit-content;
    align-self: center;
  }
  
  // 二十四节气
  .solar-term {
    font-size: 0.6rem;
    color: #6e56cf; // 紫色，与节日区分
    font-weight: bold;
    margin-top: 2px;
    text-align: center;
    padding: 1px 4px;
    border-radius: 3px;
    background-color: rgba(110, 86, 207, 0.1); // 淡紫色背景
    width: fit-content;
    align-self: center;
  }
  
  // 任务指示器
  .task-indicator {
    position: absolute;
    top: 4px;
    right: 4px;
    background-color: #ff6b6b;
    color: white;
    border-radius: 50%;
    width: 18px;
    height: 18px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.7rem;
    font-weight: bold;
  }
}

// 日历下方的区域，包含节假日和任务管理
.calendar-sections {
  // display: grid;
  // grid-template-columns: 1fr 1fr;
  // gap: 20px;
  margin-top: 20px;
  align-items: start;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
}

// --- 节假日列表优化 ---
.holidays-section {
  @include glass-effect;
  padding: 24px;
  border-radius: 20px;
  display: flex;
  flex-direction: column;

  h2 {
    margin-top: 0;
    font-size: 1.3rem;
    display: flex;
    align-items: center;
    gap: 10px;
    flex-shrink: 0;

    &::before {
      content: "";
      width: 4px;
      height: 20px;
      background: #0076ff;
      border-radius: 10px;
      box-shadow: 0 0 8px rgba(#0076ff, 0.4);
    }
  }
}

.holidays-list {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-top: 24px;
  // overflow-y: auto;
  flex: 1;
}

.holiday-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: white;
  border: 1px solid rgba(0, 0, 0, 0.05);
  border-radius: 12px;
  transition: all 0.3s;

  &:hover {
    transform: translateX(5px);
    border-color: rgba(#0076ff, 0.3);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);
  }

  &.current {
    background: rgba(#0076ff, 0.02);
    border-left: 4px solid #0076ff;
  }

  .holiday-info {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .holiday-name {
    font-weight: 700;
    color: #1a1c1e;
    font-size: 1rem;
    background: none;
  }

  .holiday-date {
    color: #86868b;
    font-size: 0.8rem;
    margin: 0;
  }

  .holiday-countdown {
    font-weight: 700;
    font-size: 0.9rem;
    color: #0076ff;

    .today-highlight {
      color: #ff3b30;
      text-transform: uppercase;
      font-style: italic;
    }
  }
  
  .empty-state {
    text-align: center;
    padding: 40px 20px;
    color: #86868b;
    
    .empty-icon {
      font-size: 3rem;
      margin-bottom: 15px;
    }
    
    p {
      margin: 8px 0;
    }
    
    .empty-subtitle {
      font-size: 0.9rem;
      color: #888;
    }
  }
}

.tasks-wrapper {
  @include glass-effect;
  border-radius: 20px;
  margin-top: 20px;
  padding: 24px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

// 任务管理区域
.task-section {
  display: flex;
  flex-direction: column;
  flex: 1;
  overflow: hidden;

  h2 {
    margin-top: 0;
    font-size: 1.3rem;
    display: flex;
    align-items: center;
    gap: 10px;
    flex-shrink: 0;

    &::before {
      content: "";
      width: 4px;
      height: 20px;
      background: #6e56cf;
      border-radius: 10px;
      box-shadow: 0 0 8px rgba(#6e56cf, 0.4);
    }
      
    .task-date {
      font-size: 0.9rem;
      color: #86868b;
      font-weight: normal;
    }
  }

  :deep(.task-manager) {
    flex: 1;
    overflow-y: auto;
    max-height: calc(500px - 24px - 24px - 50px);
  }
}
  
.milestone-section {
  @include glass-effect;
  padding: 24px;
  border-radius: 20px;
  margin-top: 20px;
  
  h3 {
    margin-top: 0;
    font-size: 1.3rem;
    display: flex;
    align-items: center;
    gap: 10px;
  
    &::before {
      content: "";
      width: 4px;
      height: 20px;
      background: #ff6b35; // 橙色，表示重要事件
      border-radius: 10px;
      box-shadow: 0 0 8px rgba(255, 107, 53, 0.4);
    }
  }
}

// --- 响应式适配 ---
@media (max-width: 768px) {
  .calendar-header {
    flex-direction: column;
    gap: 15px;
    text-align: center;
  }

  .calendar-day {
    min-height: 85px;
    padding: 8px;
    .day-number {
      font-size: 1rem;
    }
  }

  .holidays-list {
    grid-template-columns: 1fr;
  }
}

// 自定义模态框样式
.custom-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.custom-modal {
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
  width: 90%;
  max-width: 400px;
  overflow: hidden;
}

.custom-modal-header {
  padding: 20px;
  border-bottom: 1px solid #eee;
  background: #f9f9f9;
}

.custom-modal-header h3 {
  margin: 0;
  color: #333;
}

.custom-modal-body {
  padding: 20px;
}

.custom-modal-body p {
  margin: 0;
  color: #666;
  line-height: 1.5;
}

.custom-modal-footer {
  padding: 15px 20px;
  border-top: 1px solid #eee;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.btn-cancel, .btn-confirm {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.btn-cancel {
  background: #f0f0f0;
  color: #666;
}

.btn-cancel:hover {
  background: #e0e0e0;
}

.btn-confirm {
  background: #409eff;
  color: white;
}

.btn-confirm:hover {
  background: #66b1ff;
}

// 天气信息样式
.weather-info {
  background: white;
  border-radius: 12px;
  padding: 15px;
  margin: 10px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.weather-main {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 15px;
}

.weather-location {
  display: flex;
  align-items: center;
  gap: 8px;
}

.city-selector-container {
  position: relative;
  min-width: 120px;
}

.city-selector {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  background: white;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    border-color: #0076ff;
  }

  .selected-city {
    font-weight: 500;
    color: #333;
  }

  .arrow-icon {
    font-size: 10px;
    color: #999;
    transition: transform 0.3s ease;

    &.rotate {
      transform: rotate(180deg);
    }
  }
}

.city-dropdown {
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  background: white;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
  z-index: 1000;
  max-height: 320px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.city-search-input {
  padding: 12px 16px;
  border: none;
  border-bottom: 1px solid #eee;
  font-size: 14px;
  outline: none;
  width: 100%;

  &:focus {
    background: #f8f9fa;
  }
}

.city-list {
  overflow-y: auto;
  max-height: 240px;
  padding: 8px;
}

.city-item {
  padding: 10px 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 14px;
  color: #333;

  &:hover {
    background: #f0f4f8;
  }

  &.active {
    background: #e6f0ff;
    color: #0076ff;
    font-weight: 500;
  }
}

.no-results {
  padding: 20px;
  text-align: center;
  color: #999;
  font-size: 14px;
}

.weather-temperature {
  font-size: 1.5rem;
  font-weight: bold;
  color: #333;
}

.weather-condition {
  font-size: 1rem;
  color: #666;
}

.weather-condition-wrapper {
  display: flex;
  align-items: center;
  gap: 8px;
}

.weather-icon {
  width: 28px;
  height: 28px;
  object-fit: contain;
}

.weather-details {
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
}

.detail-row {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.9rem;
  color: #666;
  background: #f5f7fa;
  padding: 6px 12px;
  border-radius: 16px;
}

.detail-label {
  color: #999;
  font-size: 0.8rem;
}

.weather-tips {
  margin-top: 12px;
  padding: 12px 16px;
  background: linear-gradient(135deg, #e8f4ff 0%, #f0f7ff 100%);
  border-radius: 10px;
  font-size: 0.9rem;
  color: #4a6fa5;
  line-height: 1.6;
  border-left: 3px solid #0076ff;
}

@media (max-width: 768px) {
  .weather-main {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
  
  .detail-row {
    gap: 8px;
  }
  
  .detail-item {
    padding: 5px 10px;
    font-size: 0.85rem;
  }
}
</style>
