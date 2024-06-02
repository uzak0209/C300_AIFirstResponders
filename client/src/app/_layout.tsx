import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useColorScheme } from "@/hooks/useColorScheme";

export default function App() {
  return (
    <SafeAreaProvider>
      <RootNavigation />

      <StatusBar style="auto" />
    </SafeAreaProvider>
  );
}

const RootNavigation = () => {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="index" options={{
          headerShown: false
        }} />
        <Stack.Screen name="(public)" options={{
          headerShown: false,
          presentation: "modal"
        }} />
        <Stack.Screen name="(auth)" options={{
          headerShown: false
        }} />
      </Stack>
    </ThemeProvider>
  );
}