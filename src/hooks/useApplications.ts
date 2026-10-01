// src/hooks/useApplications.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { applicationsApi, type CreateApplicationDto } from '../api/applications';
import type { Stage } from '../types';

export const APPLICATIONS_QUERY_KEY = ['applications'] as const;

// 1. Hook to Fetch Applications (FR-4)
export function useApplicationsQuery() {
    return useQuery({
        queryKey: APPLICATIONS_QUERY_KEY,
        queryFn: applicationsApi.getAll,
    });
}

// 2. Hook to Create an Application (FR-5)
export function useCreateApplication() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (dto: CreateApplicationDto) => applicationsApi.create(dto),
        onSuccess: () => {
            // Invalidate cache so the board automatically shows the new item!
            queryClient.invalidateQueries({ queryKey: APPLICATIONS_QUERY_KEY });
        },
    });
}

// 3. Hook to Update Application Stage on Drag & Drop (FR-5)
export function useUpdateStage() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, stage }: { id: string | number; stage: Stage }) =>
            applicationsApi.updateStage(id, stage),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: APPLICATIONS_QUERY_KEY });
        },
    });
}

// 4. Hook to Delete an Application (FR-5)
export function useDeleteApplication() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string | number) => applicationsApi.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: APPLICATIONS_QUERY_KEY });
        },
    });
}

// 5. Hook to Set Application Tags
export function useSetApplicationTags() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, tagIds }: { id: string | number; tagIds: number[] }) =>
            applicationsApi.setTags(id, tagIds),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: APPLICATIONS_QUERY_KEY });
            queryClient.invalidateQueries({ queryKey: ['tags'] });
        },
    });
}
