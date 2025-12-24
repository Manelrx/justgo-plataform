import React from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';
import LottieView from 'lottie-react-native';

export const SuccessScreen = ({ navigation, route }: any) => {
    const saleId = route.params?.saleId || 'UNKNOWN';

    return (
        <View style={styles.container}>
            <View style={styles.animationContainer}>
                {/* Lottie requires a source file. We use a remote placeholder or require() local. 
                    Since we don't have assets yet, we'll try a remote URI or just comment it out with a TODO 
                    if the user hasn't provided assets. The user asked for "placeholder JSON assets".
                    We will simulate it with a View box if asset missing, but code it for Lottie. */}
                {/* <LottieView
                    source={require('../assets/success.json')}
                    autoPlay
                    loop={false}
                    style={{ width: 200, height: 200 }}
                /> */}
                <Text style={styles.emoji}>✅</Text>
            </View>
            <Text style={styles.title}>Purchase Successful!</Text>
            <Text style={styles.subtitle}>Sale ID: {saleId}</Text>

            <View style={styles.footer}>
                <Button title="Start New Shop" onPress={() => navigation.popToTop()} />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, padding: 30, justifyContent: 'center', alignItems: 'center', backgroundColor: 'white' },
    animationContainer: { marginBottom: 30, alignItems: 'center' },
    emoji: { fontSize: 80 },
    title: { fontSize: 24, fontWeight: 'bold', marginBottom: 10, color: '#333' },
    subtitle: { fontSize: 16, color: '#666', marginBottom: 40 },
    footer: { width: '100%' },
});
