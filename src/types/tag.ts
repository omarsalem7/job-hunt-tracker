export interface Tag {
    id: number;
    userId: number;
    name: string;
    color: string;
    createdAt?: string;
    updatedAt?: string;
    _count?: {
        applications: number;
    };
}

export interface CreateTagDto {
    name: string;
    color?: string;
}

export interface UpdateTagDto extends Partial<Tag> {
}
