import { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  Alert,
} from 'react-native';

import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImageManipulator from 'expo-image-manipulator';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

import { simpanKeGaleri } from '../utils/calendarAndMedia';
import { loadData, saveData } from '../utils/fileSystem';

export default function CameraScreen() {
  const [perm, requestPerm] = useCameraPermissions();
  const [photo, setPhoto] = useState(null);
  const [facing, setFacing] = useState('back');
  const [flash, setFlash] = useState('off');
  const [countdown, setCountdown] = useState(null);

  const camRef = useRef(null);
  const navigation = useNavigation();

  const startCountdown = () => {
    let count = 3;
    setCountdown(count);

    const interval = setInterval(() => {
      count -= 1;

      if (count === 0) {
        clearInterval(interval);
        setCountdown(null);
        takePicture();
      } else {
        setCountdown(count);
      }
    }, 1000);
  };

  const takePicture = async () => {
    try {
      if (!camRef.current) return;

      const pic = await camRef.current.takePictureAsync({
        quality: 0.8,
      });

      const resized = await ImageManipulator.manipulateAsync(
        pic.uri,
        [{ resize: { width: 800 } }],
        {
          compress: 0.75,
          format: ImageManipulator.SaveFormat.JPEG,
        }
      );

      setPhoto(resized.uri);
    } catch (e) {
      Alert.alert('Error', 'Gagal mengambil foto');
    }
  };

  const handleSimpan = async () => {
    try {
      if (!photo) return;

      await simpanKeGaleri(photo);

      Alert.alert(
        '✅ Tersimpan!',
        'Foto berhasil disimpan ke galeri'
      );
    } catch (e) {
      Alert.alert('Gagal simpan', e.message);
    }
  };

  const handlePost = async () => {
    try {
      if (!photo) return;

      const data = (await loadData()) || {};

      const existingPosts = data.userPosts || [];

      const newPost = {
        id: Date.now().toString(),
        user: 'Saya',
        handle: '@saya',
        time: 'Baru saja',
        caption: 'Postingan baru 📸',
        image: photo,
        likes: 0,
        retweets: 0,
        comments: 0,
        isOwn: true,
      };

      const updatedPosts = [newPost, ...existingPosts];

      await saveData({
        likedPosts: data.likedPosts || [],
        savedPosts: data.savedPosts || [],
        userPosts: updatedPosts,
      });

      Alert.alert('Berhasil', 'Postingan berhasil dibuat');

      setPhoto(null);

      navigation.navigate('Home');
    } catch (e) {
      Alert.alert('Error', e.message);
    }
  };

  if (!perm?.granted) {
    return (
      <View style={styles.center}>
        <Ionicons
          name="camera-outline"
          size={64}
          color="#ccc"
        />

        <Text style={styles.permText}>
          Akses kamera diperlukan
        </Text>

        <TouchableOpacity
          style={styles.permBtn}
          onPress={requestPerm}
        >
          <Text style={styles.permBtnText}>
            Izinkan Kamera
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (photo) {
    return (
      <View style={styles.previewContainer}>
        <Image
          source={{ uri: photo }}
          style={styles.previewImage}
          resizeMode="contain"
        />

        <View style={styles.previewActions}>
          <TouchableOpacity
            style={styles.previewBtn}
            onPress={() => setPhoto(null)}
          >
            <Ionicons
              name="close"
              size={22}
              color="#fff"
            />

            <Text style={styles.previewBtnText}>
              Ulangi
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.previewBtn,
              { backgroundColor: '#1DA1F2' },
            ]}
            onPress={handleSimpan}
          >
            <Ionicons
              name="download"
              size={22}
              color="#fff"
            />

            <Text style={styles.previewBtnText}>
              Galeri
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.previewBtn,
              { backgroundColor: '#22c55e' },
            ]}
            onPress={handlePost}
          >
            <Ionicons
              name="send"
              size={22}
              color="#fff"
            />

            <Text style={styles.previewBtnText}>
              Post
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <CameraView
        ref={camRef}
        style={{ flex: 1 }}
        facing={facing}
        flash={flash}
      >
        {countdown !== null && (
          <View style={styles.countdownOverlay}>
            <Text style={styles.countdownText}>
              {countdown}
            </Text>
          </View>
        )}

        <View style={styles.topControls}>
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={() =>
              setFlash((f) =>
                f === 'off' ? 'on' : 'off'
              )
            }
          >
            <Ionicons
              name={
                flash === 'off'
                  ? 'flash-off'
                  : 'flash'
              }
              size={24}
              color="#fff"
            />
          </TouchableOpacity>
        </View>

        <View style={styles.bottomControls}>
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={() =>
              setFacing((f) =>
                f === 'back'
                  ? 'front'
                  : 'back'
              )
            }
          >
            <Ionicons
              name="camera-reverse-outline"
              size={32}
              color="#fff"
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.shutterBtn}
            onPress={startCountdown}
          >
            <View style={styles.shutterInner} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.iconBtn}
            onPress={takePicture}
          >
            <Ionicons
              name="camera-outline"
              size={32}
              color="#fff"
            />
          </TouchableOpacity>
        </View>
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },

  permText: {
    fontSize: 16,
    color: '#657786',
    marginTop: 16,
    marginBottom: 20,
  },

  permBtn: {
    backgroundColor: '#1DA1F2',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },

  permBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
  },

  countdownOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },

  countdownText: {
    fontSize: 100,
    fontWeight: 'bold',
    color: '#fff',
  },

  topControls: {
    position: 'absolute',
    top: 20,
    right: 16,
  },

  bottomControls: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },

  iconBtn: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  shutterBtn: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },

  shutterInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: '#000',
    backgroundColor: '#fff',
  },

  previewContainer: {
    flex: 1,
    backgroundColor: '#000',
  },

  previewImage: {
    flex: 1,
  },

  previewActions: {
    flexDirection: 'row',
    padding: 16,
    gap: 10,
    backgroundColor: '#000',
  },

  previewBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 14,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },

  previewBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
});