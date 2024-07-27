import React, { useState, useEffect } from 'react';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import * as Location from 'expo-location';
import { Marker } from 'react-native-maps';
import MapView from 'react-native-maps';
import { StyleSheet, Text, SafeAreaView, Button, TextInput, Alert, TouchableOpacity, View } from 'react-native';
import { SOS_DB, SOS_Storage } from '../../firebaseConfig';
import { addDoc, collection } from 'firebase/firestore';
import { FontAwesome } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const NOMINATIM_API_URL = 'https://nominatim.openstreetmap.org/reverse';

const SOS: React.FC = () => {
  const navigation = useNavigation<NavigationProp<any>>();
  const [userLocation, setUserLocation] = useState<GeolocationCoordinates | null>(null);
  const [locationName, setLocationName] = useState<string>('');
  const [details, setDetails] = useState('');
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const getLocation = async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMessage('Location access denied');
        return;
      }

      try {
        const location = await Location.getCurrentPositionAsync({});
        const newCoords = { ...location.coords, accuracy: location.coords.accuracy ?? 0 };
        setUserLocation(newCoords);
      } catch (error) {
        setErrorMessage('Error accessing your location');
      }
    };
    getLocation();
  }, []);

  useEffect(() => {
    if (userLocation) {
      fetchLocationName(userLocation);
    }
  }, [userLocation]);

  const fetchLocationName = async (coords: GeolocationCoordinates) => {
    try {
      const params = new URLSearchParams({
        lat: coords.latitude.toString(),
        lon: coords.longitude.toString(),
        format: 'json',
      });

      const response = await fetch(`${NOMINATIM_API_URL}?${params.toString()}`);

      if (!response.ok) {
        throw new Error(`Geocoding API request failed with status: ${response.status}`);
      }

      const data = await response.json();
      if (data && data.address) {
        const { house_number, road, postcode } = data.address;
        const filteredLocationParts = [house_number, road, postcode].filter(part => part).join(', ');
        setLocationName(filteredLocationParts);
      } else {
        setLocationName('Unknown location');
      }
    } catch (error) {
      console.error('Error fetching location name:', error);
      Alert.alert('Error', 'Failed to fetch location name. Please try again.');
    }
  };

  const handleMicrophonePress = async () => {
    try {
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') {
        return alert('Error: Recording permission denied.');
      }

      if (isRecording && recording) {
        await handleStopRecording();
      } else {
        await handleStartRecording();
      }
    } catch (error) {
      console.error('Error handling microphone press:', error);
    }
  };

  const handleStartRecording = async () => {
    try {
      const { recording } = await Audio.Recording.createAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
      setRecording(recording);
      setIsRecording(true);
      console.log('Recording started');
    } catch (error) {
      console.error('Error starting recording:', error);
    }
  };

  const handleStopRecording = async () => {
    if (recording) {
      try {
        await recording.stopAndUnloadAsync();
        setIsRecording(false);
        setRecording(null);
        console.log('Recording stopped');
      } catch (error) {
        console.error('Error stopping recording:', error);
      }
    }
  };

  const handleSOSPress = () => {
    if (!userLocation) {
      alert('Location unavailable. Please try again.');
      return;
    }
  
    Alert.alert(
      'Confirm SOS',
      `Send SOS signal to your current location (${locationName ? locationName : 'Unknown location'}) (Latitude: ${userLocation.latitude}, Longitude: ${userLocation.longitude}) with details: ${details}?`,
      [
        { text: 'Cancel', onPress: () => {}, style: 'cancel' },
        {
          text: 'Send',
          onPress: async () => {
            try {
              // Stop recording if it is in progress
              if (isRecording && recording) {
                await handleStopRecording();
              }
  
              let audioDownloadURL = '';
              if (recording) {
                const audioUri = recording.getURI();
                if (audioUri) {
                  audioDownloadURL = await uploadAudioToFirebase(audioUri);
                }
              }
              await sendSOSRequest(audioDownloadURL);
            } catch (error) {
              console.error('Error sending SOS:', error);
              Alert.alert('Error', 'Failed to send SOS. Please try again.');
            }
          },
          style: 'destructive',
        },
      ]
    );
  };  

  const sendSOSRequest = async (audioDownloadURL: string) => {
    try {
      const currentTime = new Date();
      const sosData = {
        id: generateRandomId(),
        name: locationName,
        latitude: userLocation?.latitude ?? 0,
        longitude: userLocation?.longitude ?? 0,
        details,
        timestamp: currentTime,
        audioUrl: audioDownloadURL,
      };

      const docRef = await addDoc(collection(SOS_DB, 'sosRequests'), sosData);
      console.log('SOS request sent successfully:', docRef.id);
      navigation.goBack();
      setDetails('');
    } catch (error) {
      console.error('Error sending SOS request:', error);
      Alert.alert('Error', 'Failed to send SOS request. Please try again.');
    }
  };

  const uploadAudioToFirebase = async (uri: string) => {
    const filename = generateRandomId() + '.m4a';
    const storageRef = ref(SOS_Storage, `uploadvoice/${filename}`);

    try {
      const response = await fetch(uri);
      const blob = await response.blob();

      const uploadTask = await uploadBytes(storageRef, blob);
      const downloadURL = await getDownloadURL(uploadTask.ref);

      return downloadURL;
    } catch (error) {
      console.error('Error uploading audio to Firebase Storage:', error);
      throw error;
    }
  };

  const generateRandomId = (length = 10) => {
    const randomString = Math.random().toString(36).substring(2, length);
    return randomString;
  };

  if (errorMessage) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.text}>{errorMessage}</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <MapView
        style={styles.map}
        region={{
          latitude: userLocation?.latitude ?? 0,
          longitude: userLocation?.longitude ?? 0,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
        showsUserLocation={true}
      >
        {userLocation && (
          <Marker
            coordinate={{ latitude: userLocation.latitude, longitude: userLocation.longitude }}
            title="Your Location"
          />
        )}
      </MapView>
      <View style={styles.inputContainer}>
        <TextInput
          placeholder="Enter details (optional)"
          value={details}
          onChangeText={setDetails}
          style={styles.textInput}
        />
        <TouchableOpacity onPress={handleMicrophonePress} style={styles.microphoneButton}>
          <FontAwesome name="microphone" size={24} color={isRecording ? 'red' : 'black'} />
        </TouchableOpacity>
      </View>
      <Button title="Send SOS Signal" onPress={handleSOSPress} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  text: {
    fontSize: 20,
    textAlign: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 5,
  },
  textInput: {
    flex: 1,
    padding: 10,
    fontSize: 16,
  },
  microphoneButton: {
    padding: 10,
  },
});

export default SOS;
