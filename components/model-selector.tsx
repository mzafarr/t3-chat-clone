"use client"

import { useState, useEffect } from "react"
import { ChevronDown, Search, Eye, FileText, Brain, Zap, Sparkles, Grid3X3, List } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { getFilteredModels, AIModel } from "@/lib/model-config"

const filterOptions = [
  { id: "fast", label: "Fast", icon: Zap },
  { id: "vision", label: "Vision", icon: Eye },
  { id: "search", label: "Search", icon: Search },
  { id: "pdfs", label: "PDFs", icon: FileText },
  { id: "reasoning", label: "Reasoning", icon: Brain },
  { id: "effort-control", label: "Effort Control", icon: Sparkles },
]

interface ModelSelectorProps {
  selectedModel: string
  onModelSelect: (modelId: string) => void
}

export function ModelSelector({ selectedModel, onModelSelect }: ModelSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedFilters, setSelectedFilters] = useState<string[]>([])
  const [viewMode, setViewMode] = useState<"list" | "grid">("grid")
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  const [availableModels, setAvailableModels] = useState<AIModel[]>([])

  // Update available models when component mounts and when localStorage changes
  useEffect(() => {
    const updateModels = () => {
      setAvailableModels(getFilteredModels())
    }
    
    updateModels()
    
    // Listen for storage changes to update when models are enabled/disabled
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'enabledModels') {
        updateModels()
      }
    }
    
    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])

  // Also update when the dropdown opens to catch any changes
  useEffect(() => {
    if (isOpen) {
      setAvailableModels(getFilteredModels())
    }
  }, [isOpen])

  // Reset modal state when closed
  useEffect(() => {
    if (!showUpgradeModal) {
      // Small delay to ensure modal cleanup
      const timer = setTimeout(() => {
        document.body.style.pointerEvents = ''
      }, 100)
      return () => clearTimeout(timer)
    }
  }, [showUpgradeModal])

  const selectedModelData = availableModels.find((m) => m.id === selectedModel)

  const filteredModels = availableModels.filter((model) => {
    const matchesSearch = model.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesFilters =
      selectedFilters.length === 0 ||
      selectedFilters.some((filter) =>
        model.features?.some((feature) => feature.toLowerCase().includes(filter.toLowerCase())),
      )
    return matchesSearch && matchesFilters
  })

  const favoriteModels = filteredModels.filter((m) => !m.isPro)
  const otherModels = filteredModels.filter((m) => m.isPro)

  const handleModelSelect = (modelId: string) => {
    const model = availableModels.find((m) => m.id === modelId)
    if (model?.isPro) {
      setIsOpen(false) // Close the dropdown first
      setShowUpgradeModal(true)
      return
    }
    onModelSelect(modelId)
    setIsOpen(false)
  }

  const toggleFilter = (filterId: string) => {
    setSelectedFilters((prev) => (prev.includes(filterId) ? prev.filter((f) => f !== filterId) : [...prev, filterId]))
  }

  const renderModelCard = (model: AIModel) => {
    const IconComponent = model.icon
    
    // Provider-specific styling
    const getProviderStyles = (provider: string, isPro?: boolean) => {
      const baseClasses = "w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-lg"
      
      switch (provider) {
        case 'openai':
          return `${baseClasses} ${isPro ? 'bg-gradient-to-br from-gray-900 to-black' : 'bg-gray-800'}`
        case 'anthropic':
          return `${baseClasses} ${isPro ? 'bg-gradient-to-br from-orange-600 to-red-600' : 'bg-orange-500'}`
        case 'google':
          return `${baseClasses} ${isPro ? 'bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-600' : 'bg-gradient-to-br from-blue-500 to-purple-500'}`
        default:
          return `${baseClasses} bg-gray-500`
      }
    }
    
    return (
      <Card
        key={model.id}
        className={`cursor-pointer transition-all duration-200 hover:shadow-md hover:scale-[1.02] border-border/50 ${
          selectedModel === model.id ? "ring-2 ring-blue-500 shadow-lg" : "hover:border-border"
        } ${model.isPro ? "relative" : ""}`}
        onClick={() => handleModelSelect(model.id)}
      >
        <CardContent className="p-4">
          <div className="flex flex-col items-center text-center space-y-3">
            {/* Provider Icon */}
            <div className={getProviderStyles(model.provider, model.isPro)}>
              <IconComponent className="w-6 h-6" />
            </div>
            
            {/* Model Name and Pro Badge */}
            <div className="space-y-1">
              <div className="flex items-center justify-center gap-2">
                <h3 className="font-semibold text-sm leading-tight">{model.name}</h3>
                {model.isPro && (
                  <Badge variant="secondary" className="text-xs px-2 py-0.5 bg-gradient-to-r from-amber-400 to-orange-400 text-white border-0">
                    PRO
                  </Badge>
                )}
              </div>
            </div>
            
            {/* Feature Icons */}
            <div className="flex flex-wrap justify-center gap-1">
              {model.features?.map((feature: string) => (
                <div key={feature} className="w-6 h-6 rounded-md bg-muted/60 flex items-center justify-center transition-colors hover:bg-muted">
                  {feature === "Vision" && <Eye className="w-3 h-3 text-muted-foreground" />}
                  {feature === "Search" && <Search className="w-3 h-3 text-muted-foreground" />}
                  {feature === "PDFs" && <FileText className="w-3 h-3 text-muted-foreground" />}
                  {feature === "Reasoning" && <Brain className="w-3 h-3 text-muted-foreground" />}
                </div>
              ))}
            </div>
            
            {/* Pro Overlay */}
            {model.isPro && (
              <div className="absolute top-2 right-2">
                <div className="w-2 h-2 rounded-full bg-gradient-to-r from-amber-400 to-orange-400"></div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }

  const renderModelList = (model: AIModel) => {
    const IconComponent = model.icon
    
    // Provider-specific styling for list view
    const getProviderStylesList = (provider: string, isPro?: boolean) => {
      const baseClasses = "w-8 h-8 rounded-lg flex items-center justify-center text-white shadow-sm"
      
      switch (provider) {
        case 'openai':
          return `${baseClasses} ${isPro ? 'bg-gradient-to-br from-gray-900 to-black' : 'bg-gray-800'}`
        case 'anthropic':
          return `${baseClasses} ${isPro ? 'bg-gradient-to-br from-orange-600 to-red-600' : 'bg-orange-500'}`
        case 'google':
          return `${baseClasses} ${isPro ? 'bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-600' : 'bg-gradient-to-br from-blue-500 to-purple-500'}`
        default:
          return `${baseClasses} bg-gray-500`
      }
    }
    
    return (
      <div
        key={model.id}
        className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all duration-200 hover:bg-accent/50 hover:shadow-sm relative ${
          selectedModel === model.id ? "bg-blue-50 dark:bg-blue-950/20 ring-1 ring-blue-200 dark:ring-blue-800" : ""
        }`}
        onClick={() => handleModelSelect(model.id)}
      >
        {/* Provider Icon */}
        <div className={getProviderStylesList(model.provider, model.isPro)}>
          <IconComponent className="w-4 h-4" />
        </div>
        
        {/* Model Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-semibold truncate">{model.name}</span>
            {model.isPro && (
              <Badge variant="secondary" className="text-xs px-2 py-0.5 bg-gradient-to-r from-amber-400 to-orange-400 text-white border-0">
                PRO
              </Badge>
            )}
          </div>
        </div>
        
        {/* Feature Icons */}
        <div className="flex gap-1">
          {model.features?.map((feature: string) => (
            <div key={feature} className="w-5 h-5 rounded bg-muted/60 flex items-center justify-center">
              {feature === "Vision" && <Eye className="w-3 h-3 text-muted-foreground" />}
              {feature === "Search" && <Search className="w-3 h-3 text-muted-foreground" />}
              {feature === "PDFs" && <FileText className="w-3 h-3 text-muted-foreground" />}
              {feature === "Reasoning" && <Brain className="w-3 h-3 text-muted-foreground" />}
            </div>
          ))}
        </div>
        
        {/* Pro Indicator */}
        {model.isPro && (
          <div className="absolute top-2 right-2">
            <div className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-amber-400 to-orange-400"></div>
          </div>
        )}
      </div>
    )
  }

  return (
    <>
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="gap-2 text-sm h-10 px-3">
            {selectedModelData && (
              <div className={`w-6 h-6 rounded-md flex items-center justify-center text-white shadow-sm ${
                selectedModelData.provider === 'openai' 
                  ? (selectedModelData.isPro ? 'bg-gradient-to-br from-gray-900 to-black' : 'bg-gray-800')
                  : selectedModelData.provider === 'anthropic'
                  ? (selectedModelData.isPro ? 'bg-gradient-to-br from-orange-600 to-red-600' : 'bg-orange-500')
                  : selectedModelData.provider === 'google'
                  ? (selectedModelData.isPro ? 'bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-600' : 'bg-gradient-to-br from-blue-500 to-purple-500')
                  : 'bg-gray-500'
              }`}>
                <selectedModelData.icon className="w-2 h-2" />
              </div>
            )}
            <span className="font-medium">{selectedModelData?.name || "Select Model"}</span>
            <ChevronDown className="w-4 h-4 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-[600px] p-0 max-h-[80vh] overflow-hidden" align="start">
          <div className="p-4 space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search models..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>

            {/* Upgrade Banner */}
            <Card className="bg-gradient-to-r from-pink-50 to-purple-50 dark:from-pink-950/20 dark:to-purple-950/20 border-pink-200 dark:border-pink-800">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-sm">Unlock all models + higher limits</h3>
                    <p className="text-2xl font-bold text-pink-600">
                      $8<span className="text-sm font-normal">/month</span>
                    </p>
                  </div>
                  <Button size="sm" className="bg-pink-600 hover:bg-pink-700">
                    Upgrade now
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Filters */}
            <div className="flex flex-wrap gap-2">
              {filterOptions.map((filter) => {
                const Icon = filter.icon
                return (
                  <Button
                    key={filter.id}
                    variant={selectedFilters.includes(filter.id) ? "default" : "outline"}
                    size="sm"
                    onClick={() => toggleFilter(filter.id)}
                    className="gap-1 text-xs font-normal"
                  >
                    <Icon className="w-2 h-2" />
                    {filter.label}
                  </Button>
                )
              })}
            </div>

            {/* View Toggle */}
            <div className="flex items-center justify-between">
              <h3 className="font-medium">Favorites</h3>
              <div className="flex gap-1">
                <Button
                  variant={viewMode === "list" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                  className="h-8 w-8 p-0"
                >
                  <List className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === "grid" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                  className="h-8 w-8 p-0"
                >
                  <Grid3X3 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Models */}
          <div className="max-h-[calc(80vh-220px)] overflow-y-scroll px-4 pt-4 pb-28 space-y-4">
            {/* Favorites */}
            {favoriteModels.length > 0 && (
              <div>
                {viewMode === "grid" ? (
                  <div className="grid grid-cols-3 gap-3">{favoriteModels.map(renderModelCard)}</div>
                ) : (
                  <div className="space-y-1">{favoriteModels.map(renderModelList)}</div>
                )}
              </div>
            )}

            {/* Others */}
            {otherModels.length > 0 && (
              <div>
                <h3 className="font-medium mb-2">Others</h3>
                {viewMode === "grid" ? (
                  <div className="grid grid-cols-3 gap-3">{otherModels.map(renderModelCard)}</div>
                ) : (
                  <div className="space-y-1">{otherModels.map(renderModelList)}</div>
                )}
              </div>
            )}
          </div>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Upgrade Modal */}
      <Dialog open={showUpgradeModal} onOpenChange={setShowUpgradeModal}>
        <DialogContent className="sm:max-w-md z-[9999]">
          <DialogHeader>
            <DialogTitle>Upgrade to Pro</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-muted-foreground">Get access to web search and more features with Pro</p>
            <Button 
              className="w-full bg-pink-600 hover:bg-pink-700"
              onClick={() => setShowUpgradeModal(false)}
            >
              Upgrade Now - $8/month
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
