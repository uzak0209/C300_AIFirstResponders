import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";


export default function TabLayout() {
    return (
        <Tabs screenOptions={{ tabBarActiveTintColor: 'blue' }}>
            <Tabs.Screen
                name="index"
                options={{
                    headerShown: false,
                    tabBarIcon: ({ color }) => <Ionicons size={28} name="home-outline" color={color} />,
                }}
            />
            <Tabs.Screen
                name="camera"
                options={{
                    headerShown: false,
                    tabBarStyle: { display: 'none' },
                    tabBarIcon: ({ color }) => <Ionicons size={28} name="camera-outline" color={color} />,
                }}
            />
        </Tabs>
    )
}