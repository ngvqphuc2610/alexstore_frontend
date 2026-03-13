'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
    Laptop,
    Shirt,
    Home,
    Sparkles,
    Dumbbell,
    Gamepad2,
    Cpu,
    Gem,
    BookOpen,
    PawPrint,
    UtensilsCrossed,
    Car,
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { categoriesService } from '@/services/categories.service';
import type { Category } from '@/types';

// Map category name keywords to icons
const getCategoryIcon = (name: string) => {
    const lower = name.toLowerCase();
    if (lower.includes('điện') || lower.includes('tech') || lower.includes('laptop') || lower.includes('computer'))
        return Laptop;
    if (lower.includes('thời trang') || lower.includes('fashion') || lower.includes('quần') || lower.includes('áo'))
        return Shirt;
    if (lower.includes('nhà') || lower.includes('home') || lower.includes('nội thất'))
        return Home;
    if (lower.includes('làm đẹp') || lower.includes('beauty') || lower.includes('mỹ phẩm'))
        return Sparkles;
    if (lower.includes('thể thao') || lower.includes('sport'))
        return Dumbbell;
    if (lower.includes('đồ chơi') || lower.includes('game') || lower.includes('toys'))
        return Gamepad2;
    if (lower.includes('linh kiện') || lower.includes('electronic') || lower.includes('thiết bị'))
        return Cpu;
    if (lower.includes('trang sức') || lower.includes('jewelry') || lower.includes('jewelry'))
        return Gem;
    if (lower.includes('sách') || lower.includes('book'))
        return BookOpen;
    if (lower.includes('thú cưng') || lower.includes('pet'))
        return PawPrint;
    if (lower.includes('thực phẩm') || lower.includes('food') || lower.includes('ăn'))
        return UtensilsCrossed;
    if (lower.includes('xe') || lower.includes('ô tô') || lower.includes('auto'))
        return Car;
    return Sparkles; // default icon
};

const cardVariants = {
    hidden: { opacity: 0, y: 16 },
    visible: (i: number) => ({
        opacity: 1,
        y: 0,
        transition: { delay: i * 0.05, duration: 0.35, ease: 'easeOut' as const },
    }),
};

interface CategoryCardProps {
    category: Category;
    index: number;
}

function CategoryCard({ category, index }: CategoryCardProps) {
    const Icon = getCategoryIcon(category.name);

    return (
        <motion.div
            custom={index}
            variants={cardVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
        >
            <Link
                href={`/products?categoryId=${category.id}`}
                className="flex flex-col items-center gap-2 group"
            >
                <div className="h-14 w-14 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 group-hover:bg-primary/10 group-hover:text-primary transition-all duration-200 group-hover:scale-110">
                    <Icon className="h-6 w-6" />
                </div>
                <span className="text-xs text-center text-gray-600 group-hover:text-primary transition-colors font-medium leading-tight max-w-[72px] truncate">
                    {category.name}
                </span>
            </Link>
        </motion.div>
    );
}

// Static fallback categories for when API hasn't loaded
const FALLBACK_CATEGORIES = [
    { id: 0, name: 'Electronics', parentId: null },
    { id: 0, name: 'Fashion', parentId: null },
    { id: 0, name: 'Home', parentId: null },
    { id: 0, name: 'Beauty', parentId: null },
    { id: 0, name: 'Sports', parentId: null },
    { id: 0, name: 'Toys', parentId: null },
    { id: 0, name: 'Appliances', parentId: null },
    { id: 0, name: 'Jewelry', parentId: null },
    { id: 0, name: 'Books', parentId: null },
    { id: 0, name: 'Pets', parentId: null },
];

export default function CategoryGrid() {
    const { data: categories, isLoading } = useQuery<Category[]>({
        queryKey: ['categories', 'all'],
        queryFn: categoriesService.getAll,
        staleTime: 5 * 60 * 1000, // 5 minutes
    });

    const displayCategories = isLoading
        ? (FALLBACK_CATEGORIES as Category[])
        : (categories?.filter((c) => c.parentId === null).slice(0, 12) ?? FALLBACK_CATEGORIES as Category[]);

    return (
        <section className="py-10 bg-white border-b">
            <div className="container mx-auto px-4 lg:px-8">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-gray-900">Shop by Category</h2>
                    <Link
                        href="/categories"
                        className="text-sm font-medium text-primary hover:underline"
                    >
                        View All
                    </Link>
                </div>

                <div className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-10 lg:grid-cols-12 gap-4">
                    {displayCategories.map((cat, i) => (
                        <CategoryCard key={cat.id || i} category={cat} index={i} />
                    ))}
                </div>
            </div>
        </section>
    );
}
