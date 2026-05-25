import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system/legacy';
import { Linking } from 'react-native';

export async function shareFile(uri, mimeType) {
  try {
    const bisa = await Sharing.isAvailableAsync();

    if (!bisa) {
      throw new Error('Sharing tidak tersedia');
    }

    let localUri = uri;

    if (uri.startsWith('http')) {
      const fileUri =
        FileSystem.cacheDirectory + 'shared-image.jpg';

      const downloaded =
        await FileSystem.downloadAsync(uri, fileUri);

      localUri = downloaded.uri;
    }

    await Sharing.shareAsync(localUri, {
      mimeType: mimeType || 'image/jpeg',
      dialogTitle: 'Bagikan via...',
    });
  } catch (e) {
    console.log(e);
    throw e;
  }
}

export async function openLink(url) {
  const bisa = await Linking.canOpenURL(url);

  if (bisa) {
    await Linking.openURL(url);
  }
}

export async function getInitialLink() {
  return await Linking.getInitialURL();
}