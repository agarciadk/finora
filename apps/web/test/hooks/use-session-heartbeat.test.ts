import { renderHook } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { useSessionHeartbeat } from "@/hooks/use-session-heartbeat"

const mockUseAuth = vi.fn()
const mockTriggerSilentRefresh = vi.fn()

vi.mock("@/hooks/use-auth", () => ({
  useAuth: () => mockUseAuth(),
}))

vi.mock("@/lib/api", () => ({
  triggerSilentRefresh: () => mockTriggerSilentRefresh(),
  USER_ACTIVITY_EVENT: "finora:user-activity",
}))

function futureIsoString(msFromNow: number) {
  return new Date(Date.now() + msFromNow).toISOString()
}

describe("useSessionHeartbeat", () => {
  beforeEach(() => {
    vi.useFakeTimers()
    mockTriggerSilentRefresh.mockReset()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it("refreshes when the user has been active within activityTimeoutMs", () => {
    // expiresAt 70s away, 60s refresh lead => scheduled to fire at t=10s.
    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
      user: { expiresAt: futureIsoString(70_000) },
    })

    renderHook(() => useSessionHeartbeat({ activityTimeoutMs: 60_000 }))

    vi.advanceTimersByTime(10_000)
    expect(mockTriggerSilentRefresh).toHaveBeenCalledTimes(1)
  })

  it("does NOT refresh when the last activity is older than activityTimeoutMs", () => {
    // Same schedule (fires at t=10s), but activityTimeoutMs is shorter than
    // that: the only activity stamp is the one taken at mount (t=0), which
    // is stale by the time the check runs.
    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
      user: { expiresAt: futureIsoString(70_000) },
    })

    renderHook(() => useSessionHeartbeat({ activityTimeoutMs: 5_000 }))

    vi.advanceTimersByTime(10_000)
    expect(mockTriggerSilentRefresh).not.toHaveBeenCalled()
    // This is what lets the idle-warning modal actually take over instead of
    // the heartbeat silently keeping the session (and its idle clock) alive.
  })

  it("refreshes if a real DOM activity event resets the last-activity timestamp", () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
      user: { expiresAt: futureIsoString(70_000) },
    })

    renderHook(() => useSessionHeartbeat({ activityTimeoutMs: 5_000 }))

    vi.advanceTimersByTime(8_000)
    window.dispatchEvent(new Event("mousemove"))
    vi.advanceTimersByTime(2_000)

    expect(mockTriggerSilentRefresh).toHaveBeenCalledTimes(1)
  })

  it("does not schedule anything while unauthenticated", () => {
    mockUseAuth.mockReturnValue({ isAuthenticated: false, user: null })

    renderHook(() => useSessionHeartbeat())

    vi.advanceTimersByTime(60 * 60 * 1000)
    expect(mockTriggerSilentRefresh).not.toHaveBeenCalled()
  })
})
