'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Search, Filter, Loader2, Tag, Percent, Truck } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { discountService } from '@/services/discount.service';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';

export default function SellerPromotionsPage() {
    const queryClient = useQueryClient();
    const [search, setSearch] = useState('');
    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    
    const [formData, setFormData] = useState({
        code: '', name: '', description: '', type: 'PERCENTAGE', scope: 'SHOP',
        value: 0, minOrderValue: 0, maxDiscountAmount: 0,
        startDate: new Date().toISOString().slice(0, 16),
        endDate: new Date(Date.now() + 30*24*60*60*1000).toISOString().slice(0, 16),
        usageLimit: 100, targetAudience: 'ALL', isPrivate: false
    });

    const { data: rawDiscounts = [], isLoading } = useQuery({
        queryKey: ['seller-discounts'],
        queryFn: discountService.getShopVouchers,
    });

    const discounts = Array.isArray(rawDiscounts) ? rawDiscounts : [];

    const createMutation = useMutation({
        mutationFn: discountService.createShopVoucher,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['seller-discounts'] });
            setCreateDialogOpen(false);
            toast.success('Mã giảm giá đã được tạo');
        },
        onError: (err: any) => toast.error(err.response?.data?.message || err.message || 'Lỗi khi tạo mã'),
    });

    const filtered = discounts.filter((d: any) => d.code?.toLowerCase().includes(search.toLowerCase()) || d.name?.toLowerCase().includes(search.toLowerCase()));

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Khuyến Mãi & Voucher Shop</h1>
                    <p className="text-muted-foreground mt-1">Tạo mã giảm giá công khai hoặc gửi riêng cho khách hàng</p>
                </div>
                <Button onClick={() => setCreateDialogOpen(true)} className="bg-amber-600 hover:bg-amber-700 text-white">
                    <Plus className="mr-2 h-4 w-4" /> Tạo Chương Trình Mới
                </Button>
            </div>

            <Card className="border-0 shadow-md">
                <CardHeader className="pb-4">
                    <div className="flex flex-col sm:flex-row gap-3">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input placeholder="Tìm theo mã code, tên..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="flex justify-center p-8"><Loader2 className="animate-spin h-8 w-8 text-amber-600" /></div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Mã Code</TableHead>
                                    <TableHead>Tên Chương Trình</TableHead>
                                    <TableHead>Loại</TableHead>
                                    <TableHead>Giá trị</TableHead>
                                    <TableHead>Đã dùng</TableHead>
                                    <TableHead>Chế độ</TableHead>
                                    <TableHead>Trạng thái</TableHead>
                                    <TableHead>Hạn sử dụng</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filtered.map((d: any) => (
                                    <TableRow key={d.id}>
                                        <TableCell className="font-bold text-amber-700">{d.code}</TableCell>
                                        <TableCell>{d.name}</TableCell>
                                        <TableCell>
                                            {d.type === 'PERCENTAGE' ? <Badge variant="secondary" className="bg-purple-100 text-purple-700"><Percent className="mr-1 h-3 w-3"/> % Giảm</Badge> 
                                            : <Badge variant="outline"><Tag className="mr-1 h-3 w-3"/> Cố định</Badge>}
                                        </TableCell>
                                        <TableCell>{d.type === 'PERCENTAGE' ? `${d.value}%` : `${Number(d.value).toLocaleString('vi-VN')}₫`}</TableCell>
                                        <TableCell>{d.usedCount} / {d.usageLimit}</TableCell>
                                        <TableCell>
                                            {d.isPrivate ? <Badge variant="secondary" className="bg-gray-100 cursor-help" title="Không hiển thị trên gian hàng. Chỉ thể gửi qua chat.">Riêng tư</Badge> : <Badge className="bg-emerald-500">Công khai</Badge>}
                                        </TableCell>
                                        <TableCell><Badge variant="outline" className={d.status === 'ACTIVE' ? 'border-green-500 text-green-600' : 'border-gray-300'}>{d.status}</Badge></TableCell>
                                        <TableCell className="text-sm">{new Date(d.endDate).toLocaleDateString('vi-VN')}</TableCell>
                                    </TableRow>
                                ))}
                                {filtered.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={8} className="text-center h-24 text-muted-foreground">Hiện chưa có khuyến mãi nào cho cửa hàng của bạn.</TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Tạo Khuyến Mãi Cửa Hàng</DialogTitle>
                        <DialogDescription>Tăng doanh số bằng cách thu hút người mua bằng mã giảm giá hấp dẫn.</DialogDescription>
                    </DialogHeader>
                    <div className="grid grid-cols-2 gap-4 py-4">
                        <div className="space-y-2">
                            <Label>Mã code</Label>
                            <Input value={formData.code} onChange={e => setFormData({...formData, code: e.target.value.toUpperCase()})} placeholder="VD: SALESHOP" />
                        </div>
                        <div className="space-y-2">
                            <Label>Tên Chương Trình Mãi</Label>
                            <Input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="Sale tri ân khách hàng" />
                        </div>
                        
                        <div className="space-y-2 col-span-2 flex items-center justify-between p-3 border rounded-lg bg-amber-50">
                            <div>
                                <Label className="text-amber-900 font-semibold mb-1 block">Voucher Ẩn (Riêng Tư)</Label>
                                <p className="text-xs text-amber-700">Mã sẽ không hiển thị trên trang chủ cửa hàng, chỉ bạn mới có thể gửi cho người mua thông qua kênh chat (Dùng khi chăm sóc khách hàng đặc biệt).</p>
                            </div>
                            <Switch checked={formData.isPrivate} onCheckedChange={(checked) => setFormData({...formData, isPrivate: checked})} />
                        </div>

                        <div className="space-y-2">
                            <Label>Loại giảm giá</Label>
                            <Select value={formData.type} onValueChange={(val) => setFormData({...formData, type: val})}>
                                <SelectTrigger><SelectValue/></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="PERCENTAGE">Phần trăm (%)</SelectItem>
                                    <SelectItem value="FIXED_AMOUNT">Tiền mặt (VNĐ)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Hạn mức giảm ({formData.type === 'PERCENTAGE' ? '%' : '₫'})</Label>
                            <Input type="number" value={formData.value} onChange={e => setFormData({...formData, value: Number(e.target.value)})} />
                        </div>
                        <div className="space-y-2">
                            <Label>Giá trị đơn tối thiểu (₫)</Label>
                            <Input type="number" value={formData.minOrderValue} onChange={e => setFormData({...formData, minOrderValue: Number(e.target.value)})} />
                        </div>
                        <div className="space-y-2">
                            <Label>Giảm tối đa (₫) (Nếu %)</Label>
                            <Input type="number" value={formData.maxDiscountAmount} onChange={e => setFormData({...formData, maxDiscountAmount: Number(e.target.value)})} disabled={formData.type !== 'PERCENTAGE'} />
                        </div>
                        <div className="space-y-2">
                            <Label>Hiệu lực từ</Label>
                            <Input type="datetime-local" value={formData.startDate} onChange={e => setFormData({...formData, startDate: e.target.value})} />
                        </div>
                        <div className="space-y-2">
                            <Label>Kết thúc lúc</Label>
                            <Input type="datetime-local" value={formData.endDate} onChange={e => setFormData({...formData, endDate: e.target.value})} />
                        </div>
                        <div className="space-y-2">
                            <Label>Tổng số lượt dùng</Label>
                            <Input type="number" value={formData.usageLimit} onChange={e => setFormData({...formData, usageLimit: Number(e.target.value)})} />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>Hủy</Button>
                        <Button 
                            className="bg-amber-600 hover:bg-amber-700 text-white"
                            onClick={() => createMutation.mutate({...formData, startDate: new Date(formData.startDate).toISOString(), endDate: new Date(formData.endDate).toISOString()})} 
                            disabled={createMutation.isPending}
                        >
                            {createMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Phát hành Voucher
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
