"use client"

import {
  Bot,
  Shield,
  GitBranch,
  Plug,
  UserCheck,
  FileSearch,
  Play,
  Square,
  ChevronLeft,
  ChevronRight,
  Search,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import type { NodeType } from "@/lib/workflow-types"
import { useState } from "react"

interface NodeSidebarProps {
  isOpen: boolean
  onToggle: () => void
  onAddNode: (type: NodeType) => void
}

const NODE_CATEGORIES = [
  {
    name: "Flow",
    nodes: [
      { type: "start" as NodeType, label: "Start", icon: Play, color: "emerald" },
      { type: "end" as NodeType, label: "End", icon: Square, color: "rose" },
    ],
  },
  {
    name: "Core",
    nodes: [
      { type: "agent" as NodeType, label: "Agent", icon: Bot, color: "blue" },
      { type: "condition" as NodeType, label: "Condition", icon: GitBranch, color: "purple" },
    ],
  },
  {
    name: "Safety",
    nodes: [
      { type: "guardrail" as NodeType, label: "Guardrail", icon: Shield, color: "amber" },
      { type: "user-approval" as NodeType, label: "User Approval", icon: UserCheck, color: "orange" },
    ],
  },
  {
    name: "Integrations",
    nodes: [
      { type: "mcp" as NodeType, label: "MCP Server", icon: Plug, color: "cyan" },
      { type: "file-search" as NodeType, label: "File Search", icon: FileSearch, color: "teal" },
    ],
  },
]

const COLOR_CLASSES: Record<string, { bg: string; icon: string; hover: string }> = {
  emerald: { bg: "bg-emerald-500/10", icon: "text-emerald-500", hover: "hover:bg-emerald-500/20" },
  rose: { bg: "bg-rose-500/10", icon: "text-rose-500", hover: "hover:bg-rose-500/20" },
  blue: { bg: "bg-blue-500/10", icon: "text-blue-500", hover: "hover:bg-blue-500/20" },
  purple: { bg: "bg-purple-500/10", icon: "text-purple-500", hover: "hover:bg-purple-500/20" },
  amber: { bg: "bg-amber-500/10", icon: "text-amber-500", hover: "hover:bg-amber-500/20" },
  orange: { bg: "bg-orange-500/10", icon: "text-orange-500", hover: "hover:bg-orange-500/20" },
  cyan: { bg: "bg-cyan-500/10", icon: "text-cyan-500", hover: "hover:bg-cyan-500/20" },
  teal: { bg: "bg-teal-500/10", icon: "text-teal-500", hover: "hover:bg-teal-500/20" },
}

export function NodeSidebar({ isOpen, onToggle, onAddNode }: NodeSidebarProps) {
  const [search, setSearch] = useState("")

  const filteredCategories = NODE_CATEGORIES.map((category) => ({
    ...category,
    nodes: category.nodes.filter((node) => node.label.toLowerCase().includes(search.toLowerCase())),
  })).filter((category) => category.nodes.length > 0)

  return (
    <div className={cn("relative border-r border-border bg-card transition-all duration-300", isOpen ? "w-64" : "w-0")}>
      {/* Toggle Button */}
      <Button
        variant="outline"
        size="icon"
        className="absolute -right-4 top-4 z-10 h-8 w-8 rounded-full bg-transparent"
        onClick={onToggle}
      >
        {isOpen ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
      </Button>

      {isOpen && (
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-4 border-b border-border">
            <h2 className="font-semibold mb-3">Nodes</h2>
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search nodes..."
                className="pl-9 h-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          {/* Node List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-6">
            {filteredCategories.map((category) => (
              <div key={category.name}>
                <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                  {category.name}
                </h3>
                <div className="space-y-1">
                  {category.nodes.map((node) => {
                    const colors = COLOR_CLASSES[node.color]
                    return (
                      <button
                        key={node.type}
                        className={cn(
                          "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors",
                          colors.bg,
                          colors.hover,
                        )}
                        onClick={() => onAddNode(node.type)}
                      >
                        <node.icon className={cn("h-4 w-4", colors.icon)} />
                        <span className="text-sm font-medium">{node.label}</span>
                      </button>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-border">
            <p className="text-xs text-muted-foreground">Drag nodes to the canvas or click to add</p>
          </div>
        </div>
      )}
    </div>
  )
}
