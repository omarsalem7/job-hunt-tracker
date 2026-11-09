// src/api/ai.ts
import { apiClient } from './client';
import type { ParseJobRequest, ParsedJobResponse } from '../types';

export const aiApi = {
    // POST /ai/parse-job
    parseJob: async (data: ParseJobRequest | string): Promise<ParsedJobResponse> => {
        const payload = typeof data === 'string' ? { text: data } : data;
        return apiClient<ParsedJobResponse>('/ai/parse-job', {
            method: 'POST',
            data: payload,
        });
    },
};

