import { supabase } from './supabase'

function rpcError(error) {
  const err = new Error(error?.message || 'The workflow update failed.')
  err.code = error?.code
  err.retryable = !['22023', '42501', 'P0002'].includes(error?.code)
  return err
}

export async function claimIncident(incident) {
  const { data, error } = await supabase.rpc('claim_incident', {
    p_incident_id: incident.id,
    p_expected_updated_at: incident.updated_at,
  })
  if (error) throw rpcError(error)
  return data
}

export async function submitInvestigation(incident, values) {
  const impact = values.impactWorkingDays === '' ? 0 : Number(values.impactWorkingDays)
  if (!Number.isInteger(impact) || impact < 0) throw new Error('Days lost must be a non-negative whole number.')

  const { data, error } = await supabase.rpc('submit_investigation', {
    p_incident_id: incident.id,
    p_expected_updated_at: incident.updated_at,
    p_pillar_people: values.pillarRatings.people,
    p_pillar_asset: values.pillarRatings.asset,
    p_pillar_environment: values.pillarRatings.environment,
    p_pillar_reputation: values.pillarRatings.reputation,
    p_overall_risk: values.overallRisk,
    p_root_cause_category: values.rootCauseCategory,
    p_root_cause_detail: values.rootCauseDetail.trim(),
    p_capa_action: values.capaAction.trim(),
    p_capa_owner: values.capaOwnerId,
    p_capa_due_date: values.capaDueDate,
    p_forwarded_to_hospital: values.forwardedToHospital,
    p_impact_working_days: impact,
    p_investigator_notes: values.investigatorNotes.trim(),
  })
  if (error) throw rpcError(error)
  return data
}
