import React, { useState } from 'react';
import { View, TextInput, Button, StyleSheet, Text } from 'react-native';
import { useSessionStore } from '../store/session.store';
import { LoadingOverlay } from '../components/LoadingOverlay';

export const LoginScreen = ({ navigation }: any) => {
    const [userId, setUserId] = useState('');
    const { login, isLoading, error } = useSessionStore();

    const handleLogin = async () => {
        if (!userId) return;
        try {
            await login(userId);
            navigation.replace('Home');
        } catch (e) {
            // Error managed by store
        }
    };

    return (
        <View style={styles.container}>
            <LoadingOverlay visible={isLoading} text="Logging in..." />
            <Text style={styles.title}>Just Go Market</Text>
            <View style={styles.card}>
                <Text style={styles.label}>User ID</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Enter ID (e.g. 123)"
                    value={userId}
                    onChangeText={setUserId}
                    autoCapitalize="none"
                />
                {error && <Text style={styles.error}>{error}</Text>}
                <Button title="Login" onPress={handleLogin} />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', padding: 20, backgroundColor: '#f5f5f5' },
    title: { fontSize: 32, fontWeight: 'bold', textAlign: 'center', marginBottom: 40 },
    card: { backgroundColor: 'white', padding: 20, borderRadius: 10, elevation: 2 },
    label: { marginBottom: 5, fontWeight: '600' },
    input: { borderWidth: 1, borderColor: '#ddd', padding: 10, borderRadius: 5, marginBottom: 20 },
    error: { color: 'red', marginBottom: 10, textAlign: 'center' },
});
