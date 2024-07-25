import React, { useState, useEffect } from 'react';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import * as Location from 'expo-location';
import { Marker } from 'react-native-maps';
import MapView from 'react-native-maps';
import { StyleSheet, View, Text, SafeAreaView, Button } from 'react-native';
import { collection, getDocs, query } from 'firebase/firestore';
import { AED_DB } from '../../firebaseConfig'; // Adjust import path as needed

interface AEDLocation {
  name?: string;
  latitude: number;
  longitude: number;
}

const AEDLocs: React.FC = () => {
  const [userLocation, setUserLocation] = useState<GeolocationCoordinates | null>(null);
  const [nearestAed, setNearestAed] = useState<AEDLocation | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const navigation = useNavigation<NavigationProp<any>>();

  const getUserLocation = async () => {
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

  const fetchAedLocations = async () => {
    if (!userLocation) return;

    try {
      const aedLocationsCollection = collection(AED_DB, 'aed');
      const aedLocationsQuery = query(aedLocationsCollection);
      const querySnapshot = await getDocs(aedLocationsQuery);

      let nearestAed: AEDLocation | null = null;
      let nearestDistance = Infinity;

      const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
        const R = 6371e3; // meters
        const dLat = radians(lat2 - lat1);
        const dLon = radians(lon2 - lon1);
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

      setNearestAed(nearestAed);
    } catch (error) {
      console.error('Error fetching AED locations:', error);
      setErrorMessage('Error fetching AED locations. Please try again.');
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
      <Button title="Register AED" color="red" onPress={() => navigation.navigate('camera')} />
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
              title={'Nearest AED'}
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
