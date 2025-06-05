import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import mysql from "mysql2/promise";
import { fileURLToPath } from "url";
import path from "path";
import adminRoutes from "./routes/admin.js";
import complaintRoutes from "./routes/complaints.js";
import feedbackRoutes from "./routes/feedback.js";
import nodemailer from "nodemailer";
import userRoutes from "./routes/user.js";

import emailRoutes from "./routes/admin.js"; // ✅ Must include .js in ES Modules
import pool from "./db.js";







const app = express();
app.use(express.json());
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use("/", emailRoutes);



// Get correct __dirname in ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


// Serve Static Files
app.use(express.static(path.join(__dirname, "public")));
// ✅ Frontend Folder Ko Static Serve Karo
app.use(express.static(path.join(__dirname, "../frontend")));  
// ✅ AGAR DIRECT `comp.html` OPEN KAR RAHE HO

app.get("/login/login_final.html", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "login", "login_final.html"));
});
app.get("/home.html", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "home.html"));  });
    app.get("/", (req, res) => {
        res.sendFile(path.join(__dirname, "public", "home.html"));  });
    

// Route Definitions
app.use("/admin", adminRoutes);
app.use("/complaint", complaintRoutes);
app.use("/feedback", feedbackRoutes);
app.use("/user",userRoutes);
app.use("/register",userRoutes);


// Test Database Connection
pool.getConnection((err, connection) => {
    if (err) {
        console.error("Database connection failed:", err);
    } else {
        console.log("Connected to MySQL Database");
        connection.release();
    }
});

app.get("/test", async (req, res) => {
    try {
        console.log("📥 Test Route Hit!");
        const [rows] = await pool.query("SELECT 1 AS test");
        console.log("📤 Test Query Result:", rows);
        res.json(rows);
    } catch (error) {
        console.error("❌ Database Connection Error:", error);
        res.status(500).json({ message: "Database Connection Issue" });
    }
});


// ✅ Test Route
app.get("/", (req, res) => {
    res.send("Nagar Nigam Backend is Running!");
});

app.post("/chatbot", async (req, res) => {
    const { message } = req.body;
    const lowerCaseMessage = message?.toLowerCase() || "";

    let botResponse = "I'm sorry, I didn't understand that.";
    let category = null;
    let awaitingAddress = false;
    let awaitingOption = false;
    let optionType = "";

    const botResponses = {
        appreciation_response: "You're welcome! How else can I assist you?",
        farewell_response: "Goodbye! Have a great day!",
        time_response: "It usually takes a few minutes to process your request.",
        greetings: "Hello! How can I help you today?",
        street_light_problem: "You reported a street light issue. Please provide your address.",
        sewage_options: "Select an option: 1. Drainage issue  2. Waste water blockage",
        garbage_options: "Select an option: 1. Wet Garbage  2. Dry Garbage",
        stray_animals_options: "Select an option: 1. Dog  2. Cat  3. Other",
        stray_animals_other_prompt: "Please specify the stray animal issue."
    };

    if (["okay", "ok", "thanks", "thank you", "thanx"].some(word => lowerCaseMessage.includes(word))) {
        botResponse = botResponses["appreciation_response"];
    } else if (["bye", "goodbye"].some(word => lowerCaseMessage.includes(word))) {
        botResponse = botResponses["farewell_response"];
    } else if (["how much time", "duration", "time required"].some(phrase => lowerCaseMessage.includes(phrase))) {
        botResponse = botResponses["time_response"];
    } else if (["hello", "hi", "hey"].some(greeting => lowerCaseMessage.includes(greeting))) {
        botResponse = botResponses["greetings"];
    } else if (["help", "assist", "support"].some(helpWord => lowerCaseMessage.includes(helpWord))) {
        botResponse = "I'm here to help! You can report issues related to garbage, sewage, street lights, or stray animals.";
    } else if (lowerCaseMessage.includes("street light")) {
        category = "Street Light";
        botResponse = botResponses["street_light_problem"];
        awaitingAddress = true;
    } else if (lowerCaseMessage.includes("sewage")) {
        botResponse = botResponses["sewage_options"];
        awaitingOption = true;
        optionType = "sewage";
    } else if (lowerCaseMessage.includes("garbage")) {
        botResponse = botResponses["garbage_options"];
        awaitingOption = true;
        optionType = "garbage";
    } else if (lowerCaseMessage.includes("stray animals")) {
        botResponse = botResponses["stray_animals_options"];
        awaitingOption = true;
        optionType = "stray_animals";
    }

    // Handle user selecting options
    if (awaitingOption) {
        if (optionType === "sewage" && ["1", "drainage"].includes(lowerCaseMessage)) {
            category = "Sewage";
            botResponse = "You selected 'Drainage'. Please provide your address.";
            awaitingAddress = true;
        } else if (optionType === "sewage" && ["2", "waste water blockage"].includes(lowerCaseMessage)) {
            category = "Sewage";
            botResponse = "You selected 'Waste Water Blockage'. Please provide your address.";
            awaitingAddress = true;
        } else if (optionType === "garbage" && ["1", "wet garbage"].includes(lowerCaseMessage)) {
            category = "Garbage";
            botResponse = "You selected 'Wet Garbage'. Please provide your address.";
            awaitingAddress = true;
        } else if (optionType === "garbage" && ["2", "dry garbage"].includes(lowerCaseMessage)) {
            category = "Garbage";
            botResponse = "You selected 'Dry Garbage'. Please provide your address.";
            awaitingAddress = true;
        } else if (optionType === "stray_animals" && ["1", "dog"].includes(lowerCaseMessage)) {
            category = "Stray Animals";
            botResponse = "You selected 'Dog'. Please provide your address.";
            awaitingAddress = true;
        } else if (optionType === "stray_animals" && ["2", "cat"].includes(lowerCaseMessage)) {
            category = "Stray Animals";
            botResponse = "You selected 'Cat'. Please provide your address.";
            awaitingAddress = true;
        } else if (optionType === "stray_animals" && ["3", "other"].includes(lowerCaseMessage)) {
            botResponse = botResponses["stray_animals_other_prompt"];
        } else {
            botResponse = "Invalid option. Please try again.";
        }
    }

    // Store complaint in database
    if (category && awaitingAddress) {
        try {
            const sql = `INSERT INTO Complaint (Cat_Id, complaint_subject, issue_description, zone, ward, status)
                         VALUES ((SELECT Cat_Id FROM Complaint_Category WHERE category_name = ?), ?, ?, ?, ?, 'Pending')`;
            const [result] = await pool.query(sql, [category, category + " Issue", message, "Zone 1", "Ward 5"]);

            return res.json({ response: botResponse, complaintId: result.insertId });
        } catch (err) {
            console.error("❌ Database error:", err);
            return res.status(500).json({ message: "Database error", error: err });
        }
    }

    res.json({ response: botResponse });
});


// ✅ Fetch complaints for a specific user (client)
app.get("/complaints/user/:clientId", async (req, res) => {
    const clientId = req.params.clientId; // Get Client ID from URL

    try {
        const [complaints] = await pool.execute(
            `SELECT C_Id, complaint_subject, status, created_at 
             FROM Complaint 
             WHERE Cl_Id = ? 
             ORDER BY C_Id DESC 
             LIMIT 5`, 
            [clientId]
        );

        if (complaints.length === 0) {
            return res.status(404).json({ message: "No complaints found for this user" });
        }

        res.json(complaints);
    } catch (error) {
        console.error("❌ Error fetching complaints:", error);
        res.status(500).json({ error: "Database error" });
    }
});



app.get("/complaints", async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT c.C_Id, 
                    c.Cl_Id,
                    c.Cat_id,
                   c.complaint_subject, 
                   c.issue_description, 
                   c.zone, 
                   c.ward, 
                   c.contact_first_name, 
                   c.contact_last_name, 
                   c.mobile_number, 
                   c.email, 
                   c.status, 
                   c.created_at
                
            FROM Complaint c
            LEFT JOIN Complaint_Category cat ON c.Cat_Id = cat.Cat_Id
        `);

                  

        console.log("✅ Complaints fetched successfully!");
        res.json(rows);
    } catch (error) {
        console.error("❌ Error fetching complaints:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});


app.get("/complaints/:id", async (req, res) => {
    const complaintId = req.params.id;
    console.log("📥 Received Request for Complaint ID:", complaintId); // ✅ Debugging

    try {
        // ✅ Correct SQL Query
        const [rows] = await pool.execute(
            `SELECT c.C_Id, 
                    c.Cl_Id,
                    c.Cat_Id, 
                    c.complaint_subject, 
                    c.issue_description, 
                    c.zone, 
                    c.ward, 
                    c.contact_first_name, 
                    c.contact_last_name, 
                    c.mobile_number, 
                    c.email, 
                    c.status, 
                    c.created_at
            FROM Complaint c
            LEFT JOIN Complaint_Category cat ON c.Cat_Id = cat.Cat_Id
            WHERE c.C_Id = ?`, 
            [complaintId]
        );

        console.log("📤 Query Result:", rows); // ✅ Debugging

        if (rows.length === 0) {
            console.log("⚠️ No complaint found for ID:", complaintId);
            return res.status(404).json({ message: "Complaint not found" });
        }

        res.json(rows[0]); // ✅ Send response
    } catch (error) {
        console.error("❌ Error fetching complaint:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});


app.get("/complaints/category/:categoryId", async (req, res) => {
    try {
        const { categoryId } = req.params;

        // ✅ Fix the SQL query
        const sqlQuery = `
            SELECT c.C_Id, 
                   c.Cl_Id,
                   c.Cat_Id,  -- ✅ Removed incorrect semicolon here
                   c.complaint_subject, 
                   c.issue_description, 
                   c.zone, 
                   c.ward, 
                   c.contact_first_name, 
                   c.contact_last_name, 
                   c.mobile_number, 
                   c.email, 
                   c.status, 
                   c.created_at
            FROM Complaint c
            WHERE c.Cat_Id = ?
        `;

        const [results] = await pool.query(sqlQuery, [categoryId]);

        if (results.length === 0) {
            return res.status(404).json({ message: "No complaints found for this category" });
        }

        res.json(results);
    } catch (err) {
        console.error("❌ Error fetching complaints by category:", err);
        res.status(500).json({ error: "Failed to fetch complaints" });
    }
});


app.post("/complaints", async (req, res) => {
    console.log("📥 Received Data:", req.body);  // Debugging Incoming Data

    const { Cl_Id, Cat_Id, complaint_subject, issue_description, zone, ward, contact_first_name, contact_last_name, mobile_number, email, status } = req.body;

    // ✅ Debugging: Check if any field is missing
    if (!Cl_Id || !Cat_Id || !complaint_subject || !issue_description || !zone || !ward || !contact_first_name || !contact_last_name || !mobile_number || !email || !status) {
        console.log("❌ Missing required fields");
        return res.status(400).json({ error: "Missing required fields" });
    }

    try {
        const query = `
            INSERT INTO Complaint (Cl_Id, Cat_Id, complaint_subject, issue_description, zone, ward, contact_first_name, contact_last_name, mobile_number, email, status, created_at) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`;

        const values = [Cl_Id, Cat_Id, complaint_subject, issue_description, zone, ward, contact_first_name, contact_last_name, mobile_number, email, status];

        console.log("📝 Executing SQL Query:", query);
        console.log("📊 With Values:", values);

        const [result] = await pool.query(query, values);

        console.log("✅ Complaint Submitted Successfully:", result.insertId);
        res.status(201).json({ message: "Complaint submitted successfully", complaint_id: result.insertId });

    } catch (error) {
        console.error("❌ Error submitting complaint:", error.sqlMessage || error);
        res.status(500).json({ error: "Failed to submit complaint", details: error.sqlMessage || error.message });
    }
});


// ✅ Update Complaint Status
app.put("/complaints/:id", async (req, res) => {
    const complaintId = req.params.id;  // 🔹 URL se Complaint ID
    const { status } = req.body; // 🔹 Body se 'status' field

    if (!status) {
        return res.status(400).json({ error: "Missing required field: status" });
    }

    try {
        console.log(`🔄 Updating Complaint ID: ${complaintId} to Status: ${status}`); // ✅ Debugging

        // ✅ Check if complaint exists
        const [complaint] = await pool.execute(
            "SELECT * FROM Complaint WHERE C_Id = ?",
            [complaintId]
        );

        if (complaint.length === 0) {
            return res.status(404).json({ error: "Complaint not found!" });
        }

        // ✅ SQL Query to Update Complaint Status
        const [result] = await pool.execute(
            `UPDATE Complaint SET status = ? WHERE C_Id = ?`,
            [status, complaintId]
        );

        console.log("✅ Update Result:", result); // ✅ Debugging

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Complaint not found or no changes made" });
        }

        res.json({ message: "Complaint updated successfully!" });

    } catch (error) {
        console.error("❌ Error updating complaint:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

app.put("/complaints/update-status/:id", async (req, res) => {
    const complaintId = req.params.id;
    const { status } = req.body;

    if (!status) {
        return res.status(400).json({ error: "Missing required field: status" });
    }

    try {
        const [result] = await pool.query(
            "UPDATE Complaint SET status = ? WHERE C_Id = ?",
            [status, complaintId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Complaint not found" });
        }

        res.json({ message: "Complaint status updated successfully" });
    } catch (error) {
        console.error("❌ Error updating status:", error);
        res.status(500).json({ error: "Database error" });
    }
});

// ✅ PUT API to Update Complaint Status
app.put("/admin/update-complaint-status/:id", async (req, res) => {
    const complaintId = req.params.id;
    const { status } = req.body;

    console.log("🔹 Received Request - Complaint ID:", complaintId, "Status:", status);

    if (!status) {
        return res.status(400).json({ error: "Missing required field: status" });
    }

    try {
        console.log("🔹 Connecting to Database...");
        
        const [result] = await pool.execute(  // ✅ `execute()` is safer than `query()`
            "UPDATE Complaint SET status = ? WHERE C_Id = ?",
            [status, complaintId]
        );

        console.log("🔹 MySQL Update Result:", result);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Complaint not found" });
        }

        res.json({ message: "Complaint status updated successfully" });
    } catch (error) {
        console.error("❌ Database Error:", error);
        res.status(500).json({ error: error.message });
    }
});


app.get("/admin/resolved-complaints", async (req, res) => {
    try {
        const [resolvedComplaints] = await pool.execute(
            "SELECT * FROM Complaint WHERE status = 'Resolved'"
        );

        if (resolvedComplaints.length === 0) {
            return res.status(404).json({ message: "No resolved complaints found" });
        }

        res.json(resolvedComplaints);
    } catch (error) {
        console.error("❌ Error fetching resolved complaints:", error);
        res.status(500).json({ error: "Database error" });
    }
});


// ✅ Move Resolved Complaint to History
app.put("/complaints/resolve/:id", (req, res) => {
    const complaintId = req.params.id;

    // Move to Resolved_Complaints Table
    const moveQuery = `
        INSERT INTO Resolved_Complaints (C_Id, Cl_Id, A_Id, category, complaintSubject, issueDescription, zone, ward, firstName, lastName, mobileNumber, email)
        SELECT * FROM Complaint WHERE C_Id = ?`;

    db.query(moveQuery, [complaintId], (err, result) => {
        if (err) {
            console.error("Error moving to history:", err);
            return res.status(500).json({ error: "Database error" });
        }

        // Delete from Complaint Table
        db.query("DELETE FROM Complaint WHERE C_Id = ?", [complaintId], (err, deleteResult) => {
            if (err) {
                console.error("Error deleting complaint:", err);
                return res.status(500).json({ error: "Database error" });
            }
            res.json({ message: "Complaint resolved and moved to history" });
        });
    });
});
app.get("/complaints/solved", (req, res) => {
    db.query("SELECT * FROM resolved_complaints", (err, results) => {
        if (err) {
            console.error("Error fetching solved complaints:", err);
            res.status(500).json({ error: "Database error" });
        } else {
            res.json(results);
        }
    });
});

// Nodemailer setup
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: "shriyas836@gmail.com", // Replace with your email
        pass: "hkuavxrtboauuuya" 
    },
    debug: true,  // Enable debug logging
    logger: true  
});


app.put("/admin/update-complaint-status/:id", async (req, res) => {
    const complaintId = req.params.id;
    const { status } = req.body;

    try {
        // ✅ 1. Update complaint status in the database
        await db.query("UPDATE Complaint SET status = ? WHERE C_Id = ?", [status, complaintId]);

        // ✅ 2. Fetch the email of the user who filed the complaint
        const [result] = await db.query("SELECT email FROM Complaint WHERE C_Id = ?", [complaintId]);

        if (!result.length) {
            console.log("❌ No Complaint Found for ID:", complaintId);
            return res.status(404).json({ error: "Complaint not found!" });
        }

        const userEmail = result[0].email; // Ensure 'email' matches your database column name

        // 🔍 Debugging:
        console.log("✅ Complaint ID:", complaintId);
        console.log("📩 Fetched User Email:", userEmail);

        // ✅ 3. Send email to user inside try-catch
        try {
            let mailOptions = {
                from: "shriyas3008@gmail.com",
                to: userEmail,
                subject: "Complaint Resolved ✔",
                text: "Your complaint has been resolved."
            };

            let info = await transporter.sendMail(mailOptions);
            
            console.log("📩 Email Sent Successfully!", info.response); // Debugging email response

            // ✅ 4. Send confirmation response to Postman
            res.json({
                message: "✅ Complaint status updated successfully!",
                emailStatus: `📩 Email sent to ${userEmail}`,
                emailResponse: info.response
            });

        } catch (emailError) {
            console.error("❌ Email Sending Failed:", emailError);
            res.status(500).json({ error: "Failed to send email" });
        }

    } catch (error) {
        console.error("❌ Error updating status or fetching email:", error);
        res.status(500).json({ error: "Failed to update status or send email" });
    }
});
app.get("/complaints/category/:id", async (req, res) => {
    const categoryId = req.params.id;

    try {
        const [complaints] = await pool.query(
            `SELECT * FROM Complaint WHERE Cat_Id = ?`, 
            [categoryId]
        );

        if (complaints.length === 0) {
            return res.status(404).json({ message: "No complaints found in this category" });
        }

        res.json(complaints);
    } catch (error) {
        console.error("❌ Error fetching complaints by category:", error);
        res.status(500).json({ error: "Failed to fetch complaints" });
    }
});
 

app.post("/send-email", async (req, res) => {
    const { email, message } = req.body;

    if (!email || !message) {
        return res.status(400).json({ error: "Missing required fields" });
    }

    try {
        // Set up email transport (NodeMailer)
        let transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 587,
            secure: false,
            auth: {
                user: "shriyas836@gmail.com",
                pass: "ohbdlbkqfyiqevbl"
            }
        });

        // Email options
        let mailOptions = {
            from: "shriyas836@gmail.com",
            to: email,
            subject: "Complaint Update",
            text: message
        };

        // Send email
        let info = await transporter.sendMail(mailOptions);
        console.log("Email sent: " + info.response);

        res.json({ message: "Email sent successfully!" });
    } catch (error) {
        console.error("Email Error:", error);
        res.status(500).json({ error: `Failed to send email: ${error.message}` });
    }
    
    
});


// ✅ Handle 404 for Undefined Routes
app.use((req, res) => {
    res.status(404).json({ error: "Route not found" });
});

// ✅ Start Server
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});


