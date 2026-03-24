import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { supabase } from '../../lib/supabase'

export default function InvestigatorDashboardScreen() {
    return (
        <View style={styles.container}>
            <Text style={styles.emoji}>🔍</Text>
            <Text style={styles.title}>Investigator Dashboard</Text>
            <Text style={styles.sub}>Phase B screens go here</Text>
            <TouchableOpacity style={styles.btn} onPress={() => supabase.auth.signOut()}>
                <Text style={styles.btnText}>Sign Out</Text>
            </TouchableOpacity>
        </View>
    )
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#070B13', alignItems: 'center', justifyContent: 'center' },
    emoji: { fontSize: 48, marginBottom: 12 },
    title: { fontSize: 22, fontWeight: '800', color: '#F1F5F9', marginBottom: 6 },
    sub: { fontSize: 13, color: '#475569', marginBottom: 32 },
    btn: { backgroundColor: '#1E293B', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 },
    btnText: { color: '#94A3B8', fontWeight: '700' },
})