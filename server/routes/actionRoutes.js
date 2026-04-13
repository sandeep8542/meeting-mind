const express = require("express");
const router = express.Router();
const Action = require("../models/Action");

// ✅ UPDATE ACTION (mark done / pending)
router.put("/:id", async (req, res) => {
  try {
    const action = await Action.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!action) {
      return res.status(404).json({ message: "Action not found" });
    }

    res.json({ success: true, action });
  } catch (error) {
    console.error("Update error:", error);
    res.status(500).json({ message: "Failed to update action" });
  }
});

// ✅ DELETE ACTION
router.delete("/:id", async (req, res) => {
  try {
    const action = await Action.findByIdAndDelete(req.params.id);

    if (!action) {
      return res.status(404).json({ message: "Action not found" });
    }

    res.json({ success: true, message: "Action deleted" });
  } catch (error) {
    console.error("Delete error:", error);
    res.status(500).json({ message: "Failed to delete action" });
  }
});

module.exports = router;