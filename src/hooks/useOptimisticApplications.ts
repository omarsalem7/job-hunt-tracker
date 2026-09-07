import { useOptimistic, useTransition, useState, useRef, useCallback } from 'react'
import { useAppStore } from '../store/appStore'
import type { Application } from '../lib/types'

type Action = { type: 'remove'; id: string }

export function useOptimisticApplications() {
    const applications = useAppStore((s) => s.applications)
    const deleteApplication = useAppStore((s) => s.deleteApplication)
    const [, startTransition] = useTransition()
    const [pendingIds, setPendingIds] = useState<string[]>([])
    const cancelFns = useRef(new Map<string, () => void>())

    const [optimisticApplications, applyOptimistic] = useOptimistic(
        applications,
        (state: Application[], action: Action) =>
            action.type === 'remove' ? state.filter((a) => a.id !== action.id) : state
    )

    const removeWithUndo = useCallback((id: string) => {
        setPendingIds((ids) => [...ids, id])

        startTransition(async () => {
            applyOptimistic({ type: 'remove', id })

            const wasCancelled = await new Promise<boolean>((resolve) => {
                const timeout = setTimeout(() => resolve(false), 5000)
                cancelFns.current.set(id, () => {
                    clearTimeout(timeout)
                    resolve(true)
                })
            })

            cancelFns.current.delete(id)
            setPendingIds((ids) => ids.filter((pid) => pid !== id))
            if (!wasCancelled) deleteApplication(id)
        })
    }, [])

    const undoRemoval = useCallback((id: string) => {
        cancelFns.current.get(id)?.()
    }, [])

    return { applications, optimisticApplications, pendingIds, removeWithUndo, undoRemoval }
}