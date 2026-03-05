import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getImageUrl(path: string | null | undefined): string {
  if (!path) return '/placeholder-product.png';
  if (path.startsWith('http')) return path;
  const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '') || 'http://localhost:8080';
  return `${baseUrl}${path.startsWith('/') ? '' : '/'}${path}`;
}
