import React, { useState, useEffect } from 'react';
import * as Location from 'expo-location';
import { Marker } from 'react-native-maps';
import MapView from 'react-native-maps';
import { StyleSheet, Text, SafeAreaView, Button, Alert } from 'react-native';
import { collection, getDocs, query, addDoc, where } from 'firebase/firestore';
import { AED_DB } from '../../firebaseConfig'; // Adjust import path as needed
import * as ImagePicker from 'expo-image-picker';

const NOMINATIM_API_URL = 'https://nominatim.openstreetmap.org/reverse';

interface AEDLocation {
  name?: string;
  latitude: number;
  longitude: number;
  imageUrl?: string;
}

const AEDLocs: React.FC = () => {
  const [userLocation, setUserLocation] = useState<GeolocationCoordinates | null>(null);
  const [nearestAed, setNearestAed] = useState<AEDLocation | null>(null);
  const [nearestAEDName, setNearestAEDName] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const getUserLocation = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      setErrorMessage('Location access denied');
      return;
    }

    try {
      const location = await Location.getCurrentPositionAsync({});
      const newCoords = { ...location?.coords, accuracy: location?.coords?.accuracy ?? 0 };
      setUserLocation(newCoords);
    } catch (error) {
      setErrorMessage('Error accessing your location');
    }
  };

  const fetchAedLocations = async () => {
    if (!userLocation) return;

    try {
      const aedLocationsCollection = collection(AED_DB, 'aed');
      const aedLocationsQuery = query(aedLocationsCollection);
      const querySnapshot = await getDocs(aedLocationsQuery);

      let nearestAed: AEDLocation | null = null;
      let nearestDistance = Infinity;

      const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
        const R = 6371e3;
        const dLat = radians(lat2 - lat1);
        const dLon = radians(lon1 - lon2);
        const a =
          Math.sin(dLat / 2) * Math.sin(dLat / 2) +
          Math.cos(radians(lat1)) * Math.cos(radians(lat2)) *
          Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
      };

      const radians = (degrees: number) => degrees * Math.PI / 180;

      querySnapshot.forEach((doc) => {
        const data = doc.data() as AEDLocation;
        const distance = calculateDistance(userLocation.latitude, userLocation.longitude, data.latitude, data.longitude);
        if (distance < nearestDistance) {
          nearestAed = data;
          nearestDistance = distance;
        }
      });

      if (nearestAed) {
        const fetchLocationName = async (coords: AEDLocation) => {
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
              setNearestAEDName(filteredLocationParts);
            } else {
              setNearestAEDName('Unknown location');
            }
          } catch (error) {
            console.error('Error fetching location name:', error);
            Alert.alert('Error', 'Failed to fetch location name. Please try again.');
          }
        };

        await fetchLocationName(nearestAed);
        setNearestAed(nearestAed);
      }
    } catch (error) {
      console.error('Error fetching AED locations:', error);
      setErrorMessage('Error fetching AED locations. Please try again.');
    }
  };

  const checkIfAedExists = async (latitude: number, longitude: number): Promise<boolean> => {
    const aedLocationsCollection = collection(AED_DB, 'aed');
    const aedQuery = query(
      aedLocationsCollection,
      where('latitude', '==', latitude),
      where('longitude', '==', longitude)
    );
    const querySnapshot = await getDocs(aedQuery);
    return !querySnapshot.empty;
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchCameraAsync({
      base64: true,
      quality: 1,
      exif: true,
    });

    if (!result.canceled) {
      const base64 = result.assets[0]?.base64;
      if (base64) {
        sendImageToServer(base64);
      } else {
        setErrorMessage('Image capture failed.');
      }
    } else {
      setErrorMessage('Image capture was cancelled or failed.');
    }
  };

  const sendImageToServer = async (base64: string) => {
    try {
      console.log("Sending image to server for AED detection");
      const response = await fetch("https://3fb1-42-60-99-126.ngrok-free.app/aed_detection", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image: base64,
        }),
      });

      const data = await response.json();

      if (data.message === 'AED detected') {
        if (userLocation) {
          const exists = await checkIfAedExists(userLocation.latitude, userLocation.longitude);
          if (exists) {
            setErrorMessage('AED already registered at this location.');
          } else {
            await addDoc(collection(AED_DB, 'aed'), {
              latitude: userLocation.latitude,
              longitude: userLocation.longitude,
              name: nearestAEDName,
            });

            fetchAedLocations();
          }
        }
      } else {
        setErrorMessage('No AED detected in the image.');
      }
    } catch (error) {
      console.error('Failed to send image to server:', error);
      setErrorMessage('Failed to send image to server.');
    }
  };

  useEffect(() => {
    const initialize = async () => {
      await getUserLocation();
    };
    initialize();
  }, []);

  useEffect(() => {
    if (userLocation) {
      fetchAedLocations();
    }
  }, [userLocation]);

  if (errorMessage) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.text}>{errorMessage}</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Button title="Register AED" color="red" onPress={pickImage} />
      {userLocation && (
        <MapView
          style={styles.map}
          region={{
            latitude: userLocation.latitude,
            longitude: userLocation.longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          }}
          showsUserLocation={true}
        >
          {nearestAed && (
            <Marker
              coordinate={{ latitude: nearestAed.latitude, longitude: nearestAed.longitude }}
              title={nearestAEDName}
              description="Nearest AED"
            />
          )}
        </MapView>
      )}
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
});

export default AEDLocs;
