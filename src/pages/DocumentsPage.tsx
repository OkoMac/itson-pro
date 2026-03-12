import { useDemo } from '@/context/DemoContext';
import { FileText, X, CheckCircle, XCircle, Edit3, Link2, Eye } from 'lucide-react';
import { useState } from 'react';
import type { Document } from '@/data/seed';

const DocumentsPage = () => {
  const { state, dispatch } = useDemo();
  const [selected, setSelected] = useState<Document | null>(null);
  const [typeFilter, setTypeFilter] = useState<string>('all');

  const types = [...new Set(state.documents.map(d => d.documentType))];
  const filtered = typeFilter === 'all' ? state.documents : state.documents.filter(d => d.documentType === typeFilter);

  return (
    <div className="flex gap-4 h-[calc(100vh-7rem)]">
      <div className={`flex-1 overflow-auto ${selected ? 'max-w-[60%]' : ''}`}>
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-lg font-semibold text-foreground">OCR & Document Centre</h1>
          <div className="flex items-center gap-2">
            <select
              value={typeFilter}
              onChange={e => setTypeFilter(e.target.value)}
              className="h-7 rounded-md bg-secondary border border-border px-2 text-xs text-foreground"
            >
              <option value="all">All Types</option>
              {types.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
            <span className="text-[11px] text-muted-foreground">{filtered.length} documents</span>
          </div>
        </div>

        <div className="surface-raised border border-border rounded-lg overflow-hidden">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left px-4 py-2 text-muted-foreground font-medium">Document</th>
                <th className="text-left px-4 py-2 text-muted-foreground font-medium">Type</th>
                <th className="text-left px-4 py-2 text-muted-foreground font-medium">Source</th>
                <th className="text-left px-4 py-2 text-muted-foreground font-medium">Linked</th>
                <th className="text-left px-4 py-2 text-muted-foreground font-medium">Received</th>
                <th className="text-left px-4 py-2 text-muted-foreground font-medium">Confidence</th>
                <th className="text-left px-4 py-2 text-muted-foreground font-medium">Status</th>
                <th className="text-left px-4 py-2 text-muted-foreground font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(doc => (
                <tr key={doc.documentId} className={`border-b border-border last:border-0 hover:bg-accent/30 cursor-pointer ${
                  selected?.documentId === doc.documentId ? 'bg-accent/20' : ''
                }`} onClick={() => setSelected(doc)}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <FileText size={14} className="text-muted-foreground" />
                      <span className="text-foreground">{doc.fileName}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{doc.documentType}</td>
                  <td className="px-4 py-3 text-muted-foreground capitalize">{doc.source}</td>
                  <td className="px-4 py-3 font-mono text-muted-foreground">{doc.linkedEntityId}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {new Date(doc.receivedAt).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short' })}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-12 h-1.5 bg-secondary rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${doc.confidence >= 90 ? 'bg-status-healthy' : doc.confidence >= 80 ? 'bg-status-risk' : 'bg-status-critical'}`}
                          style={{ width: `${doc.confidence}%` }}
                        />
                      </div>
                      <span className={`font-mono text-[10px] ${doc.confidence >= 90 ? 'text-status-healthy' : 'text-status-risk'}`}>
                        {doc.confidence}%
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                      doc.status === 'approved' ? 'bg-status-healthy/10 text-status-healthy' :
                      doc.status === 'pending' ? 'bg-status-risk/10 text-status-risk' :
                      doc.status === 'rejected' ? 'bg-status-critical/10 text-status-critical' :
                      'bg-accent text-muted-foreground'
                    }`}>{doc.status}</span>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={(e) => { e.stopPropagation(); setSelected(doc); }}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <Eye size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selected && (
        <div className="w-[40%] shrink-0 overflow-auto">
          <OcrReviewDrawer doc={selected} onClose={() => setSelected(null)} />
        </div>
      )}
    </div>
  );
};

function OcrReviewDrawer({ doc, onClose }: { doc: Document; onClose: () => void }) {
  const { state } = useDemo();

  const linkedOrder = state.orders.find(o => o.orderId === doc.linkedEntityId);
  const linkedRepair = state.repairs.find(r => r.repairId === doc.linkedEntityId);
  const relatedEvents = state.events.filter(e => e.entityId === doc.documentId);

  return (
    <div className="surface-raised border border-border rounded-lg h-full flex flex-col animate-slide-in-right">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <FileText size={16} className="text-muted-foreground" />
            <span className="text-base font-semibold text-foreground">{doc.fileName}</span>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X size={16} />
          </button>
        </div>
        <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
          <span>{doc.documentType}</span>
          <span className="capitalize">{doc.source}</span>
          <span>{new Date(doc.receivedAt).toLocaleString('en-ZA', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
        </div>
        <div className="flex items-center gap-2 mt-2">
          <span className={`text-[10px] px-1.5 py-0.5 rounded ${
            doc.status === 'approved' ? 'bg-status-healthy/10 text-status-healthy' :
            doc.status === 'pending' ? 'bg-status-risk/10 text-status-risk' :
            'bg-accent text-muted-foreground'
          }`}>{doc.status}</span>
          <span className={`font-mono text-[10px] px-1.5 py-0.5 rounded ${
            doc.confidence >= 90 ? 'bg-status-healthy/10 text-status-healthy' : 'bg-status-risk/10 text-status-risk'
          }`}>{doc.confidence}% confidence</span>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-4 space-y-5">
        {/* Document Preview Mock */}
        <div className="surface-overlay rounded-lg p-6 border border-border border-dashed">
          <div className="text-center">
            <FileText size={40} className="text-muted-foreground mx-auto mb-2 opacity-30" />
            <p className="text-[11px] text-muted-foreground">Document Preview</p>
            <p className="text-[10px] text-muted-foreground mt-1">{doc.fileName}</p>
          </div>
        </div>

        {/* Detected Type */}
        <div>
          <h3 className="text-xs font-medium text-foreground mb-2">Detected Document Type</h3>
          <div className="surface-overlay rounded-md p-3 flex items-center justify-between">
            <span className="text-xs text-foreground">{doc.documentType}</span>
            <span className="text-[10px] text-status-ai font-mono">AI Classified</span>
          </div>
        </div>

        {/* Extracted Fields */}
        <div>
          <h3 className="text-xs font-medium text-foreground mb-2">Extracted Fields</h3>
          <div className="space-y-1.5">
            {Object.entries(doc.extractedFields).map(([key, value]) => (
              <div key={key} className="surface-overlay rounded-md p-3 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-muted-foreground uppercase tracking-wide">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                  <p className="text-xs text-foreground font-medium mt-0.5">{value}</p>
                </div>
                <Edit3 size={12} className="text-muted-foreground hover:text-foreground cursor-pointer" />
              </div>
            ))}
          </div>
        </div>

        {/* Linked Entity */}
        <div>
          <h3 className="text-xs font-medium text-foreground mb-2">Linked Record</h3>
          <div className="surface-overlay rounded-md p-3">
            <div className="flex items-center gap-2">
              <Link2 size={12} className="text-status-active" />
              <span className="font-mono text-xs text-foreground">{doc.linkedEntityId}</span>
              <span className="text-[10px] text-muted-foreground capitalize">{doc.linkedEntityType}</span>
            </div>
            {linkedOrder && (
              <p className="text-[11px] text-muted-foreground mt-1">
                {state.orders.find(o => o.orderId === doc.linkedEntityId)?.currentStage} • R{linkedOrder.value.toLocaleString()}
              </p>
            )}
          </div>
        </div>

        {/* Related Events */}
        {relatedEvents.length > 0 && (
          <div>
            <h3 className="text-xs font-medium text-foreground mb-2">Related Events</h3>
            <div className="space-y-1">
              {relatedEvents.map(evt => (
                <div key={evt.eventId} className="flex items-start gap-2 py-1.5 border-b border-border last:border-0">
                  <span className="font-mono text-[10px] text-muted-foreground w-10 shrink-0">
                    {new Date(evt.timestamp).toLocaleTimeString('en-ZA', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <span className="text-xs text-foreground">{evt.title}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div>
          <h3 className="text-xs font-medium text-foreground mb-2">Actions</h3>
          <div className="flex flex-wrap gap-2">
            <button className="text-[10px] font-medium px-3 py-1.5 rounded-md bg-status-healthy/10 text-status-healthy hover:bg-status-healthy/20 flex items-center gap-1">
              <CheckCircle size={10} /> Approve Extraction
            </button>
            <button className="text-[10px] font-medium px-3 py-1.5 rounded-md bg-status-critical/10 text-status-critical hover:bg-status-critical/20 flex items-center gap-1">
              <XCircle size={10} /> Reject
            </button>
            <button className="text-[10px] font-medium px-3 py-1.5 rounded-md bg-accent text-muted-foreground hover:text-foreground flex items-center gap-1">
              <Link2 size={10} /> Link to Order
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DocumentsPage;
