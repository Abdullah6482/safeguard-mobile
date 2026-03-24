import { useState, useEffect } from 'react'
import {
    View, Text, StyleSheet, TouchableOpacity,
    ScrollView, TextInput, SafeAreaView, Alert, ActivityIndicator
} from 'react-native'
import { supabase } from '../../lib/supabase'

// ── Reusable form components ───────────────────────────────────────────────

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

function FieldLabel({ label, required }) {
    return (
        <Text style={field.label}>
            {label}
            {required && <Text style={field.required}> *</Text>}
        </Text>
    )
}

function TextBox({ value, onChangeText, placeholder, keyboardType = 'default' }) {
    const [focused, setFocused] = useState(false)
    return (
        <TextInput
            style={[field.input, focused && field.inputFocused]}
            value={value}
            onChangeText={onChangeText}
            placeholder={placeholder}
            placeholderTextColor="#475569"
            keyboardType={keyboardType}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
        />
    )
}

function Dropdown({ value, options, onSelect, placeholder }) {
    const [open, setOpen] = useState(false)
    return (
        <View>
            <TouchableOpacity
                style={[field.input, field.dropdown, value && field.inputFocused]}
                onPress={() => setOpen(o => !o)}
                activeOpacity={0.8}
            >
                <Text style={value ? field.dropdownSelected : field.dropdownPlaceholder}>
                    {value || placeholder}
                </Text>
                <Text style={field.dropdownArrow}>{open ? '▲' : '▼'}</Text>
            </TouchableOpacity>
            {open && (
                <View style={field.dropdownList}>
                    {options.map(opt => (
                        <TouchableOpacity
                            key={opt}
                            style={[field.dropdownItem, value === opt && field.dropdownItemActive]}
                            onPress={() => { onSelect(opt); setOpen(false) }}
                        >
                            <Text style={[
                                field.dropdownItemText,
                                value === opt && field.dropdownItemTextActive
                            ]}>
                                {opt}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            )}
        </View>
    )
}

function SectionCard({ icon, title, children }) {
    return (
        <View style={card.wrapper}>
            <View style={card.titleRow}>
                <Text style={card.icon}>{icon}</Text>
                <Text style={card.title}>{title}</Text>
            </View>
            {children}
        </View>
    )
}

// ── Screen ─────────────────────────────────────────────────────────────────

const DEPARTMENTS = ['Production', 'Quality Control', 'Logistics', 'Engineering', 'HR']
const SUPERVISORS = [
    'Omar Khalid (Shift Lead A)',
    'Fatima Hassan (Shift Lead B)',
    'Khalid Nasser (Production Mgr)',
    'Sara Ahmed (QC Lead)',
]

export default function ContextScreen({ navigation }) {
    const [form, setForm] = useState({
        reporterId: '',
        jobTitle: '',
        department: '',
        dateTime: new Date().toLocaleString(),
        workActivity: '',
        reportedTo: '',
    })
    const [loading, setLoading] = useState(true)

    // ── Fetch profile on mount ─────────────────────────────
    useEffect(() => {
        const fetchProfile = async () => {
            const { data: { user } } = await supabase.auth.getUser()

            const { data: profile, error } = await supabase
                .from('profiles')
                .select('employee_id, job_title, department')
                .eq('id', user.id)
                .single()

            if (!error && profile) {
                setForm(f => ({
                    ...f,
                    reporterId: profile.employee_id || '',
                    jobTitle: profile.job_title || '',
                    department: profile.department || '',
                }))
            }
            setLoading(false)
        }

        fetchProfile()
    }, [])

    const set = (key, value) => setForm(f => ({ ...f, [key]: value }))

    const isValid =
        form.reporterId &&
        form.jobTitle &&
        form.department &&
        form.workActivity &&
        form.reportedTo

    const handleContinue = () => {
        if (!isValid) {
            Alert.alert('Missing Fields', 'Please fill in all required fields before continuing.')
            return
        }
        navigation.navigate('IncidentType', { context: form })
    }

    if (loading) {
        return (
            <View style={{ flex: 1, backgroundColor: '#070B13', justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator color="#2563EB" size="large" />
            </View>
        )
    }

    return (
        <SafeAreaView style={styles.safe}>
            <ScrollView
                style={styles.container}
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
            >

                {/* Phase tag */}
                <View style={styles.phaseTag}>
                    <Text style={styles.phaseText}>PHASE A · REPORTER</Text>
                </View>

                <ProgressBar step={1} total={6} label="Personnel & Context" />

                <Text style={styles.screenTitle}>Reporter Context</Text>
                <Text style={styles.screenSub}>
                    Establish who, when, and what was happening.
                </Text>

                {/* ── Reporter Profile ──────────────────────── */}
                <SectionCard icon="👤" title="Reporter Profile">
                    <View style={styles.twoCol}>
                        <View style={styles.colHalf}>
                            <FieldLabel label="Reporter ID" required />
                            <View style={field.inputReadonly}>
                                <Text style={field.inputReadonlyText}>
                                    {form.reporterId || '—'}
                                </Text>
                            </View>
                        </View>
                        <View style={styles.colHalf}>
                            <FieldLabel label="Job Title" required />
                            <View style={field.inputReadonly}>
                                <Text style={field.inputReadonlyText}>
                                    {form.jobTitle || '—'}
                                </Text>
                            </View>
                        </View>
                    </View>
                    <View style={styles.fieldGap}>
                        <FieldLabel label="Department" required />
                        <Dropdown
                            value={form.department}
                            options={DEPARTMENTS}
                            onSelect={v => set('department', v)}
                            placeholder="Select department…"
                        />
                    </View>
                </SectionCard>

                {/* ── Temporal Data ─────────────────────────── */}
                <SectionCard icon="🕐" title="Temporal Data">
                    <FieldLabel label="Date & Time of Incident" required />
                    <View style={field.inputReadonly}>
                        <Text style={field.inputReadonlyText}>{form.dateTime}</Text>
                    </View>
                    <Text style={styles.hint}>Defaults to now. You can adjust if the incident happened earlier.</Text>

                    <View style={styles.fieldGap}>
                        <FieldLabel label="Work Activity at Time of Incident" required />
                        <TextBox
                            value={form.workActivity}
                            onChangeText={v => set('workActivity', v)}
                            placeholder="e.g. Operating Reactor Line 3 batch transfer"
                        />
                    </View>
                </SectionCard>

                {/* ── Supervisory Notification ──────────────── */}
                <SectionCard icon="📋" title="Supervisory Notification">
                    <FieldLabel label="Reported To (Shift Lead / Supervisor)" required />
                    <Dropdown
                        value={form.reportedTo}
                        options={SUPERVISORS}
                        onSelect={v => set('reportedTo', v)}
                        placeholder="Select supervisor…"
                    />
                </SectionCard>

                {/* ── Buttons ───────────────────────────────── */}
                <TouchableOpacity
                    style={[styles.btnPrimary, !isValid && styles.btnDisabled]}
                    onPress={handleContinue}
                    disabled={!isValid}
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

// ── Styles ─────────────────────────────────────────────────────────────────

const C = {
    bg: '#070B13', surface: '#0D1422', panel: '#121C30',
    border: 'rgba(255,255,255,0.07)', blue: '#2563EB',
    blueLight: '#3B82F6', text: '#F1F5F9', sub: '#94A3B8', muted: '#475569',
    red: '#EF4444',
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
    phaseText: { fontSize: 10, color: C.blueLight, fontWeight: '800', letterSpacing: 1 },

    screenTitle: { fontSize: 22, fontWeight: '800', color: C.text, marginBottom: 4 },
    screenSub: { fontSize: 13, color: C.sub, marginBottom: 24, lineHeight: 20 },

    twoCol: { flexDirection: 'row', gap: 10, marginBottom: 14 },
    colHalf: { flex: 1 },
    fieldGap: { marginTop: 14 },
    hint: { fontSize: 11, color: C.muted, marginTop: 6, fontStyle: 'italic' },

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
    topRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
    step: { fontSize: 11, color: C.blueLight, fontWeight: '700' },
    label: { fontSize: 11, color: C.sub },
    track: { height: 3, backgroundColor: C.surface, borderRadius: 2, marginBottom: 6 },
    fill: { height: '100%', borderRadius: 2, backgroundColor: C.blueLight },
    dots: { flexDirection: 'row', gap: 4 },
    dot: { flex: 1, height: 3, borderRadius: 2, backgroundColor: C.surface },
    dotActive: { backgroundColor: C.blueLight + '88' },
})

const field = StyleSheet.create({
    label: { fontSize: 10, color: C.sub, fontWeight: '700', letterSpacing: 0.8, marginBottom: 6 },
    required: { color: C.red },
    input: {
        backgroundColor: C.surface,
        borderWidth: 1.5,
        borderColor: C.border,
        borderRadius: 11,
        padding: 13,
        color: C.text,
        fontSize: 13,
    },
    inputFocused: { borderColor: C.blueLight + '77' },
    inputReadonly: {
        backgroundColor: C.surface,
        borderWidth: 1.5,
        borderColor: C.border,
        borderRadius: 11,
        padding: 13,
    },
    inputReadonlyText: { color: C.sub, fontSize: 13 },
    dropdown: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    dropdownPlaceholder: { color: C.muted, fontSize: 13, flex: 1 },
    dropdownSelected: { color: C.text, fontSize: 13, flex: 1 },
    dropdownArrow: { color: C.muted, fontSize: 11, marginLeft: 8 },
    dropdownList: {
        backgroundColor: C.panel,
        borderRadius: 11,
        borderWidth: 1,
        borderColor: C.border,
        marginTop: 4,
        overflow: 'hidden',
    },
    dropdownItem: {
        padding: 13,
        borderBottomWidth: 1,
        borderBottomColor: C.border,
    },
    dropdownItemActive: { backgroundColor: C.blueLight + '18' },
    dropdownItemText: { color: C.sub, fontSize: 13 },
    dropdownItemTextActive: { color: C.blueLight, fontWeight: '700' },
})

const card = StyleSheet.create({
    wrapper: {
        backgroundColor: C.panel,
        borderRadius: 16,
        padding: 16,
        marginBottom: 14,
        borderWidth: 1,
        borderColor: C.border,
    },
    titleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 14,
    },
    icon: { fontSize: 16 },
    title: { fontSize: 13, fontWeight: '800', color: C.text },
})