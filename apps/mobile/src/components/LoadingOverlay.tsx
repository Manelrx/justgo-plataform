import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet, Modal } from 'react-native';

interface Props {
    visible: boolean;
    text?: string;
}

export const LoadingOverlay = ({ visible, text = 'Processing...' }: Props) => {
    if (!visible) return null;

    return (
        <Modal transparent animationType="fade" visible={visible}>
            <View style={styles.container}>
                <View style={styles.card}>
                    <ActivityIndicator size="large" color="#000" />
                    <Text style={styles.text}>{text}</Text>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    card: {
        backgroundColor: 'white',
        padding: 24,
        borderRadius: 12,
        alignItems: 'center',
        elevation: 4,
    },
    text: {
        marginTop: 16,
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
    },
});
