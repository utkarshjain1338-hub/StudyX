/**
 * useDataWorker.ts
 * Hook that provides a persistent Web Worker instance for heavy data processing.
 * Keeps the main thread free so animations stay buttery smooth.
 */
import { useRef, useEffect, useCallback } from "react";

type WorkerTask<T> = {
  type: string;
  payload: unknown;
  resolve: (value: T) => void;
  reject: (reason: string) => void;
};

let workerInstance: Worker | null = null;
const pendingTasks = new Map<string, WorkerTask<unknown>>();

function getWorker(): Worker {
  if (!workerInstance) {
    workerInstance = new Worker(
      new URL("../workers/dataWorker.ts", import.meta.url),
      { type: "module" }
    );

    workerInstance.onmessage = (e: MessageEvent) => {
      const { id, result, error } = e.data;
      const task = pendingTasks.get(id);
      if (!task) return;
      pendingTasks.delete(id);
      if (error) {
        task.reject(error);
      } else {
        task.resolve(result);
      }
    };

    workerInstance.onerror = (e) => {
      console.error("[DataWorker] Error:", e.message);
    };
  }
  return workerInstance;
}

let taskCounter = 0;

export function useDataWorker() {
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  const dispatch = useCallback(<T>(type: string, payload: unknown): Promise<T> => {
    return new Promise<T>((resolve, reject) => {
      const id = `task-${++taskCounter}-${Date.now()}`;
      const worker = getWorker();

      pendingTasks.set(id, {
        type,
        payload,
        resolve: (val) => {
          if (isMounted.current) resolve(val as T);
        },
        reject,
      });

      worker.postMessage({ id, type, payload });
    });
  }, []);

  return { dispatch };
}
