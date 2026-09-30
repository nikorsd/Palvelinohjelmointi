import Database from "better-sqlite3";
import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { existsSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";

const DB_PATH = join(__dirname, "..", "..", "data", "nayttotyo.db");

let db: Database.Database | null = null;

// In-memory session store (keyed by token)
const sessions = new Map<string, SessionRow>();
let sessionIdCounter = 0;

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
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      username    TEXT    NOT NULL UNIQUE,
      email       TEXT    NOT NULL UNIQUE,
      password    TEXT    NOT NULL,
      salt        TEXT    NOT NULL,
      role        TEXT    NOT NULL DEFAULT 'User',
      profile_color TEXT,
      created_at  TEXT    NOT NULL DEFAULT (datetime('now'))
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
    role: string;
    profile_color: string | null;
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

export function insertUser(
    username: string,
    email: string,
    password: string,
    profileColor?: string,
): UserRow {
    const { salt, hash } = hashPassword(password);
    const db = getDb();
    const stmt = db.prepare(
        "INSERT INTO users (username, email, password, salt, profile_color) VALUES (?, ?, ?, ?, ?)",
    );
    const info = stmt.run(username, email, hash, salt, profileColor || null);
    const row = db
        .prepare("SELECT * FROM users WHERE id = ?")
        .get(info.lastInsertRowid) as UserRow;
    return row;
}

export function findUserByEmail(email: string): UserRow | undefined {
    const db = getDb();
    return db.prepare("SELECT * FROM users WHERE email = ?").get(email) as
        UserRow | undefined;
}

export function findUserByUsername(username: string): UserRow | undefined {
    const db = getDb();
    return db
        .prepare("SELECT * FROM users WHERE username = ?")
        .get(username) as UserRow | undefined;
}

export function isDuplicate(
    username: string,
    email: string,
): { username: boolean; email: boolean } {
    const db = getDb();
    return {
        username:
            (db
                .prepare("SELECT 1 FROM users WHERE username = ?")
                .get(username) as any) !== undefined,
        email:
            (db
                .prepare("SELECT 1 FROM users WHERE email = ?")
                .get(email) as any) !== undefined,
    };
}

export function verifyPassword(
    password: string,
    salt: string,
    storedHash: string,
): boolean {
    const hash = scryptSync(password, salt, 64, {
        N: 16384,
        r: 8,
        p: 1,
    }).toString("base64");
    return timingSafeEqual(Buffer.from(hash), Buffer.from(storedHash));
}

export function createSession(
    userId: number,
    msUntilExpiry: number,
): SessionRow {
    const expiresAt = new Date(Date.now() + msUntilExpiry).toISOString();
    const token = randomBytes(32).toString("base64");
    const now = new Date().toISOString();
    sessionIdCounter++;
    const session: SessionRow = {
        id: sessionIdCounter,
        token,
        user_id: userId,
        expires_at: expiresAt,
        created_at: now,
    };
    sessions.set(token, session);
    return session;
}

export function findSessionByToken(token: string): SessionRow | undefined {
    return sessions.get(token);
}

export function deleteSessionByToken(token: string): void {
    sessions.delete(token);
}

export function deleteSessionsByUserId(userId: number): void {
    for (const [token, session] of sessions.entries()) {
        if (session.user_id === userId) {
            sessions.delete(token);
        }
    }
}

export interface ContactRow {
    id: number;
    subject: string;
    email: string;
    message: string;
    created_at: string;
}

export function getAllUsers(): any[] {
    const db = getDb();
    const rows = db
        .prepare(
            "SELECT id, username, email, role, profile_color, created_at FROM users ORDER BY id",
        )
        .all() as any[];
    return rows.map((row: any) => ({
        id: row.id,
        username: row.username,
        email: row.email,
        role: row.role,
        profileColor: row.profile_color,
        created_at: row.created_at,
    }));
}

export function insertContact(
    subject: string,
    email: string,
    message: string,
): ContactRow {
    const db = getDb();
    const stmt = db.prepare(
        "INSERT INTO contacts (subject, email, message) VALUES (?, ?, ?)",
    );
    const info = stmt.run(subject, email, message);
    return db
        .prepare("SELECT * FROM contacts WHERE id = ?")
        .get(info.lastInsertRowid) as ContactRow;
}
