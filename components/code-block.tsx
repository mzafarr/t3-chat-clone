"use client"

import { useState } from "react"
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter"
import { atomDark, prism } from "react-syntax-highlighter/dist/esm/styles/prism"
import { Check, Copy } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useTheme } from "next-themes"

interface CodeBlockProps {
  children: string
  className?: string
  inline?: boolean
  [key: string]: any
}

export function CodeBlock({ children, className, inline }: CodeBlockProps) {
  const [copied, setCopied] = useState(false)
  const { theme } = useTheme()
  
  // Extract language from className (format: "language-javascript")
  const language = className?.replace(/language-/, "") || "text"
  
  // For inline code blocks
  if (inline) {
    return (
      <code className="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm">
        {children}
      </code>
    )
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(children)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("Failed to copy text: ", err)
    }
  }

  return (
    <div className="relative group">
      <div className="absolute right-2 top-2 z-10">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleCopy}
          className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity bg-background/90 hover:bg-background/95 border border-border/50 shadow-sm"
        >
          {copied ? (
            <Check className="h-4 w-4 text-green-500" />
          ) : (
            <Copy className="h-4 w-4" />
          )}
        </Button>
      </div>
      
      <SyntaxHighlighter
        language={language}
        style={theme === "dark" ? atomDark : prism}
        customStyle={{
          margin: 0,
          borderRadius: "0.5rem",
          fontSize: "0.875rem",
          background: theme === "dark" ? "#1e1e1e" : "#f8f8f8",
          border: theme === "dark" ? "1px solid #333" : "1px solid #e5e7eb",
        }}
        codeTagProps={{
          style: {
            fontSize: "0.875rem",
            fontFamily: "ui-monospace, SFMono-Regular, Consolas, 'Liberation Mono', Menlo, monospace",
            background: "transparent",
          }
        }}
      >
        {children}
      </SyntaxHighlighter>
    </div>
  )
} 