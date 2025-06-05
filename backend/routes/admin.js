import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

const router = express.Router();
import db from "../db.js";
import pool from "../db.js";
import nodemailer from "nodemailer";
//const SECRET_KEY = "your_secret_key_here"; // Change to a strong secret
const SECRET_KEY = process.env.SECRET_KEY;


// Configure Transporter (Use Gmail, Outlook, or SMTP Service)
const transporter = nodemailer.createTransport({
    service: "gmail", // You can use Outlook, Yahoo, or SMTP settings
    auth: {
        user: "shriyas836@gmail.com", // Replace with your email
        pass: "oecvijvnjslejmpg" 
    }
});


// Function to Send Email Notification
const sendEmailNotification = async (recipientEmail, complaintId) => {
    try {
        const mailOptions = {
            from: "your-email@gmail.com", // Sender Email
            to: recipientEmail, // Recipient Email
            subject: "Complaint Resolved - Nagar Nigam",
            text: `Dear User,\n\nYour complaint with ID ${complaintId} has been successfully resolved. Thank you for your patience!\n\nBest Regards,\nNagar Nigam Team`
        };

        await transporter.sendMail(mailOptions);
        console.log("📧 Email sent successfully!");
    } catch (error) {
        console.error("❌ Error sending email:", error);
    }
};
// ✅ Resolve a Complaint & Send Email Notification
router.put("/resolve-complaint/:id", async (req, res) => {
    const complaintId = req.params.id;

    try {
        // 1️⃣ Fetch Complaint & User Email
        const [complaint] = await db.query(
            "SELECT C_Id, email FROM Complaint WHERE C_Id = ?", 
            [complaintId]
        );

        if (complaint.length === 0) {
            return res.status(404).json({ error: "Complaint not found" });
        }

        const { email } = complaint[0]; // User's email from DB
        console.log("📧 Sending email to:", email, "for Complaint ID:", complaintId);

        // 2️⃣ Update Complaint Status
        await db.query(
            "UPDATE Complaint SET status = 'Resolved' WHERE C_Id = ?", 
            [complaintId]
        );

        // 3️⃣ Send Email Notification
        const emailResponse = await sendEmailNotification(email, complaintId);
        console.log("📨 Email response:", emailResponse);

        res.json({ message: "✅ Complaint resolved & Email Sent!" });

    } catch (error) {
        console.error("❌ Error resolving complaint:", error);
        res.status(500).json({ error: "Internal Server Error", details: error.message });
    }
});
// ✅ Fetch Complaint History (Updates)
router.get("/complaint-updates/:id", async (req, res) => {
    const complaintId = req.params.id;
    try {
        const [updates] = await db.query(
            "SELECT * FROM Complaint_Update WHERE C_Id = ? ORDER BY updated_at DESC",
            [complaintId]
        );

        if (updates.length === 0) {
            return res.status(404).json({ message: "No updates found for this complaint" });
        }

        res.json(updates);
    } catch (error) {
        console.error("❌ Error fetching complaint updates:", error);
        res.status(500).json({ error: "Error fetching complaint updates" });
    }
});




// ✅ Delete Feedback (Admin)
router.delete("/feedback/:id", async (req, res) => {
    const feedbackId = req.params.id;

    try {
        const [result] = await db.promise().query(
            "DELETE FROM Feedback WHERE F_Id = ?", 
            [feedbackId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Feedback not found" });
        }

        res.json({ message: "✅ Feedback deleted successfully" });
    } catch (error) {
        console.error("❌ Error deleting feedback:", error);
        res.status(500).json({ error: "Database error" });
    }
});


// ✅ Get Complaints by Category
router.get("/complaints/category/:categoryId", async (req, res) => {
    const { categoryId } = req.params;

    try {
        const [complaints] = await db.query(
            "SELECT * FROM Complaint WHERE Cat_Id = ?", [categoryId]
        );

        if (complaints.length === 0) {
            return res.status(404).json({ message: "No complaints found for this category" });
        }

        res.json(complaints);
    } catch (error) {
        console.error("❌ Error fetching complaints by category:", error);
        res.status(500).json({ error: "Database error" });
    }
});

// ✅ Update Complaint Status
router.put("/update-complaint-status/:id", async (req, res) => {
    try {
        const complaintId = req.params.id;
        const { status } = req.body;

        if (!complaintId || !status) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        console.log(`Updating complaint ID: ${complaintId} to status: ${status}`);

        // ✅ Check if complaint exists before updating
        const [existingComplaint] = await db.query(
            "SELECT * FROM Complaint WHERE C_Id = ?",
            [complaintId]
        );

        if (existingComplaint.length === 0) {
            return res.status(404).json({ error: "Complaint not found" });
        }

        // ✅ Update the complaint status
        const [result] = await db.query(
            "UPDATE Complaint SET status = ? WHERE C_Id = ?",
            [status, complaintId]
        );

        console.log("Update Result:", result);

        if (result.affectedRows === 0) {
            return res.status(400).json({ error: "Failed to update complaint" });
        }

        res.json({ message: "Complaint status updated successfully" });
    } catch (error) {
        console.error("❌ Error updating complaint status:", error);
        res.status(500).json({ error: "Database error", details: error.message });
    }
});

// ✅ Get Admin Dashboard Statistics
router.get("/dashboard-stats", async (req, res) => {
    try {
        const [totalComplaints] = await db.query("SELECT COUNT(*) AS total FROM Complaint");
        const [resolvedComplaints] = await db.query("SELECT COUNT(*) AS resolved FROM Complaint WHERE status = 'Resolved'");
        const [pendingComplaints] = await db.query("SELECT COUNT(*) AS pending FROM Complaint WHERE status = 'Pending'");
        const [avgRating] = await db.query("SELECT AVG(rating) AS average_rating FROM Feedback");

        res.json({
            total_complaints: totalComplaints[0].total,
            resolved_complaints: resolvedComplaints[0].resolved,
            pending_complaints: pendingComplaints[0].pending,
            average_feedback_rating: avgRating[0].average_rating || 0
        });
    } catch (error) {
        console.error("❌ Error fetching dashboard stats:", error);
        res.status(500).json({ error: "Database error" });
    }
});

// ✅ Function to generate a secure password
const generatePassword = (first_name, last_name) => {
    const randomNum = Math.floor(100 + Math.random() * 900); // Generates a 3-digit random number
    return `${first_name.toLowerCase()}_${last_name.toLowerCase()}@${randomNum}`;
};

// ✅ Function to generate a unique email
const generateUniqueEmail = async (first_name, last_name) => {
    let baseEmail = `${first_name.toLowerCase()}.${last_name.toLowerCase()}@nagam.in`;
    let email = baseEmail;
    let counter = 1;

    // Fetch existing emails with the same pattern
    const [existingEmails] = await pool.query(
        "SELECT email FROM Admin WHERE email LIKE ?",
        [`${first_name.toLowerCase()}.${last_name.toLowerCase()}%`]
    );

    // Generate a unique email if necessary
    while (existingEmails.some(admin => admin.email === email)) {
        email = `${first_name.toLowerCase()}.${last_name.toLowerCase()}${counter}@nagam.in`;
        counter++;
    }

    return email;
};

// ✅ Admin Registration Route
router.post("/register", async (req, res) => {
    try {
        const { first_name, last_name } = req.body;

        if (!first_name || !last_name) {
            return res.status(400).json({ error: "First name and last name are required." });
        }

        // 🔥 Generate a unique email
        const email = await generateUniqueEmail(first_name, last_name);

        // 🔥 Generate Password (Fixed issue)
        const rawPassword = generatePassword(first_name, last_name);
        const passwordHash = await bcrypt.hash(rawPassword, 10);

        // 🔥 Insert new admin into the database
        await pool.query(
            "INSERT INTO Admin (first_name, last_name, email, password_hash) VALUES (?, ?, ?, ?)",
            [first_name, last_name, email, passwordHash]
        );

        res.status(201).json({
            message: "Admin registered successfully!",
            email: email,
            password: rawPassword, // Show only once
        });
    } catch (error) {
        console.error("Server error:", error);
        res.status(500).json({ error: "Server error during admin registration." });
    }
});




// ✅ Admin Login Route
router.post("/login", async (req, res) => {
    console.log("🔄 Admin Login API Called"); // ✅ Debugging Log

    const { email, password } = req.body;
    console.log("📩 Email Received:", email);

    if (!email || !password) {
        console.log("❌ Missing Credentials");
        return res.status(400).json({ error: "Email and password are required." });
    }

    try {
        const [results] = await db.query("SELECT * FROM Admin WHERE email = ?", [email]);

        if (results.length === 0) {
            console.log("❌ Admin not found:", email);
            return res.status(404).json({ error: "Admin not found" });
        }

        const admin = results[0];

        // ✅ Check Password
        const isMatch = await bcrypt.compare(password, admin.password_hash);

        if (!isMatch) {
            console.log("❌ Invalid Password for:", email);
            return res.status(401).json({ error: "Invalid email or password" });
        }

        // ✅ Generate JWT Token
        const token = jwt.sign(
            { A_Id: admin.A_Id, email: admin.email },
            process.env.SECRET_KEY, // Use ENV secret key
            { expiresIn: "1h" }
        );

        console.log("✅ Login Successful for:", email);
        return res.json({
            message: "Login successful",
            token,
            admin: {
                A_Id: admin.A_Id,
                first_name: admin.first_name,
                last_name: admin.last_name,
                email: admin.email
            }
        });
    } catch (error) {
        console.error("❌ Database Query Error:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// ✅ Token Verification Middleware
export const Token = (req, res, next) => {
    const authHeader = req.headers["authorization"];

    console.log("🔍 Checking Authorization Header:", authHeader); // Debugging Log

    if (!authHeader) {
        console.log("🚫 No Token Provided");
        return res.status(403).json({ error: "No token provided" });
    }

    const tokenParts = authHeader.split(" ");

    if (tokenParts.length !== 2 || tokenParts[0] !== "Bearer") {
        console.log("🚫 Invalid Token Format");
        return res.status(403).json({ error: "Invalid token format" });
    }

    const token = tokenParts[1];

    jwt.verify(token, process.env.SECRET_KEY, (err, decoded) => {
        if (err) {
            console.log("🚫 Token Verification Failed:", err.message);
            return res.status(401).json({ error: "Invalid or expired token" });
        }
        console.log("✅ Token Verified, User:", decoded);
        req.user = decoded;
        next();
    });
};







// ✅ Protected Route for Admin Dashboard
router.get("/dashboard", Token, async (req, res) => {
    try {
        console.log("✅ Token verified for:", req.user.email); // Debugging
        const [stats] = await db.query("SELECT COUNT(*) AS total_complaints FROM Complaint");
        res.json({ total_complaints: stats[0].total_complaints });
    } catch (error) {
        console.error("❌ Database error:", error);
        res.status(500).json({ error: "Database error" });
    }
});



// Middleware to verify JWT token
function verifyToken(req, res, next) {
    const token = req.headers["authorization"];

    if (!token) {
        return res.status(401).json({ message: "Unauthorized: No token provided" });
    }

    // Extract token (Bearer <token>)
    const tokenValue = token.split(" ")[1];

    jwt.verify(tokenValue, "your-secret-key", (err, decoded) => {
        if (err) {
            return res.status(401).json({ message: "Unauthorized: Invalid token" });
        }
        req.user = decoded;
        next();
    });
}

// ✅ Admin Verification API
router.get("/verify-admin", verifyToken, async (req, res) => {
    try {
        // Check if the user is an admin
        if (req.user.role !== "admin") {
            return res.status(403).json({ message: "Forbidden: Admins only", isAdmin: false });
        }

        res.json({ message: "Access granted", isAdmin: true });
    } catch (error) {
        console.error("❌ Error verifying admin:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});
export default router;











