import Database from "better-sqlite3";
import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { join } from "node:path";

const DB_PATH = join(__dirname, "..", "..", "data", "nayttotyo.db");

export const db = new Database(DB_PATH);

// Enable WAL mode for better concurrent read performance
db.pragma("journal_mode = WAL");

// Create users table
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    username   TEXT    NOT NULL UNIQUE,
    email      TEXT    NOT NULL UNIQUE,
    password   TEXT    NOT NULL,
    salt       TEXT    NOT NULL,
    created_at TEXT    NOT NULL DEFAULT (datetime('now'))
  );
`);

// Create sessions table
db.exec(`
  CREATE TABLE IF NOT EXISTS sessions (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    token      TEXT    NOT NULL UNIQUE,
    user_id    INTEGER NOT NULL,
    expires_at TEXT    NOT NULL,
    created_at TEXT    NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id)
  );
`);

export interface UserRow {
  id: number;
  username: string;
  email: string;
  password: string;
  salt: string;
  created_at: string;
}

/** Hash a password with a random salt (returns base64 salt + base64 hash). */
function hashPassword(password: string): { salt: string; hash: string } {
  const salt = randomBytes(16).toString("base64");
  const hash = scryptSync(password, salt, 64, {
    N: 16384,
    r: 8,
    p: 1,
  }).toString("base64");
  return { salt, hash };
}

/** Insert a new user. Throws on duplicate username/email. */
export function insertUser(username: string, email: string, password: string): UserRow {
  const { salt, hash } = hashPassword(password);

  const stmt = db.prepare(
    "INSERT INTO users (username, email, password, salt) VALUES (?, ?, ?, ?)"
  );
  const info = stmt.run(username, email, hash, salt);

  // Fetch back so we return the full row
  const row = db.prepare("SELECT * FROM users WHERE id = ?").get(info.lastInsertRowid) as UserRow;
  return row;
}

/** Find user by email. */
export function findUserByEmail(email: string): UserRow | undefined {
  return db.prepare("SELECT * FROM users WHERE email = ?").get(email) as UserRow | undefined;
}

/** Find user by username. */
export function findUserByUsername(username: string): UserRow | undefined {
  return db.prepare("SELECT * FROM users WHERE username = ?").get(username) as UserRow | undefined;
}

/** Check whether a username or email is already taken. */
export function isDuplicate(username: string, email: string): { username: boolean; email: boolean } {
  return {
    username: (db.prepare("SELECT 1 FROM users WHERE username = ?").get(username) as any) !== undefined,
    email: (db.prepare("SELECT 1 FROM users WHERE email = ?").get(email) as any) !== undefined,
  };
}

/** Verify a password against a stored salt+hash. */
export function verifyPassword(password: string, salt: string, storedHash: string): boolean {
  const hash = scryptSync(password, salt, 64, {
    N: 16384,
    r: 8,
    p: 1,
  }).toString("base64");
  return timingSafeEqual(Buffer.from(hash), Buffer.from(storedHash));
}

export interface SessionRow {
  id: number;
  token: string;
  user_id: number;
  expires_at: string;
  created_at: string;
}

/** Create a session that expires after the given number of milliseconds. */
export function createSession(userId: number, msUntilExpiry: number): SessionRow {
  const expiresAt = new Date(Date.now() + msUntilExpiry).toISOString();
  const token = randomBytes(32).toString("base64");

  const stmt = db.prepare(
    "INSERT INTO sessions (token, user_id, expires_at) VALUES (?, ?, ?)"
  );
  const info = stmt.run(token, userId, expiresAt);

  return db.prepare("SELECT * FROM sessions WHERE id = ?").get(info.lastInsertRowid) as SessionRow;
}

/** Find a session by its token. */
export function findSessionByToken(token: string): SessionRow | undefined {
  return db.prepare("SELECT * FROM sessions WHERE token = ?").get(token) as SessionRow | undefined;
}

/** Delete a session by token (logout). */
export function deleteSessionByToken(token: string): void {
  db.prepare("DELETE FROM sessions WHERE token = ?").run(token);
}

/** Delete all sessions for a user (password change, etc.). */
export function deleteSessionsByUserId(userId: number): void {
  db.prepare("DELETE FROM sessions WHERE user_id = ?").run(userId);
}
