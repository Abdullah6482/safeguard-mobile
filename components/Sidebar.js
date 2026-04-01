import { useEffect, useRef } from 'react'
import { Modal, View, Text, StyleSheet, TouchableOpacity, Animated, Dimensions } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { supabase } from '../lib/supabase'

const { width } = Dimensions.get('window')
const SIDEBAR_WIDTH = width * 0.75

const C = {
    bg: '#070B13', surface: '#0D1422', panel: '#121C30',
    border: 'rgba(255,255,255,0.07)',
    red: '#EF4444', text: '#F1F5F9', sub: '#94A3B8',
    blue: '#2563EB',
}

export default function Sidebar({ visible, onClose, profile }) {
    const slideAnim = useRef(new Animated.Value(-SIDEBAR_WIDTH)).current

    useEffect(() => {
        if (visible) {
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 300,
                useNativeDriver: true,
            }).start()
        } else {
            Animated.timing(slideAnim, {
                toValue: -SIDEBAR_WIDTH,
                duration: 250,
                useNativeDriver: true,
            }).start()
        }
    }, [visible])

    const handleLogout = async () => {
        onClose()
        await supabase.auth.signOut()
    }

    return (
        <Modal visible={visible} transparent={true} animationType="none" onRequestClose={onClose}>
            <View style={styles.overlay}>
                {/* Background Dim */}
                <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose} />
                
                {/* Sliding Drawer from Left */}
                <Animated.View style={[styles.drawer, { transform: [{ translateX: slideAnim }] }]}>
                    <SafeAreaView style={styles.safe}>
                        <View style={styles.header}>
                            <View style={styles.avatar}>
                                <Text style={styles.avatarText}>{profile?.full_name?.[0] || '?'}</Text>
                            </View>
                            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                                <Text style={styles.closeIcon}>✕</Text>
                            </TouchableOpacity>
                        </View>
                        
                        <View style={styles.profileInfo}>
                            <Text style={styles.name}>{profile?.full_name || 'User'}</Text>
                            <Text style={styles.role}>{profile?.job_title || 'Unknown Role'}</Text>
                            <Text style={styles.dept}>{profile?.department || 'Unknown Dept'}</Text>
                        </View>

                        <View style={styles.spacer} />

                        {/* Menu Options */}
                        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.8}>
                            <Text style={styles.logoutIcon}>🚪</Text>
                            <Text style={styles.logoutText}>Log Out</Text>
                        </TouchableOpacity>
                    </SafeAreaView>
                </Animated.View>
            </View>
        </Modal>
    )
}

const styles = StyleSheet.create({
    overlay: { flex: 1, flexDirection: 'row' },
    backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.6)' },
    drawer: { width: SIDEBAR_WIDTH, height: '100%', backgroundColor: C.panel, shadowColor: '#000', shadowOpacity: 0.5, shadowRadius: 20, elevation: 15 },
    safe: { flex: 1, padding: 20 },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30 },
    avatar: { width: 50, height: 50, borderRadius: 25, backgroundColor: C.blue, alignItems: 'center', justifyContent: 'center' },
    avatarText: { fontSize: 22, fontWeight: '800', color: '#fff' },
    closeBtn: { padding: 10, alignSelf: 'flex-start' },
    closeIcon: { fontSize: 20, color: C.sub, fontWeight: 'bold' },
    profileInfo: { borderBottomWidth: 1, borderBottomColor: C.border, paddingBottom: 24, marginBottom: 24 },
    name: { fontSize: 22, fontWeight: '900', color: C.text, marginBottom: 6 },
    role: { fontSize: 13, color: C.sub, fontWeight: '600' },
    dept: { fontSize: 12, color: C.sub, marginTop: 4 },
    spacer: { flex: 1 },
    logoutBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: C.red + '22', borderWidth: 1, borderColor: C.red + '44', padding: 16, borderRadius: 14 },
    logoutIcon: { fontSize: 20, marginRight: 12 },
    logoutText: { fontSize: 15, fontWeight: '800', color: C.red }
})
