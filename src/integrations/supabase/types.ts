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
      profiles: {
        Row: {
          created_at: string
          emergency_contact_nickname: string | null
          emergency_contact_phone: string | null
          id: string
          nickname: string | null
          sai_nickname: string | null
          scene: string | null
          updated_at: string
          user_id: string
          voice_mode: string | null
          voice_preference: string | null
        }
        Insert: {
          created_at?: string
          emergency_contact_nickname?: string | null
          emergency_contact_phone?: string | null
          id?: string
          nickname?: string | null
          sai_nickname?: string | null
          scene?: string | null
          updated_at?: string
          user_id: string
          voice_mode?: string | null
          voice_preference?: string | null
        }
        Update: {
          created_at?: string
          emergency_contact_nickname?: string | null
          emergency_contact_phone?: string | null
          id?: string
          nickname?: string | null
          sai_nickname?: string | null
          scene?: string | null
          updated_at?: string
          user_id?: string
          voice_mode?: string | null
          voice_preference?: string | null
        }
        Relationships: []
      }
      sai_memory: {
        Row: {
          context: string | null
          created_at: string
          id: string
          interaction_type: string
          pattern_data: Json | null
          user_id: string
        }
        Insert: {
          context?: string | null
          created_at?: string
          id?: string
          interaction_type: string
          pattern_data?: Json | null
          user_id: string
        }
        Update: {
          context?: string | null
          created_at?: string
          id?: string
          interaction_type?: string
          pattern_data?: Json | null
          user_id?: string
        }
        Relationships: []
      }
      sai_user_profiles: {
        Row: {
          adaptation_notes: string | null
          communication_style: string | null
          created_at: string
          id: string
          interaction_count: number | null
          last_mood: string | null
          pacing_preference: string | null
          sensitivity_flags: Json | null
          updated_at: string
          user_id: string
        }
        Insert: {
          adaptation_notes?: string | null
          communication_style?: string | null
          created_at?: string
          id?: string
          interaction_count?: number | null
          last_mood?: string | null
          pacing_preference?: string | null
          sensitivity_flags?: Json | null
          updated_at?: string
          user_id: string
        }
        Update: {
          adaptation_notes?: string | null
          communication_style?: string | null
          created_at?: string
          id?: string
          interaction_count?: number | null
          last_mood?: string | null
          pacing_preference?: string | null
          sensitivity_flags?: Json | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_assessments: {
        Row: {
          circumstance_details: string[] | null
          circumstances: string[] | null
          created_at: string
          disabilities: string[] | null
          has_disabilities: boolean | null
          has_life_circumstances: boolean | null
          id: string
          symptoms: string[] | null
          updated_at: string
          user_id: string
        }
        Insert: {
          circumstance_details?: string[] | null
          circumstances?: string[] | null
          created_at?: string
          disabilities?: string[] | null
          has_disabilities?: boolean | null
          has_life_circumstances?: boolean | null
          id?: string
          symptoms?: string[] | null
          updated_at?: string
          user_id: string
        }
        Update: {
          circumstance_details?: string[] | null
          circumstances?: string[] | null
          created_at?: string
          disabilities?: string[] | null
          has_disabilities?: boolean | null
          has_life_circumstances?: boolean | null
          id?: string
          symptoms?: string[] | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_goals: {
        Row: {
          aligned_safety_items: string[] | null
          assessment_id: string | null
          created_at: string
          description: string | null
          goal_size: string
          id: string
          progress: number | null
          status: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          aligned_safety_items?: string[] | null
          assessment_id?: string | null
          created_at?: string
          description?: string | null
          goal_size: string
          id?: string
          progress?: number | null
          status?: string | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          aligned_safety_items?: string[] | null
          assessment_id?: string | null
          created_at?: string
          description?: string | null
          goal_size?: string
          id?: string
          progress?: number | null
          status?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_goals_assessment_id_fkey"
            columns: ["assessment_id"]
            isOneToOne: false
            referencedRelation: "user_assessments"
            referencedColumns: ["id"]
          },
        ]
      }
      user_safety_plans: {
        Row: {
          calming_activity: string | null
          coping_strategies: string[] | null
          created_at: string
          emergency_contacts: Json | null
          id: string
          is_emergency_plan: boolean | null
          professional_resources: Json | null
          reasons_to_live: string[] | null
          safe_place: string | null
          trusted_person: string | null
          updated_at: string
          user_id: string
          warning_signs: string[] | null
        }
        Insert: {
          calming_activity?: string | null
          coping_strategies?: string[] | null
          created_at?: string
          emergency_contacts?: Json | null
          id?: string
          is_emergency_plan?: boolean | null
          professional_resources?: Json | null
          reasons_to_live?: string[] | null
          safe_place?: string | null
          trusted_person?: string | null
          updated_at?: string
          user_id: string
          warning_signs?: string[] | null
        }
        Update: {
          calming_activity?: string | null
          coping_strategies?: string[] | null
          created_at?: string
          emergency_contacts?: Json | null
          id?: string
          is_emergency_plan?: boolean | null
          professional_resources?: Json | null
          reasons_to_live?: string[] | null
          safe_place?: string | null
          trusted_person?: string | null
          updated_at?: string
          user_id?: string
          warning_signs?: string[] | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
