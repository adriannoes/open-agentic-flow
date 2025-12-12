"use client"

import type React from "react"

import { useState, useCallback, useRef } from "react"
import { Play, ZoomIn, ZoomOut, Maximize2, Save, Undo, Redo } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { WorkflowNode, Position, NodeType, CanvasState, Workflow } from "@/lib/workflow-types"
import { NodeSidebar } from "./node-sidebar"
import { CanvasNode } from "./canvas-node"
import { NodePropertiesPanel } from "./node-properties-panel"
import useSWR, { mutate } from "swr"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

const GRID_SIZE = 20
const MIN_ZOOM = 0.25
const MAX_ZOOM = 2

export function BuilderCanvas() {
  const canvasRef = useRef<HTMLDivElement>(null)
  const [workflowId, setWorkflowId] = useState<string>("default-workflow")

  const { data: workflow, isLoading } = useSWR<Workflow>(`/api/workflows/${workflowId}`, fetcher)

  const [canvasState, setCanvasState] = useState<CanvasState>({
    zoom: 1,
    pan: { x: 0, y: 0 },
    selectedNodeId: null,
    selectedConnectionId: null,
    isDragging: false,
    isConnecting: false,
    connectionStart: null,
  })

  const [isPanning, setIsPanning] = useState(false)
  const [panStart, setPanStart] = useState<Position>({ x: 0, y: 0 })
  const [showSidebar, setShowSidebar] = useState(true)
  const [showProperties, setShowProperties] = useState(true)
  const [mousePos, setMousePos] = useState<Position>({ x: 0, y: 0 })

  // Handle zoom
  const handleZoom = useCallback((delta: number) => {
    setCanvasState((prev) => ({
      ...prev,
      zoom: Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, prev.zoom + delta)),
    }))
  }, [])

  // Handle wheel zoom
  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault()
        const delta = e.deltaY > 0 ? -0.1 : 0.1
        handleZoom(delta)
      }
    },
    [handleZoom],
  )

  // Handle pan start
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (e.button === 1 || (e.button === 0 && e.altKey)) {
        setIsPanning(true)
        setPanStart({ x: e.clientX - canvasState.pan.x, y: e.clientY - canvasState.pan.y })
      } else if (e.target === canvasRef.current || (e.target as HTMLElement).classList.contains("canvas-grid")) {
        setCanvasState((prev) => ({ ...prev, selectedNodeId: null, selectedConnectionId: null }))
      }
    },
    [canvasState.pan],
  )

  // Handle pan move
  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      const rect = canvasRef.current?.getBoundingClientRect()
      if (rect) {
        setMousePos({
          x: (e.clientX - rect.left - canvasState.pan.x) / canvasState.zoom,
          y: (e.clientY - rect.top - canvasState.pan.y) / canvasState.zoom,
        })
      }

      if (isPanning) {
        setCanvasState((prev) => ({
          ...prev,
          pan: { x: e.clientX - panStart.x, y: e.clientY - panStart.y },
        }))
      }
    },
    [isPanning, panStart, canvasState.zoom, canvasState.pan],
  )

  // Handle pan end
  const handleMouseUp = useCallback(() => {
    setIsPanning(false)
    setCanvasState((prev) => ({ ...prev, isConnecting: false, connectionStart: null }))
  }, [])

  // Handle node selection
  const handleNodeSelect = useCallback((nodeId: string) => {
    setCanvasState((prev) => ({ ...prev, selectedNodeId: nodeId, selectedConnectionId: null }))
  }, [])

  // Handle node drag
  const handleNodeDrag = useCallback(
    async (nodeId: string, position: Position) => {
      // Snap to grid
      const snappedPosition = {
        x: Math.round(position.x / GRID_SIZE) * GRID_SIZE,
        y: Math.round(position.y / GRID_SIZE) * GRID_SIZE,
      }

      await fetch(`/api/workflows/${workflowId}/nodes/${nodeId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ position: snappedPosition }),
      })
      mutate(`/api/workflows/${workflowId}`)
    },
    [workflowId],
  )

  // Handle connection start
  const handleConnectionStart = useCallback((nodeId: string, handle: string) => {
    setCanvasState((prev) => ({
      ...prev,
      isConnecting: true,
      connectionStart: { nodeId, handle },
    }))
  }, [])

  // Handle connection end
  const handleConnectionEnd = useCallback(
    async (targetNodeId: string) => {
      if (!canvasState.connectionStart || canvasState.connectionStart.nodeId === targetNodeId) {
        return
      }

      await fetch(`/api/workflows/${workflowId}/connections`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sourceId: canvasState.connectionStart.nodeId,
          targetId: targetNodeId,
        }),
      })
      mutate(`/api/workflows/${workflowId}`)
      setCanvasState((prev) => ({ ...prev, isConnecting: false, connectionStart: null }))
    },
    [canvasState.connectionStart, workflowId],
  )

  // Handle node delete
  const handleNodeDelete = useCallback(
    async (nodeId: string) => {
      await fetch(`/api/workflows/${workflowId}/nodes/${nodeId}`, { method: "DELETE" })
      mutate(`/api/workflows/${workflowId}`)
      setCanvasState((prev) => ({ ...prev, selectedNodeId: null }))
    },
    [workflowId],
  )

  // Handle add node from sidebar
  const handleAddNode = useCallback(
    async (type: NodeType) => {
      const centerX = (window.innerWidth / 2 - canvasState.pan.x) / canvasState.zoom
      const centerY = (window.innerHeight / 2 - canvasState.pan.y) / canvasState.zoom

      const position = {
        x: Math.round(centerX / GRID_SIZE) * GRID_SIZE,
        y: Math.round(centerY / GRID_SIZE) * GRID_SIZE,
      }

      const labels: Record<NodeType, string> = {
        start: "Start",
        end: "End",
        agent: "New Agent",
        guardrail: "Guardrail",
        condition: "Condition",
        mcp: "MCP Server",
        "user-approval": "User Approval",
        "file-search": "File Search",
      }

      await fetch(`/api/workflows/${workflowId}/nodes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          position,
          data: { label: labels[type] },
        }),
      })
      mutate(`/api/workflows/${workflowId}`)
    },
    [workflowId, canvasState.pan, canvasState.zoom],
  )

  // Reset view
  const handleResetView = useCallback(() => {
    setCanvasState((prev) => ({ ...prev, zoom: 1, pan: { x: 0, y: 0 } }))
  }, [])

  // Get connection path
  const getConnectionPath = (source: WorkflowNode, target: WorkflowNode) => {
    const sourceX = source.position.x + 140 // Node width / 2
    const sourceY = source.position.y + 40 // Output handle position
    const targetX = target.position.x
    const targetY = target.position.y + 40 // Input handle position

    const dx = targetX - sourceX
    const controlPointOffset = Math.min(Math.abs(dx) / 2, 100)

    return `M ${sourceX} ${sourceY} C ${sourceX + controlPointOffset} ${sourceY}, ${targetX - controlPointOffset} ${targetY}, ${targetX} ${targetY}`
  }

  const selectedNode = workflow?.nodes.find((n) => n.id === canvasState.selectedNodeId)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="text-muted-foreground">Loading workflow...</div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Node Sidebar */}
      <NodeSidebar isOpen={showSidebar} onToggle={() => setShowSidebar(!showSidebar)} onAddNode={handleAddNode} />

      {/* Main Canvas Area */}
      <div className="flex-1 flex flex-col">
        {/* Toolbar */}
        <div className="h-14 border-b border-border bg-card flex items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <h1 className="font-semibold text-lg">{workflow?.name || "Untitled Workflow"}</h1>
            <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">
              v{workflow?.version || 1}
            </span>
          </div>

          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Undo className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Redo className="h-4 w-4" />
            </Button>
            <div className="w-px h-6 bg-border mx-2" />
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleZoom(-0.1)}>
              <ZoomOut className="h-4 w-4" />
            </Button>
            <span className="text-sm text-muted-foreground w-12 text-center">
              {Math.round(canvasState.zoom * 100)}%
            </span>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleZoom(0.1)}>
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleResetView}>
              <Maximize2 className="h-4 w-4" />
            </Button>
            <div className="w-px h-6 bg-border mx-2" />
            <Button variant="outline" size="sm" className="h-8 gap-2 bg-transparent">
              <Play className="h-3.5 w-3.5" />
              Preview
            </Button>
            <Button size="sm" className="h-8 gap-2">
              <Save className="h-3.5 w-3.5" />
              Save
            </Button>
          </div>
        </div>

        {/* Canvas */}
        <div
          ref={canvasRef}
          className="flex-1 relative overflow-hidden cursor-grab active:cursor-grabbing"
          onWheel={handleWheel}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          {/* Grid Background */}
          <div
            className="canvas-grid absolute inset-0 pointer-events-none"
            style={{
              backgroundImage: `
                radial-gradient(circle, hsl(var(--muted-foreground) / 0.15) 1px, transparent 1px)
              `,
              backgroundSize: `${GRID_SIZE * canvasState.zoom}px ${GRID_SIZE * canvasState.zoom}px`,
              backgroundPosition: `${canvasState.pan.x}px ${canvasState.pan.y}px`,
            }}
          />

          {/* Nodes and Connections Container */}
          <div
            className="absolute"
            style={{
              transform: `translate(${canvasState.pan.x}px, ${canvasState.pan.y}px) scale(${canvasState.zoom})`,
              transformOrigin: "0 0",
            }}
          >
            {/* Connections SVG */}
            <svg
              className="absolute top-0 left-0 pointer-events-none"
              style={{ width: "10000px", height: "10000px", overflow: "visible" }}
            >
              <defs>
                <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                  <polygon points="0 0, 10 3.5, 0 7" fill="hsl(var(--muted-foreground))" />
                </marker>
              </defs>
              {workflow?.connections.map((connection) => {
                const sourceNode = workflow.nodes.find((n) => n.id === connection.sourceId)
                const targetNode = workflow.nodes.find((n) => n.id === connection.targetId)
                if (!sourceNode || !targetNode) return null

                return (
                  <path
                    key={connection.id}
                    d={getConnectionPath(sourceNode, targetNode)}
                    fill="none"
                    stroke="hsl(var(--muted-foreground))"
                    strokeWidth={2}
                    markerEnd="url(#arrowhead)"
                    className={cn(
                      "transition-colors",
                      canvasState.selectedConnectionId === connection.id && "stroke-primary",
                    )}
                  />
                )
              })}

              {/* Connection in progress */}
              {canvasState.isConnecting && canvasState.connectionStart && (
                <path
                  d={(() => {
                    const sourceNode = workflow?.nodes.find((n) => n.id === canvasState.connectionStart?.nodeId)
                    if (!sourceNode) return ""
                    const sourceX = sourceNode.position.x + 140
                    const sourceY = sourceNode.position.y + 40
                    const dx = mousePos.x - sourceX
                    const controlPointOffset = Math.min(Math.abs(dx) / 2, 100)
                    return `M ${sourceX} ${sourceY} C ${sourceX + controlPointOffset} ${sourceY}, ${mousePos.x - controlPointOffset} ${mousePos.y}, ${mousePos.x} ${mousePos.y}`
                  })()}
                  fill="none"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  strokeDasharray="5,5"
                />
              )}
            </svg>

            {/* Nodes */}
            {workflow?.nodes.map((node) => (
              <CanvasNode
                key={node.id}
                node={node}
                isSelected={canvasState.selectedNodeId === node.id}
                onSelect={() => handleNodeSelect(node.id)}
                onDrag={(pos) => handleNodeDrag(node.id, pos)}
                onDelete={() => handleNodeDelete(node.id)}
                onConnectionStart={(handle) => handleConnectionStart(node.id, handle)}
                onConnectionEnd={() => handleConnectionEnd(node.id)}
                isConnecting={canvasState.isConnecting}
                zoom={canvasState.zoom}
              />
            ))}
          </div>

          {/* Mini Map */}
          <div className="absolute bottom-4 right-4 w-48 h-32 bg-card border border-border rounded-lg overflow-hidden">
            <div className="absolute inset-0 p-2">
              <div className="relative w-full h-full">
                {workflow?.nodes.map((node) => (
                  <div
                    key={node.id}
                    className={cn(
                      "absolute w-3 h-2 rounded-sm",
                      node.type === "start" && "bg-emerald-500",
                      node.type === "end" && "bg-rose-500",
                      node.type === "agent" && "bg-blue-500",
                      node.type === "guardrail" && "bg-amber-500",
                      node.type === "condition" && "bg-purple-500",
                      node.type === "mcp" && "bg-cyan-500",
                      node.type === "user-approval" && "bg-orange-500",
                      node.type === "file-search" && "bg-teal-500",
                    )}
                    style={{
                      left: `${(node.position.x / 1000) * 100}%`,
                      top: `${(node.position.y / 600) * 100}%`,
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Properties Panel */}
      <NodePropertiesPanel
        isOpen={showProperties}
        onToggle={() => setShowProperties(!showProperties)}
        node={selectedNode}
        workflowId={workflowId}
        onUpdate={() => mutate(`/api/workflows/${workflowId}`)}
      />
    </div>
  )
}
