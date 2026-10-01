import type { Application } from './application';
import type { Contact } from './contact';

export interface ShareLink {
  id: number;
  token: string;
  userId: number;
  includeNotes: boolean;
  includeContacts: boolean;
  expiresAt: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateShareLinkDto {
  includeNotes?: boolean;
  includeContacts?: boolean;
  expiresInDays?: number;
}

export interface SharedApplication extends Application {
  contacts?: Contact[];
}

export interface SharedBoardResponse {
  sharedBy: string;
  settings: {
    includeNotes: boolean;
    includeContacts: boolean;
    expiresAt: string | null;
  };
  board: {
    applied: SharedApplication[];
    interviewing: SharedApplication[];
    offer: SharedApplication[];
    rejected: SharedApplication[];
  };
}
