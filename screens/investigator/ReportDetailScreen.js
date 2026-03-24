import { useEffect, useState } from 'react'
import {
    View, Text, StyleSheet, TouchableOpacity,
    ScrollView, SafeAreaView, ActivityIndicator,
} from 'react-native'
import { supabase } from '../../lib/supabase'

const C = {
    bg: '#070B13', surface: '#0D1422', panel: '#121C30',
    border: 'rgba(255,255,255,0.07)',
    blue: '#2563EB', blueLight: '#3B82F6',
    amber: '#FBBF24', orange: '#F97316',
    green: '#10B981', red: '#EF4444', yellow: '#F59E0B',
    cyan: '#06B6D4',
    text: '#F1F5F9', sub: '#94A3B8', muted: '#475569',
}

const CELL_COLOR = (x, y) => {
    const s = x * y
    if (s >= 15) return '#DC2626'
    if (s >= 9)  return '#EA580C'
    if (s >= 5)  return '#CA8A04'
    return '#16A34A'
}

const riskFromXY = (x, y) => {
    const s = x * y
    if (s >= 15) return { label: 'High',   color: C.red }
    if (s >= 5)  return { label: 'Medium', color: C.yellow }
    return              { label: 'Low',    color: C.green }
}

const typeColor = (t) =>
    t === 'Near Miss' ? C.yellow : t === 'Potential' ? C.orange : C.red

function InfoRow({ icon, label, value }) {
    return (
        <View style={styles.infoRow}>
            <Text style={styles.infoIcon}>{icon}</Text>
            <View style={styles.infoBody}>
                <Text style={styles.infoLabel}>{label}</Text>
                <Text style={styles.infoValue}>{value || '—'}</Text>
            </View>
        </View>
    )
}

function Pill({ label, color }) {
    return (
        <View style={[styles.pill, { backgroundColor: color + '22', borderColor: color + '44' }]}>
            <Text style={[styles.pillText, { color }]}>{label}</Text>
        </View>
    )
}

export default function ReportDetailScreen({ navigation, route }) {
    const { incidentId } = route.params
    const [incident, setIncident] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchIncident = async () => {
            const { data, error } = await supabase
                .from('incidents')
                .select(`
                    *,
                    reporter:profiles!reporter_id(full_name, employee_id, job_title, department)
                `)
                .eq('id', incidentId)
                .single()

            if (!error) setIncident(data)
            setLoading(false)
        }
        fetchIncident()
    }, [incidentId])

    if (loading) {
        return (
            <SafeAreaView style={styles.safe}>
                <View style={styles.centered}>
                    <ActivityIndicator color={C.amber} size="large" />
                </View>
            </SafeAreaView>
        )
    }

    if (!incident) {
        return (
            <SafeAreaView style={styles.safe}>
                <View style={styles.centered}>
                    <Text style={styles.errorText}>Failed to load incident.</Text>
                </View>
            </SafeAreaView>
        )
    }

    const ri = riskFromXY(incident.initial_risk_x || 1, incident.initial_risk_y || 1)
    const isClosed = incident.status === 'closed'

    return (
        <SafeAreaView style={styles.safe}>
            <ScrollView
                style={styles.container}
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
            >
                {/* Back */}
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Text style={styles.backText}>← Incident List</Text>
                </TouchableOpacity>

                {/* Header */}
                <View style={styles.headerRow}>
                    <View style={{ flex: 1, marginRight: 12 }}>
                        <Text style={styles.refNum}>#{incident.reference_number}</Text>
                        <Text style={styles.incidentDesc} numberOfLines={3}>{incident.description}</Text>
                    </View>
                    <Pill label={incident.incident_type} color={typeColor(incident.incident_type)} />
                </View>

                {/* Status pills */}
                <View style={styles.pillRow}>
                    <Pill label={incident.overall_risk ? incident.overall_risk + ' Risk' : ri.label + ' Risk (Initial)'} color={ri.color} />
                    {incident.status === 'manager_review' && <Pill label="Manager Review" color={C.orange} />}
                    {isClosed && <Pill label="Closed" color={C.green} />}
                    {incident.photo_url && <Pill label="📷 Photo" color={C.blueLight} />}
                </View>

                {/* Reporter Card */}
                <View style={styles.card}>
                    <Text style={styles.sectionTitle}>👤  Reporter</Text>
                    <View style={styles.reporterRow}>
                        <View style={styles.avatar}>
                            <Text style={styles.avatarText}>{incident.reporter?.full_name?.[0] || '?'}</Text>
                        </View>
                        <View>
                            <Text style={styles.reporterName}>{incident.reporter?.full_name}</Text>
                            <Text style={styles.reporterSub}>{incident.reporter?.employee_id} · {incident.reporter?.job_title}</Text>
                            <Text style={styles.reporterSub}>{incident.reporter?.department}</Text>
                        </View>
                    </View>
                </View>

                {/* Incident Details */}
                <View style={styles.card}>
                    <Text style={styles.sectionTitle}>📋  Incident Details</Text>
                    <InfoRow icon="🕐" label="DATE & TIME"     value={incident.created_at ? new Date(incident.created_at).toLocaleString() : null} />
                    <InfoRow icon="📍" label="LOCATION"        value={incident.location_label} />
                    <InfoRow icon="⚙️" label="WORK ACTIVITY"   value={incident.work_activity} />
                    <InfoRow icon="👔" label="REPORTED TO"     value={incident.reported_to} />
                    <InfoRow icon="👥" label="WITNESSES"       value={incident.witnesses || 'None recorded'} />
                    <View style={styles.descBlock}>
                        <Text style={styles.descBlockLabel}>📝  DESCRIPTION</Text>
                        <Text style={styles.descBlockText}>{incident.description}</Text>
                    </View>
                </View>

                {/* Immediate Action */}
                <View style={[styles.card, { borderColor: C.green + '44' }]}>
                    <Text style={styles.sectionTitle}>🚨  Immediate Action Taken</Text>
                    <Text style={styles.actionText}>{incident.immediate_action || 'None recorded'}</Text>
                </View>

                {/* Risk matrix preview */}
                <View style={styles.card}>
                    <View style={styles.riskHeader}>
                        <Text style={styles.sectionTitle}>🎯  Reporter's Initial Risk</Text>
                        <Pill label={ri.label} color={ri.color} />
                    </View>
                    <View style={styles.matrixGrid}>
                        {[4, 3, 2, 1].map(y =>
                            [1, 2, 3, 4].map(x => {
                                const active = incident.initial_risk_x === x && incident.initial_risk_y === y
                                const col = CELL_COLOR(x, y)
                                return (
                                    <View
                                        key={`${x}-${y}`}
                                        style={[
                                            styles.cell,
                                            { backgroundColor: active ? col : col + '33' },
                                            active && { borderColor: col, borderWidth: 2 },
                                        ]}
                                    >
                                        {active && <Text style={styles.cellDot}>⬤</Text>}
                                    </View>
                                )
                            })
                        )}
                    </View>
                    <Text style={styles.matrixNote}>
                        Reporter's estimate — you will confirm this during investigation.
                    </Text>
                </View>

                {/* CTA */}
                {isClosed ? (
                    <View style={styles.closedBox}>
                        <Text style={styles.closedText}>✅ This report has been closed</Text>
                    </View>
                ) : incident.status === 'manager_review' ? (
                    <View style={styles.reviewBox}>
                        <Text style={styles.reviewText}>📤 Forwarded to Manager Review</Text>
                    </View>
                ) : (
                    <TouchableOpacity
                        style={styles.ctaBtn}
                        onPress={() => navigation.navigate('PillarRisk', { incident })}
                        activeOpacity={0.85}
                    >
                        <Text style={styles.ctaBtnText}>Begin Investigation  →</Text>
                    </TouchableOpacity>
                )}
            </ScrollView>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    safe:      { flex: 1, backgroundColor: C.bg },
    container: { flex: 1, backgroundColor: C.bg },
    content:   { padding: 20, paddingBottom: 48 },
    centered:  { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: C.bg },
    errorText: { color: C.red, fontSize: 14 },

    backBtn:  { marginBottom: 14 },
    backText: { color: C.amber, fontWeight: '700', fontSize: 13 },

    headerRow:   { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 10 },
    refNum:      { fontSize: 12, fontWeight: '700', color: C.amber, marginBottom: 4, letterSpacing: 0.5 },
    incidentDesc:{ fontSize: 15, fontWeight: '800', color: C.text, lineHeight: 22 },

    pillRow: { flexDirection: 'row', gap: 7, flexWrap: 'wrap', marginBottom: 18 },
    pill:    { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 99, borderWidth: 1 },
    pillText:{ fontSize: 10, fontWeight: '700' },

    card:       { backgroundColor: C.panel, borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: C.border },
    sectionTitle:{ fontSize: 12, fontWeight: '800', color: C.text, marginBottom: 12 },

    reporterRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    avatar:      { width: 40, height: 40, borderRadius: 20, backgroundColor: C.blue, alignItems: 'center', justifyContent: 'center' },
    avatarText:  { fontSize: 16, fontWeight: '800', color: '#fff' },
    reporterName:{ fontSize: 13, fontWeight: '700', color: C.text },
    reporterSub: { fontSize: 11, color: C.sub },

    infoRow:   { flexDirection: 'row', alignItems: 'flex-start', gap: 10, paddingVertical: 9, borderBottomWidth: 1, borderBottomColor: C.border },
    infoIcon:  { fontSize: 14, flexShrink: 0, marginTop: 1 },
    infoBody:  { flex: 1 },
    infoLabel: { fontSize: 9, color: C.muted, fontWeight: '700', letterSpacing: 0.8, marginBottom: 2 },
    infoValue: { fontSize: 13, color: C.text, fontWeight: '600' },

    descBlock:     { paddingTop: 10 },
    descBlockLabel:{ fontSize: 10, color: C.muted, fontWeight: '700', letterSpacing: 0.8, marginBottom: 6 },
    descBlockText: { fontSize: 13, color: C.sub, lineHeight: 20 },

    actionText: { fontSize: 13, color: C.sub, lineHeight: 20 },

    riskHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
    matrixGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 5, marginBottom: 10 },
    cell:       { width: '23%', aspectRatio: 1, borderRadius: 8, alignItems: 'center', justifyContent: 'center', borderWidth: 0 },
    cellDot:    { fontSize: 14, color: '#ffffffcc' },
    matrixNote: { fontSize: 10, color: C.muted, fontStyle: 'italic' },

    ctaBtn:     { backgroundColor: C.amber, borderRadius: 14, paddingVertical: 16, alignItems: 'center', shadowColor: C.amber, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.4, shadowRadius: 12, elevation: 8 },
    ctaBtnText: { color: '#000', fontWeight: '900', fontSize: 15 },

    closedBox:  { backgroundColor: C.green + '11', borderRadius: 12, padding: 16, alignItems: 'center', borderWidth: 1, borderColor: C.green + '33' },
    closedText: { color: C.green, fontWeight: '700', fontSize: 13 },
    reviewBox:  { backgroundColor: C.orange + '11', borderRadius: 12, padding: 16, alignItems: 'center', borderWidth: 1, borderColor: C.orange + '33' },
    reviewText: { color: C.orange, fontWeight: '700', fontSize: 13 },
})
