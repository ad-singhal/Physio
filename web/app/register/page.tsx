'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { deriveExperienceTier } from '@/lib/constants/registration'
import { StepIndicator } from './_components/step-indicator'
import { Step1Account, type Step1Values } from './_components/step1-account'
import { Step2Professional, type Step2Values } from './_components/step2-professional'
import { Step3Credentials, type Step3Values, type Step3Files } from './_components/step3-credentials'
import { Confirmation } from './_components/confirmation'

interface FormState {
  step1?: Step1Values
  step2?: Step2Values
}

export default function RegisterPage() {
  const [step, setStep] = useState(1)
  const [done, setDone] = useState(false)
  const [formState, setFormState] = useState<FormState>({})
  const [step1Error, setStep1Error] = useState<string | null>(null)
  const [step1Loading, setStep1Loading] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitLoading, setSubmitLoading] = useState(false)

  const supabase = createClient()

  // ── Step 1: Create Supabase Auth account ──────────────────────────────────
  async function handleStep1(values: Step1Values) {
    setStep1Error(null)
    setStep1Loading(true)

    const { error } = await supabase.auth.signUp({
      email: values.email,
      password: values.password,
      options: { data: { full_name: values.full_name } },
    })

    setStep1Loading(false)

    if (error) {
      setStep1Error(
        error.message.includes('already registered')
          ? 'An account with this email already exists. Please sign in instead.'
          : error.message
      )
      return
    }

    setFormState((prev) => ({ ...prev, step1: values }))
    setStep(2)
  }

  // ── Step 2: Save professional info in memory ──────────────────────────────
  function handleStep2(values: Step2Values) {
    setFormState((prev) => ({ ...prev, step2: values }))
    setStep(3)
  }

  // ── Step 3: Upload files + write all rows ─────────────────────────────────
  async function handleStep3(values: Step3Values, files: Step3Files) {
    setSubmitError(null)
    setSubmitLoading(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Session expired. Please start registration again.')

      const uid = user.id
      const s1 = formState.step1!
      const s2 = formState.step2!

      // ── Upload BPT document ──
      const bptPath = `${uid}/bpt/${files.bpt_doc!.name}`
      const { error: bptUploadError } = await supabase.storage
        .from('physio-documents')
        .upload(bptPath, files.bpt_doc!, { upsert: true })
      if (bptUploadError) throw new Error('BPT upload failed: ' + bptUploadError.message)

      // ── Upload MPT document (optional) ──
      let mptPath: string | null = null
      if (files.mpt_doc && values.mpt_specialisation) {
        mptPath = `${uid}/mpt/${files.mpt_doc.name}`
        const { error: mptUploadError } = await supabase.storage
          .from('physio-documents')
          .upload(mptPath, files.mpt_doc, { upsert: true })
        if (mptUploadError) throw new Error('MPT upload failed: ' + mptUploadError.message)
      }

      // ── Upload additional certification documents ──
      const certPaths: (string | null)[] = []
      for (let i = 0; i < values.additional_certifications.length; i++) {
        const doc = files.cert_docs[i]
        if (doc) {
          const path = `${uid}/certifications/${i}-${doc.name}`
          const { error: certUploadError } = await supabase.storage
            .from('physio-documents')
            .upload(path, doc, { upsert: true })
          if (certUploadError) throw new Error(`Certification ${i + 1} upload failed: ` + certUploadError.message)
          certPaths.push(path)
        } else {
          certPaths.push(null)
        }
      }

      // ── Write physiotherapists row ──
      const { error: physioError } = await supabase.from('physiotherapists').insert({
        id: uid,
        email: s1.email,
        full_name: s1.full_name,
        specialisations: s2.specialisations,
        modalities: s2.modalities,
        modes: s2.modes,
        years_experience: s2.years_experience,
        experience_tier: deriveExperienceTier(s2.years_experience),
        bio: s2.bio,
        languages: s2.languages,
        location_city: s2.location_city,
        location_postcode: s2.location_postcode,
        iap_member: s2.iap_member,
        affiliation_name: s2.affiliation_name || null,
        verification_status: 'pending',
      })
      if (physioError) throw new Error('Profile save failed: ' + physioError.message)

      // ── Write physio_credentials row ──
      const { error: credError } = await supabase.from('physio_credentials').insert({
        physio_id: uid,
        bpt_university: values.bpt_university,
        bpt_year: values.bpt_year,
        bpt_doc_url: bptPath,
        mpt_specialisation: values.mpt_specialisation || null,
        mpt_university: values.mpt_university || null,
        mpt_year: values.mpt_year ? Number(values.mpt_year) : null,
        mpt_doc_url: mptPath,
        state_council_state: s2.state_council_state,
        state_council_number: s2.state_council_number,
      })
      if (credError) throw new Error('Credentials save failed: ' + credError.message)

      // ── Write physio_certifications rows ──
      if (values.additional_certifications.length > 0) {
        const { error: certError } = await supabase.from('physio_certifications').insert(
          values.additional_certifications.map((cert, i) => ({
            physio_id: uid,
            name: cert.name,
            issuer: cert.issuer,
            year: cert.year,
            doc_url: certPaths[i],
          }))
        )
        if (certError) throw new Error('Certifications save failed: ' + certError.message)
      }

      // ── Write physio_conditions_treated rows ──
      if (s2.conditions_treated.length > 0) {
        const { error: condError } = await supabase.from('physio_conditions_treated').insert(
          s2.conditions_treated.map((c) => ({
            physio_id: uid,
            condition: c.condition,
            volume_bucket: c.volume_bucket,
            notes: c.notes || null,
          }))
        )
        if (condError) throw new Error('Conditions save failed: ' + condError.message)
      }

      // Sign out — user must wait for admin verification before accessing the dashboard
      await supabase.auth.signOut()
      setDone(true)
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
    } finally {
      setSubmitLoading(false)
    }
  }

  const titles = [
    'Create your account',
    'Professional information',
    'Credentials & documents',
  ]

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 py-10 px-4">
      <div className="mx-auto w-full max-w-2xl space-y-8">
        {/* Header */}
        <div className="text-center space-y-1">
          <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-blue-600 mb-2">
            <span className="text-white font-bold">P</span>
          </div>
          <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">Apply to Join PhysioConnect</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Complete all 3 steps to submit your application for review.
          </p>
        </div>

        <div className="rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900 p-6 md:p-8 space-y-6">
          {done ? (
            <Confirmation />
          ) : (
            <>
              <StepIndicator current={step} />

              <div>
                <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">{titles[step - 1]}</h2>
              </div>

              {step === 1 && (
                <Step1Account
                  defaultValues={formState.step1}
                  onNext={handleStep1}
                  error={step1Error}
                  loading={step1Loading}
                />
              )}
              {step === 2 && (
                <Step2Professional
                  defaultValues={formState.step2}
                  onNext={handleStep2}
                  onBack={() => setStep(1)}
                />
              )}
              {step === 3 && (
                <Step3Credentials
                  onSubmit={handleStep3}
                  onBack={() => setStep(2)}
                  error={submitError}
                  loading={submitLoading}
                />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
