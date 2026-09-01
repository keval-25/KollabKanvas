export type ToolType =
  | 'select'
  | 'freehand'
  | 'rect'
  | 'ellipse'
  | 'line'
  | 'arrow'
  | 'text'
  | 'sticky'
  | 'image'
  | 'eraser';

export type StrokeStyle = 'solid' | 'dashed' | 'dotted';

export interface CursorPos {
  userId: string;
  userName: string;
  color: string;
  x: number;
  y: number;
}

export interface PresenceUser {
  userId: string;
  userName: string;
  avatarUrl?: string;
}
