import { useState, useEffect } from 'react'
import {
    View, Text, StyleSheet, TouchableOpacity,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

const C = {
    bg: '#070B13', surface: '#0D1422', panel: '#121C30',
    border: 'rgba(255,255,255,0.07)',
    amber: '#FBBF24', green: '#10B981', blueLight: '#3B82F6',
    text: '#F1F5F9', sub: '#94A3B8', muted: '#475569',
}

const STEPS = [
    { icon: '📋', label: 'Reported',       sub: 'Filed by reporter',           done: true,  color: C.green },
    { icon: '🔍', label: 'Investigated',   sub: 'Phase B complete',            done: true,  color: C.amber },
    { icon: '👔', label: 'Manager Review', sub: 'Awaiting manager decision',   done: true,  color: C.blueLight },
    { icon: '✅', label: 'Closed',         sub: 'Pending manager action',      done: false, color: C.muted },
]

export default function ForwardedScreen({ navigation, route }) {
    const { referenceNumber, overallRisk } = route.params
    const [visible, setVisible] = useState(false)

    useEffect(() => {
        const t = setTimeout(() => setVisible(true), 100)
        return () => clearTimeout(t)
    }, [])

    const riskColor = overallRisk === 'High' ? '#EF4444' : overallRisk === 'Medium' ? '#F59E0B' : C.green

    return (
        <SafeAreaView style={styles.safe}>
            <View style={styles.container}>

                {/* Animated icon */}
                <View style={[styles.iconCircle, visible && styles.iconCircleVisible]}>
                    <Text style={styles.iconEmoji}>📤</Text>
                </View>

                <Text style={[styles.title, visible && styles.fadeIn]}>Forwarded!</Text>
                <Text style={[styles.subtitle, visible && styles.fadeIn]}>
                    Report #{referenceNumber} has been{'\n'}moved to Manager Review
                </Text>

                {/* Risk tag */}
                {overallRisk && (
                    <View style={[styles.riskTag, { backgroundColor: riskColor + '18', borderColor: riskColor + '44' }]}>
                        <Text style={[styles.riskTagText, { color: riskColor }]}>
                            Confirmed Risk: {overallRisk}
                        </Text>
                    </View>
                )}

                {/* Journey */}
                <View style={[styles.journeyCard, visible && styles.fadeIn]}>
                    <Text style={styles.journeyTitle}>🗺️  Report Journey</Text>
                    {STEPS.map((s, i) => (
                        <View key={i} style={styles.journeyRow}>
                            <View style={styles.journeyLeft}>
                                <View style={[styles.journeyDot, { backgroundColor: s.done ? s.color + '33' : C.surface, borderColor: s.done ? s.color : C.border }]}>
                                    <Text style={styles.journeyDotIcon}>{s.icon}</Text>
                                </View>
                                {i < STEPS.length - 1 && (
                                    <View style={[styles.journeyLine, { backgroundColor: s.done ? s.color + '55' : C.border }]} />
                                )}
                            </View>
                            <View style={styles.journeyContent}>
                                <Text style={[styles.journeyLabel, { color: s.done ? C.text : C.muted }]}>{s.label}</Text>
                                <Text style={styles.journeySub}>{s.sub}</Text>
                            </View>
                        </View>
                    ))}
                </View>

                {/* Back to dashboard */}
                <TouchableOpacity
                    style={styles.homeBtn}
                    onPress={() => navigation.navigate('InvestigatorDashboard')}
                    activeOpacity={0.85}
                >
                    <Text style={styles.homeBtnText}>📋  Back to Dashboard</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    safe:      { flex: 1, backgroundColor: C.bg },
    container: { flex: 1, padding: 24, alignItems: 'center', justifyContent: 'center' },

    iconCircle: {
        width: 100, height: 100, borderRadius: 50,
        backgroundColor: C.amber + '22',
        alignItems: 'center', justifyContent: 'center',
        marginBottom: 18,
        opacity: 0, transform: [{ scale: 0.4 }],
    },
    iconCircleVisible: { opacity: 1, transform: [{ scale: 1 }] },
    iconEmoji: { fontSize: 44 },

    title:    { fontSize: 26, fontWeight: '900', color: C.text, textAlign: 'center', marginBottom: 6 },
    subtitle: { fontSize: 13, color: C.sub, textAlign: 'center', lineHeight: 20, marginBottom: 14 },

    fadeIn: { opacity: 1 },

    riskTag:     { borderRadius: 99, paddingHorizontal: 16, paddingVertical: 6, borderWidth: 1, marginBottom: 22 },
    riskTagText: { fontSize: 12, fontWeight: '700' },

    journeyCard:  { width: '100%', backgroundColor: C.panel, borderRadius: 18, padding: 18, marginBottom: 24, borderWidth: 1, borderColor: C.border },
    journeyTitle: { fontSize: 13, fontWeight: '800', color: C.text, marginBottom: 16 },

    journeyRow:    { flexDirection: 'row', gap: 12 },
    journeyLeft:   { alignItems: 'center' },
    journeyDot:    { width: 32, height: 32, borderRadius: 16, borderWidth: 2, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
    journeyDotIcon:{ fontSize: 14 },
    journeyLine:   { width: 2, flex: 1, minHeight: 18, marginVertical: 3, borderRadius: 1 },
    journeyContent:{ flex: 1, paddingTop: 4, paddingBottom: 14 },
    journeyLabel:  { fontSize: 13, fontWeight: '700' },
    journeySub:    { fontSize: 10, color: C.muted, marginTop: 2 },

    homeBtn:     { width: '100%', backgroundColor: C.amber, borderRadius: 14, paddingVertical: 16, alignItems: 'center', shadowColor: C.amber, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.35, shadowRadius: 12, elevation: 8 },
    homeBtnText: { color: '#000', fontWeight: '900', fontSize: 15 },
})
