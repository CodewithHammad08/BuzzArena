# ⚡ BuzzArena – Real-Time Quiz Buzzer Platform

> A production-quality, server-side fair quiz buzzer for college events, hackathons, and technical competitions.

![BuzzArena](https://img.shields.io/badge/BuzzArena-v1.0-f5c518?style=for-the-badge&logo=zap)
![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react)
![Socket.IO](https://img.shields.io/badge/Socket.IO-4.x-black?style=flat-square&logo=socket.io)
![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=flat-square&logo=node.js)

---

## 🎯 What is BuzzArena?

BuzzArena is a real-time multiplayer quiz buzzer where:
1. Host creates a room → gets a QR code + 6-char room code
2. Teams scan QR / enter room code to join
3. Host starts the countdown (3-2-1-GO)
4. Teams race to press the buzzer
5. **The server — never the frontend — decides the winner**
6. Host awards/deducts points (+10 correct / -5 wrong)
7. Live leaderboard updates for everyone instantly

---

## 🏗️ Project Structure

```
BuzzArena/
├── client/                     # React 19 + Vite frontend
│   └── src/
│       ├── components/         # BuzzerButton, Countdown, Leaderboard, WinnerModal, ...
│       ├── pages/              # Home, Join, Admin, Team, Results
│       ├── hooks/              # useSocket, useRoom, useSound
│       ├── context/            # RoomContext (global state)
│       ├── socket/             # Socket.IO singleton
│       └── utils/              # exportResults, formatters
├── server/                     # Node.js + Express + Socket.IO backend
│   ├── sockets/                # buzzerHandler.js — all socket logic
│   ├── utils/                  # roomManager.js (in-memory state), generateCode.js
│   ├── routes/                 # REST API routes
│   ├── controllers/            # Room creation / retrieval
│   ├── middleware/             # Room validation
│   ├── models/                 # MongoDB Room schema (optional)
│   ├── config/                 # DB connection
│   └── index.js                # Entry point
├── package.json                # Root monorepo
└── README.md
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm 9+

### 1. Clone & Install

```bash
git clone <your-repo-url>
cd BuzzArena

# Install all dependencies
npm install                    # root (concurrently)
npm install --prefix server    # backend deps
npm install --prefix client    # frontend deps
```

### 2. Configure Environment

Server:
```bash
cp server/.env.example server/.env
# Edit server/.env if needed (PORT, CLIENT_URL)
```

Client:
```bash
cp client/.env.example client/.env
# Edit VITE_SERVER_URL if server runs on a different port
```

### 3. Run Development Servers

**Option A — Both at once (from root):**
```bash
npm install  # installs concurrently
npm run dev  # starts both server (5000) and client (5173)
```

**Option B — Separately:**
```bash
# Terminal 1
cd server && npm run dev

# Terminal 2
cd client && npm run dev
```

Open **http://localhost:5173** in your browser.

---

## 🎮 How to Use

### As Host
1. Go to **http://localhost:5173**
2. Click **Create Room** tab
3. Enter a host password (≥ 4 chars) → click **Create Room**
4. Admin dashboard opens with QR code + room code
5. Share the QR code / room code with teams
6. Click **Start Round** → countdown → buzzers activate
7. Click **+10 Correct** or **-5 Wrong** to score the winner
8. Click **Reset Round** for the next question
9. Click **End Quiz** → Results page

### As Team
1. Scan QR code OR go to the join URL
2. Enter room code + team name → **Enter Arena**
3. Wait for the countdown
4. Press the giant red **BUZZ!** button as fast as possible
5. Watch the leaderboard update live

---

## ⚡ Socket Events Reference

### Client → Server
| Event | Payload | Description |
|-------|---------|-------------|
| `join-room` | `{ roomCode, teamName?, isHost, hostPassword? }` | Join or reconnect to room |
| `buzz` | `{ roomCode, teamName }` | Press the buzzer |
| `start-round` | `{ roomCode, hostPassword }` | Start 3-2-1-GO countdown |
| `reset-round` | `{ roomCode, hostPassword }` | Reset round state |
| `submit-score` | `{ roomCode, hostPassword, teamName, delta }` | Award/deduct points |
| `lock-buzzers` | `{ roomCode, hostPassword }` | Manually lock buzzers |
| `remove-team` | `{ roomCode, hostPassword, teamName }` | Remove a team |
| `edit-team` | `{ roomCode, hostPassword, oldName, newName }` | Rename a team |
| `end-quiz` | `{ roomCode, hostPassword }` | End quiz session |

### Server → Client
| Event | Payload | Description |
|-------|---------|-------------|
| `winner` | `{ teamName, reactionTime, timestamp }` | Winner announced |
| `leaderboard-update` | `{ teams[] }` | Scores updated |
| `countdown` | `{ value: 3\|2\|1\|'GO' }` | Countdown tick |
| `round-reset` | `{ roundNumber, history }` | Round was reset |
| `round-started` | `{ roundNumber }` | GO emitted, buzzers active |
| `team-joined` | `{ teamName, teams[] }` | New team joined |
| `room-update` | `{ locked, winner, teams, ... }` | General state sync |
| `quiz-ended` | `{ leaderboard, history }` | Quiz ended |
| `error` | `{ message }` | Error occurred |

---

## 🔌 REST API

| Method | Endpoint | Body | Description |
|--------|----------|------|-------------|
| `POST` | `/api/rooms` | `{ hostPassword }` | Create a new room |
| `GET` | `/api/rooms/:code` | — | Get room info (public) |
| `GET` | `/health` | — | Server health check |

---

## 🌐 Deployment

### Frontend → Vercel

```bash
cd client
npm run build

# Or connect your GitHub repo to Vercel
# Build command: npm run build
# Output directory: dist
# Root directory: client
```

Set environment variable in Vercel:
```
VITE_SERVER_URL=https://your-backend.onrender.com
```

### Backend → Render

1. Create a new **Web Service** on [Render](https://render.com)
2. Connect your GitHub repo
3. Set:
   - **Root directory**: `server`
   - **Build command**: `npm install`
   - **Start command**: `node index.js`
4. Add environment variables:
   ```
   PORT=10000
   CLIENT_URL=https://your-app.vercel.app
   NODE_ENV=production
   ```

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | 5000 | Server port |
| `CLIENT_URL` | http://localhost:5173 | CORS allowed origin |
| `MONGODB_URI` | (none) | Optional MongoDB URI |
| `ROOM_EXPIRY_HOURS` | 6 | Hours before unused rooms expire |
| `VITE_SERVER_URL` | http://localhost:5000 | Backend URL (client-side) |

---

## 🛡️ Architecture: Why Server-Side Winner?

The `buzz` event from any client triggers `setWinner()` in `roomManager.js`:

```js
function setWinner(roomCode, teamName) {
  const room = getRoom(roomCode);
  if (room.locked || room.winner) return { success: false }; // Too late!

  room.locked = true;    // Atomic lock — no race condition possible
  room.winner = teamName;
  // ...
}
```

- JavaScript is **single-threaded** → `room.locked` check is atomic
- First `buzz` event processed locks the room immediately
- All subsequent buzzes get `{ success: false }` → client sees "Too Late"
- Everyone receives the same `winner` broadcast

---

## 🗂️ Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | React 19, Vite, TailwindCSS |
| Animations | Framer Motion, canvas-confetti |
| Real-time | Socket.IO (client + server) |
| Icons | Lucide React |
| Notifications | React Hot Toast |
| QR Code | qrcode.react |
| Sound | Web Audio API (synthesized) |
| Backend | Node.js, Express |
| In-Memory DB | JavaScript Map |
| Optional DB | MongoDB + Mongoose |

---

## 📄 License

MIT © BuzzArena Team
