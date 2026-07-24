import { ThemeProvider } from "@/components/theme-provider"
import { ModeToggle } from "@/components/mode-toggle"

function App() {

  return (
    <ThemeProvider>
      <div className="flex min-h-svh p-6">
        <div className="flex max-w-md min-w-0 flex-col gap-4 text-sm leading-loose">
          <ModeToggle />
        </div>
      </div>
    </ThemeProvider>
  )
}

export default App
