// src/config/db.js
import mysql from "mysql2/promise";
import dotenv from "dotenv";
dotenv.config();

console.log("db.js is loading...");

const db = await mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

// Test connection
db.query("SELECT 1")
  .then(() => console.log("Connected to MySQL database"))
  .catch((err) => console.error("Database connection failed:", err));

export default db;

