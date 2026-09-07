import { z } from 'zod'

export const applicationSchema = z.object({
    company: z.string().min(1, 'Company is required'),
    role: z.string().min(1, 'Role is required'),
    stage: z.enum(['applied', 'interview', 'offer', 'rejected']),
    appliedDate: z.string().min(1, 'Date is required'),
    notes: z.string().optional(),
})

export type ApplicationFormValues = z.infer<typeof applicationSchema>