import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, UserPlus, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const schema = z.object({
  fullName: z.string().min(2, 'Enter your full name'),
  email: z.string().email('Enter a valid email address'),
  organisationName: z.string().min(2, 'Enter your company or organisation name'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Must contain an uppercase letter')
    .regex(/[0-9]/, 'Must contain a number'),
  confirmPassword: z.string(),
}).refine(d => d.password === d.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

type FormData = z.infer<typeof schema>;

const PASSWORD_RULES = [
  { label: '8+ characters', test: (v: string) => v.length >= 8 },
  { label: 'Uppercase letter', test: (v: string) => /[A-Z]/.test(v) },
  { label: 'Number', test: (v: string) => /[0-9]/.test(v) },
];

export default function RegisterPage() {
  const { signUp, isDemoMode } = useAuth();
  const navigate = useNavigate();
  const [showPass, setShowPass] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const passwordVal = watch('password', '');

  const onSubmit = async (data: FormData) => {
    setServerError(null);
    if (isDemoMode) {
      navigate('/');
      return;
    }
    const { error } = await signUp({
      email: data.email,
      password: data.password,
      fullName: data.fullName,
      organisationName: data.organisationName,
    });
    if (error) {
      setServerError(error);
    } else {
      setSuccess(true);
    }
  };

  if (success) {
    return (
      <div className="w-full max-w-sm text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-status-healthy/10 border border-status-healthy/20 mb-4">
          <CheckCircle size={20} className="text-status-healthy" />
        </div>
        <h2 className="text-lg font-semibold text-foreground mb-2">Check your email</h2>
        <p className="text-sm text-muted-foreground">
          We sent a confirmation link to your email address. Click it to activate your account.
        </p>
        <Link to="/auth/login" className="mt-6 inline-block text-xs text-status-active hover:underline">
          Back to sign in
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full max-w-sm">
      <div className="mb-8 text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-status-active/10 border border-status-active/20 mb-4">
          <span className="text-lg font-bold text-status-active">IP</span>
        </div>
        <h1 className="text-xl font-semibold text-foreground">Create your workspace</h1>
        <p className="text-sm text-muted-foreground mt-1">Start your 14-day free trial — no credit card required</p>
      </div>

      {isDemoMode && (
        <div className="mb-4 flex items-start gap-2 rounded-lg border border-status-active/30 bg-status-active/5 px-3 py-2.5 text-xs text-status-active">
          <AlertCircle size={14} className="mt-0.5 shrink-0" />
          <span>
            <strong>Demo mode.</strong> Registration is disabled. Configure{' '}
            <code className="text-[11px] font-mono">VITE_SUPABASE_URL</code> to enable real accounts.
          </span>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-foreground mb-1.5">Full name</label>
          <input
            {...register('fullName')}
            type="text"
            autoComplete="name"
            placeholder="Jane Smith"
            className="w-full h-9 rounded-md bg-secondary border border-border px-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
          />
          {errors.fullName && <p className="mt-1 text-[11px] text-destructive">{errors.fullName.message}</p>}
        </div>

        <div>
          <label className="block text-xs font-medium text-foreground mb-1.5">Work email</label>
          <input
            {...register('email')}
            type="email"
            autoComplete="email"
            placeholder="jane@company.com"
            className="w-full h-9 rounded-md bg-secondary border border-border px-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
          />
          {errors.email && <p className="mt-1 text-[11px] text-destructive">{errors.email.message}</p>}
        </div>

        <div>
          <label className="block text-xs font-medium text-foreground mb-1.5">Organisation name</label>
          <input
            {...register('organisationName')}
            type="text"
            placeholder="Acme Corp"
            className="w-full h-9 rounded-md bg-secondary border border-border px-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
          />
          {errors.organisationName && <p className="mt-1 text-[11px] text-destructive">{errors.organisationName.message}</p>}
        </div>

        <div>
          <label className="block text-xs font-medium text-foreground mb-1.5">Password</label>
          <div className="relative">
            <input
              {...register('password')}
              type={showPass ? 'text' : 'password'}
              autoComplete="new-password"
              placeholder="••••••••"
              className="w-full h-9 rounded-md bg-secondary border border-border px-3 pr-9 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            />
            <button
              type="button"
              onClick={() => setShowPass(s => !s)}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
          </div>
          {/* Password strength indicators */}
          <div className="mt-2 flex items-center gap-3">
            {PASSWORD_RULES.map(rule => (
              <span
                key={rule.label}
                className={`text-[10px] flex items-center gap-1 transition-colors ${
                  rule.test(passwordVal) ? 'text-status-healthy' : 'text-muted-foreground'
                }`}
              >
                <span className={`w-1 h-1 rounded-full ${rule.test(passwordVal) ? 'bg-status-healthy' : 'bg-muted-foreground'}`} />
                {rule.label}
              </span>
            ))}
          </div>
          {errors.password && <p className="mt-1 text-[11px] text-destructive">{errors.password.message}</p>}
        </div>

        <div>
          <label className="block text-xs font-medium text-foreground mb-1.5">Confirm password</label>
          <input
            {...register('confirmPassword')}
            type={showPass ? 'text' : 'password'}
            autoComplete="new-password"
            placeholder="••••••••"
            className="w-full h-9 rounded-md bg-secondary border border-border px-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
          />
          {errors.confirmPassword && <p className="mt-1 text-[11px] text-destructive">{errors.confirmPassword.message}</p>}
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
            <UserPlus size={14} />
          )}
          {isSubmitting ? 'Creating workspace…' : 'Create workspace'}
        </button>
      </form>

      <p className="mt-4 text-center text-[11px] text-muted-foreground">
        By registering you agree to our{' '}
        <span className="text-status-active cursor-pointer hover:underline">Terms of Service</span>
        {' '}and{' '}
        <span className="text-status-active cursor-pointer hover:underline">Privacy Policy</span>.
      </p>

      <p className="mt-4 text-center text-xs text-muted-foreground">
        Already have an account?{' '}
        <Link to="/auth/login" className="text-status-active hover:underline font-medium">
          Sign in
        </Link>
      </p>
    </div>
  );
}
