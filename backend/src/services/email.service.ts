import nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';

let transporter: Transporter | null = null;

function getTransporter(): Transporter {
  if (transporter) return transporter;

  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_SECURE } = process.env;

  if (SMTP_HOST && SMTP_USER && SMTP_PASS) {
    transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: SMTP_PORT ? parseInt(SMTP_PORT) : 587,
      secure: SMTP_SECURE === 'true',
      auth: { user: SMTP_USER, pass: SMTP_PASS },
    });
  } else {
    // Dev fallback: Ethereal (auto-creates a test account on first use)
    transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      auth: { user: 'ethereal-placeholder', pass: 'ethereal-placeholder' },
    });
  }

  return transporter;
}

const FROM = process.env.EMAIL_FROM ?? 'Itson Pro <noreply@itson.pro>';

export interface EmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
}

async function send(opts: EmailOptions): Promise<void> {
  try {
    await getTransporter().sendMail({
      from: FROM,
      to: Array.isArray(opts.to) ? opts.to.join(', ') : opts.to,
      subject: opts.subject,
      html: opts.html,
      text: opts.text ?? opts.html.replace(/<[^>]+>/g, ''),
    });
  } catch (err) {
    // Email failures are non-fatal — log and continue
    console.error('[email] Failed to send:', (err as Error).message);
  }
}

// ── Typed email helpers ────────────────────────────────────────────────────────

export const emailService = {
  /** Notify an approver of a pending approval request */
  async approvalRequested(opts: { to: string; approverName: string; requesterName: string; entityType: string; entityId: string; approvalId: string }) {
    await send({
      to: opts.to,
      subject: `Action required: ${opts.entityType} approval #${opts.approvalId}`,
      html: `
        <p>Hi ${opts.approverName},</p>
        <p><strong>${opts.requesterName}</strong> has requested approval for <strong>${opts.entityType} ${opts.entityId}</strong>.</p>
        <p>Please review and approve or reject this request in Itson Pro.</p>
        <p style="margin-top:24px">
          <a href="${process.env.APP_URL ?? 'https://app.itson.pro'}/approvals" style="background:#2563eb;color:#fff;padding:10px 20px;border-radius:6px;text-decoration:none">View Approval</a>
        </p>
      `,
    });
  },

  /** Notify a user that their approval was processed */
  async approvalProcessed(opts: { to: string; requesterName: string; entityType: string; entityId: string; decision: 'approved' | 'rejected'; comments?: string }) {
    const verb = opts.decision === 'approved' ? 'approved ✅' : 'rejected ❌';
    await send({
      to: opts.to,
      subject: `Your ${opts.entityType} request has been ${opts.decision}`,
      html: `
        <p>Hi ${opts.requesterName},</p>
        <p>Your request for <strong>${opts.entityType} ${opts.entityId}</strong> has been <strong>${verb}</strong>.</p>
        ${opts.comments ? `<p>Comments: ${opts.comments}</p>` : ''}
        <p><a href="${process.env.APP_URL ?? 'https://app.itson.pro'}/approvals">View in Itson Pro →</a></p>
      `,
    });
  },

  /** Alert when a product stock falls below its reorder level */
  async lowStockAlert(opts: { to: string | string[]; productName: string; sku: string; stockOnHand: number; reorderLevel: number }) {
    await send({
      to: opts.to,
      subject: `Low stock alert: ${opts.productName} (${opts.sku})`,
      html: `
        <p>⚠️ <strong>${opts.productName}</strong> (SKU: ${opts.sku}) is below its reorder level.</p>
        <ul>
          <li>Current stock: <strong>${opts.stockOnHand}</strong></li>
          <li>Reorder level: <strong>${opts.reorderLevel}</strong></li>
        </ul>
        <p><a href="${process.env.APP_URL ?? 'https://app.itson.pro'}/stock">View Stock →</a></p>
      `,
    });
  },

  /** Invoice overdue reminder */
  async invoiceOverdue(opts: { to: string; customerName: string; invoiceRef: string; amount: number; dueDate: string }) {
    await send({
      to: opts.to,
      subject: `Invoice overdue: ${opts.invoiceRef}`,
      html: `
        <p>Hi ${opts.customerName},</p>
        <p>Invoice <strong>${opts.invoiceRef}</strong> for <strong>R ${opts.amount.toLocaleString('en-ZA')}</strong> was due on <strong>${opts.dueDate}</strong> and remains unpaid.</p>
        <p>Please arrange payment at your earliest convenience.</p>
        <p><a href="${process.env.APP_URL ?? 'https://app.itson.pro'}/financials">View Invoice →</a></p>
      `,
    });
  },

  /** New order confirmation */
  async orderCreated(opts: { to: string; customerName: string; orderRef: string; value: number }) {
    await send({
      to: opts.to,
      subject: `Order confirmed: ${opts.orderRef}`,
      html: `
        <p>Hi ${opts.customerName},</p>
        <p>Your order <strong>${opts.orderRef}</strong> (value: R ${opts.value.toLocaleString('en-ZA')}) has been received and is being processed.</p>
        <p><a href="${process.env.APP_URL ?? 'https://app.itson.pro'}/orders">Track Order →</a></p>
      `,
    });
  },

  /** Generic notification */
  async notify(opts: EmailOptions) {
    await send(opts);
  },
};
