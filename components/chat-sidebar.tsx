"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Search, Pin, MoreHorizontal, Plus, Edit3, Trash2, Download, Settings, LogOut } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import { useQuery, useMutation } from "convex/react"
import { api } from "../convex/_generated/api"

interface ChatSidebarProps {
  activeThreadId?: string
  onThreadSelect: (threadId: string) => void
}

export function ChatSidebar({ activeThreadId, onThreadSelect }: ChatSidebarProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const router = useRouter()

  // Convex hooks for fetching conversations and user data
  const conversations = useQuery(api.chat.listConversations)
  const user = useQuery(api.auth.loggedInUser)
  const createConversation = useMutation(api.chat.createConversation)
  const deleteConversation = useMutation(api.chat.deleteConversation)

  // Handle loading state
  if (conversations === undefined || user === undefined) {
    return (
      <div className="w-64 h-full bg-background border-r border-border flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-border shrink-0">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-lg font-semibold">T3.chat</h1>
          </div>

          <Button className="w-full mb-4 bg-primary hover:bg-primary/90 text-primary-foreground">
            <Plus className="w-4 h-4 mr-2" />
            New Chat
          </Button>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search your threads..."
              className="pl-9"
            />
          </div>
        </div>

        {/* Loading skeleton */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </div>

        {/* User Profile */}
        <div className="p-4 border-t border-border shrink-0">
          <div className="flex items-center gap-3 p-2">
            <Avatar className="w-8 h-8">
              <AvatarFallback className="bg-slate-600 text-white text-sm">
                <Skeleton className="h-4 w-4" />
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <Skeleton className="h-4 w-24 mb-1" />
              <Skeleton className="h-3 w-12" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Transform conversations to match the Thread interface expected by existing components
  const threads = conversations.map((conv: any) => ({
    id: conv._id,
    title: conv.name,
    isPinned: false, // Not implemented yet in the schema
    timestamp: new Date(conv._creationTime).toLocaleDateString()
  }))

  const filteredThreads = threads.filter((thread) => thread.title.toLowerCase().includes(searchQuery.toLowerCase()))

  const pinnedThreads = filteredThreads.filter((thread) => thread.isPinned)
  const unpinnedThreads = filteredThreads.filter((thread) => !thread.isPinned)

  const handleNewChat = async () => {
    try {
      const conversationId = await createConversation({})
      router.push(`/chat/${conversationId}`)
    } catch (error) {
      console.error("Failed to create new chat:", error)
    }
  }

  const handleDeleteThread = async (threadId: string) => {
    try {
      await deleteConversation({ conversationId: threadId as any })
    } catch (error) {
      console.error("Failed to delete conversation:", error)
    }
  }

  const handleThreadAction = (threadId: string, action: "pin" | "rename" | "delete" | "export") => {
    switch (action) {
      case "pin":
        // TODO: Implement pinning when schema supports it
        console.log("Pin thread:", threadId)
        break
      case "delete":
        handleDeleteThread(threadId)
        break
      case "rename":
        // TODO: Implement rename functionality
        console.log("Rename thread:", threadId)
        break
      case "export":
        // TODO: Implement export functionality
        console.log("Export thread:", threadId)
        break
    }
  }

  const ThreadItem = ({ thread }: { thread: typeof threads[0] }) => (
    <div
      className={cn(
        "group flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-colors hover:bg-accent",
        activeThreadId === thread.id && "bg-accent",
      )}
      onClick={() => onThreadSelect(thread.id)}
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm truncate">{thread.title}</span>
          {thread.isPinned && <Pin className="w-3 h-3 text-muted-foreground" />}
        </div>
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 h-6 w-6 p-0">
            <MoreHorizontal className="w-3 h-3" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => handleThreadAction(thread.id, "pin")}>
            <Pin className="w-4 h-4 mr-2" />
            {thread.isPinned ? "Unpin" : "Pin"}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleThreadAction(thread.id, "rename")}>
            <Edit3 className="w-4 h-4 mr-2" />
            Rename
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleThreadAction(thread.id, "delete")}>
            <Trash2 className="w-4 h-4 mr-2" />
            Delete
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleThreadAction(thread.id, "export")}>
            <Download className="w-4 h-4 mr-2" />
            Export{" "}
            <Badge variant="secondary" className="ml-1 text-xs">
              BETA
            </Badge>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )

  return (
    <div className="w-64 h-full bg-background border-r border-border flex flex-col overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-border shrink-0">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-lg font-semibold">T3.chat</h1>
        </div>

        <Button onClick={handleNewChat} className="w-full mb-4 bg-primary hover:bg-primary/90 text-primary-foreground">
          <Plus className="w-4 h-4 mr-2" />
          New Chat
        </Button>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search your threads..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Threads */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Pinned */}
        {pinnedThreads.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Pin className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium text-muted-foreground">Pinned</span>
            </div>
            <div className="space-y-1">
              {pinnedThreads.map((thread) => (
                <ThreadItem key={thread.id} thread={thread} />
              ))}
            </div>
          </div>
        )}

        {/* Recent */}
        {unpinnedThreads.length > 0 && (
          <div>
            <div className="mb-2">
              <span className="text-sm font-medium text-muted-foreground">Today</span>
            </div>
            <div className="space-y-1">
              {unpinnedThreads.map((thread) => (
                <ThreadItem key={thread.id} thread={thread} />
              ))}
            </div>
          </div>
        )}

        {filteredThreads.length === 0 && (
          <div className="text-center text-muted-foreground py-8">
            <p className="text-sm">No threads found</p>
          </div>
        )}
      </div>

      {/* User Profile */}
      <div className="p-4 border-t border-border shrink-0">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div className="flex items-center gap-3 cursor-pointer hover:bg-accent p-2 rounded-lg transition-colors">
              <Avatar className="w-8 h-8">
                <AvatarFallback className="bg-slate-600 text-white text-sm">
                  {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{user?.name || 'Guest User'}</p>
                <p className="text-xs text-muted-foreground">Free</p>
              </div>
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem asChild>
              <a href="/" className="flex items-center">
                <Settings className="w-4 h-4 mr-2" />
                Dashboard
              </a>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}
