export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      certificate_requests: {
        Row: {
          created_at: string | null
          id: string
          status: string | null
          submission_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          status?: string | null
          submission_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          status?: string | null
          submission_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "certificate_requests_submission_id_fkey"
            columns: ["submission_id"]
            isOneToOne: false
            referencedRelation: "project_submissions"
            referencedColumns: ["id"]
          },
        ]
      }
      lessons: {
        Row: {
          description: string | null
          estimated_minutes: number | null
          id: number
          order_index: number
          resource_links: Json | null
          resource_pdf_url: string | null
          title: string
          transcript_url: string | null
          video_url: string | null
          week: number
        }
        Insert: {
          description?: string | null
          estimated_minutes?: number | null
          id?: number
          order_index: number
          resource_links?: Json | null
          resource_pdf_url?: string | null
          title: string
          transcript_url?: string | null
          video_url?: string | null
          week: number
        }
        Update: {
          description?: string | null
          estimated_minutes?: number | null
          id?: number
          order_index?: number
          resource_links?: Json | null
          resource_pdf_url?: string | null
          title?: string
          transcript_url?: string | null
          video_url?: string | null
          week?: number
        }
        Relationships: []
      }
      payments: {
        Row: {
          amount: number
          created_at: string | null
          currency: string | null
          id: string
          provider: string
          provider_order_id: string | null
          provider_payment_id: string | null
          status: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string | null
          currency?: string | null
          id?: string
          provider: string
          provider_order_id?: string | null
          provider_payment_id?: string | null
          status?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          currency?: string | null
          id?: string
          provider?: string
          provider_order_id?: string | null
          provider_payment_id?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          cohort_end: string | null
          cohort_start: string | null
          college: string | null
          created_at: string | null
          email: string
          enrolled: boolean | null
          github_url: string
          id: string
          name: string
          phone: string | null
          preferred_track: string | null
          updated_at: string | null
          year: string | null
        }
        Insert: {
          cohort_end?: string | null
          cohort_start?: string | null
          college?: string | null
          created_at?: string | null
          email: string
          enrolled?: boolean | null
          github_url: string
          id: string
          name: string
          phone?: string | null
          preferred_track?: string | null
          updated_at?: string | null
          year?: string | null
        }
        Update: {
          cohort_end?: string | null
          cohort_start?: string | null
          college?: string | null
          created_at?: string | null
          email?: string
          enrolled?: boolean | null
          github_url?: string
          id?: string
          name?: string
          phone?: string | null
          preferred_track?: string | null
          updated_at?: string | null
          year?: string | null
        }
        Relationships: []
      }
      project_submissions: {
        Row: {
          autograder_results: Json | null
          created_at: string | null
          demo_url: string | null
          id: string
          notes: string | null
          repo_url: string
          score: number | null
          status: string | null
          ta_comments: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          autograder_results?: Json | null
          created_at?: string | null
          demo_url?: string | null
          id?: string
          notes?: string | null
          repo_url: string
          score?: number | null
          status?: string | null
          ta_comments?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          autograder_results?: Json | null
          created_at?: string | null
          demo_url?: string | null
          id?: string
          notes?: string | null
          repo_url?: string
          score?: number | null
          status?: string | null
          ta_comments?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      questions: {
        Row: {
          choices: Json
          correct_answer_index: number
          id: number
          order_index: number
          quiz_id: number
          text: string
        }
        Insert: {
          choices: Json
          correct_answer_index: number
          id?: number
          order_index: number
          quiz_id: number
          text: string
        }
        Update: {
          choices?: Json
          correct_answer_index?: number
          id?: number
          order_index?: number
          quiz_id?: number
          text?: string
        }
        Relationships: [
          {
            foreignKeyName: "questions_quiz_id_fkey"
            columns: ["quiz_id"]
            isOneToOne: false
            referencedRelation: "quizzes"
            referencedColumns: ["id"]
          },
        ]
      }
      quiz_responses: {
        Row: {
          answers: Json
          attempt_number: number | null
          created_at: string | null
          id: number
          quiz_id: number
          score: number
          user_id: string
        }
        Insert: {
          answers: Json
          attempt_number?: number | null
          created_at?: string | null
          id?: number
          quiz_id: number
          score: number
          user_id: string
        }
        Update: {
          answers?: Json
          attempt_number?: number | null
          created_at?: string | null
          id?: number
          quiz_id?: number
          score?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "quiz_responses_quiz_id_fkey"
            columns: ["quiz_id"]
            isOneToOne: false
            referencedRelation: "quizzes"
            referencedColumns: ["id"]
          },
        ]
      }
      quizzes: {
        Row: {
          id: number
          lesson_id: number | null
          max_attempts: number | null
          passing_score: number | null
          title: string
        }
        Insert: {
          id?: number
          lesson_id?: number | null
          max_attempts?: number | null
          passing_score?: number | null
          title: string
        }
        Update: {
          id?: number
          lesson_id?: number | null
          max_attempts?: number | null
          passing_score?: number | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "quizzes_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      user_progress: {
        Row: {
          completed: boolean | null
          completed_at: string | null
          id: number
          lesson_id: number
          user_id: string
        }
        Insert: {
          completed?: boolean | null
          completed_at?: string | null
          id?: number
          lesson_id: number
          user_id: string
        }
        Update: {
          completed?: boolean | null
          completed_at?: string | null
          id?: number
          lesson_id?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_progress_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "ta" | "student"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "ta", "student"],
    },
  },
} as const
