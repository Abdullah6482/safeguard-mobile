import { supabase } from './supabase'
import { uploadPhoto, deletePhoto } from './storage'

export function createSubmissionId() {
  return `mobile-${Date.now()}-${Math.random().toString(36).slice(2, 12)}`
}

export async function submitIncident(payload) {
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) throw Object.assign(new Error('Your session has expired. Please sign in again.'), { retryable: false })

  const { data: existing } = await supabase.from('incidents')
    .select('*').eq('client_submission_id', payload.clientSubmissionId).maybeSingle()
  if (existing) return existing

  let photoUrl = payload.photoUrl || null
  let uploadedNow = false
  if (!photoUrl && payload.details?.photoUri) {
    const result = await uploadPhoto(payload.details.photoUri, user.id, payload.clientSubmissionId)
    if (result.error) throw Object.assign(new Error(`Photo upload failed: ${result.error.message || result.error}`), { retryable: true })
    photoUrl = result.url
    uploadedNow = true
  }

  const row = {
    client_submission_id: payload.clientSubmissionId,
    reporter_id: user.id,
    incident_type: payload.incidentType || 'Near Miss',
    status: 'reported',
    incident_at: payload.context?.dateTime || new Date().toISOString(),
    work_activity: payload.context?.workActivity || null,
    reported_to: payload.context?.reportedTo || null,
    investigator_id: payload.context?.reportedToId || null,
    description: payload.details?.description || null,
    location_label: payload.details?.locationLabel || null,
    location_lat: payload.details?.latitude ?? null,
    location_lng: payload.details?.longitude ?? null,
    witnesses: payload.details?.witnesses || null,
    immediate_action: payload.details?.immediateAction || null,
    photo_url: photoUrl,
    initial_risk_x: payload.initialRisk?.x || 1,
    initial_risk_y: payload.initialRisk?.y || 1,
  }

  const { data, error } = await supabase.from('incidents').insert(row).select().single()

  if (error) {
    if (uploadedNow && photoUrl) await deletePhoto(photoUrl)
    if (error.code === '23505') {
      const { data: duplicate } = await supabase.from('incidents')
        .select('*').eq('client_submission_id', payload.clientSubmissionId).single()
      if (duplicate) return duplicate
    }
    throw Object.assign(new Error(error.message), { retryable: ![400, 401, 403, 404, 422].includes(error.status) })
  }
  return data
}
