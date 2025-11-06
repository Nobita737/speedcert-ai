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
      coupon_usage: {
        Row: {
          coupon_id: string | null
          discount_applied: number
          final_price: number
          id: string
          original_price: number
          payment_id: string | null
          used_at: string | null
          user_id: string | null
        }
        Insert: {
          coupon_id?: string | null
          discount_applied: number
          final_price: number
          id?: string
          original_price: number
          payment_id?: string | null
          used_at?: string | null
          user_id?: string | null
        }
        Update: {
          coupon_id?: string | null
          discount_applied?: number
          final_price?: number
          id?: string
          original_price?: number
          payment_id?: string | null
          used_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "coupon_usage_coupon_id_fkey"
            columns: ["coupon_id"]
            isOneToOne: false
            referencedRelation: "coupons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "coupon_usage_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      coupons: {
        Row: {
          code: string
          created_at: string | null
          created_by: string | null
          description: string | null
          discount_type: string
          discount_value: number
          id: string
          is_active: boolean | null
          max_discount: number | null
          min_purchase_amount: number | null
          updated_at: string | null
          usage_count: number | null
          usage_limit: number | null
          valid_from: string | null
          valid_until: string | null
        }
        Insert: {
          code: string
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          discount_type: string
          discount_value: number
          id?: string
          is_active?: boolean | null
          max_discount?: number | null
          min_purchase_amount?: number | null
          updated_at?: string | null
          usage_count?: number | null
          usage_limit?: number | null
          valid_from?: string | null
          valid_until?: string | null
        }
        Update: {
          code?: string
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          discount_type?: string
          discount_value?: number
          id?: string
          is_active?: boolean | null
          max_discount?: number | null
          min_purchase_amount?: number | null
          updated_at?: string | null
          usage_count?: number | null
          usage_limit?: number | null
          valid_from?: string | null
          valid_until?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "coupons_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
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
          profile_completed: boolean | null
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
          profile_completed?: boolean | null
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
          profile_completed?: boolean | null
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
      referral_codes: {
        Row: {
          code: string
          created_at: string | null
          id: string
          is_active: boolean | null
          user_id: string
        }
        Insert: {
          code: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          user_id: string
        }
        Update: {
          code?: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "referral_codes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      referral_points: {
        Row: {
          available_points: number | null
          id: string
          pending_points: number | null
          redeemed_points: number | null
          total_points: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          available_points?: number | null
          id?: string
          pending_points?: number | null
          redeemed_points?: number | null
          total_points?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          available_points?: number | null
          id?: string
          pending_points?: number | null
          redeemed_points?: number | null
          total_points?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "referral_points_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      referral_redemptions: {
        Row: {
          completed_at: string | null
          created_at: string | null
          id: string
          points_used: number
          redemption_details: Json | null
          redemption_type: Database["public"]["Enums"]["redemption_type"]
          status: Database["public"]["Enums"]["redemption_status"] | null
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          id?: string
          points_used: number
          redemption_details?: Json | null
          redemption_type: Database["public"]["Enums"]["redemption_type"]
          status?: Database["public"]["Enums"]["redemption_status"] | null
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          id?: string
          points_used?: number
          redemption_details?: Json | null
          redemption_type?: Database["public"]["Enums"]["redemption_type"]
          status?: Database["public"]["Enums"]["redemption_status"] | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "referral_redemptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      referral_rewards: {
        Row: {
          created_at: string | null
          id: string
          points_earned: number
          reason: string
          referral_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          points_earned: number
          reason: string
          referral_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          points_earned?: number
          reason?: string
          referral_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "referral_rewards_referral_id_fkey"
            columns: ["referral_id"]
            isOneToOne: false
            referencedRelation: "referrals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "referral_rewards_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      referral_settings: {
        Row: {
          id: string
          setting_key: string
          setting_value: Json
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          id?: string
          setting_key: string
          setting_value: Json
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          id?: string
          setting_key?: string
          setting_value?: Json
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "referral_settings_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      referrals: {
        Row: {
          created_at: string | null
          enrolled_at: string | null
          id: string
          points_awarded: number | null
          referee_id: string
          referral_code: string
          referrer_id: string
          status: Database["public"]["Enums"]["referral_status"] | null
        }
        Insert: {
          created_at?: string | null
          enrolled_at?: string | null
          id?: string
          points_awarded?: number | null
          referee_id: string
          referral_code: string
          referrer_id: string
          status?: Database["public"]["Enums"]["referral_status"] | null
        }
        Update: {
          created_at?: string | null
          enrolled_at?: string | null
          id?: string
          points_awarded?: number | null
          referee_id?: string
          referral_code?: string
          referrer_id?: string
          status?: Database["public"]["Enums"]["referral_status"] | null
        }
        Relationships: [
          {
            foreignKeyName: "referrals_referee_id_fkey"
            columns: ["referee_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "referrals_referrer_id_fkey"
            columns: ["referrer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
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
      questions_for_quiz: {
        Row: {
          choices: Json | null
          id: number | null
          order_index: number | null
          quiz_id: number | null
          text: string | null
        }
        Insert: {
          choices?: Json | null
          id?: number | null
          order_index?: number | null
          quiz_id?: number | null
          text?: string | null
        }
        Update: {
          choices?: Json | null
          id?: number | null
          order_index?: number | null
          quiz_id?: number | null
          text?: string | null
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
    }
    Functions: {
      apply_coupon: {
        Args: {
          p_coupon_id: string
          p_discount: number
          p_original_price: number
          p_payment_id: string
          p_user_id: string
        }
        Returns: string
      }
      check_redemption_eligibility: {
        Args: { p_points_needed: number; p_user_id: string }
        Returns: boolean
      }
      generate_referral_code: { Args: { p_user_id: string }; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      process_redemption: {
        Args: {
          p_details: Json
          p_points: number
          p_type: Database["public"]["Enums"]["redemption_type"]
          p_user_id: string
        }
        Returns: string
      }
      validate_coupon: {
        Args: { p_amount: number; p_code: string; p_user_id: string }
        Returns: Json
      }
    }
    Enums: {
      app_role: "admin" | "ta" | "student"
      redemption_status: "pending" | "completed" | "rejected"
      redemption_type: "course_unlock" | "coupon" | "badge"
      referral_status:
        | "pending"
        | "enrolled_free"
        | "enrolled_paid"
        | "cancelled"
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
      redemption_status: ["pending", "completed", "rejected"],
      redemption_type: ["course_unlock", "coupon", "badge"],
      referral_status: [
        "pending",
        "enrolled_free",
        "enrolled_paid",
        "cancelled",
      ],
    },
  },
} as const
