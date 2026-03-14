import { useDemo } from '@/context/DemoContext';
import { ListTodo, StickyNote, CheckCircle, Clock, AlertTriangle, Plus, X } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

type TaskFilter = 'all' | 'open' | 'in-progress' | 'completed';

const TasksPage = () => {
  const { state, dispatch } = useDemo();
  const [filter, setFilter] = useState<TaskFilter>('all');
  const [deptFilter, setDeptFilter] = useState<string>('all');
  const [ownerFilter, setOwnerFilter] = useState<string>('all');
  const [showAddNote, setShowAddNote] = useState(false);
  const [newNoteText, setNewNoteText] = useState('');
  const [newNoteEntity, setNewNoteEntity] = useState('');

  const departments = [...new Set(state.tasks.map(t => t.department))];
  const owners = [...new Set(state.tasks.map(t => t.owner))];
  const filtered = state.tasks
    .filter(t => filter === 'all' || t.status === filter)
    .filter(t => deptFilter === 'all' || t.department === deptFilter)
    .filter(t => ownerFilter === 'all' || t.owner === ownerFilter);

  const openCount = state.tasks.filter(t => t.status === 'open').length;
  const urgentCount = state.tasks.filter(t => t.priority === 'urgent' && t.status !== 'completed').length;
  const inProgressCount = state.tasks.filter(t => t.status === 'in-progress').length;

  const handleStatusChange = (taskId: string, newStatus: 'open' | 'in-progress' | 'completed') => {
    dispatch({ type: 'UPDATE_TASK_STATUS', taskId, status: newStatus });
    if (newStatus === 'completed') {
      const task = state.tasks.find(t => t.taskId === taskId);
      if (task) {
        dispatch({ type: 'ADD_EVENT', event: {
          eventId: `EVT-${Date.now()}`,
          timestamp: new Date().toISOString(),
          type: 'TaskCompleted',
          entityType: 'task',
          entityId: taskId,
          title: `Task Completed: ${task.title}`,
          description: `Completed by ${task.owner}`,
          department: task.department,
          owner: task.owner,
          severity: 'info',
          status: 'new',
          tags: ['task', 'completed'],
        }});
        toast.success('✅ Task Completed', { description: task.title });
      }
    }
  };

  const handleAddNote = () => {
    if (!newNoteText.trim()) return;
    dispatch({ type: 'ADD_STICKY_NOTE', note: {
      noteId: `SN-${Date.now()}`,
      linkedEntityType: 'order',
      linkedEntityId: newNoteEntity || 'CLG-2145',
      text: newNoteText,
      author: 'Current User',
      createdAt: new Date().toISOString(),
    }});
    toast.info('📝 Note Added', { description: newNoteText.slice(0, 50) });
    setNewNoteText('');
    setNewNoteEntity('');
    setShowAddNote(false);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-lg font-semibold text-foreground">Tasks & Sticky Notes</h1>
          <p className="text-[11px] text-muted-foreground">
            {openCount} open • {inProgressCount} in progress • {urgentCount} urgent
          </p>
        </div>
        <div className="flex items-center gap-2">
          <select value={ownerFilter} onChange={e => setOwnerFilter(e.target.value)}
            className="h-7 rounded-md bg-secondary border border-border px-2 text-xs text-foreground">
            <option value="all">All Owners</option>
            {owners.map(o => <option key={o} value={o}>{o}</option>)}
          </select>
          <select value={deptFilter} onChange={e => setDeptFilter(e.target.value)}
            className="h-7 rounded-md bg-secondary border border-border px-2 text-xs text-foreground">
            <option value="all">All Departments</option>
            {departments.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
          <div className="flex items-center gap-1 surface-raised border border-border rounded-lg p-0.5">
            {(['all', 'open', 'in-progress', 'completed'] as const).map(s => (
              <button key={s} onClick={() => setFilter(s)}
                className={`px-3 py-1.5 rounded-md text-xs transition-colors capitalize ${
                  filter === s ? 'bg-accent text-foreground' : 'text-muted-foreground hover:text-foreground'
                }`}>{s}</button>
            ))}
          </div>
          {(filter !== 'all' || deptFilter !== 'all' || ownerFilter !== 'all') && (
            <button onClick={() => { setFilter('all'); setDeptFilter('all'); setOwnerFilter('all'); }}
              className="text-[10px] text-status-active hover:underline">Clear</button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <div className="flex items-center gap-2 mb-3">
            <ListTodo size={16} className="text-muted-foreground" />
            <h2 className="text-sm font-semibold text-foreground">Tasks</h2>
            <span className="font-mono text-[10px] text-muted-foreground">{filtered.length}</span>
          </div>
          <div className="space-y-2">
            {filtered.map(t => {
              const daysUntilDue = Math.ceil((new Date(t.dueDate).getTime() - Date.now()) / 86400000);
              const overdue = daysUntilDue < 0 && t.status !== 'completed';
              return (
                <div key={t.taskId} className="surface-raised border border-border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      {t.status === 'completed' ? (
                        <CheckCircle size={14} className="text-status-healthy" />
                      ) : t.priority === 'urgent' ? (
                        <AlertTriangle size={14} className="text-status-critical" />
                      ) : (
                        <Clock size={14} className="text-muted-foreground" />
                      )}
                      <span className={`text-xs font-medium ${t.status === 'completed' ? 'text-muted-foreground line-through' : 'text-foreground'}`}>
                        {t.title}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                        t.priority === 'urgent' ? 'bg-status-critical/10 text-status-critical' :
                        t.priority === 'high' ? 'bg-status-risk/10 text-status-risk' :
                        'bg-accent text-muted-foreground'
                      }`}>{t.priority}</span>
                      {t.status !== 'completed' && (
                        <select
                          value={t.status}
                          onChange={e => handleStatusChange(t.taskId, e.target.value as any)}
                          className="h-6 rounded bg-secondary border border-border px-1 text-[10px] text-foreground"
                        >
                          <option value="open">Open</option>
                          <option value="in-progress">In Progress</option>
                          <option value="completed">Complete</option>
                        </select>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-[11px] text-muted-foreground mt-1">
                    <span>{t.owner}</span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-secondary">{t.department}</span>
                    <span className="font-mono">{t.linkedEntityId}</span>
                    <span className={overdue ? 'text-status-critical font-medium' : ''}>
                      {t.status === 'completed' ? 'Done' : overdue ? 'Overdue' : `${daysUntilDue}d left`}
                    </span>
                  </div>
                </div>
              );
            })}
            {filtered.length === 0 && (
              <div className="surface-raised border border-border rounded-lg p-8 text-center">
                <CheckCircle size={24} className="text-status-healthy mx-auto mb-2 opacity-40" />
                <p className="text-xs text-muted-foreground">No tasks match this filter</p>
              </div>
            )}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <StickyNote size={16} className="text-muted-foreground" />
              <h2 className="text-sm font-semibold text-foreground">Sticky Notes</h2>
              <span className="font-mono text-[10px] text-muted-foreground">{state.stickyNotes.length}</span>
            </div>
            <button onClick={() => setShowAddNote(!showAddNote)} className="text-muted-foreground hover:text-foreground">
              {showAddNote ? <X size={14} /> : <Plus size={14} />}
            </button>
          </div>

          {showAddNote && (
            <div className="surface-raised border border-border rounded-lg p-3 mb-3 space-y-2">
              <textarea
                value={newNoteText}
                onChange={e => setNewNoteText(e.target.value)}
                placeholder="Add a note..."
                className="w-full h-16 bg-secondary border border-border rounded-md px-2 py-1 text-xs text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-1 focus:ring-status-active/50"
              />
              <div className="flex items-center gap-2">
                <select value={newNoteEntity} onChange={e => setNewNoteEntity(e.target.value)}
                  className="h-6 flex-1 rounded bg-secondary border border-border px-1 text-[10px] text-foreground">
                  <option value="">Link to order...</option>
                  {state.orders.filter(o => o.status === 'active').map(o => (
                    <option key={o.orderId} value={o.orderId}>{o.orderId}</option>
                  ))}
                </select>
                <button onClick={handleAddNote} className="text-[10px] font-medium px-3 py-1 rounded-md bg-status-active/10 text-status-active hover:bg-status-active/20">
                  Add
                </button>
              </div>
            </div>
          )}

          <div className="space-y-2">
            {state.stickyNotes.map(n => (
              <div key={n.noteId} className="surface-raised border border-border rounded-lg p-3 border-l-2 border-l-status-risk/30">
                <p className="text-xs text-foreground mb-2">{n.text}</p>
                <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                  <span>{n.author}</span>
                  <span className="font-mono">{n.linkedEntityId}</span>
                  <span>{new Date(n.createdAt).toLocaleTimeString('en-ZA', { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TasksPage;
