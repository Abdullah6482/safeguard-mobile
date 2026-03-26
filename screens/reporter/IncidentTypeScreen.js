import { useState } from 'react'
import {
    View, Text, StyleSheet, TouchableOpacity,
    ScrollView,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

export default function IncidentTypeScreen({ navigation, route }) {
    const { context } = route.params
    const [selected, setSelected] = useState(null)

    const cards = [
        {
            key: 'Near Miss',
            icon: '⚠️',
            sub: 'No harm occurred — but could have',
            color: '#F59E0B',
        },
        {
            key: 'Potential',
            icon: '⚡',
            sub: 'Could cause harm if left unaddressed',
            color: '#F97316',
        },
        {
            key: 'Actual',
            icon: '🚫',
            sub: 'Injury or damage has occurred',
            color: '#EF4444',
        },
    ]

    const handleContinue = () => {
        navigation.navigate('Details', {
            context,
            incidentType: selected,
        })
    }

    return (
        <SafeAreaView style={styles.safe}>
            <ScrollView
                style={styles.container}
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
            >

                {/* Phase tag */}
                <View style={styles.phaseTag}>
                    <Text style={styles.phaseText}>PHASE A · REPORTER</Text>
                </View>

                {/* Progress */}
                <View style={pb.wrapper}>
                    <View style={pb.topRow}>
                        <Text style={pb.step}>Step 2 of 6</Text>
                        <Text style={pb.label}>Incident Type</Text>
                    </View>
                    <View style={pb.track}>
                        <View style={[pb.fill, { width: '33%' }]} />
                    </View>
                    <View style={pb.dots}>
                        {Array.from({ length: 6 }).map((_, i) => (
                            <View key={i} style={[pb.dot, i < 2 && pb.dotActive]} />
                        ))}
                    </View>
                </View>

                <Text style={styles.screenTitle}>What happened?</Text>
                <Text style={styles.screenSub}>
                    Select the category that best describes the incident.
                </Text>

                {/* Cards */}
                <View style={styles.cardList}>
                    {cards.map(c => {
                        const active = selected === c.key
                        return (
                            <TouchableOpacity
                                key={c.key}
                                style={[
                                    styles.card,
                                    active && { borderColor: c.color + '99', backgroundColor: c.color + '12' },
                                    active && { shadowColor: c.color, shadowOpacity: 0.25, shadowRadius: 16 },
                                ]}
                                onPress={() => setSelected(c.key)}
                                activeOpacity={0.85}
                            >
                                {/* Icon box */}
                                <View style={[styles.iconBox, { backgroundColor: c.color + '22' }]}>
                                    <Text style={styles.iconText}>{c.icon}</Text>
                                </View>

                                {/* Text */}
                                <View style={styles.cardBody}>
                                    <Text style={[styles.cardTitle, active && { color: c.color }]}>
                                        {c.key}
                                    </Text>
                                    <Text style={styles.cardSub}>{c.sub}</Text>
                                </View>

                                {/* Arrow */}
                                <Text style={[styles.arrow, active && { color: c.color }]}>›</Text>
                            </TouchableOpacity>
                        )
                    })}
                </View>

                {/* Buttons */}
                <TouchableOpacity
                    style={[styles.btnPrimary, !selected && styles.btnDisabled]}
                    onPress={handleContinue}
                    disabled={!selected}
                    activeOpacity={0.85}
                >
                    <Text style={styles.btnPrimaryText}>Continue  →</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.btnSecondary}
                    onPress={() => navigation.goBack()}
                    activeOpacity={0.7}
                >
                    <Text style={styles.btnSecondaryText}>← Back</Text>
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
    text: '#F1F5F9', sub: '#94A3B8', muted: '#475569',
}

const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: C.bg },
    container: { flex: 1, backgroundColor: C.bg },
    content: { padding: 20, paddingBottom: 48 },

    phaseTag: {
        alignSelf: 'flex-start',
        backgroundColor: '#2563EB22',
        borderRadius: 99,
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderWidth: 1,
        borderColor: '#3B82F644',
        marginBottom: 16,
    },
    phaseText: {
        fontSize: 10, color: C.blueLight,
        fontWeight: '800', letterSpacing: 1,
    },

    screenTitle: {
        fontSize: 22, fontWeight: '800',
        color: C.text, marginBottom: 4,
    },
    screenSub: {
        fontSize: 13, color: C.sub,
        marginBottom: 28, lineHeight: 20,
    },

    // Cards
    cardList: { gap: 12, marginBottom: 28 },
    card: {
        backgroundColor: C.panel,
        borderRadius: 18,
        borderWidth: 1.5,
        borderColor: C.border,
        padding: 18,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 14,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0,
        shadowRadius: 0,
    },
    iconBox: {
        width: 54,
        height: 54,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
    },
    iconText: { fontSize: 26 },
    cardBody: { flex: 1 },
    cardTitle: {
        fontSize: 16, fontWeight: '800',
        color: C.text, marginBottom: 3,
    },
    cardSub: { fontSize: 12, color: C.sub, lineHeight: 18 },
    arrow: { fontSize: 22, color: C.muted, flexShrink: 0 },

    // Buttons
    btnPrimary: {
        backgroundColor: C.blue,
        borderRadius: 14,
        paddingVertical: 16,
        alignItems: 'center',
        marginBottom: 10,
        shadowColor: C.blue,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.4,
        shadowRadius: 12,
        elevation: 8,
    },
    btnDisabled: { opacity: 0.45, shadowOpacity: 0 },
    btnPrimaryText: { color: '#fff', fontWeight: '800', fontSize: 15 },
    btnSecondary: {
        borderRadius: 14,
        paddingVertical: 14,
        alignItems: 'center',
        borderWidth: 1.5,
        borderColor: C.border,
    },
    btnSecondaryText: { color: C.sub, fontWeight: '700', fontSize: 14 },
})

const pb = StyleSheet.create({
    wrapper: { marginBottom: 24 },
    topRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    step: { fontSize: 11, color: C.blueLight, fontWeight: '700' },
    label: { fontSize: 11, color: C.sub },
    track: {
        height: 3, backgroundColor: C.surface,
        borderRadius: 2, marginBottom: 6,
    },
    fill: { height: '100%', borderRadius: 2, backgroundColor: C.blueLight },
    dots: { flexDirection: 'row', gap: 4 },
    dot: { flex: 1, height: 3, borderRadius: 2, backgroundColor: C.surface },
    dotActive: { backgroundColor: C.blueLight + '88' },
})