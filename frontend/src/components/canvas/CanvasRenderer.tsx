import React, { useRef, useEffect, useState } from 'react';
import rough from 'roughjs';
import { useBoardStore } from '../../hooks/useBoardStore';
import type { BoardElement } from '../../types/board';

interface CanvasRendererProps {
  onElementCreate: (element: BoardElement) => void;
  onElementUpdate: (elementId: string, payload: Record<string, any>) => void;
  onCursorMove: (x: number, y: number) => void;
}

export const CanvasRenderer: React.FC<CanvasRendererProps> = ({
  onElementCreate,
  onElementUpdate,
  onCursorMove,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { elements, activeTool, strokeColor, fillColor, strokeWidth, selectedElementId, setSelectedElementId, userRole } = useBoardStore();

  const [isDrawing, setIsDrawing] = useState(false);
  const [startPos, setStartPos] = useState<{ x: number; y: number } | null>(null);
  const [currentPath, setCurrentPath] = useState<[number, number][]>([]);
  const [draggedElementId, setDraggedElementId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const isReadOnly = userRole === 'VIEWER' || userRole === 'COMMENTER';

  // Render canvas elements with RoughJS hand-drawn aesthetic
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const rc = rough.canvas(canvas);

    elements.forEach((el) => {
      const p = el.props || {};
      const isSelected = selectedElementId === el.elementId;
      const color = p.strokeColor || '#f8fafc';
      const fill = p.fillColor !== 'transparent' ? p.fillColor : undefined;

      if (el.type === 'rect') {
        rc.rectangle(p.x || 0, p.y || 0, p.width || 100, p.height || 80, {
          stroke: color,
          fill: fill,
          roughness: 1.2,
          strokeWidth: p.strokeWidth || 2,
        });
      } else if (el.type === 'ellipse') {
        rc.ellipse((p.x || 0) + (p.width || 80) / 2, (p.y || 0) + (p.height || 80) / 2, p.width || 80, p.height || 80, {
          stroke: color,
          fill: fill,
          roughness: 1.2,
          strokeWidth: p.strokeWidth || 2,
        });
      } else if (el.type === 'line' || el.type === 'arrow') {
        rc.line(p.x || 0, p.y || 0, (p.x || 0) + (p.width || 100), (p.y || 0) + (p.height || 50), {
          stroke: color,
          roughness: 1.2,
          strokeWidth: p.strokeWidth || 2,
        });
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
          rc.rectangle(p.x || 0, p.y || 0, p.width || 140, p.height || 120, {
            fill: p.fillColor || '#fef08a',
            fillStyle: 'solid',
            stroke: '#ca8a04',
            roughness: 0.8,
          });
        }
        ctx.font = '16px "Shantell Sans", sans-serif';
        ctx.fillStyle = el.type === 'sticky' ? '#0f172a' : color;
        ctx.fillText(p.text || 'Double-click to edit text', (p.x || 0) + 12, (p.y || 0) + 30);
      }

      // Draw bounding box for selected element
      if (isSelected) {
        ctx.strokeStyle = '#6366f1';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([4, 4]);
        ctx.strokeRect((p.x || 0) - 4, (p.y || 0) - 4, (p.width || 100) + 8, (p.height || 80) + 8);
        ctx.setLineDash([]);
      }
    });
  }, [elements, selectedElementId]);

  // Handle Mouse Down
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || isReadOnly) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (activeTool === 'select') {
      // Find element clicked
      const clicked = [...elements].reverse().find((el) => {
        const p = el.props || {};
        return x >= p.x && x <= p.x + (p.width || 100) && y >= p.y && y <= p.y + (p.height || 80);
      });

      if (clicked) {
        setSelectedElementId(clicked.elementId);
        setDraggedElementId(clicked.elementId);
        setDragOffset({ x: x - (clicked.props.x || 0), y: y - (clicked.props.y || 0) });
      } else {
        setSelectedElementId(null);
      }
      return;
    }

    setIsDrawing(true);
    setStartPos({ x, y });
    if (activeTool === 'freehand') {
      setCurrentPath([[x, y]]);
    }
  };

  // Handle Mouse Move
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    onCursorMove(x, y);

    if (draggedElementId) {
      const newX = x - dragOffset.x;
      const newY = y - dragOffset.y;
      onElementUpdate(draggedElementId, { x: newX, y: newY });
      return;
    }

    if (!isDrawing || !startPos) return;

    if (activeTool === 'freehand') {
      setCurrentPath((prev) => [...prev, [x, y]]);
    }
  };

  // Handle Mouse Up
  const handleMouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (draggedElementId) {
      setDraggedElementId(null);
      return;
    }

    if (!isDrawing || !startPos || isReadOnly) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const width = Math.abs(x - startPos.x);
    const height = Math.abs(y - startPos.y);
    const minX = Math.min(startPos.x, x);
    const minY = Math.min(startPos.y, y);

    const elementId = `el-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;

    if (activeTool === 'rect' || activeTool === 'ellipse') {
      const newEl: BoardElement = {
        elementId,
        type: activeTool,
        props: {
          x: minX,
          y: minY,
          width: Math.max(width, 20),
          height: Math.max(height, 20),
          strokeColor,
          fillColor,
          strokeWidth,
        },
        zIndex: elements.length + 1,
        version: 1,
      };
      onElementCreate(newEl);
    } else if (activeTool === 'freehand') {
      const newEl: BoardElement = {
        elementId,
        type: 'freehand',
        props: {
          points: currentPath,
          strokeColor,
          strokeWidth,
        },
        zIndex: elements.length + 1,
        version: 1,
      };
      onElementCreate(newEl);
    } else if (activeTool === 'text' || activeTool === 'sticky') {
      const newEl: BoardElement = {
        elementId,
        type: activeTool,
        props: {
          x: minX,
          y: minY,
          width: 160,
          height: 120,
          text: activeTool === 'sticky' ? 'Note Idea...' : 'Sample Text',
          strokeColor,
          fillColor: activeTool === 'sticky' ? '#fef08a' : fillColor,
        },
        zIndex: elements.length + 1,
        version: 1,
      };
      onElementCreate(newEl);
    }

    setIsDrawing(false);
    setStartPos(null);
    setCurrentPath([]);
  };

  return (
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
        cursor: activeTool === 'select' ? 'default' : 'crosshair',
      }}
    />
  );
};
