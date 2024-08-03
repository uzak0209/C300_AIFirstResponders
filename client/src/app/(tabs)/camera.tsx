import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import { useEffect, useRef, useState } from "react";
import { Button, StyleSheet, Text, View, TouchableOpacity, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { CameraProps, CameraView, useCameraPermissions } from 'expo-camera';
import { useRouter } from "expo-router";
import * as Location from 'expo-location';

export default function Camera() {
    const router = useRouter();
    const cameraRef = useRef<CameraView>(null);
    const [facing, setFacing] = useState<CameraProps["facing"]>("back");
    const [hasPermission, requestPermission] = useCameraPermissions();

    useEffect(() => {
        (async () => {
            await Location.requestForegroundPermissionsAsync();
        })();
    }, []);

    if (!hasPermission) {
        return <View />;
    }

    if (!hasPermission.granted) {
        // Camera permissions are not granted yet.
        return (
            <View style={styles.saveAreaContainer}>
                <Text style={{ textAlign: 'center' }}>We need your permission to show the camera</Text>
                <Button onPress={requestPermission} title="grant permission" />
            </View>
        );
    }

    function toggleCameraFacing() {
        setFacing(current => (current === 'back' ? 'front' : 'back'));
    }

    const registerShuttlePress = async () => {
        let options = {
            quality: 1,
            base64: true,
            exif: true
        }

        const photo = await cameraRef.current?.takePictureAsync(options);
        const location = await Location.getCurrentPositionAsync();

        const response = await fetch("https://2ba3-203-127-47-51.ngrok-free.app/upload", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ image: photo?.base64, location: location })
        });

        const responseJson = await response.json();

        if (response.ok) {
            console.log(responseJson);
            Alert.alert("Status", responseJson.message || "No response field found.");
        }
    }

    function onCloseButtonPress() {
        router.replace("/")
    }

    return (
        <SafeAreaView style={styles.saveAreaContainer}>
            <StatusBar style="auto" />
            <View style={styles.cameraContainer}>
                <CameraView style={styles.camera} ref={cameraRef} facing={facing}>
                    <View style={styles.headerActionButtons}>
                        <TouchableOpacity onPress={onCloseButtonPress}>
                            <Ionicons name="close-outline" size={40} color="white" />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.footerActionButtons}>
                        <TouchableOpacity onPress={registerShuttlePress}>
                            <Ionicons name='camera-outline' size={40} color="white" />
                        </TouchableOpacity>
                    </View>
                </CameraView>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    saveAreaContainer: {
        flex: 1,
        justifyContent: "center",
        backgroundColor: "black"
    },
    cameraContainer: {
        flex: 1,
        borderRadius: 25,
        overflow: 'hidden'
    },
    camera: {
        flex: 1
    },
    headerActionButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingTop: 16,
        paddingHorizontal: 20
    },
    footerActionButtons: {
        position: 'absolute',
        bottom: 20,
        left: '50%',
        transform: [{ translateX: -20 }]
    },
    text: {
        fontSize: 32,
        color: 'white'
    }
})
