import { DatabaseSync } from 'node:sqlite';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { config } from '../config.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class DatabaseManager {
  private db: DatabaseSync | null = null;
  private isInitialized = false;

  public getDb(): DatabaseSync {
    if (!this.db) {
      this.init();
    }
    return this.db!;
  }

  public init(customPath?: string): void {
    const dbPath = customPath || config.dbPath;
    
    // Ensure parent directory exists
    const dir = path.dirname(dbPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    this.db = new DatabaseSync(dbPath);

    // Enable WAL mode & foreign keys
    this.db.exec('PRAGMA journal_mode = WAL;');
    this.db.exec('PRAGMA foreign_keys = ON;');

    // Load schema
    const schemaPath = path.resolve(__dirname, 'schema.sql');
    if (fs.existsSync(schemaPath)) {
      const schemaSql = fs.readFileSync(schemaPath, 'utf8');
      this.db.exec(schemaSql);
    }

    this.isInitialized = true;
  }

  public close(): void {
    if (this.db) {
      this.db.close();
      this.db = null;
      this.isInitialized = false;
    }
  }

  public query<T = any>(sql: string, params: any[] = []): T[] {
    const stmt = this.getDb().prepare(sql);
    return stmt.all(...params) as T[];
  }

  public queryOne<T = any>(sql: string, params: any[] = []): T | null {
    const stmt = this.getDb().prepare(sql);
    const row = stmt.get(...params);
    return (row as T) || null;
  }

  public run(sql: string, params: any[] = []): { changes: number | bigint; lastInsertRowid: number | bigint } {
    const stmt = this.getDb().prepare(sql);
    return stmt.run(...params);
  }
}

export const dbManager = new DatabaseManager();
