import type { Tag } from './tag';

export type Stage = 'applied' | 'interview' | 'offer' | 'rejected';

export type FollowUpStatus =
    | 'NEEDS_FIRST_FOLLOW_UP'
    | 'NEEDS_SECOND_FOLLOW_UP'
    | 'STALE_GHOSTED';

export interface Application {
    id: string | number;
    userId?: number;
    company: string;
    role: string;
    stage: Stage;
    appliedDate: string;
    notes?: string | null;
    tags?: Tag[];
    lastFollowUpAt?: string | null;
    snoozeFollowUpUntil?: string | null;
    followUpStatus?: FollowUpStatus | null;
    createdAt?: string;
    updatedAt?: string;
}

export interface NotificationsResponse {
    count: number;
    items: Application[];
}

export interface SnoozeFollowUpDto {
    days?: number;
}

export interface CreateApplicationDto {
    company: string;
    role: string;
    stage: Stage;
    appliedDate: string;
    notes?: string;
    tagIds?: number[];
}

export interface UpdateStageDto {
    stage: Stage;
}

export interface SetApplicationTagsDto {
    tagIds: number[];
}
