import type { Category } from '@/types';

/**
 * Transforms a flat list of categories into a linear list ordered by tree hierarchy,
 * computing the depth for UI indentation.
 */
export function buildTreeOptions(categories: Category[], excludeId?: number) {
    const sorted = [...categories].sort((a, b) => a.id - b.id);
    const roots = sorted.filter(c => c.parentId === null);
    const getChildren = (parentId: number) => sorted.filter(c => c.parentId === parentId);

    const items: { id: number; name: string; depth: number }[] = [];

    function walk(cats: Category[], depth: number) {
        for (const cat of cats) {
            if (cat.id === excludeId) continue;
            items.push({ id: cat.id, name: cat.name, depth });
            walk(getChildren(cat.id), depth + 1);
        }
    }

    walk(roots, 0);
    return items;
}
