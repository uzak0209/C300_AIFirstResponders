import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View } from "react-native";

export default function Index() {
    return (
        <SafeAreaView style={styles.saveAreaContainer}>
            <StatusBar style="auto" />
            <View style={styles.container}>
                <Text style={styles.text}>Home screen</Text>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    saveAreaContainer: {
        flex: 1,
        justifyContent: "center",
    },
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    text: {
        fontSize: 32,
    }
})
