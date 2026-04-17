# AGENT.md — FocusOS
### Cross-Device Attention Intelligence System
> This file is the single source of truth for AI-assisted development of FocusOS.
> Read this fully before writing any code.

---

## 1. PROJECT OVERVIEW

**FocusOS** is a cross-device focus tracking web app where users run timed work sessions on PC while optionally linking their phone via QR code. The system tracks distractions on both devices, classifies phone use as intentional vs distraction, and generates AI-powered re-entry prompts and coaching insights.

**Hackathon context:** ITM SummerHacks '26 — PS3 (Focus OS)
**Target:** 24-hour build, working demo, polished UI

---

## 2. TECH STACK

| Layer | Tech | Notes |
|---|---|---|
| Framework | Next.js 14 (App Router) | Use `app/` directory only |
| Styling | Tailwind CSS | Dark theme, custom CSS vars |
| Database | Firebase Firestore | Real-time sync PC ↔ phone |
| Auth | Firebase Auth (Google) | Simple Google sign-in |
| AI | Gemini 2.0 Flash API | Re-entry prompts + coaching |
| Charts | Recharts | Analytics dashboard |
| QR | `qrcode.react` | Session linking |
| Icons | `lucide-react` | Consistent icon set |
| Animations | Framer Motion | Page transitions + micro-interactions |

---

## 3. DESIGN SYSTEM

### Color Palette (CSS Variables)
```css
:root {
  --bg-primary: #0a0a0f;        /* near-black base */
  --bg-secondary: #111118;      /* card backgrounds */
  --bg-elevated: #1a1a24;       /* elevated surfaces */
  --border: #2a2a3a;            /* subtle borders */
  --border-glow: #3d3d5c;       /* active borders */

  --accent-primary: #6c63ff;    /* electric violet — primary CTA */
  --accent-secondary: #00d4aa;  /* mint green — success/completion */
  --accent-warning: #ff6b35;    /* orange — distraction alerts */
  --accent-danger: #ff4757;     /* red — critical alerts */
  --accent-phone: #ffd700;      /* gold — phone events */

  --text-primary: #f0f0ff;      /* near-white */
  --text-secondary: #8888aa;    /* muted labels */
  --text-tertiary: #555570;     /* disabled/placeholder */

  --focus-glow: rgba(108, 99, 255, 0.15);   /* violet glow */
  --success-glow: rgba(0, 212, 170, 0.15);  /* mint glow */
  --warning-glow: rgba(255, 107, 53, 0.15); /* orange glow */
}
```

### Typography
```css
/* Headlines */
font-family: 'Space Mono', monospace;  /* technical, focused feel */

/* Body */
font-family: 'DM Sans', sans-serif;    /* clean, readable */

/* Monospace data/numbers */
font-family: 'JetBrains Mono', monospace; /* timers, stats */
```

### Component Patterns
- Cards: `bg-[--bg-secondary] border border-[--border] rounded-2xl`
- Active state: add `border-[--accent-primary] shadow-[0_0_20px_var(--focus-glow)]`
- Buttons primary: `bg-[--accent-primary] hover:brightness-110 transition`
- Danger buttons: `bg-transparent border border-[--accent-danger] text-[--accent-danger]`
- All timers/numbers: use JetBrains Mono font

### Aesthetic Direction
- **Dark, technical, calm** — like a mission control room, not a consumer app
- Subtle grid texture on background
- Glowing borders on active elements
- No gradients on backgrounds — flat dark cards
- Accent colors only on interactive/important elements
- Generous whitespace, data-dense but not cluttered

---

## 4. PROJECT STRUCTURE

```
focusos/
├── app/
│   ├── layout.tsx                  # Root layout, fonts, providers
│   ├── page.tsx                    # Landing page
│   ├── (auth)/
│   │   └── login/page.tsx          # Google sign-in
│   ├── (app)/
│   │   ├── layout.tsx              # App shell with sidebar
│   │   ├── dashboard/page.tsx      # Main dashboard
│   │   ├── session/
│   │   │   ├── setup/page.tsx      # Session setup form
│   │   │   └── active/page.tsx     # Active session screen
│   │   ├── debrief/
│   │   │   └── [sessionId]/page.tsx # Post-session debrief
│   │   └── analytics/page.tsx      # Full analytics dashboard
│   └── phone/
│       └── [sessionId]/page.tsx    # Phone companion page (mobile)
├── components/
│   ├── ui/                         # Base UI components
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Modal.tsx
│   │   ├── Badge.tsx
│   │   └── ProgressBar.tsx
│   ├── session/
│   │   ├── Timer.tsx               # Circular timer display
│   │   ├── TaskChecklist.tsx       # Task list with checkboxes
│   │   ├── DistractionAlert.tsx    # PC distraction banner
│   │   ├── PhoneAlert.tsx          # Phone pickup alert
│   │   ├── ReentryPrompt.tsx       # Gemini re-entry card
│   │   └── FocusModeSelector.tsx   # Light/Balanced/Strict
│   ├── phone/
│   │   ├── PhoneCompanion.tsx      # Main phone lock screen
│   │   ├── OrientationTracker.tsx  # Face-down detection
│   │   └── IntentButtons.tsx       # Work vs distraction buttons
│   ├── dashboard/
│   │   ├── StatsOverview.tsx       # Today's summary cards
│   │   ├── FocusHeatmap.tsx        # Time-of-day heatmap
│   │   ├── SessionHistory.tsx      # Recent sessions list
│   │   └── AICoachingCard.tsx      # Weekly Gemini insight
│   └── analytics/
│       ├── PlannedVsActual.tsx     # Duration comparison chart
│       ├── DistractionBreakdown.tsx # Pie chart
│       ├── PhoneImpact.tsx         # Phone vs no-phone comparison
│       └── AttentionScore.tsx      # Score trend over time
├── lib/
│   ├── firebase.ts                 # Firebase init + exports
│   ├── firestore/
│   │   ├── sessions.ts             # Session CRUD operations
│   │   ├── events.ts               # PC + phone event logging
│   │   └── users.ts                # User profile + onboarding
│   ├── gemini.ts                   # Gemini API calls
│   ├── analytics.ts                # Pattern aggregation logic
│   └── attention-score.ts          # Score calculation
├── hooks/
│   ├── useSession.ts               # Active session state
│   ├── usePageVisibility.ts        # Tab visibility detection
│   ├── useIdleDetection.ts         # Mouse/keyboard idle
│   ├── usePhoneSync.ts             # Firestore phone event listener
│   └── useTimer.ts                 # Session countdown logic
├── types/
│   └── index.ts                    # All TypeScript interfaces
└── constants/
    └── apps.ts                     # Focus vs distraction app categories
```

---

## 5. DATA MODELS (TypeScript)

```typescript
// types/index.ts

export type FocusMode = 'light' | 'balanced' | 'strict'
export type PhoneClassification = 'distraction' | 'intentional' | 'quick_check'
export type SessionStatus = 'setup' | 'active' | 'paused' | 'completed'
export type WorkType = 'coding' | 'studying' | 'writing' | 'design' | 'other'

export interface Task {
  id: string
  text: string
  done: boolean
  completedAt?: string  // ISO timestamp
}

export interface Session {
  id: string
  userId: string
  title: string
  plannedDuration: number     // minutes
  actualDuration?: number     // minutes — filled on completion
  focusMode: FocusMode
  tasks: Task[]
  status: SessionStatus
  energyBefore?: number       // 1-5
  energyAfter?: number        // 1-5
  focusQuality?: number       // 1-5 self-rated
  phonePlacement?: string     // 'desk' | 'face_down' | 'other_room'
  phoneLinked: boolean
  startTime: string           // ISO timestamp
  endTime?: string
  completionStatus?: 'yes' | 'partially' | 'no'
  biggestBlocker?: string
  attentionScore?: number     // 0-100 calculated
  createdAt: string
}

export interface PCEvent {
  id: string
  sessionId: string
  type: 'tab_leave' | 'tab_return' | 'idle_start' | 'idle_end' | 'manual_distraction'
  timestamp: string
  durationSeconds?: number
  distractionTag?: string     // 'social_media' | 'video' | 'messaging' | 'other'
}

export interface PhoneEvent {
  id: string
  sessionId: string
  type: 'pickup' | 'putdown' | 'page_leave' | 'page_return'
  timestamp: string
  durationSeconds?: number
  classification?: PhoneClassification
  workDeclared: boolean       // user tapped "Using for work"
}

export interface UserProfile {
  uid: string
  name: string
  workType: WorkType
  perceivedPeakTime: string   // 'morning' | 'afternoon' | 'evening' | 'night'
  perceivedAvgSession: number // minutes
  topDistractors: string[]
  onboardingComplete: boolean
  createdAt: string
}

export interface AttentionScore {
  sessionId: string
  score: number               // 0-100
  breakdown: {
    focusTimeRatio: number    // actual/planned * 40
    taskCompletion: number    // tasks done/total * 30
    distractionPenalty: number
    recoverySpeed: number
  }
}
```

---

## 6. FIREBASE STRUCTURE

```
firestore/
├── users/{userId}
│   └── (UserProfile fields)
├── sessions/{sessionId}
│   ├── (Session fields)
│   ├── pcEvents/            ← subcollection
│   │   └── {eventId}
│   └── phoneEvents/         ← subcollection
│       └── {eventId}
└── activeSession/{userId}   ← live document for real-time sync
    ├── sessionId
    ├── phoneLinked
    ├── lastPhoneEvent
    └── lastPCEvent
```

**Key rule:** `activeSession/{userId}` is the real-time bridge between PC and phone. Both devices read/write this document. Use `onSnapshot` for live updates.

---

## 7. KEY FEATURES — IMPLEMENTATION NOTES

### 7.1 Tab Visibility Detection (PC)
```typescript
// hooks/usePageVisibility.ts
useEffect(() => {
  const handler = () => {
    if (document.visibilityState === 'hidden') {
      // Log PC distraction event to Firestore
      logPCEvent({ type: 'tab_leave', sessionId, timestamp: new Date().toISOString() })
    } else {
      // Log return + trigger re-entry prompt
      logPCEvent({ type: 'tab_return', sessionId, timestamp: new Date().toISOString() })
      triggerReentryPrompt()
    }
  }
  document.addEventListener('visibilitychange', handler)
  return () => document.removeEventListener('visibilitychange', handler)
}, [sessionId])
```

### 7.2 Phone Face-Down Detection
```typescript
// components/phone/OrientationTracker.tsx
window.addEventListener('deviceorientation', (e) => {
  // beta > 150 or < -150 means face down
  const isFaceDown = Math.abs(e.beta) > 150
  if (isFaceDown && !wasFaceDown) {
    logPhoneEvent({ type: 'putdown', sessionId })
  } else if (!isFaceDown && wasFaceDown) {
    logPhoneEvent({ type: 'pickup', sessionId })
  }
})
// Note: Requires HTTPS + user permission prompt on iOS
```

### 7.3 Intent Classification Logic
```typescript
// lib/analytics.ts
function classifyPhoneEvent(event: PhoneEvent): PhoneClassification {
  if (event.workDeclared) return 'intentional'
  if (event.durationSeconds && event.durationSeconds < 30) return 'quick_check'
  return 'distraction'
}
```

### 7.4 Real-Time PC ↔ Phone Sync
```typescript
// Both devices listen to same Firestore document
const unsubscribe = onSnapshot(
  doc(db, 'activeSession', userId),
  (snap) => {
    const data = snap.data()
    if (data?.lastPhoneEvent?.type === 'pickup') {
      showPhonePickupAlert()  // on PC
    }
  }
)
```

### 7.5 Gemini Re-entry Prompt
```typescript
// lib/gemini.ts
export async function generateReentryPrompt(session: Session, interruptions: number) {
  const prompt = `
    User is in a focus session titled: "${session.title}"
    Tasks: ${session.tasks.map(t => `${t.done ? '✓' : '○'} ${t.text}`).join(', ')}
    Session running for: ${getElapsedMinutes(session.startTime)} minutes
    Interruptions so far: ${interruptions}

    Generate a re-entry context card in under 60 words:
    Line 1: What they were working on (specific)
    Line 2: Where they likely left off
    Line 3: One concrete next action to resume immediately
    
    Be specific and direct. No motivation. No fluff.
    Return plain text only, 3 lines separated by newlines.
  `
  // Call Gemini API
}
```

### 7.6 Attention Score Calculation
```typescript
// lib/attention-score.ts
export function calculateAttentionScore(session: Session, events: PCEvent[], phoneEvents: PhoneEvent[]): number {
  const focusTimeRatio = Math.min((session.actualDuration / session.plannedDuration), 1) * 40
  const taskCompletion = (session.tasks.filter(t => t.done).length / session.tasks.length) * 30
  const totalDistractions = events.filter(e => e.type === 'tab_leave').length
    + phoneEvents.filter(e => e.classification === 'distraction').length
  const distractionPenalty = Math.max(0, 20 - (totalDistractions * 4))
  const recoverySpeed = 10  // calculate from avg time between distraction and return
  return Math.round(focusTimeRatio + taskCompletion + distractionPenalty + recoverySpeed)
}
```

---

## 8. PAGE-BY-PAGE SPECS

### 8.1 Landing Page (`/`)
- Hero: "Stop managing distractions. Start understanding them."
- Animated demo showing PC + phone side by side
- Feature highlights: Cross-device, AI re-entry, Pattern insights
- CTA: "Start for free" → Google sign-in

### 8.2 Onboarding (`/onboarding`)
- Only shown once after first sign-in
- 4 questions, one per screen (not a long form)
- Progress dots at top
- Store to `users/{userId}` on completion

### 8.3 Dashboard (`/dashboard`)
- Top row: Today's stats (focus hours, sessions, attention score)
- Middle: Recent sessions list with scores
- Right: AI coaching card (weekly Gemini insight)
- Bottom: Focus heatmap (7-day)
- FAB: "Start Session" button always visible

### 8.4 Session Setup (`/session/setup`)
- Left: Title input + task checklist (add/remove tasks)
- Right: Duration selector + focus mode + energy level
- Bottom: Phone link prompt with QR code
- "Start Session" → navigates to `/session/active`

### 8.5 Active Session (`/session/active`)
- Full screen, minimal distractions
- Center: Circular timer (large, JetBrains Mono font)
- Left panel: Task checklist (checkable during session)
- Right panel: Live event log (tab switches, phone events)
- Bottom bar: "I got distracted" + "Take break" + "End session"
- Distraction alerts: slide-in banners at top
- Re-entry prompt: modal overlay on tab return

### 8.6 Phone Companion (`/phone/[sessionId]`)
- Full screen lock UI
- Shows session title + timer (synced from Firestore)
- Two main buttons: "I need my phone" (logs reason) + "Using for work ✓"
- Face-down detection running in background
- Page visibility detection running in background
- Status indicator: "🔒 Phone locked" or "📱 Session active"

### 8.7 Debrief (`/debrief/[sessionId]`)
- Auto-summary: planned vs actual, tasks done, distractions
- User inputs: completion status, quality rating, blocker, energy after
- Attention score reveal (animated number)
- "View Analytics" + "Start Another Session" CTAs

### 8.8 Analytics (`/analytics`)
- Planned vs Actual duration — line chart
- Attention score trend — line chart
- Distraction breakdown — pie chart
- Focus heatmap — full view
- Phone impact comparison — bar chart (linked vs not linked sessions)
- AI weekly report — full Gemini coaching output

---

## 9. ENVIRONMENT VARIABLES

```env
# .env.local
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
NEXT_PUBLIC_GEMINI_API_KEY=
```

---

## 10. SPRINT PLAN

### Sprint 1 — Core Loop (8 hrs) ← START HERE
- [ ] Next.js project setup with Tailwind + Firebase
- [ ] Google Auth
- [ ] Onboarding form → Firestore
- [ ] Session setup page (title, tasks, duration, focus mode)
- [ ] Active session page (timer, checklist, tab visibility detection)
- [ ] Post-session debrief
- [ ] Basic Firestore session storage

### Sprint 2 — Intelligence Layer (8 hrs)
- [ ] QR code generation on session setup
- [ ] Phone companion page (`/phone/[sessionId]`)
- [ ] DeviceOrientation face-down detection on phone
- [ ] Page visibility on phone
- [ ] Firebase real-time sync PC ↔ phone
- [ ] Phone pickup alert on PC dashboard
- [ ] Intent classification (distraction vs intentional)
- [ ] Gemini re-entry prompt on tab return

### Sprint 3 — Analytics + Polish (6 hrs)
- [ ] Recharts dashboard (all 5 charts)
- [ ] Attention score calculation + display
- [ ] Gemini weekly coaching card
- [ ] Focus heatmap
- [ ] UI polish across all screens
- [ ] Demo data seeding script
- [ ] Mobile responsiveness on phone companion page

### Pitch Prep (2 hrs)
- [ ] Live demo script (3 minutes)
- [ ] Seed realistic 2-week session history
- [ ] Test QR link + phone sync flow end to end

---

## 11. DEMO SCRIPT (for judges)

```
1. Open FocusOS on laptop → show dashboard with 2 weeks of seeded data
2. Click "Start Session" → fill: "Build Auth Module", 3 tasks, 45 min, Balanced mode
3. QR code appears → scan with phone → show phone companion screen
4. Session starts → place phone face-down (show PC detects "Phone locked 🔒")
5. Mid-demo: pick up phone → PC instantly shows "📱 Phone picked up" alert
6. Switch to YouTube tab on PC → distraction banner appears
7. Return to tab → Gemini re-entry prompt appears (show the 3 lines)
8. Check off a task on checklist
9. End session → debrief screen with attention score reveal
10. Navigate to Analytics → show focus heatmap + phone impact chart
11. Show AI coaching card → "You focus best at 9am, your phone caused 60% of distractions"
```

**Total demo time: ~3 minutes**

---

## 12. KNOWN CONSTRAINTS & HONEST LIMITS

| Constraint | Reality | How to handle |
|---|---|---|
| DeviceOrientation on iOS | Requires user permission prompt in Safari | Show permission request on phone companion load |
| WhatsApp notification reading | Impossible in browser, needs native Android app | Descope for hackathon, mention as future scope |
| Actual app tracking on PC | Needs Electron, not possible in browser | Use tab visibility as proxy, mention Electron in pitch |
| Real-time sync latency | Firebase onSnapshot has ~200-500ms delay | Acceptable for demo, mention in architecture |
| Gemini API rate limits | Free tier: 15 req/min | Cache re-entry prompts, batch coaching calls |

---

## 13. HOW TO USE THIS FILE WITH AI TOOLS

### With Claude / Cursor / Copilot:
Always start your prompt with:
```
Read AGENT.md fully. Then [your task].
```

### Effective prompt patterns:

**Building a new page:**
```
Read AGENT.md. Build the Session Setup page (/session/setup) 
following the design system, data models, and page spec in section 8.4.
Use the exact color variables defined in section 3.
```

**Building a hook:**
```
Read AGENT.md. Build the usePageVisibility hook as specified in 
section 7.1. It should log events to Firestore using the PCEvent 
type from section 5.
```

**Building a component:**
```
Read AGENT.md. Build the Timer component. It should display 
remaining time in MM:SS format using JetBrains Mono font, 
as a circular progress ring, using --accent-primary color for 
the ring. Accept props: totalSeconds, remainingSeconds.
```

**Debugging:**
```
Read AGENT.md. The phone sync isn't updating the PC in real time.
Check section 7.4 for the expected Firebase sync pattern and 
help me debug [paste your code].
```

**Adding a feature:**
```
Read AGENT.md. Add the Attention Score calculation to the debrief page.
Follow the formula in section 7.6, display it as an animated number 
reveal using Framer Motion, using the design system from section 3.
```

---

## 14. PACKAGES TO INSTALL

```bash
npx create-next-app@latest focusos  --tailwind --app
cd focusos

npm install firebase
npm install recharts
npm install qrcode.react
npm install lucide-react
npm install framer-motion
npm install @google/generative-ai
```

---

## 15. QUICK REFERENCE — FIRESTORE OPERATIONS

```typescript
// Create session
await setDoc(doc(db, 'sessions', sessionId), sessionData)

// Log PC event
await addDoc(collection(db, 'sessions', sessionId, 'pcEvents'), eventData)

// Log phone event  
await addDoc(collection(db, 'sessions', sessionId, 'phoneEvents'), eventData)

// Update active session (real-time bridge)
await setDoc(doc(db, 'activeSession', userId), { 
  sessionId, 
  lastPhoneEvent: eventData,
  updatedAt: new Date().toISOString()
}, { merge: true })

// Listen on PC for phone events
onSnapshot(doc(db, 'activeSession', userId), (snap) => {
  const data = snap.data()
  // handle phone event
})

// Get all sessions for analytics
const q = query(
  collection(db, 'sessions'),
  where('userId', '==', userId),
  where('status', '==', 'completed'),
  orderBy('startTime', 'desc')
)
```