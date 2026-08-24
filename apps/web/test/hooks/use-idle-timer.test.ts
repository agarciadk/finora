import { renderHook } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { useIdleTimer } from "@/hooks/use-idle-timer"

describe("useIdleTimer", () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it("calls onIdle after the timeout elapses without activity", () => {
    const onIdle = vi.fn()
    renderHook(() => useIdleTimer({ timeout: 1000, onIdle }))

    vi.advanceTimersByTime(999)
    expect(onIdle).not.toHaveBeenCalled()

    vi.advanceTimersByTime(1)
    expect(onIdle).toHaveBeenCalledTimes(1)
  })

  it("resets the timer when activity is detected", () => {
    const onIdle = vi.fn()
    renderHook(() => useIdleTimer({ timeout: 1000, onIdle, throttleMs: 0 }))

    vi.advanceTimersByTime(700)
    window.dispatchEvent(new Event("mousemove"))
    vi.advanceTimersByTime(700)
    // 1400ms have passed in total, but activity at 700ms reset the clock, so
    // only 700ms have elapsed since the last reset: onIdle shouldn't fire yet.
    expect(onIdle).not.toHaveBeenCalled()

    vi.advanceTimersByTime(300)
    expect(onIdle).toHaveBeenCalledTimes(1)
  })

  it("ignores activity within the throttle window", () => {
    const onIdle = vi.fn()
    renderHook(() => useIdleTimer({ timeout: 1000, onIdle, throttleMs: 500 }))

    // First activity resets the deadline to t=1000 (relative to now).
    window.dispatchEvent(new Event("mousemove"))
    vi.advanceTimersByTime(400)
    // Second activity, 400ms later, falls within the 500ms throttle window
    // and must be ignored, so the deadline stays at t=1000.
    window.dispatchEvent(new Event("mousemove"))
    vi.advanceTimersByTime(600)

    expect(onIdle).toHaveBeenCalledTimes(1)
  })

  it("does not start listening when disabled", () => {
    const onIdle = vi.fn()
    renderHook(() =>
      useIdleTimer({ timeout: 1000, onIdle, enabled: false })
    )

    vi.advanceTimersByTime(5000)
    expect(onIdle).not.toHaveBeenCalled()
  })

  it("removes event listeners and cancels the timer on unmount", () => {
    const onIdle = vi.fn()
    const removeEventListenerSpy = vi.spyOn(window, "removeEventListener")
    const { unmount } = renderHook(() =>
      useIdleTimer({ timeout: 1000, onIdle })
    )

    unmount()
    expect(removeEventListenerSpy).toHaveBeenCalled()

    vi.advanceTimersByTime(5000)
    expect(onIdle).not.toHaveBeenCalled()

    removeEventListenerSpy.mockRestore()
  })
})
