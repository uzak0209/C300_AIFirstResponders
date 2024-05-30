import { Button, StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { router } from 'expo-router'

export default function index() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Login</Text>
      <Button title='Create an account' onPress={() => router.push('/register')}></Button>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  text: {
    fontSize: 32
  }
})