import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  Switch,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Animated,
  StatusBar,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import {
  scheduleDailyNotification,
  cancelNotification,
  requestPermission,
  loadSettings,
} from '../services/notifications';

// مكون اختيار الوقت المخصص (بدون مكتبات خارجية)
const TimeWheel = ({ value, onChange }) => {
  const hours = Array.from({ length: 24 }, (_, i) => i);
  const minutes = Array.from({ length: 60 }, (_, i) => i);

  const [selectedHour, setSelectedHour] = useState(value.hour);
  const [selectedMinute, setSelectedMinute] = useState(value.minute);

  const handleConfirm = () => {
    onChange(selectedHour, selectedMinute);
  };

  useEffect(() => {
    setSelectedHour(value.hour);
    setSelectedMinute(value.minute);
  }, [value]);

  return (
    <View style={timeWheelStyles.container}>
      <View style={timeWheelStyles.display}>
        <Text style={timeWheelStyles.timeText}>
          {String(selectedHour).padStart(2, '0')}:{String(selectedMinute).padStart(2, '0')}
        </Text>
      </View>

      <View style={timeWheelStyles.pickerRow}>
        {/* اختيار الساعة */}
        <View style={timeWheelStyles.pickerColumn}>
          <Text style={timeWheelStyles.pickerLabel}>ساعة</Text>
          <View style={timeWheelStyles.pickerScroll}>
            {hours.map((h) => (
              <TouchableOpacity
                key={h}
                style={[
                  timeWheelStyles.pickerItem,
                  h === selectedHour && timeWheelStyles.pickerItemActive,
                ]}
                onPress={() => {
                  setSelectedHour(h);
                  if (Platform.OS !== 'web') {
                    Haptics.selectionAsync();
                  }
                }}
              >
                <Text
                  style={[
                    timeWheelStyles.pickerItemText,
                    h === selectedHour && timeWheelStyles.pickerItemTextActive,
                  ]}
                >
                  {String(h).padStart(2, '0')}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <Text style={timeWheelStyles.separator}>:</Text>

        {/* اختيار الدقيقة */}
        <View style={timeWheelStyles.pickerColumn}>
          <Text style={timeWheelStyles.pickerLabel}>دقيقة</Text>
          <View style={timeWheelStyles.pickerScroll}>
            {[0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55].map((m) => (
              <TouchableOpacity
                key={m}
                style={[
                  timeWheelStyles.pickerItem,
                  m === selectedMinute && timeWheelStyles.pickerItemActive,
                ]}
                onPress={() => {
                  setSelectedMinute(m);
                  if (Platform.OS !== 'web') {
                    Haptics.selectionAsync();
                  }
                }}
              >
                <Text
                  style={[
                    timeWheelStyles.pickerItemText,
                    m === selectedMinute && timeWheelStyles.pickerItemTextActive,
                  ]}
                >
                  {String(m).padStart(2, '0')}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>

      <TouchableOpacity
        style={timeWheelStyles.confirmBtn}
        onPress={handleConfirm}
        activeOpacity={0.8}
      >
        <Text style={timeWheelStyles.confirmText}>✅ تأكيد الوقت</Text>
      </TouchableOpacity>
    </View>
  );
};

const timeWheelStyles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  display: {
    backgroundColor: '#fce4ec',
    paddingHorizontal: 40,
    paddingVertical: 16,
    borderRadius: 20,
    marginBottom: 20,
  },
  timeText: {
    fontSize: 48,
    fontWeight: '800',
    color: '#c2185b',
    fontVariant: ['tabular-nums'],
  },
  pickerRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 12,
  },
  pickerColumn: {
    alignItems: 'center',
  },
  pickerLabel: {
    fontSize: 14,
    color: '#888',
    marginBottom: 8,
    fontWeight: '600',
  },
  pickerScroll: {
    flexDirection: 'row-reverse',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 6,
    maxHeight: 200,
  },
  pickerItem: {
    width: 48,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pickerItemActive: {
    backgroundColor: '#c2185b',
  },
  pickerItemText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#555',
  },
  pickerItemTextActive: {
    color: '#fff',
  },
  separator: {
    fontSize: 36,
    fontWeight: '800',
    color: '#c2185b',
    marginBottom: 24,
  },
  confirmBtn: {
    marginTop: 20,
    backgroundColor: '#c2185b',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 14,
  },
  confirmText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});

export default function SettingsScreen({ navigation }) {
  const [enabled, setEnabled] = useState(false);
  const [time, setTime] = useState({ hour: 7, minute: 0 });
  const [showPicker, setShowPicker] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // تحميل الإعدادات
    loadSettings().then((settings) => {
      setEnabled(settings.enabled);
      setTime({ hour: settings.hour, minute: settings.minute });
    });

    // أنيميشن الدخول
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleToggle = async (value) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(
        value
          ? Haptics.ImpactFeedbackStyle.Medium
          : Haptics.ImpactFeedbackStyle.Light
      );
    }

    setEnabled(value);

    if (value) {
      const granted = await requestPermission();
      if (granted) {
        await scheduleDailyNotification(time.hour, time.minute);
        Alert.alert(
          '🔔 تم التفعيل!',
          `سيصلك إشعار يوم الساعة ${String(time.hour).padStart(2, '0')}:${String(time.minute).padStart(2, '0')}`
        );
      } else {
        setEnabled(false);
        Alert.alert(
          'الإذن مطلوب',
          'يرجى السماح بالإشعارات من إعدادات الهاتف لتفعيل هذه الميزة'
        );
      }
    } else {
      await cancelNotification();
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      }
    }
  };

  const handleTimeConfirm = async (hour, minute) => {
    setTime({ hour, minute });
    setShowPicker(false);

    if (enabled) {
      await scheduleDailyNotification(hour, minute);
      Alert.alert(
        '⏰ تم التحديث',
        `الإشعار الجديد الساعة ${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`
      );
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff0f5" />

      {/* زر الرجوع */}
      <TouchableOpacity
        style={styles.backBtn}
        onPress={() => navigation.goBack()}
        activeOpacity={0.7}
      >
        <Text style={styles.backIcon}>→</Text>
        <Text style={styles.backText}>رجوع</Text>
      </TouchableOpacity>

      <Animated.View style={{ opacity: fadeAnim, flex: 1 }}>
        <Text style={styles.title}>⚙️ الإعدادات</Text>

        {/* بطاقة الإشعارات */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.cardHeaderRight}>
              <Text style={styles.cardIcon}>🔔</Text>
              <View>
                <Text style={styles.cardTitle}>الإشعار اليومي</Text>
                <Text style={styles.cardSubtitle}>
                  {enabled ? 'مفعّل' : 'معطّل'} — اختر وقت إشعارك الصباحي
                </Text>
              </View>
            </View>
            <Switch
              value={enabled}
              onValueChange={handleToggle}
              trackColor={{ false: '#e0e0e0', true: '#f8bbd0' }}
              thumbColor={enabled ? '#c2185b' : '#f5f5f5'}
              ios_backgroundColor="#e0e0e0"
            />
          </View>

          {/* عرض الوقت الحالي */}
          {enabled && (
            <TouchableOpacity
              style={styles.timeDisplay}
              onPress={() => setShowPicker(!showPicker)}
              activeOpacity={0.7}
            >
              <Text style={styles.timeEmoji}>🕐</Text>
              <Text style={styles.timeText}>
                {String(time.hour).padStart(2, '0')}:{String(time.minute).padStart(2, '0')}
              </Text>
              <Text style={styles.timeHint}>
                {showPicker ? 'اضغط للإخفاء' : 'اضغط للتغيير'}
              </Text>
            </TouchableOpacity>
          )}

          {/* منتقي الوقت */}
          {enabled && showPicker && (
            <TimeWheel value={time} onChange={handleTimeConfirm} />
          )}
        </View>

        {/* بطاقة معلومات */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.cardHeaderRight}>
              <Text style={styles.cardIcon}>ℹ️</Text>
              <View>
                <Text style={styles.cardTitle}>عن التطبيق</Text>
                <Text style={styles.cardSubtitle}>صباح الورد v1.0</Text>
              </View>
            </View>
          </View>
          <Text style={styles.aboutText}>
            🌹 تطبيق صباح الورد يرسل لك كل يوم صورة وردة جميلة عالية الجودة.
            يمكنك تعيينها كخلفية لشاشتك أو مشاركتها مع أحبابك.
          </Text>
          <Text style={styles.aboutText}>
            📸 الصور من Unsplash — مجاناً وبدون حقوق ملكية.
          </Text>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff0f5',
    paddingTop: Platform.OS === 'ios' ? 56 : StatusBar.currentHeight + 16,
  },

  // زر الرجوع
  backBtn: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 6,
  },
  backIcon: {
    fontSize: 22,
    color: '#c2185b',
    fontWeight: '700',
  },
  backText: {
    fontSize: 16,
    color: '#c2185b',
    fontWeight: '600',
  },

  // العنوان
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1a1a2e',
    textAlign: 'center',
    marginVertical: 20,
  },

  // البطاقات
  card: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 20,
    padding: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  cardHeader: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardHeaderRight: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 12,
  },
  cardIcon: {
    fontSize: 28,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a2e',
  },
  cardSubtitle: {
    fontSize: 13,
    color: '#888',
    marginTop: 2,
  },

  // عرض الوقت
  timeDisplay: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    padding: 16,
    backgroundColor: '#fce4ec',
    borderRadius: 16,
    gap: 12,
  },
  timeEmoji: {
    fontSize: 24,
  },
  timeText: {
    fontSize: 32,
    fontWeight: '800',
    color: '#c2185b',
    fontVariant: ['tabular-nums'],
  },
  timeHint: {
    fontSize: 13,
    color: '#999',
  },

  // نص التعريف
  aboutText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 22,
    marginTop: 12,
    textAlign: 'right',
  },
});
