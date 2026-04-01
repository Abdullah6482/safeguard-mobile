import { useState, useRef } from 'react'
import { StyleSheet, Text, View, TouchableOpacity, SafeAreaView, Image } from 'react-native'
import { CameraView, useCameraPermissions } from 'expo-camera'
import * as ImagePicker from 'expo-image-picker'
import { Ionicons } from '@expo/vector-icons'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

export default function CameraScreen({ navigation, route }) {
    const [facing, setFacing] = useState('back')
    const [flash, setFlash] = useState('off') // 'off', 'on', 'auto'
    const [permission, requestPermission] = useCameraPermissions()
    const cameraRef = useRef(null)
    const insets = useSafeAreaInsets()

    if (!permission) {
        // Camera permissions are still loading
        return <View style={styles.container} />
    }

    if (!permission.granted) {
        // Camera permissions are not granted yet
        return (
            <SafeAreaView style={styles.permissionContainer}>
                <Text style={styles.permissionText}>We need your permission to show the camera</Text>
                <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
                    <Text style={styles.permissionButtonText}>Grant Permission</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.permissionButtonSec} onPress={() => navigation.goBack()}>
                    <Text style={styles.permissionButtonText}>Cancel</Text>
                </TouchableOpacity>
            </SafeAreaView>
        )
    }

    const toggleFacing = () => {
        setFacing(current => (current === 'back' ? 'front' : 'back'))
    }

    const toggleFlash = () => {
        setFlash(current => {
            if (current === 'off') return 'on'
            if (current === 'on') return 'auto'
            return 'off'
        })
    }

    const takePicture = async () => {
        if (!cameraRef.current) return
        try {
            const photo = await cameraRef.current.takePictureAsync({
                quality: 0.8,
            })
            if (photo && photo.uri) {
                navigation.navigate('Details', {
                    ...(route.params || {}),
                    photoUri: photo.uri,
                })
            }
        } catch (e) {
            console.log("Failed to take picture:", e)
        }
    }

    const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            quality: 0.8,
        })

        if (!result.canceled && result.assets && result.assets.length > 0) {
            navigation.navigate('Details', {
                ...(route.params || {}),
                photoUri: result.assets[0].uri,
            })
        }
    }

    return (
        <View style={styles.container}>
            <CameraView 
                style={styles.camera} 
                facing={facing} 
                enableTorch={flash === 'on'}
                ref={cameraRef}
            >
                {/* ── Top Controls ── */}
                <View style={[styles.topControls, { paddingTop: Math.max(insets.top, 16) }]}>
                    <TouchableOpacity style={styles.iconButton} onPress={() => navigation.goBack()}>
                        <Ionicons name="close" size={28} color="white" />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.iconButton} onPress={toggleFlash}>
                        {flash === 'on' ? (
                            <Ionicons name="flash" size={24} color="#FBBF24" />
                        ) : flash === 'auto' ? (
                            <Ionicons name="flash-outline" size={24} color="white" />
                        ) : (
                            <Ionicons name="flash-off" size={24} color="white" />
                        )}
                    </TouchableOpacity>
                </View>

                {/* ── Bottom Controls ── */}
                <View style={styles.bottomControls}>
                    <TouchableOpacity style={styles.galleryButton} onPress={pickImage}>
                        <Ionicons name="image-outline" size={28} color="white" />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.shutterButton} onPress={takePicture}>
                        <View style={styles.shutterInner} />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.flipButton} onPress={toggleFacing}>
                        <Ionicons name="camera-reverse-outline" size={30} color="white" />
                    </TouchableOpacity>
                </View>
            </CameraView>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    camera: {
        flex: 1,
        justifyContent: 'space-between',
    },
    permissionContainer: {
        flex: 1,
        backgroundColor: '#070B13',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    permissionText: {
        fontSize: 16,
        color: '#F1F5F9',
        textAlign: 'center',
        marginBottom: 24,
    },
    permissionButton: {
        backgroundColor: '#2563EB',
        paddingVertical: 14,
        paddingHorizontal: 32,
        borderRadius: 12,
        marginBottom: 12,
        width: '100%',
        alignItems: 'center',
    },
    permissionButtonSec: {
        backgroundColor: '#121C30',
        paddingVertical: 14,
        paddingHorizontal: 32,
        borderRadius: 12,
        width: '100%',
        alignItems: 'center',
    },
    permissionButtonText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '700',
    },
    topControls: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: 10,
    },
    iconButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    iconText: {
        fontSize: 20,
        color: '#FFF',
    },
    bottomControls: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        paddingBottom: 50,
        paddingHorizontal: 20,
        backgroundColor: 'rgba(0,0,0,0.4)',
        paddingTop: 20,
    },
    shutterButton: {
        width: 76,
        height: 76,
        borderRadius: 38,
        backgroundColor: 'rgba(255,255,255,0.3)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    shutterInner: {
        width: 62,
        height: 62,
        borderRadius: 31,
        backgroundColor: '#FFF',
    },
    galleryButton: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    flipButton: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
})
