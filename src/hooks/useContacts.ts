import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { contactsApi } from '../api/contacts';
import type { CreateContactDto, UpdateContactDto } from '../types';

export const CONTACTS_QUERY_KEY = ['contacts'] as const;

export function useContactsQuery() {
    return useQuery({
        queryKey: CONTACTS_QUERY_KEY,
        queryFn: contactsApi.getAll,
    });
}

export function useCreateContact() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (dto: CreateContactDto) => contactsApi.create(dto),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: CONTACTS_QUERY_KEY });
        },
    });
}

export function useUpdateContact() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: string | number; data: UpdateContactDto }) =>
            contactsApi.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: CONTACTS_QUERY_KEY });
        },
    });
}

export function useDeleteContact() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string | number) => contactsApi.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: CONTACTS_QUERY_KEY });
        },
    });
}
