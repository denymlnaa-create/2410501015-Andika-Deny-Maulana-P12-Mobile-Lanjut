import { useState, useEffect, useRef } from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, StyleSheet, Alert, TextInput, Modal, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { simpanKeGaleri } from '../utils/calendarAndMedia';
import { shareFile }      from '../utils/sharing';
import { saveData, loadData } from '../utils/fileSystem';

const X_BLUE = '#1DA1F2';
const X_GRAY = '#657786';
const X_LIGHT = '#E1E8ED';

const INITIAL_POSTS = [
  { id: '1', user: 'Andi Pratama',  handle: '@andip',  time: '2m',  caption: 'Pemandangan indah pagi ini! ☀️', image: 'https://picsum.photos/seed/post1/600/400', likes: 24,  retweets: 5,  comments: 3 },
  { id: '2', user: 'Budi Santoso',  handle: '@budis',  time: '15m', caption: 'Makan siang yang enak banget 🍜', image: 'https://picsum.photos/seed/post2/600/400', likes: 102, retweets: 12, comments: 8 },
  { id: '3', user: 'Citra Dewi',    handle: '@citrad', time: '1j',  caption: 'Jalan-jalan sore di taman 🌳',   image: 'https://picsum.photos/seed/post3/600/400', likes: 57,  retweets: 3,  comments: 11 },
];

export default function HomeScreen() {
  const [posts, setPosts]           = useState(INITIAL_POSTS);
  const [likedPosts, setLikedPosts] = useState([]);
  const [savedPosts, setSavedPosts] = useState([]);
  const [showModal, setShowModal]   = useState(false);
  const [newCaption, setNewCaption] = useState('');
  const [newImage, setNewImage]     = useState(null);

  useEffect(() => {
    loadData().then(data => {
      if (data?.likedPosts) setLikedPosts(data.likedPosts);
      if (data?.savedPosts) setSavedPosts(data.savedPosts);
      if (data?.userPosts)  setPosts([...data.userPosts, ...INITIAL_POSTS]);
    });
  }, []);

  const handleLike = async (postId) => {
    const updated = likedPosts.includes(postId)
      ? likedPosts.filter(id => id !== postId)
      : [...likedPosts, postId];
    setLikedPosts(updated);
    await saveData({ likedPosts: updated, savedPosts });
  };

  const handleSimpan = async (post) => {
    try {
      await simpanKeGaleri(post.image);
      const updated = [...new Set([...savedPosts, post.id])];
      setSavedPosts(updated);
      await saveData({ likedPosts, savedPosts: updated });
      Alert.alert('✅ Tersimpan', 'Foto disimpan ke galeri SocialApp');
    } catch (e) { Alert.alert('Info', e.message); }
  };

  const handleBagikan = async (post) => {
    try { await shareFile(post.image, 'image/jpeg'); }
    catch (e) { Alert.alert('Info', e.message); }
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true, aspect: [4, 3], quality: 0.8,
    });
    if (!result.canceled) setNewImage(result.assets[0].uri);
  };

  const handlePost = async () => {
    if (!newCaption.trim() && !newImage) {
      Alert.alert('Tulis sesuatu dulu!'); return;
    }
    const newPost = {
      id:       Date.now().toString(),
      user:     'Saya',
      handle:   '@saya',
      time:     'Baru saja',
      caption:  newCaption,
      image:    newImage || 'https://picsum.photos/seed/mypost/600/400',
      likes:    0, retweets: 0, comments: 0,
      isOwn:    true,
    };
    const updatedPosts = [newPost, ...posts];
    setPosts(updatedPosts);
    const userPosts = updatedPosts.filter(p => p.isOwn);
    await saveData({ likedPosts, savedPosts, userPosts });
    setNewCaption('');
    setNewImage(null);
    setShowModal(false);
  };

  const renderPost = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={[styles.avatar, item.isOwn && { backgroundColor: '#17BF63' }]}>
          <Text style={styles.avatarText}>{item.user[0]}</Text>
        </View>
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{item.user} {item.isOwn && <Text style={styles.ownBadge}>· Kamu</Text>}</Text>
          <Text style={styles.userHandle}>{item.handle} · {item.time}</Text>
        </View>
        <Ionicons name='ellipsis-horizontal' size={18} color={X_GRAY} />
      </View>
      {item.caption ? <Text style={styles.caption}>{item.caption}</Text> : null}
      {item.image   ? <Image source={{ uri: item.image }} style={styles.postImage} /> : null}
      <View style={styles.actions}>
        <TouchableOpacity style={styles.actionBtn}>
          <Ionicons name='chatbubble-outline' size={18} color={X_GRAY} />
          <Text style={styles.actionText}>{item.comments}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn}>
          <Ionicons name='repeat-outline' size={18} color={X_GRAY} />
          <Text style={styles.actionText}>{item.retweets}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn} onPress={() => handleLike(item.id)}>
          <Ionicons name={likedPosts.includes(item.id) ? 'heart' : 'heart-outline'} size={18} color={likedPosts.includes(item.id) ? '#E0245E' : X_GRAY} />
          <Text style={[styles.actionText, likedPosts.includes(item.id) && { color: '#E0245E' }]}>
            {item.likes + (likedPosts.includes(item.id) ? 1 : 0)}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn} onPress={() => handleSimpan(item)}>
          <Ionicons name={savedPosts.includes(item.id) ? 'bookmark' : 'bookmark-outline'} size={18} color={savedPosts.includes(item.id) ? X_BLUE : X_GRAY} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn} onPress={() => handleBagikan(item)}>
          <Ionicons name='share-outline' size={18} color={X_GRAY} />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: '#F5F8FA' }}>
      <FlatList
        data={posts}
        keyExtractor={item => item.id}
        renderItem={renderPost}
        ItemSeparatorComponent={() => <View style={{ height: 8, backgroundColor: '#F5F8FA' }} />}
        ListHeaderComponent={
          <TouchableOpacity style={styles.composebox} onPress={() => setShowModal(true)}>
            <View style={styles.composeAvatar}>
              <Text style={styles.avatarText}>S</Text>
            </View>
            <Text style={styles.composePlaceholder}>Apa yang sedang terjadi?</Text>
            <TouchableOpacity style={styles.postBtn} onPress={() => setShowModal(true)}>
              <Text style={styles.postBtnText}>Post</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        }
      />

      <TouchableOpacity style={styles.fab} onPress={() => setShowModal(true)}>
        <Ionicons name='add' size={28} color='#fff' />
      </TouchableOpacity>

      <Modal visible={showModal} animationType='slide' transparent={false}>
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => { setShowModal(false); setNewCaption(''); setNewImage(null); }}>
              <Text style={styles.modalCancel}>Batal</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Post Baru</Text>
            <TouchableOpacity style={styles.modalPostBtn} onPress={handlePost}>
              <Text style={styles.modalPostBtnText}>Post</Text>
            </TouchableOpacity>
          </View>
          <ScrollView style={{ flex: 1, padding: 16 }}>
            <View style={styles.modalCompose}>
              <View style={[styles.avatar, { backgroundColor: '#17BF63' }]}>
                <Text style={styles.avatarText}>S</Text>
              </View>
              <TextInput
                style={styles.modalInput}
                placeholder='Apa yang sedang terjadi?'
                multiline
                value={newCaption}
                onChangeText={setNewCaption}
                autoFocus
              />
            </View>
            {newImage && <Image source={{ uri: newImage }} style={styles.modalPreview} />}
          </ScrollView>
          <View style={styles.modalActions}>
            <TouchableOpacity onPress={pickImage}>
              <Ionicons name='image-outline' size={26} color={X_BLUE} />
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  card:             { backgroundColor: '#fff', paddingHorizontal: 16, paddingTop: 12, paddingBottom: 4 },
  cardHeader:       { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  avatar:           { width: 44, height: 44, borderRadius: 22, backgroundColor: X_BLUE, alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  avatarText:       { color: '#fff', fontWeight: 'bold', fontSize: 18 },
  userInfo:         { flex: 1 },
  userName:         { fontWeight: 'bold', fontSize: 15, color: '#000' },
  ownBadge:         { color: '#17BF63', fontWeight: 'normal' },
  userHandle:       { color: X_GRAY, fontSize: 13 },
  caption:          { fontSize: 15, color: '#000', marginBottom: 10, lineHeight: 20 },
  postImage:        { width: '100%', height: 200, borderRadius: 16, marginBottom: 10 },
  actions:          { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 },
  actionBtn:        { flexDirection: 'row', alignItems: 'center', gap: 4, padding: 6 },
  actionText:       { color: X_GRAY, fontSize: 13 },
  composebox:       { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', padding: 12, borderBottomWidth: 8, borderBottomColor: '#F5F8FA', gap: 10 },
  composeAvatar:    { width: 40, height: 40, borderRadius: 20, backgroundColor: '#17BF63', alignItems: 'center', justifyContent: 'center' },
  composePlaceholder:{ flex: 1, color: X_GRAY, fontSize: 16 },
  postBtn:          { backgroundColor: X_BLUE, borderRadius: 20, paddingHorizontal: 16, paddingVertical: 6 },
  postBtnText:      { color: '#fff', fontWeight: 'bold' },
  fab:              { position: 'absolute', bottom: 20, right: 20, width: 56, height: 56, borderRadius: 28, backgroundColor: X_BLUE, alignItems: 'center', justifyContent: 'center', elevation: 6 },
  modalHeader:      { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderBottomWidth: 1, borderBottomColor: X_LIGHT, paddingTop: Platform.OS === 'android' ? 40 : 56 },
  modalCancel:      { fontSize: 16, color: '#000' },
  modalTitle:       { fontWeight: 'bold', fontSize: 16, color: '#000' },
  modalPostBtn:     { backgroundColor: X_BLUE, borderRadius: 20, paddingHorizontal: 16, paddingVertical: 6 },
  modalPostBtnText: { color: '#fff', fontWeight: 'bold' },
  modalCompose:     { flexDirection: 'row', gap: 12 },
  modalInput:       { flex: 1, fontSize: 18, color: '#000', minHeight: 100, textAlignVertical: 'top' },
  modalPreview:     { width: '100%', height: 200, borderRadius: 16, marginTop: 12 },
  modalActions:     { flexDirection: 'row', padding: 16, borderTopWidth: 1, borderTopColor: X_LIGHT, gap: 16 },
});