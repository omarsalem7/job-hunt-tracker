import type { Stage } from './application';

export interface ParseJobRequest {
    text: string;
}

export interface ParsedJobResponse {
    company: string;
    role: string;
    stage: Stage;
    notes: string;
}

