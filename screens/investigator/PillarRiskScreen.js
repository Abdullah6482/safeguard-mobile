import { useState, useEffect } from 'react'
import {
    View, Text, StyleSheet, TouchableOpacity,
    ScrollView, Animated
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

const C = {
    bg: '#070B13', surface: '#0D1422', panel: '#121C30',
    border: 'rgba(255,255,255,0.07)',
    amber: '#FBBF24', green: '#10B981', yellow: '#F59E0B', red: '#EF4444',
    text: '#F1F5F9', sub: '#94A3B8', muted: '#475569',
}

const PILLAR_META = [
    { key: 'people',      icon: '👤', label: 'People',      desc: 'Injury / health impact' },
    { key: 'asset',       icon: '🏭', label: 'Asset',       desc: 'Equipment / property damage' },
    { key: 'environment', icon: '🌿', label: 'Environment', desc: 'Environmental release / impact' },
    { key: 'reputation',  icon: '📢', label: 'Reputation',  desc: 'Regulatory / brand exposure' },
]

const LEVELS = ['Low', 'Medium', 'High']
const LEVEL_COLOR = { Low: C.green, Medium: C.yellow, High: C.red }

const deriveOverall = (ratings) => {
    const vals = Object.values(ratings).filter(Boolean)
    if (!vals.length) return null
    if (vals.includes('High'))   return 'High'
    if (vals.includes('Medium')) return 'Medium'
    return 'Low'
}

export default function PillarRiskScreen({ navigation, route }) {
    const { incident } = route.params
    const [ratings, setRatings] = useState({
        people: null, asset: null, environment: null, reputation: null,
    })

    const setRating = (key, val) => setRatings(r => ({ ...r, [key]: val }))
    const overall = deriveOverall(ratings)
    const allSet = Object.values(ratings).every(Boolean)

    const btnAnim = useState(new Animated.Value(0))[0]

    useEffect(() => {
        Animated.timing(btnAnim, {
            toValue: allSet ? 1 : 0,
            duration: 300,
            useNativeDriver: true,
        }).start()
    }, [allSet])

    return (
        <SafeAreaView style={styles.safe}>
            <ScrollView
                style={styles.container}
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
            >
                {/* Phase tag */}
                <View style={styles.phaseTag}>
                    <Text style={styles.phaseText}>PHASE B · INVESTIGATOR</Text>
                </View>

                {/* Progress */}
                <View style={styles.progressWrapper}>
                    <View style={styles.progressTopRow}>
                        <Text style={styles.progressStep}>Step 1 of 2</Text>
                        <Text style={styles.progressLabel}>4-Pillar Risk Assessment</Text>
                    </View>
                    <View style={styles.progressTrack}>
                        <View style={[styles.progressFill, { width: '50%' }]} />
                    </View>
                </View>

                <Text style={styles.title}>4-Pillar Assessment</Text>
                <Text style={styles.subtitle}>
                    Rate each pillar. Overall risk = the highest single rating.
                </Text>

                {/* Ref tag */}
                <View style={styles.refTag}>
                    <Text style={styles.refTagText}>📋 {incident.reference_number}</Text>
                </View>

                {/* Pillar cards */}
                {PILLAR_META.map(p => {
                    const selected = ratings[p.key]
                    const selColor = selected ? LEVEL_COLOR[selected] : C.muted
                    return (
                        <View
                            key={p.key}
                            style={[styles.pillarCard, selected && { borderColor: selColor + '55' }]}
                        >
                            <View style={styles.pillarTop}>
                                <View style={styles.pillarInfo}>
                                    <Text style={styles.pillarIcon}>{p.icon}</Text>
                                    <View>
                                        <Text style={styles.pillarLabel}>{p.label}</Text>
                                        <Text style={styles.pillarDesc}>{p.desc}</Text>
                                    </View>
                                </View>
                                {selected && (
                                    <View style={[styles.pill, { backgroundColor: selColor + '22', borderColor: selColor + '44' }]}>
                                        <Text style={[styles.pillText, { color: selColor }]}>{selected}</Text>
                                    </View>
                                )}
                            </View>
                            <View style={styles.levelRow}>
                                {LEVELS.map(lv => {
                                    const col = LEVEL_COLOR[lv]
                                    const active = selected === lv
                                    return (
                                        <TouchableOpacity
                                            key={lv}
                                            style={[
                                                styles.levelBtn,
                                                active && { backgroundColor: col + '22', borderColor: col + '88' },
                                            ]}
                                            onPress={() => setRating(p.key, lv)}
                                            activeOpacity={0.8}
                                        >
                                            <Text style={[styles.levelBtnText, active && { color: col }]}>{lv}</Text>
                                        </TouchableOpacity>
                                    )
                                })}
                            </View>
                        </View>
                    )
                })}

                {/* Overall risk banner */}
                <View style={[
                    styles.overallBanner,
                    overall && { backgroundColor: LEVEL_COLOR[overall] + '14', borderColor: LEVEL_COLOR[overall] + '55' },
                ]}>
                    <Text style={styles.overallLabel}>DERIVED OVERALL RISK</Text>
                    <Text style={[styles.overallValue, { color: overall ? LEVEL_COLOR[overall] : C.muted }]}>
                        {overall ? `${overall} Risk` : '— Rate all 4 pillars —'}
                    </Text>
                    {overall && (
                        <Text style={styles.overallSub}>Determined by highest single pillar rating</Text>
                    )}
                </View>

                {/* Continue */}
                <Animated.View style={{ opacity: btnAnim.interpolate({ inputRange: [0, 1], outputRange: [0.55, 1] }), transform: [{ scale: btnAnim.interpolate({ inputRange: [0, 1], outputRange: [0.97, 1] }) }] }}>
                    <TouchableOpacity
                        style={[styles.ctaBtn, !allSet && styles.ctaDisabled]}
                        onPress={() => navigation.navigate('Capa', { incident, pillarRatings: ratings, overallRisk: overall })}
                        disabled={!allSet}
                        activeOpacity={0.85}
                    >
                        <Text style={styles.ctaBtnText}>Continue to Root Cause  →</Text>
                    </TouchableOpacity>
                </Animated.View>

                <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
                    <Text style={styles.backText}>← Back</Text>
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    safe:      { flex: 1, backgroundColor: C.bg },
    container: { flex: 1, backgroundColor: C.bg },
    content:   { padding: 20, paddingBottom: 48 },

    phaseTag:  { alignSelf: 'flex-start', backgroundColor: '#FBBF2422', borderRadius: 99, paddingHorizontal: 12, paddingVertical: 4, borderWidth: 1, borderColor: '#FBBF2444', marginBottom: 16 },
    phaseText: { fontSize: 10, color: C.amber, fontWeight: '800', letterSpacing: 1 },

    progressWrapper: { marginBottom: 22 },
    progressTopRow:  { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
    progressStep:    { fontSize: 11, color: C.amber, fontWeight: '700' },
    progressLabel:   { fontSize: 11, color: C.sub },
    progressTrack:   { height: 3, backgroundColor: C.surface, borderRadius: 2 },
    progressFill:    { height: '100%', borderRadius: 2, backgroundColor: C.amber },

    title:    { fontSize: 22, fontWeight: '900', color: C.text, marginBottom: 4 },
    subtitle: { fontSize: 13, color: C.sub, marginBottom: 14, lineHeight: 20 },

    refTag: { alignSelf: 'flex-start', backgroundColor: C.surface, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5, marginBottom: 18, borderWidth: 1, borderColor: C.border },
    refTagText: { fontSize: 11, color: C.amber, fontWeight: '700' },

    pillarCard: { backgroundColor: C.panel, borderRadius: 16, padding: 15, marginBottom: 12, borderWidth: 1, borderColor: C.border },
    pillarTop:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
    pillarInfo: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    pillarIcon: { fontSize: 20 },
    pillarLabel:{ fontSize: 14, fontWeight: '800', color: C.text },
    pillarDesc: { fontSize: 10, color: C.muted, marginTop: 1 },

    pill:     { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 99, borderWidth: 1 },
    pillText: { fontSize: 10, fontWeight: '700' },

    levelRow: { flexDirection: 'row', gap: 8 },
    levelBtn: { flex: 1, paddingVertical: 9, borderRadius: 10, backgroundColor: C.surface, borderWidth: 1.5, borderColor: C.border, alignItems: 'center' },
    levelBtnText: { fontSize: 12, fontWeight: '800', color: C.muted },

    overallBanner: { backgroundColor: C.surface, borderRadius: 16, padding: 16, marginBottom: 20, borderWidth: 1.5, borderColor: C.border },
    overallLabel:  { fontSize: 10, color: C.muted, fontWeight: '700', letterSpacing: 0.8, marginBottom: 5 },
    overallValue:  { fontSize: 24, fontWeight: '900' },
    overallSub:    { fontSize: 11, color: C.sub, marginTop: 4 },

    ctaBtn:     { backgroundColor: C.amber, borderRadius: 14, paddingVertical: 16, alignItems: 'center', marginBottom: 10, shadowColor: C.amber, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.4, shadowRadius: 12, elevation: 8 },
    ctaDisabled:{ shadowOpacity: 0, elevation: 0 },
    ctaBtnText: { color: '#000', fontWeight: '900', fontSize: 15 },
    backBtn:    { paddingVertical: 14, alignItems: 'center', borderRadius: 14, borderWidth: 1.5, borderColor: C.border },
    backText:   { color: C.sub, fontWeight: '700', fontSize: 14 },
})
