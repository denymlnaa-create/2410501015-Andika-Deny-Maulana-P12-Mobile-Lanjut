import { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  Platform,
} from 'react-native';

import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';

import { Ionicons } from '@expo/vector-icons';

const X_BLUE = '#1DA1F2';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

const NOTIF_LIST = [
  {
    id: '1',
    icon: '💬',
    title: 'Chat Masuk',
    body: 'Reren: "Hei, apa kabar?"',
    detik: 3,
    color: '#1DA1F2',
  },

  {
    id: '2',
    icon: '❤️',
    title: 'Like Baru',
    body: 'Reren menyukai post kamu',
    detik: 3,
    color: '#E0245E',
  },

  {
    id: '3',
    icon: '🔁',
    title: 'Repost Baru',
    body: 'Reren me-repost post kamu',
    detik: 3,
    color: '#17BF63',
  },

  {
    id: '4',
    icon: '👤',
    title: 'Follower Baru',
    body: 'Reren mulai mengikutimu',
    detik: 3,
    color: '#FFAD1F',
  },
];

export default function NotificationScreen() {
  const [permStatus, setPermStatus] = useState(null);
  const [received, setReceived] = useState([]);

  const notifListener = useRef();
  const responseListener = useRef();

  useEffect(() => {
    registerForPushNotificationsAsync();

    notifListener.current =
      Notifications.addNotificationReceivedListener((notif) => {
        setReceived((prev) => [
          notif.request.content,
          ...prev,
        ]);
      });

    responseListener.current =
      Notifications.addNotificationResponseReceivedListener(
        (response) => {
          console.log(
            'Notif ditekan:',
            response.notification.request.content.title
          );
        }
      );

    return () => {
      notifListener.current?.remove();
      responseListener.current?.remove();
    };
  }, []);

  async function registerForPushNotificationsAsync() {
    if (!Device.isDevice) {
      Alert.alert('Gunakan HP asli');
      return;
    }

    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();

    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } =
        await Notifications.requestPermissionsAsync();

      finalStatus = status;
    }

    setPermStatus(finalStatus);

    if (finalStatus !== 'granted') {
      Alert.alert(
        'Notifikasi ditolak',
        'Aktifkan notifikasi di pengaturan HP'
      );
      return;
    }

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync(
        'default',
        {
          name: 'default',
          importance:
            Notifications.AndroidImportance.MAX,

          vibrationPattern: [0, 250, 250, 250],

          lightColor: '#1DA1F2',

          sound: 'default',
        }
      );
    }
  }

  const kirimNotif = async (item) => {
    if (permStatus !== 'granted') {
      Alert.alert(
        'Izin belum diberikan',
        'Aktifkan notifikasi terlebih dahulu'
      );
      return;
    }

    await Notifications.scheduleNotificationAsync({
      content: {
        title: item.title,
        body: item.body,
        sound: 'default',
        data: {
          type: item.id,
        },

        ...(Platform.OS === 'android' && {
          channelId: 'default',
        }),
      },

      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: item.detik,
        repeats: false,
      },
    });

    Alert.alert(
      'Berhasil',
      `"${item.title}" akan muncul dalam ${item.detik} detik`
    );
  };

  const kirimSemua = async () => {
    for (let i = 0; i < NOTIF_LIST.length; i++) {
      const n = NOTIF_LIST[i];

      await Notifications.scheduleNotificationAsync({
        content: {
          title: n.title,
          body: n.body,
          sound: 'default',

          ...(Platform.OS === 'android' && {
            channelId: 'default',
          }),
        },

        trigger: {
          type:
            Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,

          seconds: i * 2 + 2,

          repeats: false,
        },
      });
    }

    Alert.alert(
      'Berhasil',
      'Semua notifikasi dijadwalkan'
    );
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ padding: 16 }}
    >
      <View
        style={[
          styles.statusCard,
          {
            borderLeftColor:
              permStatus === 'granted'
                ? '#17BF63'
                : '#E0245E',
          },
        ]}
      >
        <Ionicons
          name={
            permStatus === 'granted'
              ? 'checkmark-circle'
              : 'close-circle'
          }
          size={20}
          color={
            permStatus === 'granted'
              ? '#17BF63'
              : '#E0245E'
          }
        />

        <Text style={styles.statusText}>
          {permStatus === 'granted'
            ? 'Notifikasi Diizinkan ✅'
            : 'Notifikasi Ditolak ❌'}
        </Text>
      </View>

      <TouchableOpacity
        style={styles.allBtn}
        onPress={kirimSemua}
      >
        <Ionicons
          name='notifications'
          size={20}
          color='#fff'
        />

        <Text style={styles.allBtnText}>
          Kirim Semua Notifikasi
        </Text>
      </TouchableOpacity>

      <Text style={styles.sectionTitle}>
        Test Satu per Satu
      </Text>

      {NOTIF_LIST.map((n) => (
        <TouchableOpacity
          key={n.id}
          style={styles.notifBtn}
          onPress={() => kirimNotif(n)}
        >
          <Text style={styles.notifIcon}>
            {n.icon}
          </Text>

          <View style={{ flex: 1 }}>
            <Text style={styles.notifTitle}>
              {n.title}
            </Text>

            <Text style={styles.notifBody}>
              {n.body}
            </Text>
          </View>

          <Ionicons
            name='send'
            size={18}
            color={X_BLUE}
          />
        </TouchableOpacity>
      ))}

      {received.length > 0 && (
        <>
          <Text
            style={[
              styles.sectionTitle,
              { marginTop: 16 },
            ]}
          >
            Notifikasi Diterima
          </Text>

          {received.map((n, i) => (
            <View
              key={i}
              style={styles.receivedItem}
            >
              <Text style={styles.receivedTitle}>
                {n.title}
              </Text>

              <Text style={styles.receivedBody}>
                {n.body}
              </Text>
            </View>
          ))}
        </>
      )}

      <Text style={styles.tip}>
        Minimize app untuk melihat banner notif
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F8FA',
  },

  statusCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
    borderLeftWidth: 4,
    elevation: 1,
  },

  statusText: {
    fontSize: 14,
    color: '#000',
    fontWeight: '600',
  },

  allBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#1DA1F2',
    borderRadius: 24,
    padding: 14,
    marginBottom: 16,
  },

  allBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
  },

  sectionTitle: {
    fontWeight: 'bold',
    fontSize: 15,
    color: '#000',
    marginBottom: 10,
  },

  notifBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
    elevation: 1,
    gap: 12,
  },

  notifIcon: {
    fontSize: 24,
  },

  notifTitle: {
    fontWeight: 'bold',
    color: '#000',
    fontSize: 14,
  },

  notifBody: {
    color: '#657786',
    fontSize: 12,
    marginTop: 2,
  },

  receivedItem: {
    backgroundColor: '#E8F5FE',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#1DA1F2',
  },

  receivedTitle: {
    fontWeight: 'bold',
    color: '#000',
    fontSize: 14,
  },

  receivedBody: {
    color: '#657786',
    fontSize: 13,
  },

  tip: {
    color: '#657786',
    fontSize: 13,
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 30,
    fontStyle: 'italic',
  },
});