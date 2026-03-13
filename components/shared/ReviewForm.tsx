'use client';

import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { reviewsService } from '@/services/reviews.service';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Star, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface ReviewFormProps {
    productId: string;
    onSuccess?: () => void;
    onCancel?: () => void;
}

export function ReviewForm({ productId, onSuccess, onCancel }: ReviewFormProps) {
    const queryClient = useQueryClient();
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [comment, setComment] = useState('');

    const mutation = useMutation({
        mutationFn: reviewsService.submitReview,
        onSuccess: () => {
            toast.success('Đánh giá sản phẩm thành công!');
            setRating(0);
            setComment('');
            queryClient.invalidateQueries({ queryKey: ['order'] });
            queryClient.invalidateQueries({ queryKey: ['product', productId] });
            queryClient.invalidateQueries({ queryKey: ['reviews', productId] });
            if (onSuccess) onSuccess();
        },
        onError: (error: any) => {
            toast.error(error.message || 'Không thể gửi đánh giá.');
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (rating === 0) {
            toast.error('Vui lòng chọn số sao đánh giá.');
            return;
        }
        mutation.mutate({ productId, rating, comment });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Đánh giá của bạn</label>
                <div className="flex gap-1" onMouseLeave={() => setHoverRating(0)}>
                    {[1, 2, 3, 4, 5].map((star) => (
                        <button
                            key={star}
                            type="button"
                            className="focus:outline-none"
                            onMouseEnter={() => setHoverRating(star)}
                            onClick={() => setRating(star)}
                        >
                            <Star
                                className={`h-8 w-8 transition-colors ${
                                    star <= (hoverRating || rating)
                                        ? 'fill-amber-400 text-amber-400'
                                        : 'text-gray-300'
                                }`}
                            />
                        </button>
                    ))}
                </div>
            </div>

            <div>
                <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-2">
                    Nhận xét chi tiết (Tùy chọn)
                </label>
                <Textarea
                    id="comment"
                    placeholder="Hãy chia sẻ cảm nhận của bạn về sản phẩm này nhé..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    rows={4}
                    className="resize-none"
                />
            </div>

            <div className="flex gap-3 justify-end pt-2">
                {onCancel && (
                    <Button type="button" variant="outline" onClick={onCancel} disabled={mutation.isPending}>
                        Hủy
                    </Button>
                )}
                <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700" disabled={mutation.isPending}>
                    {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Gửi Đánh Giá
                </Button>
            </div>
        </form>
    );
}
