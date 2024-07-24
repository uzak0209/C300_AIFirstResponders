import { View, Text, StyleSheet, ActivityIndicator, Button, KeyboardAvoidingView, TextInput } from 'react-native'
import React, { useState } from 'react'
import { FIREBASE_AUTH } from '../../../firebaseConfig';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { useNavigation, NavigationProp } from '@react-navigation/native';

export default function Login() {
    const [mobile, setMobile] = useState<number | null>(null);
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);
    const auth = FIREBASE_AUTH;
    const navigation = useNavigation<NavigationProp<any>>();


    const signIn = async () => {
        setLoading(true);
        try {
            const response = await signInWithEmailAndPassword(auth, email, password);
            console.log(response);
            alert("Sign in success");
            navigation.navigate('main');
        } catch (error: any) {
            console.log(error);
            alert("Sign in failed: " + error.message);
        } finally {
            setLoading(false);
        }
    }

    const signUp = async () => {
        setLoading(true);
        try {
            const response = await createUserWithEmailAndPassword(auth, email, password);
            console.log(response);
            alert("Registration success");
        } catch (error: any) {
            console.log(error);
            alert("Registration failed: " + error.message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <View style={styles.container}>
            <KeyboardAvoidingView behavior='padding'>
                {/* <TextInput style={styles.input} value={mobile} placeholder='Mobile Number' keyboardType='phone-pad' onChangeText={(text) => setMobile(text)}></TextInput> */}
                <TextInput style={styles.input} value={email} placeholder='Email' onChangeText={(text) => setEmail(text)}></TextInput>
                <TextInput style={styles.input} value={password} placeholder='Password' secureTextEntry={true} onChangeText={(text) => setPassword(text)}></TextInput>

                {loading ? (<ActivityIndicator size='large' color="#0000FF" />
                ) : (
                    <>
                        <Button title="Sign in" onPress={() => signIn()}></Button>
                        <Button title="Create an account" onPress={() => signUp()}></Button>
                    </>
                )}
            </KeyboardAvoidingView>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        marginHorizontal: 20,
        flex: 1,
        justifyContent: "center"
    },
    input: {
        marginVertical: 4,
        height: 50,
        borderWidth: 1,
        borderRadius: 4,
        padding: 10,
        backgroundColor: "#FFF"
    }
});