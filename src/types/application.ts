import type { Tag } from './tag';

export type Stage = 'applied' | 'interview' | 'offer' | 'rejected';

export interface Application {
    id: string | number;
    userId?: number;
    company: string;
    role: string;
    stage: Stage;
    appliedDate: string;
    notes?: string | null;
    tags?: Tag[];
    createdAt?: string;
    updatedAt?: string;
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
