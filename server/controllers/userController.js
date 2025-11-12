import userModel from "../models/userModel.js";

export const getUserData = async (req, res) => {
  try {
    const userId = req.user.id; // ✅ get user ID from middleware

    const user = await userModel.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User does not exist" });
    }

    return res.json({
      success: true,
      userData: {
        name: user.name,
        email: user.email,
        isAccountVerified: user.isAccountVerified,
        isActive: user.isActive,
      },
    });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: error.message });
  }
};
