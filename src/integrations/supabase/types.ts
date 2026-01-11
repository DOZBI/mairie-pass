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
      admin_settings: {
        Row: {
          description: string | null
          id: string
          setting_key: string
          setting_value: Json
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          description?: string | null
          id?: string
          setting_key: string
          setting_value: Json
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          description?: string | null
          id?: string
          setting_key?: string
          setting_value?: Json
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: []
      }
      ai_football_tickets: {
        Row: {
          base_stake: number | null
          created_at: string | null
          estimated_win_multiplier: number | null
          expires_at: string | null
          id: string
          is_combo: boolean | null
          match_id: string | null
          predictions: Json
          result: string | null
          status: string | null
          ticket_description: string | null
          ticket_name: string
          total_odds: number | null
          total_players: number | null
          total_stake: number | null
          updated_at: string | null
        }
        Insert: {
          base_stake?: number | null
          created_at?: string | null
          estimated_win_multiplier?: number | null
          expires_at?: string | null
          id?: string
          is_combo?: boolean | null
          match_id?: string | null
          predictions?: Json
          result?: string | null
          status?: string | null
          ticket_description?: string | null
          ticket_name: string
          total_odds?: number | null
          total_players?: number | null
          total_stake?: number | null
          updated_at?: string | null
        }
        Update: {
          base_stake?: number | null
          created_at?: string | null
          estimated_win_multiplier?: number | null
          expires_at?: string | null
          id?: string
          is_combo?: boolean | null
          match_id?: string | null
          predictions?: Json
          result?: string | null
          status?: string | null
          ticket_description?: string | null
          ticket_name?: string
          total_odds?: number | null
          total_players?: number | null
          total_stake?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_football_tickets_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_ticket_plays: {
        Row: {
          actual_win: number | null
          ai_ticket_id: string
          created_at: string | null
          id: string
          is_identical_to_proposal: boolean | null
          payment_id: string | null
          potential_win: number | null
          predicted_selections: Json
          stake_amount: number
          status: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          actual_win?: number | null
          ai_ticket_id: string
          created_at?: string | null
          id?: string
          is_identical_to_proposal?: boolean | null
          payment_id?: string | null
          potential_win?: number | null
          predicted_selections: Json
          stake_amount: number
          status?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          actual_win?: number | null
          ai_ticket_id?: string
          created_at?: string | null
          id?: string
          is_identical_to_proposal?: boolean | null
          payment_id?: string | null
          potential_win?: number | null
          predicted_selections?: Json
          stake_amount?: number
          status?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_ticket_plays_ai_ticket_id_fkey"
            columns: ["ai_ticket_id"]
            isOneToOne: false
            referencedRelation: "ai_football_tickets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_ticket_plays_ai_ticket_id_fkey"
            columns: ["ai_ticket_id"]
            isOneToOne: false
            referencedRelation: "ai_ticket_stats"
            referencedColumns: ["ticket_id"]
          },
          {
            foreignKeyName: "ai_ticket_plays_payment_id_fkey"
            columns: ["payment_id"]
            isOneToOne: false
            referencedRelation: "payments"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_ticket_proposals: {
        Row: {
          bonus_count: number | null
          created_at: string | null
          difficulty: Database["public"]["Enums"]["ticket_difficulty"]
          id: string
          lose_count: number
          match_id: string | null
          price: number
          proposal_data: Json | null
          proposed_by: string | null
          quantity: number
          reviewed_at: string | null
          reviewed_by: string | null
          status: string | null
          ticket_type: Database["public"]["Enums"]["ticket_type"]
          total_prize_pool: number | null
          win_count: number
        }
        Insert: {
          bonus_count?: number | null
          created_at?: string | null
          difficulty: Database["public"]["Enums"]["ticket_difficulty"]
          id?: string
          lose_count: number
          match_id?: string | null
          price: number
          proposal_data?: Json | null
          proposed_by?: string | null
          quantity: number
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
          ticket_type: Database["public"]["Enums"]["ticket_type"]
          total_prize_pool?: number | null
          win_count: number
        }
        Update: {
          bonus_count?: number | null
          created_at?: string | null
          difficulty?: Database["public"]["Enums"]["ticket_difficulty"]
          id?: string
          lose_count?: number
          match_id?: string | null
          price?: number
          proposal_data?: Json | null
          proposed_by?: string | null
          quantity?: number
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
          ticket_type?: Database["public"]["Enums"]["ticket_type"]
          total_prize_pool?: number | null
          win_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "ai_ticket_proposals_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action: string
          created_at: string | null
          entity_id: string | null
          entity_type: string
          id: string
          ip_address: string | null
          new_data: Json | null
          old_data: Json | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          entity_id?: string | null
          entity_type: string
          id?: string
          ip_address?: string | null
          new_data?: Json | null
          old_data?: Json | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          entity_id?: string | null
          entity_type?: string
          id?: string
          ip_address?: string | null
          new_data?: Json | null
          old_data?: Json | null
          user_id?: string | null
        }
        Relationships: []
      }
      electronic_tickets: {
        Row: {
          batch_id: string | null
          claimed_at: string | null
          created_at: string
          difficulty: Database["public"]["Enums"]["ticket_difficulty"] | null
          id: string
          is_winner: boolean
          match_id: string | null
          predefined_result: Database["public"]["Enums"]["ticket_result"] | null
          predicted_outcome: string | null
          prize_amount: number | null
          refund_transaction_id: string | null
          refunded: boolean | null
          revealed_at: string | null
          status: Database["public"]["Enums"]["ticket_status"]
          ticket_type: Database["public"]["Enums"]["ticket_type"]
          user_id: string
        }
        Insert: {
          batch_id?: string | null
          claimed_at?: string | null
          created_at?: string
          difficulty?: Database["public"]["Enums"]["ticket_difficulty"] | null
          id?: string
          is_winner?: boolean
          match_id?: string | null
          predefined_result?:
            | Database["public"]["Enums"]["ticket_result"]
            | null
          predicted_outcome?: string | null
          prize_amount?: number | null
          refund_transaction_id?: string | null
          refunded?: boolean | null
          revealed_at?: string | null
          status?: Database["public"]["Enums"]["ticket_status"]
          ticket_type: Database["public"]["Enums"]["ticket_type"]
          user_id: string
        }
        Update: {
          batch_id?: string | null
          claimed_at?: string | null
          created_at?: string
          difficulty?: Database["public"]["Enums"]["ticket_difficulty"] | null
          id?: string
          is_winner?: boolean
          match_id?: string | null
          predefined_result?:
            | Database["public"]["Enums"]["ticket_result"]
            | null
          predicted_outcome?: string | null
          prize_amount?: number | null
          refund_transaction_id?: string | null
          refunded?: boolean | null
          revealed_at?: string | null
          status?: Database["public"]["Enums"]["ticket_status"]
          ticket_type?: Database["public"]["Enums"]["ticket_type"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "electronic_tickets_batch_id_fkey"
            columns: ["batch_id"]
            isOneToOne: false
            referencedRelation: "ticket_batches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "electronic_tickets_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
        ]
      }
      matches: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          match_date: string | null
          name: string
          result: string | null
          status: string | null
          team_a: string | null
          team_b: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          match_date?: string | null
          name: string
          result?: string | null
          status?: string | null
          team_a?: string | null
          team_b?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          match_date?: string | null
          name?: string
          result?: string | null
          status?: string | null
          team_a?: string | null
          team_b?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      payments: {
        Row: {
          amount: number
          completed_at: string | null
          created_at: string | null
          id: string
          metadata: Json | null
          payment_type: string
          phone_number: string
          provider: Database["public"]["Enums"]["payment_provider"]
          provider_reference: string | null
          status: Database["public"]["Enums"]["payment_status"] | null
          ticket_id: string | null
          ticket_type: Database["public"]["Enums"]["ticket_type"] | null
          user_id: string
        }
        Insert: {
          amount: number
          completed_at?: string | null
          created_at?: string | null
          id?: string
          metadata?: Json | null
          payment_type: string
          phone_number: string
          provider: Database["public"]["Enums"]["payment_provider"]
          provider_reference?: string | null
          status?: Database["public"]["Enums"]["payment_status"] | null
          ticket_id?: string | null
          ticket_type?: Database["public"]["Enums"]["ticket_type"] | null
          user_id: string
        }
        Update: {
          amount?: number
          completed_at?: string | null
          created_at?: string | null
          id?: string
          metadata?: Json | null
          payment_type?: string
          phone_number?: string
          provider?: Database["public"]["Enums"]["payment_provider"]
          provider_reference?: string | null
          status?: Database["public"]["Enums"]["payment_status"] | null
          ticket_id?: string | null
          ticket_type?: Database["public"]["Enums"]["ticket_type"] | null
          user_id?: string
        }
        Relationships: []
      }
      physical_tickets: {
        Row: {
          activated_at: string | null
          batch_id: string | null
          claimed_at: string | null
          created_at: string
          difficulty: Database["public"]["Enums"]["ticket_difficulty"] | null
          id: string
          is_winner: boolean
          match_id: string | null
          predefined_result: Database["public"]["Enums"]["ticket_result"] | null
          prize_amount: number | null
          purchased_by: string | null
          refund_transaction_id: string | null
          refunded: boolean | null
          status: Database["public"]["Enums"]["ticket_status"]
          ticket_code: string
          used_at: string | null
        }
        Insert: {
          activated_at?: string | null
          batch_id?: string | null
          claimed_at?: string | null
          created_at?: string
          difficulty?: Database["public"]["Enums"]["ticket_difficulty"] | null
          id?: string
          is_winner?: boolean
          match_id?: string | null
          predefined_result?:
            | Database["public"]["Enums"]["ticket_result"]
            | null
          prize_amount?: number | null
          purchased_by?: string | null
          refund_transaction_id?: string | null
          refunded?: boolean | null
          status?: Database["public"]["Enums"]["ticket_status"]
          ticket_code: string
          used_at?: string | null
        }
        Update: {
          activated_at?: string | null
          batch_id?: string | null
          claimed_at?: string | null
          created_at?: string
          difficulty?: Database["public"]["Enums"]["ticket_difficulty"] | null
          id?: string
          is_winner?: boolean
          match_id?: string | null
          predefined_result?:
            | Database["public"]["Enums"]["ticket_result"]
            | null
          prize_amount?: number | null
          purchased_by?: string | null
          refund_transaction_id?: string | null
          refunded?: boolean | null
          status?: Database["public"]["Enums"]["ticket_status"]
          ticket_code?: string
          used_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "physical_tickets_batch_id_fkey"
            columns: ["batch_id"]
            isOneToOne: false
            referencedRelation: "ticket_batches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "physical_tickets_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
        ]
      }
      premium_tickets: {
        Row: {
          batch_id: string | null
          created_at: string | null
          current_value: number
          growth_index: number | null
          id: string
          initial_value: number
          is_redeemable: boolean | null
          purchase_price: number
          redeemed_at: string | null
          status: Database["public"]["Enums"]["ticket_status"] | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          batch_id?: string | null
          created_at?: string | null
          current_value: number
          growth_index?: number | null
          id?: string
          initial_value: number
          is_redeemable?: boolean | null
          purchase_price: number
          redeemed_at?: string | null
          status?: Database["public"]["Enums"]["ticket_status"] | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          batch_id?: string | null
          created_at?: string | null
          current_value?: number
          growth_index?: number | null
          id?: string
          initial_value?: number
          is_redeemable?: boolean | null
          purchase_price?: number
          redeemed_at?: string | null
          status?: Database["public"]["Enums"]["ticket_status"] | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "premium_tickets_batch_id_fkey"
            columns: ["batch_id"]
            isOneToOne: false
            referencedRelation: "ticket_batches"
            referencedColumns: ["id"]
          },
        ]
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
      refunds: {
        Row: {
          amount: number
          batch_id: string | null
          created_at: string | null
          id: string
          payment_id: string | null
          phone_number: string | null
          processed_at: string | null
          provider: Database["public"]["Enums"]["payment_provider"] | null
          reason: string | null
          status: Database["public"]["Enums"]["payment_status"] | null
          ticket_id: string
          ticket_type: Database["public"]["Enums"]["ticket_type"]
          user_id: string
        }
        Insert: {
          amount: number
          batch_id?: string | null
          created_at?: string | null
          id?: string
          payment_id?: string | null
          phone_number?: string | null
          processed_at?: string | null
          provider?: Database["public"]["Enums"]["payment_provider"] | null
          reason?: string | null
          status?: Database["public"]["Enums"]["payment_status"] | null
          ticket_id: string
          ticket_type: Database["public"]["Enums"]["ticket_type"]
          user_id: string
        }
        Update: {
          amount?: number
          batch_id?: string | null
          created_at?: string | null
          id?: string
          payment_id?: string | null
          phone_number?: string | null
          processed_at?: string | null
          provider?: Database["public"]["Enums"]["payment_provider"] | null
          reason?: string | null
          status?: Database["public"]["Enums"]["payment_status"] | null
          ticket_id?: string
          ticket_type?: Database["public"]["Enums"]["ticket_type"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "refunds_batch_id_fkey"
            columns: ["batch_id"]
            isOneToOne: false
            referencedRelation: "ticket_batches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "refunds_payment_id_fkey"
            columns: ["payment_id"]
            isOneToOne: false
            referencedRelation: "payments"
            referencedColumns: ["id"]
          },
        ]
      }
      ticket_batches: {
        Row: {
          created_at: string | null
          created_by: string | null
          difficulty: Database["public"]["Enums"]["ticket_difficulty"]
          id: string
          is_active: boolean | null
          losing_tickets: number
          match_id: string | null
          name: string
          price: number
          refund_threshold: number | null
          sold_tickets: number
          ticket_type: Database["public"]["Enums"]["ticket_type"]
          total_tickets: number
          updated_at: string | null
          winning_tickets: number
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          difficulty?: Database["public"]["Enums"]["ticket_difficulty"]
          id?: string
          is_active?: boolean | null
          losing_tickets?: number
          match_id?: string | null
          name: string
          price: number
          refund_threshold?: number | null
          sold_tickets?: number
          ticket_type: Database["public"]["Enums"]["ticket_type"]
          total_tickets?: number
          updated_at?: string | null
          winning_tickets?: number
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          difficulty?: Database["public"]["Enums"]["ticket_difficulty"]
          id?: string
          is_active?: boolean | null
          losing_tickets?: number
          match_id?: string | null
          name?: string
          price?: number
          refund_threshold?: number | null
          sold_tickets?: number
          ticket_type?: Database["public"]["Enums"]["ticket_type"]
          total_tickets?: number
          updated_at?: string | null
          winning_tickets?: number
        }
        Relationships: [
          {
            foreignKeyName: "ticket_batches_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
        ]
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
      ai_ticket_stats: {
        Row: {
          identical_percentage: number | null
          identical_plays: number | null
          result: string | null
          status: string | null
          ticket_id: string | null
          ticket_name: string | null
          total_plays: number | null
          total_staked: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      apply_70_percent_refund: {
        Args: { ticket_uuid: string }
        Returns: {
          refunded_count: number
          total_refunded: number
        }[]
      }
      calculate_batch_loss_rate: {
        Args: { batch_uuid: string }
        Returns: number
      }
      distribute_ai_ticket_wins: {
        Args: { ticket_uuid: string }
        Returns: {
          total_distributed: number
          winners_count: number
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: { Args: { _user_id: string }; Returns: boolean }
      is_refund_applicable: { Args: { batch_uuid: string }; Returns: boolean }
      update_premium_values: { Args: never; Returns: undefined }
    }
    Enums: {
      app_role: "admin" | "user"
      document_type:
        | "birth_certificate_extract"
        | "birth_certificate_full"
        | "criminal_record"
      payment_provider: "mtn" | "airtel"
      payment_status: "pending" | "completed" | "failed" | "refunded"
      request_status:
        | "pending"
        | "in_review"
        | "approved"
        | "rejected"
        | "completed"
        | "pending_payment"
      ticket_difficulty: "easy" | "medium" | "hard"
      ticket_result: "pending" | "win" | "lose" | "bonus"
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
      payment_provider: ["mtn", "airtel"],
      payment_status: ["pending", "completed", "failed", "refunded"],
      request_status: [
        "pending",
        "in_review",
        "approved",
        "rejected",
        "completed",
        "pending_payment",
      ],
      ticket_difficulty: ["easy", "medium", "hard"],
      ticket_result: ["pending", "win", "lose", "bonus"],
      ticket_status: ["available", "sold", "used", "expired"],
      ticket_type: ["physical", "electronic", "premium"],
      transaction_type: ["purchase", "win", "refund"],
    },
  },
} as const
