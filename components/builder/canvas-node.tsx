"use client"

import type React from "react"

import { useState, useCallback, useRef } from "react"
import { Bot, Shield, GitBranch, Plug, UserCheck, FileSearch, Play, Square, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"
import type { WorkflowNode, Position, NodeType } from "@/lib/workflow-types"
import { Button } from "@/components/ui/button"

const NODE_ICONS: Record<NodeType, React.ElementType> = {
  start: Play,
  end: Square,
  agent: Bot,
  guardrail: Shield,
  condition: GitBranch,
  mcp: Plug,
  "user-approval": UserCheck,
  "file-search": FileSearch,
}

const NODE_COLORS: Record<NodeType, { bg: string; border: string; icon: string }> = {
  start: { bg: "bg-emerald-500/10", border: "border-emerald-500/50", icon: "text-emerald-500" },
  end: { bg: "bg-rose-500/10", border: "border-rose-500/50", icon: "text-rose-500" },
  agent: { bg: "bg-blue-500/10", border: "border-blue-500/50", icon: "text-blue-500" },
  guardrail: { bg: "bg-amber-500/10", border: "border-amber-500/50", icon: "text-amber-500" },
  condition: { bg: "bg-purple-500/10", border: "border-purple-500/50", icon: "text-purple-500" },
  mcp: { bg: "bg-cyan-500/10", border: "border-cyan-500/50", icon: "text-cyan-500" },
  "user-approval": { bg: "bg-orange-500/10", border: "border-orange-500/50", icon: "text-orange-500" },
  "file-search": { bg: "bg-teal-500/10", border: "border-teal-500/50", icon: "text-teal-500" },
}

interface CanvasNodeProps {
  node: WorkflowNode
  isSelected: boolean
  onSelect: () => void
  onDrag: (position: Position) => void
  onDelete: () => void
  onConnectionStart: (handle: string) => void
  onConnectionEnd: () => void
  isConnecting: boolean
  zoom: number
}

export function CanvasNode({
  node,
  isSelected,
  onSelect,
  onDrag,
  onDelete,
  onConnectionStart,
  onConnectionEnd,
  isConnecting,
  zoom,
}: CanvasNodeProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState<Position>({ x: 0, y: 0 })
  const nodeRef = useRef<HTMLDivElement>(null)

  const Icon = NODE_ICONS[node.type]
  const colors = NODE_COLORS[node.type]

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (e.button !== 0) return
      e.stopPropagation()

      onSelect()
      setIsDragging(true)
      setDragOffset({
        x: e.clientX / zoom - node.position.x,
        y: e.clientY / zoom - node.position.y,
      })

      const handleMouseMove = (moveEvent: MouseEvent) => {
        const newPosition = {
          x: moveEvent.clientX / zoom - dragOffset.x,
          y: moveEvent.clientY / zoom - dragOffset.y,
        }
        onDrag(newPosition)
      }

      const handleMouseUp = () => {
        setIsDragging(false)
        document.removeEventListener("mousemove", handleMouseMove)
        document.removeEventListener("mouseup", handleMouseUp)
      }

      document.addEventListener("mousemove", handleMouseMove)
      document.addEventListener("mouseup", handleMouseUp)
    },
    [node.position, onSelect, onDrag, zoom, dragOffset],
  )

  const handleOutputMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      onConnectionStart("output")
    },
    [onConnectionStart],
  )

  const handleInputClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      if (isConnecting) {
        onConnectionEnd()
      }
    },
    [isConnecting, onConnectionEnd],
  )

  return (
    <div
      ref={nodeRef}
      className={cn(
        "absolute w-[280px] bg-card border-2 rounded-xl shadow-lg transition-shadow",
        "hover:shadow-xl",
        colors.border,
        isSelected && "ring-2 ring-primary ring-offset-2 ring-offset-background",
      )}
      style={{
        left: node.position.x,
        top: node.position.y,
        cursor: isDragging ? "grabbing" : "grab",
      }}
      onMouseDown={handleMouseDown}
    >
      {/* Input Handle */}
      {node.type !== "start" && (
        <div
          className={cn(
            "absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full border-2 bg-background",
            "flex items-center justify-center cursor-pointer transition-all",
            colors.border,
            isConnecting && "ring-2 ring-primary scale-110",
          )}
          onClick={handleInputClick}
        >
          <div className={cn("w-2 h-2 rounded-full", colors.icon.replace("text-", "bg-"))} />
        </div>
      )}

      {/* Node Content */}
      <div className="p-4">
        <div className="flex items-start gap-3">
          <div className={cn("p-2 rounded-lg", colors.bg)}>
            <Icon className={cn("w-5 h-5", colors.icon)} />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-sm truncate">{node.data.label}</h3>
            {node.data.description && (
              <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{node.data.description}</p>
            )}
          </div>
          {isSelected && (
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 -mr-1 -mt-1 text-muted-foreground hover:text-destructive"
              onClick={(e) => {
                e.stopPropagation()
                onDelete()
              }}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>

        {/* Node specific info */}
        {node.type === "agent" && node.data.model && (
          <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
            <span className="px-2 py-0.5 rounded bg-muted">{node.data.model}</span>
            {node.data.tools && node.data.tools.length > 0 && <span>{node.data.tools.length} tools</span>}
          </div>
        )}

        {node.type === "guardrail" && node.data.guardrailType && (
          <div className="mt-3 text-xs">
            <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-500">{node.data.guardrailType}</span>
          </div>
        )}

        {node.type === "condition" && node.data.condition && (
          <div className="mt-3 text-xs text-muted-foreground font-mono bg-muted px-2 py-1 rounded">
            {node.data.condition}
          </div>
        )}
      </div>

      {/* Output Handle */}
      {node.type !== "end" && (
        <div
          className={cn(
            "absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full border-2 bg-background",
            "flex items-center justify-center cursor-crosshair transition-all hover:scale-110",
            colors.border,
          )}
          onMouseDown={handleOutputMouseDown}
        >
          <div className={cn("w-2 h-2 rounded-full", colors.icon.replace("text-", "bg-"))} />
        </div>
      )}
    </div>
  )
}
