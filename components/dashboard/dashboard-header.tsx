import { ArrowLeft, RotateCcw, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"

export function DashboardHeader() {
  return (
    <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" className="text-gray-600 dark:text-gray-400" asChild>
          <a href="/chat">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Chat
          </a>
        </Button>
      </div>
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" className="text-gray-600 dark:text-gray-400">
          <RotateCcw className="w-4 h-4" />
        </Button>
        <Button variant="ghost" size="sm" className="text-gray-600 dark:text-gray-400">
          <LogOut className="w-4 h-4 mr-2" />
          Sign out
        </Button>
      </div>
    </div>
  )
} 