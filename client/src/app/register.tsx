import { Button, KeyboardAvoidingView, StyleSheet, Text, TextInput, View } from 'react-native'
import React, { useState } from 'react'

export default function register() {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');

  return (
    <View style={styles.container}>

      <KeyboardAvoidingView behavior='padding'>
        <TextInput style={styles.input} value={email} placeholder='example@email.com' onChangeText={(text) => setEmail(text)}></TextInput>
        <TextInput style={styles.input} value={password} placeholder='Password' secureTextEntry={true} onChangeText={(text) => setPassword(text)}></TextInput>

        <Button title='Register account'></Button>
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