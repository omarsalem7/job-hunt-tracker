export interface Contact {
    id: string | number;
    userId?: number;
    applicationId?: number | null;
    name: string;
    email?: string | null;
    phone?: string | null;
    role?: string | null;
    linkedInUrl?: string | null;
    notes?: string | null;
    createdAt?: string;
    updatedAt?: string;
    application?: {
        id: number | string;
        company: string;
        role: string;
    } | null;
}

export interface CreateContactDto {
    name: string;
    email?: string;
    phone?: string;
    role?: string;
    linkedInUrl?: string;
    notes?: string;
    applicationId?: number | null;
}

export interface UpdateContactDto extends Partial<CreateContactDto> { }

