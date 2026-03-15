import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useDemo } from '@/context/DemoContext';
import { useAuth } from '@/context/AuthContext';
import { productsService, type Product, type ProductFilters } from '@/services/products';

export function useProducts(filters?: ProductFilters) {
  const { state } = useDemo();
  const { isDemoMode } = useAuth();

  const query = useQuery({
    queryKey: ['products', filters],
    queryFn: () => productsService.list(filters),
    enabled: !isDemoMode,
  });

  if (isDemoMode) {
    let products = state.products;
    if (filters?.search) {
      const q = filters.search.toLowerCase();
      products = products.filter(p =>
        p.productName.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q)
      );
    }
    if (filters?.category) products = products.filter(p => p.category === filters.category);
    if (filters?.lowStock) products = products.filter(p => p.stockOnHand <= p.reorderLevel);
    return { data: { products, total: products.length }, isLoading: false, error: null };
  }

  return query;
}

export function useProduct(id: string) {
  const { isDemoMode } = useAuth();
  const { state } = useDemo();

  return useQuery({
    queryKey: ['products', id],
    queryFn: () => productsService.get(id),
    enabled: !isDemoMode && !!id,
    initialData: isDemoMode ? state.products.find(p => p.sku === id) as any : undefined,
  });
}

export function useCreateProduct() {
  const { isDemoMode } = useAuth();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (data: Omit<Product, 'id' | 'isLowStock'>) => {
      if (isDemoMode) throw new Error('Use DemoContext in demo mode');
      return productsService.create(data);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['products'] }),
  });
}

export function useUpdateProduct() {
  const { state, dispatch } = useDemo();
  const { isDemoMode } = useAuth();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Product> }) => {
      if (isDemoMode) {
        dispatch({ type: 'UPDATE_PRODUCT', sku: id, updates: data });
        return Promise.resolve({ sku: id, ...data } as Product);
      }
      return productsService.update(id, data);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['products'] }),
  });
}

export function useDeleteProduct() {
  const { isDemoMode } = useAuth();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => {
      if (isDemoMode) throw new Error('Use DemoContext in demo mode');
      return productsService.delete(id);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['products'] }),
  });
}

export function useProductStatistics() {
  const { isDemoMode } = useAuth();
  const { state } = useDemo();

  return useQuery({
    queryKey: ['products', 'statistics'],
    queryFn: () => productsService.statistics(),
    enabled: !isDemoMode,
    placeholderData: isDemoMode ? {
      total: state.products.length,
      lowStock: state.products.filter(p => p.stockOnHand <= p.reorderLevel).length,
      categories: [...new Set(state.products.map(p => p.category))].length,
    } : undefined,
  });
}
