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

  it("resets both timers once the activity debounce settles", () => {
    const onIdleWarning = vi.fn()
    const onIdle = vi.fn()
    renderHook(() =>
      useIdleTimer({
        warningTimeout: 2000,
        logoutTimeout: 3000,
        onIdleWarning,
        onIdle,
      })
    )

    vi.advanceTimersByTime(500)
    window.dispatchEvent(new Event("mousemove"))
    // The reset only takes effect once the 300ms debounce settles (t=800),
    // well before the original t=2000 deadline, so there's no ambiguity
    // about which timer "wins".
    vi.advanceTimersByTime(300)

    // From the reset point (t=800), the warning should fire at t=2800.
    vi.advanceTimersByTime(1999)
    expect(onIdleWarning).not.toHaveBeenCalled()

    vi.advanceTimersByTime(1)
    expect(onIdleWarning).toHaveBeenCalledTimes(1)
  })

  it("resets both timers when the API activity event fires", () => {
    const onIdleWarning = vi.fn()
    const onIdle = vi.fn()
    renderHook(() =>
      useIdleTimer({
        warningTimeout: 2000,
        logoutTimeout: 3000,
        onIdleWarning,
        onIdle,
      })
    )

    vi.advanceTimersByTime(500)
    window.dispatchEvent(new Event(USER_ACTIVITY_EVENT))
    vi.advanceTimersByTime(300)

    vi.advanceTimersByTime(1999)
    expect(onIdleWarning).not.toHaveBeenCalled()

    vi.advanceTimersByTime(1)
    expect(onIdleWarning).toHaveBeenCalledTimes(1)
  })

  it("calls onActivity immediately, without waiting for the debounce", () => {
    const onActivity = vi.fn()
    renderHook(() =>
      useIdleTimer({
        warningTimeout: 1000,
        logoutTimeout: 1500,
        onIdleWarning: vi.fn(),
        onIdle: vi.fn(),
        onActivity,
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

