import * as MediaLibrary from 'expo-media-library';
import * as FileSystem from 'expo-file-system/legacy';

export async function simpanKeGaleri(uri) {
  try {
    const { status } = await MediaLibrary.requestPermissionsAsync();

    if (status !== 'granted') {
      throw new Error('Izin galeri ditolak');
    }

    let localUri = uri;

    if (uri.startsWith('http')) {
      const fileUri =
        FileSystem.cacheDirectory + `image_${Date.now()}.jpg`;

      const downloaded = await FileSystem.downloadAsync(
        uri,
        fileUri
      );

      localUri = downloaded.uri;
    }

    const asset = await MediaLibrary.createAssetAsync(localUri);

    await MediaLibrary.createAlbumAsync(
      'SocialApp',
      asset,
      false
    );

    return asset;
  } catch (e) {
    console.log('Save Error:', e);
    throw e;
  }
}