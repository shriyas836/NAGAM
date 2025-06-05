import jwt from "jsonwebtoken";

export function authenticateUser(req, res, next) {
    const token = req.headers["authorization"];

    if (!token) {
        return res.status(401).json({ error: "Unauthorized! Please log in first." });
    }

    try {
        const decoded = jwt.verify(token.split(" ")[1], "your_secret_key"); // 🔹 Secret key ko `.env` me store karo
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ error: "Invalid token! Please log in again." });
    }
}
