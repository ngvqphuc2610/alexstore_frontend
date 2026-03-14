'use client';

import { useState } from 'react';
import {
    Star,
    Search,
    MoreHorizontal,
    Trash2,
    Eye,
    Filter,
    Loader2,
    AlertCircle
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { formatDate } from '@/lib/constants';
import { CopyableId } from '@/components/shared/CopyableId';
import { Skeleton } from '@/components/ui/skeleton';
import { reviewService } from '@/services/reviewService';
import { toast } from 'sonner';

export default function AdminReviewsPage() {
    const queryClient = useQueryClient();
    const [search, setSearch] = useState('');
    const [sortBy, setSortBy] = useState('newest');
    const [page, setPage] = useState(1);
    const limit = 20;

    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [selectedReview, setSelectedReview] = useState<any>(null);

    // ─── Queries ─────────────────────────────────────────────────────────────
    const { data: response, isLoading, isError } = useQuery({
        queryKey: ['admin-reviews', page, limit, search, sortBy],
        queryFn: () => reviewService.getAllReviews(page, limit, search, sortBy),
    });

    const reviews = response?.data || [];
    const meta = response?.meta || { total: 0, page: 1, limit: 20, totalPages: 1 };
    const stats = response?.stats || { totalReviews: 0, avgRating: 0, positiveCount: 0 };

    // ─── Mutations ───────────────────────────────────────────────────────────
    const deleteMutation = useMutation({
        mutationFn: reviewService.deleteReview,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-reviews'] });
            setDeleteDialogOpen(false);
            toast.success('Đã xóa đánh giá thành công');
        },
        onError: (error: any) => toast.error(error.message),
    });

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
                <p className="text-muted-foreground mt-1">Xem và quản lý tất cả đánh giá sản phẩm từ người mua trên hệ thống</p>
            </div>

            {/* Stats */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card className="border-0 shadow-sm">
                    <CardContent className="pt-6">
                        <div className="text-2xl font-bold">{isLoading ? <Skeleton className="h-8 w-12" /> : stats.totalReviews}</div>
                        <p className="text-xs text-muted-foreground">Tổng đánh giá</p>
                    </CardContent>
                </Card>
                <Card className="border-0 shadow-sm">
                    <CardContent className="pt-6">
                        <div className="text-2xl font-bold text-amber-600 flex items-center gap-2">
                            {isLoading ? <Skeleton className="h-8 w-16" /> : (
                                <>
                                    {stats.avgRating.toFixed(1)}
                                    <Star className="h-5 w-5 fill-amber-400 text-amber-400" />
                                </>
                            )}
                        </div>
                        <p className="text-xs text-muted-foreground">Điểm trung bình hệ thống</p>
                    </CardContent>
                </Card>
                <Card className="border-0 shadow-sm">
                    <CardContent className="pt-6">
                        <div className="text-2xl font-bold text-emerald-600">
                            {isLoading ? <Skeleton className="h-8 w-12" /> : stats.positiveCount}
                        </div>
                        <p className="text-xs text-muted-foreground">Đánh giá tích cực (≥4⭐)</p>
                    </CardContent>
                </Card>
            </div>

            {/* Table & Filters */}
            <Card className="border-0 shadow-md">
                <CardHeader className="pb-4">
                    <div className="flex flex-col sm:flex-row gap-3">
                        <div className="relative max-w-md w-full">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                placeholder="Tìm theo tên sản phẩm hoặc người mua..."
                                className="pl-9"
                                value={search}
                                onChange={(e) => {
                                    setSearch(e.target.value);
                                    setPage(1); // Reset page on search
                                }}
                            />
                        </div>
                        <Select value={sortBy} onValueChange={setSortBy}>
                            <SelectTrigger className="w-full sm:w-[200px]">
                                <Filter className="mr-2 h-4 w-4" />
                                <SelectValue placeholder="Sắp xếp" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="newest">Mới nhất</SelectItem>
                                <SelectItem value="oldest">Cũ nhất</SelectItem>
                                <SelectItem value="rating_high">Đánh giá cao nhất</SelectItem>
                                <SelectItem value="rating_low">Đánh giá thấp nhất</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="space-y-2">
                            {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-12 w-full" />)}
                        </div>
                    ) : isError ? (
                        <div className="flex flex-col items-center justify-center py-10 text-red-500">
                            <AlertCircle className="h-10 w-10 mb-2" />
                            <p>Không thể tải dữ liệu đánh giá. Vui lòng thử lại sau.</p>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[50px]">#</TableHead>
                                    <TableHead className="w-[100px]">ID</TableHead>
                                    <TableHead>Sản phẩm</TableHead>
                                    <TableHead>Người mua</TableHead>
                                    <TableHead>Đánh giá</TableHead>
                                    <TableHead className="min-w-[300px]">Nội dung</TableHead>
                                    <TableHead>Ngày</TableHead>
                                    <TableHead className="text-right">Thao tác</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {reviews.map((review: any, index: number) => {
                                    const actualIndex = (page - 1) * limit + index + 1;
                                    return (
                                        <TableRow key={review.id} className="hover:bg-muted/50">
                                            <TableCell className="font-medium text-muted-foreground">
                                                #{actualIndex}
                                            </TableCell>
                                            <TableCell>
                                                <span className="text-xs text-muted-foreground">ID: {review.id}</span>
                                            </TableCell>
                                            <TableCell className="font-medium max-w-[200px] truncate" title={review.productName}>
                                                {review.productName}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-200 text-xs font-semibold text-slate-700">
                                                        {review.buyer.slice(0, 1).toUpperCase()}
                                                    </div>
                                                    <span className="font-medium text-sm">{review.buyer}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>{renderStars(review.rating)}</TableCell>
                                            <TableCell>
                                                <p className="text-sm line-clamp-2" title={review.comment || ''}>
                                                    {review.comment || <span className="text-muted-foreground italic">Không có nội dung</span>}
                                                </p>
                                            </TableCell>
                                            <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                                                {formatDate(review.createdAt)}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8">
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem
                                                            className="text-red-600 focus:text-red-600"
                                                            onClick={() => { setSelectedReview(review); setDeleteDialogOpen(true); }}
                                                        >
                                                            <Trash2 className="mr-2 h-4 w-4" /> Xóa đánh giá
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                                {reviews.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={8} className="h-32 text-center text-muted-foreground">
                                            Không có đánh giá nào.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    )}

                    {!isLoading && meta.totalPages > 1 && (
                        <div className="mt-4 flex items-center justify-between">
                            <p className="text-sm text-muted-foreground">
                                Hiển thị {(page - 1) * limit + 1} - {Math.min(page * limit, meta.total)} / {meta.total} đánh giá
                            </p>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setPage(p => Math.max(1, p - 1))}
                                    disabled={page === 1}
                                >
                                    Trước
                                </Button>
                                <span className="flex items-center justify-center px-3 text-sm font-medium">
                                    Trang {page} / {meta.totalPages}
                                </span>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setPage(p => Math.min(meta.totalPages, p + 1))}
                                    disabled={page === meta.totalPages}
                                >
                                    Sau
                                </Button>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Delete Dialog */}
            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Xóa đánh giá</DialogTitle>
                        <DialogDescription>
                            Bạn có chắc muốn xóa đánh giá của <span className="font-semibold">{selectedReview?.buyer}</span> trên sản phẩm <span className="font-semibold">{selectedReview?.productName}</span>?
                            <br /><br />
                            Hành động này không thể hoàn tác và sẽ cập nhật lại điểm đánh giá trung bình của sản phẩm.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>Hủy</Button>
                        <Button
                            variant="destructive"
                            onClick={() => selectedReview && deleteMutation.mutate(selectedReview.id)}
                            disabled={deleteMutation.isPending}
                        >
                            {deleteMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Xóa 
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

