import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  createShareLink,
  getMyShareLinks,
  revokeShareLink,
  getSharedBoard,
} from '../api/share';
import type { CreateShareLinkDto } from '../types/share';

export const SHARE_LINKS_QUERY_KEY = ['share-links'] as const;
export const SHARED_BOARD_QUERY_KEY = ['shared-board'] as const;

export function useShareLinksQuery() {
  return useQuery({
    queryKey: SHARE_LINKS_QUERY_KEY,
    queryFn: getMyShareLinks,
  });
}

export function useCreateShareLinkMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: CreateShareLinkDto) => createShareLink(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SHARE_LINKS_QUERY_KEY });
    },
  });
}

export function useRevokeShareLinkMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => revokeShareLink(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SHARE_LINKS_QUERY_KEY });
    },
  });
}

export function useSharedBoardQuery(token: string | undefined) {
  return useQuery({
    queryKey: [...SHARED_BOARD_QUERY_KEY, token],
    queryFn: () => getSharedBoard(token!),
    enabled: Boolean(token),
    retry: false, // Don't retry if expired or not found
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}
