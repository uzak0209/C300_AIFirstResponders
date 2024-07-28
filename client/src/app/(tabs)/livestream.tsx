// import React, { useRef, useState, useEffect } from 'react';
// import { Button, StyleSheet, View, TouchableOpacity, Text } from 'react-native';
// import { Camera as ExpoCamera } from 'expo-camera';
// import * as CameraType from 'expo-camera/build/Camera.types';

// export default function LiveStream() {
//   const cameraRef = useRef<ExpoCamera | null>(null);
//   const [hasPermission, setHasPermission] = useState<boolean | null>(null);
//   const [isStreaming, setIsStreaming] = useState(false);

//   useEffect(() => {
//     (async () => {
//       const { status } = await ExpoCamera.requestCameraPermissionsAsync();
//       setHasPermission(status === 'granted');
//     })();
//   }, []);

//   const startStreaming = () => {
//     setIsStreaming(true);
//     streamFrames();
//   };

//   const stopStreaming = () => {
//     setIsStreaming(false);
//   };

//   const streamFrames = async () => {
//     if (cameraRef.current && isStreaming) {
//       const photo = await cameraRef.current.takePictureAsync({ base64: true });
//       sendFrameToServer(photo.base64);
//       setTimeout(streamFrames, 1000 / 30); // Stream at ~30 fps
//     }
//   };

//   const sendFrameToServer = async (base64Image: string | undefined) => {
//     if (!base64Image) return;
//     try {
//       await fetch('http://YOUR_SERVER_IP:5000/video_feed', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({ image: base64Image }),
//       });
//     } catch (error) {
//       console.error('Error sending frame to server:', error);
//     }
//   };

//   if (hasPermission === null) {
//     return <View />;
//   }

//   if (!hasPermission) {
//     return (
//       <View style={styles.container}>
//         <Text>We need your permission to show the camera</Text>
//         <Button onPress={() => ExpoCamera.requestCameraPermissionsAsync()} title="Grant Permission" />
//       </View>
//     );
//   }

//   return (
//     <View style={styles.container}>
//       <ExpoCamera 
//         style={styles.camera} 
//         type={CameraType.Constants.Type.back} 
//         ref={cameraRef}
//       >
//         <View style={styles.buttonContainer}>
//           <TouchableOpacity onPress={startStreaming} style={styles.button}>
//             <Text>Start Streaming</Text>
//           </TouchableOpacity>
//           <TouchableOpacity onPress={stopStreaming} style={styles.button}>
//             <Text>Stop Streaming</Text>
//           </TouchableOpacity>
//         </View>
//       </ExpoCamera>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   camera: {
//     flex: 1,
//     width: '100%',
//   },
//   buttonContainer: {
//     flexDirection: 'row',
//     justifyContent: 'space-around',
//     padding: 10,
//   },
//   button: {
//     padding: 10,
//     backgroundColor: 'white',
//     borderRadius: 5,
//   },
// });