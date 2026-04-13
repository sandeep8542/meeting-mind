const Action = require('../models/Action');

// @GET /api/actions
exports.getActions = async (req, res) => {
  try {
    const { type, status, page = 1, limit = 20 } = req.query;

    const userId = req.user?._id || req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    const query = { user: userId };

    if (type) query.type = type;
    if (status) query.status = status;

    const actions = await Action.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('meeting', 'title createdAt');

    const total = await Action.countDocuments(query);

    res.json({
      success: true,
      actions,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error("GET ACTIONS ERROR:", error);
    res.status(500).json({ message: 'Failed to fetch actions.' });
  }
};

// @POST
exports.createAction = async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id;

    const { meetingId, ...actionData } = req.body;

    const action = await Action.create({
      ...actionData,
      user: userId,
      meeting: meetingId
    });

    res.status(201).json({ success: true, action });

  } catch (error) {
    console.error("CREATE ACTION ERROR:", error);
    res.status(500).json({ message: 'Failed to create action.' });
  }
};

// @PUT
exports.updateAction = async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id;

    // 🔥 FORCE VALID STATUS
    const newStatus =
      req.body.status === "completed" ? "completed" : "pending";

    const action = await Action.findOneAndUpdate(
      {
        _id: req.params.id,
        user: userId
      },
      { status: newStatus }, // ✅ only update status
      { new: true, runValidators: true }
    ).populate('meeting', 'title');

    console.log("UPDATED ACTION:", action); // debug

    if (!action) {
      return res.status(404).json({ message: 'Action not found.' });
    }

    res.json({ success: true, action });

  } catch (error) {
    console.error("UPDATE ACTION ERROR:", error);
    res.status(500).json({ message: 'Failed to update action.' });
  }
};

// @DELETE
exports.deleteAction = async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id;

    const action = await Action.findOneAndDelete({
      _id: req.params.id,
      user: userId
    });

    if (!action) return res.status(404).json({ message: 'Action not found.' });

    res.json({ success: true, message: 'Action deleted.' });

  } catch (error) {
    console.error("DELETE ACTION ERROR:", error);
    res.status(500).json({ message: 'Failed to delete action.' });
  }
};