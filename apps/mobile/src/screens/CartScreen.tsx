import React from 'react';
import { View, Text, FlatList, Button, StyleSheet, Alert } from 'react-native';
import { useSessionStore } from '../store/session.store';
import { LoadingOverlay } from '../components/LoadingOverlay';

export const CartScreen = ({ navigation }: any) => {
    const { cartItems, valTotal, finishShopping, isLoading } = useSessionStore();

    const handleFinish = async () => {
        try {
            const saleId = await finishShopping();
            navigation.replace('Success', { saleId });
        } catch (e) {
            // Store handles error
        }
    };

    return (
        <View style={styles.container}>
            <LoadingOverlay visible={isLoading} text="Processing Checkout..." />
            <Text style={styles.header}>Your Cart</Text>
            <FlatList
                data={cartItems}
                keyExtractor={(item, index) => item.productCode + index}
                renderItem={({ item }) => (
                    <View style={styles.item}>
                        <Text style={styles.itemName}>{item.description || item.productCode}</Text>
                        <Text>Qty: {item.quantity}</Text>
                        <Text style={styles.price}>{item.total ? item.total.toFixed(2) : '0.00'}</Text>
                    </View>
                )}
            />
            <View style={styles.footer}>
                <Text style={styles.total}>Total: {valTotal.toFixed(2)}</Text>
                <Button title="Finish Shopping" onPress={handleFinish} disabled={isLoading} />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20 },
    header: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
    item: { flexDirection: 'row', justifyContent: 'space-between', padding: 15, borderBottomWidth: 1, borderBottomColor: '#eee' },
    itemName: { flex: 2, fontWeight: '500' },
    price: { flex: 1, textAlign: 'right', fontWeight: 'bold' },
    footer: { marginTop: 20, borderTopWidth: 2, borderTopColor: '#ddd', paddingTop: 20 },
    total: { fontSize: 20, fontWeight: 'bold', marginBottom: 15, textAlign: 'right' },
});
