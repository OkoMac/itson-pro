import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useDemo } from '@/context/DemoContext';
import { useAuth } from '@/context/AuthContext';
import { customersService, type CreateCustomerDto } from '@/services/customers';
import { customers as seedCustomers } from '@/data/seed';

export function useCustomers() {
  const { isDemoMode } = useAuth();
  const { user } = useAuth();

  return useQuery({
    queryKey: ['customers'],
    queryFn: () => customersService.list(user?.profile?.organisationId ?? ''),
    enabled: !isDemoMode,
  });
}

export function useCustomersData(search?: string) {
  const { isDemoMode } = useAuth();
  const { user } = useAuth();

  const query = useQuery({
    queryKey: ['customers', search],
    queryFn: () => customersService.list(user?.profile?.organisationId ?? ''),
    enabled: !isDemoMode,
  });

  if (isDemoMode) {
    let data = seedCustomers;
    if (search) {
      const q = search.toLowerCase();
      data = data.filter(c =>
        c.name.toLowerCase().includes(q) ||
        c.customerId.toLowerCase().includes(q)
      );
    }
    return { data, isLoading: false, error: null };
  }

  return query;
}

export function useCreateCustomer() {
  const { isDemoMode, user } = useAuth();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (dto: CreateCustomerDto) => {
      if (isDemoMode) throw new Error('Use DemoContext in demo mode');
      return customersService.create(user?.profile?.organisationId ?? '', dto);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['customers'] }),
  });
}

export function useUpdateCustomer() {
  const { isDemoMode } = useAuth();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: Partial<CreateCustomerDto> }) => {
      if (isDemoMode) throw new Error('Use DemoContext in demo mode');
      return customersService.update(id, dto);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['customers'] }),
  });
}

export function useDeleteCustomer() {
  const { isDemoMode } = useAuth();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => {
      if (isDemoMode) throw new Error('Use DemoContext in demo mode');
      return customersService.delete(id);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['customers'] }),
  });
}
