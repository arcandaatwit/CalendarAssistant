// backend/controllers/authController.js
import db from "../config/db.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";

const JWT_SECRET = process.env.JWT_SECRET;
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const authController = {
  // REGISTER (email + password)
  register: async (req, res) => {
    try {
      const { name, email, password } = req.body;

      if (!name || !email || !password) {
        return res.status(400).json({ error: "All fields are required" });
      }

      // check if email already exists
      const [existing] = await db.query(
        "SELECT id FROM users WHERE email = ?",
        [email]
      );

      if (existing.length > 0) {
        return res.status(400).json({ error: "Email already exists" });
      }

      const hashedPassword = bcrypt.hashSync(password, 10);

      const sql = `
        INSERT INTO users (name, email, password)
        VALUES (?, ?, ?)
      `;

      const [result] = await db.query(sql, [name, email, hashedPassword]);

      const token = jwt.sign({ id: result.insertId }, JWT_SECRET, {
        expiresIn: "7d"
      });

      res.json({
        message: "User registered",
        token,
        user: {
          id: result.insertId,
          name,
          email
        }
      });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: "Registration failed" });
    }
  },

  // LOGIN (email + password)
  login: async (req, res) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ error: "Email and password required" });
      }

      const [rows] = await db.query(
        "SELECT * FROM users WHERE email = ?",
        [email]
      );

      if (rows.length === 0) {
        return res.status(400).json({ error: "Invalid email" });
      }

      const user = rows[0];

      if (!user.password) {
        return res.status(400).json({ error: "This account uses Google login" });
      }

      const passwordMatch = bcrypt.compareSync(password, user.password);
      if (!passwordMatch) {
        return res.status(400).json({ error: "Invalid password" });
      }

      const token = jwt.sign({ id: user.id }, JWT_SECRET, {
        expiresIn: "7d"
      });

      res.json({
        message: "Login successful",
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          google_id: user.google_id,
          profile_p: user.profile_p
        }
      });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: "Login failed" });
    }
  },

  // GOOGLE AUTH (secure token verification)
  googleAuth: async (req, res) => {
    try {
      const { credential } = req.body; // Google ID token

      if (!credential) {
        return res.status(400).json({ error: "Missing Google credential" });
      }

      // 1. Verify Google token
      const ticket = await client.verifyIdToken({
        idToken: credential,
        audience: process.env.GOOGLE_CLIENT_ID,
      });

      const payload = ticket.getPayload();
      const email = payload.email;
      const name = payload.name;
      const picture = payload.picture;
      const googleId = payload.sub; // unique Google user ID

      // 2. Check if user exists
      const [rows] = await db.query(
        "SELECT * FROM users WHERE email = ?",
        [email]
      );

      let user;

      if (rows.length === 0) {
        // 3. Create new Google user
        const [result] = await db.query(
          "INSERT INTO users (name, email, google_id, profile_p) VALUES (?, ?, ?, ?)",
          [name, email, googleId, picture]
        );

        user = {
          id: result.insertId,
          name,
          email,
          google_id: googleId,
          profile_p: picture
        };
      } else {
        user = rows[0];
      }

      // 4. Create JWT
      const token = jwt.sign(
        { id: user.id },
        JWT_SECRET,
        { expiresIn: "7d" }
      );

      res.json({
        message: "Google auth successful",
        token,
        user
      });

    } catch (err) {
      console.error("Google Auth Error:", err);
      return res.status(500).json({ error: "Google authentication failed" });
    }
  }
};

export default authController;
