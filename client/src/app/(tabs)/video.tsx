import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import { useRef, useState, useEffect } from "react";
import { Button, StyleSheet, Text, View, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { CameraProps, CameraView, useCameraPermissions } from 'expo-camera';
import { useRouter } from "expo-router";
import { GLView } from 'expo-gl'; // Import GLView from expo-gl
import * as pose from "@mediapipe/pose";

export default function Camera() {
  const router = useRouter();
  const cameraRef = useRef<CameraView>(null);
  const [facing, setFacing] = useState<CameraProps["facing"]>("back");
  const [hasPermission, requestPermission] = useCameraPermissions();
  const [poseLandmarks, setPoseLandmarks] = useState<any>(null);

  useEffect(() => {
    if (!hasPermission) {
      return;
    }

    if (!hasPermission.granted) {
      requestPermission();
    }

    const poseInstance = new pose.Pose({
      locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`,
    });

    poseInstance.onResults((results) => {
      setPoseLandmarks(results.poseLandmarks);
    });

    if (cameraRef.current) {
      const sendCameraFrameToPoseDetector = async () => {
        if (cameraRef.current) {
          const frame = await cameraRef.current.takePictureAsync({
            quality: 1,
            base64: true,
          });

          if (frame?.base64) {
            const img = new Image();
            img.src = `data:image/jpeg;base64,${frame.base64}`;
            img.onload = async () => {
              poseInstance.send({ image: img });
            };
          }
        }
      };

      const intervalId = setInterval(sendCameraFrameToPoseDetector, 100);

      return () => {
        clearInterval(intervalId);
        poseInstance.close();
      };
    }
  }, [hasPermission]);

  if (!hasPermission) {
    return <View />;
  }

  if (!hasPermission.granted) {
    return (
      <View style={styles.saveAreaContainer}>
        <Text style={{ textAlign: 'center' }}>We need your permission to show the camera</Text>
        <Button onPress={requestPermission} title="grant permission" />
      </View>
    );
  }

  async function toggleCameraFacing() {
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  }

  const registerShuttlePress = async () => {
    let options = {
      quality: 1,
      base64: true,
      exif: true
    };

    try {
      const photo = await cameraRef.current?.takePictureAsync(options);

      if (!photo?.base64) {
        throw new Error("Failed to capture photo");
      }

      const response = await fetch("https://f0d5-116-15-119-114.ngrok-free.app/upload", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ image: photo.base64 })
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      console.log("Upload successful:", response.status);
    } catch (error) {
      console.error("Error in registerShuttlePress:", error);
    }
  };

  function onCloseButtonPress() {
    router.replace("/");
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
            <TouchableOpacity onPress={toggleCameraFacing} style={styles.cameraSwitchButton}>
              <Ionicons name={"camera-reverse-outline"} size={30} color="white" />
            </TouchableOpacity>
          </View>

          <View style={styles.footerActionButtons}>
            <TouchableOpacity onPress={registerShuttlePress}>
              <Ionicons name='camera-outline' size={40} color="white" />
            </TouchableOpacity>
          </View>
        </CameraView>
        {poseLandmarks && (
          <View>
            <Text style={styles.text}>Pose Landmarks detected!</Text>
            {/* Display or utilize poseLandmarks data here */}
          </View>
        )}
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
  },
  cameraSwitchButton: {
    padding: 5,
  }
});
