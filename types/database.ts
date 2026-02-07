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
      users: {
        Row: {
          id: string;
          github_id: string;
          username: string;
          email: string | null;
          avatar_url: string | null;
          access_token: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          github_id: string;
          username: string;
          email?: string | null;
          avatar_url?: string | null;
          access_token?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          github_id?: string;
          username?: string;
          email?: string | null;
          avatar_url?: string | null;
          access_token?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      repositories: {
        Row: {
          id: string;
          user_id: string;
          github_id: number;
          name: string;
          full_name: string;
          description: string | null;
          url: string;
          default_branch: string;
          is_private: boolean;
          language: string | null;
          is_pinned: boolean;
          last_synced_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          github_id: number;
          name: string;
          full_name: string;
          description?: string | null;
          url: string;
          default_branch?: string;
          is_private?: boolean;
          language?: string | null;
          is_pinned?: boolean;
          last_synced_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          github_id?: number;
          name?: string;
          full_name?: string;
          description?: string | null;
          url?: string;
          default_branch?: string;
          is_private?: boolean;
          language?: string | null;
          is_pinned?: boolean;
          last_synced_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "repositories_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      tasks: {
        Row: {
          id: string;
          user_id: string;
          repository_id: string;
          title: string;
          description: string | null;
          type:
            | "TODO"
            | "FIXME"
            | "BUG"
            | "ALERT"
            | "HACK"
            | "NOTE"
            | "OPTIMIZE"
            | "SECURITY"
            | "DEPRECATED"
            | "REVIEW";
          priority: "low" | "medium" | "high" | "critical";
          status: "open" | "in_progress" | "completed" | "archived";
          file_path: string | null;
          line_start: number | null;
          line_end: number | null;
          branch: string | null;
          commit_sha: string | null;
          permalink: string | null;
          due_date: string | null;
          tags: string[] | null;
          is_starred: boolean;
          order_index: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          repository_id: string;
          title: string;
          description?: string | null;
          type:
            | "TODO"
            | "FIXME"
            | "BUG"
            | "ALERT"
            | "HACK"
            | "NOTE"
            | "OPTIMIZE"
            | "SECURITY"
            | "DEPRECATED"
            | "REVIEW";
          priority?: "low" | "medium" | "high" | "critical";
          status?: "open" | "in_progress" | "completed" | "archived";
          file_path?: string | null;
          line_start?: number | null;
          line_end?: number | null;
          branch?: string | null;
          commit_sha?: string | null;
          permalink?: string | null;
          due_date?: string | null;
          tags?: string[] | null;
          is_starred?: boolean;
          order_index?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          repository_id?: string;
          title?: string;
          description?: string | null;
          type?:
            | "TODO"
            | "FIXME"
            | "BUG"
            | "ALERT"
            | "HACK"
            | "NOTE"
            | "OPTIMIZE"
            | "SECURITY"
            | "DEPRECATED"
            | "REVIEW";
          priority?: "low" | "medium" | "high" | "critical";
          status?: "open" | "in_progress" | "completed" | "archived";
          file_path?: string | null;
          line_start?: number | null;
          line_end?: number | null;
          branch?: string | null;
          commit_sha?: string | null;
          permalink?: string | null;
          due_date?: string | null;
          tags?: string[] | null;
          is_starred?: boolean;
          order_index?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "tasks_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "tasks_repository_id_fkey";
            columns: ["repository_id"];
            isOneToOne: false;
            referencedRelation: "repositories";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
