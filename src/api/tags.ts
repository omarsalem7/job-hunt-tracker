import { apiClient } from './client';
import type { Tag, CreateTagDto, UpdateTagDto } from '../types';

export const tagsApi = {
    // GET /tags - List all tags for the user
    getAll: async (): Promise<Tag[]> => {
        return apiClient<Tag[]>('/tags');
    },

    // GET /tags/:id - Get a single tag with applications
    getById: async (id: number): Promise<Tag> => {
        return apiClient<Tag>(`/tags/${id}`);
    },

    // POST /tags - Create a new tag
    create: async (data: CreateTagDto): Promise<Tag> => {
        return apiClient<Tag>('/tags', {
            method: 'POST',
            data,
        });
    },

    // PATCH /tags/:id - Update tag name or color
    update: async (id: number, data: UpdateTagDto): Promise<Tag> => {
        return apiClient<Tag>(`/tags/${id}`, {
            method: 'PATCH',
            data,
        });
    },

    // DELETE /tags/:id - Delete a tag
    delete: async (id: number): Promise<void> => {
        return apiClient<void>(`/tags/${id}`, {
            method: 'DELETE',
        });
    },
};
