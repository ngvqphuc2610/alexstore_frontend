'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Search, Loader2, Tag, Percent, Truck, TicketCheck, Timer, Users } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { discountService } from '@/services/discount.service';
import { toast } from 'sonner';

const TYPE_FILTERS = [
    { value: 'ALL', label: 'Tất cả', icon: Tag },
    { value: 'PERCENTAGE', label: '% Giảm', icon: Percent },
    { value: 'FIXED_AMOUNT', label: 'Cố định', icon: Tag },
    { value: 'FREESHIP', label: 'Freeship', icon: Truck },
];

const STATUS_FILTERS = [
    { value: 'ALL', label: 'Tất cả' },
    { value: 'ACTIVE', label: 'Hoạt động' },
    { value: 'INACTIVE', label: 'Ngừng' },
    { value: 'EXPIRED', label: 'Hết hạn' },
];

const AUDIENCE_FILTERS = [
    { value: 'ALL', label: 'Tất cả', icon: Users },
    { value: 'NEW_USER', label: 'Khách mới' },
    { value: 'VIP_ONLY', label: 'VIP' },
];

export default function AdminDiscountsPage() {
    const queryClient = useQueryClient();
    const [search, setSearch] = useState('');
    const [filterType, setFilterType] = useState('ALL');
    const [filterStatus, setFilterStatus] = useState('ALL');
    const [filterAudience, setFilterAudience] = useState('ALL');
    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const [formData, setFormData] = useState({
        code: '', name: '', description: '', type: 'PERCENTAGE', scope: 'PLATFORM',
        value: 0, minOrderValue: 0, maxDiscountAmount: 0,
        startDate: new Date().toISOString().slice(0, 16),
        endDate: new Date(Date.now() + 30*24*60*60*1000).toISOString().slice(0, 16),
        usageLimit: 100, targetAudience: 'ALL'
    });

    const { data: rawDiscounts = [], isLoading } = useQuery({
        queryKey: ['admin-discounts'],
        queryFn: discountService.getSystemVouchers,
    });
    
    const discounts = Array.isArray(rawDiscounts) ? rawDiscounts : [];

    const createMutation = useMutation({
        mutationFn: discountService.createSystemVoucher,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-discounts'] });
            setCreateDialogOpen(false);
            toast.success('Mã giảm giá đã được tạo');
        },
        onError: (err: any) => toast.error(err.response?.data?.message || err.message || 'Lỗi khi tạo mã'),
    });

    // Apply all filters
    const filtered = discounts.filter((d: any) => {
        const matchSearch = d.code?.toLowerCase().includes(search.toLowerCase()) || d.name?.toLowerCase().includes(search.toLowerCase());
        const matchType = filterType === 'ALL' || d.type === filterType;
        const matchAudience = filterAudience === 'ALL' || d.targetAudience === filterAudience;
        let matchStatus = true;
        if (filterStatus === 'EXPIRED') {
            matchStatus = new Date(d.endDate) < new Date();
        } else if (filterStatus !== 'ALL') {
            matchStatus = d.status === filterStatus && new Date(d.endDate) >= new Date();
        }
        return matchSearch && matchType && matchStatus && matchAudience;
    });

    // Stats
    const totalActive = discounts.filter((d: any) => d.status === 'ACTIVE' && new Date(d.endDate) >= new Date()).length;
    const totalExpired = discounts.filter((d: any) => new Date(d.endDate) < new Date()).length;
    const totalFreeship = discounts.filter((d: any) => d.type === 'FREESHIP').length;
    const totalUsed = discounts.reduce((sum: number, d: any) => sum + (d.usedCount || 0), 0);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Voucher Hệ Thống (Platform)</h1>
                    <p className="text-muted-foreground mt-1">Quản lý mã Freeship, mã giảm giá chung và phân khúc</p>
                </div>
                <Button onClick={() => setCreateDialogOpen(true)}><Plus className="mr-2 h-4 w-4" /> Thêm Mã Mới</Button>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="border-0 shadow-sm bg-gradient-to-br from-emerald-50 to-white">
                    <CardContent className="p-4 flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-emerald-100"><TicketCheck className="w-5 h-5 text-emerald-600" /></div>
                        <div><p className="text-2xl font-bold text-emerald-700">{totalActive}</p><p className="text-xs text-muted-foreground">Đang hoạt động</p></div>
                    </CardContent>
                </Card>
                <Card className="border-0 shadow-sm bg-gradient-to-br from-blue-50 to-white">
                    <CardContent className="p-4 flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-blue-100"><Truck className="w-5 h-5 text-blue-600" /></div>
                        <div><p className="text-2xl font-bold text-blue-700">{totalFreeship}</p><p className="text-xs text-muted-foreground">Mã Freeship</p></div>
                    </CardContent>
                </Card>
                <Card className="border-0 shadow-sm bg-gradient-to-br from-amber-50 to-white">
                    <CardContent className="p-4 flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-amber-100"><Tag className="w-5 h-5 text-amber-600" /></div>
                        <div><p className="text-2xl font-bold text-amber-700">{totalUsed}</p><p className="text-xs text-muted-foreground">Tổng lượt dùng</p></div>
                    </CardContent>
                </Card>
                <Card className="border-0 shadow-sm bg-gradient-to-br from-red-50 to-white">
                    <CardContent className="p-4 flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-red-100"><Timer className="w-5 h-5 text-red-600" /></div>
                        <div><p className="text-2xl font-bold text-red-700">{totalExpired}</p><p className="text-xs text-muted-foreground">Đã hết hạn</p></div>
                    </CardContent>
                </Card>
            </div>

            <Card className="border-0 shadow-md">
                <CardHeader className="pb-4 space-y-4">
                    {/* Search */}
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input placeholder="Tìm theo mã code, tên..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
                    </div>

                    {/* Filter Row: Type */}
                    <div className="space-y-2">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Loại mã</p>
                        <div className="flex flex-wrap gap-2">
                            {TYPE_FILTERS.map(f => (
                                <Button key={f.value} variant={filterType === f.value ? 'default' : 'outline'} size="sm" className="h-8 gap-1.5"
                                    onClick={() => setFilterType(f.value)}>
                                    <f.icon className="w-3.5 h-3.5" /> {f.label}
                                </Button>
                            ))}
                        </div>
                    </div>

                    {/* Filter Row: Status + Audience */}
                    <div className="flex flex-wrap gap-6">
                        <div className="space-y-2">
                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Trạng thái</p>
                            <div className="flex flex-wrap gap-2">
                                {STATUS_FILTERS.map(f => (
                                    <Button key={f.value} variant={filterStatus === f.value ? 'default' : 'outline'} size="sm" className="h-8"
                                        onClick={() => setFilterStatus(f.value)}>
                                        {f.label}
                                    </Button>
                                ))}
                            </div>
                        </div>
                        <div className="space-y-2">
                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Đối tượng</p>
                            <div className="flex flex-wrap gap-2">
                                {AUDIENCE_FILTERS.map(f => (
                                    <Button key={f.value} variant={filterAudience === f.value ? 'default' : 'outline'} size="sm" className="h-8"
                                        onClick={() => setFilterAudience(f.value)}>
                                        {f.label}
                                    </Button>
                                ))}
                            </div>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="flex justify-center p-8"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Mã Code</TableHead>
                                    <TableHead>Tên</TableHead>
                                    <TableHead>Loại</TableHead>
                                    <TableHead>Giá trị</TableHead>
                                    <TableHead>Đã dùng / Tổng</TableHead>
                                    <TableHead>Đối tượng</TableHead>
                                    <TableHead>Trạng thái</TableHead>
                                    <TableHead>Hạn sử dụng</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filtered.map((d: any) => {
                                    const isExpired = new Date(d.endDate) < new Date();
                                    return (
                                        <TableRow key={d.id} className={isExpired ? 'opacity-50' : ''}>
                                            <TableCell className="font-bold">{d.code}</TableCell>
                                            <TableCell>{d.name}</TableCell>
                                            <TableCell>
                                                {d.type === 'FREESHIP' ? <Badge variant="secondary" className="bg-blue-100 text-blue-700"><Truck className="mr-1 h-3 w-3"/> Freeship</Badge> 
                                                : d.type === 'PERCENTAGE' ? <Badge variant="secondary" className="bg-purple-100 text-purple-700"><Percent className="mr-1 h-3 w-3"/> % Giảm</Badge> 
                                                : <Badge variant="outline"><Tag className="mr-1 h-3 w-3"/> Cố định</Badge>}
                                            </TableCell>
                                            <TableCell>{d.type === 'PERCENTAGE' ? `${d.value}%` : d.type === 'FREESHIP' ? 'Miễn phí' : `${Number(d.value).toLocaleString('vi-VN')}₫`}</TableCell>
                                            <TableCell>
                                                <div className="flex flex-col gap-1">
                                                    <span>{d.usedCount} / {d.usageLimit}</span>
                                                    <div className="h-1.5 w-16 bg-gray-100 rounded-full overflow-hidden">
                                                        <div className="h-full bg-primary rounded-full" style={{ width: `${Math.min(100, (d.usedCount / d.usageLimit) * 100)}%` }} />
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                {d.targetAudience === 'NEW_USER' ? <Badge className="bg-orange-500">Mới</Badge> 
                                                : d.targetAudience === 'VIP_ONLY' ? <Badge className="bg-yellow-500 text-black">VIP</Badge> 
                                                : <Badge variant="secondary">Tất cả</Badge>}
                                            </TableCell>
                                            <TableCell>
                                                {isExpired 
                                                    ? <Badge variant="outline" className="border-red-300 text-red-500">Hết hạn</Badge>
                                                    : <Badge variant="outline" className={d.status === 'ACTIVE' ? 'border-green-500 text-green-600' : 'border-gray-300'}>{d.status === 'ACTIVE' ? 'Hoạt động' : d.status}</Badge>
                                                }
                                            </TableCell>
                                            <TableCell className="text-sm">{new Date(d.endDate).toLocaleDateString('vi-VN')}</TableCell>
                                        </TableRow>
                                    );
                                })}
                                {filtered.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={8} className="text-center h-24 text-muted-foreground">
                                            {discounts.length > 0 ? 'Không tìm thấy mã phù hợp với bộ lọc.' : 'Chưa có mã giảm giá nào.'}
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    )}
                    {/* Result count */}
                    {!isLoading && <p className="text-xs text-muted-foreground mt-3 text-right">Hiển thị {filtered.length} / {discounts.length} mã</p>}
                </CardContent>
            </Card>

            <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Tạo Mã Giảm Giá Sàn</DialogTitle>
                    </DialogHeader>
                    <div className="grid grid-cols-2 gap-4 py-4">
                        <div className="space-y-2">
                            <Label>Mã code</Label>
                            <Input value={formData.code} onChange={e => setFormData({...formData, code: e.target.value.toUpperCase()})} placeholder="VD: SUMMER10" />
                        </div>
                        <div className="space-y-2">
                            <Label>Tên / Mô tả ngắn</Label>
                            <Input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="Sale Tháng 8" />
                        </div>
                        <div className="space-y-2">
                            <Label>Loại mã</Label>
                            <Select value={formData.type} onValueChange={(val) => setFormData({...formData, type: val})}>
                                <SelectTrigger><SelectValue/></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="PERCENTAGE">Phần trăm (%)</SelectItem>
                                    <SelectItem value="FIXED_AMOUNT">Tiền mặt (VNĐ)</SelectItem>
                                    <SelectItem value="FREESHIP">Phí vận chuyển (Freeship)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Hạn mức giảm ({formData.type === 'PERCENTAGE' ? '%' : formData.type === 'FREESHIP' ? 'VNĐ tối đa' : '₫'})</Label>
                            <Input type="number" value={formData.value} onChange={e => setFormData({...formData, value: Number(e.target.value)})} placeholder={formData.type === 'FREESHIP' ? 'VD: 30000' : ''} />
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
                            <Label>Từ thời điểm</Label>
                            <Input type="datetime-local" value={formData.startDate} onChange={e => setFormData({...formData, startDate: e.target.value})} />
                        </div>
                        <div className="space-y-2">
                            <Label>Đến hết</Label>
                            <Input type="datetime-local" value={formData.endDate} onChange={e => setFormData({...formData, endDate: e.target.value})} />
                        </div>
                        <div className="space-y-2">
                            <Label>Số suất dùng tối đa</Label>
                            <Input type="number" value={formData.usageLimit} onChange={e => setFormData({...formData, usageLimit: Number(e.target.value)})} />
                        </div>
                        <div className="space-y-2">
                            <Label>Phân khúc được áp dụng</Label>
                            <Select value={formData.targetAudience} onValueChange={(val) => setFormData({...formData, targetAudience: val})}>
                                <SelectTrigger><SelectValue/></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ALL">Tất cả</SelectItem>
                                    <SelectItem value="NEW_USER">Khách hàng mới</SelectItem>
                                    <SelectItem value="VIP_ONLY">Khách hàng VIP</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>Hủy</Button>
                        <Button onClick={() => createMutation.mutate({...formData, startDate: new Date(formData.startDate).toISOString(), endDate: new Date(formData.endDate).toISOString()})} disabled={createMutation.isPending}>
                            {createMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Xuất bản mã
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
