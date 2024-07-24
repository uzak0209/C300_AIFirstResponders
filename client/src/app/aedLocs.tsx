import React, { useState, useEffect } from 'react';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import * as Location from 'expo-location'; // for location access
import { Marker } from 'react-native-maps'; // for map markers
import MapView from 'react-native-maps'; // for displaying the map
import { StyleSheet, View, Text, SafeAreaView, Button } from 'react-native';
import { getFirestore, collection, getDocs, query } from 'firebase/firestore'; // for Firestore access

// Assuming you have Firebase configured and imported (replace with your configuration)
import { AED_DB } from '../../firebaseConfig'; // Adjust import path as needed

interface AEDLocation {
  name?: string; // Optional property for name
  latitude: number;
  longitude: number;
}

const AEDLocs: React.FC = () => {
  const [userLocation, setUserLocation] = useState<GeolocationCoordinates | null>(null);
  const [aedLocations, setAedLocations] = useState<AEDLocation[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const navigation = useNavigation<NavigationProp<any>>();

  // Function to handle user location permission and retrieval
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

  // Function to fetch AED locations from Firestore
  const fetchAedLocations = async () => {
    if (!userLocation) {
      setErrorMessage('Please allow location access to proceed');
      return;
    }

    try {
      const aedLocationsCollection = collection(AED_DB, 'aed'); 
      const aedLocationsQuery = query(aedLocationsCollection); // Optional: filter or sort based on needs
      const querySnapshot = await getDocs(aedLocationsQuery);

      let nearestAed = null;
      let nearestDistance = Infinity;

      // Function to calculate distance between two coordinates
      let lat1 = userLocation.latitude;
      let lon1 = userLocation.longitude;
  
  const calculateDistance = (lat1: number , lon1: number, lat2: number, lon2: number) => {
    const R = 6371e3; // meters (Earth's radius)
    const dLat = radians(lat2 - lat1);
    const dLon = radians(lon2 - lon1);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(radians(lat1)) * Math.cos(radians(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    return distance;
  }

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
        setAedLocations([nearestAed]); // Set only the nearest AED location
      } else {
        setErrorMessage('No AED locations found');
      }
    } catch (error) {
      console.error('Error fetching AED locations:', error);
      setErrorMessage('Error fetching AED locations. Please try again.');
    }
  };

  // Get user location on component mount
  useEffect(() => {
    getUserLocation();
  }, []);

  // Display error message if any
  if (errorMessage) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.text}>{errorMessage}</Text>
      </SafeAreaView>
);
}

// Display map with user location and nearest AED location
return (
  <SafeAreaView style={styles.container}>
    <Button title="Find AED Location" onPress={fetchAedLocations} />
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
        
        {aedLocations.length > 0 && ( // Check if there's a nearest AED location
          <Marker
            coordinate={{ latitude: aedLocations[0].latitude, longitude: aedLocations[0].longitude }}
            title={aedLocations[0].name || 'Nearest AED'}
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

