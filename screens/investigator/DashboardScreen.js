import { useEffect, useState, useCallback } from 'react'
import {
    View, Text, StyleSheet, TouchableOpacity,
    ScrollView, ActivityIndicator,
    RefreshControl, Animated
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { supabase } from '../../lib/supabase'
import Sidebar from '../../components/Sidebar'

const C = {
    bg: '#070B13', surface: '#0D1422', panel: '#121C30',
    border: 'rgba(255,255,255,0.07)', border2: 'rgba(255,255,255,0.12)',
    blue: '#2563EB', blueLight: '#3B82F6',
    amber: '#FBBF24', orange: '#F97316',
    green: '#10B981', red: '#EF4444', yellow: '#F59E0B',
    text: '#F1F5F9', sub: '#94A3B8', muted: '#475569',
}

const typeColor = (t) =>
    t === 'Near Miss' ? C.yellow : t === 'Potential' ? C.orange : C.red

const statusMeta = (s) => {
    switch (s) {
        case 'reported':          return { label: 'Pending Investigation', color: C.amber }
        case 'under_investigation': return { label: 'In Progress',          color: C.blueLight }
        case 'manager_review':    return { label: 'Manager Review',        color: C.orange }
        case 'closed':            return { label: 'Closed',                color: C.green }
        default:                  return { label: s,                       color: C.muted }
    }
}

const riskFromXY = (x, y) => {
    const s = x * y
    if (s >= 15) return { label: 'High',   color: C.red }
    if (s >= 5)  return { label: 'Medium', color: C.yellow }
    return              { label: 'Low',    color: C.green }
}

function timeAgo(dateStr) {
    const diff = (Date.now() - new Date(dateStr)) / 1000
    if (diff < 60)        return 'just now'
    if (diff < 3600)      return `${Math.floor(diff / 60)}m ago`
    if (diff < 86400)     return `${Math.floor(diff / 3600)}h ago`
    if (diff < 172800)    return 'Yesterday'
    return `${Math.floor(diff / 86400)}d ago`
}

const FILTERS = ['All', 'Pending', 'In Progress', 'Closed']

export default function DashboardScreen({ navigation }) {
    const [incidents, setIncidents] = useState([])
    const [profile, setProfile] = useState(null)
    const [loading, setLoading] = useState(true)
    const [refreshing, setRefreshing] = useState(false)
    const [filter, setFilter] = useState('All')
    const [sidebarVisible, setSidebarVisible] = useState(false)

    const fetchData = useCallback(async () => {
        const { data: { user } } = await supabase.auth.getUser()
        const { data: prof } = await supabase
            .from('profiles')
            .select('full_name, job_title, department')
            .eq('id', user.id)
            .single()
        setProfile(prof)

        // Build the reported_to filter value — matches what reporters see in dropdown
        // e.g. "Omar Khalid (Shift Lead A)"
        const reportedToValue = prof
            ? `${prof.full_name} (${prof.job_title})`
            : null

        const query = supabase
            .from('incidents')
            .select(`
                id, reference_number, incident_type, status,
                description, location_label, created_at,
                initial_risk_x, initial_risk_y, overall_risk,
                reporter:profiles!reporter_id(full_name, department)
            `)
            .order('created_at', { ascending: false })

        // Only show incidents assigned to this investigator
        // if (reportedToValue) {
        //     query.eq('reported_to', reportedToValue)
        // }

        const { data, error } = await query

        if (!error) setIncidents(data || [])
        setLoading(false)
        setRefreshing(false)
    }, [])

    useEffect(() => { fetchData() }, [fetchData])

    const onRefresh = () => { setRefreshing(true); fetchData() }

    const filtered = incidents.filter(i => {
        if (filter === 'Pending')     return i.status === 'reported'
        if (filter === 'In Progress') return i.status === 'under_investigation'
        if (filter === 'Closed')      return i.status === 'closed'
        return true
    })

    const counts = {
        pending:    incidents.filter(i => i.status === 'reported').length,
        inProgress: incidents.filter(i => i.status === 'under_investigation').length,
        closed:     incidents.filter(i => i.status === 'closed').length,
    }

    if (loading) {
        return <DashboardSkeleton />
    }

    return (
        <SafeAreaView style={styles.safe}>
            <ScrollView
                style={styles.container}
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={C.amber} />}
            >
                {/* Header */}
                <View style={styles.header}>
                    <View>
                        <Text style={styles.greeting}>GOOD MORNING</Text>
                        <Text style={styles.name}>{profile?.full_name || 'Investigator'} 🔍</Text>
                        <Text style={styles.headerSub}>{profile?.job_title} · {profile?.department}</Text>
                    </View>
                    <View style={{ flexDirection: 'row', gap: 10 }}>
                        <TouchableOpacity
                            style={styles.notifBtn}
                            onPress={() => console.log('Notifications opened')}
                        >
                            <Text style={styles.notifEmoji}>🔔</Text>
                            {counts.pending > 0 && (
                                <View style={styles.badge}>
                                    <Text style={styles.badgeText}>{counts.pending}</Text>
                                </View>
                            )}
                        </TouchableOpacity>
                        <TouchableOpacity 
                            style={styles.headerAvatar} 
                            onPress={() => setSidebarVisible(true)}
                        >
                            <Text style={styles.headerAvatarText}>{profile?.full_name?.[0] || '?'}</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Stat strip */}
                <View style={styles.statStrip}>
                    {[
                        { label: 'Pending',     val: counts.pending,    color: C.amber,     icon: '⏳' },
                        { label: 'In Progress', val: counts.inProgress, color: C.blueLight, icon: '🔍' },
                        { label: 'Closed',      val: counts.closed,     color: C.green,     icon: '✅' },
                    ].map(s => (
                        <View key={s.label} style={[styles.statCard, { borderColor: s.color + '33' }]}>
                            <Text style={styles.statIcon}>{s.icon}</Text>
                            <Text style={[styles.statVal, { color: s.color }]}>{s.val}</Text>
                            <Text style={styles.statLabel}>{s.label.toUpperCase()}</Text>
                        </View>
                    ))}
                </View>

                {/* Filter tabs */}
                <View style={styles.filterRow}>
                    {FILTERS.map(f => (
                        <TouchableOpacity
                            key={f}
                            style={[styles.filterTab, filter === f && styles.filterTabActive]}
                            onPress={() => setFilter(f)}
                        >
                            <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>
                                {f}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Incident list */}
                <View style={styles.list}>
                    {filtered.length === 0 ? (
                        <View style={styles.empty}>
                            <Text style={styles.emptyIcon}>📭</Text>
                            <Text style={styles.emptyText}>No incidents in this category</Text>
                        </View>
                    ) : filtered.map(inc => {
                        const st = statusMeta(inc.status)
                        const ri = riskFromXY(inc.initial_risk_x || 1, inc.initial_risk_y || 1)
                        const isPending = inc.status === 'reported'
                        return (
                            <TouchableOpacity
                                key={inc.id}
                                style={[styles.card, isPending && { borderColor: C.amber + '44' }]}
                                onPress={() => navigation.navigate('ReportDetail', { incidentId: inc.id })}
                                activeOpacity={0.82}
                            >
                                {/* Top row: pills + age */}
                                <View style={styles.cardTop}>
                                    <View style={styles.pillRow}>
                                        <View style={[styles.pill, { backgroundColor: typeColor(inc.incident_type) + '22', borderColor: typeColor(inc.incident_type) + '44' }]}>
                                            <Text style={[styles.pillText, { color: typeColor(inc.incident_type) }]}>{inc.incident_type}</Text>
                                        </View>
                                        <View style={[styles.pill, { backgroundColor: st.color + '22', borderColor: st.color + '44' }]}>
                                            <Text style={[styles.pillText, { color: st.color }]}>{st.label}</Text>
                                        </View>
                                    </View>
                                    <Text style={styles.age}>{timeAgo(inc.created_at)}</Text>
                                </View>

                                {/* Ref + description snippet */}
                                <Text style={styles.refNum}>{inc.reference_number}</Text>
                                <Text style={styles.desc} numberOfLines={2}>{inc.description}</Text>

                                {/* Location */}
                                {inc.location_label ? (
                                    <Text style={styles.location}>📍 {inc.location_label}</Text>
                                ) : null}

                                {/* Bottom: reporter + risk */}
                                <View style={styles.cardBottom}>
                                    <View style={styles.reporterRow}>
                                        <View style={styles.avatar}>
                                            <Text style={styles.avatarText}>
                                                {inc.reporter?.full_name?.[0] || '?'}
                                            </Text>
                                        </View>
                                        <Text style={styles.reporterName}>
                                            {inc.reporter?.full_name} · {inc.reporter?.department}
                                        </Text>
                                    </View>
                                    <View style={[styles.riskPill, { backgroundColor: ri.color + '22', borderColor: ri.color + '44' }]}>
                                        <Text style={[styles.riskPillText, { color: ri.color }]}>{ri.label}</Text>
                                    </View>
                                </View>
                            </TouchableOpacity>
                        )
                    })}
                </View>
            </ScrollView>

            <Sidebar 
                visible={sidebarVisible} 
                onClose={() => setSidebarVisible(false)} 
                profile={profile} 
            />
        </SafeAreaView>
    )
}

function DashboardSkeleton() {
    const fadeAnim = useState(new Animated.Value(0.3))[0]

    useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
                Animated.timing(fadeAnim, { toValue: 0.3, duration: 800, useNativeDriver: true })
            ])
        ).start()
    }, [])

    const SkeleBlock = ({ height, width, borderRadius = 8, marginBottom = 10, style }) => (
        <Animated.View style={[{ height, width, borderRadius, backgroundColor: '#1E293B', marginBottom, opacity: fadeAnim }, style]} />
    )

    return (
        <SafeAreaView style={styles.safe}>
            <View style={styles.content}>
                <View style={styles.header}>
                    <View>
                        <SkeleBlock height={10} width={80} />
                        <SkeleBlock height={24} width={150} />
                        <SkeleBlock height={12} width={120} />
                    </View>
                    <SkeleBlock height={44} width={44} borderRadius={13} />
                </View>

                <View style={styles.statStrip}>
                    <SkeleBlock height={85} width="31%" borderRadius={14} />
                    <SkeleBlock height={85} width="31%" borderRadius={14} />
                    <SkeleBlock height={85} width="31%" borderRadius={14} />
                </View>

                <View style={[styles.filterRow, { backgroundColor: 'transparent', padding: 0 }]}>
                    <SkeleBlock height={30} width="100%" borderRadius={14} />
                </View>

                <View style={styles.list}>
                    <SkeleBlock height={160} width="100%" borderRadius={16} />
                    <SkeleBlock height={160} width="100%" borderRadius={16} />
                    <SkeleBlock height={160} width="100%" borderRadius={16} />
                </View>
            </View>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    safe:       { flex: 1, backgroundColor: C.bg },
    container:  { flex: 1, backgroundColor: C.bg },
    content:    { padding: 20, paddingBottom: 48 },
    centered:   { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: C.bg },

    // Header
    header:     { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 },
    greeting:   { fontSize: 10, color: C.muted, letterSpacing: 1.2, fontWeight: '700' },
    name:       { fontSize: 20, fontWeight: '900', color: C.text, marginTop: 2 },
    headerSub:  { fontSize: 11, color: C.sub, marginTop: 1 },
    notifBtn:   { width: 44, height: 44, borderRadius: 13, backgroundColor: C.amber + '22', alignItems: 'center', justifyContent: 'center', position: 'relative' },
    notifEmoji: { fontSize: 20 },
    badge:      { position: 'absolute', top: -4, right: -4, width: 18, height: 18, borderRadius: 9, backgroundColor: C.red, borderWidth: 2, borderColor: C.bg, alignItems: 'center', justifyContent: 'center' },
    badgeText:  { fontSize: 9, fontWeight: '900', color: '#fff' },
    headerAvatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: C.blue, alignItems: 'center', justifyContent: 'center' },
    headerAvatarText: { fontSize: 18, fontWeight: '800', color: '#fff' },

    // Stat strip
    statStrip:  { flexDirection: 'row', gap: 8, marginBottom: 16 },
    statCard:   { flex: 1, backgroundColor: C.panel, borderRadius: 14, padding: 12, alignItems: 'center', borderWidth: 1 },
    statIcon:   { fontSize: 16, marginBottom: 4 },
    statVal:    { fontSize: 22, fontWeight: '900' },
    statLabel:  { fontSize: 8, color: C.muted, fontWeight: '700', marginTop: 2, letterSpacing: 0.5 },

    // Filter tabs
    filterRow:  { flexDirection: 'row', backgroundColor: C.surface, borderRadius: 14, padding: 5, marginBottom: 16, gap: 4 },
    filterTab:  { flex: 1, paddingVertical: 8, borderRadius: 10, alignItems: 'center' },
    filterTabActive: { backgroundColor: C.amber },
    filterText: { fontSize: 11, fontWeight: '700', color: C.muted },
    filterTextActive: { color: '#000' },

    // List
    list:       { gap: 12 },
    empty:      { alignItems: 'center', paddingVertical: 48 },
    emptyIcon:  { fontSize: 36, marginBottom: 10 },
    emptyText:  { fontSize: 13, color: C.muted },

    // Card
    card:       { backgroundColor: C.panel, borderRadius: 16, padding: 15, borderWidth: 1, borderColor: C.border },
    cardTop:    { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 },
    pillRow:    { flexDirection: 'row', gap: 6, flexWrap: 'wrap', flex: 1 },
    pill:       { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 99, borderWidth: 1 },
    pillText:   { fontSize: 10, fontWeight: '700' },
    age:        { fontSize: 10, color: C.muted, marginLeft: 6, flexShrink: 0 },

    refNum:     { fontSize: 13, fontWeight: '800', color: C.amber, marginBottom: 4 },
    desc:       { fontSize: 12, color: C.sub, lineHeight: 18, marginBottom: 8 },
    location:   { fontSize: 11, color: C.sub, marginBottom: 10 },

    cardBottom:   { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 10, borderTopWidth: 1, borderTopColor: C.border },
    reporterRow:  { flexDirection: 'row', alignItems: 'center', gap: 7, flex: 1 },
    avatar:       { width: 24, height: 24, borderRadius: 12, backgroundColor: C.blue, alignItems: 'center', justifyContent: 'center' },
    avatarText:   { fontSize: 10, fontWeight: '800', color: '#fff' },
    reporterName: { fontSize: 11, color: C.sub, flex: 1 },
    riskPill:     { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 99, borderWidth: 1 },
    riskPillText: { fontSize: 10, fontWeight: '700' },
})