import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  StatusBar,
  Animated,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import * as MediaLibrary from 'expo-media-library';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as Haptics from 'expo-haptics';
import { getDailyRoseByDate, getRandomCuratedRose } from '../services/unsplash';

const { width, height } = Dimensions.get('window');

export default function HomeScreen({ navigation }) {
  const [rose, setRose] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    loadRose();
  }, []);

  const loadRose = useCallback(async () => {
    setLoading(true);
    fadeAnim.setValue(0);
    slideAnim.setValue(30);

    // تحميل وردة اليوم (نفس الصورة طوال اليوم)
    const data = getDailyRoseByDate();
    setRose(data);

    // تأخير بسيط لمحاكاة التحميل وعرض الأنيميشن
    setTimeout(() => {
      setLoading(false);
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        }),
      ]).start();
    }, 800);
  }, []);

  const handleRefresh = useCallback(async () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    setLoading(true);
    fadeAnim.setValue(0);

    const data = getRandomCuratedRose();
    setRose(data);

    setTimeout(() => {
      setLoading(false);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }).start();
    }, 600);
  }, []);

  const saveAsWallpaper = useCallback(async () => {
    if (!rose) return;

    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }

    try {
      setSaving(true);

      // طلب إذن الوصول للصور
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'الإذن مطلوب',
          'نحتاج إذن الوصول للصور لحفظ الوردة كخلفية',
          [{ text: 'حسناً' }]
        );
        setSaving(false);
        return;
      }

      // تحميل الصورة
      const fileUri = FileSystem.documentDirectory + `rose-${Date.now()}.jpg`;
      const downloadResult = await FileSystem.downloadAsync(rose.imageUrl, fileUri);

      // حفظ في مكتبة الصور
      const asset = await MediaLibrary.createAssetAsync(downloadResult.uri);

      // إنشاء ألبوم "صباح الورد" إذا لم يكن موجوداً
      let album = await MediaLibrary.getAlbumAsync('صباح الورد');
      if (!album) {
        album = await MediaLibrary.createAlbumAsync('صباح الورد', asset, false);
      } else {
        await MediaLibrary.addAssetsToAlbumAsync([asset], album, false);
      }

      Alert.alert(
        '✅ تم الحفظ!',
        'تم حفظ صورة الوردة في ألبوم "صباح الورد"\nيمكنك تعيينها كخلفية من إعدادات الهاتف',
        [{ text: 'رائع!' }]
      );
    } catch (error) {
      console.error('خطأ في الحفظ:', error);
      Alert.alert('خطأ', 'حدث خطأ أثناء حفظ الصورة، حاول مرة أخرى');
    } finally {
      setSaving(false);
    }
  }, [rose]);

  const shareRose = useCallback(async () => {
    if (!rose) return;

    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    try {
      // تحميل الصورة مؤقتاً للمشاركة
      const fileUri = FileSystem.cacheDirectory + 'rose-share.jpg';
      await FileSystem.downloadAsync(rose.thumbUrl, fileUri);

      const isAvailable = await Sharing.isAvailableAsync();
      if (isAvailable) {
        await Sharing.shareAsync(fileUri, {
          mimeType: 'image/jpeg',
          dialogTitle: '🌹 أرسل وردة لأحد عزيز',
        });
      } else {
        Alert.alert('عذراً', 'ميزة المشاركة غير متاحة على هذا الجهاز');
      }
    } catch (error) {
      console.error('خطأ في المشاركة:', error);
    }
  }, [rose]);

  const pressAnimation = (callback) => {
    Animated.sequence([
      Animated.timing(buttonScale, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(buttonScale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
    callback();
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#c2185b" />

      {/* صورة الوردة */}
      <View style={styles.imageContainer}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#c2185b" />
            <Text style={styles.loadingText}>جاري جلب وردة اليوم...</Text>
          </View>
        ) : (
          <Animated.View style={[styles.imageWrapper, { opacity: fadeAnim }]}>
            <Image
              source={{ uri: rose?.thumbUrl }}
              style={styles.roseImage}
              resizeMode="cover"
            />
            {/* Gradient Overlay */}
            <View style={styles.gradientOverlay} />

            {/* معلومات المصور */}
            <Animated.View
              style={[
                styles.photographerInfo,
                {
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }],
                },
              ]}
            >
              <Text style={styles.photographerLabel}>📸</Text>
              <Text style={styles.photographerName}>{rose?.photographer}</Text>
            </Animated.View>
          </Animated.View>
        )}
      </View>

      {/* أزرار التحكم */}
      {!loading && (
        <Animated.View
          style={[
            styles.actionsContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: Animated.multiply(slideAnim, -1) }],
            },
          ]}
        >
          {/* زر الحفظ */}
          <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
            <TouchableOpacity
              style={[styles.actionBtn, styles.saveBtn]}
              onPress={() => pressAnimation(saveAsWallpaper)}
              disabled={saving}
              activeOpacity={0.8}
            >
              {saving ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <>
                  <Text style={styles.actionIcon}>📱</Text>
                  <Text style={styles.actionText}>حفظ كخلفية</Text>
                </>
              )}
            </TouchableOpacity>
          </Animated.View>

          {/* زر المشاركة */}
          <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
            <TouchableOpacity
              style={[styles.actionBtn, styles.shareBtn]}
              onPress={() => pressAnimation(shareRose)}
              activeOpacity={0.8}
            >
              <Text style={styles.actionIcon}>🔗</Text>
              <Text style={styles.actionText}>مشاركة</Text>
            </TouchableOpacity>
          </Animated.View>
        </Animated.View>
      )}

      {/* شريط سفلي */}
      {!loading && (
        <Animated.View style={[styles.bottomBar, { opacity: fadeAnim }]}>
          <TouchableOpacity
            style={styles.refreshBtn}
            onPress={handleRefresh}
            activeOpacity={0.7}
          >
            <Text style={styles.refreshIcon}>🔄</Text>
            <Text style={styles.refreshText}>وردة جديدة</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.settingsBtn}
            onPress={() => navigation.navigate('Settings')}
            activeOpacity={0.7}
          >
            <Text style={styles.settingsIcon}>⚙️</Text>
          </TouchableOpacity>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },

  // صورة الوردة
  imageContainer: {
    flex: 1,
  },
  imageWrapper: {
    flex: 1,
  },
  roseImage: {
    width: '100%',
    height: '100%',
  },
  gradientOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 200,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },

  // التحميل
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff0f5',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#c2185b',
    fontFamily: 'Tajawal',
    fontWeight: '500',
  },

  // معلومات المصور
  photographerInfo: {
    position: 'absolute',
    bottom: 16,
    left: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  photographerLabel: {
    fontSize: 14,
    marginRight: 6,
  },
  photographerName: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },

  // أزرار التحكم
  actionsContainer: {
    flexDirection: 'row-reverse',
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 12,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 16,
    gap: 8,
  },
  saveBtn: {
    backgroundColor: '#c2185b',
    ...Platform.select({
      ios: {
        shadowColor: '#c2185b',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 8,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  shareBtn: {
    backgroundColor: '#43a047',
    ...Platform.select({
      ios: {
        shadowColor: '#43a047',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 8,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  actionIcon: {
    fontSize: 20,
  },
  actionText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },

  // شريط سفلي
  bottomBar: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingBottom: Platform.OS === 'ios' ? 34 : 16,
    backgroundColor: 'rgba(0,0,0,0.8)',
  },
  refreshBtn: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 14,
  },
  refreshIcon: {
    fontSize: 18,
  },
  refreshText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  settingsBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingsIcon: {
    fontSize: 20,
  },
});
