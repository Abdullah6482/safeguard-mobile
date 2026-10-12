import { useState, useEffect } from 'react'
import {
    View, Text, StyleSheet, TouchableOpacity,
    ActivityIndicator, TextInput, Animated, Platform, Alert
} from 'react-native'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import { SafeAreaView } from 'react-native-safe-area-context'
import { supabase } from '../../lib/supabase'
import { submitInvestigation } from '../../lib/investigationService'

const C = {
    bg: '#070B13', surface: '#0D1422', panel: '#121C30',
    border: 'rgba(255,255,255,0.07)',
    blue: '#2563EB', blueLight: '#3B82F6',
    amber: '#FBBF24', orange: '#F97316',
    green: '#10B981', red: '#EF4444', cyan: '#06B6D4',
    text: '#F1F5F9', sub: '#94A3B8', muted: '#475569',
}

const ROOT_CAUSE_CATEGORIES = [
    'Equipment / Maintenance',
    'Human Error / SOP Non-Compliance',
    'Inadequate Training',
    'PPE Violation',
    'Environmental / Housekeeping Factors',
    'Design / Engineering Deficiency',
    'Management / Organisational Factor',
]

function Field({ label, required, children }) {
    return (
        <View style={styles.field}>
            <Text style={styles.fieldLabel}>
                {label}{required && <Text style={{ color: C.red }}> *</Text>}
            </Text>
            {children}
        </View>
    )
}

function SelectMenu({ value, onChange, options, placeholder }) {
    const [open, setOpen] = useState(false)
    return (
        <View>
            <TouchableOpacity
                style={[styles.input, styles.selectBtn]}
                onPress={() => setOpen(o => !o)}
                activeOpacity={0.8}
            >
                <Text style={[styles.selectText, !value && { color: C.muted }]}>
                    {value || placeholder}
                </Text>
                <Text style={styles.selectArrow}>{open ? '▲' : '▼'}</Text>
            </TouchableOpacity>
            {open && (
                <View style={styles.dropdown}>
                    {options.map(opt => (
                        <TouchableOpacity
                            key={opt}
                            style={[styles.dropdownItem, value === opt && styles.dropdownItemActive]}
                            onPress={() => { onChange(opt); setOpen(false) }}
                        >
                            <Text style={[styles.dropdownText, value === opt && { color: C.amber }]}>{opt}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            )}
        </View>
    )
}

export default function CapaScreen({ navigation, route }) {
    const { incident, pillarRatings, overallRisk } = route.params

    const [rootCauseCategory, setRootCauseCategory] = useState('')
    const [rootCauseDetail, setRootCauseDetail] = useState('')
    const [capaAction, setCapaAction] = useState('')
    const [capaOwner, setCapaOwner] = useState('')
    const [capaDueDate, setCapaDueDate] = useState('')
    const [investigatorNotes, setInvestigatorNotes] = useState('')
    const [forwardedToHospital, setForwardedToHospital] = useState('No')
    const [impactDaysLost, setImpactDaysLost] = useState('')
    const [availableOwners, setAvailableOwners] = useState([])
    const [submitting, setSubmitting] = useState(false)

    useEffect(() => {
        const fetchOwners = async () => {
            const { data } = await supabase
                .from('profiles')
                .select('id, full_name, job_title')
                .in('role', ['investigator', 'manager'])
            if (data) setAvailableOwners(data.map(p => ({ id: p.id, label: `${p.full_name} (${p.job_title})` })))
        }
        fetchOwners()
    }, [])

    const rootCauseError = rootCauseDetail.length > 0 && rootCauseDetail.trim().length < 15
    const capaError = capaAction.length > 0 && capaAction.trim().length < 15

    const dueDate = /^\d{4}-\d{2}-\d{2}$/.test(capaDueDate) ? new Date(`${capaDueDate}T23:59:59`) : null
    const dueDateValid = dueDate && !Number.isNaN(dueDate.getTime()) && dueDate >= new Date()
    const valid = rootCauseCategory && rootCauseDetail.trim().length >= 15 && capaAction.trim().length >= 15 && capaOwner && dueDateValid

    const btnAnim = useState(new Animated.Value(0))[0]

    useEffect(() => {
        Animated.timing(btnAnim, {
            toValue: valid ? 1 : 0,
            duration: 300,
            useNativeDriver: true,
        }).start()
    }, [valid])

    const handleSubmit = async () => {
        if (!valid || submitting) return
        setSubmitting(true)

        try {
            const selectedOwner = availableOwners.find(owner => owner.label === capaOwner)
            if (!selectedOwner) throw new Error('Select a valid CAPA owner.')
            await submitInvestigation(incident, {
                pillarRatings, overallRisk, rootCauseCategory, rootCauseDetail,
                capaAction, capaOwnerId: selectedOwner.id, capaDueDate,
                forwardedToHospital, impactWorkingDays: impactDaysLost, investigatorNotes,
            })

            navigation.navigate('Forwarded', {
                referenceNumber: incident.reference_number,
                overallRisk,
            })
        } catch (err) {
            console.error('CAPA submit error:', err)
            Alert.alert('Submission Failed', err.message || 'The investigation could not be submitted. Please try again.')
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <SafeAreaView style={styles.safe}>
            <KeyboardAwareScrollView
                style={styles.container}
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                enableOnAndroid={true}
                extraScrollHeight={20}
            >
                {/* Phase tag */}
                <View style={styles.phaseTag}>
                    <Text style={styles.phaseText}>PHASE B · INVESTIGATOR</Text>
                </View>

                {/* Progress */}
                <View style={styles.progressWrapper}>
                    <View style={styles.progressTopRow}>
                        <Text style={styles.progressStep}>Step 2 of 2</Text>
                        <Text style={styles.progressLabel}>Root Cause & CAPA</Text>
                    </View>
                    <View style={styles.progressTrack}>
                        <View style={[styles.progressFill, { width: '100%' }]} />
                    </View>
                </View>

                <Text style={styles.title}>Root Cause & CAPA</Text>
                <Text style={styles.subtitle}>
                    Document the cause and assign corrective action.
                </Text>

                {/* Overall risk summary */}
                <View style={[styles.riskBanner, { borderColor: overallRisk === 'High' ? C.red + '55' : overallRisk === 'Medium' ? C.amber + '55' : C.green + '55' }]}>
                    <Text style={styles.riskBannerLabel}>CONFIRMED OVERALL RISK</Text>
                    <Text style={[styles.riskBannerValue, { color: overallRisk === 'High' ? C.red : overallRisk === 'Medium' ? C.amber : C.green }]}>
                        {overallRisk} Risk
                    </Text>
                </View>

                {/* Root cause section */}
                <View style={styles.card}>
                    <Text style={styles.sectionTitle}>🔍  Root Cause Analysis</Text>
                    <Field label="Root Cause Category" required>
                        <SelectMenu
                            value={rootCauseCategory}
                            onChange={setRootCauseCategory}
                            options={ROOT_CAUSE_CATEGORIES}
                            placeholder="Select category…"
                        />
                    </Field>
                    <Field label="Detailed Root Cause Description" required>
                        <View style={[styles.input, styles.inputFocused, rootCauseError && styles.errorBorder, { height: 88, paddingTop: 11 }]}>
                            <TextInput
                                value={rootCauseDetail}
                                onChangeText={setRootCauseDetail}
                                placeholder="Describe the specific root cause — sequence of events, contributing factors…"
                                placeholderTextColor={C.muted}
                                multiline
                                style={{ color: C.text, fontSize: 13, flex: 1 }}
                                textAlignVertical="top"
                            />
                        </View>
                        {rootCauseError && <Text style={styles.errorText}>Must be at least 15 characters (currently {rootCauseDetail.trim().length}).</Text>}
                    </Field>
                </View>

                {/* Medical & Impact section */}
                <View style={styles.card}>
                    <Text style={styles.sectionTitle}>🏥  Medical & Impact</Text>
                    <View style={styles.twoCol}>
                        <View style={{ flex: 1, marginRight: 10 }}>
                            <Field label="Forwarded to Hospital?">
                                <SelectMenu
                                    value={forwardedToHospital}
                                    onChange={setForwardedToHospital}
                                    options={['Yes', 'No']}
                                    placeholder="Select…"
                                />
                            </Field>
                        </View>
                        <View style={{ flex: 1.2 }}>
                            <Field label="Impact (Days Lost)">
                                <View style={styles.input}>
                                    <TextInput
                                        value={impactDaysLost}
                                        onChangeText={setImpactDaysLost}
                                        placeholder="e.g. 0 or 3"
                                        placeholderTextColor={C.muted}
                                        keyboardType="numeric"
                                        style={{ color: C.text, fontSize: 13 }}
                                    />
                                </View>
                            </Field>
                        </View>
                    </View>
                </View>

                {/* CAPA section */}
                <View style={styles.card}>
                    <Text style={styles.sectionTitle}>🔧  Corrective & Preventive Action</Text>
                    <Field label="CAPA Description" required>
                        <View style={[styles.input, capaError && styles.errorBorder, { height: 88, paddingTop: 11 }]}>
                            <TextInput
                                value={capaAction}
                                onChangeText={setCapaAction}
                                placeholder="Describe the corrective action to prevent recurrence…"
                                placeholderTextColor={C.muted}
                                multiline
                                style={{ color: C.text, fontSize: 13, flex: 1 }}
                                textAlignVertical="top"
                            />
                        </View>
                        {capaError && <Text style={styles.errorText}>Must be at least 15 characters (currently {capaAction.trim().length}).</Text>}
                    </Field>

                    <Field label="Assigned Owner" required>
                        <SelectMenu
                            value={capaOwner}
                            onChange={setCapaOwner}
                            options={availableOwners.map(owner => owner.label)}
                            placeholder="Assign to…"
                        />
                    </Field>

                    <Field label="Due Date" required>
                        <View style={styles.input}>
                            <TextInput
                                value={capaDueDate}
                                onChangeText={setCapaDueDate}
                                placeholder="YYYY-MM-DD"
                                placeholderTextColor={C.muted}
                                style={{ color: C.text, fontSize: 13 }}
                            />
                        </View>
                    </Field>

                    <Field label="Investigator Notes">
                        <View style={[styles.input, { height: 66, paddingTop: 11 }]}>
                            <TextInput
                                value={investigatorNotes}
                                onChangeText={setInvestigatorNotes}
                                placeholder="Any additional notes for the manager…"
                                placeholderTextColor={C.muted}
                                multiline
                                style={{ color: C.text, fontSize: 13, flex: 1 }}
                                textAlignVertical="top"
                            />
                        </View>
                    </Field>
                </View>

                {/* Submit */}
                <Animated.View style={{ opacity: btnAnim.interpolate({ inputRange: [0, 1], outputRange: [0.55, 1] }), transform: [{ scale: btnAnim.interpolate({ inputRange: [0, 1], outputRange: [0.97, 1] }) }] }}>
                    <TouchableOpacity
                        style={[styles.ctaBtn, (!valid || submitting) && styles.ctaDisabled]}
                        onPress={handleSubmit}
                        disabled={!valid || submitting}
                        activeOpacity={0.85}
                    >
                        {submitting ? (
                            <ActivityIndicator color="#000" />
                        ) : (
                            <Text style={styles.ctaBtnText}>📤  Forward to Manager Review</Text>
                        )}
                    </TouchableOpacity>
                </Animated.View>

                <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
                    <Text style={styles.backText}>&lt;- Back</Text>
                </TouchableOpacity>
            </KeyboardAwareScrollView>
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
    subtitle: { fontSize: 13, color: C.sub, marginBottom: 16, lineHeight: 20 },

    riskBanner:      { backgroundColor: C.panel, borderRadius: 14, padding: 14, marginBottom: 18, borderWidth: 1.5 },
    riskBannerLabel: { fontSize: 10, color: C.muted, fontWeight: '700', letterSpacing: 0.8, marginBottom: 4 },
    riskBannerValue: { fontSize: 20, fontWeight: '900' },

    card:         { backgroundColor: C.panel, borderRadius: 16, padding: 16, marginBottom: 14, borderWidth: 1, borderColor: C.border },
    sectionTitle: { fontSize: 12, fontWeight: '800', color: C.text, marginBottom: 14 },

    field:      { marginBottom: 14 },
    fieldLabel: { fontSize: 10, color: C.sub, fontWeight: '700', letterSpacing: 0.8, marginBottom: 6 },

    input:       { backgroundColor: C.surface, borderRadius: 11, paddingHorizontal: 14, paddingVertical: 11, borderWidth: 1.5, borderColor: C.border },
    inputFocused:{ borderColor: '#3B82F677' },

    errorBorder: { borderColor: C.red + '77', backgroundColor: C.red + '11' },
    errorText:   { fontSize: 11, color: C.red, fontWeight: '600', marginTop: 4 },

    twoCol: { flexDirection: 'row', alignItems: 'flex-start' },

    selectBtn:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    selectText: { fontSize: 13, color: C.text, flex: 1 },
    selectArrow:{ fontSize: 10, color: C.muted, marginLeft: 8 },

    dropdown:         { backgroundColor: C.surface, borderRadius: 11, borderWidth: 1, borderColor: C.border, overflow: 'hidden', marginTop: 4 },
    dropdownItem:     { paddingHorizontal: 14, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: C.border },
    dropdownItemActive:{ backgroundColor: C.amber + '11' },
    dropdownText:     { fontSize: 13, color: C.text },

    ctaBtn:     { backgroundColor: C.amber, borderRadius: 14, paddingVertical: 16, alignItems: 'center', marginBottom: 10, shadowColor: C.amber, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.4, shadowRadius: 12, elevation: 8 },
    ctaDisabled:{ shadowOpacity: 0, elevation: 0 },
    ctaBtnText: { color: '#000', fontWeight: '900', fontSize: 15 },
    backBtn:    { paddingVertical: 14, alignItems: 'center', borderRadius: 14, borderWidth: 1.5, borderColor: C.border },
    backText:   { color: C.sub, fontWeight: '700', fontSize: 14 },
})
