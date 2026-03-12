import api from './api';
import { Address, CreateAddressRequest, UpdateAddressRequest } from '@/types/address.types';

export const addressService = {
    getAll: async (includeDeleted: boolean = false): Promise<Address[]> => {
        return api.get(`/addresses`, { params: { includeDeleted } });
    },

    create: async (data: CreateAddressRequest): Promise<Address> => {
        return api.post('/addresses', data);
    },

    update: async (id: string, data: UpdateAddressRequest): Promise<Address> => {
        return api.put(`/addresses/${id}`, data);
    },

    setDefault: async (id: string): Promise<Address> => {
        return api.patch(`/addresses/${id}/set-default`);
    },

    delete: async (id: string): Promise<{ success: boolean }> => {
        return api.delete(`/addresses/${id}`);
    }
};
