import type { MatchResult } from '../types'

const STOP_WORDS = new Set(['the', 'and', 'a', 'an', 'to', 'of', 'in', 'for', 'with', 'on', 'is', 'are'])

function extractKeywords(text: string): string[] {
    return Array.from(
        new Set(
            text
                .toLowerCase()
                .replace(/[^a-z0-9\s]/g, '')
                .split(/\s+/)
                .filter((word) => word.length > 2 && !STOP_WORDS.has(word))
        )
    )
}

export async function calculateMatchScore(resumeText: string, jobDescription: string): Promise<MatchResult> {
    await new Promise((resolve) => setTimeout(resolve, 800)) // stands in for network latency

    const resumeKeywords = extractKeywords(resumeText)
    const jdKeywords = extractKeywords(jobDescription)

    const matchedKeywords = jdKeywords.filter((word) => resumeKeywords.includes(word))
    const missingKeywords = jdKeywords.filter((word) => !resumeKeywords.includes(word))
    const score = jdKeywords.length === 0 ? 0 : Math.round((matchedKeywords.length / jdKeywords.length) * 100)

    return { score, matchedKeywords, missingKeywords }
}