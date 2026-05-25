import { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';

import * as Location from 'expo-location';
import { WebView } from 'react-native-webview';

export default function MapScreen() {
  const [mapUrl, setMapUrl] = useState(null);

  const getLocation = async () => {
    try {
      const { status } =
        await Location.requestForegroundPermissionsAsync();

      if (status !== 'granted') {
        Alert.alert('Izin ditolak');
        return;
      }

      const loc =
        await Location.getCurrentPositionAsync({});

      const lat = loc.coords.latitude;
      const lng = loc.coords.longitude;

      const url = `
        https://www.openstreetmap.org/export/embed.html?bbox=
        ${lng - 0.01},
        ${lat - 0.01},
        ${lng + 0.01},
        ${lat + 0.01}
        &layer=mapnik&marker=${lat},${lng}
      `;

      setMapUrl(url);

    } catch (e) {
      console.log(e);
      Alert.alert('Error', e.message);
    }
  };

  useEffect(() => {
    getLocation();
  }, []);

  if (!mapUrl) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#1DA1F2" />
        <Text style={{ marginTop: 10 }}>
          Mengambil lokasi...
        </Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <WebView
        source={{ uri: mapUrl }}
        style={{ flex: 1 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});