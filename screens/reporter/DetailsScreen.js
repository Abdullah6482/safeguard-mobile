import { useState, useEffect } from 'react'
import {
    View, Text, StyleSheet, TouchableOpacity,
    TextInput, Alert, Image, Animated, Platform
} from 'react-native'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import { SafeAreaView } from 'react-native-safe-area-context'

export default function DetailsScreen({ navigation, route }) {
    const { context, incidentType } = route.params

    const [form, setForm] = useState({
        description: '',
        photoAttached: false,
        photoUri: null,
        locationPinned: false,
        locationLabel: '',
        witnesses: '',
        immediateAction: '',
    })

    const set = (key, value) => setForm(f => ({ ...f, [key]: value }))

    useEffect(() => {
        if (route.params?.photoUri) {
            set('photoUri', route.params.photoUri)
            set('photoAttached', true)
        }
    }, [route.params?.photoUri])

    const isValid = form.description.trim().length >= 15 && form.immediateAction.trim().length > 0

    const btnAnim = useState(new Animated.Value(0))[0]

    useEffect(() => {
        Animated.timing(btnAnim, {
            toValue: isValid ? 1 : 0,
            duration: 300,
            useNativeDriver: false,
        }).start()
    }, [isValid])

    const handleContinue = () => {
        if (!isValid) {
            Alert.alert('Missing Fields', 'Description and Immediate Action are required.')
            return
        }
        navigation.navigate('RiskMatrix', {
            ...(route.params || {}),
            details: form,
        })
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
                    <Text style={styles.phaseText}>PHASE A · REPORTER</Text>
                </View>

                {/* Progress */}
                <ProgressBar step={3} total={6} label="Incident Details" />

                <Text style={styles.screenTitle}>Add Details</Text>
                <Text style={styles.screenSub}>
                    Describe exactly what happened and what was done immediately.
                </Text>

                {/* ── Photo ───────────────────────────────────── */}
                <SectionCard icon="📷" title="Photo Evidence">
                    <TouchableOpacity
                        style={[
                            styles.uploadBox,
                            form.photoAttached && styles.uploadBoxDone,
                        ]}
                        onPress={() => navigation.navigate('Camera', { ...route.params })}
                        activeOpacity={0.8}
                    >
                        {form.photoUri ? (
                            <Image 
                                source={{ uri: form.photoUri }} 
                                style={styles.photoPreview} 
                            />
                        ) : (
                            <>
                                <Text style={styles.uploadIcon}>📷</Text>
                                <Text style={styles.uploadText}>Tap to upload photo</Text>
                            </>
                        )}
                    </TouchableOpacity>
                </SectionCard>

                {/* ── Description ─────────────────────────────── */}
                <SectionCard icon="📝" title="Description">
                    <FieldLabel label="What exactly did you observe?" required />
                    <MultilineBox
                        value={form.description}
                        onChangeText={v => set('description', v)}
                        placeholder="Describe what you observed — be specific about location, conditions, equipment involved…"
                        rows={4}
                        error={form.description.length > 0 && form.description.trim().length < 15}
                    />
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
                        {form.description.length > 0 && form.description.trim().length < 15 ? (
                            <Text style={styles.errorText}>Must be at least 15 characters (currently {form.description.trim().length}).</Text>
                        ) : <Text />}
                        <Text style={[styles.charCount, form.description.length > 0 && form.description.trim().length < 15 && { color: C.red }]}>{form.description.length} / 500</Text>
                    </View>
                </SectionCard>

                {/* ── Location ────────────────────────────────── */}
                <SectionCard icon="📍" title="Location">
                    <TouchableOpacity
                        style={[
                            styles.locationBox,
                            form.locationPinned && styles.locationBoxDone,
                        ]}
                        onPress={() => {
                            set('locationPinned', true)
                            set('locationLabel', 'Building B · Floor 2 · Zone C3')
                        }}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.locationIcon}>
                            {form.locationPinned ? '📍' : '🗺️'}
                        </Text>
                        <View style={styles.locationText}>
                            <Text style={[
                                styles.locationTitle,
                                form.locationPinned && styles.locationTitleDone,
                            ]}>
                                {form.locationPinned ? form.locationLabel : 'Pin Location on Map'}
                            </Text>
                            {!form.locationPinned && (
                                <Text style={styles.locationSub}>
                                    Tap to pin your current location
                                </Text>
                            )}
                        </View>
                    </TouchableOpacity>
                </SectionCard>

                {/* ── Witnesses ───────────────────────────────── */}
                <SectionCard icon="👥" title="Witness Documentation">
                    <FieldLabel label="Witness Name(s) / ID(s)" />
                    <SingleLineBox
                        value={form.witnesses}
                        onChangeText={v => set('witnesses', v)}
                        placeholder="e.g. Tariq M. (EMP-0088), Maria J. (EMP-0101)"
                    />
                    <Text style={styles.hint}>Leave blank if no witnesses were present.</Text>
                </SectionCard>

                {/* ── Immediate Action ────────────────────────── */}
                <SectionCard icon="🚨" title="Immediate Action Taken">
                    <FieldLabel label="What did you do right away?" required />
                    <MultilineBox
                        value={form.immediateAction}
                        onChangeText={v => set('immediateAction', v)}
                        placeholder="e.g. Isolated power supply, applied first aid, cleaned spill, erected barrier, notified shift lead…"
                        rows={3}
                        error={form.immediateAction.length === 0}
                    />
                    {!form.immediateAction && (
                        <Text style={styles.warning}>
                            ⚠ Mandatory — must document immediate response
                        </Text>
                    )}
                </SectionCard>

                {/* ── Buttons ─────────────────────────────────── */}
                <Animated.View style={{ opacity: btnAnim.interpolate({ inputRange: [0, 1], outputRange: [0.55, 1] }), transform: [{ scale: btnAnim.interpolate({ inputRange: [0, 1], outputRange: [0.97, 1] }) }] }}>
                    <TouchableOpacity
                        style={[styles.btnPrimary, !isValid && styles.btnDisabled]}
                        onPress={handleContinue}
                        disabled={!isValid}
                        activeOpacity={0.85}
                    >
                        <Text style={styles.btnPrimaryText}>Continue to Risk Assessment  -&gt;</Text>
                    </TouchableOpacity>
                </Animated.View>

                <TouchableOpacity
                    style={styles.btnSecondary}
                    onPress={() => navigation.goBack()}
                    activeOpacity={0.7}
                >
                    <Text style={styles.btnSecondaryText}>&lt;- Back</Text>
                </TouchableOpacity>

            </KeyboardAwareScrollView>
        </SafeAreaView>
    )
}

// ── Reusable components ────────────────────────────────────────────────────

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
        <Text style={fl.label}>
            {label}{required && <Text style={fl.required}> *</Text>}
        </Text>
    )
}

function SingleLineBox({ value, onChangeText, placeholder }) {
    const [focused, setFocused] = useState(false)
    return (
        <TextInput
            style={[fl.input, focused && fl.focused]}
            value={value}
            onChangeText={onChangeText}
            placeholder={placeholder}
            placeholderTextColor="#475569"
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
        />
    )
}

function MultilineBox({ value, onChangeText, placeholder, rows = 3, error }) {
    const [focused, setFocused] = useState(false)
    return (
        <TextInput
            style={[fl.input, fl.multiline, focused && fl.focused, error && fl.error, { height: rows * 24 + 26 }]}
            value={value}
            onChangeText={onChangeText}
            placeholder={placeholder}
            placeholderTextColor="#475569"
            multiline
            textAlignVertical="top"
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
        />
    )
}

function SectionCard({ icon, title, children }) {
    return (
        <View style={sc.wrapper}>
            <View style={sc.titleRow}>
                <Text style={sc.icon}>{icon}</Text>
                <Text style={sc.title}>{title}</Text>
            </View>
            {children}
        </View>
    )
}

// ── Styles ─────────────────────────────────────────────────────────────────

const C = {
    bg: '#070B13', surface: '#0D1422', panel: '#121C30',
    border: 'rgba(255,255,255,0.07)',
    blue: '#2563EB', blueLight: '#3B82F6',
    green: '#10B981', cyan: '#06B6D4',
    orange: '#F97316', red: '#EF4444',
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
    phaseText: { fontSize: 10, color: C.blueLight, fontWeight: '800', letterSpacing: 1 },

    screenTitle: { fontSize: 22, fontWeight: '800', color: C.text, marginBottom: 4 },
    screenSub: { fontSize: 13, color: C.sub, marginBottom: 24, lineHeight: 20 },

    // Upload box
    uploadBox: {
        height: 90, borderRadius: 14,
        borderWidth: 2, borderStyle: 'dashed',
        borderColor: C.border, backgroundColor: C.surface,
        alignItems: 'center', justifyContent: 'center', gap: 6,
        overflow: 'hidden',
    },
    uploadBoxDone: { borderColor: C.green + '55', backgroundColor: C.green + '11', borderWidth: 1, borderStyle: 'solid' },
    uploadIcon: { fontSize: 26 },
    uploadText: { fontSize: 13, color: C.muted, fontWeight: '600' },
    uploadTextDone: { color: C.green },
    photoPreview: { width: '100%', height: '100%', resizeMode: 'cover' },

    // Location box
    locationBox: {
        borderRadius: 14, borderWidth: 1.5,
        borderColor: C.border, backgroundColor: C.surface,
        padding: 14, flexDirection: 'row',
        alignItems: 'center', gap: 12,
    },
    locationBoxDone: { borderColor: C.cyan + '66', backgroundColor: C.cyan + '11' },
    locationIcon: { fontSize: 24, flexShrink: 0 },
    locationText: { flex: 1 },
    locationTitle: { fontSize: 13, color: C.muted, fontWeight: '700' },
    locationTitleDone: { color: C.cyan },
    locationSub: { fontSize: 11, color: C.muted, marginTop: 2 },

    errorText: { fontSize: 11, color: C.red, fontWeight: '600', marginTop: 4 },
    charCount: { fontSize: 10, color: C.muted, marginTop: 4 },
    hint: { fontSize: 11, color: C.muted, marginTop: 6, fontStyle: 'italic' },
    warning: { fontSize: 11, color: C.orange, fontWeight: '600', marginTop: 6 },

    // Buttons
    btnPrimary: {
        backgroundColor: C.blue, borderRadius: 14,
        paddingVertical: 16, alignItems: 'center',
        marginBottom: 10,
        shadowColor: C.blue, shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.4, shadowRadius: 12, elevation: 8,
    },
    btnDisabled: { shadowOpacity: 0, elevation: 0 },
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

const fl = StyleSheet.create({
    label: { fontSize: 10, color: C.sub, fontWeight: '700', letterSpacing: 0.8, marginBottom: 6 },
    required: { color: C.red },
    input: {
        backgroundColor: C.surface, borderWidth: 1.5,
        borderColor: C.border, borderRadius: 11,
        padding: 13, color: C.text, fontSize: 13,
    },
    multiline: { paddingTop: 13 },
    focused: { borderColor: C.blueLight + '77' },
    error: { borderColor: C.red + '77', backgroundColor: C.red + '11' },
})

const sc = StyleSheet.create({
    wrapper: {
        backgroundColor: C.panel, borderRadius: 16,
        padding: 16, marginBottom: 14,
        borderWidth: 1, borderColor: C.border,
    },
    titleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 14 },
    icon: { fontSize: 16 },
    title: { fontSize: 13, fontWeight: '800', color: C.text },
})