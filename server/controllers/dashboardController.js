const Action = require("../models/Action");

exports.getDashboard = async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id;

    console.log("USER:", req.user); // DEBUG

    if (!userId) {
      return res.status(400).json({ message: "User not found" });
    }

    const actions = await Action.find({ user: userId });

    res.json({
      success: true,
      totalActions: actions.length,
      actions
    });

  } catch (err) {
    console.error("Dashboard Error:", err);
    res.status(500).json({ message: "Failed to load dashboard data" });
  }
};