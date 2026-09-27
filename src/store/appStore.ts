import { create } from 'zustand'
import type { Application, Stage } from '../types'
import { persist } from 'zustand/middleware'

interface AppStore {
    applications: Application[]
    addApplication: (app: Omit<Application, 'id'>) => void
    updateStage: (id: string, stage: Stage) => void
    deleteApplication: (id: string) => void
}

export const useAppStore = create<AppStore>()(persist((set) => ({
    applications: [],

    addApplication: (app) =>
        set((state) => ({
            applications: [...state.applications, { ...app, id: crypto.randomUUID() }],
        })),

    updateStage: (id, stage) =>
        set((state) => ({
            applications: state.applications.map((a) => (a.id === id ? { ...a, stage } : a)),
        })),

    deleteApplication: (id) =>
        set((state) => ({
            applications: state.applications.filter((a) => a.id !== id),
        })),
}),
    { name: 'job-hunt-storage' }
))