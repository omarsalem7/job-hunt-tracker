import type { Contact, CreateContactDto, PaginatedResponse, UpdateContactDto } from '../types';
import { apiClient } from './client';

export const contactsApi = {
    async getAll(): Promise<Contact[]> {
        const response = await apiClient<PaginatedResponse<Contact> | Contact[]>('/contacts');
        return Array.isArray(response) ? response : (response.data ?? []);
    },
    async getById(id: string | number): Promise<Contact> {
        return apiClient<Contact>(`/contacts/${id}`);
    },
    async create(data: CreateContactDto) {
        return apiClient<Contact>('/contacts', {
            method: 'POST',
            data,
        });
    },
    async update(id: string | number, data: UpdateContactDto) {
        return apiClient<Contact>(`/contacts/${id}`, {
            method: 'PATCH',
            data,
        });
    },
    async delete(id: string | number) {
        return apiClient<void>(`/contacts/${id}`, {
            method: 'DELETE',
        });
    },
};