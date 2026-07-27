import express from "express";
import passport from "../middleware/googleAuth.js";
import jwt from "jsonwebtoken";

const router = express.Router();

// STEP 1 — redirect to Google
router.get(
  "/google",
  passport.authenticate("google", {
    scope: [
      "profile",
      "email",
      "https://www.googleapis.com/auth/calendar.readonly",
      "https://www.googleapis.com/auth/tasks.readonly",
    ],
    accessType: "offline", // required for Google to issue a refresh token
    prompt: "consent",     // forces the consent screen so we actually get one
    session: false, // explicitly no session
  })
);

// STEP 2 — Google callback → create JWT → redirect to frontend with token
router.get(
  "/google/callback",
  passport.authenticate("google", { session: false }),
  (req, res) => {
    
    const user = req.user;

    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );


    return res.redirect(`http://localhost:5173/main?token=${token}`);


    
  }
);

export default router;
