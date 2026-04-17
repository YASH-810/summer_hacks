// types/index.ts — FocusOS Data Models (Section 5 of AGENT.md)

export type FocusMode = 'light' | 'balanced' | 'strict'
export type PhoneClassification = 'distraction' | 'intentional' | 'quick_check'
export type SessionStatus = 'setup' | 'active' | 'paused' | 'completed'
export type WorkType = 'coding' | 'studying' | 'writing' | 'design' | 'other'

export interface Task {
  id: string
  text: string
  done: boolean
  completedAt?: string // ISO timestamp
}

export interface Session {
  id: string
  userId: string
  title: string
  plannedDuration: number      // minutes
  actualDuration?: number      // minutes — filled on completion
  focusMode: FocusMode
  tasks: Task[]
  status: SessionStatus
  energyBefore?: number        // 1-5
  energyAfter?: number         // 1-5
  focusQuality?: number        // 1-5 self-rated
  phonePlacement?: string      // 'desk' | 'face_down' | 'other_room'
  phoneLinked: boolean
  startTime: string            // ISO timestamp
  endTime?: string
  completionStatus?: 'yes' | 'partially' | 'no'
  biggestBlocker?: string
  attentionScore?: number      // 0-100 calculated
  createdAt: string
}

export interface PCEvent {
  id: string
  sessionId: string
  type: 'tab_leave' | 'tab_return' | 'idle_start' | 'idle_end' | 'manual_distraction'
  timestamp: string
  durationSeconds?: number
  distractionTag?: string      // 'social_media' | 'video' | 'messaging' | 'other'
}

export interface PhoneEvent {
  id: string
  sessionId: string
  type: 'pickup' | 'putdown' | 'page_leave' | 'page_return'
  timestamp: string
  durationSeconds?: number
  classification?: PhoneClassification
  workDeclared: boolean        // user tapped "Using for work"
}

export interface UserProfile {
  uid: string
  name: string
  workType: WorkType
  perceivedPeakTime: string    // 'morning' | 'afternoon' | 'evening' | 'night'
  perceivedAvgSession: number  // minutes
  topDistractors: string[]
  onboardingComplete: boolean
  createdAt: string
}

export interface AttentionScore {
  sessionId: string
  score: number                // 0-100
  breakdown: {
    focusTimeRatio: number     // actual/planned * 40
    taskCompletion: number     // tasks done/total * 30
    distractionPenalty: number
    recoverySpeed: number
  }
}
