import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { tagsApi } from '../api/tags';
import { APPLICATIONS_QUERY_KEY } from './useApplications';
import type { CreateTagDto, UpdateTagDto } from '../types';

export const TAGS_QUERY_KEY = ['tags'] as const;

// 1. Hook to Fetch All Tags for the User
export function useTagsQuery() {
    return useQuery({
        queryKey: TAGS_QUERY_KEY,
        queryFn: tagsApi.getAll,
    });
}

// 2. Hook to Fetch a Single Tag
export function useTagQuery(id: number) {
    return useQuery({
        queryKey: [...TAGS_QUERY_KEY, id],
        queryFn: () => tagsApi.getById(id),
        enabled: Boolean(id),
    });
}

// 3. Hook to Create a New Tag
export function useCreateTag() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (dto: CreateTagDto) => tagsApi.create(dto),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: TAGS_QUERY_KEY });
        },
    });
}

// 4. Hook to Update an Existing Tag (name, color)
export function useUpdateTag() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: UpdateTagDto }) =>
            tagsApi.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: TAGS_QUERY_KEY });
            // Invalidate applications so updated colors/names immediately reflect on cards
            queryClient.invalidateQueries({ queryKey: APPLICATIONS_QUERY_KEY });
        },
    });
}

// 5. Hook to Delete a Tag
export function useDeleteTag() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: number) => tagsApi.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: TAGS_QUERY_KEY });
            // Deleting a tag detaches it from applications
            queryClient.invalidateQueries({ queryKey: APPLICATIONS_QUERY_KEY });
        },
    });
}
