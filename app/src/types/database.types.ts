export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          updated_at: string | null;
          customer_id: string;
          subscription_id: string;
        };
        Insert: {
          id: string;
          updated_at?: string | null;
          customer_id: string;
          subscription_id: string;
        };
        Update: {
          id?: string;
          updated_at?: string | null;
          customer_id?: string;
          subscription_id?: string;
        };
      };
      user_charts: {
        Row: {
          id: number;
          created_at: string;
          user_id: string;
          chart: string;
          updated_at: string;
          name: string;
          is_public: boolean;
          public_id: string | null;
        };
        Insert: {
          id?: number;
          created_at?: string;
          user_id: string;
          chart: string;
          updated_at?: string;
          name: string;
          is_public?: boolean;
          public_id?: string | null;
        };
        Update: {
          id?: number;
          created_at?: string;
          user_id?: string;
          chart?: string;
          updated_at?: string;
          name?: string;
          is_public?: boolean;
          public_id?: string | null;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}
