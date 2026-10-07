// src/hooks/useNotifications.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { applicationsApi } from '../api/applications';
import { APPLICATIONS_QUERY_KEY } from './useApplications';

export const NOTIFICATIONS_QUERY_KEY = ['notifications'] as const;

export function useNotificationsQuery() {
    return useQuery({
        queryKey: NOTIFICATIONS_QUERY_KEY,
        queryFn: applicationsApi.getNotifications,
        refetchOnWindowFocus: true,
        refetchInterval: 60 * 1000, // Poll every minute to keep follow-up radar active
    });
}

export function useMarkFollowedUp() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string | number) => applicationsApi.markFollowedUp(id),
        onSuccess: () => {
            // Invalidate both notifications and board applications to keep views in sync
            queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_QUERY_KEY });
            queryClient.invalidateQueries({ queryKey: APPLICATIONS_QUERY_KEY });
        },
    });
}

export function useSnoozeFollowUp() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, days = 7 }: { id: string | number; days?: number }) =>
            applicationsApi.snoozeFollowUp(id, { days }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_QUERY_KEY });
            queryClient.invalidateQueries({ queryKey: APPLICATIONS_QUERY_KEY });
        },
    });
}
