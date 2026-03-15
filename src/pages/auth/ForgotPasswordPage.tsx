import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const schema = z.object({
  email: z.string().email('Enter a valid email address'),
});

type FormData = z.infer<typeof schema>;

export default function ForgotPasswordPage() {
  const { resetPassword, isDemoMode } = useAuth();
  const [sent, setSent] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    setServerError(null);
    const { error } = await resetPassword(data.email);
    if (error) {
      setServerError(error);
    } else {
      setSent(true);
    }
  };

  if (sent) {
    return (
      <div className="w-full max-w-sm text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-status-healthy/10 border border-status-healthy/20 mb-4">
          <CheckCircle size={20} className="text-status-healthy" />
        </div>
        <h2 className="text-lg font-semibold text-foreground mb-2">Email sent</h2>
        <p className="text-sm text-muted-foreground mb-6">
          Check your inbox for a password reset link. It expires in 1 hour.
        </p>
        <Link
          to="/auth/login"
          className="inline-flex items-center gap-1.5 text-xs text-status-active hover:underline"
        >
          <ArrowLeft size={12} /> Back to sign in
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full max-w-sm">
      <div className="mb-8">
        <Link
          to="/auth/login"
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground mb-6"
        >
          <ArrowLeft size={12} /> Back to sign in
        </Link>
        <h1 className="text-xl font-semibold text-foreground">Reset your password</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Enter the email address for your account and we'll send a reset link.
        </p>
      </div>

      {isDemoMode && (
        <div className="mb-4 flex items-start gap-2 rounded-lg border border-status-active/30 bg-status-active/5 px-3 py-2.5 text-xs text-status-active">
          <AlertCircle size={14} className="mt-0.5 shrink-0" />
          <span>Password reset requires Supabase to be configured.</span>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-foreground mb-1.5">Email</label>
          <input
            {...register('email')}
            type="email"
            autoComplete="email"
            placeholder="you@company.com"
            className="w-full h-9 rounded-md bg-secondary border border-border px-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
          />
          {errors.email && (
            <p className="mt-1 text-[11px] text-destructive">{errors.email.message}</p>
          )}
        </div>

        {serverError && (
          <div className="flex items-center gap-2 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive">
            <AlertCircle size={13} />
            {serverError}
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full h-9 rounded-md bg-status-active text-white text-sm font-medium flex items-center justify-center gap-2 hover:bg-status-active/90 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
        >
          {isSubmitting ? (
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <Mail size={14} />
          )}
          {isSubmitting ? 'Sending…' : 'Send reset link'}
        </button>
      </form>
    </div>
  );
}
