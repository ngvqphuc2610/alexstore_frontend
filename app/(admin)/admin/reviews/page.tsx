'use client';

import { useState } from 'react';
import {
    Star,
    Search,
    MoreHorizontal,
    Trash2,
    Eye,
    Filter,
} from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { formatDate } from '@/lib/constants';

// ─── Mock Data (1-2 items for testing) ────────────────────────────────────────
const mockReviews = [
    { id: 1, productName: 'iPhone 16 Pro Max 256GB', buyer: 'Nguyễn Văn A', rating: 5, comment: 'Sản phẩm rất tốt, giao hàng nhanh!', createdAt: '2026-03-01T10:00:00Z' },
    { id: 2, productName: 'Samsung Galaxy S25 Ultra', buyer: 'Trần Thị B', rating: 3, comment: 'Tạm ổn, pin hơi yếu.', createdAt: '2026-03-02T14:00:00Z' },
];

export default function AdminReviewsPage() {
    const [search, setSearch] = useState('');
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [selectedReview, setSelectedReview] = useState<typeof mockReviews[0] | null>(null);

    const filteredReviews = mockReviews.filter((review) =>
        review.productName.toLowerCase().includes(search.toLowerCase()) ||
        review.buyer.toLowerCase().includes(search.toLowerCase())
    );

    const renderStars = (rating: number) => (
        <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map((star) => (
                <Star
                    key={star}
                    className={`h-4 w-4 ${star <= rating ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`}
                />
            ))}
        </div>
    );

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Quản lý đánh giá</h1>
                <p className="text-muted-foreground mt-1">Xem và quản lý đánh giá sản phẩm từ người mua</p>
            </div>

            {/* Stats */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card className="border-0 shadow-sm">
                    <CardContent className="pt-6">
                        <div className="text-2xl font-bold">{mockReviews.length}</div>
                        <p className="text-xs text-muted-foreground">Tổng đánh giá</p>
                    </CardContent>
                </Card>
                <Card className="border-0 shadow-sm">
                    <CardContent className="pt-6">
                        <div className="text-2xl font-bold text-amber-600 flex items-center gap-2">
                            {(mockReviews.reduce((sum, r) => sum + r.rating, 0) / mockReviews.length).toFixed(1)}
                            <Star className="h-5 w-5 fill-amber-400 text-amber-400" />
                        </div>
                        <p className="text-xs text-muted-foreground">Điểm trung bình</p>
                    </CardContent>
                </Card>
                <Card className="border-0 shadow-sm">
                    <CardContent className="pt-6">
                        <div className="text-2xl font-bold text-emerald-600">{mockReviews.filter(r => r.rating >= 4).length}</div>
                        <p className="text-xs text-muted-foreground">Đánh giá tích cực (≥4⭐)</p>
                    </CardContent>
                </Card>
            </div>

            {/* Table */}
            <Card className="border-0 shadow-md">
                <CardHeader className="pb-4">
                    <div className="relative max-w-md">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input placeholder="Tìm theo sản phẩm, người mua..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Sản phẩm</TableHead>
                                <TableHead>Người mua</TableHead>
                                <TableHead>Đánh giá</TableHead>
                                <TableHead className="min-w-[300px]">Nội dung</TableHead>
                                <TableHead>Ngày</TableHead>
                                <TableHead className="text-right">Thao tác</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredReviews.map((review) => (
                                <TableRow key={review.id} className="hover:bg-muted/50">
                                    <TableCell className="font-medium">{review.productName}</TableCell>
                                    <TableCell className="text-muted-foreground">{review.buyer}</TableCell>
                                    <TableCell>{renderStars(review.rating)}</TableCell>
                                    <TableCell>
                                        <p className="text-sm line-clamp-2">{review.comment}</p>
                                    </TableCell>
                                    <TableCell className="text-sm text-muted-foreground">{formatDate(review.createdAt)}</TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem>
                                                    <Eye className="mr-2 h-4 w-4" /> Xem chi tiết
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem
                                                    className="text-red-600"
                                                    onClick={() => { setSelectedReview(review); setDeleteDialogOpen(true); }}
                                                >
                                                    <Trash2 className="mr-2 h-4 w-4" /> Xóa đánh giá
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>

                    <div className="mt-4 flex items-center justify-between">
                        <p className="text-sm text-muted-foreground">
                            Hiển thị {filteredReviews.length} / {mockReviews.length} đánh giá
                        </p>
                        <div className="flex gap-2">
                            <Button variant="outline" size="sm" disabled>Trước</Button>
                            <Button variant="outline" size="sm" className="bg-primary text-primary-foreground">1</Button>
                            <Button variant="outline" size="sm" disabled>Sau</Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Delete Dialog */}
            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Xóa đánh giá</DialogTitle>
                        <DialogDescription>
                            Bạn có chắc muốn xóa đánh giá của <span className="font-semibold">{selectedReview?.buyer}</span> trên sản phẩm <span className="font-semibold">{selectedReview?.productName}</span>?
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>Hủy</Button>
                        <Button variant="destructive" onClick={() => setDeleteDialogOpen(false)}>Xóa</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
