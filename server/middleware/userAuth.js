import jwt from "jsonwebtoken";

export const userAuth = (req, res, next) => {
  try {
    const token = req.cookies.token;

    if (!token)
      return res
        .status(401)
        .json({ success: false, message: "Not Authorized! Login Again!" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded.id)
      return res
        .status(401)
        .json({ success: false, message: "Not Authorized! Login Again!" });

    req.user = { id: decoded.id };
    next();
  } catch (error) {
    console.error("userAuth error:", error.message);
    return res
      .status(401)
      .json({ success: false, message: "Invalid token! Login Again!" });
  }
};

export default userAuth;