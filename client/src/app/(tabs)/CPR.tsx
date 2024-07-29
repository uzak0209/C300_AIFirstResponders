import React, { useRef, useState, useEffect } from 'react';
import { StyleSheet, View, TouchableOpacity, Text, Button, Image } from 'react-native';
import { CameraView, useCameraPermissions, CameraProps } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function App() {
  const cameraRef = useRef<CameraView>(null);
  const [hasPermission, requestPermission] = useCameraPermissions();
  const [isCapturing, setIsCapturing] = useState<boolean>(false);
  const [facing, setFacing] = useState<CameraProps['facing']>('back');
  const [capturedImage, setCapturedImage] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { granted } = await requestPermission();
      if (!granted) {
        alert("Camera permissions are required to use this app.");
      }
    })();
  }, [requestPermission]);

  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null;

    if (hasPermission?.granted && isCapturing) {
      captureFrame();
      intervalId = setInterval(captureFrame, 5000); // Capture frame every 5 seconds
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [hasPermission, isCapturing]);

  const captureFrame = async () => {
    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.5,
          base64: true,
          exif: false,
        });
        if (photo && photo.base64) {
          console.log("Captured image base64 length:", photo.base64.length);
          // Send the base64 image data to your Flask server
          const response = await fetch("https://24da-116-15-118-124.ngrok-free.app/video_feed", {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ image: photo.base64 }),
          });
          console.log("Response status:", response.status);
          const responseText = await response.text();
          console.log("Response text:", responseText);
          try {
            const responseData = JSON.parse(responseText);
            console.log("Response data:", responseData);
            if (responseData.image) {
              setCapturedImage(`data:image/jpeg;base64,${responseData.image}`);
            }
          } catch (error) {
            console.error("Error parsing JSON:", error, responseText);
          }
        }
      } catch (error) {
        console.error("Error capturing frame:", error);
      }
    }
  };

  const toggleCameraFacing = () => {
    setFacing((current) => (current === 'back' ? 'front' : 'back'));
  };

  const onStartButtonPress = () => {
    setIsCapturing(true);
  };

  const onStopButtonPress = () => {
    setIsCapturing(false);
  };

  if (!hasPermission) {
    return <View><Text>Requesting permissions...</Text></View>;
  }

  if (!hasPermission.granted) {
    return (
      <View style={styles.saveAreaContainer}>
        <Text style={{ textAlign: 'center' }}>We need your permission to show the camera</Text>
        <Button onPress={requestPermission} title="Grant Permission" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.saveAreaContainer}>
      <View style={styles.cameraContainer}>
        <CameraView style={styles.camera} ref={cameraRef} facing={facing} />
        <View style={styles.headerActionButtons}>
          <TouchableOpacity onPress={toggleCameraFacing} style={styles.cameraSwitchButton}>
            <Ionicons name="camera-reverse-outline" size={30} color="white" />
          </TouchableOpacity>
        </View>
        <View style={styles.footerActionButtons}>
          <TouchableOpacity onPress={isCapturing ? onStopButtonPress : onStartButtonPress}>
            <Ionicons name={isCapturing ? 'stop-outline' : 'camera-outline'} size={40} color="white" />
          </TouchableOpacity>
        </View>
        {capturedImage && (
          <Image source={{ uri: capturedImage }} style={styles.capturedImage} />
        )}
        <TouchableOpacity style={styles.backButton} onPress={() => {/* Add your navigation logic here */}}>
          <Ionicons name="close-outline" size={40} color="white" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  saveAreaContainer: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "black",
  },
  cameraContainer: {
    flex: 1,
    borderRadius: 25,
    overflow: 'hidden',
  },
  camera: {
    flex: 1,
  },
  headerActionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 16,
    paddingHorizontal: 20,
  },
  footerActionButtons: {
    position: 'absolute',
    bottom: 20,
    left: '50%',
    transform: [{ translateX: -20 }],
  },
  cameraSwitchButton: {
    padding: 5,
  },
  capturedImage: {
    position: 'absolute',
    bottom: 100,
    left: '50%',
    transform: [{ translateX: -75 }],
    width: 150,
    height: 150,
    borderRadius: 10,
  },
  backButton: {
    position: 'absolute',
    top: 40,
    left: 20,
  },
});
