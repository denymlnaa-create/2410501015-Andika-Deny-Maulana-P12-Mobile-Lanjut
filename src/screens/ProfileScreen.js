import { View, Text, Image, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import * as ImageManipulator from 'expo-image-manipulator';
import { Ionicons } from '@expo/vector-icons';
import { useImagePicker }   from '../hooks/useImagePicker';
import { simpanKeGaleri }   from '../utils/calendarAndMedia';
import { shareFile }        from '../utils/sharing';
import { loadData, saveData } from '../utils/fileSystem';
import { useNavigation } from '@react-navigation/native';

const X_BLUE = '#1DA1F2';
const X_GRAY = '#657786';

const STATS = [
  { label: 'Post',      value: '24'  },
  { label: 'Followers', value: '1.2K' },
  { label: 'Following', value: '380' },
];

export default function ProfileScreen() {
  const { image, pickFromGallery, pickFromCamera } = useImagePicker();
  const navigation = useNavigation();

  const handleUpload = async () => {
    if (!image) { Alert.alert('Pilih foto dulu!'); return; }
    try {
      const processed = await ImageManipulator.manipulateAsync(
        image,
        [{ resize: { width: 800 } }],
        { compress: 0.75, format: ImageManipulator.SaveFormat.JPEG }
      );
      const data = await loadData() || {};
      const existing = data.userPosts || [];
      const newPost = {
        id: Date.now().toString(),
        user: 'Saya',
        handle: '@saya',
        time: 'Baru saja',
        caption: '',
        image: processed.uri,
        likes: 0, retweets: 0, comments: 0,
        isOwn: true,
      };
      const userPosts = [newPost, ...existing];
      await saveData({ likedPosts: data.likedPosts || [], savedPosts: data.savedPosts || [], userPosts });
      Alert.alert('✅ Berhasil upload', 'Foto telah diupload dan akan muncul di Home');
      navigation.navigate('Home');
    } catch (e) { Alert.alert('Error', e.message); }
  };

  const handleSimpan = async () => {
    if (!image) { Alert.alert('Pilih foto dulu!'); return; }
    try {
      await simpanKeGaleri(image);
      Alert.alert('✅ Tersimpan ke Galeri SocialApp!');
    } catch (e) { Alert.alert('Error', e.message); }
  };

  const handleBagikan = async () => {
    if (!image) { Alert.alert('Pilih foto dulu!'); return; }
    await shareFile(image, 'image/jpeg');
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#fff' }}>
      <View style={styles.banner} />

      <View style={styles.avatarRow}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>S</Text>
        </View>
        <TouchableOpacity style={styles.editBtn}>
          <Text style={styles.editBtnText}>Edit Profil</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.userInfo}>
        <Text style={styles.userName}>Dikaa</Text>
        <Text style={styles.userHandle}>@Azsvenx</Text>
        <Text style={styles.userBio}>Manusia Biasa</Text>
        <View style={styles.statsRow}>
          {STATS.map(s => (
            <View key={s.label} style={styles.statItem}>
              <Text style={styles.statValue}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.postSection}>
        <Text style={styles.sectionTitle}> Post Baru</Text>

        {image ? (
          <Image source={{ uri: image }} style={styles.preview} />
        ) : (
          <View style={styles.placeholder}>
            <Ionicons name='image-outline' size={48} color='#ccc' />
            <Text style={styles.placeholderText}>Belum ada foto dipilih</Text>
          </View>
        )}

        <View style={styles.btnGroup}>
          <TouchableOpacity style={[styles.btn, { backgroundColor: '#000' }]} onPress={pickFromCamera}>
            <Ionicons name='camera' size={18} color='#fff' />
            <Text style={styles.btnText}>Kamera</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.btn, { backgroundColor: X_GRAY }]} onPress={pickFromGallery}>
            <Ionicons name='images' size={18} color='#fff' />
            <Text style={styles.btnText}>Galeri</Text>
          </TouchableOpacity>
        </View>

        {image && (
          <View style={styles.btnGroup}>
            <TouchableOpacity style={[styles.btn, { backgroundColor: X_BLUE }]} onPress={handleUpload}>
              <Ionicons name='cloud-upload' size={18} color='#fff' />
              <Text style={styles.btnText}>Upload (800px)</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.btn, { backgroundColor: '#17BF63' }]} onPress={handleSimpan}>
              <Ionicons name='bookmark' size={18} color='#fff' />
              <Text style={styles.btnText}>Simpan</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.btn, { backgroundColor: '#FFAD1F' }]} onPress={handleBagikan}>
              <Ionicons name='share-social' size={18} color='#fff' />
              <Text style={styles.btnText}>Bagikan</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  banner:          { height: 120, backgroundColor: X_BLUE },
  avatarRow:       { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', paddingHorizontal: 16, marginTop: -36 },
  avatar:          { width: 72, height: 72, borderRadius: 36, backgroundColor: '#000', alignItems: 'center', justifyContent: 'center', borderWidth: 4, borderColor: '#fff' },
  avatarText:      { color: '#fff', fontWeight: 'bold', fontSize: 28 },
  editBtn:         { borderWidth: 1, borderColor: '#657786', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 6, marginBottom: 4 },
  editBtnText:     { fontWeight: 'bold', color: '#000', fontSize: 14 },
  userInfo:        { padding: 16 },
  userName:        { fontWeight: 'bold', fontSize: 20, color: '#000' },
  userHandle:      { color: '#657786', fontSize: 15, marginBottom: 8 },
  userBio:         { color: '#000', fontSize: 15, marginBottom: 12 },
  statsRow:        { flexDirection: 'row', gap: 20 },
  statItem:        { alignItems: 'center' },
  statValue:       { fontWeight: 'bold', fontSize: 16, color: '#000' },
  statLabel:       { color: '#657786', fontSize: 13 },
  divider:         { height: 8, backgroundColor: '#F5F8FA' },
  postSection:     { padding: 16 },
  sectionTitle:    { fontWeight: 'bold', fontSize: 16, color: '#000', marginBottom: 12 },
  preview:         { width: '100%', height: 240, borderRadius: 16, marginBottom: 12 },
  placeholder:     { height: 160, borderRadius: 16, backgroundColor: '#F5F8FA', alignItems: 'center', justifyContent: 'center', marginBottom: 12, borderWidth: 1, borderColor: '#E1E8ED', borderStyle: 'dashed' },
  placeholderText: { color: '#ccc', marginTop: 8, fontSize: 14 },
  btnGroup:        { flexDirection: 'row', gap: 8, marginBottom: 8, flexWrap: 'wrap' },
  btn:             { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, padding: 10, borderRadius: 20, minWidth: 80 },
  btnText:         { color: '#fff', fontWeight: 'bold', fontSize: 13 },
});
