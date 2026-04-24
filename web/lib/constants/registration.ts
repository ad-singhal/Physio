export const SPECIALISATIONS = [
  { value: 'orthopedic', label: 'Orthopedic' },
  { value: 'neuro', label: 'Neurology' },
  { value: 'sports', label: 'Sports' },
  { value: 'cardio', label: 'Cardiology' },
  { value: 'pediatrics', label: 'Pediatrics' },
] as const

export const MODALITIES = [
  { value: 'manual_therapy', label: 'Manual Therapy' },
  { value: 'dry_needling', label: 'Dry Needling' },
  { value: 'exercise_therapy', label: 'Exercise Therapy' },
  { value: 'electrotherapy', label: 'Electrotherapy' },
  { value: 'hydrotherapy', label: 'Hydrotherapy' },
  { value: 'sports_taping', label: 'Sports Taping' },
  { value: 'pilates', label: 'Clinical Pilates' },
] as const

export const MODES = [
  { value: 'online', label: 'Online' },
  { value: 'in_person', label: 'In-Person' },
  { value: 'home_visit', label: 'Home Visit' },
] as const

export const LANGUAGES = [
  'English', 'Hindi', 'Bengali', 'Telugu', 'Marathi',
  'Tamil', 'Urdu', 'Gujarati', 'Kannada', 'Malayalam',
  'Odia', 'Punjabi', 'Assamese', 'Sanskrit',
] as const

export const VOLUME_BUCKETS = [
  { value: 'low', label: 'Low (1–5/yr)' },
  { value: 'medium', label: 'Medium (6–20/yr)' },
  { value: 'high', label: 'High (20+/yr)' },
] as const

export const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Delhi', 'Jammu & Kashmir', 'Ladakh', 'Puducherry', 'Chandigarh',
] as const

export function deriveExperienceTier(years: number): 'junior' | 'mid' | 'senior' {
  if (years <= 3) return 'junior'
  if (years <= 8) return 'mid'
  return 'senior'
}

export const EXPERIENCE_TIER_LABELS = {
  junior: 'Junior (0–3 yrs)',
  mid: 'Mid-level (4–8 yrs)',
  senior: 'Senior (9+ yrs)',
} as const
