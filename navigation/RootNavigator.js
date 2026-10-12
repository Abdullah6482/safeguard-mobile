import { useEffect, useState } from 'react'
import { View, ActivityIndicator, Text, TouchableOpacity } from 'react-native'
import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { supabase } from '../lib/supabase'

// Auth
import LoginScreen from '../screens/auth/LoginScreen'

// Reporter screens (Phase A)
import ReporterHomeScreen from '../screens/reporter/HomeScreen'
import ContextScreen from '../screens/reporter/ContextScreen'
import IncidentTypeScreen from '../screens/reporter/IncidentTypeScreen'
import DetailsScreen from '../screens/reporter/DetailsScreen'
import RiskMatrixScreen from '../screens/reporter/RiskMatrixScreen'
import SuccessScreen from '../screens/reporter/SuccessScreen'
import CameraScreen from '../screens/reporter/CameraScreen'

// Investigator screens (Phase B)
import InvestigatorDashboardScreen from '../screens/investigator/DashboardScreen'
import ReportDetailScreen from '../screens/investigator/ReportDetailScreen'
import PillarRiskScreen from '../screens/investigator/PillarRiskScreen'
import CapaScreen from '../screens/investigator/CapaScreen'
import ForwardedScreen from '../screens/investigator/ForwardedScreen'

const Stack = createNativeStackNavigator()

export default function RootNavigator() {
    const [session, setSession] = useState(null)
    const [profile, setProfile] = useState(null)
    const [loading, setLoading] = useState(true)
    const [profileError, setProfileError] = useState(null)

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session)
            if (session) {
                setLoading(true)
                fetchProfile(session.user.id)
            }
            else setLoading(false)
        })

        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            (_event, session) => {
                setSession(session)
                if (session) {
                    setProfile(null)
                    setProfileError(null)
                    setLoading(true)
                    fetchProfile(session.user.id)
                } else {
                    setProfile(null)
                    setProfileError(null)
                    setLoading(false)
                }
            }
        )

        return () => subscription.unsubscribe()
    }, [])

    const fetchProfile = async (userId) => {
        const { data, error } = await supabase
            .from('profiles')
            .select('role, full_name')
            .eq('id', userId)
            .single()

        if (!error && ['reporter', 'investigator'].includes(data?.role)) {
            setProfile(data)
            setProfileError(null)
        } else {
            setProfile(null)
            setProfileError(error?.message || 'Your account does not have a supported mobile role.')
        }
        setLoading(false)
    }

    // Authentication events update the session before the asynchronous profile
    // lookup finishes. Keep the navigator unmounted during that short gap so it
    // is never rendered without at least one registered screen.
    if (loading || (session && !profile && !profileError)) {
        return (
            <View style={{ flex: 1, backgroundColor: '#070B13', justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator color="#2563EB" size="large" />
            </View>
        )
    }

    if (session && profileError) {
        return (
            <View style={{ flex: 1, backgroundColor: '#070B13', justifyContent: 'center', alignItems: 'center', padding: 24 }}>
                <Text style={{ color: '#EF4444', fontSize: 20, fontWeight: '800', marginBottom: 10 }}>Account access unavailable</Text>
                <Text style={{ color: '#94A3B8', textAlign: 'center', marginBottom: 20 }}>{profileError}</Text>
                <TouchableOpacity onPress={() => supabase.auth.signOut()} style={{ backgroundColor: '#2563EB', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 10 }}>
                    <Text style={{ color: '#fff', fontWeight: '700' }}>Sign Out</Text>
                </TouchableOpacity>
            </View>
        )
    }

    return (
        <NavigationContainer>
            <Stack.Navigator screenOptions={{ headerShown: false }}>

                {!session ? (
                    // ── Not logged in ──────────────────────────────
                    <Stack.Screen name="Login" component={LoginScreen} />

                ) : profile?.role === 'investigator' ? (
                    // ── Investigator flow ──────────────────────────
                    <>
                        <Stack.Screen name="InvestigatorDashboard" component={InvestigatorDashboardScreen} />
                        <Stack.Screen name="ReportDetail"          component={ReportDetailScreen} />
                        <Stack.Screen name="PillarRisk"            component={PillarRiskScreen} />
                        <Stack.Screen name="Capa"                  component={CapaScreen} />
                        <Stack.Screen name="Forwarded"             component={ForwardedScreen} />
                    </>

                ) : profile?.role === 'reporter' ? (
                    // ── Reporter flow ──────────────────────────────
                    <>
                        <Stack.Screen name="ReporterHome" component={ReporterHomeScreen} />
                        <Stack.Screen name="Context" component={ContextScreen} />
                        <Stack.Screen name="IncidentType" component={IncidentTypeScreen} />
                        <Stack.Screen name="Details" component={DetailsScreen} />
                        <Stack.Screen name="Camera" component={CameraScreen} />
                        <Stack.Screen name="RiskMatrix" component={RiskMatrixScreen} />
                        <Stack.Screen name="Success" component={SuccessScreen} />
                    </>

                ) : null}

            </Stack.Navigator>
        </NavigationContainer>
    )
}
