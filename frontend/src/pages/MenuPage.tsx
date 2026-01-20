import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion'; // Animation library
import { Search, ChefHat, ShoppingBag, FilterX, TrendingUp } from 'lucide-react'; // Icons

import { guestApi } from '../api/guestApi';
import { Category, MenuItem } from '../types';
import ItemModal from '../components/ItemModal';
import CartModal from '../components/CartModal';
import { useCartStore } from '../store/useCartStore';
import { useDebounce } from '../hooks/useDebounce';
import { Footer } from '../components/common/Footer';
import { Header } from '../components/common/Header';

export default function MenuPage() {
  // --- 1. STATE & HOOKS ---
  const [searchParams, setSearchParams] = useSearchParams();

  // Data State
  const [categories, setCategories] = useState<Category[]>([]);
  const [items, setItems] = useState<MenuItem[]>([]);

  // Filter State (Lấy từ URL nếu có)
  const [searchText, setSearchText] = useState(searchParams.get('q') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('cat') || 'all');
  const [isChefFilter, setIsChefFilter] = useState(searchParams.get('chef') === 'true');
  const [sortBy, setSortBy] = useState<'default' | 'popular'>(
    (searchParams.get('sort') as 'default' | 'popular') || 'default'
  );

  // Pagination State - Load initial page from URL if present
  const initialPage = parseInt(searchParams.get('page') || '1', 10);
  const [page, setPage] = useState(initialPage > 0 ? initialPage : 1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [totalPages, setTotalPages] = useState(1);

  // Debounce search input (500ms)
  const debouncedSearch = useDebounce(searchText, 500);

  // Modal & Cart State
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const totalCartItems = useCartStore(state => state.items.reduce((acc, i) => acc + i.quantity, 0));

  // --- 2. EFFECTS ---

  // Load Categories lúc đầu
  useEffect(() => {
    guestApi.getCategories().then(res => {
      const response = res as any;
      setCategories(response.data || []);
    });
  }, []);

  // Sync Filter -> URL & Reset List
  useEffect(() => {
    const params: any = {};
    if (debouncedSearch) params.q = debouncedSearch;
    if (selectedCategory !== 'all') params.cat = selectedCategory;
    if (isChefFilter) params.chef = 'true';
    if (sortBy !== 'default') params.sort = sortBy;
    // Include page in URL for pagination
    if (page > 1) params.page = page.toString();
    setSearchParams(params, { replace: true });
  }, [debouncedSearch, selectedCategory, isChefFilter, sortBy, page, setSearchParams]);

  // Reset list when filters change (not page)
  const prevFiltersRef = useRef({ debouncedSearch, selectedCategory, isChefFilter, sortBy });
  useEffect(() => {
    const prevFilters = prevFiltersRef.current;
    const filtersChanged =
      prevFilters.debouncedSearch !== debouncedSearch ||
      prevFilters.selectedCategory !== selectedCategory ||
      prevFilters.isChefFilter !== isChefFilter ||
      prevFilters.sortBy !== sortBy;

    if (filtersChanged) {
      setItems([]);
      setPage(1);
      setHasMore(true);
      prevFiltersRef.current = { debouncedSearch, selectedCategory, isChefFilter, sortBy };
    }
  }, [debouncedSearch, selectedCategory, isChefFilter, sortBy]);

  // Load Items (Pagination)
  useEffect(() => {
    const fetchItems = async () => {
      setLoading(true);
      try {
        const res = await guestApi.getMenuItems({
          page,
          limit: 10,
          search: debouncedSearch,
          categoryId: selectedCategory === 'all' ? undefined : selectedCategory,
          isChefRecommended: isChefFilter,
          sortBy
        });

        const responseData = res as any;
        const newItems = responseData.data || [];
        // Deduplicate items to prevent duplicate key errors
        setItems(prev => {
          if (page === 1) return newItems;
          const existingIds = new Set(prev.map(item => item.id));
          const uniqueNewItems = newItems.filter((item: MenuItem) => !existingIds.has(item.id));
          return [...prev, ...uniqueNewItems];
        });
        // Calculate hasMore from pagination
        const pagination = responseData.pagination;
        if (pagination) {
          setTotalPages(pagination.totalPages);
          setHasMore(page < pagination.totalPages);
        } else {
          setHasMore(false);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, [page, debouncedSearch, selectedCategory, isChefFilter, sortBy]);

  // --- 3. INFINITE SCROLL OBSERVER ---
  const observer = useRef<IntersectionObserver | null>(null);
  const lastItemRef = useCallback((node: HTMLDivElement) => {
    if (loading) return;
    if (observer.current) observer.current.disconnect();

    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        setPage(prev => prev + 1);
      }
    });
    if (node) observer.current.observe(node);
  }, [loading, hasMore]);

  // --- 4. RENDER ---
  return (
    <div className="max-w-md mx-auto bg-gray-50 min-h-screen pb-24 flex flex-col">
      <Header />

      {/* HEADER STICKY */}
      <header className="bg-white shadow-sm sticky top-[65px] z-20">
        {/* Top Bar: Brand & Search */}
        <div className="p-4 pb-2 space-y-3">
          <div className="flex justify-between items-center">
            <h1 className="text-xl font-black text-gray-800 tracking-tight">Smart<span className="text-orange-600">Food</span></h1>

            <div className="flex gap-2">
              <Link to="/tracking" className="p-2 rounded-full bg-gray-50 border border-gray-200 text-gray-400">
                <ShoppingBag size={20} />
              </Link>
              {/* Nút lọc Chef */}
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsChefFilter(!isChefFilter)}
                className={`p-2 rounded-full border transition-colors ${isChefFilter ? 'bg-orange-100 border-orange-500 text-orange-600 shadow-inner' : 'bg-gray-50 border-gray-200 text-gray-400'}`}
              >
                <ChefHat size={20} strokeWidth={isChefFilter ? 2.5 : 2} />
              </motion.button>

              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => setSortBy(prev => prev === 'default' ? 'popular' : 'default')}
                className={`p-2 rounded-full border transition-colors ${sortBy === 'popular' ? 'bg-blue-100 border-blue-500 text-blue-600 shadow-inner' : 'bg-gray-50 border-gray-200 text-gray-400'}`}
                title="Sort by popularity"
              >
                <TrendingUp size={20} strokeWidth={sortBy === 'popular' ? 2.5 : 2} />
              </motion.button>
            </div>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="What are you craving?..."
              className="w-full bg-gray-100 pl-10 pr-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
            {searchText && (
              <button onClick={() => setSearchText('')} className="absolute right-3 top-2.5 text-gray-400">
                <FilterX size={16} />
              </button>
            )}
          </div>
        </div>

        {/* Categories Horizontal Scroll */}
        <div className="flex gap-2 overflow-x-auto px-4 pb-3 no-scrollbar scroll-smooth">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setSelectedCategory('all')}
            className={`whitespace-nowrap px-4 py-1.5 rounded-full text-sm font-bold transition-all shadow-sm ${selectedCategory === 'all' ? 'bg-gray-800 text-white' : 'bg-white text-gray-600 border border-gray-200'}`}
          >
            All
          </motion.button>
          {categories.map(cat => (
            <motion.button
              key={cat.id}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedCategory(cat.id)}
              className={`whitespace-nowrap px-4 py-1.5 rounded-full text-sm font-bold transition-all shadow-sm ${selectedCategory === cat.id ? 'bg-orange-600 text-white shadow-orange-200' : 'bg-white text-gray-600 border border-gray-200'}`}
            >
              {cat.name}
            </motion.button>
          ))}
        </div>
      </header>

      {/* MENU LIST */}
      <div className="p-4 space-y-4 flex-1">
        {items.length === 0 && !loading && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="text-center py-20 text-gray-400 flex flex-col items-center"
          >
            <ShoppingBag size={48} className="mb-3 opacity-20" />
            <p>No items found.</p>
          </motion.div>
        )}

        <AnimatePresence mode='popLayout'>
          {items.map((item) => {
            const isUnavailable = item.status === 'SOLD_OUT' || item.status === 'UNAVAILABLE';
            return (
              <motion.div
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
                key={item.id}
                onClick={() => !isUnavailable && setSelectedItem(item)}
                className={`bg-white p-3 rounded-2xl shadow-sm border border-gray-100 flex gap-3 transition-transform ${isUnavailable
                  ? 'opacity-60 cursor-not-allowed'
                  : 'cursor-pointer active:scale-[0.98] hover:shadow-md'
                  }`}
              >
                {/* Ảnh món ăn */}
                <div className="w-24 h-24 bg-gray-100 rounded-xl flex-shrink-0 overflow-hidden relative">
                  {item.photos && item.photos.length > 0 ? (
                    <img
                      src={item.photos.find((p: any) => p.isPrimary)?.url || item.photos[0].url}
                      className="w-full h-full object-cover"
                      alt={item.name}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-200">
                      <ShoppingBag size={20} className="text-gray-400" />
                    </div>
                  )}

                  {item.isChefRecommended && !isUnavailable && (
                    <div className="absolute top-0 left-0 bg-red-600/90 backdrop-blur-sm text-white text-[9px] font-bold px-2 py-1 rounded-br-lg shadow-sm z-10">
                      Chef's Choice
                    </div>
                  )}

                  {item.status === 'SOLD_OUT' && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-12">
                      <span className="bg-red-600 text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-lg">Sold out</span>
                    </div>
                  )}
                  {item.status === 'UNAVAILABLE' && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-12">
                      <span className="bg-yellow-600 text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-lg">Unavailable</span>
                    </div>
                  )}
                </div>

                {/* Thông tin */}
                <div className="flex-1 flex flex-col justify-between py-1">
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <h3 className={`font-bold line-clamp-1 text-base ${isUnavailable ? 'text-gray-400' : 'text-gray-800'}`}>
                        {item.name}
                      </h3>
                      {item.status === 'AVAILABLE' && (
                        <span className="text-[9px] uppercase font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full whitespace-nowrap">
                          Available
                        </span>
                      )}
                    </div>
                    <p className={`text-xs line-clamp-2 mt-1 leading-relaxed ${isUnavailable ? 'text-gray-400' : 'text-gray-500'}`}>{item.description}</p>

                    {/* Size Options Display */}
                    {(() => {
                      const sizeGroup = item.modifierGroups?.find(
                        g => g.name.toLowerCase().includes('size') || g.name.toLowerCase().includes('kích thước')
                      );
                      if (sizeGroup && sizeGroup.options.length > 0) {
                        return (
                          <div className="flex flex-wrap gap-1 mt-1.5">
                            {sizeGroup.options.map(opt => (
                              <span key={opt.id} className="text-[10px] uppercase font-bold text-gray-500 bg-gray-100 border border-gray-200 px-1.5 py-0.5 rounded-[4px]">
                                {opt.name}
                              </span>
                            ))}
                          </div>
                        )
                      }
                      return null;
                    })()}
                  </div>
                  <div className="flex justify-between items-end mt-2">
                    <span className={`font-extrabold text-lg ${isUnavailable ? 'text-gray-400' : 'text-orange-600'}`}>
                      {item.price.toLocaleString()}đ
                    </span>
                    {!isUnavailable && (
                      <button className="bg-orange-50 text-orange-600 w-8 h-8 rounded-full flex items-center justify-center hover:bg-orange-100 transition-colors">
                        <span className="text-xl font-bold leading-none mb-0.5">+</span>
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {/* Infinite Scroll Observer - Outside AnimatePresence */}
        {hasMore && <div ref={lastItemRef} className="h-1" />}

        {/* Loading Skeleton */}
        {loading && (
          <div className="flex justify-center py-6">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
          </div>
        )}
      </div>

      {/* Floating Cart Button (Animated) */}
      <AnimatePresence>
        {totalCartItems > 0 && (
          <div className="fixed bottom-6 left-4 right-4 z-30">
            <motion.button
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 50, opacity: 0 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsCartOpen(true)}
              className="w-full bg-gray-900/90 backdrop-blur-md text-white p-4 rounded-2xl shadow-2xl shadow-orange-900/20 flex justify-between items-center"
            >
              <div className="flex items-center gap-3">
                <div className="relative">
                  <ShoppingBag className="text-orange-500" />
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold border-2 border-gray-900">
                    {totalCartItems}
                  </span>
                </div>
                <div className="flex flex-col items-start leading-tight">
                  <span className="font-bold text-sm">View Cart</span>
                  <span className="text-[10px] text-gray-400">{totalCartItems} items selected</span>
                </div>
              </div>
              <span className="font-bold text-orange-400 text-sm">Details &rarr;</span>
            </motion.button>
          </div>
        )}
      </AnimatePresence>

      {/* MODALS */}
      {selectedItem && (
        <ItemModal
          item={selectedItem}
          relatedItems={items.filter(i => i.categoryId === selectedItem.categoryId && i.id !== selectedItem.id).slice(0, 4)}
          onSelectRelated={setSelectedItem}
          onClose={() => setSelectedItem(null)}
        />
      )}
      <CartModal isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />

      <Footer />
    </div>
  );
}

