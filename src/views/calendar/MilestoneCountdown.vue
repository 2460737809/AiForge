<template>
  <div class="milestone-countdown">
    <h3>重要日倒计时</h3>
    <div class="add-milestone">
      <input 
        v-model="newMilestone.title" 
        type="text" 
        placeholder="输入事件名称"
        class="milestone-input"
      />
      <input 
        v-model="newMilestone.date" 
        type="date" 
        class="date-input"
      />
      <button @click="addMilestone" class="add-btn">添加</button>
    </div>
    
    <div class="milestone-list">
      <div 
        v-for="milestone in milestones" 
        :key="milestone.id" 
        class="milestone-item"
      >
        <div class="milestone-info">
          <div class="milestone-title">{{ milestone.title }}</div>
          <div class="milestone-date">{{ formatDate(milestone.date) }}</div>
        </div>
        <div class="milestone-countdown">
          <span v-if="milestone.daysLeft > 0">还有 {{ milestone.daysLeft }} 天</span>
          <span v-else-if="milestone.daysLeft === 0" class="today">今天!</span>
          <span v-else class="past">已过 {{ Math.abs(milestone.daysLeft) }} 天</span>
        </div>
        <button @click="deleteMilestone(milestone.id!)" class="delete-btn">删除</button>
      </div>
      
      <div v-if="milestones.length === 0" class="empty-state">
        暂无重要日倒计时，添加一个试试看
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { dbService, Milestone } from './indexedDBService';

// 扩展Milestone类型以包含倒计时信息
interface MilestoneWithCountdown extends Milestone {
  daysLeft: number;
}

// 响应式数据
const milestones = ref<MilestoneWithCountdown[]>([]);
const newMilestone = ref({
  title: '',
  date: ''
});

// 方法
const loadMilestones = async () => {
  try {
    const allMilestones = await dbService.getAllMilestones();
    // 计算倒计时天数
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const milestonesWithCountdown = allMilestones.map(m => {
      const milestoneDate = new Date(m.date);
      milestoneDate.setHours(0, 0, 0, 0);
      const timeDiff = milestoneDate.getTime() - today.getTime();
      const daysLeft = Math.ceil(timeDiff / (1000 * 3600 * 24));
      
      return {
        ...m,
        daysLeft
      } as MilestoneWithCountdown;
    });
    
    // 按天数排序，即将来临的排在前面
    milestones.value = milestonesWithCountdown.sort((a, b) => a.daysLeft - b.daysLeft);
  } catch (error) {
    console.error('加载重要日倒计时失败:', error);
  }
};

const addMilestone = async () => {
  if (!newMilestone.value.title || !newMilestone.value.date) {
    if (props.showCustomModal) {
      props.showCustomModal('提示', '请填写完整的事件信息');
    } else {
      alert('请填写完整的事件信息');
    }
    return;
  }
  
  try {
    await dbService.addMilestone({
      title: newMilestone.value.title,
      date: newMilestone.value.date,
      description: ''
    });
    
    // 重置表单
    newMilestone.value = {
      title: '',
      date: ''
    };
    
    // 重新加载倒计时列表
    await loadMilestones();
  } catch (error) {
    console.error('添加重要日倒计时失败:', error);
  }
};

interface Props {
  showCustomModal?: (title: string, content: string, action?: () => void) => void;
}

const props = withDefaults(defineProps<Props>(), {
  showCustomModal: () => {}
});

const deleteMilestone = async (id: number) => {
  // 使用自定义模态框替换原生confirm
  if (props.showCustomModal) {
    props.showCustomModal('删除倒计时', '确定要删除这个重要日倒计时吗？', async () => {
      try {
        await dbService.deleteMilestone(id);
        await loadMilestones(); // 重新加载列表
      } catch (error) {
        console.error('删除重要日倒计时失败:', error);
      }
    });
  }
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
};

onMounted(async () => {
  await loadMilestones();
});
</script>

<style scoped>
.milestone-countdown {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.milestone-countdown h3 {
  margin-top: 0;
  margin-bottom: 15px;
  color: #333;
  display: flex;
  align-items: center;
  gap: 10px;
}

.milestone-countdown h3::before {
  content: "";
  width: 4px;
  height: 20px;
  background: #ff6b35;
  border-radius: 10px;
  box-shadow: 0 0 8px rgba(255, 107, 53, 0.4);
}

.add-milestone {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.milestone-input, .date-input {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.milestone-input {
  flex: 1;
  min-width: 150px;
}

.date-input {
  width: 140px;
}

.add-btn {
  background: #409eff;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 8px 15px;
  cursor: pointer;
  transition: background 0.3s;
}

.add-btn:hover {
  background: #66b1ff;
}

.milestone-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.milestone-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  border: 1px solid #eee;
  border-radius: 6px;
  background-color: #fafafa;
}

.milestone-info {
  flex: 1;
}

.milestone-title {
  font-weight: 500;
  margin-bottom: 4px;
  color: #333;
}

.milestone-date {
  font-size: 0.85em;
  color: #666;
}

.milestone-countdown {
  margin-right: 15px;
  font-weight: 500;
}

.milestone-countdown .today {
  color: #ff6b6b;
  font-weight: bold;
}

.milestone-countdown .past {
  color: #999;
}

.delete-btn {
  background: #ff6b6b;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 6px 12px;
  cursor: pointer;
  transition: background 0.3s;
}

.delete-btn:hover {
  background: #ff5252;
}

.empty-state {
  text-align: center;
  color: #999;
  padding: 20px 0;
  font-style: italic;
}

@media (max-width: 768px) {
  .add-milestone {
    flex-direction: column;
  }
  
  .milestone-input {
    min-width: auto;
  }
  
  .milestone-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
  
  .milestone-countdown {
    align-self: flex-end;
  }
}
</style>