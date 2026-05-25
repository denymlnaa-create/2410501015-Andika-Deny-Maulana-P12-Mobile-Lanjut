import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Vibration } from 'react-native';
import { Accelerometer, Gyroscope } from 'expo-sensors';
import { Ionicons } from '@expo/vector-icons';

export default function SensorScreen() {
  const [accel, setAccel]     = useState({ x: 0, y: 0, z: 0 });
  const [gyro, setGyro]       = useState({ x: 0, y: 0, z: 0 });
  const [shaking, setShaking] = useState(false);

  useEffect(() => {
    Accelerometer.setUpdateInterval(100);
    Gyroscope.setUpdateInterval(100);

    const accelSub = Accelerometer.addListener((data) => {
      setAccel(data);
      const magnitude = Math.abs(data.x) + Math.abs(data.y) + Math.abs(data.z);
      const isShaking = magnitude > 2.5;
      setShaking(isShaking);
      if (isShaking) Vibration.vibrate(100);
    });

    const gyroSub = Gyroscope.addListener(setGyro);

    return () => {
      accelSub.remove();
      gyroSub.remove();
    };
  }, []);

  const tiltX = (Math.atan2(accel.y, accel.z) * 180 / Math.PI).toFixed(1);
  const tiltY = (Math.atan2(accel.x, accel.z) * 180 / Math.PI).toFixed(1);

  return (
    <View style={styles.container}>
      <View style={[styles.shakeCard, shaking && styles.shakeCardActive]}>
        <Ionicons
          name={shaking ? 'warning' : 'checkmark-circle'}
          size={48}
          color={shaking ? '#E0245E' : '#17BF63'}
        />
        <Text style={[styles.shakeText, shaking && styles.shakeTextActive]}>
          {shaking ? 'SHAKE DETECTED!' : 'Normal'}
        </Text>
      </View>

      <View style={styles.dataCard}>
        <Text style={styles.cardTitle}>
          <Ionicons name='phone-portrait-outline' size={16} /> Accelerometer (m/s²)
        </Text>
        <View style={styles.dataRow}>
          <Text style={styles.dataItem}>X: <Text style={styles.dataValue}>{accel.x.toFixed(3)}</Text></Text>
          <Text style={styles.dataItem}>Y: <Text style={styles.dataValue}>{accel.y.toFixed(3)}</Text></Text>
          <Text style={styles.dataItem}>Z: <Text style={styles.dataValue}>{accel.z.toFixed(3)}</Text></Text>
        </View>
      </View>

      <View style={styles.dataCard}>
        <Text style={styles.cardTitle}>
          <Ionicons name='compass-outline' size={16} /> Gyroscope (rad/s)
        </Text>
        <View style={styles.dataRow}>
          <Text style={styles.dataItem}>X: <Text style={styles.dataValue}>{gyro.x.toFixed(3)}</Text></Text>
          <Text style={styles.dataItem}>Y: <Text style={styles.dataValue}>{gyro.y.toFixed(3)}</Text></Text>
          <Text style={styles.dataItem}>Z: <Text style={styles.dataValue}>{gyro.z.toFixed(3)}</Text></Text>
        </View>
      </View>

      <View style={styles.dataCard}>
        <Text style={styles.cardTitle}>📐 Tilt Angle</Text>
        <View style={styles.dataRow}>
          <Text style={styles.dataItem}>X: <Text style={styles.dataValue}>{tiltX}°</Text></Text>
          <Text style={styles.dataItem}>Y: <Text style={styles.dataValue}>{tiltY}°</Text></Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container:       { flex: 1, backgroundColor: '#F5F8FA', padding: 16, gap: 12 },
  shakeCard:       { backgroundColor: '#fff', borderRadius: 16, padding: 24, alignItems: 'center', elevation: 2, borderWidth: 2, borderColor: '#E1E8ED' },
  shakeCardActive: { borderColor: '#E0245E', backgroundColor: '#FFF0F3' },
  shakeText:       { fontSize: 20, fontWeight: 'bold', color: '#17BF63', marginTop: 8 },
  shakeTextActive: { color: '#E0245E' },
  dataCard:        { backgroundColor: '#fff', borderRadius: 16, padding: 16, elevation: 2 },
  cardTitle:       { fontWeight: 'bold', fontSize: 14, color: '#657786', marginBottom: 10 },
  dataRow:         { flexDirection: 'row', justifyContent: 'space-around' },
  dataItem:        { fontSize: 14, color: '#657786' },
  dataValue:       { fontWeight: 'bold', color: '#1DA1F2', fontSize: 15 },
});
