import Database from "better-sqlite3";
import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { existsSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";

const DB_PATH = join(__dirname, "..", "..", "data", "nayttotyo.db");

let db: Database.Database | null = null;

// Get the database instance. Creates the database file and tables if they don't exist.
export function getDb(): Database.Database {
  if (!db) {
    // Ensure the data directory exists
    const dbDir = dirname(DB_PATH);
    if (!existsSync(dbDir)) {
      mkdirSync(dbDir, { recursive: true });
    }
    db = new Database(DB_PATH);

    createTables(db);
  }
  return db;
}

// Create all required tables in the database.
export function createTables(database: Database.Database): void {
  database.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      username   TEXT    NOT NULL UNIQUE,
      email      TEXT    NOT NULL UNIQUE,
      password   TEXT    NOT NULL,
      salt       TEXT    NOT NULL,
      created_at TEXT    NOT NULL DEFAULT (datetime('now'))
    );
  `);

  database.exec(`
    CREATE TABLE IF NOT EXISTS sessions (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      token      TEXT    NOT NULL UNIQUE,
      user_id    INTEGER NOT NULL,
      expires_at TEXT    NOT NULL,
      created_at TEXT    NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id)
    );
  `);

  database.exec(`
    CREATE TABLE IF NOT EXISTS contacts (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      subject   TEXT    NOT NULL,
      email     TEXT    NOT NULL,
      message   TEXT    NOT NULL,
      created_at TEXT    NOT NULL DEFAULT (datetime('now'))
    );
  `);
}

// Check whether the database file exists on disk.
export function databaseExists(): boolean {
  const fs = require("node:fs");
  return fs.existsSync(DB_PATH);
}

// Re-export interfaces and helpers so existing imports still work
export interface UserRow {
  id: number;
  username: string;
  email: string;
  password: string;
  salt: string;
  created_at: string;
}

export interface SessionRow {
  id: number;
  token: string;
  user_id: number;
  expires_at: string;
  created_at: string;
}

export function hashPassword(password: string): { salt: string; hash: string } {
  const salt = randomBytes(16).toString("base64");
  const hash = scryptSync(password, salt, 64, {
    N: 16384,
    r: 8,
    p: 1,
  }).toString("base64");
  return { salt, hash };
}

export function insertUser(username: string, email: string, password: string): UserRow {
  const { salt, hash } = hashPassword(password);
  const db = getDb();
  const stmt = db.prepare(
    "INSERT INTO users (username, email, password, salt) VALUES (?, ?, ?, ?)"
  );
  const info = stmt.run(username, email, hash, salt);
  const row = db.prepare("SELECT * FROM users WHERE id = ?").get(info.lastInsertRowid) as UserRow;
  return row;
}

export function findUserByEmail(email: string): UserRow | undefined {
  const db = getDb();
  return db.prepare("SELECT * FROM users WHERE email = ?").get(email) as UserRow | undefined;
}

export function findUserByUsername(username: string): UserRow | undefined {
  const db = getDb();
  return db.prepare("SELECT * FROM users WHERE username = ?").get(username) as UserRow | undefined;
}

export function isDuplicate(username: string, email: string): { username: boolean; email: boolean } {
  const db = getDb();
  return {
    username: (db.prepare("SELECT 1 FROM users WHERE username = ?").get(username) as any) !== undefined,
    email: (db.prepare("SELECT 1 FROM users WHERE email = ?").get(email) as any) !== undefined,
  };
}

export function verifyPassword(password: string, salt: string, storedHash: string): boolean {
  const hash = scryptSync(password, salt, 64, {
    N: 16384,
    r: 8,
    p: 1,
  }).toString("base64");
  return timingSafeEqual(Buffer.from(hash), Buffer.from(storedHash));
}

export function createSession(userId: number, msUntilExpiry: number): SessionRow {
  const db = getDb();
  const expiresAt = new Date(Date.now() + msUntilExpiry).toISOString();
  const token = randomBytes(32).toString("base64");
  const stmt = db.prepare(
    "INSERT INTO sessions (token, user_id, expires_at) VALUES (?, ?, ?)"
  );
  const info = stmt.run(token, userId, expiresAt);
  return db.prepare("SELECT * FROM sessions WHERE id = ?").get(info.lastInsertRowid) as SessionRow;
}

export function findSessionByToken(token: string): SessionRow | undefined {
  const db = getDb();
  return db.prepare("SELECT * FROM sessions WHERE token = ?").get(token) as SessionRow | undefined;
}

export function deleteSessionByToken(token: string): void {
  const db = getDb();
  db.prepare("DELETE FROM sessions WHERE token = ?").run(token);
}

export function deleteSessionsByUserId(userId: number): void {
  const db = getDb();
  db.prepare("DELETE FROM sessions WHERE user_id = ?").run(userId);
}

export interface ContactRow {
  id: number;
  subject: string;
  email: string;
  message: string;
  created_at: string;
}

export function insertContact(subject: string, email: string, message: string): ContactRow {
  const db = getDb();
  const stmt = db.prepare("INSERT INTO contacts (subject, email, message) VALUES (?, ?, ?)");
  const info = stmt.run(subject, email, message);
  return db.prepare("SELECT * FROM contacts WHERE id = ?").get(info.lastInsertRowid) as ContactRow;
}
