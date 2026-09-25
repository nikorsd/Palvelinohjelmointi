// Re-export everything from the centralized context module
export {
  getDb,
  databaseExists,
  createTables,
  hashPassword,
  insertUser,
  findUserByEmail,
  findUserByUsername,
  isDuplicate,
  verifyPassword,
  createSession,
  findSessionByToken,
  deleteSessionByToken,
  deleteSessionsByUserId,
  insertContact,
} from "../context/database";

export type { UserRow, SessionRow, ContactRow } from "../context/database";
