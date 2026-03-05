import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getImageUrl(path: string | null | undefined): string {
  if (!path) return '/placeholder-product.png';
  if (path.startsWith('http')) return path;

  // Route through Next.js API proxy to avoid cross-origin issues
  // (Helmet on the backend sets Cross-Origin-Resource-Policy: same-origin)
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `/api/proxy${normalizedPath}`;
}
