// src/api/applications.ts
import { apiClient } from './client';
import type {
    Application,
    Stage,
    CreateApplicationDto,
    UpdateStageDto,
    SetApplicationTagsDto,
    PaginatedResponse,
    NotificationsResponse,
    SnoozeFollowUpDto,
} from '../types';

export type { CreateApplicationDto, UpdateStageDto, SetApplicationTagsDto };

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

    // PUT /applications/:id/tags
    setTags: async (id: string | number, tagIds: number[]): Promise<Application> => {
        return apiClient<Application>(`/applications/${id}/tags`, {
            method: 'PUT',
            data: { tagIds },
        });
    },

    // DELETE /applications/:id
    delete: async (id: string | number): Promise<void> => {
        return apiClient<void>(`/applications/${id}`, {
            method: 'DELETE',
        });
    },

    // GET /applications/notifications
    getNotifications: async (): Promise<NotificationsResponse> => {
        return apiClient<NotificationsResponse>('/applications/notifications');
    },

    // PATCH /applications/:id/followed-up
    markFollowedUp: async (id: string | number): Promise<Application> => {
        return apiClient<Application>(`/applications/${id}/followed-up`, {
            method: 'PATCH',
        });
    },

    // PATCH /applications/:id/snooze
    snoozeFollowUp: async (id: string | number, dto?: SnoozeFollowUpDto): Promise<Application> => {
        return apiClient<Application>(`/applications/${id}/snooze`, {
            method: 'PATCH',
            data: dto,
        });
    },
};
