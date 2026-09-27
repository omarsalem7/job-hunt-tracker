// src/api/applications.ts
import { apiClient } from './client';
import type { Application, Stage } from '../lib/types';

export interface CreateApplicationDto {
    company: string;
    role: string;
    stage: Stage;
    appliedDate: string;
    notes?: string;
}

export interface UpdateStageDto {
    stage: Stage;
}

export interface PaginatedApplicationsResponse {
    data: Application[];
    meta?: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

export const applicationsApi = {
    // GET /applications
    getAll: async (): Promise<Application[]> => {
        const response = await apiClient<PaginatedApplicationsResponse | Application[]>('/applications');
        return Array.isArray(response) ? response : (response.data ?? []);
    },

    // POST /applications
    create: async (data: CreateApplicationDto): Promise<Application> => {
        return apiClient<Application>('/applications', {
            method: 'POST',
            data,
        });
    },

    // PATCH /applications/:id
    updateStage: async (id: string | number, stage: Stage): Promise<Application> => {
        return apiClient<Application>(`/applications/${id}`, {
            method: 'PATCH',
            data: { stage },
        });
    },

    // DELETE /applications/:id
    delete: async (id: string | number): Promise<void> => {
        return apiClient<void>(`/applications/${id}`, {
            method: 'DELETE',
        });
    },
};
