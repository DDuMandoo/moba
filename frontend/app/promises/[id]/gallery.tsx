// 📂 app/promises/[id]/gallery.tsx
import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  FlatList,
  Image,
  TouchableOpacity,
  Dimensions,
  RefreshControl,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import axiosInstance from '@/app/axiosInstance';
import Colors from '@/constants/Colors';
import * as ImagePicker from 'expo-image-picker';

const { width } = Dimensions.get('window');
const IMAGE_SIZE = (width - 70) / 3;

export default function GalleryPage() {
  const { id, ended } = useLocalSearchParams<{ id?: string; ended?: string }>();
  const router = useRouter();

  const [images, setImages] = useState<any[]>([]);
  const [page, setPage] = useState<number>(0);
  const [isEnd, setIsEnd] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const hasEnded = ended === 'true';

  const fetchImages = async (initialLoad = false) => {
    if (isEnd && !initialLoad) return;
    setLoading(true);
    try {
      const res = await axiosInstance.get(`/appointments/${id}/images`, {
        params: { page, size: 20 },
      });
      const newImages = res.data.result?.images || [];
      if (initialLoad) {
        setImages(newImages);
      } else {
        setImages((prev) => [...prev, ...newImages]);
      }
      if (newImages.length < 20) setIsEnd(true);
      else setPage((prev) => prev + 1);
    } catch (err) {
      console.error('이미지 로딩 실패', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchImages(true);
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setPage(0);
    setIsEnd(false);
    fetchImages(true);
  }, []);

  const onEndReached = () => {
    if (!loading && !isEnd) {
      fetchImages(false);
    }
  };

  const handleAddImage = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        alert('갤러리 접근 권한이 필요합니다.');
        return;
      }

      const pickerResult = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        quality: 1,
      });

      if (pickerResult.canceled) return;

      const selectedAssets = pickerResult.assets || [pickerResult];
      const formData = new FormData();

      selectedAssets.forEach((asset) => {
        formData.append('images', {
          uri: asset.uri,
          name: asset.fileName || `image_${Date.now()}.jpg`,
          type: 'image/jpeg',
        } as any);
      });

      await axiosInstance.post(`/appointments/${id}/images`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      fetchImages(true);
    } catch (error) {
      console.error('이미지 업로드 실패:', error);
    }
  };

  const renderItem = ({ item, index }: { item: any; index: number }) => {
    if (!hasEnded && index === 0) {
      return (
        <TouchableOpacity onPress={handleAddImage} style={styles.imageWrapper}>
          <View style={styles.addBox}>
            <Ionicons name="add" size={44} color={Colors.logo} />
          </View>
        </TouchableOpacity>
      );
    }

    const actualItem = hasEnded ? item : images[index - 1];
    return (
      <View style={styles.imageWrapper}>
        <Image source={{ uri: actualItem.imageUrl }} style={styles.image} />
      </View>
    );
  };

  const displayedImages = hasEnded ? images : [{ isAdd: true }, ...images];

  return (
    <View style={styles.container}>

      {/* 갤러리 리스트 */}
      <FlatList
        data={displayedImages}
        numColumns={3}
        renderItem={renderItem}
        keyExtractor={(_, idx) => idx.toString()}
        contentContainerStyle={styles.listContent}
        onEndReached={onEndReached}
        onEndReachedThreshold={0.8}
        ListFooterComponent={
          loading && !refreshing ? <ActivityIndicator color={Colors.primary} /> : null
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[Colors.primary]}
          />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    padding: (width - (IMAGE_SIZE * 3 + 30))/2,

  },
  addBox: {
    width: IMAGE_SIZE,
    height: IMAGE_SIZE,
    borderWidth: 1,
    borderColor: Colors.primary,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageWrapper: {
    width: IMAGE_SIZE,
    height: IMAGE_SIZE,
    // padding: 6,
    margin: 5
  },
  image: {
    flex: 1,
    borderRadius: 10,
    borderColor: Colors.primary,
    borderWidth: 1,
  },
  listContent: {
    paddingBottom: 100,
  },
});
