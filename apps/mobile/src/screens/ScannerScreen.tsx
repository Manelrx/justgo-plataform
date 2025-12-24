import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';
import { CameraView, Camera } from 'expo-camera';
import { useSessionStore } from '../store/session.store';
import Animated, { useSharedValue, useAnimatedStyle, withSequence, withTiming } from 'react-native-reanimated';

export const ScannerScreen = ({ navigation }: any) => {
    const [hasPermission, setHasPermission] = useState<boolean | null>(null);
    const [scanned, setScanned] = useState(false);
    const { addItem, cartItems, valTotal } = useSessionStore();

    // Flash animation value
    const flashOpacity = useSharedValue(0);

    const flashStyle = useAnimatedStyle(() => ({
        opacity: flashOpacity.value,
    }));

    useEffect(() => {
        const getBarCodeScannerPermissions = async () => {
            const { status } = await Camera.requestCameraPermissionsAsync();
            setHasPermission(status === 'granted');
        };

        getBarCodeScannerPermissions();
    }, []);

    const handleBarCodeScanned = async ({ type, data }: any) => {
        if (scanned) return;
        setScanned(true);

        // Trigger visual feedback
        flashOpacity.value = withSequence(withTiming(0.8, { duration: 100 }), withTiming(0, { duration: 100 }));

        // Assuming backend seeds include this product code or similar.
        // For testing, we might want to alert what was scanned first
        console.log(`Bar code with type ${type} and data ${data} has been scanned!`);

        await addItem(data);

        // Allow re-scan after delay
        setTimeout(() => setScanned(false), 1500);
    };

    if (hasPermission === null) {
        return <Text>Requesting for camera permission</Text>;
    }
    if (hasPermission === false) {
        return <Text>No access to camera</Text>;
    }

    return (
        <View style={styles.container}>
            <View style={styles.cameraContainer}>
                <CameraView
                    onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
                    barcodeScannerSettings={{
                        barcodeTypes: ["qr", "ean13"],
                    }}
                    style={StyleSheet.absoluteFillObject}
                />
                {/* Visual Flash Overlay */}
                <Animated.View style={[StyleSheet.absoluteFillObject, { backgroundColor: 'white' }, flashStyle]} pointerEvents="none" />
            </View>
            <View style={styles.overlay}>
                <Text style={styles.info}>Total: {valTotal.toFixed(2)}</Text>
                <Text style={styles.info}>Items: {cartItems.length}</Text>
                <Button title="View Cart" onPress={() => navigation.navigate('Cart')} />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, flexDirection: 'column', justifyContent: 'center' },
    cameraContainer: { flex: 1 },
    overlay: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(0,0,0,0.8)', padding: 20 },
    info: { color: 'white', fontSize: 18, marginBottom: 10, fontWeight: 'bold' },
});
