import express from "express";
const router = express.Router();

import nodemailer from "nodemailer";

// ✅ Configure Nodemailer Transporter
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: "shriyas836@gmail.com",
        pass: "hkuavxrtboauuuya"
    }
});

// ✅ API Route: Send Email
router.post("/send-email", async (req, res) => {
    const { email, message } = req.body;

    if (!email || !message) {
        return res.status(400).json({ error: "Missing required fields" });
    }

    const mailOptions = {
        from: "your-email@gmail.com",
        to: email,
        subject: "Complaint Resolution Notification",
        text: message
    };

    try {
        await transporter.sendMail(mailOptions);
        res.json({ message: "✅ Email sent successfully!" });
    } catch (error) {
        console.error("❌ Email Error:", error);
        res.status(500).json({ error: "Failed to send email" });
    }
});

export default router;
