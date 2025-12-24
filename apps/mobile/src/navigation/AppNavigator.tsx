import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { LoginScreen } from '../screens/LoginScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { ScannerScreen } from '../screens/ScannerScreen';
import { CartScreen } from '../screens/CartScreen';
import { SuccessScreen } from '../screens/SuccessScreen';

const Stack = createNativeStackNavigator();

export const AppNavigator = () => {
    return (
        <Stack.Navigator initialRouteName="Login">
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen name="Scanner" component={ScannerScreen} />
            <Stack.Screen name="Cart" component={CartScreen} />
            <Stack.Screen name="Success" component={SuccessScreen} options={{ headerShown: false, gestureEnabled: false }} />
        </Stack.Navigator>
    );
};
