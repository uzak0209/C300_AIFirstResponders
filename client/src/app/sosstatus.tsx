import React, { useState } from 'react';
import { useRoute, useNavigation, NavigationProp } from '@react-navigation/native';
import MapView, { Marker } from 'react-native-maps';
import { Alert, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Audio } from 'expo-av';
import { collection, doc, deleteDoc } from 'firebase/firestore';
import { SOS_DB } from '../../firebaseConfig';

const SOSStatus: React.FC = () => {
  const route = useRoute();
  const navigation = useNavigation<NavigationProp<any>>();
  const sosRequest = route.params?.request;
  const [isDeleting, setIsDeleting] = useState(false);
  const [sound, setSound] = useState<Audio.Sound | null>(null);

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
      navigation.goBack();
      navigation.goBack();
    } catch (error) {
      console.error('Error deleting SOS request:', error);
      Alert.alert('Error', 'Failed to delete SOS request. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  const playAudio = async () => {
    if (!sosRequest.audioUrl) return;
    const { sound } = await Audio.Sound.createAsync({ uri: sosRequest.audioUrl });
    setSound(sound);
    await sound.playAsync();
  };

  React.useEffect(() => {
    return sound
      ? () => {
          sound.unloadAsync();
        }
      : undefined;
  }, [sound]);

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
      <Text style={styles.text}>Timestamp: {new Date(sosRequest.timestamp).toLocaleString()}</Text>
      {sosRequest.audioUrl && (
        <TouchableOpacity style={styles.button} onPress={playAudio}>
          <Text style={styles.buttonText}>Play Audio</Text>
        </TouchableOpacity>
      )}
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