'use client'

import { useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Camera, Loader2, Check } from 'lucide-react'
import type { Physiotherapist, PhysioCredentials, PhysioCertification, PhysioConditionTreated } from '@/lib/types/database.types'
import { cn } from '@/lib/utils'

const SPECIALISATION_OPTIONS = ['orthopedic', 'neuro', 'sports', 'cardio', 'pediatrics']
const MODALITY_OPTIONS = ['manual_therapy', 'dry_needling', 'exercise_therapy', 'electrotherapy', 'hydrotherapy']
const MODE_OPTIONS = ['online', 'in_person', 'home_visit']
const LANGUAGE_OPTIONS = ['English', 'Hindi', 'Tamil', 'Telugu', 'Kannada', 'Marathi', 'Bengali', 'Gujarati']

const TABS = [
  { id: 'profile', label: 'Profile' },
  { id: 'settings', label: 'Settings' },
] as const
type TabId = (typeof TABS)[number]['id']

type Props = {
  physio: Physiotherapist
  credentials: PhysioCredentials | null
  certifications: PhysioCertification[]
  conditions: PhysioConditionTreated[]
}

export function ProfileSettings({ physio, credentials, certifications: _certifications, conditions: _conditions }: Props) {
  const supabase = createClient()
  const router = useRouter()
  const [tab, setTab] = useState<TabId>('profile')

  // Profile form state
  const [form, setForm] = useState({
    full_name: physio.full_name,
    bio: physio.bio ?? '',
    location_city: physio.location_city ?? '',
    location_postcode: physio.location_postcode ?? '',
    years_experience: physio.years_experience ?? 0,
    specialisations: physio.specialisations,
    modalities: physio.modalities,
    modes: physio.modes,
    affiliation_name: physio.affiliation_name ?? '',
    iap_member: physio.iap_member,
    languages: physio.languages,
  })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [photoUrl, setPhotoUrl] = useState(physio.profile_photo_url)
  const fileRef = useRef<HTMLInputElement>(null)

  // Password change state
  const [password, setPassword] = useState({ current: '', next: '', confirm: '' })
  const [pwSaving, setPwSaving] = useState(false)
  const [pwError, setPwError] = useState<string | null>(null)
  const [pwSaved, setPwSaved] = useState(false)

  // Notification preferences
  const [notifPrefs, setNotifPrefs] = useState({
    newMessages: true,
    sessionCompletions: true,
    newBookings: true,
  })
  const [notifPermission, setNotifPermission] = useState<NotificationPermission | null>(
    typeof Notification !== 'undefined' ? Notification.permission : null
  )

  function updateForm<K extends keyof typeof form>(key: K, value: typeof form[K]) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  function toggleArray(key: 'specialisations' | 'modalities' | 'modes' | 'languages', value: string) {
    setForm((f) => {
      const arr = f[key] as string[]
      const next = arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value]
      return { ...f, [key]: next }
    })
  }

  async function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    const ext = file.name.split('.').pop()
    const path = `${physio.id}.${ext}`
    const { data, error } = await supabase.storage
      .from('profile-photos')
      .upload(path, file, { upsert: true })

    if (!error && data) {
      const { data: publicUrl } = supabase.storage.from('profile-photos').getPublicUrl(data.path)
      await supabase.from('physiotherapists').update({ profile_photo_url: publicUrl.publicUrl }).eq('id', physio.id)
      setPhotoUrl(publicUrl.publicUrl)
    }
    setUploading(false)
  }

  async function handleSaveProfile() {
    setSaving(true)
    setSaveError(null)
    setSaved(false)

    const experienceTier =
      form.years_experience <= 3 ? 'junior' : form.years_experience <= 8 ? 'mid' : 'senior'

    const { error } = await supabase
      .from('physiotherapists')
      .update({
        full_name: form.full_name,
        bio: form.bio || null,
        location_city: form.location_city || null,
        location_postcode: form.location_postcode || null,
        years_experience: form.years_experience,
        experience_tier: experienceTier,
        specialisations: form.specialisations,
        modalities: form.modalities,
        modes: form.modes,
        affiliation_name: form.affiliation_name || null,
        iap_member: form.iap_member,
        languages: form.languages,
      })
      .eq('id', physio.id)

    if (error) {
      setSaveError('Save failed. Please try again.')
    } else {
      setSaved(true)
      router.refresh()
      setTimeout(() => setSaved(false), 3000)
    }
    setSaving(false)
  }

  async function handleChangePassword() {
    setPwError(null)
    if (password.next !== password.confirm) {
      setPwError('Passwords do not match.')
      return
    }
    if (password.next.length < 8) {
      setPwError('Password must be at least 8 characters.')
      return
    }
    setPwSaving(true)
    const { error } = await supabase.auth.updateUser({ password: password.next })
    if (error) {
      setPwError(error.message)
    } else {
      setPwSaved(true)
      setPassword({ current: '', next: '', confirm: '' })
      setTimeout(() => setPwSaved(false), 3000)
    }
    setPwSaving(false)
  }

  async function requestNotifications() {
    if (typeof Notification === 'undefined') return
    const perm = await Notification.requestPermission()
    setNotifPermission(perm)
  }

  return (
    <div className="max-w-2xl space-y-4">
      {/* Tab switcher */}
      <div className="flex gap-0.5 rounded-lg bg-muted p-1 w-fit">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              'rounded-md px-4 py-1.5 text-sm font-medium transition-all',
              tab === t.id
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'profile' && (
        <div className="space-y-4">
          {/* Photo */}
          <Card>
            <CardHeader>
              <CardTitle>Profile Photo</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <div className="relative h-20 w-20 rounded-full bg-blue-600 overflow-hidden flex items-center justify-center">
                  {photoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={photoUrl} alt="Profile" className="h-full w-full object-cover" />
                  ) : (
                    <span className="text-white font-bold text-2xl">{form.full_name.charAt(0)}</span>
                  )}
                  {uploading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                      <Loader2 className="h-5 w-5 text-white animate-spin" />
                    </div>
                  )}
                </div>
                <div>
                  <Button variant="outline" size="sm" onClick={() => fileRef.current?.click()} disabled={uploading}>
                    <Camera className="h-3.5 w-3.5" />
                    Change Photo
                  </Button>
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handlePhotoUpload}
                  />
                  <p className="text-xs text-muted-foreground mt-1">JPG, PNG up to 5MB</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Basic info */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="full_name">Full Name</Label>
                  <Input
                    id="full_name"
                    value={form.full_name}
                    onChange={(e) => updateForm('full_name', e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="years_exp">Years of Experience</Label>
                  <Input
                    id="years_exp"
                    type="number"
                    min={0}
                    value={form.years_experience}
                    onChange={(e) => updateForm('years_experience', parseInt(e.target.value) || 0)}
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  placeholder="A short professional bio…"
                  value={form.bio}
                  onChange={(e) => updateForm('bio', e.target.value)}
                  rows={3}
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    placeholder="Mumbai"
                    value={form.location_city}
                    onChange={(e) => updateForm('location_city', e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="postcode">Postcode</Label>
                  <Input
                    id="postcode"
                    placeholder="400001"
                    value={form.location_postcode}
                    onChange={(e) => updateForm('location_postcode', e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="affiliation">Affiliation</Label>
                <Input
                  id="affiliation"
                  placeholder="Hospital or clinic name"
                  value={form.affiliation_name}
                  onChange={(e) => updateForm('affiliation_name', e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Specialisations */}
          <Card>
            <CardHeader>
              <CardTitle>Specialisations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {SPECIALISATION_OPTIONS.map((s) => (
                  <label key={s} className="flex items-center gap-2 cursor-pointer">
                    <Checkbox
                      checked={form.specialisations.includes(s)}
                      onCheckedChange={() => toggleArray('specialisations', s)}
                    />
                    <span className="text-sm capitalize">{s}</span>
                  </label>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Modalities */}
          <Card>
            <CardHeader>
              <CardTitle>Treatment Modalities</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {MODALITY_OPTIONS.map((m) => (
                  <label key={m} className="flex items-center gap-2 cursor-pointer">
                    <Checkbox
                      checked={form.modalities.includes(m)}
                      onCheckedChange={() => toggleArray('modalities', m)}
                    />
                    <span className="text-sm capitalize">{m.replace(/_/g, ' ')}</span>
                  </label>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Consultation modes */}
          <Card>
            <CardHeader>
              <CardTitle>Consultation Modes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                {MODE_OPTIONS.map((mode) => (
                  <label key={mode} className="flex items-center gap-2 cursor-pointer">
                    <Checkbox
                      checked={form.modes.includes(mode)}
                      onCheckedChange={() => toggleArray('modes', mode)}
                    />
                    <span className="text-sm capitalize">{mode.replace(/_/g, ' ')}</span>
                  </label>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Languages */}
          <Card>
            <CardHeader>
              <CardTitle>Languages Spoken</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {LANGUAGE_OPTIONS.map((lang) => (
                  <label key={lang} className="flex items-center gap-2 cursor-pointer">
                    <Checkbox
                      checked={form.languages.includes(lang)}
                      onCheckedChange={() => toggleArray('languages', lang)}
                    />
                    <span className="text-sm">{lang}</span>
                  </label>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* IAP */}
          <Card>
            <CardHeader>
              <CardTitle>IAP Membership</CardTitle>
            </CardHeader>
            <CardContent>
              <label className="flex items-center gap-2 cursor-pointer">
                <Checkbox
                  checked={form.iap_member}
                  onCheckedChange={(v) => updateForm('iap_member', !!v)}
                />
                <span className="text-sm">Member of Indian Association of Physiotherapists (IAP)</span>
              </label>
            </CardContent>
          </Card>

          {/* Save */}
          <div className="flex items-center gap-3">
            {saveError && <p className="text-sm text-destructive">{saveError}</p>}
            <Button onClick={handleSaveProfile} disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Saving…
                </>
              ) : saved ? (
                <>
                  <Check className="h-3.5 w-3.5" />
                  Saved
                </>
              ) : (
                'Save Profile'
              )}
            </Button>
          </div>

          {/* Credentials info */}
          {credentials && (
            <Card>
              <CardHeader>
                <CardTitle>Credentials</CardTitle>
              </CardHeader>
              <CardContent>
                <dl className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <dt className="text-muted-foreground">BPT University</dt>
                    <dd className="font-medium text-foreground mt-0.5">{credentials.bpt_university}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">BPT Year</dt>
                    <dd className="font-medium text-foreground mt-0.5">{credentials.bpt_year}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">State Council</dt>
                    <dd className="font-medium text-foreground mt-0.5">{credentials.state_council_state}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Registration No.</dt>
                    <dd className="font-medium text-foreground mt-0.5">{credentials.state_council_number}</dd>
                  </div>
                </dl>
                <p className="text-xs text-muted-foreground mt-3">
                  Credential changes require admin re-verification. Contact support to update.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {tab === 'settings' && (
        <div className="space-y-4">
          {/* Password change */}
          <Card>
            <CardHeader>
              <CardTitle>Change Password</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-1.5">
                <Label>New Password</Label>
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={password.next}
                  onChange={(e) => setPassword((p) => ({ ...p, next: e.target.value }))}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Confirm Password</Label>
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={password.confirm}
                  onChange={(e) => setPassword((p) => ({ ...p, confirm: e.target.value }))}
                />
              </div>
              {pwError && <p className="text-sm text-destructive">{pwError}</p>}
              {pwSaved && <p className="text-sm text-green-600">Password updated successfully.</p>}
              <Button size="sm" onClick={handleChangePassword} disabled={pwSaving}>
                {pwSaving ? 'Updating…' : 'Update Password'}
              </Button>
            </CardContent>
          </Card>

          {/* Notification preferences */}
          <Card>
            <CardHeader>
              <CardTitle>Browser Notifications</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {notifPermission === 'denied' && (
                <div className="rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 px-4 py-3 text-sm text-amber-700 dark:text-amber-400">
                  Notifications are blocked. To enable, go to your browser settings → Site settings → Notifications → Allow for this site.
                </div>
              )}
              {notifPermission !== 'granted' && notifPermission !== 'denied' && (
                <Button variant="outline" size="sm" onClick={requestNotifications}>
                  Enable Browser Notifications
                </Button>
              )}
              {notifPermission === 'granted' && (
                <div className="space-y-3">
                  {[
                    { key: 'newMessages' as const, label: 'New messages from patients' },
                    { key: 'sessionCompletions' as const, label: 'Patient session completions' },
                    { key: 'newBookings' as const, label: 'New consultation bookings' },
                  ].map(({ key, label }) => (
                    <label key={key} className="flex items-center gap-2 cursor-pointer">
                      <Checkbox
                        checked={notifPrefs[key]}
                        onCheckedChange={(v) => setNotifPrefs((p) => ({ ...p, [key]: !!v }))}
                      />
                      <span className="text-sm">{label}</span>
                    </label>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Sign out */}
          <Card>
            <CardHeader>
              <CardTitle>Account</CardTitle>
            </CardHeader>
            <CardContent>
              <a href="/api/auth/signout">
                <Button variant="destructive" size="sm">Sign Out</Button>
              </a>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
