export interface Contact {
    id: string | number;
    applicationId?: string | number;
    name: string;
    email?: string;
    phone?: string;
    company?: string;
    role?: string;
    linkedIn?: string;
    notes?: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface CreateContactDto {
    applicationId?: string | number;
    name: string;
    email?: string;
    phone?: string;
    company?: string;
    role?: string;
    linkedIn?: string;
    notes?: string;
}

export interface UpdateContactDto extends Partial<CreateContactDto> {}
