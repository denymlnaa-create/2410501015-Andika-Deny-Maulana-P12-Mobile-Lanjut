import * as Notifications from 'expo-notifications';
import { useEffect, useState } from 'react';
import { Linking, Platform, StatusBar, TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import {
  registerForPushNotificationsAsync
} from './src/utils/notifications';

import HomeScreen         from './src/screens/HomeScreen';
import CameraScreen       from './src/screens/CameraScreen';
import MapScreen          from './src/screens/MapScreen';
import ProfileScreen      from './src/screens/ProfileScreen';
import SensorScreen       from './src/screens/SensorScreen';
import NotificationScreen from './src/screens/NotificationScreen';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

const Tab = createBottomTabNavigator();
const X_BLUE = '#1DA1F2';
const X_GRAY = '#657786';

export default function App() {
  const [showNotif, setShowNotif] = useState(false);
  const [unread, setUnread] = useState(2);

  useEffect(() => {
    registerForPushNotificationsAsync();
    Linking.getInitialURL().then(url => { if (url) console.log('Deep link:', url); });
    const sub = Linking.addEventListener('url', ({ url }) => console.log('Link:', url));

    const notifSub = Notifications.addNotificationReceivedListener(() => {
      setUnread(n => n + 1);
    });

    return () => {
      sub.remove();
      notifSub.remove();
    };
  }, []);

  if (showNotif) {
    return (
      <SafeAreaProvider>
        <View style={{ flex: 1, backgroundColor: '#fff' }}>
          <View style={styles.notifHeader}>
            <TouchableOpacity onPress={() => setShowNotif(false)} style={styles.backBtn}>
              <Ionicons name='arrow-back' size={24} color='#000' />
            </TouchableOpacity>
            <Text style={styles.notifHeaderTitle}>Notifikasi</Text>
          </View>
          <NotificationScreen />
        </View>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <StatusBar backgroundColor='#fff' barStyle='dark-content' />
      <NavigationContainer>
        <Tab.Navigator
          screenOptions={({ route }) => ({
            tabBarIcon: ({ focused, color, size }) => {
              const icons = {
                Home:    focused ? 'home'             : 'home-outline',
                Kamera:  focused ? 'camera'           : 'camera-outline',
                Map:     focused ? 'location'         : 'location-outline',
                Profil:  focused ? 'person'           : 'person-outline',
                Sensor:  focused ? 'hardware-chip'    : 'hardware-chip-outline',
              };
              return <Ionicons name={icons[route.name] || 'ellipse'} size={size} color={color} />;
            },
            tabBarActiveTintColor:   X_BLUE,
            tabBarInactiveTintColor: X_GRAY,
            tabBarStyle: {
              backgroundColor: '#fff',
              borderTopColor: '#E1E8ED',
              borderTopWidth: 1,
              height: Platform.OS === 'android' ? 60 : 80,
              paddingBottom: Platform.OS === 'android' ? 8 : 20,
            },
            tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
            headerStyle: { backgroundColor: '#fff', elevation: 1, shadowOpacity: 0.1 },
            headerTintColor: '#000',
            headerTitleStyle: { fontWeight: 'bold', fontSize: 18 },
            headerRight: () => (
              <TouchableOpacity
                style={styles.notifBtn}
                onPress={() => { setShowNotif(true); setUnread(0); }}
              >
                <Ionicons name='notifications-outline' size={26} color='#000' />
                {unread > 0 && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{unread}</Text>
                  </View>
                )}
              </TouchableOpacity>
            ),
          })}
        >
          <Tab.Screen name='Home'   component={HomeScreen}   options={{ headerTitle: '𝕏 SocialApp' }} />
          <Tab.Screen name='Kamera' component={CameraScreen} options={{ headerTitle: 'Kamera' }} />
          <Tab.Screen name='Map'    component={MapScreen}    options={{ headerTitle: 'Nearby Users' }} />
          <Tab.Screen name='Profil' component={ProfileScreen} options={{ headerTitle: 'Profil' }} />
          <Tab.Screen name='Sensor' component={SensorScreen} options={{ headerTitle: 'Sensor' }} />
        </Tab.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  notifBtn:        { marginRight: 16, position: 'relative' },
  badge:           { position: 'absolute', top: -4, right: -6, backgroundColor: '#E0245E', borderRadius: 8, minWidth: 16, height: 16, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 3 },
  badgeText:       { color: '#fff', fontSize: 10, fontWeight: 'bold' },
  notifHeader:     { flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#E1E8ED', paddingTop: Platform.OS === 'android' ? 40 : 56 },
  backBtn:         { marginRight: 16 },
  notifHeaderTitle:{ fontWeight: 'bold', fontSize: 18, color: '#000' },
});