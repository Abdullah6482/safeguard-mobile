import { useEffect, useState } from 'react'
import {
    View, Text, StyleSheet, TouchableOpacity,
    ScrollView, ActivityIndicator,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { supabase } from '../../lib/supabase'
import { uploadPhoto, testStorageAccess } from '../../lib/storage'

export default function SuccessScreen({ navigation, route }) {
    console.log('--- SUCCESS SCREEN MOUNTED ---')
    if (!route?.params) {
        console.error('CRITICAL ERROR: SuccessScreen reached WITHOUT PARAMS!')
        return (
            <View style={{ flex: 1, backgroundColor: '#070B13', justifyContent: 'center', alignItems: 'center' }}>
                <Text style={{ color: '#fff' }}>Error: No report data received.</Text>
            </View>
        )
    }
    const { context, incidentType, details, initialRisk } = route.params
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [incident, setIncident] = useState(null)

    useEffect(() => {
        submitReport()
    }, [])

    const submitReport = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser()

            // ── DEBUG: trace what arrives ──────────────────────
            console.log('[SuccessScreen] context:', JSON.stringify(context))
            console.log('[SuccessScreen] incidentType:', incidentType)
            console.log('[SuccessScreen] details:', JSON.stringify(details))

            // ── 0. Test storage access first ─────────────────────
            const { accessible, error: storageError } = await testStorageAccess()
            if (!accessible) {
                console.error('Storage not accessible:', storageError)
                // Continue without photo but log the error
            } else {
                console.log('Storage bucket is accessible')
            }

            // ── 1. Upload photo if present ─────────────────────
            let finalPhotoUrl = null
            if (details?.photoUri) {
                console.log('Photo found, uploading...', details.photoUri)
                const { url, error: uploadError } = await uploadPhoto(details.photoUri, user.id)
                
                if (uploadError) {
                    console.error('Photo upload failed:', uploadError)
                    // Continue without photo but log the error
                } else {
                    finalPhotoUrl = url
                    console.log('Photo uploaded successfully! URL:', finalPhotoUrl)
                }
            }

            // ── 2. Insert the incident ─────────────────────────
            const { data, error: insertError } = await supabase
                .from('incidents')
                .insert({
                    reporter_id: user.id,
                    incident_type: incidentType || 'Near Miss',
                    status: 'reported',

                    // Context (Phase A Step 1)
                    work_activity: context?.workActivity || null,
                    reported_to: context?.reportedTo || null,

                    // Details (Phase A Step 3)
                    description: details?.description || null,
                    location_label: details?.locationLabel || null,
                    witnesses: details?.witnesses || null,
                    immediate_action: details?.immediateAction || null,
                    photo_url: finalPhotoUrl,

                    // Initial risk (Phase A Step 4)
                    initial_risk_x: initialRisk?.x || 1,
                    initial_risk_y: initialRisk?.y || 1,
                })
                .select()
                .single()

            if (insertError) throw insertError

            setIncident(data)

        } catch (err) {
            console.error('Submit error:', err)
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    // ── Loading state ────────────────────────────────────────
    if (loading) {
        return (
            <SafeAreaView style={styles.safe}>
                <View style={styles.centered}>
                    <ActivityIndicator color="#10B981" size="large" />
                    <Text style={styles.loadingText}>Submitting your report…</Text>
                </View>
            </SafeAreaView>
        )
    }

    // ── Error state ──────────────────────────────────────────
    if (error) {
        return (
            <SafeAreaView style={styles.safe}>
                <View style={styles.centered}>
                    <Text style={styles.errorIcon}>⚠️</Text>
                    <Text style={styles.errorTitle}>Submission Failed</Text>
                    <Text style={styles.errorMsg}>{error}</Text>
                    <TouchableOpacity
                        style={styles.retryBtn}
                        onPress={() => { setLoading(true); setError(null); submitReport() }}
                    >
                        <Text style={styles.retryBtnText}>Try Again</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        )
    }

    // ── Success state ────────────────────────────────────────
    return (
        <SafeAreaView style={styles.safe}>
            <ScrollView
                style={styles.container}
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
            >

                {/* Shield */}
                <View style={styles.shieldWrapper}>
                    <View style={styles.shieldOuter}>
                        <View style={styles.shieldInner}>
                            <Text style={styles.shieldEmoji}>🛡️</Text>
                        </View>
                    </View>
                </View>

                {/* Title */}
                <Text style={styles.title}>Great Catch!</Text>
                <Text style={styles.subtitle}>Your report has been submitted successfully.</Text>

                {/* Reference number */}
                <View style={styles.refBox}>
                    <Text style={styles.refLabel}>REPORT REFERENCE</Text>
                    <Text style={styles.refNumber}>{incident?.reference_number || '—'}</Text>
                    <Text style={styles.refSub}>
                        {incidentType} · {incident?.overall_risk || 'Risk not calculated'} · {details?.locationLabel || 'Location not pinned'}
                    </Text>
                </View>

                {/* Points badge */}
                <View style={styles.pointsBadge}>
                    <Text style={styles.pointsIcon}>⏳</Text>
                    <View style={styles.pointsText}>
                        <Text style={styles.pointsLabel}>SAFETY POINTS</Text>
                        <Text style={styles.pointsValue}>Pending Approval</Text>
                        <Text style={styles.pointsSub}>
                            Points are awarded once an investigator approves your report.
                        </Text>
                    </View>
                </View>

                {/* What happens next */}
                <View style={styles.nextCard}>
                    <Text style={styles.nextTitle}>What happens next?</Text>
                    {[
                        { icon: '🔍', step: 'Investigation', desc: 'A Safety Investigator will review and verify your report.' },
                        { icon: '👔', step: 'Manager Review', desc: 'The HSE Manager will approve or assign corrective actions.' },
                        { icon: '✅', step: 'Closure', desc: "You'll be notified once the incident is fully resolved." },
                    ].map((s, i) => (
                        <View key={i} style={styles.nextRow}>
                            <View style={styles.nextIconBox}>
                                <Text style={styles.nextIcon}>{s.icon}</Text>
                            </View>
                            <View style={styles.nextContent}>
                                <Text style={styles.nextStep}>{s.step}</Text>
                                <Text style={styles.nextDesc}>{s.desc}</Text>
                            </View>
                            {i < 2 && <View style={styles.nextLine} />}
                        </View>
                    ))}
                </View>

                {/* Back to home */}
                <TouchableOpacity
                    style={styles.homeBtn}
                    onPress={() => navigation.navigate('ReporterHome')}
                    activeOpacity={0.85}
                >
                    <Text style={styles.homeBtnText}>🏠  Back to Home</Text>
                </TouchableOpacity>

            </ScrollView>
        </SafeAreaView>
    )
}

// ── Styles ──────────────────────────────────────────────────────────────────

const C = {
    bg: '#070B13', surface: '#0D1422', panel: '#121C30',
    border: 'rgba(255,255,255,0.07)',
    blue: '#2563EB', blueLight: '#3B82F6',
    green: '#10B981', cyan: '#06B6D4',
    text: '#F1F5F9', sub: '#94A3B8', muted: '#475569',
    red: '#EF4444',
}

const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: C.bg },
    container: { flex: 1, backgroundColor: C.bg },
    content: { padding: 24, paddingBottom: 48, alignItems: 'center' },

    centered: {
        flex: 1, backgroundColor: C.bg,
        justifyContent: 'center', alignItems: 'center', padding: 24,
    },
    loadingText: {
        color: C.sub, fontSize: 14, marginTop: 16, fontWeight: '600',
    },

    // Error
    errorIcon: { fontSize: 48, marginBottom: 16 },
    errorTitle: { fontSize: 20, fontWeight: '800', color: C.text, marginBottom: 8 },
    errorMsg: { fontSize: 13, color: C.sub, textAlign: 'center', marginBottom: 24, lineHeight: 20 },
    retryBtn: {
        backgroundColor: C.blue, borderRadius: 12,
        paddingVertical: 13, paddingHorizontal: 32,
    },
    retryBtnText: { color: '#fff', fontWeight: '800', fontSize: 14 },

    // Shield
    shieldWrapper: { alignItems: 'center', marginBottom: 24, marginTop: 8 },
    shieldOuter: {
        width: 120, height: 120, borderRadius: 60,
        backgroundColor: C.green + '18',
        alignItems: 'center', justifyContent: 'center',
    },
    shieldInner: {
        width: 96, height: 96, borderRadius: 48,
        backgroundColor: C.green + '30',
        alignItems: 'center', justifyContent: 'center',
    },
    shieldEmoji: { fontSize: 52 },

    // Title
    title: {
        fontSize: 28, fontWeight: '900', color: C.text,
        marginBottom: 6, textAlign: 'center',
    },
    subtitle: {
        fontSize: 14, color: C.sub, textAlign: 'center',
        marginBottom: 24, lineHeight: 20,
    },

    // Reference box
    refBox: {
        width: '100%', backgroundColor: C.panel,
        borderRadius: 16, padding: 18,
        borderWidth: 1, borderColor: C.green + '44',
        alignItems: 'center', marginBottom: 14,
    },
    refLabel: { fontSize: 10, color: C.muted, fontWeight: '700', letterSpacing: 1, marginBottom: 6 },
    refNumber: { fontSize: 22, fontWeight: '900', color: C.green, marginBottom: 4 },
    refSub: { fontSize: 12, color: C.sub },

    // Points badge
    pointsBadge: {
        width: '100%',
        backgroundColor: C.green + '14',
        borderRadius: 16, padding: 16,
        borderWidth: 1, borderColor: C.green + '44',
        flexDirection: 'row', alignItems: 'center',
        gap: 14, marginBottom: 14,
    },
    pointsIcon: { fontSize: 36 },
    pointsText: { flex: 1 },
    pointsLabel: { fontSize: 10, color: C.green, fontWeight: '700', letterSpacing: 0.8 },
    pointsValue: { fontSize: 18, fontWeight: '900', color: C.text, marginTop: 2 },
    pointsSub: { fontSize: 11, color: C.sub, marginTop: 2 },

    // What's next
    nextCard: {
        width: '100%', backgroundColor: C.panel,
        borderRadius: 16, padding: 18,
        borderWidth: 1, borderColor: C.border,
        marginBottom: 24,
    },
    nextTitle: {
        fontSize: 13, fontWeight: '800', color: C.text, marginBottom: 16,
    },
    nextRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
    nextIconBox: {
        width: 36, height: 36, borderRadius: 10,
        backgroundColor: C.surface,
        alignItems: 'center', justifyContent: 'center', flexShrink: 0,
    },
    nextIcon: { fontSize: 18 },
    nextContent: { flex: 1, paddingTop: 2 },
    nextStep: { fontSize: 13, fontWeight: '700', color: C.text },
    nextDesc: { fontSize: 11, color: C.sub, marginTop: 2, lineHeight: 16 },
    nextLine: {
        position: 'absolute', left: 17, top: 38,
        width: 2, height: 24, backgroundColor: C.border,
    },

    // Home button
    homeBtn: {
        width: '100%', backgroundColor: C.blue,
        borderRadius: 14, paddingVertical: 16,
        alignItems: 'center',
        shadowColor: C.blue, shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.4, shadowRadius: 12, elevation: 0,
    },
    homeBtnText: { color: '#fff', fontWeight: '800', fontSize: 15 },
})