"use client"

import { useState, useEffect } from "react"
import { Eye, Search, FileText, Brain, Zap, Link } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { aIModels, getEnabledModels, setEnabledModels } from "@/lib/model-config"

const filterOptions = [
  { id: "fast", label: "Fast", icon: "⚡" },
  { id: "vision", label: "Vision", icon: "👁️" },
  { id: "search", label: "Search", icon: "🔍" },
  { id: "pdfs", label: "PDFs", icon: "📄" },
  { id: "reasoning", label: "Reasoning", icon: "🧠" },
  { id: "effort-control", label: "Effort Control", icon: "⚡" },
]

export function ModelsTab() {
  const [selectedFilters, setSelectedFilters] = useState<string[]>([])
  const [showFilterDropdown, setShowFilterDropdown] = useState(false)
  const [onlyFreePlan, setOnlyFreePlan] = useState(false)
  const [enabledModels, setEnabledModelsState] = useState<string[]>([])

  useEffect(() => {
    setEnabledModelsState(getEnabledModels())
  }, [])

  const handleModelToggle = (modelId: string, enabled: boolean) => {
    const newEnabledModels = enabled 
      ? [...enabledModels, modelId]
      : enabledModels.filter(id => id !== modelId)
    
    setEnabledModelsState(newEnabledModels)
    setEnabledModels(newEnabledModels)
  }

  const handleSelectRecommended = () => {
    // Select only free models as recommended
    const recommendedIds = aIModels.filter(model => !model.isPro).map(model => model.id)
    setEnabledModelsState(recommendedIds)
    setEnabledModels(recommendedIds)
  }

  const handleUnselectAll = () => {
    setEnabledModelsState([])
    setEnabledModels([])
  }

  const filteredModels = aIModels.filter(model => {
    const matchesFilters = selectedFilters.length === 0 || 
      selectedFilters.some(filter => 
        model.features?.some(feature => 
          feature.toLowerCase().includes(filter.toLowerCase())
        )
      )
    
    const matchesFreePlan = !onlyFreePlan || !model.isPro
    
    return matchesFilters && matchesFreePlan
  })

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-2">Available Models</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Choose which models appear in your model selector. This won&apos;t affect existing conversations.
        </p>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <DropdownMenu open={showFilterDropdown} onOpenChange={setShowFilterDropdown}>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2">
                Filter by features
                {selectedFilters.length > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    {selectedFilters.length}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-48">
              {filterOptions.map((option) => (
                <DropdownMenuCheckboxItem
                  key={option.id}
                  checked={selectedFilters.includes(option.id)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setSelectedFilters([...selectedFilters, option.id])
                    } else {
                      setSelectedFilters(selectedFilters.filter((f) => f !== option.id))
                    }
                  }}
                >
                  <span className="mr-2">{option.icon}</span>
                  {option.label}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {selectedFilters.length > 0 && (
            <Button variant="ghost" size="sm" onClick={() => setSelectedFilters([])}>
              Clear
            </Button>
          )}
        </div>

        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleSelectRecommended}>
            Select Recommended Models
          </Button>
          <Button variant="outline" size="sm" onClick={handleUnselectAll}>
            Unselect All
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        {filteredModels.map((model) => {
          const IconComponent = model.icon
          return (
            <Card key={model.id} className="p-4">
              <div className="flex items-start gap-4">
                <div className="flex items-center gap-3 flex-1">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-lg ${
                    model.provider === 'openai'
                      ? (model.isPro ? 'bg-gradient-to-br from-gray-900 to-black' : 'bg-gray-800')
                      : model.provider === 'anthropic'
                      ? (model.isPro ? 'bg-gradient-to-br from-orange-600 to-red-600' : 'bg-orange-500')
                      : model.provider === 'google'
                      ? (model.isPro ? 'bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-600' : 'bg-gradient-to-br from-blue-500 to-purple-500')
                      : 'bg-gray-500'
                  }`}>
                    <IconComponent className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium text-gray-900 dark:text-gray-100">{model.name}</h3>
                      {model.isPro && (
                        <Badge variant="secondary" className="text-xs px-2 py-0.5 bg-gradient-to-r from-amber-400 to-orange-400 text-white border-0">
                          PRO
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      {model.provider === 'openai' && model.name.includes('Mini') && "OpenAI's efficient model for everyday tasks."}
                      {model.provider === 'openai' && model.name.includes('GPT-4o') && !model.name.includes('Mini') && "OpenAI's flagship model, known for intelligence and accuracy."}
                      {model.provider === 'anthropic' && model.name.includes('Haiku') && "Anthropic's fast and lightweight model."}
                      {model.provider === 'anthropic' && model.name.includes('Sonnet') && "Anthropic's most capable model for complex reasoning."}
                      {model.provider === 'google' && model.name.includes('Flash') && "Google's fast model, known for speed and multimodal capabilities."}
                    </p>
                    <div className="flex gap-2">
                      {model.features?.map((feature) => (
                        <Badge key={feature} variant="secondary" className="text-xs">
                          {feature === "Vision" && <Eye className="w-3 h-3 mr-1" />}
                          {feature === "Search" && <Search className="w-3 h-3 mr-1" />}
                          {feature === "PDFs" && <FileText className="w-3 h-3 mr-1" />}
                          {feature === "Reasoning" && <Brain className="w-3 h-3 mr-1" />}
                          {feature}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Switch 
                    checked={enabledModels.includes(model.id)} 
                    onCheckedChange={(enabled) => handleModelToggle(model.id, enabled)}
                  />
                </div>
              </div>
            </Card>
          )
        })}
      </div>

      <div className="flex items-center gap-2 pt-4">
        <Switch checked={onlyFreePlan} onCheckedChange={setOnlyFreePlan} />
        <Label>Only show free plan models</Label>
      </div>
    </div>
  )
} 