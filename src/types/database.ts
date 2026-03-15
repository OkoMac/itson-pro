// Supabase auto-generated types (run `supabase gen types typescript` to regenerate)
// This is a placeholder until the schema is created in Supabase

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      organisations: {
        Row: {
          id: string;
          name: string;
          slug: string;
          plan: 'trial' | 'starter' | 'growth' | 'enterprise';
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['organisations']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['organisations']['Insert']>;
      };
      profiles: {
        Row: {
          id: string;
          organisation_id: string;
          email: string;
          full_name: string | null;
          avatar_url: string | null;
          role: 'owner' | 'admin' | 'member' | 'viewer';
          department: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['profiles']['Row'], 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>;
      };
      orders: {
        Row: {
          id: string;
          organisation_id: string;
          order_ref: string;
          customer_id: string;
          po_number: string;
          status: string;
          current_stage: string;
          owner: string;
          due_date: string;
          value: number;
          risk_status: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['orders']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['orders']['Insert']>;
      };
      customers: {
        Row: {
          id: string;
          organisation_id: string;
          customer_ref: string;
          name: string;
          segment: string;
          account_manager: string;
          location: string;
          priority: 'high' | 'medium' | 'low';
          contact_name: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['customers']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['customers']['Insert']>;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      plan_type: 'trial' | 'starter' | 'growth' | 'enterprise';
      member_role: 'owner' | 'admin' | 'member' | 'viewer';
    };
  };
}
