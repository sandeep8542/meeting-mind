const OpenAI = require("openai");
const Meeting = require("../models/Meeting");
const Action = require("../models/Action");

const ai = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: "https://openrouter.ai/api/v1"
});

// Utility delay (retry)
const delay = (ms) => new Promise(res => setTimeout(res, ms));

// @POST /api/ai/process-transcript
exports.processTranscript = async (req, res) => {
  try {
    const { transcript, meetingId } = req.body;

    if (!transcript || transcript.trim().length < 20) {
      return res.json({
        success: false,
        message: "Try speaking a bit longer sentence",
      });
    }

    const safeTranscript = transcript.slice(0, 3000);

    const prompt = `
You are an AI assistant that analyzes meeting transcripts and extracts structured information.

Return ONLY valid JSON:

{
  "title": "Concise meeting title",
  "summary": "2-3 sentence summary",
  "keyPoints": ["point1", "point2"],
  "sentiment": "positive|neutral|negative",
  "participants": ["name1"],
  "tags": ["tag1"],
  "actions": [
    {
      "type": "task",
      "title": "Action title",
      "description": "Details",
      "priority": "low|medium|high|urgent",
      "assignee": null,
      "dueDate": null
    }
  ]
}

NO explanation. NO markdown.

TRANSCRIPT:
${safeTranscript}
`;

    let responseText;

    try {
      const completion = await ai.chat.completions.create({
        model: "meta-llama/llama-3-8b-instruct",
        messages: [
          { role: "system", content: "Return only valid JSON." },
          { role: "user", content: prompt }
        ],
        temperature: 0.2,
        max_tokens: 1200
      });

      responseText = completion.choices[0].message.content.trim();

    } catch (err) {
      console.log("Retrying AI...", err.message);

      await delay(2000);

      const retry = await ai.chat.completions.create({
        model: "meta-llama/llama-3-8b-instruct",
        messages: [
          { role: "system", content: "Return only valid JSON." },
          { role: "user", content: prompt }
        ],
        temperature: 0.2,
        max_tokens: 1200
      });

      responseText = retry.choices[0].message.content.trim();
    }

    // Clean response
    const jsonStr = responseText
      .replace(/```json\n?/g, "")
      .replace(/```\n?/g, "")
      .trim();

    let parsed;

    try {
      parsed = JSON.parse(jsonStr);
    } catch (e) {
      console.error("Invalid JSON:", responseText);
      return res.status(500).json({
        message: "AI returned invalid JSON",
        raw: responseText
      });
    }

    let meeting = null;
    let createdActions = [];

    if (meetingId) {
      // Update meeting
      meeting = await Meeting.findOneAndUpdate(
        { _id: meetingId, user: req.user?._id },
        {
          title: parsed.title || "Untitled Meeting",
          summary: parsed.summary,
          keyPoints: parsed.keyPoints || [],
          sentiment: parsed.sentiment || "neutral",
          participants: parsed.participants || [],
          tags: parsed.tags || [],
          status: "completed"
        },
        { new: true }
      );

      // Create actions
      if (parsed.actions && Array.isArray(parsed.actions)) {
        const actionIds = [];

        for (const actionData of parsed.actions) {
          try {
            const action = await Action.create({
              user: req.user?._id,
              meeting: meetingId,
              type: actionData.type || "task",
              title: actionData.title || "Untitled",
              description: actionData.description || "",
              priority: actionData.priority || "medium",
              assignee: actionData.assignee || null,
              dueDate: actionData.dueDate
                ? new Date(actionData.dueDate)
                : null
            });

            if (action && action._id) {
              createdActions.push(action);
              actionIds.push(action._id);
            }

          } catch (err) {
            console.log("Action creation failed:", err.message);
          }
        }

        if (actionIds.length > 0) {
          await Meeting.findByIdAndUpdate(meetingId, {
            $push: { actions: { $each: actionIds } }
          });
        }
      }

      return res.json({
        success: true,
        parsed,
        meeting,
        actions: createdActions
      });
    }

    res.json({ success: true, parsed });

  } catch (error) {
    console.error("AI process error:", error);
    res.status(500).json({
      message: "AI processing failed",
      error: error.message
    });
  }
};


// @POST /api/ai/chat
exports.chat = async (req, res) => {
  try {
    const { message, context } = req.body;

    const completion = await ai.chat.completions.create({
      model: "meta-llama/llama-3-8b-instruct",
      messages: [
        {
          role: "system",
          content: context
            ? `Context: ${context}`
            : "You are a meeting assistant."
        },
        {
          role: "user",
          content: message
        }
      ],
      temperature: 0.5,
      max_tokens: 800
    });

    res.json({
      success: true,
      response: completion.choices[0].message.content
    });

  } catch (error) {
    console.error("Chat error:", error);
    res.status(500).json({ message: "Chat failed" });
  }
};


// @POST /api/ai/suggest-actions
exports.suggestActions = async (req, res) => {
  try {
    const { transcript } = req.body;

    const completion = await ai.chat.completions.create({
      model: "meta-llama/llama-3-8b-instruct",
      messages: [
        {
          role: "system",
          content: "Return only JSON array of actions."
        },
        {
          role: "user",
          content: `Extract action items from this transcript:\n\n${transcript}`
        }
      ],
      temperature: 0.3,
      max_tokens: 1000
    });

    const responseText = completion.choices[0].message.content
      .replace(/```json\n?/g, "")
      .replace(/```\n?/g, "")
      .trim();

    const actions = JSON.parse(responseText);

    res.json({ success: true, actions });

  } catch (error) {
    console.error("Suggest actions error:", error);
    res.status(500).json({ message: "Failed to suggest actions" });
  }
};