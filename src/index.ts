import { env } from "./config/env";
import { logger } from "./utils/logger";
import { runMigration, seedAdmin } from "./db/migrate";
import { startSyncWorker } from "./services/sync-worker.service";
import app from "./app";

const PORT = env.PORT;

async function bootstrap() {
  try {
    // 1. Run database migration
    await runMigration();

    // 2. Seed admin user
    await seedAdmin();

    // 3. Start sync worker
    startSyncWorker();

    // 4. Start server
    app.listen(PORT, () => {
      logger.info(`Server running on http://localhost:${PORT}`);
      logger.info(`Health check: http://localhost:${PORT}/health`);
      logger.info(`API base: http://localhost:${PORT}/api`);
      logger.info(`Environment: ${env.NODE_ENV}`);
    });
  } catch (error) {
    logger.error({ error }, "Failed to start server");
    process.exit(1);
  }
}

bootstrap();