import * as FileSystem from 'expo-file-system/legacy';

const FILE_URI =
  FileSystem.documentDirectory +
  'socialapp.json';

export const loadData = async () => {
  try {

    const fileInfo =
      await FileSystem.getInfoAsync(FILE_URI);

    if (!fileInfo.exists) {
      return {
        likedPosts: [],
        savedPosts: [],
        userPosts: [],
      };
    }

    const content =
      await FileSystem.readAsStringAsync(FILE_URI);

    return JSON.parse(content);

  } catch (e) {

    console.log('Load Error:', e);

    return {
      likedPosts: [],
      savedPosts: [],
      userPosts: [],
    };

  }
};

export const saveData = async (data) => {
  try {

    await FileSystem.writeAsStringAsync(
      FILE_URI,
      JSON.stringify(data)
    );

  } catch (e) {

    console.log('Save Error:', e);

  }
};