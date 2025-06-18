"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useQuery, useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import { ChatSidebar } from "@/components/chat-sidebar"
import { ChatInterface } from "@/components/chat-interface"
import { ThemeToggle } from "@/components/theme-toggle"
import { Button } from "@/components/ui/button"
import { Settings } from "lucide-react"

interface ChatPageProps {
  params: { conversationId: string }
}

export default function ChatPage({ params }: ChatPageProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [isSidebarMinimized, setIsSidebarMinimized] = useState(false)
  const router = useRouter()
  const activeThreadId = params.conversationId
  
  // Check authentication status
  const user = useQuery(api.auth.loggedInUser)
  const createConversation = useMutation(api.chat.createConversation)
  
  // Redirect to sign-in if not authenticated
  useEffect(() => {
    if (user === null) {
      router.push("/sign-in")
    }
  }, [user, router])
  
  // Show loading while checking auth status
  if (user === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }
  
  // Redirect if not authenticated
  if (user === null) {
    return null
  }

  const handleSendMessage = async (content: string) => {
    // This function is called by ChatInterface for any additional handling
    // The actual message sending is handled by ChatInterface itself
  }

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <ChatSidebar
        activeThreadId={activeThreadId}
        onThreadSelect={(threadId: string) => router.push(`/chat/${threadId}`)}
        isMinimized={isSidebarMinimized}
        onToggleMinimize={setIsSidebarMinimized}
      />

      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border shrink-0">
          <div className="flex items-center gap-2">
            {activeThreadId && <span className="text-sm text-muted-foreground">Active Chat</span>}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" asChild>
              <a href="/">
                <Settings className="w-4 h-4" />
              </a>
            </Button>
            <ThemeToggle />
          </div>
        </div>

        <ChatInterface
          activeThreadId={activeThreadId}
          onSendMessage={handleSendMessage}
          onThreadSelect={(threadId: string) => router.push(`/chat/${threadId}`)}
          isLoading={isLoading}
        />
      </div>
    </div>
  )
}
