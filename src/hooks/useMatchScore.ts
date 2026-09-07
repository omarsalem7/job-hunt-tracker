import { useState, useCallback } from 'react'
import { calculateMatchScore } from '../lib/matchScore'
import type { MatchResult } from '../lib/types'

type Status = 'idle' | 'loading' | 'success' | 'error'

export function useMatchScore() {
    const [status, setStatus] = useState<Status>('idle')
    const [data, setData] = useState<MatchResult | null>(null)
    const [error, setError] = useState<string | null>(null)

    const scoreMatch = useCallback(async (resumeText: string, jobDescription: string) => {
        setStatus('loading')
        setError(null)
        try {
            const result = await calculateMatchScore(resumeText, jobDescription)
            setData(result)
            setStatus('success')
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Something went wrong')
            setStatus('error')
        }
    }, [])

    return { status, data, error, scoreMatch }
}