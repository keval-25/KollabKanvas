import React, { useRef, useEffect, useState, useCallback } from 'react';
import rough from 'roughjs';
import { useBoardStore } from '../../hooks/useBoardStore';
import type { BoardElement } from '../../types/board';

interface CanvasRendererProps {
  onElementCreate: (element: BoardElement) => void;
  onElementUpdate: (elementId: string, payload: Record<string, any>) => void;
  onCursorMove: (x: number, y: number) => void;
}

// Simple string hash function for deterministic RoughJS seed (prevents element vibration/jitter)
function getSeed(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash) || 12345;
}

// Compute bounding box for freehand points
function getFreehandBounds(points: [number, number][]) {
  if (!points || points.length === 0) return { x: 0, y: 0, width: 20, height: 20 };
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const [px, py] of points) {
    if (px < minX) minX = px;
    if (py < minY) minY = py;
    if (px > maxX) maxX = px;
    if (py > maxY) maxY = py;
  }
  return {
    x: minX,
    y: minY,
    width: Math.max(maxX - minX, 10),
    height: Math.max(maxY - minY, 10),
  };
}

export const CanvasRenderer: React.FC<CanvasRendererProps> = ({
  onElementCreate,
  onElementUpdate,
  onCursorMove,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const {
    elements,
    activeTool,
    strokeColor,
    fillColor,
    strokeWidth,
    selectedElementId,
    setSelectedElementId,
    userRole,
    deleteElement,
  } = useBoardStore();

  // Drawing & interaction state
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPos, setStartPos] = useState<{ x: number; y: number } | null>(null);
  const [draggedElementId, setDraggedElementId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Pan state for Hand tool
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Ref for high-performance sub-10ms freehand drawing (bypasses React state overhead)
  const activePathRef = useRef<[number, number][]>([]);
  const rafIdRef = useRef<number | null>(null);

  // Text inline editing state
  const [editingElementId, setEditingElementId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState('');
  const [editingPos, setEditingPos] = useState<{ x: number; y: number; width: number; height: number }>({ x: 0, y: 0, width: 150, height: 120 });

  const isReadOnly = userRole === 'VIEWER' || userRole === 'COMMENTER';

  // Handle Window Resize
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      if (canvas) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Get element bounds
  const getElementBounds = (el: BoardElement) => {
    const p = el.props || {};
    if (el.type === 'freehand') {
      return getFreehandBounds(p.points || []);
    }
    return {
      x: p.x || 0,
      y: p.y || 0,
      width: p.width || 100,
      height: p.height || 80,
    };
  };

  // Main Canvas Render Loop
  const renderCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.save();
    ctx.translate(pan.x, pan.y);

    // Get current theme grid color
    const computedStyle = getComputedStyle(document.documentElement);
    const gridColor = computedStyle.getPropertyValue('--canvas-grid-color').trim() || 'rgba(150, 150, 150, 0.1)';
    const defaultThemeStroke = computedStyle.getPropertyValue('--default-stroke').trim() || '#f8fafc';

    // Draw grid pattern
    ctx.fillStyle = gridColor;
    const gridSize = 24;
    const startX = Math.floor(-pan.x / gridSize) * gridSize;
    const startY = Math.floor(-pan.y / gridSize) * gridSize;
    const endX = startX + canvas.width + gridSize;
    const endY = startY + canvas.height + gridSize;

    for (let x = startX; x < endX; x += gridSize) {
      for (let y = startY; y < endY; y += gridSize) {
        ctx.beginPath();
        ctx.arc(x, y, 1.2, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    const rc = rough.canvas(canvas);

    // Render stored elements
    elements.forEach((el) => {
      const p = el.props || {};
      const isSelected = selectedElementId === el.elementId;
      const color = (p.strokeColor === '#f8fafc' || !p.strokeColor) ? defaultThemeStroke : p.strokeColor;
      const fill = (p.fillColor && p.fillColor !== 'transparent') ? p.fillColor : undefined;
      const seed = getSeed(el.elementId);

      const options = {
        stroke: color,
        fill: fill,
        roughness: 1.2,
        strokeWidth: p.strokeWidth || 2,
        seed,
      };

      if (el.type === 'rect') {
        rc.rectangle(p.x || 0, p.y || 0, p.width || 100, p.height || 80, options);
      } else if (el.type === 'ellipse') {
        rc.ellipse((p.x || 0) + (p.width || 80) / 2, (p.y || 0) + (p.height || 80) / 2, p.width || 80, p.height || 80, options);
      } else if (el.type === 'diamond') {
        const x = p.x || 0;
        const y = p.y || 0;
        const w = p.width || 100;
        const h = p.height || 80;
        rc.polygon(
          [
            [x + w / 2, y],
            [x + w, y + h / 2],
            [x + w / 2, y + h],
            [x, y + h / 2],
          ],
          options
        );
      } else if (el.type === 'line') {
        rc.line(p.x || 0, p.y || 0, (p.x || 0) + (p.width || 100), (p.y || 0) + (p.height || 50), options);
      } else if (el.type === 'arrow') {
        const x1 = p.x || 0;
        const y1 = p.y || 0;
        const x2 = x1 + (p.width || 100);
        const y2 = y1 + (p.height || 50);
        rc.line(x1, y1, x2, y2, options);

        // Arrow head calculations
        const angle = Math.atan2(y2 - y1, x2 - x1);
        const headLen = 14;
        rc.line(x2, y2, x2 - headLen * Math.cos(angle - Math.PI / 6), y2 - headLen * Math.sin(angle - Math.PI / 6), options);
        rc.line(x2, y2, x2 - headLen * Math.cos(angle + Math.PI / 6), y2 - headLen * Math.sin(angle + Math.PI / 6), options);
      } else if (el.type === 'freehand' && Array.isArray(p.points)) {
        if (p.points.length > 1) {
          ctx.beginPath();
          ctx.strokeStyle = color;
          ctx.lineWidth = p.strokeWidth || 2;
          ctx.lineCap = 'round';
          ctx.lineJoin = 'round';
          ctx.moveTo(p.points[0][0], p.points[0][1]);
          for (let i = 1; i < p.points.length; i++) {
            ctx.lineTo(p.points[i][0], p.points[i][1]);
          }
          ctx.stroke();
        }
      } else if (el.type === 'text' || el.type === 'sticky') {
        if (el.type === 'sticky') {
          rc.rectangle(p.x || 0, p.y || 0, p.width || 150, p.height || 120, {
            fill: p.fillColor || '#fef08a',
            fillStyle: 'solid',
            stroke: '#ca8a04',
            roughness: 0.8,
            seed,
          });
        }

        if (editingElementId !== el.elementId) {
          ctx.font = '15px "Shantell Sans", sans-serif';
          ctx.fillStyle = el.type === 'sticky' ? '#0f172a' : color;
          const textLines = (p.text || 'Click to edit').split('\n');
          textLines.forEach((line: string, idx: number) => {
            ctx.fillText(line, (p.x || 0) + 12, (p.y || 0) + 28 + idx * 20);
          });
        }
      }

      // Draw bounding box for selected element
      if (isSelected) {
        const bounds = getElementBounds(el);
        ctx.strokeStyle = '#6366f1';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([4, 4]);
        ctx.strokeRect(bounds.x - 4, bounds.y - 4, bounds.width + 8, bounds.height + 8);
        ctx.setLineDash([]);
      }
    });

    // Render active live freehand stroke with sub-10ms latency
    if (activePathRef.current.length > 1) {
      ctx.beginPath();
      ctx.strokeStyle = strokeColor === '#f8fafc' ? defaultThemeStroke : strokeColor;
      ctx.lineWidth = strokeWidth;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.moveTo(activePathRef.current[0][0], activePathRef.current[0][1]);
      for (let i = 1; i < activePathRef.current.length; i++) {
        ctx.lineTo(activePathRef.current[i][0], activePathRef.current[i][1]);
      }
      ctx.stroke();
    }

    ctx.restore();
  }, [elements, selectedElementId, editingElementId, pan, strokeColor, strokeWidth]);

  useEffect(() => {
    renderCanvas();
  }, [renderCanvas]);

  // Handle Mouse Down
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left - pan.x;
    const y = e.clientY - rect.top - pan.y;

    if (editingElementId) {
      saveInlineTextEdit();
    }

    if (activeTool === 'hand') {
      setIsPanning(true);
      setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
      return;
    }

    if (isReadOnly) return;

    if (activeTool === 'eraser') {
      const clicked = [...elements].reverse().find((el) => {
        const bounds = getElementBounds(el);
        return x >= bounds.x - 5 && x <= bounds.x + bounds.width + 5 && y >= bounds.y - 5 && y <= bounds.y + bounds.height + 5;
      });
      if (clicked) {
        deleteElement(clicked.elementId);
      }
      return;
    }

    if (activeTool === 'select') {
      const clicked = [...elements].reverse().find((el) => {
        const bounds = getElementBounds(el);
        return x >= bounds.x - 5 && x <= bounds.x + bounds.width + 5 && y >= bounds.y - 5 && y <= bounds.y + bounds.height + 5;
      });

      if (clicked) {
        // Point 4: Single click selects, second click on already selected text/sticky enters edit mode!
        if (selectedElementId === clicked.elementId && (clicked.type === 'text' || clicked.type === 'sticky')) {
          setEditingElementId(clicked.elementId);
          setEditingText(clicked.props.text || '');
          const bounds = getElementBounds(clicked);
          setEditingPos({ x: bounds.x, y: bounds.y, width: bounds.width || 150, height: bounds.height || 120 });
          return;
        }

        setSelectedElementId(clicked.elementId);
        setDraggedElementId(clicked.elementId);
        const bounds = getElementBounds(clicked);
        setDragOffset({ x: x - bounds.x, y: y - bounds.y });
      } else {
        setSelectedElementId(null);
      }
      return;
    }

    setIsDrawing(true);
    setStartPos({ x, y });

    if (activeTool === 'freehand') {
      activePathRef.current = [[x, y]];
    }
  };

  // Handle Mouse Move
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left - pan.x;
    const y = e.clientY - rect.top - pan.y;

    onCursorMove(x, y);

    if (isPanning) {
      setPan({
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y,
      });
      return;
    }

    if (draggedElementId) {
      const el = elements.find((item) => item.elementId === draggedElementId);
      if (el) {
        if (el.type === 'freehand' && Array.isArray(el.props.points)) {
          const bounds = getFreehandBounds(el.props.points);
          const dx = x - dragOffset.x - bounds.x;
          const dy = y - dragOffset.y - bounds.y;
          const updatedPoints = el.props.points.map(([px, py]) => [px + dx, py + dy]);
          onElementUpdate(draggedElementId, { points: updatedPoints });
        } else {
          const newX = x - dragOffset.x;
          const newY = y - dragOffset.y;
          onElementUpdate(draggedElementId, { x: newX, y: newY });
        }
      }
      return;
    }

    if (!isDrawing || !startPos) return;

    if (activeTool === 'freehand') {
      activePathRef.current.push([x, y]);
      if (!rafIdRef.current) {
        rafIdRef.current = requestAnimationFrame(() => {
          renderCanvas();
          rafIdRef.current = null;
        });
      }
    }
  };

  // Handle Mouse Up
  const handleMouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isPanning) {
      setIsPanning(false);
      return;
    }

    if (draggedElementId) {
      setDraggedElementId(null);
      return;
    }

    if (!isDrawing || !startPos || isReadOnly) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left - pan.x;
    const y = e.clientY - rect.top - pan.y;

    const width = Math.abs(x - startPos.x);
    const height = Math.abs(y - startPos.y);
    const minX = Math.min(startPos.x, x);
    const minY = Math.min(startPos.y, y);

    const elementId = `el-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

    if (activeTool === 'rect' || activeTool === 'ellipse' || activeTool === 'diamond' || activeTool === 'line' || activeTool === 'arrow') {
      const newEl: BoardElement = {
        elementId,
        type: activeTool,
        props: {
          x: minX,
          y: minY,
          width: Math.max(width, 30),
          height: Math.max(height, 30),
          strokeColor,
          fillColor,
          strokeWidth,
        },
        zIndex: elements.length + 1,
        version: 1,
      };
      onElementCreate(newEl);
    } else if (activeTool === 'freehand') {
      if (activePathRef.current.length > 1) {
        const newEl: BoardElement = {
          elementId,
          type: 'freehand',
          props: {
            points: [...activePathRef.current],
            strokeColor,
            strokeWidth,
          },
          zIndex: elements.length + 1,
          version: 1,
        };
        onElementCreate(newEl);
      }
      activePathRef.current = [];
    } else if (activeTool === 'text' || activeTool === 'sticky') {
      const newEl: BoardElement = {
        elementId,
        type: activeTool,
        props: {
          x: minX,
          y: minY,
          width: 150,
          height: 120,
          text: activeTool === 'sticky' ? 'Idea note...' : 'Text note',
          strokeColor,
          fillColor: activeTool === 'sticky' ? '#fef08a' : fillColor,
        },
        zIndex: elements.length + 1,
        version: 1,
      };
      onElementCreate(newEl);

      // Auto enter edit mode on creation for quick text typing
      setEditingElementId(elementId);
      setEditingText(newEl.props.text);
      setEditingPos({ x: minX, y: minY, width: 150, height: 120 });
    }

    setIsDrawing(false);
    setStartPos(null);
  };

  const saveInlineTextEdit = () => {
    if (editingElementId) {
      onElementUpdate(editingElementId, { text: editingText });
      setEditingElementId(null);
    }
  };

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <canvas
        ref={canvasRef}
        width={window.innerWidth}
        height={window.innerHeight}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        style={{
          display: 'block',
          backgroundColor: 'var(--bg-canvas)',
          cursor: activeTool === 'hand' ? (isPanning ? 'grabbing' : 'grab') : activeTool === 'select' ? 'default' : 'crosshair',
        }}
      />

      {/* Inline Text Area for editing sticky notes / text elements */}
      {editingElementId && (
        <textarea
          autoFocus
          value={editingText}
          onChange={(e) => setEditingText(e.target.value)}
          onBlur={saveInlineTextEdit}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              saveInlineTextEdit();
            }
          }}
          style={{
            position: 'absolute',
            left: `${editingPos.x + pan.x + 8}px`,
            top: `${editingPos.y + pan.y + 8}px`,
            width: `${editingPos.width - 16}px`,
            height: `${editingPos.height - 16}px`,
            background: 'rgba(255, 255, 255, 0.95)',
            color: '#0f172a',
            border: '2px solid #6366f1',
            borderRadius: '6px',
            fontFamily: '"Shantell Sans", sans-serif',
            fontSize: '14px',
            padding: '6px',
            outline: 'none',
            resize: 'none',
            zIndex: 50,
          }}
        />
      )}
    </div>
  );
};
