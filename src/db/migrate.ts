import { dirname, resolve } from "path";
import { fileURLToPath } from "url";
import { readFileSync } from "fs";
import db from "./index";
import { logger } from "../utils/logger";
import bcrypt from "bcryptjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Run database migration — creates all tables if they don't exist.
 */
export async function runMigration(): Promise<void> {
  try {
    logger.info("Running database migration...");

    const schemaPath = resolve(
      __dirname,
      "../schemas/schema.sqlite.sql"
    );
    const schema = readFileSync(schemaPath, "utf-8");

    // Strip all SQL comments (-- line comments) and blank lines
    const cleaned = schema
      .split("\n")
      .map((line) => {
        // Remove inline comments (but not inside strings)
        const commentIndex = line.indexOf("--");
        if (commentIndex >= 0) {
          return line.substring(0, commentIndex);
        }
        return line;
      })
      .join("\n");

    // Split by semicolons and filter empty statements
    const statements = cleaned
      .split(";")
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    // Execute each statement individually
    for (const statement of statements) {
      try {
        await db.execute(statement);
      } catch (err: any) {
        // Ignore "table already exists" type errors
        if (err.message?.includes("already exists")) {
          logger.debug(`Table already exists, skipping: ${statement.slice(0, 50)}...`);
          continue;
        }
        throw err;
      }
    }

    logger.info("Database migration completed successfully");
  } catch (error) {
    logger.error({ error }, "Database migration failed");
    throw error;
  }
}

/**
 * Seed admin user if not exists.
 */
export async function seedAdmin(): Promise<void> {
  try {
    const existing = await db.execute({
      sql: "SELECT id_anggota FROM anggota WHERE role = ?",
      args: ["admin"],
    });

    if (existing.rows.length > 0) {
      logger.info("Admin user already exists, skipping seed");
      return;
    }

    logger.info("Seeding admin user...");

    // 1. Insert pendaftaran record for admin
    const pendaftaranResult = await db.execute({
      sql: `INSERT INTO pendaftaran (nama_lengkap, nim, email, status_pendaftaran) 
            VALUES (?, ?, ?, ?)`,
      args: ["Administrator", "ADMIN001", "admin@risalah.ac.id", "diterima"],
    });

    const idPendaftaran = Number(pendaftaranResult.lastInsertRowid);

    // 2. Hash password
    const hashedPassword = await bcrypt.hash("admin123", 12);

    // 3. Insert admin anggota
    await db.execute({
      sql: `INSERT INTO anggota (id_pendaftaran, no_anggota, username, password, role, tanggal_aktif, status_anggota) 
            VALUES (?, ?, ?, ?, ?, ?, ?)`,
      args: [
        idPendaftaran,
        "RSL-2026-0000",
        "admin",
        hashedPassword,
        "admin",
        new Date().toISOString().split("T")[0],
        "aktif",
      ],
    });

    logger.info("Admin user seeded (username: admin, password: admin123)");
  } catch (error) {
    logger.error({ error }, "Admin seed failed");
    throw error;
  }
}
