<template>
  <div class="task-manager">
    <!-- 任务表单 -->
    <div class="task-form" v-if="showForm">
      <h3>{{ editingTask ? '编辑任务' : '添加任务' }}</h3>
      <form @submit.prevent="saveTask">
        <div class="form-group">
          <label for="task-title">任务标题</label>
          <input 
            id="task-title"
            v-model="currentTask.title" 
            type="text" 
            placeholder="输入任务标题"
            required
          />
        </div>
        
        <div class="form-group">
          <label for="task-type">任务类型</label>
          <select id="task-type" v-model="currentTask.type">
            <option value="工作">工作</option>
            <option value="生活">生活</option>
            <option value="生日">生日</option>
            <option value="其他">其他</option>
          </select>
        </div>
        
        <div class="form-group">
          <label for="task-description">描述</label>
          <textarea 
            id="task-description"
            v-model="currentTask.description" 
            placeholder="任务描述（可选）"
          ></textarea>
        </div>
        
        <div class="form-actions">
          <button type="submit" class="btn btn-primary">
            {{ editingTask ? '更新' : '添加' }}
          </button>
          <button type="button" class="btn btn-secondary" @click="cancelEdit">
            取消
          </button>
        </div>
      </form>
    </div>
    
    <!-- 任务列表 -->
    <div class="task-list">
      <div class="task-list-header">
        <h3>
          任务列表
          <span class="task-count">({{ tasks.length }})</span>
        </h3>
        <button 
          class="btn btn-primary btn-add" 
          @click="showForm = !showForm"
        >
          {{ showForm ? '取消' : '+' }}
        </button>
      </div>
      
      <div 
        v-for="task in tasks" 
        :key="task.id" 
        :class="['task-item', { completed: task.completed }]"
      >
        <div class="task-content" @click="toggleTask(task)">
          <div class="task-checkbox">
            <input 
              :id="`task-${task.id}`"
              type="checkbox" 
              :checked="task.completed"
              @change="toggleTask(task)"
            />
            <label :for="`task-${task.id}`"></label>
          </div>
          
          <div class="task-info">
            <div class="task-title">{{ task.title }}</div>
            <div class="task-meta">
              <span class="task-type" :class="task.type">{{ task.type }}</span>
              <span class="task-date">{{ formatDate(task.createdAt) }}</span>
            </div>
            <div v-if="task.description" class="task-description">
              {{ task.description }}
            </div>
          </div>
        </div>
        
        <div class="task-actions">
          <button 
            class="btn btn-icon" 
            @click="editTask(task)"
            title="编辑"
          >
            ✏️
          </button>
          <button 
            class="btn btn-icon" 
            @click="deleteTask(task.id!)"
            title="删除"
          >
            🗑️
          </button>
        </div>
      </div>
      
      <div v-if="tasks.length === 0" class="empty-state">
        暂无任务，点击+添加第一个任务
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { dbService, Task } from './indexedDBService';

// 响应式数据
const tasks = ref<Task[]>([]);
const showForm = ref(false);
const editingTask = ref<Task | null>(null);

const currentTask = ref<Omit<Task, 'id' | 'createdAt'>>({
  title: '',
  date: '', // 添加缺失的date字段
  type: '其他',
  completed: false,
  description: ''
});

// 方法
const loadTasks = async () => {
  try {
    tasks.value = await dbService.getAllTasks();
  } catch (error) {
    console.error('加载任务失败:', error);
  }
};

const saveTask = async () => {
  try {
    if (editingTask.value) {
      // 更新现有任务
      await dbService.updateTask(editingTask.value.id!, {
        title: currentTask.value.title,
        date: currentTask.value.date,
        type: currentTask.value.type,
        description: currentTask.value.description
      });
    } else {
      // 添加新任务
      await dbService.addTask(currentTask.value);
    }
    
    // 重置表单
    resetForm();
    // 重新加载任务列表
    await loadTasks();
  } catch (error) {
    console.error('保存任务失败:', error);
  }
};

const toggleTask = async (task: Task) => {
  try {
    const updatedCompleted = !task.completed;
    await dbService.updateTask(task.id!, { completed: updatedCompleted });
    // 更新本地状态
    task.completed = updatedCompleted;
  } catch (error) {
    console.error('更新任务状态失败:', error);
  }
};

const editTask = (task: Task) => {
  editingTask.value = { ...task };
  currentTask.value = {
    title: task.title,
    date: task.date,
    type: task.type,
    completed: task.completed,
    description: task.description || ''
  };
  showForm.value = true;
};

const deleteTask = async (id: number) => {
  // 使用自定义模态框替换原生confirm
  if (props.showCustomModal) {
    props.showCustomModal('删除任务', '确定要删除这个任务吗？', async () => {
      try {
        await dbService.deleteTask(id);
        await loadTasks(); // 重新加载任务列表
      } catch (error) {
        console.error('删除任务失败:', error);
      }
    });
  }
};

const cancelEdit = () => {
  resetForm();
};

const resetForm = () => {
  showForm.value = false;
  editingTask.value = null;
  currentTask.value = {
    title: '',
    date: '', // 添加缺失的date字段
    type: '其他',
    completed: false,
    description: ''
  };
};

const formatDate = (date: Date | string) => {
  if (typeof date === 'string') {
    date = new Date(date);
  }
  return new Date(date).toLocaleDateString('zh-CN');
};

// 监听任务变化，当传入特定日期时过滤任务
interface Props {
  selectedDate?: string;
  showCustomModal?: (title: string, content: string, action?: () => void) => void;
}

const props = withDefaults(defineProps<Props>(), {
  selectedDate: undefined,
  showCustomModal: () => {}
});

// 初始化
onMounted(async () => {
  // 设置当前选中日期的默认值
  if (props.selectedDate) {
    currentTask.value.date = props.selectedDate;
    tasks.value = await dbService.getTasksByDate(props.selectedDate);
  } else {
    await loadTasks();
  }
});

// 如果传入了特定日期，则只显示该日期的任务
watch(() => props.selectedDate, async (newDate) => {
  if (newDate) {
    currentTask.value.date = newDate;
    tasks.value = await dbService.getTasksByDate(newDate);
  } else {
    await loadTasks();
  }
});

</script>

<style scoped>
.task-manager {
  background: white;
  border-radius: 12px;
  padding: 20px;
  margin-top: 20px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.task-form {
  margin-bottom: 20px;
  padding: 15px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  background-color: #fafafa;
}

.task-form h3 {
  margin-top: 0;
  margin-bottom: 15px;
  color: #333;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: 500;
  color: #555;
}

.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.form-group textarea {
  min-height: 80px;
  resize: vertical;
}

.form-actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
}

.task-list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.task-list-header h3 {
  margin: 0;
  color: #333;
}

.task-count {
  color: #666;
  font-size: 0.9em;
  font-weight: normal;
}

.btn-add {
  width: 36px;
  height: 36px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
}

.task-item {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 12px;
  margin-bottom: 8px;
  border: 1px solid #eee;
  border-radius: 6px;
  transition: all 0.2s;
}

.task-item:hover {
  border-color: #ddd;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.task-item.completed {
  opacity: 0.7;
  background-color: #f8f8f8;
}

.task-content {
  display: flex;
  flex: 1;
  cursor: pointer;
}

.task-checkbox {
  margin-right: 12px;
  display: flex;
  align-items: flex-start;
}

.task-checkbox input[type="checkbox"] {
  display: none;
}

.task-checkbox label {
  width: 18px;
  height: 18px;
  border: 2px solid #ddd;
  border-radius: 3px;
  position: relative;
  cursor: pointer;
  transition: all 0.2s;
}

.task-checkbox input[type="checkbox"]:checked + label {
  background-color: #409eff;
  border-color: #409eff;
}

.task-checkbox input[type="checkbox"]:checked + label::after {
  content: '✓';
  position: absolute;
  color: white;
  font-size: 12px;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.task-info {
  flex: 1;
}

.task-title {
  font-weight: 500;
  margin-bottom: 4px;
  color: #333;
}

.task-item.completed .task-title {
  text-decoration: line-through;
  color: #999;
}

.task-meta {
  display: flex;
  gap: 10px;
  margin-bottom: 4px;
  font-size: 0.85em;
}

.task-type {
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 0.8em;
}

.task-type.工作 {
  background-color: #e3f2fd;
  color: #1976d2;
}

.task-type.生活 {
  background-color: #e8f5e9;
  color: #388e3c;
}

.task-type.生日 {
  background-color: #fce4ec;
  color: #c2185b;
}

.task-type.其他 {
  background-color: #f5f5f5;
  color: #666;
}

.task-date {
  color: #999;
}

.task-description {
  color: #666;
  font-size: 0.9em;
  margin-top: 4px;
}

.task-actions {
  display: flex;
  gap: 5px;
  margin-left: 10px;
}

.btn {
  padding: 6px 12px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}

.btn-primary {
  background-color: #409eff;
  color: white;
}

.btn-primary:hover {
  background-color: #66b1ff;
}

.btn-secondary {
  background-color: #909399;
  color: white;
}

.btn-secondary:hover {
  background-color: #a6a9ad;
}

.btn-icon {
  width: 28px;
  height: 28px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f0f0f0;
  border-radius: 4px;
}

.btn-icon:hover {
  background: #e0e0e0;
}

.empty-state {
  text-align: center;
  color: #999;
  padding: 30px 0;
  font-style: italic;
}

@media (max-width: 768px) {
  .task-manager {
    margin-top: 20px;
    padding: 15px;
  }
  
  .task-content {
    flex-direction: column;
  }
  
  .task-meta {
    flex-direction: column;
    gap: 4px;
  }
  
  .task-actions {
    margin-top: 10px;
    justify-content: flex-end;
  }
}
</style>