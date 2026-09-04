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

  // Inline editing state for text / sticky note elements
  const [editingElementId, setEditingElementId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState('');
  const [editingPos, setEditingPos] = useState<{ x: number; y: number; width: number; height: number }>({ x: 0, y: 0, width: 140, height: 100 });

  const isReadOnly = userRole === 'VIEWER' || userRole === 'COMMENTER';

  // Handle window resizing
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

  // Render canvas elements with RoughJS hand-drawn aesthetic & grid background
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Get current theme canvas grid color from computed CSS properties
    const computedStyle = getComputedStyle(document.documentElement);
    const gridColor = computedStyle.getPropertyValue('--canvas-grid-color').trim() || 'rgba(150, 150, 150, 0.1)';
    const defaultThemeStroke = computedStyle.getPropertyValue('--default-stroke').trim() || '#f8fafc';

    // Draw background grid dots
    ctx.fillStyle = gridColor;
    const gridSize = 24;
    for (let x = 12; x < canvas.width; x += gridSize) {
      for (let y = 12; y < canvas.height; y += gridSize) {
        ctx.beginPath();
        ctx.arc(x, y, 1.2, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    const rc = rough.canvas(canvas);

    elements.forEach((el) => {
      const p = el.props || {};
      const isSelected = selectedElementId === el.elementId;
      // Fallback stroke color if default theme color
      const color = (p.strokeColor === '#f8fafc' || !p.strokeColor) ? defaultThemeStroke : p.strokeColor;
      const fill = (p.fillColor && p.fillColor !== 'transparent') ? p.fillColor : undefined;

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
          rc.rectangle(p.x || 0, p.y || 0, p.width || 150, p.height || 120, {
            fill: p.fillColor || '#fef08a',
            fillStyle: 'solid',
            stroke: '#ca8a04',
            roughness: 0.8,
          });
        }

        if (editingElementId !== el.elementId) {
          ctx.font = '15px "Shantell Sans", sans-serif';
          ctx.fillStyle = el.type === 'sticky' ? '#0f172a' : color;
          const textLines = (p.text || 'Double-click to edit text').split('\n');
          textLines.forEach((line: string, idx: number) => {
            ctx.fillText(line, (p.x || 0) + 12, (p.y || 0) + 28 + (idx * 20));
          });
        }
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
  }, [elements, selectedElementId, editingElementId]);

  // Handle Mouse Down
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || isReadOnly) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (editingElementId) {
      saveInlineTextEdit();
    }

    if (activeTool === 'select') {
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

    const elementId = `el-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

    if (activeTool === 'rect' || activeTool === 'ellipse') {
      const newEl: BoardElement = {
        elementId,
        type: activeTool,
        props: {
          x: minX,
          y: minY,
          width: Math.max(width, 40),
          height: Math.max(height, 40),
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
          width: 150,
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

  // Handle Double Click to edit text / sticky notes
  const handleDoubleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isReadOnly) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const clicked = [...elements].reverse().find((el) => {
      if (el.type !== 'text' && el.type !== 'sticky') return false;
      const p = el.props || {};
      return x >= p.x && x <= p.x + (p.width || 150) && y >= p.y && y <= p.y + (p.height || 120);
    });

    if (clicked) {
      setEditingElementId(clicked.elementId);
      setEditingText(clicked.props.text || '');
      setEditingPos({
        x: clicked.props.x || x,
        y: clicked.props.y || y,
        width: clicked.props.width || 150,
        height: clicked.props.height || 120,
      });
    }
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
        onDoubleClick={handleDoubleClick}
        style={{
          display: 'block',
          backgroundColor: 'var(--bg-canvas)',
          cursor: activeTool === 'select' ? 'default' : 'crosshair',
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
            left: `${editingPos.x + 8}px`,
            top: `${editingPos.y + 8}px`,
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
