import express from "express";
import db from "../db.js"; 
//import { authenticateUser } from "./routes/authMiddleware.js"; 

const router = express.Router();


// ✅ Define Category Mapping
const categoryMap = {
    "garbage": 1,
    "sewage": 2,
    "street light": 3,
    "stray animals": 4
};
// ✅ Submit Complaint Route
router.post("/submit", async (req, res) => {
    const {
        Cl_Id, category, complaintSubject, issueDescription,
        zone, ward, firstName, lastName, mobileNumber, email
    } = req.body;

    if (!Cl_Id || !category || !complaintSubject || !issueDescription || 
        !zone || !ward || !firstName || !lastName || !mobileNumber || !email) {
        return res.status(400).json({ error: "⚠️ All fields are required" });
    }

    // ✅ Convert category string to numeric Cat_Id
    const Cat_Id = categoryMap[category.toLowerCase()];
    if (!Cat_Id) {
        return res.status(400).json({ error: "⚠️ Invalid category type. Use: garbage, sewage, street light, stray animals" });
    }

    try {
        const sql = `
            INSERT INTO Complaint (Cl_Id, Cat_Id, complaint_subject, issue_description, zone, ward, contact_first_name, contact_last_name, mobile_number, email)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

        const values = [Cl_Id, Cat_Id, complaintSubject, issueDescription, zone, ward, firstName, lastName, mobileNumber, email];

        console.log("Executing SQL Query:", sql);
        console.log("With Values:", values);

        const [result] = await db.query(sql, values);

        res.status(201).json({ message: "✅ Complaint submitted successfully!", complaintId: result.insertId });

    } catch (err) {
        console.error("❌ Full Database Error:", err); // ✅ Show full error in logs
        res.status(500).json({ message: "Database error", error: err });
    }
});



// ✅ Fetch Complaints by Category
router.get("/category/:category", async (req, res) => {
    const { category } = req.params;

    try {
        const [results] = await db.promise().query(
            "SELECT * FROM Complaint WHERE Cat_Id = ?", [category]
        );

        if (results.length === 0) {
            return res.status(404).json({ message: "No complaints found for this category" });
        }
        
        res.json(results);
    } catch (err) {
        console.error("❌ Database error:", err);
        res.status(500).json({ error: "Database error" });
    }
});

export default router;
