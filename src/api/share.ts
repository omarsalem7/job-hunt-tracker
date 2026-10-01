import { apiClient } from './client';
import type {
  ShareLink,
  CreateShareLinkDto,
  SharedBoardResponse,
} from '../types/share';

export async function createShareLink(
  dto: CreateShareLinkDto
): Promise<ShareLink> {
  return apiClient<ShareLink>('/share', {
    method: 'POST',
    data: dto,
  });
}

export async function getMyShareLinks(): Promise<ShareLink[]> {
  return apiClient<ShareLink[]>('/share');
}

export async function revokeShareLink(
  id: number
): Promise<{ message: string }> {
  return apiClient<{ message: string }>(`/share/${id}`, {
    method: 'DELETE',
  });
}

export async function getSharedBoard(
  token: string
): Promise<SharedBoardResponse> {
  return apiClient<SharedBoardResponse>(`/share/${token}`);
}
