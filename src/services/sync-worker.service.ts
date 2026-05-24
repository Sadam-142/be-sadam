import { syncQueueRepository } from "../repositories/sync-queue.repository";
import { logger } from "../utils/logger";

const WORKER_INTERVAL = 30_000; // 30 seconds
const MAX_RETRIES = 5;

/**
 * Background sync queue worker.
 * Processes pending sync items via setInterval.
 */
export function startSyncWorker(): void {
  logger.info(
    `Sync worker started (interval: ${WORKER_INTERVAL / 1000}s)`
  );

  setInterval(async () => {
    await processSyncQueue();
  }, WORKER_INTERVAL);
}

async function processSyncQueue(): Promise<void> {
  try {
    const pendingItems = await syncQueueRepository.findPending(20);

    if (pendingItems.length === 0) return;

    logger.info(`Processing ${pendingItems.length} sync queue items...`);

    for (const item of pendingItems) {
      try {
        // Process item based on operation
        // In a real scenario, this would sync with external services
        // For now, we mark as success since data is already in our DB

        if (item.retry_count >= MAX_RETRIES) {
          await syncQueueRepository.markFailed(item.id_sync);
          logger.warn(
            `Sync item ${item.id_sync} failed after ${MAX_RETRIES} retries`
          );
          continue;
        }

        // Mark as success
        await syncQueueRepository.markSuccess(item.id_sync);
        logger.debug(`Sync item ${item.id_sync} processed successfully`);
      } catch (error: any) {
        await syncQueueRepository.markFailed(item.id_sync);
        logger.error(
          { error: error.message },
          `Sync item ${item.id_sync} failed`
        );
      }
    }
  } catch (error: any) {
    logger.error({ error: error.message }, "Sync worker error");
  }
}
