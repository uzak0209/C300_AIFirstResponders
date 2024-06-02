import { StyleSheet, Text, View, useColorScheme } from 'react-native'
import React from 'react'
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Redirect, Stack } from 'expo-router';

export default function PublicNavigation() {
    return (
        <Stack>
            <Stack.Screen name='login' options={{
                title: "Login"
            }} />            
            <Stack.Screen name='register' options={{
                title: "Create an account"
            }} />
        </Stack>
    );
}

const styles = StyleSheet.create({

})