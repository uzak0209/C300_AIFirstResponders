import { StyleSheet, Text, View } from "react-native";

export default function Index() {
    return (
        <View style={style.container}>
            <Text style={style.text}>Home screen</Text>
        </View>
    );
}

const style = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    text: {
        fontSize: 32,
    }
})
