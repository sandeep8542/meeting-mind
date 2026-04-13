# 🎙️ MeetingMind — AI-Powered Meeting Intelligence

> Transform spoken conversations into structured tasks, calendar events, and meeting notes — powered by Google Gemini AI.

---

## ✨ Features

- **🎤 Live Voice Recording** — Real-time speech-to-text using Web Speech API
- **🧠 Gemini AI Processing** — Automatically extracts tasks, events, notes, decisions
- **📋 Smart Action Management** — Track tasks, mark complete, filter by type/status
- **📅 Calendar Event Detection** — Converts mentioned dates/times into events
- **📊 Dashboard Analytics** — Meeting stats, recent history, completion progress
- **🔐 JWT Authentication** — Secure sign-up/login with bcrypt password hashing
- **📱 Responsive Design** — Works on desktop and mobile

---

## 🛠 Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | React 18, Framer Motion, React Router v6 |
| Backend | Node.js, Express.js |
| Database | MongoDB + Mongoose |
| AI | Google Gemini 1.5 Flash |
| Auth | JWT + bcryptjs |
| Speech | Web Speech API (browser-native) |
| Styling | CSS Modules with design system |

---

## 🚀 Getting Started

### Prerequisites
- Node.js v18+
- MongoDB Atlas account (or local MongoDB)
- Google Gemini API Key

### 1. Clone & Install

```bash
git clone <your-repo>
cd meeting-mind
npm run install-all
```

### 2. Configure Environment

```bash
cp .env.example .env
```

Edit `.env`:

```env
PORT=5000
MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/meetingmind
JWT_SECRET=your_super_long_random_secret_here
GEMINI_API_KEY=your_gemini_api_key_here
NODE_ENV=development
```

**Get a Gemini API Key:**
1. Visit [Google AI Studio](https://aistudio.google.com)
2. Click "Get API Key" → Create API key
3. Paste into `.env` as `GEMINI_API_KEY`

**Get a MongoDB URI:**
1. Visit [MongoDB Atlas](https://cloud.mongodb.com)
2. Create a free cluster
3. Click "Connect" → "Connect your application"
4. Copy the connection string

### 3. Run in Development

```bash
npm run dev
```

- **Backend**: http://localhost:5000
- **Frontend**: http://localhost:3000

### 4. Build for Production

```bash
cd client && npm run build
cd ..
NODE_ENV=production npm start
```

---

## 📁 Project Structure

```
meeting-mind/
├── server/
│   ├── index.js              # Express app entry
│   ├── models/
│   │   ├── User.js           # User schema
│   │   ├── Meeting.js        # Meeting schema
│   │   └── Action.js         # Task/event/note schema
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── meetingController.js
│   │   ├── actionController.js
│   │   └── aiController.js   # Gemini AI integration
│   ├── routes/
│   │   ├── auth.js
│   │   ├── meetings.js
│   │   ├── actions.js
│   │   └── ai.js
│   └── middleware/
│       └── auth.js           # JWT verification
│
└── client/
    └── src/
        ├── App.js            # Routing
        ├── context/
        │   └── AuthContext.js
        ├── hooks/
        │   └── useSpeechToText.js   # Web Speech API hook
        ├── pages/
        │   ├── LandingPage.js
        │   ├── LoginPage.js
        │   ├── RegisterPage.js
        │   ├── DashboardPage.js     # Stats + meeting list
        │   ├── MeetingPage.js       # Record + AI process
        │   ├── MeetingDetailPage.js # View results
        │   └── ActionsPage.js       # Manage all actions
        ├── components/ui/
        │   └── Sidebar.js
        └── utils/
            └── api.js        # Axios instance
```

---

## 🔌 API Reference

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Create account |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Get current user |

### Meetings
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/meetings` | List meetings |
| POST | `/api/meetings` | Create meeting |
| GET | `/api/meetings/:id` | Get meeting |
| PUT | `/api/meetings/:id` | Update meeting |
| DELETE | `/api/meetings/:id` | Delete meeting |
| GET | `/api/meetings/stats` | Dashboard stats |

### Actions
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/actions` | List actions (filterable) |
| POST | `/api/actions` | Create action |
| PUT | `/api/actions/:id` | Update action |
| DELETE | `/api/actions/:id` | Delete action |

### AI
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/ai/process-transcript` | Full AI analysis |
| POST | `/api/ai/chat` | Ask AI about meeting |
| POST | `/api/ai/suggest-actions` | Quick action extraction |

---

## 🌐 Browser Support

The Web Speech API is supported in:
- ✅ Chrome 25+
- ✅ Edge 79+
- ✅ Safari 14.1+
- ⚠️ Firefox — requires `media.webspeech.recognition.enable` flag

For unsupported browsers, a **manual transcript paste** fallback is available.

---

## 📸 Pages Overview

| Page | Route | Description |
|------|-------|-------------|
| Landing | `/` | Marketing page |
| Login | `/login` | Sign in |
| Register | `/register` | Sign up |
| Dashboard | `/dashboard` | Stats + recent meetings |
| New Meeting | `/meeting/new` | Record + AI analyze |
| Meeting Detail | `/meeting/:id` | View transcript + actions |
| Actions | `/actions` | Manage all actions |

---

## 🔒 Security

- Passwords hashed with bcrypt (12 salt rounds)
- JWT tokens expire in 7 days
- All API routes protected with auth middleware
- CORS configured for development/production
- Input validation on all Mongoose models

---

## 📄 License

MIT — built for educational and portfolio purposes.
