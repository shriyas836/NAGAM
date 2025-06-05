import express from "express";
import mysql from "mysql2/promise";

const router = express.Router();

// ✅ MySQL Connection Pool
const db = mysql.createPool({
    host: "localhost",
    user: "root",
    password: "superuser$123",
    database: "nagam1",
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

router.get("/", async (req, res) => {
    try {
        const sql = `
            SELECT f.F_Id, f.C_Id, f.Cl_Id,
                   COALESCE(CONCAT(c.first_name, ' ', c.last_name), 'Guest') AS name,
                   f.comment, f.rating, f.submitted_at
            FROM Feedback f
            LEFT JOIN Client c ON f.Cl_Id = c.Cl_Id
            ORDER BY f.submitted_at DESC;
        `;

        const [rows] = await db.query(sql);
        console.log("📌 Feedback Query Results:", rows); // Debugging log

        res.json(rows);
    } catch (error) {
        console.error("❌ Error fetching feedback:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

router.post("/", async (req, res) => {
    const { Cl_Id, rating, comment } = req.body;

    if (!Cl_Id || !rating || !comment) {
        return res.status(400).json({ error: "❌ Missing required fields" });
    }

    try {
        // Fetch Complaint ID from Complaint table using Cl_Id
        const [complaint] = await db.query("SELECT C_Id FROM Complaint WHERE Cl_Id = ?", [Cl_Id]);

        if (!complaint || complaint.length === 0) {
            return res.status(404).json({ error: "❌ No complaint found for this Client ID" });
        }

        const C_Id = complaint[0].C_Id;
        console.log("✅ Fetched C_Id:", C_Id);

        // Insert feedback with fetched C_Id
        await db.query(
            "INSERT INTO Feedback (C_Id, Cl_Id, rating, comment) VALUES (?, ?, ?, ?)",
            [C_Id, Cl_Id, rating, comment]
        );

        res.status(201).json({ message: "✅ Feedback submitted successfully!" });
    } catch (error) {
        console.error("❌ Error submitting feedback:", error);
        res.status(500).json({ error: "❌ Internal Server Error" });
    }
});


// ✅ POST - Submit Feedback
// router.post("/", async (req, res) => { // 🔥 Route should be "/" instead of "/feedback"
//     try {
//         const { C_Id, Cl_Id, rating, comment } = req.body;

//         console.log("📩 Received Feedback Data:", req.body); // Debugging log

//         if (!Cl_Id || !C_Id || !comment || !rating) {
//             return res.status(400).json({ error: "Missing required fields" });
//         }

//         const query = `INSERT INTO Feedback (C_Id, Cl_Id, rating, comment, submitted_at) VALUES (?, ?, ?, ?, NOW())`;
//         const [result] = await db.query(query, [C_Id, Cl_Id, rating, comment]);

//         res.status(201).json({
//             message: "Feedback submitted successfully",
//             feedbackId: result.insertId
//         });

//     } catch (error) {
//         console.error("❌ Error inserting feedback:", error);
//         res.status(500).json({ error: "Database error" });
//     }
// });


// ✅ Delete Feedback by ID (DELETE)
router.delete("/:id", (req, res) => {
    const feedbackId = req.params.id;

    db.query("DELETE FROM Feedback WHERE F_Id = ?", [feedbackId], (err, result) => {
        if (err) {
            console.error("Error deleting feedback:", err);
            return res.status(500).json({ error: "Database error" });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Feedback not found" });
        }

        res.json({ message: "Feedback deleted successfully" });
    });
});

export default router;



















