'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery } from '@tanstack/react-query';
import {
    Store,
    ArrowLeft,
    CheckCircle2,
    Clock,
    XCircle,
    Loader2,
    ShieldCheck,
    FileText,
    MapPin,
    Building2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { userService } from '@/services/userService';
import { useAuthStore } from '@/stores/authStore';
import { toast } from 'sonner';
import Link from 'next/link';

export default function BecomeSellerPage() {
    const router = useRouter();
    const { user } = useAuthStore();
    const [formData, setFormData] = useState({
        shopName: '',
        taxCode: '',
        pickupAddress: '',
    });

    // Check current user profile to determine seller status
    const { data: profile, isLoading: profileLoading } = useQuery({
        queryKey: ['user-profile'],
        queryFn: async () => {
            const res = await fetch('/api/proxy/users/me');
            if (!res.ok) throw new Error('Failed to fetch profile');
            return res.json();
        },
    });

    const registerMutation = useMutation({
        mutationFn: () => userService.registerSeller({
            shopName: formData.shopName,
            taxCode: formData.taxCode || undefined,
            pickupAddress: formData.pickupAddress || undefined,
        }),
        onSuccess: () => {
            toast.success('Hồ sơ đăng ký đã được gửi thành công!');
        },
        onError: (error: any) => {
            toast.error(error.message || 'Đã xảy ra lỗi');
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.shopName.trim()) {
            toast.error('Vui lòng nhập tên cửa hàng');
            return;
        }
        registerMutation.mutate();
    };

    if (profileLoading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    // If user is already a seller
    if (user?.role === 'SELLER') {
        return (
            <div className="container mx-auto max-w-2xl py-12 px-4">
                <Card className="border-0 shadow-lg">
                    <CardContent className="flex flex-col items-center gap-4 py-12">
                        <div className="h-16 w-16 rounded-full bg-emerald-100 flex items-center justify-center">
                            <CheckCircle2 className="h-8 w-8 text-emerald-600" />
                        </div>
                        <h2 className="text-2xl font-bold">Bạn đã là Người bán!</h2>
                        <p className="text-muted-foreground text-center max-w-md">
                            Tài khoản của bạn đã được xác nhận là Người bán. Bạn có thể truy cập trang quản lý cửa hàng ngay bây giờ.
                        </p>
                        <Button asChild className="mt-4">
                            <Link href="/seller/dashboard">Đi tới Dashboard Seller</Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const verificationStatus = profile?.sellerProfile?.verificationStatus;

    // PENDING state
    if (verificationStatus === 'PENDING' || registerMutation.isSuccess) {
        return (
            <div className="container mx-auto max-w-2xl py-12 px-4">
                <Card className="border-0 shadow-lg">
                    <CardContent className="flex flex-col items-center gap-4 py-12">
                        <div className="h-16 w-16 rounded-full bg-amber-100 flex items-center justify-center">
                            <Clock className="h-8 w-8 text-amber-600" />
                        </div>
                        <h2 className="text-2xl font-bold">Hồ sơ đang chờ duyệt</h2>
                        <p className="text-muted-foreground text-center max-w-md">
                            Hồ sơ đăng ký Người bán của bạn đã được gửi thành công và đang chờ quản trị viên xét duyệt.
                            Chúng tôi sẽ thông báo cho bạn khi có kết quả.
                        </p>
                        <div className="mt-4 p-4 rounded-lg bg-amber-50 border border-amber-200 text-sm text-amber-800">
                            <p className="font-medium">Tên cửa hàng: {profile?.sellerProfile?.shopName ?? formData.shopName}</p>
                            <p className="mt-1">Trạng thái: <span className="font-medium">Đang chờ duyệt</span></p>
                        </div>
                        <Button variant="outline" asChild className="mt-4">
                            <Link href="/">
                                <ArrowLeft className="mr-2 h-4 w-4" /> Quay lại trang chủ
                            </Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    // REJECTED state — allow re-application
    const isRejected = verificationStatus === 'REJECTED';

    return (
        <div className="container mx-auto max-w-2xl py-12 px-4">
            <div className="mb-8">
                <Button variant="ghost" size="sm" asChild className="mb-4">
                    <Link href="/">
                        <ArrowLeft className="mr-2 h-4 w-4" /> Quay lại
                    </Link>
                </Button>
                <h1 className="text-3xl font-bold tracking-tight">Trở thành Người bán</h1>
                <p className="text-muted-foreground mt-2">
                    Đăng ký để bắt đầu bán hàng trên AlexStore. Hồ sơ của bạn sẽ được xét duyệt bởi quản trị viên.
                </p>
            </div>

            {isRejected && (
                <Card className="border-red-200 bg-red-50 mb-6">
                    <CardContent className="flex items-start gap-3 py-4">
                        <XCircle className="h-5 w-5 text-red-500 mt-0.5 shrink-0" />
                        <div>
                            <p className="font-medium text-red-800">Hồ sơ trước đó đã bị từ chối</p>
                            <p className="text-sm text-red-600 mt-1">
                                Bạn có thể gửi lại hồ sơ với thông tin đã cập nhật bên dưới.
                            </p>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Benefits */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                <Card className="border-0 shadow-sm">
                    <CardContent className="flex flex-col items-center text-center gap-2 pt-6">
                        <Store className="h-8 w-8 text-primary" />
                        <h3 className="font-semibold text-sm">Cửa hàng riêng</h3>
                        <p className="text-xs text-muted-foreground">Tạo và quản lý cửa hàng của riêng bạn</p>
                    </CardContent>
                </Card>
                <Card className="border-0 shadow-sm">
                    <CardContent className="flex flex-col items-center text-center gap-2 pt-6">
                        <Building2 className="h-8 w-8 text-primary" />
                        <h3 className="font-semibold text-sm">Đăng sản phẩm</h3>
                        <p className="text-xs text-muted-foreground">Đăng và quản lý sản phẩm không giới hạn</p>
                    </CardContent>
                </Card>
                <Card className="border-0 shadow-sm">
                    <CardContent className="flex flex-col items-center text-center gap-2 pt-6">
                        <ShieldCheck className="h-8 w-8 text-primary" />
                        <h3 className="font-semibold text-sm">Analytics chi tiết</h3>
                        <p className="text-xs text-muted-foreground">Theo dõi doanh thu và đơn hàng realtime</p>
                    </CardContent>
                </Card>
            </div>

            {/* Registration Form */}
            <Card className="border-0 shadow-lg">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        Thông tin đăng ký
                    </CardTitle>
                    <CardDescription>
                        Điền thông tin bên dưới để gửi hồ sơ đăng ký Người bán
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-2">
                            <Label htmlFor="shopName">Tên cửa hàng <span className="text-red-500">*</span></Label>
                            <Input
                                id="shopName"
                                placeholder="VD: Phuc Store"
                                value={formData.shopName}
                                onChange={(e) => setFormData(prev => ({ ...prev, shopName: e.target.value }))}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="taxCode">Mã số thuế <span className="text-muted-foreground text-xs">(Không bắt buộc)</span></Label>
                            <Input
                                id="taxCode"
                                placeholder="VD: 0123456789"
                                value={formData.taxCode}
                                onChange={(e) => setFormData(prev => ({ ...prev, taxCode: e.target.value }))}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="pickupAddress">
                                <span className="flex items-center gap-1">
                                    <MapPin className="h-3.5 w-3.5" />
                                    Địa chỉ lấy hàng <span className="text-muted-foreground text-xs">(Không bắt buộc)</span>
                                </span>
                            </Label>
                            <Textarea
                                id="pickupAddress"
                                placeholder="VD: 123 Đường ABC, Phường XYZ, Quận 1, TP.HCM"
                                rows={3}
                                value={formData.pickupAddress}
                                onChange={(e) => setFormData(prev => ({ ...prev, pickupAddress: e.target.value }))}
                            />
                        </div>

                        <div className="flex gap-3 pt-4">
                            <Button type="button" variant="outline" asChild className="flex-1">
                                <Link href="/">Hủy</Link>
                            </Button>
                            <Button
                                type="submit"
                                disabled={registerMutation.isPending || !formData.shopName.trim()}
                                className="flex-1"
                            >
                                {registerMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {isRejected ? 'Gửi lại hồ sơ' : 'Gửi hồ sơ đăng ký'}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
