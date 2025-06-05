import mysql from "mysql2";

// ✅ Create a MySQL connection pool
const pool = mysql.createPool({
    host: "localhost",
    user: "root",
    password: "superuser$123",
    database: "nagam1",
    port: 3306,
    waitForConnections: true,
    connectionLimit: 30,
    queueLimit: 0
});

// ✅ Convert pool to use Promises (IMPORTANT)
const db = pool.promise();

// ✅ Test connection (Using Callback)
pool.getConnection((err, connection) => {
    if (err) {
        console.error("❌ Database connection failed:", err);
    } else {
        console.log("✅ Successfully connected to MySQL database!");
        connection.release(); // Release the connection back to the pool
    }
});

export default db;  // ✅ Correctly export the `db` object



