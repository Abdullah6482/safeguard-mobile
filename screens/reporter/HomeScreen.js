import { useEffect, useState } from 'react'
import {
    View, Text, StyleSheet, TouchableOpacity,
    ScrollView, ActivityIndicator
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { supabase } from '../../lib/supabase'

export default function HomeScreen({ navigation }) {
    const [profile, setProfile] = useState(null)
    const [stats, setStats] = useState({ total: 0, thisMonth: 0, points: 0 })
    const [loading, setLoading] = useState(true)
    const [pulse, setPulse] = useState(false)

    useEffect(() => {
        loadData()
        const t = setInterval(() => setPulse(p => !p), 1400)
        return () => clearInterval(t)
    }, [])

    const loadData = async () => {
        const { data: { user } } = await supabase.auth.getUser()

        const { data: profileData } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single()

        setProfile(profileData)

        const { data: incidents } = await supabase
            .from('incidents')
            .select('id, created_at')
            .eq('reporter_id', user.id)

        const now = new Date()
        const thisMonth = incidents?.filter(i => {
            const d = new Date(i.created_at)
            return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
        }).length || 0

        const { data: pointsData } = await supabase
            .from('safety_points')
            .select('points')
            .eq('user_id', user.id)

        const totalPoints = pointsData?.reduce((sum, p) => sum + p.points, 0) || 0

        setStats({ total: incidents?.length || 0, thisMonth, points: totalPoints })
        setLoading(false)
    }

    const handleSignOut = async () => {
        await supabase.auth.signOut()
    }

    if (loading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator color="#2563EB" size="large" />
            </View>
        )
    }

    const streakPct = Math.min((stats.total / 20) * 100, 100)

    const badges = [
        { icon: '🛡️', label: 'Guardian', earned: stats.total >= 10 },
        { icon: '👁️', label: 'Eagle Eye', earned: stats.total >= 1 },
        { icon: '🔥', label: 'Streak Pro', earned: stats.thisMonth >= 3 },
        { icon: '📋', label: 'First Report', earned: stats.total >= 1 },
    ]

    return (
        <SafeAreaView style={styles.safe}>
            <ScrollView
                style={styles.container}
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
            >

                {/* ── Header ─────────────────────────────────── */}
                <View style={styles.header}>
                    <View style={styles.headerLeft}>
                        <Text style={styles.greeting}>GOOD MORNING</Text>
                        <Text style={styles.name}>{profile?.full_name} 👋</Text>
                        <Text style={styles.dept}>
                            {profile?.department} · {profile?.job_title}
                        </Text>
                    </View>
                    <TouchableOpacity style={styles.avatar} onPress={handleSignOut}>
                        <Text style={styles.avatarText}>
                            {profile?.full_name?.[0] || '?'}
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* ── Stats strip ────────────────────────────── */}
                <View style={styles.statsRow}>
                    {[
                        { label: 'Total Reports', val: stats.total, icon: '📋' },
                        { label: 'This Month', val: stats.thisMonth, icon: '📅' },
                        { label: 'Safety Points', val: stats.points, icon: '⭐' },
                    ].map(s => (
                        <View key={s.label} style={styles.statCard}>
                            <Text style={styles.statIcon}>{s.icon}</Text>
                            <Text style={styles.statVal}>{s.val}</Text>
                            <Text style={styles.statLabel}>{s.label}</Text>
                        </View>
                    ))}
                </View>

                {/* ── Streak card ────────────────────────────── */}
                <View style={styles.card}>
                    <Text style={styles.cardLabel}>SAFETY STREAK</Text>
                    <View style={styles.progressBarBg}>
                        <View style={[styles.progressBarFill, { width: `${streakPct}%` }]} />
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.streakText}>{stats.total} reports filed</Text>
                        <View style={styles.pillBlue}>
                            <Text style={styles.pillText}>Level 4 Observer</Text>
                        </View>
                    </View>
                </View>

                {/* ── Achievements ───────────────────────────── */}
                <Text style={styles.sectionTitle}>ACHIEVEMENTS</Text>
                <View style={styles.badgeGrid}>
                    {badges.map((b, i) => (
                        <View
                            key={i}
                            style={[styles.badge, !b.earned && styles.badgeDim]}
                        >
                            <Text style={styles.badgeIcon}>{b.icon}</Text>
                            <View style={styles.badgeInfo}>
                                <Text style={styles.badgeLabel}>{b.label}</Text>
                                <Text style={styles.badgeStatus}>
                                    {b.earned ? 'Earned ✓' : 'Locked'}
                                </Text>
                            </View>
                        </View>
                    ))}
                </View>

                {/* ── Report FAB ─────────────────────────────── */}
                <TouchableOpacity
                    style={[styles.fab, { shadowOpacity: pulse ? 0.7 : 0.35 }]}
                    onPress={() => navigation.navigate('Context')}
                    activeOpacity={0.85}
                >
                    <Text style={styles.fabText}>⚡  Report Incident</Text>
                </TouchableOpacity>

            </ScrollView>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    safe: {
        flex: 1,
        backgroundColor: '#070B13',
    },
    container: {
        flex: 1,
        backgroundColor: '#070B13',
    },
    content: {
        padding: 20,
        paddingBottom: 48,
    },
    centered: {
        flex: 1,
        backgroundColor: '#070B13',
        justifyContent: 'center',
        alignItems: 'center',
    },

    // ── Header ────────────────────────────────────────
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 24,
        marginTop: 8,
    },
    headerLeft: {
        flex: 1,
        marginRight: 12,
    },
    greeting: {
        fontSize: 11,
        color: '#475569',
        letterSpacing: 1.5,
        fontWeight: '700',
    },
    name: {
        fontSize: 22,
        fontWeight: '800',
        color: '#F1F5F9',
        marginTop: 3,
    },
    dept: {
        fontSize: 12,
        color: '#94A3B8',
        marginTop: 3,
    },
    avatar: {
        width: 46,
        height: 46,
        borderRadius: 14,
        backgroundColor: '#2563EB',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
    },
    avatarText: {
        color: '#fff',
        fontWeight: '800',
        fontSize: 20,
    },

    // ── Stats ─────────────────────────────────────────
    statsRow: {
        flexDirection: 'row',
        gap: 10,
        marginBottom: 14,
    },
    statCard: {
        flex: 1,
        backgroundColor: '#121C30',
        borderRadius: 14,
        paddingVertical: 14,
        paddingHorizontal: 8,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.07)',
    },
    statIcon: {
        fontSize: 20,
        marginBottom: 6,
    },
    statVal: {
        fontSize: 24,
        fontWeight: '900',
        color: '#3B82F6',
    },
    statLabel: {
        fontSize: 9,
        color: '#475569',
        fontWeight: '700',
        textAlign: 'center',
        marginTop: 3,
    },

    // ── Streak card ───────────────────────────────────
    card: {
        backgroundColor: '#121C30',
        borderRadius: 16,
        padding: 18,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.07)',
    },
    cardLabel: {
        fontSize: 10,
        color: '#94A3B8',
        fontWeight: '700',
        letterSpacing: 1,
        marginBottom: 12,
    },
    progressBarBg: {
        height: 6,
        backgroundColor: '#0D1422',
        borderRadius: 3,
        marginBottom: 12,
    },
    progressBarFill: {
        height: '100%',
        borderRadius: 3,
        backgroundColor: '#3B82F6',
        minWidth: 12,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    streakText: {
        fontSize: 13,
        color: '#94A3B8',
    },
    pillBlue: {
        backgroundColor: '#2563EB22',
        borderRadius: 99,
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderWidth: 1,
        borderColor: '#3B82F644',
    },
    pillText: {
        fontSize: 11,
        color: '#3B82F6',
        fontWeight: '700',
    },

    // ── Badges ────────────────────────────────────────
    sectionTitle: {
        fontSize: 10,
        color: '#475569',
        fontWeight: '700',
        letterSpacing: 1.5,
        marginBottom: 12,
    },
    badgeGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
        marginBottom: 28,
    },
    badge: {
        width: '47.5%',
        backgroundColor: '#121C30',
        borderRadius: 14,
        padding: 14,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        borderWidth: 1,
        borderColor: '#3B82F633',
    },
    badgeDim: {
        opacity: 0.38,
        borderColor: 'rgba(255,255,255,0.06)',
    },
    badgeIcon: {
        fontSize: 22,
        flexShrink: 0,
    },
    badgeInfo: {
        flex: 1,
    },
    badgeLabel: {
        fontSize: 12,
        fontWeight: '700',
        color: '#F1F5F9',
    },
    badgeStatus: {
        fontSize: 10,
        color: '#475569',
        marginTop: 2,
    },

    // ── FAB ───────────────────────────────────────────
    fab: {
        backgroundColor: '#F97316',
        borderRadius: 99,
        paddingVertical: 18,
        paddingHorizontal: 32,
        alignItems: 'center',
        shadowColor: '#F97316',
        shadowOffset: { width: 0, height: 8 },
        shadowRadius: 20,
        elevation: 10,
    },
    fabText: {
        color: '#fff',
        fontWeight: '800',
        fontSize: 16,
        letterSpacing: 0.3,
    },
})