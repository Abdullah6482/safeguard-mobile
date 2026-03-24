import { useState } from 'react'
import {
    View, Text, StyleSheet, TouchableOpacity,
    ScrollView, SafeAreaView, Dimensions,
} from 'react-native'

// ── Risk helpers ───────────────────────────────────────────────────────────

const LIKELIHOOD = ['Rare', 'Unlikely', 'Possible', 'Likely']
const SEVERITY = ['Minor', 'Moderate', 'Major', 'Critical']

const cellColor = (x, y) => {
    const score = (x + 1) * (y + 1)
    if (score <= 2) return '#16A34A'
    if (score <= 6) return '#CA8A04'
    if (score <= 9) return '#EA580C'
    return '#DC2626'
}

const riskInfo = (x, y) => {
    const score = (x + 1) * (y + 1)
    if (score <= 2) return { label: 'Low Risk', color: '#10B981' }
    if (score <= 6) return { label: 'Medium Risk', color: '#F59E0B' }
    if (score <= 9) return { label: 'High Risk', color: '#F97316' }
    return { label: 'Critical Risk', color: '#EF4444' }
}

// Screen width used to calculate a responsive cell size
const SCREEN_W = Dimensions.get('window').width
const ROW_LABEL_W = 8
const Y_AXIS_W = 14
const PADDING = 20 * 2   // content padding left+right
const CARD_PAD = 18 * 2   // matrixCard padding left+right
const GAP = 5// marginLeft per cell (4 cells)
const CELL_SIZE = Math.floor(
    (SCREEN_W - PADDING - CARD_PAD - Y_AXIS_W - ROW_LABEL_W - GAP * 4) / 4
)

// ── Screen ─────────────────────────────────────────────────────────────────

export default function RiskMatrixScreen({ navigation, route }) {
    const { context, incidentType, details } = route.params
    const [pos, setPos] = useState({ x: 1, y: 1 })

    const ri = riskInfo(pos.x, pos.y)

    const handleContinue = () => {
        navigation.navigate('Success', {
            context,
            incidentType,
            details,
            initialRisk: pos,
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
                <ProgressBar step={4} total={6} label="Risk Assessment" />

                <Text style={styles.screenTitle}>Estimate the Risk</Text>
                <Text style={styles.screenSub}>
                    Tap a cell to set Likelihood × Severity. The investigator will verify this later.
                </Text>

                {/* ── Matrix card ─────────────────────────────── */}
                <View style={styles.matrixCard}>

                    <View style={styles.matrixRow}>

                        {/* Y axis label */}
                        <View style={styles.yAxisLabelBox}>
                            <Text style={styles.yAxisLabel}>SEVERITY</Text>
                        </View>

                        {/* Grid */}
                        <View style={styles.gridWrapper}>
                            {[3, 2, 1, 0].map(y => (
                                <View key={y} style={styles.gridRow}>

                                    {/* Row label */}
                                    <View style={[styles.rowDot, { backgroundColor: cellColor(0, y) }]} />

                                    {/* Cells */}
                                    {[0, 1, 2, 3].map(x => {
                                        const active = pos.x === x && pos.y === y
                                        const col = cellColor(x, y)
                                        return (
                                            <TouchableOpacity
                                                key={x}
                                                style={[
                                                    styles.cell,
                                                    { backgroundColor: active ? col : col + '55' },
                                                    active && {
                                                        borderColor: col,
                                                        borderWidth: 2.5,
                                                        shadowColor: col,
                                                        shadowOpacity: 0.6,
                                                        shadowRadius: 10,
                                                        elevation: 0,
                                                    },
                                                ]}
                                                onPress={() => setPos({ x, y })}
                                                activeOpacity={0.75}
                                            >
                                                {active && (
                                                    <Text style={styles.cellDot}>⬤</Text>
                                                )}
                                            </TouchableOpacity>
                                        )
                                    })}
                                </View>
                            ))}

                            {/* X axis labels */}
                            <View style={styles.xAxisRow}>
                                {/* spacer to account for the row dot */}
                                <View style={{ width: 12 }} />
                                {LIKELIHOOD.map(l => (
                                    <Text key={l} style={styles.colLabel}>{l}</Text>
                                ))}
                            </View>
                        </View>
                    </View>

                    {/* X axis title */}
                    <Text style={styles.xAxisLabel}>LIKELIHOOD →</Text>
                </View>

                {/* ── Risk status card ────────────────────────── */}
                <View style={[styles.statusCard, { borderColor: ri.color + '55' }]}>
                    <View style={styles.statusTop}>
                        <Text style={styles.statusCardLabel}>RISK STATUS</Text>
                        <View style={[
                            styles.riskPill,
                            { backgroundColor: ri.color + '22', borderColor: ri.color + '55' },
                        ]}>
                            <Text style={[styles.riskPillText, { color: ri.color }]}>
                                {ri.label}
                            </Text>
                        </View>
                    </View>

                    <View style={styles.statusRow}>
                        <View style={styles.statusItem}>
                            <Text style={styles.statusItemLabel}>LIKELIHOOD</Text>
                            <Text style={styles.statusItemValue}>{LIKELIHOOD[pos.x]}</Text>
                        </View>
                        <View style={styles.statusDivider} />
                        <View style={styles.statusItem}>
                            <Text style={styles.statusItemLabel}>SEVERITY</Text>
                            <Text style={styles.statusItemValue}>{SEVERITY[pos.y]}</Text>
                        </View>
                        <View style={styles.statusDivider} />
                        <View style={styles.statusItem}>
                            <Text style={styles.statusItemLabel}>SCORE</Text>
                            <Text style={[styles.statusItemValue, { color: ri.color }]}>
                                {(pos.x + 1) * (pos.y + 1)}
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Note */}
                <View style={styles.noteBox}>
                    <Text style={styles.noteText}>
                        💡 This is your initial estimate. The Safety Investigator will confirm
                        and update the risk level during their investigation.
                    </Text>
                </View>

                {/* ── Buttons ─────────────────────────────────── */}
                <TouchableOpacity
                    style={styles.btnPrimary}
                    onPress={handleContinue}
                    activeOpacity={0.85}
                >
                    <Text style={styles.btnPrimaryText}>Submit Report  🚀</Text>
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

// ── Reusable ───────────────────────────────────────────────────────────────

function ProgressBar({ step, total, label }) {
    return (
        <View style={pb.wrapper}>
            <View style={pb.topRow}>
                <Text style={pb.step}>Step {step} of {total}</Text>
                <Text style={pb.label}>{label}</Text>
            </View>
            <View style={pb.track}>
                <View style={[pb.fill, { width: `${(step / total) * 100}%` }]} />
            </View>
            <View style={pb.dots}>
                {Array.from({ length: total }).map((_, i) => (
                    <View key={i} style={[pb.dot, i < step && pb.dotActive]} />
                ))}
            </View>
        </View>
    )
}

// ── Styles ─────────────────────────────────────────────────────────────────

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
        paddingHorizontal: 12, paddingVertical: 4,
        borderWidth: 1, borderColor: '#3B82F644',
        marginBottom: 16,
    },
    phaseText: { fontSize: 10, color: C.blueLight, fontWeight: '800', letterSpacing: 1 },

    screenTitle: { fontSize: 22, fontWeight: '800', color: C.text, marginBottom: 4 },
    screenSub: { fontSize: 13, color: C.sub, marginBottom: 24, lineHeight: 20 },

    // ── Matrix card ───────────────────────────────
    matrixCard: {
        backgroundColor: C.panel, borderRadius: 18,
        padding: 18, marginBottom: 16,
        borderWidth: 1, borderColor: C.border,
    },
    matrixRow: { flexDirection: 'row', alignItems: 'center' },

    // Y axis
    yAxisLabelBox: { width: Y_AXIS_W, alignItems: 'center', marginRight: 4 },
    yAxisLabel: {
        fontSize: 8, color: C.muted, fontWeight: '700', letterSpacing: 1,
        transform: [{ rotate: '-90deg' }],
        width: 64, textAlign: 'center',
    },

    // Grid
    gridWrapper: { flex: 1 },
    gridRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
    rowDot: {
        width: 6, height: 6, borderRadius: 3,
        marginRight: 6, flexShrink: 0,
    },
    rowLabelSpacer: { width: 12 },

    // Cell — size is calculated from screen width
    cell: {
        width: CELL_SIZE, height: CELL_SIZE,
        borderRadius: 10, marginLeft: GAP,
        alignItems: 'center', justifyContent: 'center',
        borderWidth: 0,
    },
    cellDot: { fontSize: 18, color: '#ffffffcc' },

    // X axis
    xAxisRow: { flexDirection: 'row', alignItems: 'center', marginTop: 6 },
    colLabel: {
        width: CELL_SIZE, marginLeft: GAP,
        fontSize: 8, color: C.muted,
        fontWeight: '700', textAlign: 'center',
    },
    xAxisLabel: {
        fontSize: 9, color: C.muted, fontWeight: '700',
        letterSpacing: 1, textAlign: 'center', marginTop: 10,
    },

    // ── Status card ───────────────────────────────
    statusCard: {
        backgroundColor: C.panel, borderRadius: 16,
        padding: 16, marginBottom: 12, borderWidth: 1,
    },
    statusTop: {
        flexDirection: 'row', justifyContent: 'space-between',
        alignItems: 'center', marginBottom: 16,
    },
    statusCardLabel: { fontSize: 10, color: C.muted, fontWeight: '700', letterSpacing: 1 },
    riskPill: {
        borderRadius: 99, paddingHorizontal: 14,
        paddingVertical: 5, borderWidth: 1,
    },
    riskPillText: { fontSize: 13, fontWeight: '800' },

    statusRow: { flexDirection: 'row', alignItems: 'center' },
    statusItem: { flex: 1, alignItems: 'center' },
    statusItemLabel: { fontSize: 9, color: C.muted, fontWeight: '700', letterSpacing: 0.8, marginBottom: 5 },
    statusItemValue: { fontSize: 15, fontWeight: '800', color: C.text },
    statusDivider: { width: 1, height: 34, backgroundColor: C.border },

    // Note
    noteBox: {
        backgroundColor: C.surface, borderRadius: 12,
        padding: 14, marginBottom: 22,
        borderWidth: 1, borderColor: C.border,
    },
    noteText: { fontSize: 12, color: C.muted, lineHeight: 19 },

    // Buttons
    btnPrimary: {
        backgroundColor: '#10B981', borderRadius: 14,
        paddingVertical: 16, alignItems: 'center', marginBottom: 10,
        shadowColor: '#10B981', shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.4, shadowRadius: 12, elevation: 0,
    },
    btnPrimaryText: { color: '#fff', fontWeight: '800', fontSize: 15 },
    btnSecondary: {
        borderRadius: 14, paddingVertical: 14,
        alignItems: 'center', borderWidth: 1.5, borderColor: C.border,
    },
    btnSecondaryText: { color: C.sub, fontWeight: '700', fontSize: 14 },
})

const pb = StyleSheet.create({
    wrapper: { marginBottom: 24 },
    topRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
    step: { fontSize: 11, color: C.blueLight, fontWeight: '700' },
    label: { fontSize: 11, color: C.sub },
    track: { height: 3, backgroundColor: C.surface, borderRadius: 2, marginBottom: 6 },
    fill: { height: '100%', borderRadius: 2, backgroundColor: C.blueLight },
    dots: { flexDirection: 'row', gap: 4 },
    dot: { flex: 1, height: 3, borderRadius: 2, backgroundColor: C.surface },
    dotActive: { backgroundColor: C.blueLight + '88' },
})