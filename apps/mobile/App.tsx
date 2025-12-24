import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppNavigator } from './src/navigation/AppNavigator';

import Toast from 'react-native-toast-message';

export default function App() {
    return (
        <SafeAreaProvider>
            <NavigationContainer>
                <AppNavigator />
            </NavigationContainer>
            <Toast />
        </SafeAreaProvider>
    );
}
