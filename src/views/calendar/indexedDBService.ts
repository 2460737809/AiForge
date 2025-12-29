// IndexedDB服务，用于存储日程和待办事项数据
interface Task {
  id?: number;
  title: string;
  date: string; // YYYY-MM-DD
  type: '工作' | '生活' | '生日' | '其他';
  completed: boolean;
  description?: string;
  createdAt: Date;
}

interface Milestone {
  id?: number;
  title: string;
  date: string; // YYYY-MM-DD
  description?: string;
  createdAt: Date;
}

interface WorkdayAdjustment {
  id?: number;
  date: string; // YYYY-MM-DD
  isWorkday: boolean; // true表示补班，false表示节假日
  reason: string;
}

interface SolarTerm {
  id?: number;
  name: string;
  date: string; // YYYY-MM-DD
  description?: string;
}

class IndexedDBService {
  private db: IDBDatabase | null = null;
  private dbName = 'CalendarDB';
  private version = 1;
  private stores = {
    tasks: 'tasks',
    milestones: 'milestones',
    workdayAdjustments: 'workdayAdjustments',
    solarTerms: 'solarTerms'
  };

  constructor() {
    this.initDB();
  }

  private initDB(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => {
        console.error('IndexedDB error:', request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // 创建tasks对象仓库
        if (!db.objectStoreNames.contains(this.stores.tasks)) {
          const taskStore = db.createObjectStore(this.stores.tasks, { keyPath: 'id', autoIncrement: true });
          taskStore.createIndex('date', 'date', { unique: false });
          taskStore.createIndex('type', 'type', { unique: false });
          taskStore.createIndex('completed', 'completed', { unique: false });
        }

        // 创建milestones对象仓库
        if (!db.objectStoreNames.contains(this.stores.milestones)) {
          const milestoneStore = db.createObjectStore(this.stores.milestones, { keyPath: 'id', autoIncrement: true });
          milestoneStore.createIndex('date', 'date', { unique: false });
        }

        // 创建workdayAdjustments对象仓库
        if (!db.objectStoreNames.contains(this.stores.workdayAdjustments)) {
          const workdayStore = db.createObjectStore(this.stores.workdayAdjustments, { keyPath: 'id', autoIncrement: true });
          workdayStore.createIndex('date', 'date', { unique: true });
        }

        // 创建solarTerms对象仓库
        if (!db.objectStoreNames.contains(this.stores.solarTerms)) {
          const solarTermStore = db.createObjectStore(this.stores.solarTerms, { keyPath: 'id', autoIncrement: true });
          solarTermStore.createIndex('date', 'date', { unique: true });
        }
      };
    });
  }

  // 任务相关方法
  async addTask(task: Omit<Task, 'id' | 'createdAt'>): Promise<number> {
    if (!this.db) {
      await this.initDB();
    }

    return new Promise((resolve, reject) => {
      const tx = this.db!.transaction(this.stores.tasks, 'readwrite');
      const store = tx.objectStore(this.stores.tasks);
      
      const newTask: Task = {
        ...task,
        createdAt: new Date()
      };

      const request = store.add(newTask);
      request.onsuccess = () => resolve(request.result as number);
      request.onerror = () => reject(request.error);
    });
  }

  async getTasksByDate(date: string): Promise<Task[]> {
    if (!this.db) {
      await this.initDB();
    }

    return new Promise((resolve, reject) => {
      const tx = this.db!.transaction(this.stores.tasks, 'readonly');
      const index = tx.objectStore(this.stores.tasks).index('date');
      
      const request = index.getAll(IDBKeyRange.only(date));
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async getAllTasks(): Promise<Task[]> {
    if (!this.db) {
      await this.initDB();
    }

    return new Promise((resolve, reject) => {
      const tx = this.db!.transaction(this.stores.tasks, 'readonly');
      const store = tx.objectStore(this.stores.tasks);
      
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async updateTask(id: number, updates: Partial<Task>): Promise<void> {
    if (!this.db) {
      await this.initDB();
    }

    return new Promise((resolve, reject) => {
      const tx = this.db!.transaction(this.stores.tasks, 'readwrite');
      const store = tx.objectStore(this.stores.tasks);
      
      const request = store.get(id);
      request.onsuccess = () => {
        const task = request.result;
        if (task) {
          Object.assign(task, updates);
          const updateRequest = store.put(task);
          updateRequest.onsuccess = () => resolve();
          updateRequest.onerror = () => reject(updateRequest.error);
        } else {
          reject(new Error(`Task with id ${id} not found`));
        }
      };
      request.onerror = () => reject(request.error);
    });
  }

  async deleteTask(id: number): Promise<void> {
    if (!this.db) {
      await this.initDB();
    }

    return new Promise((resolve, reject) => {
      const tx = this.db!.transaction(this.stores.tasks, 'readwrite');
      const store = tx.objectStore(this.stores.tasks);
      
      const request = store.delete(id);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // 里程碑相关方法
  async addMilestone(milestone: Omit<Milestone, 'id' | 'createdAt'>): Promise<number> {
    if (!this.db) {
      await this.initDB();
    }

    return new Promise((resolve, reject) => {
      const tx = this.db!.transaction(this.stores.milestones, 'readwrite');
      const store = tx.objectStore(this.stores.milestones);
      
      const newMilestone: Milestone = {
        ...milestone,
        createdAt: new Date()
      };

      const request = store.add(newMilestone);
      request.onsuccess = () => resolve(request.result as number);
      request.onerror = () => reject(request.error);
    });
  }

  async getMilestonesByDate(date: string): Promise<Milestone[]> {
    if (!this.db) {
      await this.initDB();
    }

    return new Promise((resolve, reject) => {
      const tx = this.db!.transaction(this.stores.milestones, 'readonly');
      const index = tx.objectStore(this.stores.milestones).index('date');
      
      const request = index.getAll(IDBKeyRange.only(date));
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async getAllMilestones(): Promise<Milestone[]> {
    if (!this.db) {
      await this.initDB();
    }

    return new Promise((resolve, reject) => {
      const tx = this.db!.transaction(this.stores.milestones, 'readonly');
      const store = tx.objectStore(this.stores.milestones);
      
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async deleteMilestone(id: number): Promise<void> {
    if (!this.db) {
      await this.initDB();
    }

    return new Promise((resolve, reject) => {
      const tx = this.db!.transaction(this.stores.milestones, 'readwrite');
      const store = tx.objectStore(this.stores.milestones);
      
      const request = store.delete(id);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // 补班调整相关方法
  async addWorkdayAdjustment(adjustment: Omit<WorkdayAdjustment, 'id'>): Promise<number> {
    if (!this.db) {
      await this.initDB();
    }

    return new Promise((resolve, reject) => {
      const tx = this.db!.transaction(this.stores.workdayAdjustments, 'readwrite');
      const store = tx.objectStore(this.stores.workdayAdjustments);
      
      const request = store.add(adjustment);
      request.onsuccess = () => resolve(request.result as number);
      request.onerror = () => reject(request.error);
    });
  }

  async getWorkdayAdjustmentByDate(date: string): Promise<WorkdayAdjustment | undefined> {
    if (!this.db) {
      await this.initDB();
    }

    return new Promise((resolve, reject) => {
      const tx = this.db!.transaction(this.stores.workdayAdjustments, 'readonly');
      const index = tx.objectStore(this.stores.workdayAdjustments).index('date');
      
      const request = index.get(IDBKeyRange.only(date));
      request.onsuccess = () => resolve(request.result || undefined);
      request.onerror = () => reject(request.error);
    });
  }

  async getAllWorkdayAdjustments(): Promise<WorkdayAdjustment[]> {
    if (!this.db) {
      await this.initDB();
    }

    return new Promise((resolve, reject) => {
      const tx = this.db!.transaction(this.stores.workdayAdjustments, 'readonly');
      const store = tx.objectStore(this.stores.workdayAdjustments);
      
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  // 二十四节气相关方法
  async addSolarTerm(solarTerm: Omit<SolarTerm, 'id'>): Promise<number> {
    if (!this.db) {
      await this.initDB();
    }

    return new Promise((resolve, reject) => {
      const tx = this.db!.transaction(this.stores.solarTerms, 'readwrite');
      const store = tx.objectStore(this.stores.solarTerms);
      
      const request = store.add(solarTerm);
      request.onsuccess = () => resolve(request.result as number);
      request.onerror = () => reject(request.error);
    });
  }

  async getSolarTermByDate(date: string): Promise<SolarTerm | undefined> {
    if (!this.db) {
      await this.initDB();
    }

    return new Promise((resolve, reject) => {
      const tx = this.db!.transaction(this.stores.solarTerms, 'readonly');
      const index = tx.objectStore(this.stores.solarTerms).index('date');
      
      const request = index.get(IDBKeyRange.only(date));
      request.onsuccess = () => resolve(request.result || undefined);
      request.onerror = () => reject(request.error);
    });
  }

  async getAllSolarTerms(): Promise<SolarTerm[]> {
    if (!this.db) {
      await this.initDB();
    }

    return new Promise((resolve, reject) => {
      const tx = this.db!.transaction(this.stores.solarTerms, 'readonly');
      const store = tx.objectStore(this.stores.solarTerms);
      
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }
}

// 创建全局实例
export const dbService = new IndexedDBService();
export type { Task, Milestone, WorkdayAdjustment, SolarTerm };