const MINUTES_TO_MS = 60 * 1000

function readMinutesEnv(key: string, fallbackMinutes: number): number {
  const raw = import.meta.env[key] as string | undefined
  const parsed = raw !== undefined ? Number(raw) : NaN
  const minutes = Number.isFinite(parsed) && parsed > 0 ? parsed : fallbackMinutes

  return minutes * MINUTES_TO_MS
}

// Single source of truth for both the idle-warning system (use-idle-logout.ts)
// and the session heartbeat (use-session-heartbeat.ts), driven by
// VITE_IDLE_WARNING_MINUTES/VITE_IDLE_LOGOUT_MINUTES so they can be shortened
// for manual/e2e testing without touching code. Sharing IDLE_WARNING_TIMEOUT_MS
// between both also guarantees they always agree on what counts as "the user
// is still active": the heartbeat must never keep the session alive for
// longer than the idle-warning system would still consider the user present,
// or the warning modal never gets a chance to take over.
export const IDLE_WARNING_TIMEOUT_MS = readMinutesEnv(
  "VITE_IDLE_WARNING_MINUTES",
  14
)
export const IDLE_LOGOUT_TIMEOUT_MS = readMinutesEnv(
  "VITE_IDLE_LOGOUT_MINUTES",
  15
)
