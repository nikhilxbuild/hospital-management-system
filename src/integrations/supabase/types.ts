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
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      appointments: {
        Row: {
          created_at: string
          date: string
          disease: string | null
          doctor_id: string | null
          doctor_name: string
          fee: number | null
          id: string
          lab_report: string | null
          next_visit: string | null
          notes: string | null
          patient_id: string | null
          patient_name: string
          prescription: string | null
          slot: string
          status: string
          token: string
        }
        Insert: {
          created_at?: string
          date: string
          disease?: string | null
          doctor_id?: string | null
          doctor_name: string
          fee?: number | null
          id?: string
          lab_report?: string | null
          next_visit?: string | null
          notes?: string | null
          patient_id?: string | null
          patient_name: string
          prescription?: string | null
          slot: string
          status?: string
          token: string
        }
        Update: {
          created_at?: string
          date?: string
          disease?: string | null
          doctor_id?: string | null
          doctor_name?: string
          fee?: number | null
          id?: string
          lab_report?: string | null
          next_visit?: string | null
          notes?: string | null
          patient_id?: string | null
          patient_name?: string
          prescription?: string | null
          slot?: string
          status?: string
          token?: string
        }
        Relationships: [
          {
            foreignKeyName: "appointments_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "doctors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      billing: {
        Row: {
          amount: number
          appointment_id: string | null
          created_at: string
          date: string
          doctor_name: string
          id: string
          patient_name: string
          status: string
        }
        Insert: {
          amount: number
          appointment_id?: string | null
          created_at?: string
          date: string
          doctor_name: string
          id?: string
          patient_name: string
          status?: string
        }
        Update: {
          amount?: number
          appointment_id?: string | null
          created_at?: string
          date?: string
          doctor_name?: string
          id?: string
          patient_name?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "billing_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
        ]
      }
      contact_messages: {
        Row: {
          created_at: string
          email: string
          id: string
          message: string
          name: string
          phone: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          message: string
          name: string
          phone?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          message?: string
          name?: string
          phone?: string | null
        }
        Relationships: []
      }
      doctors: {
        Row: {
          about: string | null
          available: boolean
          available_days: string[] | null
          available_slots: string[] | null
          created_at: string
          experience: number
          fee: number
          id: string
          img_emoji: string | null
          max_patients_per_day: number
          name: string
          password: string | null
          patients_count: number | null
          rating: number
          specialty: string
          username: string | null
        }
        Insert: {
          about?: string | null
          available?: boolean
          available_days?: string[] | null
          available_slots?: string[] | null
          created_at?: string
          experience?: number
          fee?: number
          id?: string
          img_emoji?: string | null
          max_patients_per_day?: number
          name: string
          password?: string | null
          patients_count?: number | null
          rating?: number
          specialty: string
          username?: string | null
        }
        Update: {
          about?: string | null
          available?: boolean
          available_days?: string[] | null
          available_slots?: string[] | null
          created_at?: string
          experience?: number
          fee?: number
          id?: string
          img_emoji?: string | null
          max_patients_per_day?: number
          name?: string
          password?: string | null
          patients_count?: number | null
          rating?: number
          specialty?: string
          username?: string | null
        }
        Relationships: []
      }
      otp_codes: {
        Row: {
          created_at: string | null
          expires_at: string
          id: string
          otp_code: string
          phone: string
          verified: boolean | null
        }
        Insert: {
          created_at?: string | null
          expires_at: string
          id?: string
          otp_code: string
          phone: string
          verified?: boolean | null
        }
        Update: {
          created_at?: string | null
          expires_at?: string
          id?: string
          otp_code?: string
          phone?: string
          verified?: boolean | null
        }
        Relationships: []
      }
      patients: {
        Row: {
          address: string | null
          age: number | null
          blood_group: string | null
          created_at: string
          email: string | null
          id: string
          name: string
          phone: string | null
          user_id: string | null
        }
        Insert: {
          address?: string | null
          age?: number | null
          blood_group?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name: string
          phone?: string | null
          user_id?: string | null
        }
        Update: {
          address?: string | null
          age?: number | null
          blood_group?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name?: string
          phone?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      sms_log: {
        Row: {
          id: string
          message: string
          patient_name: string
          phone: string
          sent_at: string
          status: string
        }
        Insert: {
          id?: string
          message: string
          patient_name: string
          phone: string
          sent_at?: string
          status?: string
        }
        Update: {
          id?: string
          message?: string
          patient_name?: string
          phone?: string
          sent_at?: string
          status?: string
        }
        Relationships: []
      }
      staff_users: {
        Row: {
          created_at: string
          doctor_id: string | null
          id: string
          password: string
          role: Database["public"]["Enums"]["staff_role"]
          username: string
        }
        Insert: {
          created_at?: string
          doctor_id?: string | null
          id?: string
          password: string
          role: Database["public"]["Enums"]["staff_role"]
          username: string
        }
        Update: {
          created_at?: string
          doctor_id?: string | null
          id?: string
          password?: string
          role?: Database["public"]["Enums"]["staff_role"]
          username?: string
        }
        Relationships: [
          {
            foreignKeyName: "staff_users_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "doctors"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      staff_role: "admin" | "doctor" | "receptionist"
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
      staff_role: ["admin", "doctor", "receptionist"],
    },
  },
} as const
