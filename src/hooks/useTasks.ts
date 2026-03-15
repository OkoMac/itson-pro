import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useDemo } from '@/context/DemoContext';
import { useAuth } from '@/context/AuthContext';
import { tasksService, type Task } from '@/services/tasks';

export function useTasks(filters?: { status?: string; priority?: string; assignedTo?: string; search?: string; page?: number }) {
  const { state } = useDemo();
  const { isDemoMode } = useAuth();

  const query = useQuery({
    queryKey: ['tasks', filters],
    queryFn: () => tasksService.list(filters),
    enabled: !isDemoMode,
  });

  if (isDemoMode) {
    let tasks = state.tasks;
    if (filters?.status) tasks = tasks.filter(t => t.status === filters.status);
    if (filters?.priority) tasks = tasks.filter(t => t.priority === filters.priority);
    if (filters?.search) {
      const q = filters.search.toLowerCase();
      tasks = tasks.filter(t => t.title.toLowerCase().includes(q));
    }
    return { data: { tasks, total: tasks.length }, isLoading: false, error: null };
  }

  return query;
}

export function useCreateTask() {
  const { dispatch } = useDemo();
  const { isDemoMode } = useAuth();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (data: Pick<Task, 'title' | 'description' | 'priority' | 'dueDate' | 'assignedTo'>) => {
      if (isDemoMode) {
        const task = {
          taskId: `TASK-${Math.floor(1000 + Math.random() * 9000)}`,
          ...data,
          status: 'pending',
          createdAt: new Date().toISOString(),
        };
        dispatch({ type: 'ADD_TASK', task: task as any });
        return Promise.resolve(task as Task);
      }
      return tasksService.create(data);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tasks'] }),
  });
}

export function useUpdateTask() {
  const { dispatch } = useDemo();
  const { isDemoMode } = useAuth();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Task> }) => {
      if (isDemoMode) {
        if (data.status) dispatch({ type: 'UPDATE_TASK_STATUS', taskId: id, status: data.status as any });
        return Promise.resolve({ taskId: id, ...data } as Task);
      }
      return tasksService.update(id, data);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tasks'] }),
  });
}

export function useDeleteTask() {
  const { isDemoMode } = useAuth();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => {
      if (isDemoMode) throw new Error('Use DemoContext in demo mode');
      return tasksService.delete(id);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tasks'] }),
  });
}
