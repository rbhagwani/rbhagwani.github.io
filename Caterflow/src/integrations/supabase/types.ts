export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      clients: {
        Row: {
          company: string
          created_at: string
          email: string
          id: string
          name: string
          owingcompany: number | null
          phone: string
          updated_at: string
          user_id: string
        }
        Insert: {
          company: string
          created_at?: string
          email: string
          id?: string
          name: string
          owingcompany?: number | null
          phone: string
          updated_at?: string
          user_id: string
        }
        Update: {
          company?: string
          created_at?: string
          email?: string
          id?: string
          name?: string
          owingcompany?: number | null
          phone?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "clients_owingcompany_fkey"
            columns: ["owingcompany"]
            isOneToOne: false
            referencedRelation: "company"
            referencedColumns: ["companyid"]
          },
        ]
      }
      communication_logs: {
        Row: {
          client_id: string | null
          content: string | null
          event_id: string | null
          id: string
          metadata: Json | null
          sent_at: string
          sent_by: string
          status: string | null
          type: string
        }
        Insert: {
          client_id?: string | null
          content?: string | null
          event_id?: string | null
          id?: string
          metadata?: Json | null
          sent_at?: string
          sent_by: string
          status?: string | null
          type: string
        }
        Update: {
          client_id?: string | null
          content?: string | null
          event_id?: string | null
          id?: string
          metadata?: Json | null
          sent_at?: string
          sent_by?: string
          status?: string | null
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "communication_logs_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "communication_logs_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      company: {
        Row: {
          address: string | null
          companyemail: string | null
          companyid: number
          companyname: string | null
          created_at: string
          description: string | null
        }
        Insert: {
          address?: string | null
          companyemail?: string | null
          companyid?: number
          companyname?: string | null
          created_at?: string
          description?: string | null
        }
        Update: {
          address?: string | null
          companyemail?: string | null
          companyid?: number
          companyname?: string | null
          created_at?: string
          description?: string | null
        }
        Relationships: []
      }
      companyuser: {
        Row: {
          companyid: number | null
          companyuserid: number
          created_at: string
          uid: string | null
        }
        Insert: {
          companyid?: number | null
          companyuserid?: number
          created_at?: string
          uid?: string | null
        }
        Update: {
          companyid?: number | null
          companyuserid?: number
          created_at?: string
          uid?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "companyuser_companyid_fkey"
            columns: ["companyid"]
            isOneToOne: false
            referencedRelation: "company"
            referencedColumns: ["companyid"]
          },
        ]
      }
      event_inventory: {
        Row: {
          created_at: string
          event_id: string | null
          id: string
          inventory_id: string | null
          notes: string | null
          quantity_required: number
        }
        Insert: {
          created_at?: string
          event_id?: string | null
          id?: string
          inventory_id?: string | null
          notes?: string | null
          quantity_required: number
        }
        Update: {
          created_at?: string
          event_id?: string | null
          id?: string
          inventory_id?: string | null
          notes?: string | null
          quantity_required?: number
        }
        Relationships: [
          {
            foreignKeyName: "event_inventory_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_inventory_inventory_id_fkey"
            columns: ["inventory_id"]
            isOneToOne: false
            referencedRelation: "inventory"
            referencedColumns: ["id"]
          },
        ]
      }
      event_staff: {
        Row: {
          created_at: string
          end_time: string | null
          event_id: string | null
          id: string
          notes: string | null
          role: string
          staff_id: string | null
          start_time: string | null
        }
        Insert: {
          created_at?: string
          end_time?: string | null
          event_id?: string | null
          id?: string
          notes?: string | null
          role: string
          staff_id?: string | null
          start_time?: string | null
        }
        Update: {
          created_at?: string
          end_time?: string | null
          event_id?: string | null
          id?: string
          notes?: string | null
          role?: string
          staff_id?: string | null
          start_time?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "event_staff_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_staff_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "staff"
            referencedColumns: ["id"]
          },
        ]
      }
      event_types: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          user_id?: string
        }
        Relationships: []
      }
      events: {
        Row: {
          created_at: string
          description: string | null
          dietary_requirements: string | null
          end_time: string | null
          event_date: string
          event_type_id: string | null
          floor_plan: Json | null
          guest_count: number
          id: string
          location: string
          menu: Json | null
          owingcompany: number | null
          seating_arrangement: Json | null
          setup_instructions: string | null
          setup_time: string | null
          staff_notes: string | null
          status: string | null
          status_updates: Json | null
          title: string
          total_amount: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          dietary_requirements?: string | null
          end_time?: string | null
          event_date: string
          event_type_id?: string | null
          floor_plan?: Json | null
          guest_count: number
          id?: string
          location: string
          menu?: Json | null
          owingcompany?: number | null
          seating_arrangement?: Json | null
          setup_instructions?: string | null
          setup_time?: string | null
          staff_notes?: string | null
          status?: string | null
          status_updates?: Json | null
          title: string
          total_amount: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          dietary_requirements?: string | null
          end_time?: string | null
          event_date?: string
          event_type_id?: string | null
          floor_plan?: Json | null
          guest_count?: number
          id?: string
          location?: string
          menu?: Json | null
          owingcompany?: number | null
          seating_arrangement?: Json | null
          setup_instructions?: string | null
          setup_time?: string | null
          staff_notes?: string | null
          status?: string | null
          status_updates?: Json | null
          title?: string
          total_amount?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "events_event_type_id_fkey"
            columns: ["event_type_id"]
            isOneToOne: false
            referencedRelation: "event_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "events_owingcompany_fkey"
            columns: ["owingcompany"]
            isOneToOne: false
            referencedRelation: "company"
            referencedColumns: ["companyid"]
          },
        ]
      }
      inventory: {
        Row: {
          category: string | null
          cost_per_unit: number | null
          created_at: string
          id: string
          location: string | null
          name: string
          quantity: number
          reorder_point: number | null
          supplier_info: Json | null
          unit: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          category?: string | null
          cost_per_unit?: number | null
          created_at?: string
          id?: string
          location?: string | null
          name: string
          quantity?: number
          reorder_point?: number | null
          supplier_info?: Json | null
          unit?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: string | null
          cost_per_unit?: number | null
          created_at?: string
          id?: string
          location?: string | null
          name?: string
          quantity?: number
          reorder_point?: number | null
          supplier_info?: Json | null
          unit?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      orders: {
        Row: {
          created_at: string
          customer_name: string
          delivery_date: string
          id: string
          items: Json
          order_date: string
          owingcompany: number | null
          special_instructions: string | null
          status: string | null
          total_amount: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          customer_name: string
          delivery_date: string
          id?: string
          items: Json
          order_date?: string
          owingcompany?: number | null
          special_instructions?: string | null
          status?: string | null
          total_amount: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          customer_name?: string
          delivery_date?: string
          id?: string
          items?: Json
          order_date?: string
          owingcompany?: number | null
          special_instructions?: string | null
          status?: string | null
          total_amount?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_owingcompany_fkey"
            columns: ["owingcompany"]
            isOneToOne: false
            referencedRelation: "company"
            referencedColumns: ["companyid"]
          },
        ]
      }
      recipes: {
        Row: {
          category: string | null
          cost: number | null
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          ingredients: Json
          instructions: string[]
          name: string
          owingcompany: number | null
          preparation_time: number | null
          serving_size: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          category?: string | null
          cost?: number | null
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          ingredients: Json
          instructions: string[]
          name: string
          owingcompany?: number | null
          preparation_time?: number | null
          serving_size?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: string | null
          cost?: number | null
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          ingredients?: Json
          instructions?: string[]
          name?: string
          owingcompany?: number | null
          preparation_time?: number | null
          serving_size?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "recipes_owingcompany_fkey"
            columns: ["owingcompany"]
            isOneToOne: false
            referencedRelation: "company"
            referencedColumns: ["companyid"]
          },
        ]
      }
      staff: {
        Row: {
          availability: Json | null
          contact_number: string | null
          created_at: string
          email: string | null
          hourly_rate: number | null
          id: string
          name: string
          role: string
          skills: string[] | null
          updated_at: string
          user_id: string
        }
        Insert: {
          availability?: Json | null
          contact_number?: string | null
          created_at?: string
          email?: string | null
          hourly_rate?: number | null
          id?: string
          name: string
          role: string
          skills?: string[] | null
          updated_at?: string
          user_id: string
        }
        Update: {
          availability?: Json | null
          contact_number?: string | null
          created_at?: string
          email?: string | null
          hourly_rate?: number | null
          id?: string
          name?: string
          role?: string
          skills?: string[] | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      tasks: {
        Row: {
          assigned_to: string | null
          created_at: string
          created_by: string
          description: string | null
          due_date: string | null
          event_id: string | null
          id: string
          priority: string | null
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          created_at?: string
          created_by: string
          description?: string | null
          due_date?: string | null
          event_id?: string | null
          id?: string
          priority?: string | null
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          created_at?: string
          created_by?: string
          description?: string | null
          due_date?: string | null
          event_id?: string | null
          id?: string
          priority?: string | null
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasks_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "staff"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_company_id: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
