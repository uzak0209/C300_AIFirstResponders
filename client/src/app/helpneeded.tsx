import React, { useState, useEffect } from 'react';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, FlatList, TouchableOpacity } from 'react-native';
import { collection, getDocs, query } from 'firebase/firestore'; // Import Firestore

// Assuming you have Firebase configured and imported (replace with your configuration)
import { SOS_DB } from '../../firebaseConfig';

interface SOSRequest {
  id: string;
  name?: string
  details?: string;
  latitude: number; // Corrected type to number (assuming latitude is a numerical value)
  longitude: number; // Corrected type to number (assuming longitude is a numerical value)
  timestamp: Date;
  // Add any other fields from your database if needed (e.g., name, location)
}

const HelpNeeded: React.FC = () => {
  const navigation = useNavigation<NavigationProp<any>>();
  const [sosRequests, setSosRequests] = useState<SOSRequest[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Fetch SOS requests from Firestore on component mount
  useEffect(() => {
    const fetchSosRequests = async () => {
      try {
        const sosCollectionRef = collection(SOS_DB, 'sosRequests');
        const sosQuery = query(sosCollectionRef); // Optional: Specify query criteria
        const querySnapshot = await getDocs(sosQuery);
        const fetchedRequests = querySnapshot.docs.map((doc) => ({
          ...doc.data(),
          id: doc.id, // Add ID for tracking
        })) as SOSRequest[]; // Cast to SOSRequest[] for type safety

        setSosRequests(fetchedRequests);
      } catch (error) {
        console.error('Error fetching SOS requests:', error);
        setErrorMessage('Error loading help requests');
      }
    };

    fetchSosRequests();
  }, []);

  const handleSosRequestPress = (request: SOSRequest) => {
    // Navigate to sosstatus.tsx with request data (adjust navigation logic as needed)
    navigation.navigate('sosstatus', { request }); // Assuming you have navigation
  };

  // Display error message if any
  if (errorMessage) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.text}>{errorMessage}</Text>
      </SafeAreaView>
    );
  }

  // Display SOS requests with line breaks and tap handling
  return (
    <SafeAreaView style={styles.saveAreaContainer}>
      <StatusBar style="auto" />
      <FlatList
        data={sosRequests}
        keyExtractor={(item) => item.id || ''} // Use ID for unique key
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => handleSosRequestPress(item)}>
            <Text style={styles.text}>
              {item.name ? `${item.name}: ` : ''}
              {item.details ? `${item.details} - \n` : ''}
              {item.latitude}, {item.longitude + `\n`}(Tap for details)
            </Text>
          </TouchableOpacity>
        )}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  saveAreaContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 22,
    marginBottom: 10,
  },
  separator: {
    height: 4,
    backgroundColor: '#ddd',
  },
});

export default HelpNeeded;
