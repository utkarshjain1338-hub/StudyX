/**
 * dataWorker.ts
 * Web Worker for off-main-thread data processing.
 * Handles sorting, filtering, and computing stats so the UI never hangs.
 */

type WorkerMessage = {
  id: string;
  type: string;
  payload: unknown;
};

self.onmessage = (e: MessageEvent<WorkerMessage>) => {
  const { id, type, payload } = e.data;

  try {
    switch (type) {
      case "SORT_STREAKS": {
        const items = payload as Array<{ currentStreak: number }>;
        const sorted = [...items].sort((a, b) => b.currentStreak - a.currentStreak);
        self.postMessage({ id, result: sorted, error: null });
        break;
      }

      case "FILTER_ACTIVE_STREAKS": {
        const items = payload as Array<{ currentStreak: number }>;
        const filtered = items.filter((t) => t.currentStreak > 0);
        self.postMessage({ id, result: filtered, error: null });
        break;
      }

      case "BUILD_HEATMAP": {
        const history = payload as Array<{ date: string; completedCount: number }>;
        const map: Record<string, number> = {};
        for (const entry of history) {
          map[entry.date] = entry.completedCount;
        }
        self.postMessage({ id, result: map, error: null });
        break;
      }

      case "COMPUTE_COMPLETION_RATE": {
        const { completions, totalTasks, days } = payload as {
          completions: Array<{ completedCount: number }>;
          totalTasks: number;
          days: number;
        };
        if (totalTasks === 0 || days === 0) {
          self.postMessage({ id, result: 0, error: null });
          break;
        }
        const total = completions.reduce((s, d) => s + d.completedCount, 0);
        const rate = (total / (totalTasks * days)) * 100;
        self.postMessage({ id, result: Math.min(100, Math.round(rate)), error: null });
        break;
      }

      default:
        self.postMessage({ id, result: null, error: `Unknown message type: ${type}` });
    }
  } catch (err) {
    self.postMessage({
      id,
      result: null,
      error: err instanceof Error ? err.message : String(err),
    });
  }
};
