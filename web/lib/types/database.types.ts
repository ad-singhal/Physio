export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  public: {
    Tables: {
      // Shared tables (D-001 through D-013 from iOS schema)
      users: {
        Row: {
          id: string
          email: string
          full_name: string
          profile_photo_url: string | null
          date_of_birth: string | null
          gender: string | null
          phone: string | null
          created_at: string
        }
        Insert: {
          id?: string
          email: string
          full_name: string
          profile_photo_url?: string | null
          date_of_birth?: string | null
          gender?: string | null
          phone?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string
          profile_photo_url?: string | null
          date_of_birth?: string | null
          gender?: string | null
          phone?: string | null
          created_at?: string
        }
        Relationships: []
      }
      onboarding_responses: {
        Row: {
          id: string
          patient_id: string
          general_info: Json
          health_profile: Json
          pain_profile: Json
          created_at: string
        }
        Insert: {
          id?: string
          patient_id: string
          general_info?: Json
          health_profile?: Json
          pain_profile?: Json
          created_at?: string
        }
        Update: {
          id?: string
          patient_id?: string
          general_info?: Json
          health_profile?: Json
          pain_profile?: Json
          created_at?: string
        }
        Relationships: []
      }
      matches: {
        Row: {
          id: string
          physio_id: string
          patient_id: string
          status: 'pending' | 'active' | 'completed' | 'cancelled'
          created_at: string
        }
        Insert: {
          id?: string
          physio_id: string
          patient_id: string
          status?: 'pending' | 'active' | 'completed' | 'cancelled'
          created_at?: string
        }
        Update: {
          id?: string
          physio_id?: string
          patient_id?: string
          status?: 'pending' | 'active' | 'completed' | 'cancelled'
          created_at?: string
        }
        Relationships: []
      }
      consultations: {
        Row: {
          id: string
          physio_id: string
          patient_id: string
          match_id: string
          scheduled_at: string
          duration_minutes: number | null
          status: 'scheduled' | 'completed' | 'cancelled'
          consultation_type: 'online' | 'in_person' | 'home_visit' | null
          created_at: string
        }
        Insert: {
          id?: string
          physio_id: string
          patient_id: string
          match_id: string
          scheduled_at: string
          duration_minutes?: number | null
          status?: 'scheduled' | 'completed' | 'cancelled'
          consultation_type?: 'online' | 'in_person' | 'home_visit' | null
          created_at?: string
        }
        Update: {
          id?: string
          physio_id?: string
          patient_id?: string
          match_id?: string
          scheduled_at?: string
          duration_minutes?: number | null
          status?: 'scheduled' | 'completed' | 'cancelled'
          consultation_type?: 'online' | 'in_person' | 'home_visit' | null
          created_at?: string
        }
        Relationships: []
      }
      programs: {
        Row: {
          id: string
          physio_id: string
          patient_id: string
          match_id: string | null
          title: string
          description: string | null
          target_condition: string | null
          status: 'draft' | 'published'
          duration_weeks: number
          published_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          physio_id: string
          patient_id: string
          match_id?: string | null
          title: string
          description?: string | null
          target_condition?: string | null
          status?: 'draft' | 'published'
          duration_weeks?: number
          published_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          physio_id?: string
          patient_id?: string
          match_id?: string | null
          title?: string
          description?: string | null
          target_condition?: string | null
          status?: 'draft' | 'published'
          duration_weeks?: number
          published_at?: string | null
          created_at?: string
        }
        Relationships: []
      }
      program_days: {
        Row: {
          id: string
          program_id: string
          week_number: number
          day_number: number
          title: string | null
          exercises: Json
          order_index: number
        }
        Insert: {
          id?: string
          program_id: string
          week_number: number
          day_number: number
          title?: string | null
          exercises?: Json
          order_index?: number
        }
        Update: {
          id?: string
          program_id?: string
          week_number?: number
          day_number?: number
          title?: string | null
          exercises?: Json
          order_index?: number
        }
        Relationships: []
      }
      exercises: {
        Row: {
          id: string
          title: string
          description: string | null
          body_region: string | null
          difficulty: 'beginner' | 'intermediate' | 'advanced' | null
          video_url: string | null
          thumbnail_url: string | null
          instructions: string | null
          created_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          body_region?: string | null
          difficulty?: 'beginner' | 'intermediate' | 'advanced' | null
          video_url?: string | null
          thumbnail_url?: string | null
          instructions?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          body_region?: string | null
          difficulty?: 'beginner' | 'intermediate' | 'advanced' | null
          video_url?: string | null
          thumbnail_url?: string | null
          instructions?: string | null
          created_at?: string
        }
        Relationships: []
      }
      session_logs: {
        Row: {
          id: string
          patient_id: string
          program_id: string
          program_day_id: string | null
          completed_at: string
          pain_score_before: number | null
          pain_score_after: number | null
          notes: string | null
        }
        Insert: {
          id?: string
          patient_id: string
          program_id: string
          program_day_id?: string | null
          completed_at?: string
          pain_score_before?: number | null
          pain_score_after?: number | null
          notes?: string | null
        }
        Update: {
          id?: string
          patient_id?: string
          program_id?: string
          program_day_id?: string | null
          completed_at?: string
          pain_score_before?: number | null
          pain_score_after?: number | null
          notes?: string | null
        }
        Relationships: []
      }
      messages: {
        Row: {
          id: string
          match_id: string
          sender_id: string
          sender_type: 'physio' | 'patient'
          content: string
          created_at: string
          read_at: string | null
        }
        Insert: {
          id?: string
          match_id: string
          sender_id: string
          sender_type: 'physio' | 'patient'
          content: string
          created_at?: string
          read_at?: string | null
        }
        Update: {
          id?: string
          match_id?: string
          sender_id?: string
          sender_type?: 'physio' | 'patient'
          content?: string
          created_at?: string
          read_at?: string | null
        }
        Relationships: []
      }
      payment_plans: {
        Row: {
          id: string
          program_id: string
          tier_name: string
          fee: number
          call_frequency: string | null
          features: string[]
          status: 'active' | 'inactive'
        }
        Insert: {
          id?: string
          program_id: string
          tier_name: string
          fee?: number
          call_frequency?: string | null
          features?: string[]
          status?: 'active' | 'inactive'
        }
        Update: {
          id?: string
          program_id?: string
          tier_name?: string
          fee?: number
          call_frequency?: string | null
          features?: string[]
          status?: 'active' | 'inactive'
        }
        Relationships: []
      }
      // Physio-specific tables
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

// Shared tables (from iOS schema, D-001 through D-013)
export type Patient = {
  id: string
  email: string
  full_name: string
  profile_photo_url: string | null
  date_of_birth: string | null
  gender: string | null
  phone: string | null
  created_at: string
}

export type OnboardingResponse = {
  id: string
  patient_id: string
  general_info: Json
  health_profile: Json
  pain_profile: Json
  created_at: string
}

export type Match = {
  id: string
  physio_id: string
  patient_id: string
  status: 'pending' | 'active' | 'completed' | 'cancelled'
  created_at: string
  patient?: Patient
}

export type Consultation = {
  id: string
  physio_id: string
  patient_id: string
  match_id: string
  scheduled_at: string
  duration_minutes: number | null
  status: 'scheduled' | 'completed' | 'cancelled'
  consultation_type: 'online' | 'in_person' | 'home_visit' | null
  created_at: string
}

export type Program = {
  id: string
  physio_id: string
  patient_id: string
  match_id: string | null
  title: string
  description: string | null
  target_condition: string | null
  status: 'draft' | 'published'
  duration_weeks: number
  published_at: string | null
  created_at: string
}

export type ProgramDay = {
  id: string
  program_id: string
  week_number: number
  day_number: number
  title: string | null
  exercises: Json
  order_index: number
}

export type Exercise = {
  id: string
  title: string
  description: string | null
  body_region: string | null
  difficulty: 'beginner' | 'intermediate' | 'advanced' | null
  video_url: string | null
  thumbnail_url: string | null
  instructions: string | null
  created_at: string
}

export type SessionLog = {
  id: string
  patient_id: string
  program_id: string
  program_day_id: string | null
  completed_at: string
  pain_score_before: number | null
  pain_score_after: number | null
  notes: string | null
}

export type Message = {
  id: string
  match_id: string
  sender_id: string
  sender_type: 'physio' | 'patient'
  content: string
  created_at: string
  read_at: string | null
}

export type PaymentPlan = {
  id: string
  program_id: string
  tier_name: string
  fee: number
  call_frequency: string | null
  features: string[]
  status: 'active' | 'inactive'
}

// Programme builder local types
export type BuilderExercise = {
  exerciseId: string
  title: string
  sets: number
  reps: number
  restSeconds: number
  order: number
}

export type BuilderDay = {
  id: string
  weekNumber: number
  dayNumber: number
  title: string
  exercises: BuilderExercise[]
}

export type BuilderTier = {
  name: string
  fee: number
  callFrequency: string
  features: string[]
}

export type BuilderState = {
  title: string
  description: string
  targetCondition: string
  durationWeeks: number
  tiers: BuilderTier[]
  days: BuilderDay[]
}
