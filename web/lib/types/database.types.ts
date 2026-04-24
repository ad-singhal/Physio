export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  public: {
    Tables: {
      physiotherapists: {
        Row: {
          id: string
          email: string
          full_name: string
          profile_photo_url: string | null
          bio: string | null
          location_city: string | null
          location_postcode: string | null
          lat: number | null
          lng: number | null
          languages: string[]
          rating: number | null
          years_experience: number | null
          experience_tier: 'junior' | 'mid' | 'senior' | null
          specialisations: string[]
          modalities: string[]
          modes: string[]
          affiliation_name: string | null
          affiliation_verified: boolean
          iap_member: boolean
          verification_status: 'pending' | 'verified' | 'rejected' | 'needs_info'
          rejection_reason: string | null
          last_verified_at: string | null
          created_at: string
        }
        Insert: {
          id: string
          email: string
          full_name: string
          profile_photo_url?: string | null
          bio?: string | null
          location_city?: string | null
          location_postcode?: string | null
          lat?: number | null
          lng?: number | null
          languages?: string[]
          rating?: number | null
          years_experience?: number | null
          experience_tier?: 'junior' | 'mid' | 'senior' | null
          specialisations?: string[]
          modalities?: string[]
          modes?: string[]
          affiliation_name?: string | null
          affiliation_verified?: boolean
          iap_member?: boolean
          verification_status?: 'pending' | 'verified' | 'rejected' | 'needs_info'
          rejection_reason?: string | null
          last_verified_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string
          profile_photo_url?: string | null
          bio?: string | null
          location_city?: string | null
          location_postcode?: string | null
          lat?: number | null
          lng?: number | null
          languages?: string[]
          rating?: number | null
          years_experience?: number | null
          experience_tier?: 'junior' | 'mid' | 'senior' | null
          specialisations?: string[]
          modalities?: string[]
          modes?: string[]
          affiliation_name?: string | null
          affiliation_verified?: boolean
          iap_member?: boolean
          verification_status?: 'pending' | 'verified' | 'rejected' | 'needs_info'
          rejection_reason?: string | null
          last_verified_at?: string | null
          created_at?: string
        }
        Relationships: []
      }
      physio_credentials: {
        Row: {
          id: string
          physio_id: string
          bpt_university: string
          bpt_year: number
          bpt_doc_url: string
          mpt_specialisation: string | null
          mpt_university: string | null
          mpt_year: number | null
          mpt_doc_url: string | null
          state_council_state: string
          state_council_number: string
          state_council_verified_at: string | null
        }
        Insert: {
          id?: string
          physio_id: string
          bpt_university: string
          bpt_year: number
          bpt_doc_url: string
          mpt_specialisation?: string | null
          mpt_university?: string | null
          mpt_year?: number | null
          mpt_doc_url?: string | null
          state_council_state: string
          state_council_number: string
          state_council_verified_at?: string | null
        }
        Update: {
          id?: string
          physio_id?: string
          bpt_university?: string
          bpt_year?: number
          bpt_doc_url?: string
          mpt_specialisation?: string | null
          mpt_university?: string | null
          mpt_year?: number | null
          mpt_doc_url?: string | null
          state_council_state?: string
          state_council_number?: string
          state_council_verified_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "physio_credentials_physio_id_fkey"
            columns: ["physio_id"]
            isOneToOne: true
            referencedRelation: "physiotherapists"
            referencedColumns: ["id"]
          }
        ]
      }
      physio_certifications: {
        Row: {
          id: string
          physio_id: string
          name: string
          issuer: string
          year: number
          doc_url: string | null
        }
        Insert: {
          id?: string
          physio_id: string
          name: string
          issuer: string
          year: number
          doc_url?: string | null
        }
        Update: {
          id?: string
          physio_id?: string
          name?: string
          issuer?: string
          year?: number
          doc_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "physio_certifications_physio_id_fkey"
            columns: ["physio_id"]
            isOneToOne: false
            referencedRelation: "physiotherapists"
            referencedColumns: ["id"]
          }
        ]
      }
      physio_conditions_treated: {
        Row: {
          id: string
          physio_id: string
          condition: string
          volume_bucket: 'low' | 'medium' | 'high'
          notes: string | null
        }
        Insert: {
          id?: string
          physio_id: string
          condition: string
          volume_bucket: 'low' | 'medium' | 'high'
          notes?: string | null
        }
        Update: {
          id?: string
          physio_id?: string
          condition?: string
          volume_bucket?: 'low' | 'medium' | 'high'
          notes?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "physio_conditions_treated_physio_id_fkey"
            columns: ["physio_id"]
            isOneToOne: false
            referencedRelation: "physiotherapists"
            referencedColumns: ["id"]
          }
        ]
      }
      availability_slots: {
        Row: {
          id: string
          physio_id: string
          date: string
          start_time: string
          end_time: string
          status: 'available' | 'booked' | 'blocked'
        }
        Insert: {
          id?: string
          physio_id: string
          date: string
          start_time: string
          end_time: string
          status?: 'available' | 'booked' | 'blocked'
        }
        Update: {
          id?: string
          physio_id?: string
          date?: string
          start_time?: string
          end_time?: string
          status?: 'available' | 'booked' | 'blocked'
        }
        Relationships: [
          {
            foreignKeyName: "availability_slots_physio_id_fkey"
            columns: ["physio_id"]
            isOneToOne: false
            referencedRelation: "physiotherapists"
            referencedColumns: ["id"]
          }
        ]
      }
      consultation_notes: {
        Row: {
          id: string
          consultation_id: string
          physio_id: string
          notes: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          consultation_id: string
          physio_id: string
          notes?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          consultation_id?: string
          physio_id?: string
          notes?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "consultation_notes_physio_id_fkey"
            columns: ["physio_id"]
            isOneToOne: false
            referencedRelation: "physiotherapists"
            referencedColumns: ["id"]
          }
        ]
      }
      program_drafts: {
        Row: {
          id: string
          program_id: string
          physio_id: string
          draft_state: Json
          last_saved_at: string
        }
        Insert: {
          id?: string
          program_id: string
          physio_id: string
          draft_state?: Json
          last_saved_at?: string
        }
        Update: {
          id?: string
          program_id?: string
          physio_id?: string
          draft_state?: Json
          last_saved_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "program_drafts_physio_id_fkey"
            columns: ["physio_id"]
            isOneToOne: false
            referencedRelation: "physiotherapists"
            referencedColumns: ["id"]
          }
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
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

// Convenience row types
export type Physiotherapist = Database['public']['Tables']['physiotherapists']['Row']
export type PhysioCredentials = Database['public']['Tables']['physio_credentials']['Row']
export type PhysioCertification = Database['public']['Tables']['physio_certifications']['Row']
export type PhysioConditionTreated = Database['public']['Tables']['physio_conditions_treated']['Row']
export type AvailabilitySlot = Database['public']['Tables']['availability_slots']['Row']
export type ConsultationNote = Database['public']['Tables']['consultation_notes']['Row']
export type ProgramDraft = Database['public']['Tables']['program_drafts']['Row']
