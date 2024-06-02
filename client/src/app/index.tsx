import { Button, KeyboardAvoidingView, StyleSheet, Text, TextInput, View } from 'react-native'
import { Redirect, router } from 'expo-router'
import { defaultStyles } from '@/styles/Styles'
import TextButton from '@/components/ui/TextButton'

export default function index() {
  return (
    <View style={defaultStyles.container}>
      <Text style={[defaultStyles.title, styles.title]}>AIFirstResponders</Text>
      <TextButton onPress={() => router.push("/(public)/login")}>Login</TextButton>
      <TextButton onPress={() => router.push("/(public)/register")}>Sign up</TextButton>
    </View>
  )
}

const styles = StyleSheet.create({
  title: {
    marginBottom: 30
  }
})