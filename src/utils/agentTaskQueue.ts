// Client-Side Agent Task Queue Mechanism
// Ensures that autonomous background processes and API requests execute sequentially (FIFO)
// to prevent concurrent API rate-limit bottlenecks (429 Too Many Requests).

export interface AgentTask<T = any> {
  id: string;
  name: string;
  type: "agent_scan" | "verification" | "audit" | "sync" | "community";
  fn: () => Promise<T>;
  status: "pending" | "processing" | "completed" | "failed";
  createdAt: number;
  startedAt?: number;
  completedAt?: number;
  error?: string;
  result?: T;
}

export type QueueListener = (status: {
  pendingCount: number;
  isProcessing: boolean;
  currentTaskName?: string;
  completedCount: number;
  failedCount: number;
}) => void;

class AgentTaskQueueManager {
  private queue: AgentTask[] = [];
  private isProcessing = false;
  private currentTask: AgentTask | null = null;
  private completedCount = 0;
  private failedCount = 0;
  private listeners: QueueListener[] = [];
  private interTaskDelayMs = 300; // 300ms gap between tasks to prevent rate limiting

  constructor(delayMs: number = 300) {
    this.interTaskDelayMs = delayMs;
  }

  /**
   * Enqueues an async function as a task to be executed sequentially.
   */
  public enqueue<T>(
    name: string,
    type: AgentTask["type"],
    fn: () => Promise<T>
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      const task: AgentTask<T> = {
        id: `task_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        name,
        type,
        fn: async () => {
          try {
            const res = await fn();
            resolve(res);
            return res;
          } catch (err) {
            reject(err);
            throw err;
          }
        },
        status: "pending",
        createdAt: Date.now(),
      };

      this.queue.push(task);
      this.notifyListeners();
      this.processQueue();
    });
  }

  /**
   * Main sequential execution loop.
   */
  private async processQueue() {
    if (this.isProcessing || this.queue.length === 0) {
      return;
    }

    this.isProcessing = true;
    this.currentTask = this.queue.shift() || null;

    if (!this.currentTask) {
      this.isProcessing = false;
      this.notifyListeners();
      return;
    }

    this.currentTask.status = "processing";
    this.currentTask.startedAt = Date.now();
    this.notifyListeners();

    try {
      this.currentTask.result = await this.currentTask.fn();
      this.currentTask.status = "completed";
      this.currentTask.completedAt = Date.now();
      this.completedCount++;
    } catch (error: any) {
      this.currentTask.status = "failed";
      this.currentTask.error = String(error?.message || error || "Task execution failed");
      this.failedCount++;
      console.warn(`[Agent Task Queue] Task "${this.currentTask.name}" failed:`, error);
    } finally {
      this.currentTask = null;
      this.notifyListeners();

      // Enforce controlled delay between sequential tasks to avoid API rate bottlenecks
      await new Promise((res) => setTimeout(res, this.interTaskDelayMs));

      this.isProcessing = false;

      // Continue processing remaining items in queue
      if (this.queue.length > 0) {
        this.processQueue();
      } else {
        this.notifyListeners();
      }
    }
  }

  /**
   * Register state update listener for UI widgets.
   */
  public subscribe(listener: QueueListener): () => void {
    this.listeners.push(listener);
    // Send immediate initial status
    this.notifyStatus(listener);

    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notifyListeners() {
    this.listeners.forEach((listener) => this.notifyStatus(listener));
  }

  private notifyStatus(listener: QueueListener) {
    listener({
      pendingCount: this.queue.length,
      isProcessing: this.isProcessing,
      currentTaskName: this.currentTask?.name,
      completedCount: this.completedCount,
      failedCount: this.failedCount,
    });
  }

  /**
   * Get current snapshot of queue metrics.
   */
  public getMetrics() {
    return {
      pendingCount: this.queue.length,
      isProcessing: this.isProcessing,
      currentTaskName: this.currentTask?.name,
      completedCount: this.completedCount,
      failedCount: this.failedCount,
    };
  }
}

// Global Singleton Instance
export const agentTaskQueue = new AgentTaskQueueManager(350);
