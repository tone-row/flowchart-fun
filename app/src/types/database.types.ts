export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          customer_id: string;
          id: string;
          subscription_id: string;
          updated_at: string | null;
        };
        Insert: {
          customer_id: string;
          id: string;
          subscription_id: string;
          updated_at?: string | null;
        };
        Update: {
          customer_id?: string;
          id?: string;
          subscription_id?: string;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey";
            columns: ["id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      user_charts: {
        Row: {
          chart: string;
          created_at: string;
          id: number;
          is_public: boolean;
          name: string;
          public_id: string | null;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          chart: string;
          created_at?: string;
          id?: number;
          is_public?: boolean;
          name: string;
          public_id?: string | null;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          chart?: string;
          created_at?: string;
          id?: number;
          is_public?: boolean;
          name?: string;
          public_id?: string | null;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "user_charts_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
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
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}
