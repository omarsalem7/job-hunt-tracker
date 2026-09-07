import type { Application, Stage } from './types'

export const dummyApplications: Application[] = [
    { id: '1', company: 'Acme Corp', role: 'Frontend Engineer', stage: 'applied', appliedDate: '2026-08-10' },
    { id: '2', company: 'Globex', role: 'React Developer', stage: 'interview', appliedDate: '2026-08-05' },
    { id: '3', company: 'Initech', role: 'Full-Stack Engineer', stage: 'offer', appliedDate: '2026-07-28' },
]


export function generateDummyApplications(count: number): Application[] {
    const companies = ['Acme', 'Globex', 'Initech', 'Umbrella', 'Stark Industries', 'Wayne Enterprises']
    const roles = ['Frontend Engineer', 'Full-Stack Developer', 'React Developer', 'UI Engineer']
    const stages: Stage[] = ['applied', 'interview', 'offer', 'rejected']

    return Array.from({ length: count }, (_, i) => ({
        id: crypto.randomUUID(),
        company: `${companies[i % companies.length]} ${i}`,
        role: roles[i % roles.length],
        stage: stages[i % stages.length],
        appliedDate: '2026-08-01',
    }))
}