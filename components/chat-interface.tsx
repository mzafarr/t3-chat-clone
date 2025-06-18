"use client"
import { useState, useEffect, useRef } from "react"
import { RotateCcw, Edit3, Copy, ChevronUp, ChevronDown, Check } from "lucide-react"
import ReactMarkdown from "react-markdown"
import { Button } from "@/components/ui/button"
import { CustomPromptInput } from "./custom-prompt-input"
import { CodeBlock } from "./code-block"
import { cn } from "@/lib/utils"
import { useTheme } from "@/lib/theme-context"
import { useQuery } from "convex/react"
import { api } from "../convex/_generated/api"
import { useChat } from "@ai-sdk/react"
import { useAuthToken } from "@convex-dev/auth/react"
import { toast } from "@/components/ui/use-toast"

interface ChatInterfaceProps {
  activeThreadId?: string
  onSendMessage: (
    content: string,
    files?: File[],
    options?: { search?: boolean; think?: boolean; canvas?: boolean },
  ) => void
  onThreadSelect?: (threadId: string) => void
  isLoading?: boolean
}

export function ChatInterface({ activeThreadId, onSendMessage, onThreadSelect, isLoading }: ChatInterfaceProps) {
  const [selectedModel, setSelectedModel] = useState("gpt-4o-mini")
  const { colorTheme } = useTheme()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)
  const [showScrollButtons, setShowScrollButtons] = useState(false)
  const [isAtBottom, setIsAtBottom] = useState(true)
  const [copiedMessages, setCopiedMessages] = useState<Set<string>>(new Set())

  // Fetch user data for personalized greeting
  const user = useQuery(api.auth.loggedInUser)

  // Fetch initial messages for the conversation once
  const initialMessages = useQuery(
    api.chat.listMessages, 
    activeThreadId ? { conversationId: activeThreadId as any } : "skip"
  )

  // Initialize the useChat hook with debug logging
  const chatApiUrl = `${process.env.NEXT_PUBLIC_CONVEX_SITE_URL}/chat`
  console.log("🔗 Chat API URL:", chatApiUrl)
  console.log("🆔 Active Thread ID:", activeThreadId)
  console.log("📨 Initial Messages:", initialMessages)

  const token = useAuthToken();
  
  const { messages, input, handleInputChange, handleSubmit, setMessages, append, error, status } = useChat({
    api: chatApiUrl,
    headers: {
      Authorization: `Bearer ${token}`,
    },
    id: activeThreadId,
    body: {
      modelId: selectedModel // Pass the ID of the currently selected model
    },
    initialMessages: initialMessages?.map(msg => ({
      id: msg._id,
      role: msg.author === "user" ? "user" as const : "assistant" as const,
      content: msg.text || ""
    })) || [],
    onError: (error) => {
      console.error("❌ useChat Error:", error)
    },
    onResponse: (response) => {
      console.log("📥 useChat Response:", response)
    },
    onFinish: (message) => {
      console.log("✅ useChat Finished:", message)
    }
  })

  console.log("💬 Current Messages:", messages)
  console.log("📋 Chat Status:", status)
  console.log("⚠️ Chat Error:", error)

  // Update messages when initial messages load
  useEffect(() => {
    if (initialMessages && initialMessages.length > 0) {
      const formattedMessages = initialMessages.map(msg => ({
        id: msg._id,
        role: msg.author === "user" ? "user" as const : "assistant" as const,
        content: msg.text || ""
      }))
      console.log("🔄 Setting initial messages:", formattedMessages)
      setMessages(formattedMessages)
    }
  }, [initialMessages, setMessages])

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Auto-scroll when switching between conversations
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [activeThreadId])

  // Scroll detection
  useEffect(() => {
    const container = messagesContainerRef.current
    if (!container) return

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 100
      setIsAtBottom(isNearBottom)
      setShowScrollButtons(scrollHeight > clientHeight + 200) // Show buttons if content is taller
    }

    container.addEventListener('scroll', handleScroll)
    handleScroll() // Initial check

    return () => container.removeEventListener('scroll', handleScroll)
  }, [messages])

  const scrollToTop = () => {
    messagesContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  // Helper function to handle suggested questions
  const handleSuggestedQuestion = async (question: string) => {
    console.log("🤔 Sending suggested question:", question)
    try {
      await append({
        role: "user",
        content: question
      })
    } catch (error) {
      console.error("❌ Error sending suggested question:", error)
    }
  }

  // Copy functionality
  const handleCopy = async (text: string, messageId: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedMessages(prev => new Set(prev).add(messageId))
      setTimeout(() => {
        setCopiedMessages(prev => {
          const newSet = new Set(prev)
          newSet.delete(messageId)
          return newSet
        })
      }, 2000)
      toast({
        title: "Copied to clipboard",
        duration: 2000,
      })
    } catch (error) {
      console.error("Failed to copy text:", error)
      toast({
        title: "Failed to copy",
        variant: "destructive",
        duration: 2000,
      })
    }
  }

  const suggestedQuestions = [
    "How does AI work?",
    "Are black holes real?",
    'How many Rs are in the word "strawberry"?',
    "What is the meaning of life?",
  ]

  const actionButtons = [
    { icon: "✨", label: "Create", color: "bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-300" },
    { icon: "📚", label: "Explore", color: "bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300" },
    { icon: "💻", label: "Code", color: "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-300" },
    { icon: "🎓", label: "Learn", color: "bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-300" },
  ]

  const hasGradientBackground = ["sunset", "ocean", "forest", "galaxy", "aurora"].includes(colorTheme)

  return (
    <div className={cn("flex-1 flex flex-col h-full overflow-hidden", hasGradientBackground && "relative")}>
      {hasGradientBackground && (
        <div
          className="absolute inset-0 opacity-20"
          style={{
            background:
              colorTheme === "sunset"
                ? "linear-gradient(135deg, #ff7e5f 0%, #feb47b 100%)"
                : colorTheme === "ocean"
                  ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                  : colorTheme === "forest"
                    ? "linear-gradient(135deg, #134e5e 0%, #71b280 100%)"
                    : colorTheme === "galaxy"
                      ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                      : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          }}
        />
      )}

      {/* Messages */}
      <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-6 relative z-10">
        {!activeThreadId ? (
          <div className="max-w-2xl mx-auto text-center space-y-8">
            <div className="space-y-4">
              <h1 className={cn("text-3xl font-semibold", hasGradientBackground ? "text-white drop-shadow-lg" : "")}>
                How can I help you{user?.name ? `, ${user.name.split(' ')[0]}` : ''}?
              </h1>

              <div className="flex flex-wrap justify-center gap-2">
                {actionButtons.map((button, index) => (
                  <Button key={index} variant="outline" className={cn("gap-2", button.color)}>
                    <span>{button.icon}</span>
                    {button.label}
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              {suggestedQuestions.map((question, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestedQuestion(question)}
                  className={cn(
                    "block w-full text-left p-3 rounded-lg hover:bg-accent transition-colors",
                    hasGradientBackground
                      ? "text-white/90 hover:text-white hover:bg-white/10 backdrop-blur-sm"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {question}
                </button>
              ))}
            </div>
          </div>
        ) : initialMessages === undefined ? (
          <div className="max-w-2xl mx-auto text-center space-y-4">
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-muted rounded-lg"></div>
              <div className="h-16 bg-muted rounded-lg"></div>
              <div className="h-12 bg-muted rounded-lg"></div>
            </div>
          </div>
        ) : messages.length === 0 ? (
          <div className="max-w-2xl mx-auto text-center space-y-8">
            <div className="space-y-4">
              <h1 className={cn("text-3xl font-semibold", hasGradientBackground ? "text-white drop-shadow-lg" : "")}>
                How can I help you{user?.name ? `, ${user.name.split(' ')[0]}` : ''}?
              </h1>

              <div className="flex flex-wrap justify-center gap-2">
                {actionButtons.map((button, index) => (
                  <Button key={index} variant="outline" className={cn("gap-2", button.color)}>
                    <span>{button.icon}</span>
                    {button.label}
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              {suggestedQuestions.map((question, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestedQuestion(question)}
                  className={cn(
                    "block w-full text-left p-3 rounded-lg hover:bg-accent transition-colors",
                    hasGradientBackground
                      ? "text-white/90 hover:text-white hover:bg-white/10 backdrop-blur-sm"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {question}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto space-y-6">
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn("group flex gap-4", message.role === "user" ? "justify-end" : "justify-start")}
              >
                <div className={cn("max-w-3xl space-y-2", message.role === "user" ? "text-right" : "text-left")}>
                  <div
                    className={cn(
                      "inline-block p-4 py-2.5 rounded-lg",
                      message.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : hasGradientBackground
                          ? "bg-white/10 backdrop-blur-sm text-white border border-white/20"
                          : "bg-muted",
                    )}
                  >
                    {message.role === "assistant" ? (
                      <ReactMarkdown
                        components={{
                          code: ({ inline, className, children, ...props }: any) => (
                            <CodeBlock
                              className={className}
                              inline={inline}
                              {...props}
                            >
                              {String(children).replace(/\n$/, "")}
                            </CodeBlock>
                          ),
                        }}
                      >
                        {message.content}
                      </ReactMarkdown>
                    ) : (
                      <p className="whitespace-pre-wrap">{message.content}</p>
                    )}
                  </div>

                  {message.role === "assistant" && (
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="sm">
                        <RotateCcw className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleCopy(message.content, message.id)}>
                        {copiedMessages.has(message.id) ? (
                          <Check className="w-4 h-4 text-green-500" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  )}

                  {message.role === "user" && (
                    <div className="flex gap-2 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="sm">
                        <Edit3 className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleCopy(message.content, message.id)}>
                        {copiedMessages.has(message.id) ? (
                          <Check className="w-4 h-4 text-green-500" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ))}
            {/* Auto-scroll target */}
            <div ref={messagesEndRef} />
          </div>
        )}

        {/* Scroll Buttons */}
        {showScrollButtons && (
          <div className="fixed right-6 bottom-24 flex flex-col gap-2 z-20">
            <Button
              variant="outline"
              size="icon"
              onClick={scrollToTop}
              className="h-10 w-10 rounded-full bg-background/80 backdrop-blur-sm shadow-lg border-border/50 hover:bg-background"
            >
              <ChevronUp className="h-4 w-4" />
            </Button>
            {!isAtBottom && (
              <Button
                variant="outline"
                size="icon"
                onClick={scrollToBottom}
                className="h-10 w-10 rounded-full bg-background/80 backdrop-blur-sm shadow-lg border-border/50 hover:bg-background"
              >
                <ChevronDown className="h-4 w-4" />
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Input */}
      <div className="border-t border-border p-4 relative z-10 shrink-0">
        <div className="max-w-4xl mx-auto">
          <div className="space-y-4">
            <CustomPromptInput
              input={input}
              handleInputChange={handleInputChange}
              handleSubmit={handleSubmit}
              isLoading={isLoading}
              placeholder="Type your message here..."
              selectedModel={selectedModel}
              onModelSelect={setSelectedModel}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
