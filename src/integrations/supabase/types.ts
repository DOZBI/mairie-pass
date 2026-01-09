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
      electronic_tickets: {
        Row: {
          created_at: string
          id: string
          is_winner: boolean
          prize_amount: number | null
          revealed_at: string | null
          status: Database["public"]["Enums"]["ticket_status"]
          ticket_type: Database["public"]["Enums"]["ticket_type"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_winner?: boolean
          prize_amount?: number | null
          revealed_at?: string | null
          status?: Database["public"]["Enums"]["ticket_status"]
          ticket_type: Database["public"]["Enums"]["ticket_type"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_winner?: boolean
          prize_amount?: number | null
          revealed_at?: string | null
          status?: Database["public"]["Enums"]["ticket_status"]
          ticket_type?: Database["public"]["Enums"]["ticket_type"]
          user_id?: string
        }
        Relationships: []
      }
      physical_tickets: {
        Row: {
          created_at: string
          id: string
          is_winner: boolean
          prize_amount: number | null
          purchased_by: string | null
          status: Database["public"]["Enums"]["ticket_status"]
          ticket_code: string
          used_at: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          is_winner?: boolean
          prize_amount?: number | null
          purchased_by?: string | null
          status?: Database["public"]["Enums"]["ticket_status"]
          ticket_code: string
          used_at?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          is_winner?: boolean
          prize_amount?: number | null
          purchased_by?: string | null
          status?: Database["public"]["Enums"]["ticket_status"]
          ticket_code?: string
          used_at?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          address: string | null
          city_hall_name: string
          created_at: string
          email: string | null
          first_name: string
          id: string
          identity_card_back_url: string | null
          identity_card_front_url: string | null
          last_name: string
          neighborhood: string
          phone: string
          updated_at: string
          user_id: string
        }
        Insert: {
          address?: string | null
          city_hall_name: string
          created_at?: string
          email?: string | null
          first_name: string
          id?: string
          identity_card_back_url?: string | null
          identity_card_front_url?: string | null
          last_name: string
          neighborhood: string
          phone: string
          updated_at?: string
          user_id: string
        }
        Update: {
          address?: string | null
          city_hall_name?: string
          created_at?: string
          email?: string | null
          first_name?: string
          id?: string
          identity_card_back_url?: string | null
          identity_card_front_url?: string | null
          last_name?: string
          neighborhood?: string
          phone?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      ticket_prices: {
        Row: {
          created_at: string
          id: string
          premium_multiplier: number | null
          price: number
          ticket_type: Database["public"]["Enums"]["ticket_type"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          premium_multiplier?: number | null
          price?: number
          ticket_type: Database["public"]["Enums"]["ticket_type"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          premium_multiplier?: number | null
          price?: number
          ticket_type?: Database["public"]["Enums"]["ticket_type"]
          updated_at?: string
        }
        Relationships: []
      }
      ticket_transactions: {
        Row: {
          amount: number
          created_at: string
          description: string | null
          electronic_ticket_id: string | null
          id: string
          physical_ticket_id: string | null
          ticket_type: Database["public"]["Enums"]["ticket_type"] | null
          transaction_type: Database["public"]["Enums"]["transaction_type"]
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          description?: string | null
          electronic_ticket_id?: string | null
          id?: string
          physical_ticket_id?: string | null
          ticket_type?: Database["public"]["Enums"]["ticket_type"] | null
          transaction_type: Database["public"]["Enums"]["transaction_type"]
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          description?: string | null
          electronic_ticket_id?: string | null
          id?: string
          physical_ticket_id?: string | null
          ticket_type?: Database["public"]["Enums"]["ticket_type"] | null
          transaction_type?: Database["public"]["Enums"]["transaction_type"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ticket_transactions_electronic_ticket_id_fkey"
            columns: ["electronic_ticket_id"]
            isOneToOne: false
            referencedRelation: "electronic_tickets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ticket_transactions_physical_ticket_id_fkey"
            columns: ["physical_ticket_id"]
            isOneToOne: false
            referencedRelation: "physical_tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      user_wallets: {
        Row: {
          balance: number
          created_at: string
          id: string
          total_spent: number
          total_won: number
          updated_at: string
          user_id: string
        }
        Insert: {
          balance?: number
          created_at?: string
          id?: string
          total_spent?: number
          total_won?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          balance?: number
          created_at?: string
          id?: string
          total_spent?: number
          total_won?: number
          updated_at?: string
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
      is_admin: { Args: { _user_id: string }; Returns: boolean }
    }
    Enums: {
      app_role: "admin" | "user"
      document_type:
        | "birth_certificate_extract"
        | "birth_certificate_full"
        | "criminal_record"
      request_status:
        | "pending"
        | "in_review"
        | "approved"
        | "rejected"
        | "completed"
        | "pending_payment"
      ticket_status: "available" | "sold" | "used" | "expired"
      ticket_type: "physical" | "electronic" | "premium"
      transaction_type: "purchase" | "win" | "refund"
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
      app_role: ["admin", "user"],
      document_type: [
        "birth_certificate_extract",
        "birth_certificate_full",
        "criminal_record",
      ],
      request_status: [
        "pending",
        "in_review",
        "approved",
        "rejected",
        "completed",
        "pending_payment",
      ],
      ticket_status: ["available", "sold", "used", "expired"],
      ticket_type: ["physical", "electronic", "premium"],
      transaction_type: ["purchase", "win", "refund"],
    },
  },
} as const
