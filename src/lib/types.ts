export type Stage = 'applied' | 'interview' | 'offer' | 'rejected'

export interface Application {
    id: string
    company: string
    role: string
    stage: Stage
    appliedDate: string
    notes?: string
}

export interface MatchResult {
    score: number
    matchedKeywords: string[]
    missingKeywords: string[]
}