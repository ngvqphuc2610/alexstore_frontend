'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface HeroSlide {
    id: number;
    tag: string;
    title: string;
    subtitle: string;
    cta: string;
    ctaLink: string;
    bgFrom: string;
    bgTo: string;
    accentColor: string;
}

const slides: HeroSlide[] = [
    {
        id: 1,
        tag: 'Summer Collection 2026',
        title: 'Upgrade Your Lifestyle\nWith Premium Tech',
        subtitle: 'Get up to 40% off on selected multi-vendor electronics and home appliances. Limited time offer.',
        cta: 'Shop Now',
        ctaLink: '/products',
        bgFrom: '#1a1a2e',
        bgTo: '#16213e',
        accentColor: '#0f3460',
    },
    {
        id: 2,
        tag: 'Flash Sale',
        title: 'Deals That Won\'t\nLast Forever',
        subtitle: 'Discover exclusive discounts on fashion, beauty, and lifestyle products from top verified sellers.',
        cta: 'View Deals',
        ctaLink: '/products?sort=discount',
        bgFrom: '#0d1b2a',
        bgTo: '#1b263b',
        accentColor: '#415a77',
    },
    {
        id: 3,
        tag: 'New Arrivals',
        title: 'Explore The Latest\nTrends This Season',
        subtitle: 'Fresh collections added daily from hundreds of verified shops across every category.',
        cta: 'Discover Now',
        ctaLink: '/products?sortBy=createdAt&sortOrder=desc',
        bgFrom: '#1a0533',
        bgTo: '#2d0057',
        accentColor: '#5900b3',
    },
];

export default function HeroCarousel() {
    const [current, setCurrent] = useState(0);
    const [isAutoPlaying, setIsAutoPlaying] = useState(true);

    const next = useCallback(() => {
        setCurrent((prev) => (prev + 1) % slides.length);
    }, []);

    const prev = useCallback(() => {
        setCurrent((prev) => (prev - 1 + slides.length) % slides.length);
    }, []);

    useEffect(() => {
        if (!isAutoPlaying) return;
        const timer = setInterval(next, 5000);
        return () => clearInterval(timer);
    }, [isAutoPlaying, next]);

    const slide = slides[current];

    return (
        <section
            className="relative w-full h-[500px] md:h-[580px] overflow-hidden"
            onMouseEnter={() => setIsAutoPlaying(false)}
            onMouseLeave={() => setIsAutoPlaying(true)}
        >
            <AnimatePresence mode="wait">
                <motion.div
                    key={slide.id}
                    initial={{ opacity: 0, x: 60 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -60 }}
                    transition={{ duration: 0.5, ease: 'easeInOut' }}
                    className="absolute inset-0 flex items-center"
                    style={{ background: `linear-gradient(135deg, ${slide.bgFrom} 0%, ${slide.bgTo} 100%)` }}
                >
                    {/* Decorative shapes */}
                    <div
                        className="absolute right-0 top-0 h-full w-1/2 opacity-20"
                        style={{
                            background: `radial-gradient(ellipse at 80% 50%, ${slide.accentColor}, transparent 70%)`,
                        }}
                    />
                    <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full opacity-10 blur-3xl"
                        style={{ background: slide.accentColor }}
                    />

                    <div className="container mx-auto px-4 lg:px-8 relative z-10">
                        <div className="max-w-xl text-white space-y-5">
                            <motion.span
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                                className="inline-block px-3 py-1 bg-primary text-xs font-bold uppercase rounded-md tracking-wider"
                            >
                                {slide.tag}
                            </motion.span>

                            <motion.h1
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="text-4xl lg:text-5xl font-black leading-tight"
                                style={{ whiteSpace: 'pre-line' }}
                            >
                                {slide.title}
                            </motion.h1>

                            <motion.p
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                                className="text-base text-gray-300 leading-relaxed"
                            >
                                {slide.subtitle}
                            </motion.p>

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4 }}
                                className="flex gap-4 pt-2"
                            >
                                <Button size="lg" asChild className="h-12 px-8 text-base gap-2">
                                    <Link href={slide.ctaLink}>
                                        {slide.cta} <ArrowRight className="h-4 w-4" />
                                    </Link>
                                </Button>
                                <Button
                                    size="lg"
                                    variant="outline"
                                    asChild
                                    className="h-12 px-8 text-base bg-white/10 border-white/30 text-white hover:bg-white/20 hover:text-white"
                                >
                                    <Link href="/products">View Details</Link>
                                </Button>
                            </motion.div>
                        </div>
                    </div>
                </motion.div>
            </AnimatePresence>

            {/* Navigation arrows */}
            <button
                onClick={prev}
                aria-label="Previous slide"
                className="absolute left-4 top-1/2 -translate-y-1/2 z-20 h-10 w-10 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
            >
                <ChevronLeft className="h-5 w-5" />
            </button>
            <button
                onClick={next}
                aria-label="Next slide"
                className="absolute right-4 top-1/2 -translate-y-1/2 z-20 h-10 w-10 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
            >
                <ChevronRight className="h-5 w-5" />
            </button>

            {/* Dots */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2">
                {slides.map((_, i) => (
                    <button
                        key={i}
                        onClick={() => setCurrent(i)}
                        aria-label={`Go to slide ${i + 1}`}
                        className={`h-2 rounded-full transition-all duration-300 ${i === current ? 'w-8 bg-primary' : 'w-2 bg-white/40'}`}
                    />
                ))}
            </div>
        </section>
    );
}
