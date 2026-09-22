import { describe, expect, it, vi, beforeEach } from "vitest"
import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { MemoryRouter } from "react-router-dom"

import { AppSidebar } from "@/components/app-sidebar"
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"

function setViewport(width: number) {
  Object.defineProperty(window, "innerWidth", {
    writable: true,
    configurable: true,
    value: width,
  })
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches: width < 768,
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }))
}

function renderSidebar(onNavigate = vi.fn()) {
  render(
    <MemoryRouter>
      <SidebarProvider>
        <SidebarTrigger />
        <AppSidebar onNavigate={onNavigate} />
      </SidebarProvider>
    </MemoryRouter>
  )
  return onNavigate
}

describe("AppSidebar", () => {
  beforeEach(() => {
    setViewport(375)
  })

  it("closes the mobile overlay after tapping a nav link", async () => {
    const user = userEvent.setup()
    const onNavigate = renderSidebar()

    await user.click(screen.getByRole("button", { name: "Toggle Sidebar" }))
    expect(await screen.findByRole("dialog")).toBeInTheDocument()

    await user.click(screen.getByRole("link", { name: /patrimonio/i }))

    expect(onNavigate).toHaveBeenCalledWith("/patrimonio")
    await waitFor(() =>
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
    )
  })

  it("keeps the desktop sidebar unaffected after navigating", async () => {
    setViewport(1280)
    const user = userEvent.setup()
    const onNavigate = renderSidebar()

    await user.click(screen.getByRole("link", { name: /patrimonio/i }))

    expect(onNavigate).toHaveBeenCalledWith("/patrimonio")
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
  })
})
