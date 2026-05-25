import { useState } from 'react';
import * as ImagePicker from 'expo-image-picker';

export function useImagePicker() {
  const [image, setImage] = useState(null);

  const pickFromGallery = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true, aspect: [1, 1], quality: 0.8,
    });
    if (!result.canceled) setImage(result.assets[0].uri);
  };

  const pickFromCamera = async () => {
    const result = await ImagePicker.launchCameraAsync({ allowsEditing: true, quality: 0.8 });
    if (!result.canceled) setImage(result.assets[0].uri);
  };

  return { image, pickFromGallery, pickFromCamera };
}
