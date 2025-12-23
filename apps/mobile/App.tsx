import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { COLORS } from '@pdv-jgm/design-system';

export default function App() {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Autonomous Market</Text>
            <Text style={styles.subtitle}>Scan & Go</Text>

            <TouchableOpacity style={styles.button}>
                <Text style={styles.buttonText}>Iniciar Compra</Text>
            </TouchableOpacity>

            <StatusBar style="auto" />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.brand.background,
        alignItems: 'center',
        justifyContent: 'center',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: COLORS.text.onBackground, // Primary text color
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: COLORS.text.onBackground,
        marginBottom: 32,
        opacity: 0.8,
    },
    button: {
        backgroundColor: COLORS.brand.primary, // Action/Highlight color ONLY
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
    },
    buttonText: {
        color: COLORS.text.onPrimary, // Text on primary background
        fontWeight: '600',
        fontSize: 16,
    },
});
