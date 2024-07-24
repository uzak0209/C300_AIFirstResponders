import React, { useState, useEffect } from 'react';
import { useRoute, useNavigation, NavigationProp } from '@react-navigation/native';
import MapView, { Marker } from 'react-native-maps';
import { Alert, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { collection, doc, deleteDoc } from 'firebase/firestore'; // Import Firestore

// Assuming you have Firebase configured and imported (replace with your configuration)
import { SOS_DB } from '../../firebaseConfig';

const SOSStatus: React.FC = () => {
  const route = useRoute();
  const navigation = useNavigation<NavigationProp<any>>();
  const sosRequest = route.params?.request; // Access request data - it works 
  const [isDeleting, setIsDeleting] = useState(false); // Track deletion state

  const handleResolveRequest = async () => {
    Alert.alert(
      'Is the Situation Resolved?',
      '',
      [
        { text: 'Yes', onPress: () => deleteRequest() },
        { text: 'No', onPress: () => console.log('Cancel deletion') },
      ],
      { cancelable: false }
    );
  };

  const deleteRequest = async () => {
    setIsDeleting(true); 

    try {
      const sosRef = doc(collection(SOS_DB, 'sosRequests'), sosRequest.id);
      await deleteDoc(sosRef);
      navigation.navigate('main');
    } catch (error) {
      console.error('Error deleting SOS request:', error);
      Alert.alert('Error', 'Failed to delete SOS request. Please try again.');
    } finally {
      setIsDeleting(false); 
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {sosRequest && ( 
        <MapView
          style={styles.map}
          region={{
            latitude: sosRequest.latitude,
            longitude: sosRequest.longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          }}
          showsUserLocation={true}
        >
          <Marker
            coordinate={{ latitude: sosRequest.latitude, longitude: sosRequest.longitude }}
            title="SOS Location"
          />
        </MapView>
      )}
      <Text style={styles.text}>Name: {sosRequest?.name || 'Unknown Location'}</Text>
      <Text style={styles.text}>Details: {sosRequest?.details || 'No details provided'}</Text>
      <TouchableOpacity style={styles.button} onPress={handleResolveRequest} disabled={isDeleting}>
        <Text style={styles.buttonText}>
          {isDeleting ? 'Deleting...' : 'Reached SOS Request Location'}
        </Text>
      </TouchableOpacity>
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
    fontSize: 18,
    marginBottom: 10,
  },
  button: {
    padding: 15,
    backgroundColor: '#4CAF50',
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
});

export default SOSStatus;
