import { useState } from "react"
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

const models = [
  {
    id: "gemini-2-flash",
    name: "Gemini 2.0 Flash",
    description: "Google's flagship model, known for speed and accuracy (and also web search).",
    features: ["Vision", "PDFs", "Search"],
    enabled: true,
    icon: "⚡",
  },
  {
    id: "gemini-2-flash-lite",
    name: "Gemini 2.0 Flash Lite",
    description: "Similar to 2.0 Flash, but even faster.",
    features: ["Fast", "Vision", "PDFs"],
    enabled: true,
    icon: "⚡",
  },
  {
    id: "gemini-2.5-flash",
    name: "Gemini 2.5 Flash",
    description: "Google's latest fast model, known for speed and accuracy (and also web search).",
    features: ["Vision", "PDFs", "Search"],
    enabled: true,
    icon: "⚡",
  },
  {
    id: "gemini-2.5-flash-thinking",
    name: "Gemini 2.5 Flash (Thinking)",
    description: "Google's latest fast model, but now it can think!",
    features: ["Vision", "PDFs", "Search", "Effort Control"],
    enabled: true,
    icon: "⚡",
  },
]

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
          <Button variant="outline" size="sm">
            Select Recommended Models
          </Button>
          <Button variant="outline" size="sm">
            Unselect All
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        {models.map((model) => (
          <Card key={model.id} className="p-4">
            <div className="flex items-start gap-4">
              <div className="flex items-center gap-3 flex-1">
                <span className="text-2xl">{model.icon}</span>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-medium text-gray-900 dark:text-gray-100">{model.name}</h3>
                    {model.name.includes("Lite") && (
                      <Badge variant="outline" className="text-xs">
                        ⚡
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{model.description}</p>
                  <div className="flex gap-2">
                    {model.features.map((feature) => (
                      <Badge key={feature} variant="secondary" className="text-xs">
                        {feature === "Vision" && <Eye className="w-3 h-3 mr-1" />}
                        {feature === "Search" && <Search className="w-3 h-3 mr-1" />}
                        {feature === "PDFs" && <FileText className="w-3 h-3 mr-1" />}
                        {feature === "Fast" && <Zap className="w-3 h-3 mr-1" />}
                        {feature === "Effort Control" && <Brain className="w-3 h-3 mr-1" />}
                        {feature}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Button variant="ghost" size="sm">
                  <Link className="w-4 h-4 mr-2" />
                  Search URL
                </Button>
                <Switch checked={model.enabled} />
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="flex items-center gap-2 pt-4">
        <Switch checked={onlyFreePlan} onCheckedChange={setOnlyFreePlan} />
        <Label>Only show free plan models</Label>
      </div>
    </div>
  )
} 