// src/hooks/useAi.ts
import { useMutation } from '@tanstack/react-query';
import { aiApi } from '../api/ai';
import type { ParsedJobResponse } from '../types';

export function useParseJob() {
    return useMutation<ParsedJobResponse, Error, string>({
        mutationFn: (text: string) => aiApi.parseJob(text),
    });
}

