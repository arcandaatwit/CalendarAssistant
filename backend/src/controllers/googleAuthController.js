import jwt from "jsonwebtoken";

export const googleAuthCallback = (req, res) => {
  try {
    // Passport attaches the authenticated Google user to req.user
    const user = req.user;

    if (!user) {
      return res.status(401).json({ error: "Google authentication failed" });
    }

    // Create JWT token for your frontend
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // Redirect to frontend with token
   return res.redirect(`http://localhost:5173/main?token=${token}`
);


  } catch (err) {
    console.error("Google Auth Error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};
