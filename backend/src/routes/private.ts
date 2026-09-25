import { Router, Request, Response, NextFunction } from "express";
import { findSessionByToken, deleteSessionByToken, findUserByEmail, getDb, hashPassword, deleteSessionsByUserId } from "../db/database";

const router = Router();

const COOKIE_NAME = "session_token";

// Auth
function authenticate(req: Request, res: Response, next: NextFunction) {
    const token = req.cookies[COOKIE_NAME] || req.headers.authorization?.replace("Bearer ", "");
    if (!token) {
        return res.status(401).json({ error: "Ei kirjautunut." });
    }
    const session = findSessionByToken(token);
    if (!session) {
        return res.status(401).json({ error: "Istunto on vanhentunut." });
    }
    if (new Date(session.expires_at) < new Date()) {
        deleteSessionByToken(token);
        return res.status(401).json({ error: "Istunto on vanhentunut." });
    }
    (req as any).session = session;
    next();
}

// Logout
router.post("/logout", authenticate, (req, res) => {
    const token = (req as any).session.token;
    deleteSessionByToken(token);
    res.clearCookie(COOKIE_NAME, { path: "/" });
    return res.json({ message: "Kirjautuminen suljettu." });
});

// Current user
router.get("/me", authenticate, (req, res) => {
    const session = (req as any).session;
    const user = findUserByEmail(
        (getDb().prepare("SELECT email FROM users WHERE id = ?").get(session.user_id) as any).email
    );
    if (!user) {
        return res.status(404).json({ error: "Käyttäjää ei löydy." });
    }
    return res.json({
        id: user.id,
        username: user.username,
        email: user.email,
    });
});

// Update account (username, email, and/or password)
router.patch("/account", authenticate, (req, res) => {
    const db = getDb();
    const session = (req as any).session;
    const { username, email, password, profileColor } = req.body;

    try {
        if (username) {
            const existing = db.prepare("SELECT 1 FROM users WHERE username = ? AND id != ?").get(username, session.user_id) as any;
            if (existing) {
                return res.status(409).json({ error: "Käyttäjänimi on jo käytössä." });
            }
            db.prepare("UPDATE users SET username = ? WHERE id = ?").run(username, session.user_id);
        }

        if (email) {
            const existing = db.prepare("SELECT 1 FROM users WHERE email = ? AND id != ?").get(email, session.user_id) as any;
            if (existing) {
                return res.status(409).json({ error: "Sähköposti on jo käytössä." });
            }
            db.prepare("UPDATE users SET email = ? WHERE id = ?").run(email, session.user_id);
        }

        if (password) {
            const user = db.prepare("SELECT * FROM users WHERE id = ?").get(session.user_id) as any;
            if (!user) {
                return res.status(404).json({ error: "Käyttäjää ei löydy." });
            }
            const { salt, hash } = hashPassword(password);
            db.prepare("UPDATE users SET password = ?, salt = ? WHERE id = ?").run(hash, salt, session.user_id);
            // Invalidate all sessions on password change
            deleteSessionsByUserId(session.user_id);
        }

        // Profile color is managed client-side via localStorage
        if (profileColor !== undefined) {
            // accepted — stored locally
        }

        const updatedUser = db.prepare("SELECT id, username, email FROM users WHERE id = ?").get(session.user_id) as any;
        return res.json({ message: "Profiili päivitetty.", user: updatedUser });
    } catch (err) {
        console.error("Account update error:", err);
        return res.status(500).json({ error: "Sisäinen virhe." });
    }
});

// Delete account
router.delete("/account", authenticate, (req, res) => {
    const db = getDb();
    const session = (req as any).session;

    try {
        // Delete all sessions for this user
        db.prepare("DELETE FROM sessions WHERE user_id = ?").run(session.user_id);
        // Delete the user
        db.prepare("DELETE FROM users WHERE id = ?").run(session.user_id);
        // Clear session cookie
        res.clearCookie(COOKIE_NAME, { path: "/" });
        return res.json({ message: "Tili poistettu." });
    } catch (err) {
        console.error("Account delete error:", err);
        return res.status(500).json({ error: "Sisäinen virhe." });
    }
});

export { authenticate };
export default router;
