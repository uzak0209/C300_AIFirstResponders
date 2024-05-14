import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import { useRef, useState } from "react";
import { Button, StyleSheet, Text, View, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { CameraProps, CameraView, useCameraPermissions } from 'expo-camera';

export default function Camera() {
    const cameraRef = useRef<CameraView>(null);
    const [facing, setFacing] = useState<CameraProps["facing"]>("back");
    const [hasPermission, requestPermission] = useCameraPermissions();

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

        const response = await fetch("https://b986-101-100-172-100.ngrok-free.app/upload", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ image: photo?.base64 })
        });

        console.log(response.status)
    }

    return (
        <SafeAreaView style={styles.saveAreaContainer}>
            <View style={styles.cameraContainer}>
                <StatusBar style="light" />
                <CameraView style={styles.camera} ref={cameraRef} facing={facing}>
                    <View style={styles.headerActionButtons}>
                        <TouchableOpacity >
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
        backgroundColor: 'black'
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
