import { ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

const beforeItems = [
  'Emails & WhatsApp',
  'Paper notes & spreadsheets',
  'Manual follow-ups',
  'Lost branding instructions',
  'Hidden delays',
  'No operational visibility',
];

const afterItems = [
  'Unified event timeline',
  'Single order command view',
  'Automated risk alerts',
  'OCR document intelligence',
  'Supervised approval workflows',
  'Full management visibility',
];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const itemVariants = {
  hidden: { opacity: 0, x: -10 },
  visible: { opacity: 1, x: 0 },
};

export function BeforeAfterWidget() {
  return (
    <div className="surface-raised border border-border rounded-lg p-4 overflow-hidden">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold text-foreground">Business Impact</h2>
        <ArrowRight size={14} className="text-muted-foreground" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <motion.div variants={containerVariants} initial="hidden" whileInView="visible" viewport={{ once: true }}>
          <span className="text-[10px] font-medium text-status-critical uppercase tracking-wide">Before</span>
          <div className="mt-2 space-y-1.5">
            {beforeItems.map(item => (
              <motion.div key={item} variants={itemVariants} className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="w-1 h-1 rounded-full bg-status-critical/60 shrink-0" />
                {item}
              </motion.div>
            ))}
          </div>
        </motion.div>
        <motion.div variants={containerVariants} initial="hidden" whileInView="visible" viewport={{ once: true }}>
          <span className="text-[10px] font-medium text-status-healthy uppercase tracking-wide">After — Itson-Pro</span>
          <div className="mt-2 space-y-1.5">
            {afterItems.map(item => (
              <motion.div key={item} variants={itemVariants} className="flex items-center gap-2 text-xs text-foreground">
                <span className="w-1 h-1 rounded-full bg-status-healthy shrink-0" />
                {item}
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Audit trail summary */}
      <div className="mt-4 pt-3 border-t border-border">
        <div className="grid grid-cols-4 gap-3">
          {[
            { label: 'Orders Tracked', value: '100%' },
            { label: 'Approvals Logged', value: '100%' },
            { label: 'Margin Decisions', value: '100%' },
            { label: 'Communication History', value: '100%' },
          ].map(item => (
            <div key={item.label} className="text-center">
              <div className="text-sm font-mono font-semibold text-status-healthy">{item.value}</div>
              <div className="text-[9px] text-muted-foreground mt-0.5">{item.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
