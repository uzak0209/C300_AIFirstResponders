import React, { useState, useEffect } from 'react';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import * as Location from 'expo-location';
import { Marker } from 'react-native-maps';
import MapView from 'react-native-maps';
import { StyleSheet, Text, SafeAreaView, Button, TextInput, Alert } from 'react-native';
import { SOS_DB } from '../../firebaseConfig';
import { addDoc, collection } from 'firebase/firestore';

const GEOCODING_API_URL = 'https://maps.googleapis.com/maps/api/geocode/json?'; // Google Maps Geocoding API endpoint

const SOS: React.FC = () => {
  const navigation = useNavigation<NavigationProp<any>>();
  const [userLocation, setUserLocation] = useState<GeolocationCoordinates | null>(null);
  const [locationName, setLocationName] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [details, setDetails] = useState('');

  const getLocation = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      setErrorMessage('Location access denied');
      return;
    }

    try {
      const location = await Location.getCurrentPositionAsync({});
      const newCoords = { ...location?.coords, accuracy: location?.coords?.accuracy ?? 0 }; // Spread operator and default value
      setUserLocation(newCoords);
    } catch (error) {
      console.error('Error getting user location:', error);
      setErrorMessage('Error accessing your location');
    }
  };

  const fetchLocationName = async (coords: GeolocationCoordinates) => {
    try {
      const params = new URLSearchParams();
      params.set('latlng', `<span class="math-inline">\{coords\.latitude\},</span>{coords.longitude}`);
      // Replace with your actual Google Maps API key
      params.set('key', 'AIzaSyCWUNYEbqoLWkIaJcpbJXPiXMcHkKjq92k'); // Placeholder, replace with your key

      const url = GEOCODING_API_URL + params.toString();

      const response = await fetch(url);

      if (!response.ok) {
        // Check for specific geocoding API error codes
        if (response.status === 400) {
          throw new Error('Bad request. Please check your API key or request parameters.');
        } else if (response.status === 403) {
          throw new Error('API key exceeded quota or is disabled.');
        } else {
          throw new Error(`Geocoding API request failed with status: ${response.status}`);
        }
      }

      const data = await response.json();
      const addressComponents = data.results[0].address_components;
      let locationName = '';

      // Extract relevant location name (e.g., building name, area name)
      addressComponents.forEach((component: { types: string | string[]; long_name: string; }) => {
        if (component.types.includes('locality') || 
            component.types.includes('administrative_area_level_2') || 
            component.types.includes('sublocality') || // Include sublocality
            component.types.includes('neighborhood') // Include neighborhood
            ) {
            if (locationName === '') { // Only set locationName once
              locationName = component.long_name;
            }
          return locationName; // Stop after finding a suitable name
        }
      });

      setLocationName(locationName);
    } catch (error) {
      console.error('Error fetching location name:', error);
      // Handle error (e.g., display message to user)
      Alert.alert('Error', 'Failed to fetch location name. Please try again.');
    }
  };

  useEffect(() => {
    getLocation();
  }, []);

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
          onPress: () => sendSOSRequest(), // Call sendSOSRequest
          style: 'destructive',
        },
      ]
    );
  };

  function generateRandomId(length = 10) {
    const randomString = Math.random().toString(36).substring(2, length); // Convert to base 36 string
    return randomString;
    }

  const sendSOSRequest = async () => {
    try {
      const currentTime = new Date();
      const sosData = {
        id: generateRandomId(),
        name: locationName,
        latitude: userLocation?.latitude ?? 0,
        longitude: userLocation?.longitude ?? 0,
        details: details,
        timestamp: currentTime, // Include timestamp
      };
  
      const docRef = await addDoc(collection(SOS_DB, 'sosRequests'), sosData);
      console.log('SOS request sent successfully:', docRef.id);
      navigation.navigate('HelpNeeded'); // Navigate after success
      setDetails(''); // Clear details
    } catch (error) {
      console.error('Error sending SOS request:', error);
      Alert.alert('Error', 'Failed to send SOS request. Please try again.');
    }
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
      <TextInput
        placeholder="Enter details (optional)"
        value={details}
        onChangeText={(text) => setDetails(text)}
        style={styles.textInput}
      />
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
  textInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    margin: 10,
  },
});

export default SOS;
