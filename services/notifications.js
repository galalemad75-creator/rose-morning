import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// ═══════════════════════════════════════════════════
// خدمة الإشعارات - تطبيع الإشعار اليومي
// ═══════════════════════════════════════════════════

// إعداد شكل الإشعار عند وصوله
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

const STORAGE_KEYS = {
  enabled: '@rose_notif_enabled',
  hour: '@rose_notif_hour',
  minute: '@rose_notif_minute',
};

/**
 * طلب إذن الإشعارات من المستخدم
 */
export const requestPermission = async () => {
  if (!Device.isDevice) {
    console.log('الإشعارات تعمل فقط على أجهزة حقيقية');
    return false;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    return false;
  }

  // إعداد القناة للأندرويد
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('rose-daily', {
      name: 'وردة يومية',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#c2185b',
      sound: 'default',
    });
  }

  return true;
};

/**
 * جدولة إشعار يومي متكرر
 */
export const scheduleDailyNotification = async (hour, minute) => {
  // إلغاء أي إشعار سابق
  await Notifications.cancelAllScheduledNotificationsAsync();

  const trigger = Platform.select({
    ios: {
      type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
      hour,
      minute,
      repeats: true,
    },
    android: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour,
      minute,
    },
  });

  await Notifications.scheduleNotificationAsync({
    content: {
      title: '🌹 صباح الورد',
      body: 'وردة جديدة بانتظارك اليوم! افتح التطبيق لمشاهدتها 🌸',
      sound: 'default',
      priority: Notifications.AndroidNotificationPriority.HIGH,
      color: '#c2185b',
      data: { screen: 'home' },
    },
    trigger,
  });

  // حفظ الإعدادات
  await AsyncStorage.setItem(STORAGE_KEYS.enabled, 'true');
  await AsyncStorage.setItem(STORAGE_KEYS.hour, String(hour));
  await AsyncStorage.setItem(STORAGE_KEYS.minute, String(minute));
};

/**
 * إلغاء جميع الإشعارات المجدولة
 */
export const cancelNotification = async () => {
  await Notifications.cancelAllScheduledNotificationsAsync();
  await AsyncStorage.setItem(STORAGE_KEYS.enabled, 'false');
};

/**
 * تحميل الإعدادات المحفوظة
 */
export const loadSettings = async () => {
  try {
    const enabled = await AsyncStorage.getItem(STORAGE_KEYS.enabled);
    const hour = await AsyncStorage.getItem(STORAGE_KEYS.hour);
    const minute = await AsyncStorage.getItem(STORAGE_KEYS.minute);

    return {
      enabled: enabled === 'true',
      hour: hour ? parseInt(hour, 10) : 7,
      minute: minute ? parseInt(minute, 10) : 0,
    };
  } catch {
    return { enabled: false, hour: 7, minute: 0 };
  }
};

/**
 * التحقق من حالة الإذن
 */
export const checkPermissionStatus = async () => {
  const { status } = await Notifications.getPermissionsAsync();
  return status === 'granted';
};
