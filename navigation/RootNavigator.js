import { useEffect, useState } from 'react'
import { View, ActivityIndicator } from 'react-native'
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

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session)
            if (session) fetchProfile(session.user.id)
            else setLoading(false)
        })

        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            (_event, session) => {
                setSession(session)
                if (session) fetchProfile(session.user.id)
                else { setProfile(null); setLoading(false) }
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

        if (!error) setProfile(data)
        setLoading(false)
    }

    if (loading) {
        return (
            <View style={{ flex: 1, backgroundColor: '#070B13', justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator color="#2563EB" size="large" />
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

                ) : (
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

                )}

            </Stack.Navigator>
        </NavigationContainer>
    )
}