import { useState } from 'react'
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    Alert,
} from 'react-native'
import { supabase } from '../../lib/supabase'

export default function LoginScreen() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [showPassword, setShowPassword] = useState(false)

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert('Error', 'Please enter your email and password.')
            return
        }

        setLoading(true)

        const { data, error } = await supabase.auth.signInWithPassword({
            email: email.trim(),
            password,
        })

        if (error) {
            Alert.alert('Login Failed', error.message)
            setLoading(false)
            return
        }

        // Fetch the user's profile to get their role
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('role, full_name')
            .eq('id', data.user.id)
            .single()

        if (profileError) {
            Alert.alert('Error', 'Could not load user profile.')
            setLoading(false)
            return
        }

        console.log('Logged in as:', profile.full_name, '| Role:', profile.role)
        // Navigation based on role will go here once we set up the navigator
        setLoading(false)
    }

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            {/* Logo area */}
            <View style={styles.header}>
                <View style={styles.logoBox}>
                    <Text style={styles.logoIcon}>🛡️</Text>
                </View>
                <Text style={styles.appName}>SafeGuard Pro</Text>
                <Text style={styles.tagline}>OBS Pharma · HSE Management</Text>
            </View>

            {/* Form */}
            <View style={styles.form}>
                <Text style={styles.formTitle}>Sign In</Text>
                <Text style={styles.formSubtitle}>Use your OBS Pharma credentials</Text>

                <View style={styles.fieldGroup}>
                    <Text style={styles.label}>EMAIL</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="your.name@obspharma.com"
                        placeholderTextColor="#475569"
                        value={email}
                        onChangeText={setEmail}
                        autoCapitalize="none"
                        keyboardType="email-address"
                    />
                </View>

                <View style={styles.fieldGroup}>
                    <Text style={styles.label}>PASSWORD</Text>
                    <View style={styles.passwordWrapper}>
                        <TextInput
                            style={styles.passwordInput}
                            placeholder="Enter your password"
                            placeholderTextColor="#475569"
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry={!showPassword}
                        />
                        <TouchableOpacity
                            onPress={() => setShowPassword(v => !v)}
                            style={styles.eyeBtn}
                        >
                            <Text style={styles.eyeIcon}>{showPassword ? '🙈' : '👁️'}</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <TouchableOpacity
                    style={[styles.button, loading && styles.buttonDisabled]}
                    onPress={handleLogin}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.buttonText}>Sign In →</Text>
                    )}
                </TouchableOpacity>
            </View>

            {/* Footer */}
            <Text style={styles.footer}>
                Forgot your password? Contact your HSE Manager.
            </Text>
        </KeyboardAvoidingView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#070B13',
        justifyContent: 'center',
        paddingHorizontal: 28,
    },
    header: {
        alignItems: 'center',
        marginBottom: 40,
    },
    logoBox: {
        width: 72,
        height: 72,
        borderRadius: 20,
        backgroundColor: '#121C30',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.08)',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 14,
    },
    logoIcon: {
        fontSize: 36,
    },
    appName: {
        fontSize: 26,
        fontWeight: '800',
        color: '#F1F5F9',
        letterSpacing: 0.5,
    },
    tagline: {
        fontSize: 13,
        color: '#475569',
        marginTop: 4,
    },
    form: {
        backgroundColor: '#121C30',
        borderRadius: 20,
        padding: 24,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.07)',
    },
    formTitle: {
        fontSize: 20,
        fontWeight: '800',
        color: '#F1F5F9',
        marginBottom: 4,
    },
    formSubtitle: {
        fontSize: 13,
        color: '#94A3B8',
        marginBottom: 24,
    },
    fieldGroup: {
        marginBottom: 16,
    },
    label: {
        fontSize: 10,
        fontWeight: '700',
        color: '#94A3B8',
        letterSpacing: 1,
        marginBottom: 6,
    },
    input: {
        backgroundColor: '#0D1422',
        borderWidth: 1.5,
        borderColor: 'rgba(255,255,255,0.07)',
        borderRadius: 12,
        padding: 14,
        color: '#F1F5F9',
        fontSize: 14,
    },
    passwordWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#0D1422',
        borderWidth: 1.5,
        borderColor: 'rgba(255,255,255,0.07)',
        borderRadius: 12,
    },
    passwordInput: {
        flex: 1,
        padding: 14,
        color: '#F1F5F9',
        fontSize: 14,
    },
    eyeBtn: {
        paddingHorizontal: 14,
        paddingVertical: 14,
    },
    eyeIcon: { fontSize: 16 },
    button: {
        backgroundColor: '#2563EB',
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
        marginTop: 8,
        shadowColor: '#2563EB',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.4,
        shadowRadius: 12,
        elevation: 8,
    },
    buttonDisabled: {
        opacity: 0.6,
    },
    buttonText: {
        color: '#fff',
        fontWeight: '800',
        fontSize: 15,
    },
    footer: {
        textAlign: 'center',
        color: '#475569',
        fontSize: 12,
        marginTop: 24,
    },
})