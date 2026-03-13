import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface RecentlyViewedItem {
    id: string;
    name: string;
    price: number;
    imageUrl: string | null;
    categoryId: number;
}

interface RecentlyViewedState {
    items: RecentlyViewedItem[];
    categoryHistory: Record<number, number>; // categoryId -> count
    addItem: (item: RecentlyViewedItem) => void;
    clearAll: () => void;
    getTopCategories: (limit: number) => number[];
}

const MAX_ITEMS = 12;

export const useRecentlyViewedStore = create<RecentlyViewedState>()(
    persist(
        (set, get) => ({
            items: [],
            categoryHistory: {},

            addItem: (item) =>
                set((state) => {
                    // Update item history
                    const filtered = state.items.filter((i) => i.id !== item.id);
                    const newItems = [item, ...filtered].slice(0, MAX_ITEMS);

                    // Update category frequency
                    const newHistory = { ...state.categoryHistory };
                    newHistory[item.categoryId] = (newHistory[item.categoryId] || 0) + 1;

                    return { 
                        items: newItems,
                        categoryHistory: newHistory
                    };
                }),

            clearAll: () => set({ items: [], categoryHistory: {} }),

            getTopCategories: (limit) => {
                const history = get().categoryHistory;
                return Object.entries(history)
                    .sort(([, a], [, b]) => b - a)
                    .slice(0, limit)
                    .map(([id]) => Number(id));
            },
        }),
        {
            name: 'alexstore-recently-viewed',
        }
    )
);
