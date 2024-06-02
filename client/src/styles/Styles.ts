import { Colors } from "@/constants/Colors";
import { fontSize } from "@/constants/Enums";
import { StyleSheet } from "react-native";

export const defaultStyles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: Colors.light.background
    },
    title: {
        color: Colors.light.text,
        fontSize: fontSize.lg,
        fontWeight: "700"
    },
    text: {
        color: Colors.light.text,
        fontSize: fontSize.base
    },
    centerText: {
        alignSelf: "center"
    }
})

export const screenPadding = {
    horizontal: 24,
}