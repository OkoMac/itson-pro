export interface UserProfile {
  id: string;
  organisationId: string;
  email: string;
  fullName: string | null;
  avatarUrl: string | null;
  role: 'owner' | 'admin' | 'member' | 'viewer';
  department: string | null;
}

export interface Organisation {
  id: string;
  name: string;
  slug: string;
  plan: 'trial' | 'starter' | 'growth' | 'enterprise';
}

export interface AuthUser {
  id: string;
  email: string;
  profile: UserProfile | null;
  organisation: Organisation | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  password: string;
  fullName: string;
  organisationName: string;
}

export const PLAN_LABELS: Record<Organisation['plan'], string> = {
  trial: 'Free Trial',
  starter: 'Starter',
  growth: 'Growth',
  enterprise: 'Enterprise',
};

export const ROLE_LABELS: Record<UserProfile['role'], string> = {
  owner: 'Owner',
  admin: 'Administrator',
  member: 'Member',
  viewer: 'Viewer',
};
