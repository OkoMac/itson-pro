import { useDemo } from '@/context/DemoContext';
import { FileText } from 'lucide-react';

const DocumentsPage = () => {
  const { state, customers } = useDemo();

  return (
    <div>
      <h1 className="text-lg font-semibold text-foreground mb-4">OCR & Document Centre</h1>
      <div className="surface-raised border border-border rounded-lg overflow-hidden">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left px-4 py-2 text-muted-foreground font-medium">Document</th>
              <th className="text-left px-4 py-2 text-muted-foreground font-medium">Type</th>
              <th className="text-left px-4 py-2 text-muted-foreground font-medium">Source</th>
              <th className="text-left px-4 py-2 text-muted-foreground font-medium">Linked</th>
              <th className="text-left px-4 py-2 text-muted-foreground font-medium">Confidence</th>
              <th className="text-left px-4 py-2 text-muted-foreground font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {state.documents.map(doc => (
              <tr key={doc.documentId} className="border-b border-border last:border-0 hover:bg-accent/30">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <FileText size={14} className="text-muted-foreground" />
                    <span className="text-foreground">{doc.fileName}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-muted-foreground">{doc.documentType}</td>
                <td className="px-4 py-3 text-muted-foreground">{doc.source}</td>
                <td className="px-4 py-3 font-mono text-muted-foreground">{doc.linkedEntityId}</td>
                <td className="px-4 py-3">
                  <span className={`font-mono ${doc.confidence >= 90 ? 'text-status-healthy' : 'text-status-risk'}`}>
                    {doc.confidence}%
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                    doc.status === 'approved' ? 'bg-status-healthy/10 text-status-healthy' :
                    doc.status === 'pending' ? 'bg-status-risk/10 text-status-risk' :
                    'bg-accent text-muted-foreground'
                  }`}>{doc.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DocumentsPage;
