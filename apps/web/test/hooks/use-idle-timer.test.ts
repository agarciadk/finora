import { renderHook } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { useIdleTimer } from "@/hooks/use-idle-timer"
import { USER_ACTIVITY_EVENT } from "@/lib/api"

describe("useIdleTimer", () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it("calls onIdleWarning after warningTimeout, then onIdle after logoutTimeout", () => {
    const onIdleWarning = vi.fn()
    const onIdle = vi.fn()
    renderHook(() =>
      useIdleTimer({
        warningTimeout: 1000,
        logoutTimeout: 1500,
        onIdleWarning,
        onIdle,
      })
    )

    vi.advanceTimersByTime(999)
    expect(onIdleWarning).not.toHaveBeenCalled()

    vi.advanceTimersByTime(1)
    expect(onIdleWarning).toHaveBeenCalledTimes(1)
    expect(onIdle).not.toHaveBeenCalled()

    vi.advanceTimersByTime(500)
    expect(onIdle).toHaveBeenCalledTimes(1)
  })

  it("resets both timers when activity is detected", () => {
    const onIdleWarning = vi.fn()
    const onIdle = vi.fn()
    renderHook(() =>
      useIdleTimer({
        warningTimeout: 1000,
        logoutTimeout: 1500,
        onIdleWarning,
        onIdle,
        throttleMs: 0,
      })
    )

    vi.advanceTimersByTime(700)
    window.dispatchEvent(new Event("mousemove"))
    vi.advanceTimersByTime(700)
    // 1400ms have passed in total, but activity at 700ms reset the clock, so
    // only 700ms have elapsed since the last reset: onIdleWarning shouldn't
    // fire yet.
    expect(onIdleWarning).not.toHaveBeenCalled()

    vi.advanceTimersByTime(300)
    expect(onIdleWarning).toHaveBeenCalledTimes(1)
  })

  it("ignores activity within the throttle window", () => {
    const onIdleWarning = vi.fn()
    const onIdle = vi.fn()
    renderHook(() =>
      useIdleTimer({
        warningTimeout: 1000,
        logoutTimeout: 1500,
        onIdleWarning,
        onIdle,
        throttleMs: 500,
      })
    )

    // First activity resets the deadline to t=1000 (relative to now).
    window.dispatchEvent(new Event("mousemove"))
    vi.advanceTimersByTime(400)
    // Second activity, 400ms later, falls within the 500ms throttle window
    // and must be ignored, so the deadline stays at t=1000.
    window.dispatchEvent(new Event("mousemove"))
    vi.advanceTimersByTime(600)

    expect(onIdleWarning).toHaveBeenCalledTimes(1)
  })

  it("resets both timers when the API activity event fires", () => {
    const onIdleWarning = vi.fn()
    const onIdle = vi.fn()
    renderHook(() =>
      useIdleTimer({
        warningTimeout: 1000,
        logoutTimeout: 1500,
        onIdleWarning,
        onIdle,
        throttleMs: 0,
      })
    )

    vi.advanceTimersByTime(700)
    window.dispatchEvent(new Event(USER_ACTIVITY_EVENT))
    vi.advanceTimersByTime(700)
    expect(onIdleWarning).not.toHaveBeenCalled()

    vi.advanceTimersByTime(300)
    expect(onIdleWarning).toHaveBeenCalledTimes(1)
  })

  it("calls onActivity on every throttled activity even before the timers fire", () => {
    const onActivity = vi.fn()
    renderHook(() =>
      useIdleTimer({
        warningTimeout: 1000,
        logoutTimeout: 1500,
        onIdleWarning: vi.fn(),
        onIdle: vi.fn(),
        onActivity,
        throttleMs: 0,
      })
    )

    window.dispatchEvent(new Event("mousemove"))
    expect(onActivity).toHaveBeenCalledTimes(1)
  })

  it("does not start listening when disabled", () => {
    const onIdleWarning = vi.fn()
    const onIdle = vi.fn()
    renderHook(() =>
      useIdleTimer({
        warningTimeout: 1000,
        logoutTimeout: 1500,
        onIdleWarning,
        onIdle,
        enabled: false,
      })
    )

    vi.advanceTimersByTime(5000)
    expect(onIdleWarning).not.toHaveBeenCalled()
    expect(onIdle).not.toHaveBeenCalled()
  })

  it("removes event listeners and cancels the timers on unmount", () => {
    const onIdleWarning = vi.fn()
    const onIdle = vi.fn()
    const removeEventListenerSpy = vi.spyOn(window, "removeEventListener")
    const { unmount } = renderHook(() =>
      useIdleTimer({
        warningTimeout: 1000,
        logoutTimeout: 1500,
        onIdleWarning,
        onIdle,
      })
    )

    unmount()
    expect(removeEventListenerSpy).toHaveBeenCalled()

    vi.advanceTimersByTime(5000)
    expect(onIdleWarning).not.toHaveBeenCalled()
    expect(onIdle).not.toHaveBeenCalled()

    removeEventListenerSpy.mockRestore()
  })

  it("exposes resetIdleTimer to manually restart the countdown", () => {
    const onIdleWarning = vi.fn()
    const onIdle = vi.fn()
    const { result } = renderHook(() =>
      useIdleTimer({
        warningTimeout: 1000,
        logoutTimeout: 1500,
        onIdleWarning,
        onIdle,
      })
    )

    vi.advanceTimersByTime(900)
    result.current.resetIdleTimer()
    vi.advanceTimersByTime(900)
    expect(onIdleWarning).not.toHaveBeenCalled()

    vi.advanceTimersByTime(100)
    expect(onIdleWarning).toHaveBeenCalledTimes(1)
  })
})

