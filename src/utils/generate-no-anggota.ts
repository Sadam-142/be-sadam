import db from "../db";

/**
 * Generate nomor anggota otomatis.
 * Format: RSL-{TAHUN}-{SEQUENCE 4 digit}
 * Contoh: RSL-2026-0001
 */
export async function generateNoAnggota(): Promise<string> {
  const tahun = new Date().getFullYear();
  const prefix = `RSL-${tahun}-`;

  const result = await db.execute({
    sql: `SELECT no_anggota FROM anggota 
          WHERE no_anggota LIKE ? 
          ORDER BY no_anggota DESC 
          LIMIT 1`,
    args: [`${prefix}%`],
  });

  let sequence = 1;

  if (result.rows.length > 0) {
    const lastNo = result.rows[0].no_anggota as string;
    const lastSeq = parseInt(lastNo.split("-")[2], 10);
    sequence = lastSeq + 1;
  }

  return `${prefix}${sequence.toString().padStart(4, "0")}`;
}
