import { useDemo } from '@/context/DemoContext';
import { ListTodo, StickyNote } from 'lucide-react';

const TasksPage = () => {
  const { state } = useDemo();

  return (
    <div>
      <h1 className="text-lg font-semibold text-foreground mb-4">Tasks & Sticky Notes</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <ListTodo size={16} className="text-muted-foreground" />
            <h2 className="text-sm font-semibold text-foreground">Tasks</h2>
          </div>
          <div className="space-y-2">
            {state.tasks.map(t => (
              <div key={t.taskId} className="surface-raised border border-border rounded-lg p-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium text-foreground">{t.title}</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                    t.status === 'completed' ? 'bg-status-healthy/10 text-status-healthy' :
                    t.priority === 'urgent' ? 'bg-status-critical/10 text-status-critical' :
                    'bg-accent text-muted-foreground'
                  }`}>{t.priority}</span>
                </div>
                <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                  <span>{t.owner}</span>
                  <span>{t.department}</span>
                  <span className="font-mono">{t.linkedEntityId}</span>
                  <span className={t.status === 'completed' ? 'text-status-healthy' : ''}>{t.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="flex items-center gap-2 mb-3">
            <StickyNote size={16} className="text-muted-foreground" />
            <h2 className="text-sm font-semibold text-foreground">Sticky Notes</h2>
          </div>
          <div className="space-y-2">
            {state.stickyNotes.map(n => (
              <div key={n.noteId} className="surface-raised border border-border rounded-lg p-3 border-l-2 border-l-status-risk/30">
                <p className="text-xs text-foreground mb-1">{n.text}</p>
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
