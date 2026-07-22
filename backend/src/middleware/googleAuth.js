import dotenv from "dotenv";
dotenv.config();

import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import db from "../config/db.js";

// 🔥 Add these RIGHT HERE
console.log("GOOGLE_CLIENT_ID:", process.env.GOOGLE_CLIENT_ID);
console.log("GOOGLE_CLIENT_SECRET:", process.env.GOOGLE_CLIENT_SECRET);
console.log("GOOGLE_CALLBACK_URL:", process.env.GOOGLE_CALLBACK_URL);



passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
      passReqToCallback: true
    },
    async (req, accessToken, refreshToken, profile, done) => {
      try {
       

        const googleId = profile.id;
        const email = profile.emails[0].value;
        const name = profile.displayName;
        const picture = profile.photos?.[0]?.value;

        // 1️⃣ Check if user already exists by email
        const [existing] = await db.execute(
          "SELECT * FROM users WHERE email = ?",
          [email]
        );

        if (existing.length > 0) {
          // ⭐ ALWAYS update Google fields
          await db.execute(
            "UPDATE users SET google_id = ?, name = ?, profile_pic = ? WHERE email = ?",
            [googleId, name, picture, email]
          );

          // Return updated user
          const [updated] = await db.execute(
            "SELECT * FROM users WHERE email = ?",
            [email]
          );

          return done(null, updated[0]);
        }

        // 2️⃣ If user does NOT exist → create new Google user
        const [result] = await db.execute(
          "INSERT INTO users (email, google_id, name, profile_pic) VALUES (?, ?, ?, ?)",
          [email, googleId, name, picture]
        );

        return done(null, {
          id: result.insertId,
          email,
          google_id: googleId,
          name,
          profile_pic: picture
        });

      } catch (err) {
        console.error("🔥 REAL DB ERROR:", err);
        return done(null, false);
      }
    }
  )
);

export default passport;
