  "use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useQuery, useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"

export default function ChatPage() {
  const router = useRouter()
  
  // Check authentication status
  const user = useQuery(api.auth.loggedInUser)
  const conversations = useQuery(api.chat.listConversations)
  const createConversation = useMutation(api.chat.createConversation)
  
  // Redirect to sign-in if not authenticated
  useEffect(() => {
    if (user === null) {
      router.push("/sign-in")
    }
  }, [user, router])

  // Handle routing logic once data is loaded
  useEffect(() => {
    if (user && conversations !== undefined) {
      if (conversations.length > 0) {
        // Redirect to the first available conversation
        router.push(`/chat/${conversations[0]._id}`)
      } else {
        // No conversations exist, create a new one
        createConversation({}).then((newConversationId) => {
          router.push(`/chat/${newConversationId}`)
        })
      }
    }
  }, [user, conversations, router, createConversation])
  
  // Show loading while checking auth status and conversations
  if (user === undefined || conversations === undefined) {
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

  // Show loading while redirecting
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        <p className="mt-2 text-muted-foreground">Setting up your chat...</p>
      </div>
    </div>
  )
} 