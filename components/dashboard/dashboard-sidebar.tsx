import { useQuery } from "convex/react"
import { api } from "../../convex/_generated/api"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

export function DashboardSidebar() {
  const user = useQuery(api.auth.loggedInUser)

  return (
    <div className="w-80 bg-gray-50 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 p-6 flex flex-col">
      <div className="flex items-center gap-4 mb-6">
        <Avatar className="w-20 h-20">
          <AvatarFallback className="bg-slate-600 text-white text-2xl font-bold">M</AvatarFallback>
        </Avatar>
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            {user?.name || "Guest"}
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            {user ? "Signed in" : "Not signed in"}
          </p>
          <Badge variant="outline" className="mt-1 bg-primary/10 text-primary border-primary/20">
            Free Plan
          </Badge>
        </div>
      </div>

      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600 dark:text-gray-400">Message Usage</span>
                <span className="text-gray-900 dark:text-gray-100">Resets tomorrow at 5:00 AM</span>
              </div>
              <div className="flex justify-between text-sm mb-2">
                <span className="font-medium">Standard</span>
                <span className="text-gray-600 dark:text-gray-400">0/20</span>
              </div>
              <Progress value={0} className="h-2" />
              <p className="text-sm text-primary mt-1">20 messages remaining</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <h3 className="font-medium text-gray-900 dark:text-gray-100">Keyboard Shortcuts</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">Search</span>
            <div className="flex gap-1">
              <kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-xs">⌘</kbd>
              <kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-xs">K</kbd>
            </div>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">New Chat</span>
            <div className="flex gap-1">
              <kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-xs">⌘</kbd>
              <kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-xs">Shift</kbd>
              <kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-xs">O</kbd>
            </div>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">Toggle Sidebar</span>
            <div className="flex gap-1">
              <kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-xs">⌘</kbd>
              <kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-xs">B</kbd>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 