import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Button, ActivityIndicator, Alert } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import Toast from 'react-native-toast-message';
import api from '../services/api';

export const PaymentPendingScreen = ({ route, navigation }: any) => {
    const { saleId, pixCode, total } = route.params;
    const [status, setStatus] = useState('PENDING_PAYMENT');

    useEffect(() => {
        const interval = setInterval(async () => {
            try {
                const response = await api.get(`/sales/${saleId}`);
                if (response.data.status === 'PAID') {
                    setStatus('PAID');
                    clearInterval(interval);
                    Toast.show({ type: 'success', text1: 'Pagamento Confirmado!' });
                    navigation.replace('Success', { saleId });
                }
            } catch (error) {
                console.log('Polling Error', error);
            }
        }, 3000);

        return () => clearInterval(interval);
    }, [saleId]);

    const copyToClipboard = async () => {
        await Clipboard.setStringAsync(pixCode);
        Toast.show({ type: 'success', text1: 'Código PIX Copiado' });
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Pagamento via PIX</Text>
            <Text style={styles.amount}>Total: R$ {Number(total).toFixed(2)}</Text>

            <View style={styles.pixContainer}>
                <Text style={styles.label}>Copia e Cola:</Text>
                <Text style={styles.code} numberOfLines={3}>{pixCode}</Text>
                <Button title="Copiar Código PIX" onPress={copyToClipboard} />
            </View>

            <View style={styles.statusContainer}>
                <ActivityIndicator size="large" color="#0000ff" />
                <Text style={styles.statusText}>Aguardando confirmação do banco...</Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, justifyContent: 'center', alignItems: 'center' },
    title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
    amount: { fontSize: 32, fontWeight: 'bold', color: '#2ecc71', marginBottom: 40 },
    pixContainer: { width: '100%', padding: 20, backgroundColor: '#f1f1f1', borderRadius: 10, marginBottom: 40 },
    label: { fontWeight: 'bold', marginBottom: 5 },
    code: { marginBottom: 15, fontSize: 12, color: '#555' },
    statusContainer: { alignItems: 'center' },
    statusText: { marginTop: 10, fontSize: 16, color: '#666' }
});
