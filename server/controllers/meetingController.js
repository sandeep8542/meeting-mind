const Meeting = require("../models/Meeting");
const Action = require("../models/Action");

// ✅ GET STATS
exports.getStats = async (req, res) => {
  try {
    const userId = req.user?._id;

    if (!userId) {
      return res.status(400).json({ message: "User not found" });
    }

    // ✅ Get all meetings of user
    const meetings = await Meeting.find({ user: userId }).select("_id");

    const meetingIds = meetings.map(m => m._id);

    // ✅ TOTAL ACTIONS (ALL meetings)
    const totalActions = await Action.countDocuments({
      meeting: { $in: meetingIds }
    });

    // ✅ COMPLETED TASKS (ALL meetings)
    const completedTasks = await Action.countDocuments({
      meeting: { $in: meetingIds },
      status: "completed"
    });

    // ✅ CALENDAR EVENTS
    const calendarEvents = await Action.countDocuments({
      meeting: { $in: meetingIds },
      type: "calendar_event"
    });

    const totalMeetings = meetings.length;

    res.json({
      success: true,
      stats: {
        totalMeetings,
        totalActions,
        completedTasks,
        calendarEvents
      }
    });

  } catch (error) {
    console.error("STATS ERROR:", error);
    res.status(500).json({ message: "Failed to fetch stats" });
  }
};


// ✅ GET ALL MEETINGS
exports.getMeetings = async (req, res) => {
  try {
    const userId = req.user?._id;

    console.log("USER FROM TOKEN:", req.user);

    if (!userId) {
      return res.status(400).json({ message: "User ID missing" });
    }

    const meetings = await Meeting.find({ user: userId })
      .sort({ createdAt: -1 })
      .limit(parseInt(req.query.limit) || 10);

    res.json({
      success: true,
      meetings
    });

  } catch (error) {
    console.error("MEETINGS ERROR:", error);
    res.status(500).json({ message: "Failed to fetch meetings" });
  }
};


// ✅ GET SINGLE MEETING (WITH ACTIONS POPULATED)
exports.getMeeting = async (req, res) => {
  try {
    const userId = req.user?._id;

    const meeting = await Meeting.findOne({
      _id: req.params.id,
      user: userId
    });

    if (!meeting) {
      return res.status(404).json({ message: "Meeting not found" });
    }

    // 🔥 FETCH ACTIONS DIRECTLY (IMPORTANT FIX)
    let actions = await Action.find({
  meeting: meeting._id
}).sort({ createdAt: -1 });

// 🔥 FALLBACK (FOR OLD DATA)
if (actions.length === 0) {
  actions = await Action.find({
    user: userId
  }).sort({ createdAt: -1 });
}
    res.json({
      success: true,
      meeting: {
        ...meeting.toObject(),
        actions // ✅ override with real actions
      }
    });

  } catch (error) {
    console.error("GET ONE ERROR:", error);
    res.status(500).json({ message: "Failed to fetch meeting" });
  }
};
// ✅ CREATE MEETING
exports.createMeeting = async (req, res) => {
  try {
    const userId = req.user?._id;

    const meeting = await Meeting.create({
      user: userId,
      title: req.body.title || "Untitled Meeting",
      transcript: req.body.transcript || ""
    });

    res.status(201).json({ success: true, meeting });

  } catch (error) {
    console.error("CREATE ERROR:", error);
    res.status(500).json({ message: "Failed to create meeting" });
  }
};


// ✅ UPDATE MEETING
exports.updateMeeting = async (req, res) => {
  try {
    const userId = req.user?._id;

    const meeting = await Meeting.findOneAndUpdate(
      { _id: req.params.id, user: userId },
      req.body,
      { new: true }
    );

    res.json({ success: true, meeting });

  } catch (error) {
    console.error("UPDATE ERROR:", error);
    res.status(500).json({ message: "Failed to update meeting" });
  }
};


// ✅ DELETE MEETING
exports.deleteMeeting = async (req, res) => {
  try {
    const userId = req.user?._id;

    await Meeting.findOneAndDelete({
      _id: req.params.id,
      user: userId
    });

    res.json({ success: true });

  } catch (error) {
    console.error("DELETE ERROR:", error);
    res.status(500).json({ message: "Failed to delete meeting" });
  }
};