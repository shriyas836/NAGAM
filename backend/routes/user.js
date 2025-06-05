import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
const router = express.Router();
import db from "../db.js";
import nodemailer from "nodemailer";
let otpStorage = {}; // Temporary storage for OTPs

// ✅ Get User Profile
router.get("/:id", async (req, res) => {
    const { id } = req.params;
    
    try {
        const [user] = await db.query(
            "SELECT Cl_Id, first_name, last_name, email, created_at FROM Client WHERE Cl_Id = ?", 
            [id]
        );

        if (user.length === 0) {
            return res.status(404).json({ error: "User not found" });
        }

        res.json(user[0]);
    } catch (error) {
        console.error("❌ Error fetching user profile:", error);
        res.status(500).json({ error: "Database error" });
    }
});

// ✅ Update User Profile (only first_name, last_name, email)
router.put("/:id", async (req, res) => {
    const { id } = req.params;
    const { first_name, last_name, email } = req.body;

    try {
        await db.query(
            "UPDATE Client SET first_name = ?, last_name = ?, email = ? WHERE Cl_Id = ?",
            [first_name, last_name, email, id]
        );

        res.json({ message: "✅ User profile updated successfully!" });
    } catch (error) {
        console.error("❌ Error updating user profile:", error);
        res.status(500).json({ error: "Database error" });
    }
});

// ✅ Delete User Profile
router.delete("/:id", async (req, res) => {
    const { id } = req.params;

    try {
        await db.promise().query("DELETE FROM Client WHERE Cl_Id = ?", [id]);

        res.json({ message: "✅ User deleted successfully!" });
    } catch (error) {
        console.error("❌ Error deleting user profile:", error);
        res.status(500).json({ error: "Database error" });
    }
});

// ✅ Client Registration Route
router.post("/register", async (req, res) => {
    const { first_name, last_name, email, password } = req.body;

    if (!first_name || !email || !password) {
        return res.status(400).json({ error: "All fields are required!" });
    }

    try {
        // Check if user already exists
        const [existingUser] = await db.query("SELECT * FROM Client WHERE email = ?", [email]);
        if (existingUser.length > 0) {
            return res.status(400).json({ error: "User already exists!" });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert new client
        await db.query(
            "INSERT INTO Client (first_name, last_name, email, password_hash) VALUES (?, ?, ?, ?)",
            [first_name, last_name, email, hashedPassword]
        );

        res.status(201).json({ message: "Client registered successfully!" });
    } catch (err) {
        console.error("Registration failed:", err);
        res.status(500).json({ error: "Server error" });
    }
});

// ✅ User Login
router.post("/login", async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: "Email and password are required" });
    }

    try {
        // Fetch user from DB
        const [user] = await db.query("SELECT * FROM Client WHERE email = ?", [email]);

        if (user.length === 0) {
            return res.status(401).json({ error: "Invalid email or password" });
        }

        const userData = user[0];

        // Check password
        const isMatch = await bcrypt.compare(password, userData.password_hash);
        if (!isMatch) {
            return res.status(401).json({ error: "Invalid email or password" });
        }

        // Generate JWT Token
        const token = jwt.sign(
            { userId: userData.Cl_Id, email: userData.email },
            "secret_key", // Use a secure key in production
            { expiresIn: "1h" }
        );

        res.json({ message: "Login successful", token, userId: userData.Cl_Id ,firstName: user[0].first_name,});
    } catch (error) {
        console.error("Error logging in:", error);
        res.status(500).json({ error: "Database error" });
    }
});


const transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
        user: "shriyas836@gmail.com", // Replace with your email
        pass: "hkuavxrtboauuuya",   // Use App Password (not regular password)
    },
});

router.post('/forgot-password', async (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: "Email is required" });

    const otp = Math.floor(100000 + Math.random() * 900000).toString(); // Generate OTP
    otpStorage[email] = otp; // Store OTP in memory (Use DB in production)

    console.log(`OTP for ${email}: ${otp}`); // Debugging (remove in production)

    // Email Options
    const mailOptions = {
        from: "your-email@gmail.com", 
        to: email,
        subject: "Your OTP for Password Reset",
        text: `Your OTP is: ${otp}. It is valid for 10 minutes.`,
    };

    // Send Email
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error("Error sending OTP email:", error);
            return res.status(500).json({ error: "Failed to send OTP" });
        }
        console.log("OTP sent successfully:", info.response);
        res.json({ message: "OTP sent to email" });
    });
});


router.post("/reset-password", async (req, res) => {
    const { email, newPassword } = req.body;

    if (!email || !newPassword) {
        return res.status(400).json({ error: "Email and new password are required" });
    }

    try {
        // **Correctly Hash the New Password**
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        // **Update Database with Hashed Password**
        await db.query("UPDATE Client SET password_hash = ? WHERE email = ?", [hashedPassword, email]);

        res.json({ message: "Password reset successful. Please login with your new password." });
    } catch (error) {
        console.error("Error resetting password:", error);
        res.status(500).json({ error: "Database error" });
    }
});

export default router;
