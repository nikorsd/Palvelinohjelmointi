import { Router, Request, Response, NextFunction } from "express"
import {
    findSessionByToken,
    deleteSessionByToken,
    findUserByEmail,
    getDb,
    hashPassword,
    deleteSessionsByUserId,
    getAllUsers,
    updateUser,
    deleteUserById,
    getUserById,
    set_user_password,
} from "../db/database"
import { getAllContacts, getAllParticipants } from "../context/database"
import { rateLimit } from "../middleware/rateLimit"

const router = Router()

const COOKIE_NAME = "session_token"

// Auth
function authenticate(req: Request, res: Response, next: NextFunction) {
    const token =
        req.cookies[COOKIE_NAME] ||
        req.headers.authorization?.replace("Bearer ", "")
    if (!token) {
        return res.status(401).json({ error: "Ei kirjautunut." })
    }
    const session = findSessionByToken(token)
    if (!session) {
        return res.status(401).json({ error: "Istunto on vanhentunut." })
    }
    if (new Date(session.expires_at) < new Date()) {
        deleteSessionByToken(token)
        return res.status(401).json({ error: "Istunto on vanhentunut." })
    }
    (req as any).session = session
    next()
}

// Chat
router.post("/chat", authenticate, rateLimit(), (req, res) => {
    const db = getDb()
    const session = (req as any).session
    db.prepare("INSERT INTO chats (message, user_id) VALUES (?, ?)").run(req.body.message, session.user_id)
    return res.json({ status: "Message sent." })
})

// Logout
router.post("/logout", authenticate, (req, res) => {
    const token = (req as any).session.token
    deleteSessionByToken(token)
    res.clearCookie(COOKIE_NAME, { path: "/" })
    return res.json({ message: "Kirjautuminen suljettu." })
})

// Current user
router.get("/me", authenticate, (req, res) => {
    const session = (req as any).session
    const db = getDb()
    const user = db.prepare("SELECT id, username, email, role, profile_color, participated FROM users WHERE id = ?").get(session.user_id) as any

    if (!user) {
        return res.status(404).json({ error: "Käyttäjää ei löydy." })
    }
    return res.json({
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        profileColor: user.profile_color,
        participated: !!user.participated
    })
})

// Update account (username, email, and/or password)
router.patch("/account", authenticate, (req, res) => {
    const db = getDb()
    const session = (req as any).session
    const { username, email, password, profileColor } = req.body

    try {
        if (username) {
            const existing = db
                .prepare("SELECT 1 FROM users WHERE username = ? AND id != ?")
                .get(username, session.user_id) as any
            if (existing) {
                return res
                    .status(409)
                    .json({ error: "Käyttäjänimi on jo käytössä." })
            }
            db.prepare("UPDATE users SET username = ? WHERE id = ?").run(
                username,
                session.user_id,
            )
        }

        if (email) {
            const existing = db
                .prepare("SELECT 1 FROM users WHERE email = ? AND id != ?")
                .get(email, session.user_id) as any
            if (existing) {
                return res
                    .status(409)
                    .json({ error: "Sähköposti on jo käytössä." })
            }
            db.prepare("UPDATE users SET email = ? WHERE id = ?").run(
                email,
                session.user_id,
            )
        }

        if (password) {
            const user = db
                .prepare("SELECT * FROM users WHERE id = ?")
                .get(session.user_id) as any
            if (!user) {
                return res.status(404).json({ error: "Käyttäjää ei löydy." })
            }
            const { salt, hash } = hashPassword(password)
            db.prepare(
                "UPDATE users SET password = ?, salt = ? WHERE id = ?",
            ).run(hash, salt, session.user_id)
            // Invalidate all sessions on password change
            deleteSessionsByUserId(session.user_id)
        }

        if (profileColor !== undefined) {
            db.prepare("UPDATE users SET profile_color = ? WHERE id = ?").run(
                profileColor,
                session.user_id,
            )
        }

        const updatedUser = db
            .prepare(
                "SELECT id, username, email, profile_color FROM users WHERE id = ?",
            )
            .get(session.user_id) as any
        return res.json({ message: "Profiili päivitetty.", user: updatedUser })
    } catch (err) {
        console.error("Account update error:", err)
        return res.status(500).json({ error: "Sisäinen virhe." })
    }
})

// Delete account
router.delete("/account", authenticate, (req, res) => {
    const db = getDb()
    const session = (req as any).session

    try {
        // Delete the user
        db.prepare("DELETE FROM users WHERE id = ?").run(session.user_id)
        // Clear session cookie
        res.clearCookie(COOKIE_NAME, { path: "/" })
        return res.json({ message: "Tili poistettu." })
    } catch (err) {
        console.error("Account delete error:", err)
        return res.status(500).json({ error: "Sisäinen virhe." })
    }
})

router.get("/participate", authenticate, (req, res) => {
    const db = getDb()
    const session = (req as any).session
    db.prepare("UPDATE users SET participated = 1 WHERE id = ?").run(session.user_id)
    return res.json({ message: "Olet ilmottautunut." })
})

router.delete("/participate", authenticate, (req, res) => {
    const db = getDb()
    const session = (req as any).session
    db.prepare("UPDATE users SET participated = 0 WHERE id = ?").run(session.user_id)
    return res.json({ message: "Et ole enään ilmottautunut." })
})

// Admin check middleware
function isAdmin(req: Request, res: Response, next: NextFunction) {
    const session = (req as any).session
    if (!session) {
        return res.status(401).json({ error: "Ei kirjautunut." })
    }
    const user = getDb()
        .prepare("SELECT role FROM users WHERE id = ?")
        .get(session.user_id) as any
    if (!user || user.role !== "Admin") {
        return res.status(403).json({ error: "Vaaditaan Admin-oikeuksia." })
    }
    next()
}

// List all participants
router.get("/admin/participants", authenticate, isAdmin, (_req, res) => {
    const participants = getAllParticipants()
    return res.json({ participants })
})

// List all users (admin only)
router.get("/admin/users", authenticate, isAdmin, (_req, res) => {
    const users = getAllUsers()
    return res.json({ users })
})

// Update user (admin only)
router.patch("/admin/users/:id", authenticate, isAdmin, (req, res) => {
    const db = getDb()
    const targetId = parseInt(String(req.params.id), 10)
    const { username, email, role, password, profileColor } = req.body

    try {
        // Validate target user exists
        const targetUser = getUserById(targetId)
        if (!targetUser) {
            return res.status(404).json({ error: "Käyttäjää ei löydy." })
        }

        // Check unique constraints (excluding self)
        if (username) {
            const existing = db
                .prepare("SELECT 1 FROM users WHERE username = ? AND id != ?")
                .get(username, targetId) as any
            if (existing) {
                return res
                    .status(409)
                    .json({ error: "Käyttäjänimi on jo käytössä." })
            }
        }
        if (email) {
            const existing = db
                .prepare("SELECT 1 FROM users WHERE email = ? AND id != ?")
                .get(email, targetId) as any
            if (existing) {
                return res
                    .status(409)
                    .json({ error: "Sähköposti on jo käytössä." })
            }
        }

        // Build update fields
        const finalUsername = username ?? targetUser.username
        const finalEmail = email ?? targetUser.email
        const finalRole = role ?? targetUser.role
        const finalProfileColor = profileColor ?? targetUser.profile_color

        updateUser(targetId, finalUsername, finalEmail, finalRole, finalProfileColor)

        if (password) {
            set_user_password(targetId, password)
        }

        const updated = getUserById(targetId)
        if (!updated) {
            return res.status(500).json({ error: "Käyttäjää ei löydy päivityksen jälkeen." })
        }
        return res.json({
            message: "Käyttäjä päivitetty.",
            user: {
                id: updated.id,
                username: updated.username,
                email: updated.email,
                role: updated.role,
                profileColor: updated.profile_color,
                participated: !!updated.participated,
            },
        })
    } catch (err) {
        console.error("User update error:", err)
        return res.status(500).json({ error: "Sisäinen virhe." })
    }
})

// Delete user (admin only)
router.delete("/admin/users/:id", authenticate, isAdmin, (req, res) => {
    const targetId = parseInt(String(req.params.id), 10)

    try {
        const targetUser = getUserById(targetId)
        if (!targetUser) {
            return res.status(404).json({ error: "Käyttäjää ei löydy." })
        }

        deleteUserById(targetId)
        return res.json({ message: "Käyttäjä poistettu." })
    } catch (err) {
        console.error("User delete error:", err)
        return res.status(500).json({ error: "Sisäinen virhe." })
    }
})

// Toggle participate status (admin only)
router.post("/admin/participate/:id", authenticate, isAdmin, (req, res) => {
    const targetId = parseInt(String(req.params.id), 10)
    const db = getDb()
    const user = db.prepare("SELECT participated FROM users WHERE id = ?").get(targetId) as any
    if (!user) {
        return res.status(404).json({ error: "Käyttäjää ei löydy." })
    }
    const newVal = user.participated ? 0 : 1
    db.prepare("UPDATE users SET participated = ? WHERE id = ?").run(newVal, targetId)
    return res.json({ participated: newVal === 1 })
})

// Read contacts (admin only)
router.get("/admin/contacts", authenticate, isAdmin, (_req, res) => {
    const contacts = getAllContacts()
    return res.json({ contacts })
})

export { authenticate, isAdmin }
export default router
