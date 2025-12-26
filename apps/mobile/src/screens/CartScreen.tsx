import React from 'react';
import { View, Text, FlatList, Button, StyleSheet, Alert } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import Toast from 'react-native-toast-message';
import { useSessionStore } from '../store/session.store';
import { LoadingOverlay } from '../components/LoadingOverlay';
import { SalesService } from '../services/api';

export const CartScreen = ({ navigation }: any) => {
    const { cartItems, valTotal, clearCart, isLoading } = useSessionStore();

    const handleFinish = async () => {
        if (cartItems.length === 0) return;

        // 1. Online Check (Honest Market Pivot)
        const netState = await NetInfo.fetch();
        if (!netState.isConnected) {
            Alert.alert(
                "Conexão Necessária",
                "Para garantir a segurança do Honest Market, conecte-se ao Wi-Fi ou 4G para finalizar."
            );
            return;
        }

        try {
            // 2. Direct Checkout (Scan & Go)
            const result = await SalesService.checkout(cartItems.map(item => ({
                productCode: item.productCode,
                quantity: item.quantity
            })));

            Toast.show({ type: 'success', text1: 'Pedido Criado', text2: 'Aguardando Pagamento' });
            clearCart();

            // Navigate to Payment Screen with PIX data
            navigation.replace('PaymentPending', {
                saleId: result.saleId,
                pixCode: result.pixCode,
                total: result.total
            });

        } catch (error: any) {
            console.log('Checkout failed', error);
            const msg = error.response?.data?.message || 'Erro ao processar checkout.';
            Alert.alert('Erro', msg);
        }
    };

    return (
        <View style={styles.container}>
            <LoadingOverlay visible={isLoading} text="Validando Estoque..." />
            <Text style={styles.header}>Seu Carrinho</Text>
            <FlatList
                data={cartItems}
                keyExtractor={(item, index) => item.productCode + index}
                renderItem={({ item }) => (
                    <View style={styles.item}>
                        <Text style={styles.itemName}>{item.description || item.productCode}</Text>
                        <Text>Qtd: {item.quantity}</Text>
                        <Text style={styles.price}>{item.total ? item.total.toFixed(2) : '0.00'}</Text>
                    </View>
                )}
            />
            <View style={styles.footer}>
                <Text style={styles.total}>Total: R$ {valTotal.toFixed(2)}</Text>
                <Button title="Finalizar e Pagar" onPress={handleFinish} disabled={isLoading || cartItems.length === 0} />
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
