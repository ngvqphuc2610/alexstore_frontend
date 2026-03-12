'use client';

import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ProfileLayout } from '@/components/shared/ProfileLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, Plus, Edit2, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { addressService } from '@/services/address.service';
import { usersService } from '@/services/users.service';
import { Address, CreateAddressRequest } from '@/types/address.types';
import { toast } from 'sonner';
import { useAuthStore } from '@/stores/authStore';

export default function BuyerAddressesPage() {
    const queryClient = useQueryClient();
    const { user } = useAuthStore();
    
    // UI State
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
    const [migrationDone, setMigrationDone] = useState(false);

    // Form State
    const [fullName, setFullName] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [province, setProvince] = useState('');
    const [district, setDistrict] = useState('');
    const [ward, setWard] = useState('');
    const [addressLine, setAddressLine] = useState('');
    const [isDefault, setIsDefault] = useState(false);

    // Queries
    const { data: addresses = [], isLoading } = useQuery({
        queryKey: ['addresses'],
        queryFn: () => addressService.getAll()
    });

    // Fetch user profile to check legacy address
    const { data: profile } = useQuery({
        queryKey: ['profile'],
        queryFn: usersService.getProfile,
    });

    // Auto-migrate legacy address from User table to Address table
    const migrateMutation = useMutation({
        mutationFn: (data: CreateAddressRequest) => addressService.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['addresses'] });
            setMigrationDone(true);
        },
        onError: () => {
            // Stop retrying on error
            setMigrationDone(true);
        }
    });

    useEffect(() => {
        if (profile && addresses.length === 0 && !isLoading && !migrationDone && !migrateMutation.isPending && profile.address) {
            setMigrationDone(true); // Set immediately to prevent re-fires
            migrateMutation.mutate({
                fullName: user?.username || profile.username || 'Chủ tài khoản',
                addressLine: profile.address,
                isDefault: true
            });
        }
    }, [profile, addresses, isLoading, migrationDone]);

    // Mutations
    const createMutation = useMutation({
        mutationFn: addressService.create,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['addresses'] });
            toast.success('Thêm địa chỉ thành công');
            setIsAddOpen(false);
            resetForm();
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi thêm địa chỉ');
        }
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: string, data: Partial<CreateAddressRequest> }) => addressService.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['addresses'] });
            toast.success('Cập nhật địa chỉ thành công');
            setIsEditOpen(false);
            resetForm();
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi cập nhật địa chỉ');
        }
    });

    const deleteMutation = useMutation({
        mutationFn: addressService.delete,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['addresses'] });
            toast.success('Đã xóa địa chỉ');
            setIsDeleteOpen(false);
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Không thể xóa địa chỉ này');
        }
    });

    const setDefaultMutation = useMutation({
        mutationFn: addressService.setDefault,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['addresses'] });
            toast.success('Đã thiết lập địa chỉ mặc định');
        },
        onError: () => {
            toast.error('Có lỗi xảy ra khi thiết lập mặc định');
        }
    });

    // Handlers
    const resetForm = () => {
        setFullName('');
        setPhoneNumber('');
        setProvince('');
        setDistrict('');
        setWard('');
        setAddressLine('');
        setIsDefault(false);
        setSelectedAddress(null);
    };

    const handleOpenEdit = (address: Address) => {
        setFullName(address.fullName);
        setPhoneNumber(address.phoneNumber);
        setProvince(address.province);
        setDistrict(address.district);
        setWard(address.ward);
        setAddressLine(address.addressLine);
        setIsDefault(address.isDefault);
        setSelectedAddress(address);
        setIsEditOpen(true);
    };

    const handleSave = () => {
        if (!fullName || !addressLine) {
            toast.error('Vui lòng điền ít nhất họ tên và địa chỉ cụ thể');
            return;
        }

        const formData: CreateAddressRequest = {
            fullName, phoneNumber, province, district, ward, addressLine, isDefault
        };

        if (isAddOpen) {
            createMutation.mutate(formData);
        } else if (isEditOpen && selectedAddress) {
            updateMutation.mutate({ id: selectedAddress.id, data: formData });
        }
    };

    return (
        <ProfileLayout>
            <Card className="border-0 shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle className="text-xl">Địa chỉ nhận hàng</CardTitle>
                        <CardDescription>
                            Quản lý các địa chỉ giao hàng của bạn
                        </CardDescription>
                    </div>
                    <Button 
                        onClick={() => { resetForm(); setIsAddOpen(true); }}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2"
                    >
                        <Plus className="h-4 w-4" />
                        Thêm địa chỉ mới
                    </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                    {isLoading ? (
                        <div className="text-center py-10 text-gray-500">Đang tải địa chỉ...</div>
                    ) : addresses.length === 0 ? (
                        <div className="text-center py-12 flex flex-col items-center">
                            <div className="bg-gray-100 rounded-full p-4 mb-4">
                                <MapPin className="h-8 w-8 text-gray-400" />
                            </div>
                            <h3 className="text-lg font-medium text-gray-900">Chưa có địa chỉ</h3>
                            <p className="text-gray-500 max-w-sm mt-2">
                                Bạn chưa thiết lập địa chỉ giao hàng nào. Vui lòng thêm địa chỉ để thuận tiện hơn khi đặt hàng.
                            </p>
                        </div>
                    ) : (
                        addresses.map((addr) => (
                            <div key={addr.id} className="border rounded-lg p-5 flex flex-col sm:flex-row justify-between gap-4">
                                <div className="space-y-2">
                                    <div className="flex items-center gap-3">
                                        <span className="font-medium text-gray-900">{addr.fullName}</span>
                                        {addr.phoneNumber && (
                                            <>
                                                <div className="w-px h-4 bg-gray-300"></div>
                                                <span className="text-gray-600">{addr.phoneNumber}</span>
                                            </>
                                        )}
                                    </div>
                                    <p className="text-gray-600 text-sm">
                                        {[addr.addressLine, addr.ward, addr.district, addr.province].filter(Boolean).join(', ')}
                                    </p>
                                    {addr.isDefault && (
                                        <Badge variant="outline" className="text-indigo-600 border-indigo-200 bg-indigo-50">
                                            Mặc định
                                        </Badge>
                                    )}
                                </div>
                                <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-4 shrink-0">
                                    <div className="flex gap-4">
                                        <button 
                                            onClick={() => handleOpenEdit(addr)}
                                            className="text-indigo-600 hover:text-indigo-800 text-sm font-medium flex items-center gap-1"
                                        >
                                            <Edit2 className="h-3.5 w-3.5" /> Sửa
                                        </button>
                                        {!addr.isDefault && (
                                            <button 
                                                onClick={() => { setSelectedAddress(addr); setIsDeleteOpen(true); }}
                                                className="text-red-500 hover:text-red-700 text-sm font-medium flex items-center gap-1"
                                            >
                                                <Trash2 className="h-3.5 w-3.5" /> Xóa
                                            </button>
                                        )}
                                    </div>
                                    {!addr.isDefault && (
                                        <Button 
                                            variant="outline" size="sm" 
                                            onClick={() => setDefaultMutation.mutate(addr.id)}
                                            className="hidden sm:inline-flex"
                                            disabled={setDefaultMutation.isPending}
                                        >
                                            Thiết lập mặc định
                                        </Button>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </CardContent>
            </Card>

            {/* Add / Edit Dialog */}
            <Dialog open={isAddOpen || isEditOpen} onOpenChange={(open) => {
                if (!open) {
                    setIsAddOpen(false);
                    setIsEditOpen(false);
                }
            }}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{isAddOpen ? 'Thêm Địa Chỉ Mới' : 'Cập Nhật Địa Chỉ'}</DialogTitle>
                        <DialogDescription>Điền thông tin địa chỉ nhận hàng của bạn.</DialogDescription>
                    </DialogHeader>
                    {/* Form fields inlined directly to prevent focus loss */}
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="addr-fullName">Họ và tên</Label>
                                <Input id="addr-fullName" value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Nguyễn Văn A" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="addr-phone">Số điện thoại</Label>
                                <Input id="addr-phone" value={phoneNumber} onChange={e => setPhoneNumber(e.target.value)} placeholder="0901234567" />
                            </div>
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="addr-province">Tỉnh/Thành phố</Label>
                                <Input id="addr-province" value={province} onChange={e => setProvince(e.target.value)} placeholder="TP.HCM" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="addr-district">Quận/Huyện</Label>
                                <Input id="addr-district" value={district} onChange={e => setDistrict(e.target.value)} placeholder="Quận 1" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="addr-ward">Phường/Xã</Label>
                                <Input id="addr-ward" value={ward} onChange={e => setWard(e.target.value)} placeholder="Phường Bến Nghé" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="addr-line">Địa chỉ cụ thể (Số nhà, tên đường)</Label>
                            <Input id="addr-line" value={addressLine} onChange={e => setAddressLine(e.target.value)} placeholder="123 Đường Lê Lợi" />
                        </div>
                        <label className="flex items-center gap-2 mt-2 cursor-pointer">
                            <input 
                                type="checkbox" 
                                className="rounded text-indigo-600 w-4 h-4 cursor-pointer"
                                checked={isDefault}
                                onChange={e => setIsDefault(e.target.checked)}
                                disabled={selectedAddress?.isDefault}
                            />
                            <span className="text-sm font-medium">Đặt làm địa chỉ mặc định</span>
                        </label>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => { setIsAddOpen(false); setIsEditOpen(false); }}>Hủy bỏ</Button>
                        <Button 
                            className="bg-indigo-600 hover:bg-indigo-700 text-white" 
                            onClick={handleSave}
                            disabled={createMutation.isPending || updateMutation.isPending}
                        >
                            Lưu thông tin
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation */}
            <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Xóa địa chỉ</DialogTitle>
                        <DialogDescription>
                            Bạn có chắc chắn muốn xóa địa chỉ này? Hành động này không thể hoàn tác.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>Hủy</Button>
                        <Button 
                            variant="destructive" 
                            onClick={() => {
                                if (selectedAddress) deleteMutation.mutate(selectedAddress.id);
                            }}
                            disabled={deleteMutation.isPending}
                        >
                            Đồng ý xóa
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

        </ProfileLayout>
    );
}
