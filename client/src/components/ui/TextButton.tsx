import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React from 'react'
import { defaultStyles } from '@/styles/Styles'
import { fontSize } from '@/constants/Enums'

export default function TextButton({...props}) {
    return (
        <TouchableOpacity style={styles.container} {...props}>
            <Text style={[defaultStyles.text, defaultStyles.centerText, styles.text]} {...props}></Text>
        </TouchableOpacity>
    )
}

const styles = StyleSheet.create({
    container: {
        width: "80%",
        height: 50,
        backgroundColor: "#0FFF",
        borderRadius: 8,
        padding: 10,
        marginBottom: 10
    },
    text: {
        fontSize: fontSize.lg
    }
})