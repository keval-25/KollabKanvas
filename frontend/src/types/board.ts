export interface BoardElement {
  elementId: string;
  type: 'rect' | 'ellipse' | 'diamond' | 'line' | 'arrow' | 'freehand' | 'text' | 'sticky' | 'image';
  props: Record<string, any>;
  zIndex: number;
  version: number;
  lastEditedBy?: string;
  lastEditedAt?: string;
}

export interface Collaborator {
  userId: string;
  role: 'OWNER' | 'EDITOR' | 'COMMENTER' | 'VIEWER';
  addedAt: string;
}

export interface ShareLink {
  token: string;
  defaultRole: string;
  expiresAt?: string;
}

export interface Board {
  id: string;
  name: string;
  ownerId: string;
  ownerName: string;
  role: 'OWNER' | 'EDITOR' | 'COMMENTER' | 'VIEWER';
  elementsCount: number;
  collaboratorsCount: number;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
  elements?: BoardElement[];
  collaborators?: Collaborator[];
  shareLink?: ShareLink;
}

export interface CreateBoardPayload {
  name: string;
  template?: string;
}
