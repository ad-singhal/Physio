-- =============================================================
-- B-W-002: PhysioConnect Web — Physio-side Schema
-- =============================================================

-- =============================================================
-- D-W-001: physiotherapists
-- =============================================================
CREATE TABLE IF NOT EXISTS physiotherapists (
  id                   uuid        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email                text        NOT NULL,
  full_name            text        NOT NULL,
  profile_photo_url    text,
  bio                  text,
  location_city        text,
  location_postcode    text,
  lat                  float,
  lng                  float,
  languages            text[]      NOT NULL DEFAULT '{}',
  rating               float,
  years_experience     int,
  experience_tier      text        CHECK (experience_tier IN ('junior', 'mid', 'senior')),
  specialisations      text[]      NOT NULL DEFAULT '{}',
  modalities           text[]      NOT NULL DEFAULT '{}',
  modes                text[]      NOT NULL DEFAULT '{}',
  affiliation_name     text,
  affiliation_verified bool        NOT NULL DEFAULT false,
  iap_member           bool        NOT NULL DEFAULT false,
  verification_status  text        NOT NULL DEFAULT 'pending'
                                   CHECK (verification_status IN ('pending', 'verified', 'rejected', 'needs_info')),
  rejection_reason     text,
  last_verified_at     timestamptz,
  created_at           timestamptz NOT NULL DEFAULT now()
);

-- =============================================================
-- D-W-002: physio_credentials
-- =============================================================
CREATE TABLE IF NOT EXISTS physio_credentials (
  id                        uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  physio_id                 uuid NOT NULL REFERENCES physiotherapists(id) ON DELETE CASCADE,
  bpt_university            text NOT NULL,
  bpt_year                  int  NOT NULL,
  bpt_doc_url               text NOT NULL,
  mpt_specialisation        text,
  mpt_university            text,
  mpt_year                  int,
  mpt_doc_url               text,
  state_council_state       text NOT NULL,
  state_council_number      text NOT NULL,
  state_council_verified_at timestamptz
);

-- =============================================================
-- D-W-003: physio_certifications
-- =============================================================
CREATE TABLE IF NOT EXISTS physio_certifications (
  id        uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  physio_id uuid NOT NULL REFERENCES physiotherapists(id) ON DELETE CASCADE,
  name      text NOT NULL,
  issuer    text NOT NULL,
  year      int  NOT NULL,
  doc_url   text
);

-- =============================================================
-- D-W-004: physio_conditions_treated
-- =============================================================
CREATE TABLE IF NOT EXISTS physio_conditions_treated (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  physio_id     uuid NOT NULL REFERENCES physiotherapists(id) ON DELETE CASCADE,
  condition     text NOT NULL,
  volume_bucket text NOT NULL CHECK (volume_bucket IN ('low', 'medium', 'high')),
  notes         text
);

-- =============================================================
-- D-W-005: availability_slots
-- =============================================================
CREATE TABLE IF NOT EXISTS availability_slots (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  physio_id  uuid NOT NULL REFERENCES physiotherapists(id) ON DELETE CASCADE,
  date       date NOT NULL,
  start_time time NOT NULL,
  end_time   time NOT NULL,
  status     text NOT NULL DEFAULT 'available'
             CHECK (status IN ('available', 'booked', 'blocked'))
);

-- =============================================================
-- D-W-006: consultation_notes
-- physio_id added (not in spec) — required for RLS without
-- needing to join the shared iOS consultations table.
-- =============================================================
CREATE TABLE IF NOT EXISTS consultation_notes (
  id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  consultation_id uuid        NOT NULL,
  physio_id       uuid        NOT NULL REFERENCES physiotherapists(id) ON DELETE CASCADE,
  notes           text        NOT NULL DEFAULT '',
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER consultation_notes_updated_at
  BEFORE UPDATE ON consultation_notes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- =============================================================
-- D-W-007: program_drafts
-- physio_id added (not in spec) — required for RLS without
-- needing to join the shared iOS programs table.
-- =============================================================
CREATE TABLE IF NOT EXISTS program_drafts (
  id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id    uuid        NOT NULL,
  physio_id     uuid        NOT NULL REFERENCES physiotherapists(id) ON DELETE CASCADE,
  draft_state   jsonb       NOT NULL DEFAULT '{}',
  last_saved_at timestamptz NOT NULL DEFAULT now()
);

-- =============================================================
-- Row Level Security
-- =============================================================

ALTER TABLE physiotherapists        ENABLE ROW LEVEL SECURITY;
ALTER TABLE physio_credentials      ENABLE ROW LEVEL SECURITY;
ALTER TABLE physio_certifications   ENABLE ROW LEVEL SECURITY;
ALTER TABLE physio_conditions_treated ENABLE ROW LEVEL SECURITY;
ALTER TABLE availability_slots      ENABLE ROW LEVEL SECURITY;
ALTER TABLE consultation_notes      ENABLE ROW LEVEL SECURITY;
ALTER TABLE program_drafts          ENABLE ROW LEVEL SECURITY;

-- physiotherapists
CREATE POLICY "physio_select_own"  ON physiotherapists FOR SELECT USING (auth.uid() = id);
CREATE POLICY "physio_insert_own"  ON physiotherapists FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "physio_update_own"  ON physiotherapists FOR UPDATE USING (auth.uid() = id);

-- physio_credentials
CREATE POLICY "credentials_all_own" ON physio_credentials
  FOR ALL USING (auth.uid() = physio_id) WITH CHECK (auth.uid() = physio_id);

-- physio_certifications
CREATE POLICY "certifications_all_own" ON physio_certifications
  FOR ALL USING (auth.uid() = physio_id) WITH CHECK (auth.uid() = physio_id);

-- physio_conditions_treated
CREATE POLICY "conditions_all_own" ON physio_conditions_treated
  FOR ALL USING (auth.uid() = physio_id) WITH CHECK (auth.uid() = physio_id);

-- availability_slots: physio manages own; iOS patients can read available slots
CREATE POLICY "slots_all_own" ON availability_slots
  FOR ALL USING (auth.uid() = physio_id) WITH CHECK (auth.uid() = physio_id);
CREATE POLICY "slots_read_available" ON availability_slots
  FOR SELECT USING (status = 'available');

-- consultation_notes: physio manages own; patients can read their consultation notes
CREATE POLICY "notes_all_own" ON consultation_notes
  FOR ALL USING (auth.uid() = physio_id) WITH CHECK (auth.uid() = physio_id);

-- program_drafts
CREATE POLICY "drafts_all_own" ON program_drafts
  FOR ALL USING (auth.uid() = physio_id) WITH CHECK (auth.uid() = physio_id);

-- =============================================================
-- Storage buckets
-- =============================================================

INSERT INTO storage.buckets (id, name, public)
  VALUES ('physio-documents', 'physio-documents', false)
  ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
  VALUES ('profile-photos', 'profile-photos', true)
  ON CONFLICT (id) DO NOTHING;

-- physio-documents: private — physio reads/writes files under their own uid folder
CREATE POLICY "doc_upload_own" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'physio-documents'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );
CREATE POLICY "doc_read_own" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'physio-documents'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );
CREATE POLICY "doc_delete_own" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'physio-documents'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- profile-photos: public read, physio writes own
CREATE POLICY "photo_public_read" ON storage.objects
  FOR SELECT USING (bucket_id = 'profile-photos');
CREATE POLICY "photo_upload_own" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'profile-photos'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );
CREATE POLICY "photo_update_own" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'profile-photos'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );
