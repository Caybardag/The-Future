import React, { useRef, useEffect, useState, useMemo } from "react";
import { Milestone, CategoryType } from "../types";
import {
  Play,
  Pause,
  RotateCcw,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  Sparkles,
  Info,
  Filter,
  Zap,
  Layers,
  Cpu,
  ChevronRight,
  Eye,
  Flame,
  Radio,
  Sliders,
  Move
} from "lucide-react";

interface ForceDirectedPhysicsGraphProps {
  milestones: Milestone[];
  onSelectMilestone?: (milestone: Milestone) => void;
  selectedMilestoneId?: number;
}

interface PhysicsNode {
  id: number; // year
  milestone: Milestone;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  isPinned: boolean;
  degree: number;
}

interface PhysicsLink {
  source: PhysicsNode;
  target: PhysicsNode;
  strength: number;
  distance: number;
}

const CATEGORY_COLORS: Record<string, string> = {
  AI: "#818cf8", // Indigo
  Computing: "#38bdf8", // Sky blue
  Energy: "#f59e0b", // Amber
  Biotech: "#10b981", // Emerald
  Space: "#c084fc", // Purple
  Robotics: "#f43f5e", // Rose
  Nanotech: "#06b6d4", // Cyan
  Society: "#fb923c", // Orange
  default: "#94a3b8", // Slate
};

export const ForceDirectedPhysicsGraph: React.FC<ForceDirectedPhysicsGraphProps> = ({
  milestones = [],
  onSelectMilestone,
  selectedMilestoneId,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [selectedNode, setSelectedNode] = useState<Milestone | null>(() => {
    return milestones.find((m) => m.year === (selectedMilestoneId || 2029)) || milestones[0] || null;
  });

  const [isRunning, setIsRunning] = useState<boolean>(true);
  const [chargeStrength, setChargeStrength] = useState<number>(-350); // Mıknatıs itme gücü
  const [linkDistance, setLinkDistance] = useState<number>(140); // Bağ uzunluğu
  const [gravity, setGravity] = useState<number>(0.04); // Merkeze çekim
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>("all");
  const [heatEnergy, setHeatEnergy] = useState<number>(1); // Simülasyon sıcaklığı
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [panOffset, setPanOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDraggingCanvas, setIsDraggingCanvas] = useState<boolean>(false);
  const [dragStartPos, setDragStartPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [draggedNode, setDraggedNode] = useState<PhysicsNode | null>(null);
  const [hoveredNode, setHoveredNode] = useState<PhysicsNode | null>(null);
  const [pinchFeedback, setPinchFeedback] = useState<{ active: boolean; scalePercent: number }>({
    active: false,
    scalePercent: 100,
  });

  // Multi-Touch Pinch-to-Zoom Refs
  const touchStartDistRef = useRef<number>(0);
  const touchStartMidpointRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const touchStartZoomRef = useRef<number>(1);
  const touchStartPanRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const isPinchingRef = useRef<boolean>(false);

  // Nodes & Links storage refs for continuous 60fps canvas loop
  const nodesRef = useRef<PhysicsNode[]>([]);
  const linksRef = useRef<PhysicsLink[]>([]);
  const animFrameIdRef = useRef<number | null>(null);

  // Filtered milestones
  const filteredMilestones = useMemo(() => {
    if (activeCategoryFilter === "all") return milestones;
    return milestones.filter((m) => m.category === activeCategoryFilter);
  }, [milestones, activeCategoryFilter]);

  // Initialize physics network
  const initPhysicsNetwork = () => {
    const width = canvasRef.current?.width || 800;
    const height = canvasRef.current?.height || 600;
    const centerX = width / 2;
    const centerY = height / 2;

    const nodeMap = new Map<number, PhysicsNode>();

    const nodes: PhysicsNode[] = filteredMilestones.map((m, i) => {
      // Circle layout with jitter initially
      const angle = (i / filteredMilestones.length) * 2 * Math.PI;
      const dist = 120 + Math.random() * 180;
      const color = CATEGORY_COLORS[m.category] || CATEGORY_COLORS.default;
      
      const node: PhysicsNode = {
        id: m.year,
        milestone: m,
        x: centerX + Math.cos(angle) * dist,
        y: centerY + Math.sin(angle) * dist,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2,
        radius: m.year === 2029 || m.year === 2045 ? 18 : 13,
        color,
        isPinned: false,
        degree: (m.relatedYears || []).length,
      };
      nodeMap.set(m.year, node);
      return node;
    });

    const links: PhysicsLink[] = [];
    filteredMilestones.forEach((m) => {
      const sourceNode = nodeMap.get(m.year);
      if (!sourceNode) return;

      (m.relatedYears || []).forEach((relYear) => {
        const targetNode = nodeMap.get(relYear);
        if (targetNode && sourceNode.id !== targetNode.id) {
          links.push({
            source: sourceNode,
            target: targetNode,
            strength: 0.08,
            distance: linkDistance,
          });
        }
      });
    });

    nodesRef.current = nodes;
    linksRef.current = links;
    setHeatEnergy(1);
  };

  // Re-init on milestones or filter change
  useEffect(() => {
    initPhysicsNetwork();
  }, [filteredMilestones]);

  // Main Canvas Physics & Render Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let localHeat = heatEnergy;

    const updatePhysics = () => {
      const nodes = nodesRef.current;
      const links = linksRef.current;
      const width = canvas.width;
      const height = canvas.height;
      const centerX = width / 2;
      const centerY = height / 2;

      if (isRunning && localHeat > 0.005) {
        // 1. Center Gravity Force
        nodes.forEach((n) => {
          if (n === draggedNode) return;
          const dx = centerX - n.x;
          const dy = centerY - n.y;
          n.vx += dx * gravity * localHeat;
          n.vy += dy * gravity * localHeat;
        });

        // 2. Node-Node Repulsion Force (Coulomb's Law Approximation)
        for (let i = 0; i < nodes.length; i++) {
          for (let j = i + 1; j < nodes.length; j++) {
            const n1 = nodes[i];
            const n2 = nodes[j];
            let dx = n2.x - n1.x;
            let dy = n2.y - n1.y;
            let distSq = dx * dx + dy * dy;
            if (distSq < 1) distSq = 1;
            const dist = Math.sqrt(distSq);

            if (dist < 400) {
              const force = (chargeStrength / distSq) * localHeat;
              const fx = (dx / dist) * force;
              const fy = (dy / dist) * force;

              if (n1 !== draggedNode && !n1.isPinned) {
                n1.vx += fx;
                n1.vy += fy;
              }
              if (n2 !== draggedNode && !n2.isPinned) {
                n2.vx -= fx;
                n2.vy -= fy;
              }
            }
          }
        }

        // 3. Link Spring Attraction Force (Hooke's Law)
        links.forEach((link) => {
          const s = link.source;
          const t = link.target;
          const dx = t.x - s.x;
          const dy = t.y - s.y;
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;
          const diff = dist - linkDistance;
          const force = diff * link.strength * localHeat;
          const fx = (dx / dist) * force;
          const fy = (dy / dist) * force;

          if (s !== draggedNode && !s.isPinned) {
            s.vx += fx;
            s.vy += fy;
          }
          if (t !== draggedNode && !t.isPinned) {
            t.vx -= fx;
            t.vy -= fy;
          }
        });

        // 4. Update Node Positions with Friction Damping
        const friction = 0.88;
        nodes.forEach((n) => {
          if (n === draggedNode) return;
          if (!n.isPinned) {
            n.vx *= friction;
            n.vy *= friction;
            n.x += n.vx;
            n.y += n.vy;

            // Boundary constraints
            const pad = 40;
            if (n.x < pad) n.x = pad;
            if (n.x > width - pad) n.x = width - pad;
            if (n.y < pad) n.y = pad;
            if (n.y > height - pad) n.y = height - pad;
          }
        });

        localHeat *= 0.992; // Gradual cooling down
      }
    };

    const render = () => {
      updatePhysics();

      const width = canvas.width;
      const height = canvas.height;
      const nodes = nodesRef.current;
      const links = linksRef.current;

      ctx.clearRect(0, 0, width, height);
      ctx.save();

      // Pan & Zoom Transforms
      ctx.translate(panOffset.x, panOffset.y);
      ctx.scale(zoomLevel, zoomLevel);

      // Subtle Background Grid Dots
      ctx.fillStyle = "rgba(255, 255, 255, 0.03)";
      for (let x = 0; x < width; x += 40) {
        for (let y = 0; y < height; y += 40) {
          ctx.beginPath();
          ctx.arc(x, y, 1, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Draw Links (Springs)
      links.forEach((link) => {
        const isConnectedToSelected =
          selectedNode &&
          (link.source.id === selectedNode.year || link.target.id === selectedNode.year);

        ctx.beginPath();
        ctx.moveTo(link.source.x, link.source.y);
        ctx.lineTo(link.target.x, link.target.y);

        if (isConnectedToSelected) {
          ctx.strokeStyle = "rgba(168, 85, 247, 0.7)"; // Vibrant purple glow
          ctx.lineWidth = 2.5;
          ctx.setLineDash([4, 2]);
        } else {
          ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
          ctx.lineWidth = 1;
          ctx.setLineDash([]);
        }
        ctx.stroke();
        ctx.setLineDash([]);
      });

      // Draw Nodes
      nodes.forEach((node) => {
        const isSelected = selectedNode?.year === node.id;
        const isHovered = hoveredNode?.id === node.id;
        const isConnected =
          selectedNode &&
          ((selectedNode.relatedYears || []).includes(node.id) ||
            (node.milestone.relatedYears || []).includes(selectedNode.year));

        // Outer Aura Glow for selected/hovered
        if (isSelected || isHovered) {
          ctx.beginPath();
          ctx.arc(node.x, node.y, node.radius + 8, 0, Math.PI * 2);
          ctx.fillStyle = isSelected
            ? "rgba(168, 85, 247, 0.25)"
            : "rgba(56, 189, 248, 0.2)";
          ctx.fill();
        }

        // Main Node Body
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
        ctx.fillStyle = isSelected ? "#a855f7" : isConnected ? "#38bdf8" : node.color;
        ctx.fill();
        ctx.strokeStyle = isSelected ? "#ffffff" : "rgba(255, 255, 255, 0.4)";
        ctx.lineWidth = isSelected ? 2.5 : 1;
        ctx.stroke();

        // Node Label (Year)
        ctx.fillStyle = "#ffffff";
        ctx.font = isSelected ? "bold 11px monospace" : "10px monospace";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(String(node.id), node.x, node.y);

        // Node Title Tag (Below node)
        if (isSelected || isHovered || isConnected || zoomLevel > 1.2) {
          ctx.font = "9px sans-serif";
          ctx.fillStyle = isSelected ? "#e9d5ff" : isConnected ? "#bae6fd" : "#94a3b8";
          ctx.fillText(
            node.milestone.title.length > 18
              ? node.milestone.title.slice(0, 16) + "..."
              : node.milestone.title,
            node.x,
            node.y + node.radius + 12
          );
        }
      });

      ctx.restore();

      animFrameIdRef.current = requestAnimationFrame(render);
    };

    animFrameIdRef.current = requestAnimationFrame(render);

    return () => {
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
    };
  }, [isRunning, chargeStrength, linkDistance, gravity, selectedNode, hoveredNode, zoomLevel, panOffset, draggedNode]);

  // Window/Canvas Resizing
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current && canvasRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        canvasRef.current.width = rect.width;
        canvasRef.current.height = Math.max(500, rect.height || 540);
        initPhysicsNetwork();
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Mouse Wheel Zoom centered at cursor
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const rect = canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      const zoomFactor = e.deltaY < 0 ? 1.12 : 0.89;
      setZoomLevel((prevZoom) => {
        const nextZoom = Math.min(3.5, Math.max(0.35, prevZoom * zoomFactor));
        setPanOffset((prevPan) => {
          const virtualX = (mouseX - prevPan.x) / prevZoom;
          const virtualY = (mouseY - prevPan.y) / prevZoom;
          return {
            x: mouseX - virtualX * nextZoom,
            y: mouseY - virtualY * nextZoom,
          };
        });
        return nextZoom;
      });
    };

    canvas.addEventListener("wheel", handleWheel, { passive: false });
    return () => canvas.removeEventListener("wheel", handleWheel);
  }, []);

  // Mouse / Touch / Drag Handlers
  const mouseDragStartPosRef = useRef<{ clientX: number; clientY: number }>({ clientX: 0, clientY: 0 });

  const getCanvasCoords = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const x = (clientX - rect.left - panOffset.x) / zoomLevel;
    const y = (clientY - rect.top - panOffset.y) / zoomLevel;
    return { x, y };
  };

  const handlePointerDown = (clientX: number, clientY: number) => {
    const { x: mouseX, y: mouseY } = getCanvasCoords(clientX, clientY);
    mouseDragStartPosRef.current = { clientX, clientY };

    // Check if clicked on a node
    const clickedNode = nodesRef.current.find((n) => {
      const dx = n.x - mouseX;
      const dy = n.y - mouseY;
      return Math.sqrt(dx * dx + dy * dy) <= n.radius + 6;
    });

    if (clickedNode) {
      setDraggedNode(clickedNode);
      setSelectedNode(clickedNode.milestone);
      setHeatEnergy(1); // Energize simulation for smooth dragging
    } else {
      setIsDraggingCanvas(true);
      setDragStartPos({ x: clientX - panOffset.x, y: clientY - panOffset.y });
    }
  };

  const handlePointerMove = (clientX: number, clientY: number) => {
    if (isDraggingCanvas) {
      setPanOffset({
        x: clientX - dragStartPos.x,
        y: clientY - dragStartPos.y,
      });
      return;
    }

    const { x: mouseX, y: mouseY } = getCanvasCoords(clientX, clientY);

    if (draggedNode) {
      draggedNode.x = mouseX;
      draggedNode.y = mouseY;
      draggedNode.vx = 0;
      draggedNode.vy = 0;
      setHeatEnergy(0.85); // Re-energize physics while dragging
      return;
    }

    // Hover check
    const hovered = nodesRef.current.find((n) => {
      const dx = n.x - mouseX;
      const dy = n.y - mouseY;
      return Math.sqrt(dx * dx + dy * dy) <= n.radius + 6;
    });
    setHoveredNode(hovered || null);
  };

  const handlePointerUp = () => {
    if (draggedNode) {
      // Release node with soft velocity damping
      draggedNode.vx = 0;
      draggedNode.vy = 0;
      setDraggedNode(null);
    }
    setIsDraggingCanvas(false);
  };

  // Mouse Handlers
  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    handlePointerDown(e.clientX, e.clientY);
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    handlePointerMove(e.clientX, e.clientY);
  };

  const handleCanvasMouseUp = () => {
    handlePointerUp();
  };

  const handleCanvasDoubleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const { x: mouseX, y: mouseY } = getCanvasCoords(e.clientX, e.clientY);
    const clickedNode = nodesRef.current.find((n) => {
      const dx = n.x - mouseX;
      const dy = n.y - mouseY;
      return Math.sqrt(dx * dx + dy * dy) <= n.radius + 6;
    });
    if (clickedNode && onSelectMilestone) {
      onSelectMilestone(clickedNode.milestone);
    }
  };

  // Multi-Touch Handlers for Mobile & Tablet (Full Pinch-to-Zoom & Two-Finger Pan)
  const handleCanvasTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    e.stopPropagation();

    if (e.touches.length === 2) {
      // Two-Finger Pinch-to-Zoom Initiation
      const t1 = e.touches[0];
      const t2 = e.touches[1];
      const dist = Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);
      const midX = (t1.clientX + t2.clientX) / 2;
      const midY = (t1.clientY + t2.clientY) / 2;

      touchStartDistRef.current = dist;
      touchStartMidpointRef.current = { x: midX, y: midY };
      touchStartZoomRef.current = zoomLevel;
      touchStartPanRef.current = { ...panOffset };
      isPinchingRef.current = true;

      // Release any dragged node to prevent accidental teleportation
      if (draggedNode) {
        draggedNode.vx = 0;
        draggedNode.vy = 0;
        setDraggedNode(null);
      }
      setIsDraggingCanvas(false);
      setPinchFeedback({ active: true, scalePercent: Math.round(zoomLevel * 100) });
    } else if (e.touches.length === 1) {
      isPinchingRef.current = false;
      const touch = e.touches[0];
      handlePointerDown(touch.clientX, touch.clientY);
    }
  };

  const handleCanvasTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    e.stopPropagation();

    if (e.touches.length === 2 && isPinchingRef.current) {
      // Prevent browser native pull-down or zoom
      const t1 = e.touches[0];
      const t2 = e.touches[1];
      const currentDist = Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);
      const currentMidX = (t1.clientX + t2.clientX) / 2;
      const currentMidY = (t1.clientY + t2.clientY) / 2;

      if (touchStartDistRef.current > 5) {
        const scaleRatio = currentDist / touchStartDistRef.current;
        const newZoom = Math.min(3.5, Math.max(0.35, touchStartZoomRef.current * scaleRatio));

        const canvas = canvasRef.current;
        if (canvas) {
          const rect = canvas.getBoundingClientRect();
          const startZoom = touchStartZoomRef.current;
          const startPan = touchStartPanRef.current;
          const startMid = touchStartMidpointRef.current;

          // Virtual canvas coordinates under initial midpoint
          const focalX = (startMid.x - rect.left - startPan.x) / startZoom;
          const focalY = (startMid.y - rect.top - startPan.y) / startZoom;

          // New pan offset preserves focal point under fingers and supports 2-finger panning
          const newPanX = (currentMidX - rect.left) - focalX * newZoom;
          const newPanY = (currentMidY - rect.top) - focalY * newZoom;

          setZoomLevel(newZoom);
          setPanOffset({ x: newPanX, y: newPanY });
          setPinchFeedback({ active: true, scalePercent: Math.round(newZoom * 100) });
        }
      }
    } else if (e.touches.length === 1 && !isPinchingRef.current) {
      const touch = e.touches[0];
      handlePointerMove(touch.clientX, touch.clientY);
    }
  };

  const handleCanvasTouchEnd = (e: React.TouchEvent<HTMLCanvasElement>) => {
    e.stopPropagation();

    if (e.touches.length < 2 && isPinchingRef.current) {
      isPinchingRef.current = false;
      setTimeout(() => {
        setPinchFeedback((prev) => ({ ...prev, active: false }));
      }, 750);
    }

    if (e.touches.length === 1) {
      // Re-anchor single finger for dragging
      const touch = e.touches[0];
      setIsDraggingCanvas(true);
      setDragStartPos({ x: touch.clientX - panOffset.x, y: touch.clientY - panOffset.y });
    } else if (e.touches.length === 0) {
      handlePointerUp();
    }
  };

  const handleResetView = () => {
    setPanOffset({ x: 0, y: 0 });
    setZoomLevel(1);
    setHeatEnergy(1);
    initPhysicsNetwork();
  };

  const categories = useMemo(() => {
    const cats = new Set<string>();
    milestones.forEach((m) => cats.add(m.category));
    return Array.from(cats);
  }, [milestones]);

  return (
    <div className="space-y-4 font-mono text-slate-200">
      
      {/* 🚀 PHYSICS TOP CONTROLS & HUD */}
      <div className="bg-slate-950 border border-white/10 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4 shadow-xl">
        
        {/* Category Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
          <span className="text-slate-400 mr-1 flex items-center gap-1 text-[11px]">
            <Filter className="w-3 h-3 text-cyan-400" /> Kategori:
          </span>
          <button
            onClick={() => setActiveCategoryFilter("all")}
            className={`px-2.5 py-1 rounded-lg border text-[11px] font-bold transition-all cursor-pointer ${
              activeCategoryFilter === "all"
                ? "bg-purple-600 border-purple-400 text-white"
                : "bg-slate-900 border-white/5 text-slate-400 hover:text-white"
            }`}
          >
            Tümü ({milestones.length})
          </button>
          {categories.map((cat, catIdx) => (
            <button
              key={`physics-cat-${cat}-${catIdx}`}
              onClick={() => setActiveCategoryFilter(cat)}
              className={`px-2.5 py-1 rounded-lg border text-[11px] transition-all cursor-pointer ${
                activeCategoryFilter === cat
                  ? "bg-cyan-600 border-cyan-400 text-white font-bold"
                  : "bg-slate-900 border-white/5 text-slate-400 hover:text-white"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Action HUD Controls */}
        <div className="flex items-center gap-2">
          {/* Pause / Play */}
          <button
            onClick={() => setIsRunning(!isRunning)}
            className={`p-2 rounded-xl border text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
              isRunning
                ? "bg-emerald-950/80 border-emerald-500/40 text-emerald-300"
                : "bg-amber-950/80 border-amber-500/40 text-amber-300"
            }`}
            title={isRunning ? "Simülasyonu Duraklat" : "Fizik Motorunu Başlat"}
          >
            {isRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span className="text-[10px] hidden sm:inline">{isRunning ? "Çalışıyor" : "Durduruldu"}</span>
          </button>

          {/* Reset View */}
          <button
            onClick={handleResetView}
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-white/10 text-slate-300 text-xs flex items-center gap-1.5 transition-all cursor-pointer"
            title="Ağı Yeniden Sıfırla ve Merkeze Al"
          >
            <RotateCcw className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-[10px] hidden sm:inline">Sıfırla</span>
          </button>

          {/* Zoom controls */}
          <div className="flex items-center bg-slate-900 border border-white/10 rounded-xl p-0.5">
            <button
              onClick={() => setZoomLevel((z) => Math.max(0.6, z - 0.15))}
              className="p-1.5 text-slate-400 hover:text-white cursor-pointer"
              title="Uzaklaş"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="text-[10px] px-1 text-slate-400">{Math.round(zoomLevel * 100)}%</span>
            <button
              onClick={() => setZoomLevel((z) => Math.min(2.2, z + 0.15))}
              className="p-1.5 text-slate-400 hover:text-white cursor-pointer"
              title="Yakınlaş"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>

      {/* 🌌 MAIN INTERACTIVE CANVAS + SIDEBAR PANEL */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        
        {/* Canvas Workspace (8 cols) */}
        <div
          ref={containerRef}
          data-prevent-swipe="true"
          className="lg:col-span-8 bg-slate-950 border border-purple-500/30 rounded-2xl relative overflow-hidden shadow-2xl min-h-[520px] flex items-center justify-center cursor-grab active:cursor-grabbing touch-none select-none"
        >
          <canvas
            ref={canvasRef}
            data-prevent-swipe="true"
            onMouseDown={handleCanvasMouseDown}
            onMouseMove={handleCanvasMouseMove}
            onMouseUp={handleCanvasMouseUp}
            onMouseLeave={handleCanvasMouseUp}
            onDoubleClick={handleCanvasDoubleClick}
            onTouchStart={handleCanvasTouchStart}
            onTouchMove={handleCanvasTouchMove}
            onTouchEnd={handleCanvasTouchEnd}
            className="w-full h-full block touch-none select-none"
          />

          {/* Interactive Hint & Magnetic Physics Explanation + Mobile Touch Gestures */}
          <div className="absolute bottom-3 left-3 max-w-[calc(100%-140px)] sm:max-w-none bg-slate-950/90 backdrop-blur-md border border-cyan-500/30 px-3 py-2 rounded-xl text-[11px] text-slate-300 flex flex-wrap items-center gap-2 sm:gap-3 pointer-events-none shadow-lg z-20">
            <div className="flex items-center gap-1.5 text-cyan-400 font-bold">
              <Move className="w-3.5 h-3.5 animate-pulse shrink-0" />
              <span>Dokunmatik & Manyetik Fizik:</span>
            </div>
            <span className="text-slate-400 text-[10px]">
              👆 1 parmak: Düğüm çek/fırlat • ✌️ 2 parmak: Yakınlaştır/uzaklaştır (Pinch) ve kaydır
            </span>
          </div>

          {/* Pinch-to-zoom Live Feedback HUD */}
          {pinchFeedback.active && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-purple-950/95 border border-purple-400 text-purple-200 px-4 py-2 rounded-2xl text-xs font-mono font-bold shadow-2xl flex items-center gap-2 pointer-events-none z-30 animate-pulse">
              <ZoomIn className="w-4 h-4 text-cyan-300 animate-spin" />
              <span>Pinch-to-Zoom: %{pinchFeedback.scalePercent}</span>
            </div>
          )}

          {/* Floating Touch & Zoom Quick Controls on Canvas */}
          <div className="absolute bottom-3 right-3 flex items-center gap-1 bg-slate-950/90 backdrop-blur-md border border-white/15 p-1 rounded-xl shadow-xl z-20">
            <button
              onClick={() => setZoomLevel((z) => Math.max(0.35, +(z - 0.2).toFixed(2)))}
              className="w-8 h-8 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white flex items-center justify-center transition-all cursor-pointer"
              title="Uzaklaş"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => {
                setPanOffset({ x: 0, y: 0 });
                setZoomLevel(1);
              }}
              className="px-2 h-8 rounded-lg bg-slate-900 hover:bg-slate-800 text-cyan-300 font-mono text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer"
              title="Merkeze Sıfırla"
            >
              <RotateCcw className="w-3 h-3" />
              <span>%{Math.round(zoomLevel * 100)}</span>
            </button>
            <button
              onClick={() => setZoomLevel((z) => Math.min(3.5, +(z + 0.2).toFixed(2)))}
              className="w-8 h-8 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white flex items-center justify-center transition-all cursor-pointer"
              title="Yakınlaş"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Force Intensity Sliders (Collapsible overlay) */}
          <div className="absolute top-3 right-3 bg-slate-950/90 backdrop-blur-md border border-white/10 p-3 rounded-xl text-[10px] space-y-2 max-w-[200px]">
            <div className="flex items-center justify-between text-slate-300 font-bold border-b border-white/5 pb-1">
              <span className="flex items-center gap-1">
                <Sliders className="w-3 h-3 text-purple-400" /> Fizik Parametreleri
              </span>
            </div>

            <div>
              <div className="flex justify-between text-[9px] text-slate-400">
                <span>Mıknatıs İtmesi:</span>
                <span>{Math.abs(chargeStrength)}</span>
              </div>
              <input
                type="range"
                min="-600"
                max="-100"
                value={chargeStrength}
                onChange={(e) => {
                  setChargeStrength(Number(e.target.value));
                  setHeatEnergy(0.8);
                }}
                className="w-full h-1 bg-slate-800 rounded accent-purple-500 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-[9px] text-slate-400">
                <span>Bağ Yay Mesafesi:</span>
                <span>{linkDistance}px</span>
              </div>
              <input
                type="range"
                min="80"
                max="240"
                value={linkDistance}
                onChange={(e) => {
                  setLinkDistance(Number(e.target.value));
                  setHeatEnergy(0.8);
                }}
                className="w-full h-1 bg-slate-800 rounded accent-cyan-500 cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Selected Milestone Side Details (4 cols) */}
        <div className="lg:col-span-4 bg-slate-950 border border-white/10 rounded-2xl p-5 space-y-4 flex flex-col justify-between shadow-2xl">
          {selectedNode ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-purple-300 bg-purple-950/80 px-2.5 py-1 rounded border border-purple-500/30">
                  {selectedNode.category}
                </span>
                <span className="text-xl font-black text-white">{selectedNode.year}</span>
              </div>

              <div className="space-y-1">
                <h3 className="text-base font-bold text-white leading-snug">
                  {selectedNode.title}
                </h3>
                <p className="text-xs text-slate-300 font-sans leading-relaxed">
                  {selectedNode.description}
                </p>
              </div>

              {/* Connected Precursors and Downstream */}
              <div className="space-y-2 pt-2 border-t border-white/5 text-xs">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Bağlı Fizik Düğümleri ({selectedNode.relatedYears?.length || 0}):
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {(selectedNode.relatedYears || []).map((yr, yrIdx) => {
                    const targetM = milestones.find((m) => m.year === yr);
                    return (
                      <button
                        key={`rel-node-yr-${yr}-${yrIdx}`}
                        onClick={() => {
                          if (targetM) {
                            setSelectedNode(targetM);
                            if (onSelectMilestone) onSelectMilestone(targetM);
                          }
                        }}
                        className="px-2 py-1 rounded-lg bg-slate-900 hover:bg-purple-950/80 border border-white/10 text-cyan-300 text-[11px] font-mono transition-all cursor-pointer flex items-center gap-1"
                      >
                        <span>{yr}</span>
                        {targetM && (
                          <span className="text-[9px] text-slate-400 font-sans truncate max-w-[100px]">
                            {targetM.title}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Deep Details Action */}
              {onSelectMilestone && (
                <button
                  onClick={() => onSelectMilestone(selectedNode)}
                  className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white font-bold text-xs transition-all shadow-md shadow-purple-500/20 flex items-center justify-center gap-2 cursor-pointer mt-4"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Tam Detay ve Senaryo Analizini Aç</span>
                </button>
              )}
            </div>
          ) : (
            <div className="p-8 text-center text-slate-500 text-xs font-sans space-y-2">
              <Cpu className="w-8 h-8 mx-auto text-slate-600" />
              <p>Detayları görmek ve ağdaki nedensellik zincirini izlemek için bir düğüme tıklayın.</p>
            </div>
          )}

          {/* Color Legend */}
          <div className="pt-3 border-t border-white/5 text-[10px] text-slate-400">
            <span className="font-bold block mb-1.5 text-slate-300">Renk Kodları:</span>
            <div className="grid grid-cols-2 gap-1.5">
              {Object.entries(CATEGORY_COLORS)
                .filter(([k]) => k !== "default")
                .map(([cat, col], catIdx) => (
                  <div key={`cat-legend-${cat}-${catIdx}`} className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: col }} />
                    <span className="text-[10px]">{cat}</span>
                  </div>
                ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
