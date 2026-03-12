export interface Address {
    id: string;
    userId: string;
    fullName: string;
    phoneNumber: string;
    province: string;
    district: string;
    ward: string;
    addressLine: string;
    isDefault: boolean;
    isDeleted: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface CreateAddressRequest {
    fullName: string;
    phoneNumber?: string;
    province?: string;
    district?: string;
    ward?: string;
    addressLine: string;
    isDefault?: boolean;
}

export interface UpdateAddressRequest extends Partial<CreateAddressRequest> {}
