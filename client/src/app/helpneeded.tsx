import React, { useState, useEffect } from 'react';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, FlatList, TouchableOpacity } from 'react-native';
import { collection, getDocs, query } from 'firebase/firestore';
import { SOS_DB } from '../../firebaseConfig';

interface SOSRequest {
  id: string;
  name?: string;
  details?: string;
  latitude: number;
  longitude: number;
  timestamp: Date;
  audioUrl?: string; // Add audio URL if available
}

const HelpNeeded: React.FC = () => {
  const navigation = useNavigation<NavigationProp<any>>();
  const [sosRequests, setSosRequests] = useState<SOSRequest[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchSosRequests = async () => {
      try {
        const sosCollectionRef = collection(SOS_DB, 'sosRequests');
        const sosQuery = query(sosCollectionRef);
        const querySnapshot = await getDocs(sosQuery);
        const fetchedRequests = querySnapshot.docs.map((doc) => ({
          ...doc.data(),
          id: doc.id,
          timestamp: new Date(doc.data().timestamp.seconds * 1000),
        })) as SOSRequest[];

        setSosRequests(fetchedRequests);
      } catch (error) {
        console.error('Error fetching SOS requests:', error);
        setErrorMessage('Error loading help requests');
      }
    };

    fetchSosRequests();
  }, []);

  const handleSosRequestPress = (request: SOSRequest) => {
    navigation.navigate('sosstatus', {
      request: {
        ...request,
        timestamp: request.timestamp.toISOString(), // Serialize timestamp
      },
    });
  };

  if (errorMessage) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.text}>{errorMessage}</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.saveAreaContainer}>
      <StatusBar style="auto" />
      <FlatList
        data={sosRequests}
        keyExtractor={(item) => item.id || ''}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => handleSosRequestPress(item)}>
            <Text style={styles.text}>
              {item.name ? `${item.name}: \n` : ''}
              {item.details ? `${item.details} - \n` : ''}
              {new Date(item.timestamp).toLocaleString() + `\n`}(Tap for details)
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
