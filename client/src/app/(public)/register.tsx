import { Button, KeyboardAvoidingView, StyleSheet, Text, TextInput, View } from 'react-native'
import React, { useState } from 'react'
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { FIREBASE_AUTH } from '../../../firebaseConfig';
import { router } from 'expo-router';

export default function register() {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const auth = FIREBASE_AUTH;

  const signUp = async () => {
    setLoading(true);
    try {
      const response = await createUserWithEmailAndPassword(auth, email, password);
      alert("Registration success");
      router.back()
    } catch (error: any) {
      alert("Registration failed: " + error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>

      <KeyboardAvoidingView behavior='padding'>
        <TextInput style={styles.input} value={email} placeholder='example@email.com' onChangeText={(text) => setEmail(text)}></TextInput>
        <TextInput style={styles.input} value={password} placeholder='Password' secureTextEntry={true} onChangeText={(text) => setPassword(text)}></TextInput>

        <Button title='Register account' onPress={signUp}></Button>
      </KeyboardAvoidingView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    marginHorizontal: 20,
  },
  input: {
    marginVertical: 4,
    height: 50,
    borderWidth: 1,
    borderRadius: 4,
    padding: 10,
    backgroundColor: "#FFFFFF"
  }
})