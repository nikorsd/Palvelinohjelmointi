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
    getAllUsers,
    updateUser,
    deleteUserById,
    getUserById,
    set_user_password,
} from "../context/database"

export type { SessionRow, ContactRow } from "../context/database"
import type { UserRow } from "../context/database"

export type UserSummary = Omit<UserRow, "password" | "salt">
