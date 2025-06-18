"use client"

import { Moon, Sun, Monitor, Palette } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useTheme } from "@/lib/theme-context"

export function ThemeToggle() {
  const { theme, colorTheme, setTheme, setColorTheme } = useTheme()

  const colorThemes = [
    { id: "default", name: "Default (Pink)", color: "bg-pink-500" },
    { id: "blue", name: "Blue", color: "bg-blue-500" },
    { id: "green", name: "Green", color: "bg-green-500" },
    { id: "orange", name: "Orange", color: "bg-orange-500" },
    { id: "red", name: "Red", color: "bg-red-500" },
    { id: "sunset", name: "Sunset", color: "bg-gradient-to-r from-orange-400 to-pink-400" },
    { id: "ocean", name: "Ocean", color: "bg-gradient-to-r from-blue-400 to-cyan-400" },
    { id: "forest", name: "Forest", color: "bg-gradient-to-r from-green-400 to-emerald-400" },
    { id: "galaxy", name: "Galaxy", color: "bg-gradient-to-r from-purple-400 to-indigo-400" },
    { id: "aurora", name: "Aurora", color: "bg-gradient-to-r from-green-400 to-blue-400" },
  ]

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuItem onClick={() => setTheme("light")}>
          <Sun className="mr-2 h-4 w-4" />
          Light
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")}>
          <Moon className="mr-2 h-4 w-4" />
          Dark
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("system")}>
          <Monitor className="mr-2 h-4 w-4" />
          System
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <div className="px-2 py-1.5 text-sm font-semibold flex items-center">
          <Palette className="mr-2 h-4 w-4" />
          Color Themes
        </div>
        {colorThemes.map((colorThemeOption) => (
          <DropdownMenuItem key={colorThemeOption.id} onClick={() => setColorTheme(colorThemeOption.id as any)}>
            <div className={`mr-2 h-4 w-4 rounded-full ${colorThemeOption.color}`} />
            {colorThemeOption.name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
