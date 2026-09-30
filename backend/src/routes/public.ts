import { Router } from "express";
import {
    insertUser,
    isDuplicate,
    findUserByEmail,
    verifyPassword,
    createSession,
    insertContact,
} from "../db/database";

const router = Router();

const SESSION_MS = 3 * 24 * 60 * 60 * 1000;
const COOKIE_NAME = "session_token";

// Health check
router.get("/health", (_req, res) => {
    res.json({ status: "ok" });
});

// Signup
router.post("/signup", (req, res) => {
    const { username, email, password, passwordConfirm } = req.body;

    if (!username || !email || !password || !passwordConfirm) {
        return res.status(400).json({ error: "Täytä kaikki kentät." });
    }

    if (password !== passwordConfirm) {
        return res.status(400).json({ error: "Salasanat eivät täsmää." });
    }

    if (password.length < 8) {
        return res.status(400).json({ error: "Salasanan täytyy olla vähintään 8 merkkiä." });
    }

    const { username: userDup, email: emailDup } = isDuplicate(username, email);
    if (userDup) {
        return res.status(409).json({ error: "Käyttäjänimi on jo käytössä." });
    }
    if (emailDup) {
        return res.status(409).json({ error: "Sähköposti on jo rekisteröity. Kirjaudu sisään?" });
    }

    try {
        insertUser(username, email, password);
        return res.status(201).json({ message: "Käyttäjä luotu! Tervetuloa." });
    } catch (err) {
        console.error("Signup error:", err);
        return res.status(500).json({ error: "Sisäinen virhe. Kokeile myöhemmin uudelleen." });
    }
});

// Signin
router.post("/signin", (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: "Sähköposti ja salasana vaaditaan." });
    }

    const user = findUserByEmail(email);
    if (!user) {
        return res.status(401).json({ error: "Väärä sähköposti tai salasana." });
    }

    if (!verifyPassword(password, user.salt, user.password)) {
        return res.status(401).json({ error: "Väärä sähköposti tai salasana." });
    }

    const session = createSession(user.id, SESSION_MS);

    res.cookie(COOKIE_NAME, session.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: SESSION_MS,
        path: "/",
    });

    return res.json({
        message: "Kirjautuminen onnistui.",
        user: { id: user.id, username: user.username, email: user.email, role: user.role },
    });
});

// Contact form
router.post("/contact", (req, res) => {
    const { subject, email, message } = req.body;

    if (!subject || !email || !message) {
        return res.status(400).json({ error: "Täytä kaikki kentät." });
    }

    try {
        insertContact(subject, email, message);
        return res.json({ message: "Viesti lähetetty! Kiitos yhteydenotosta." });
    } catch (err) {
        console.error("Contact error:", err);
        return res.status(500).json({ error: "Sisäinen virhe. Kokeile myöhemmin uudelleen." });
    }
});

export default router;
