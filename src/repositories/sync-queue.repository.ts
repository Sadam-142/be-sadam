import db from "../db";
import type { SyncQueue } from "../types";

const now = () => new Date().toISOString().replace("T", " ").slice(0, 19);

export const syncQueueRepository = {
  async create(data: Partial<SyncQueue>) {
    const result = await db.execute({
      sql: `INSERT INTO sync_queue 
            (id_anggota, table_name, record_id, operation, data_payload, sync_status, created_at) 
            VALUES (?, ?, ?, ?, ?, ?, ?)`,
      args: [
        data.id_anggota!,
        data.table_name!,
        data.record_id!,
        data.operation!,
        data.data_payload || null,
        data.sync_status || "pending",
        now(),
      ],
    });
    return Number(result.lastInsertRowid);
  },

  async findPending(limit: number = 50): Promise<SyncQueue[]> {
    const result = await db.execute({
      sql: `SELECT * FROM sync_queue 
            WHERE sync_status = 'pending' AND retry_count < 5 
            ORDER BY created_at ASC 
            LIMIT ?`,
      args: [limit],
    });
    return result.rows as unknown as SyncQueue[];
  },

  async markSuccess(idSync: number) {
    await db.execute({
      sql: "UPDATE sync_queue SET sync_status = 'success', synced_at = ? WHERE id_sync = ?",
      args: [now(), idSync],
    });
  },

  async markFailed(idSync: number) {
    await db.execute({
      sql: `UPDATE sync_queue 
            SET sync_status = CASE WHEN retry_count >= 4 THEN 'failed' ELSE 'pending' END,
                retry_count = retry_count + 1 
            WHERE id_sync = ?`,
      args: [idSync],
    });
  },

  async findByAnggota(idAnggota: number): Promise<SyncQueue[]> {
    const result = await db.execute({
      sql: "SELECT * FROM sync_queue WHERE id_anggota = ? ORDER BY created_at DESC",
      args: [idAnggota],
    });
    return result.rows as unknown as SyncQueue[];
  },
};
