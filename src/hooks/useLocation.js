import { useState, useEffect } from 'react';
import * as Location from 'expo-location';

export function useLocation() {
  const [loc, setLoc]     = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let subscription;
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setError('Izin lokasi ditolak. Aktifkan di Settings > Lokasi');
        return;
      }
      const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      setLoc(pos.coords);
      subscription = await Location.watchPositionAsync(
        { accuracy: Location.Accuracy.Balanced, distanceInterval: 10 },
        (newPos) => setLoc(newPos.coords)
      );
    })();
    return () => subscription?.remove();
  }, []);

  return { loc, error };
}
