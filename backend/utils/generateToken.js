import jwt from "jsonwebtoken";

const generateToken = (id, res) => {
  const token = jwt.sign({ id }, process.env.JWT_SEC, {
    expiresIn: "15d",
  });

  res.cookie("token", token, {
  maxAge: 15 * 24 * 60 * 60 * 1000, // 15 days
  httpOnly: true,
  secure: true,        // ✅ required for HTTPS (Render)
  sameSite: "None",    // ✅ allows cross-domain cookie
});

};

export default generateToken;
