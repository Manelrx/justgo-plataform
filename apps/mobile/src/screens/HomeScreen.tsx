import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { useSessionStore } from '../store/session.store';
import { LoadingOverlay } from '../components/LoadingOverlay';

export const HomeScreen = ({ navigation }: any) => {
    const { startSession, isLoading, error } = useSessionStore();

    const handleStart = async () => {
        try {
            await startSession();
            navigation.navigate('Scanner');
        } catch (e) {
            // Store handles error state
        }
    };

    return (
        <View style={styles.container}>
            <LoadingOverlay visible={isLoading} text="Starting session..." />
            <Text style={styles.currUser}>Welcome</Text>
            <View style={styles.center}>
                <Button title="Start Shopping" onPress={handleStart} />
                {error && <Text style={styles.error}>{error}</Text>}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20 },
    currUser: { fontSize: 18, marginBottom: 20 },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    error: { color: 'red', marginTop: 20 },
});
