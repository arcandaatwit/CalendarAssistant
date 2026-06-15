
import { db } from "../config/db.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const authController = {
  register: async (req, res) => {
    try {
      const { name, email, password } = req.body;

      const hashedPassword = bcrypt.hashSync(password, 10);

      const sql = `
        INSERT INTO users (name, email, password)
        VALUES (?, ?, ?)
      `;

      const [result] = await db.query(sql, [name, email, hashedPassword]);

      res.json({ message: "User registered", userId: result.insertId });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Registration failed" });
    }
  },

  login: async (req, res) => {
    try {
      const { email, password } = req.body;

      const sql = "SELECT * FROM users WHERE email = ?";

      const [rows] = await db.query(sql, [email]);

      if (rows.length === 0)
        return res.status(400).json({ error: "Invalid email" });

      const user = rows[0];

      const passwordMatch = bcrypt.compareSync(password, user.password);
      if (!passwordMatch)
        return res.status(400).json({ error: "Invalid password" });

      const token = jwt.sign({ id: user.id }, "secret123", { expiresIn: "7d" });

      res.json({
        message: "Login successful",
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email
        }
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Login failed" });
    }
  }
};

export default authController;
