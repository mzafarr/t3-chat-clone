"use client"

import { useState, useEffect } from "react"
import { useQuery } from "convex/react"
import { useRouter } from "next/navigation"
import { api } from "../convex/_generated/api"
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DashboardTabs } from "@/components/dashboard/dashboard-tabs"
import { ModelsTab } from "@/components/dashboard/tabs/models-tab"
import { AccountTab } from "@/components/dashboard/tabs/account-tab"
import { ContactTab } from "@/components/dashboard/tabs/contact-tab"
import { 
  CustomizationTab, 
  HistoryTab, 
  ApiKeysTab, 
  AttachmentsTab 
} from "@/components/dashboard/tabs/other-tabs"
import { CustomPromptInput } from "@/components/custom-prompt-input"

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState("models")
  const [selectedModel, setSelectedModel] = useState("gemini-2.5-flash")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  
  // Check authentication status
  const user = useQuery(api.auth.loggedInUser)

  useEffect(() => {
    // If the query has finished loading and there's no user, redirect to sign-in
    if (user === null) {
      router.push("/sign-in")
    }
  }, [user, router])

  // Show loading while checking authentication
  if (user === undefined) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  // If user is null, we're redirecting to sign-in (handled in useEffect)
  if (user === null) {
    return null
  }

  const handleSendMessage = (message: string, files?: File[]) => {
    setIsLoading(true)
    console.log("Sending message:", message, "with files:", files)
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false)
    }, 2000)
  }

  const renderContent = () => {
    switch (activeTab) {
      case "models":
        return <ModelsTab />
      case "customization":
        return <CustomizationTab />
      case "history":
        return <HistoryTab />
      case "account":
        return <AccountTab />
      case "contact":
        return <ContactTab />
      case "attachments":
        return <AttachmentsTab />
      case "api-keys":
        return <ApiKeysTab />
      default:
        return <ModelsTab />
    }
  }

  return (
    <div className="flex h-screen bg-white dark:bg-gray-900">
      <DashboardSidebar />
      <div className="flex-1 flex flex-col">
        <DashboardHeader />
        <DashboardTabs activeTab={activeTab} onTabChange={setActiveTab} />
        <div className="flex-1 overflow-auto bg-white dark:bg-gray-900">
          {renderContent()}
        </div>
        
        {/* Demo of the custom prompt input */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-800">
          <div className="max-w-4xl mx-auto">
            <CustomPromptInput
              onSend={handleSendMessage}
              isLoading={isLoading}
              placeholder="Try the new custom prompt input..."
              selectedModel={selectedModel}
              onModelSelect={setSelectedModel}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
