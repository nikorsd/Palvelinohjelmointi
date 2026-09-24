import { Router, Request, Response, NextFunction } from "express";
import { findSessionByToken, deleteSessionByToken, findUserByEmail, db } from "../db/database";

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
        (db.prepare("SELECT email FROM users WHERE id = ?").get(session.user_id) as any).email
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

export { authenticate };
export default router;
