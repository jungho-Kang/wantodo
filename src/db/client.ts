import { type SQLiteDatabase, openDatabaseSync } from 'expo-sqlite';
import { CREATE_TASKS_DATE_INDEX, CREATE_TASKS_TABLE, DB_NAME } from './schema';

let db: SQLiteDatabase | null = null;

export function getDb(): SQLiteDatabase {
  if (!db) {
    db = openDatabaseSync(DB_NAME);
    db.execSync(CREATE_TASKS_TABLE);
    db.execSync(CREATE_TASKS_DATE_INDEX);
  }
  return db;
}
