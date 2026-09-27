// src/api/applications.ts
import { apiClient } from './client';
import type {
    Application,
    Stage,
    CreateApplicationDto,
    UpdateStageDto,
    PaginatedResponse,
} from '../types';

export type { CreateApplicationDto, UpdateStageDto };

export const applicationsApi = {
    // GET /applications
    getAll: async (): Promise<Application[]> => {
        const response = await apiClient<PaginatedResponse<Application> | Application[]>('/applications');
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
