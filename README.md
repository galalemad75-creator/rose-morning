# 🌹 صباح الورد — Rose Morning

تطبيق موبايل يرسل لك كل يوم صورة وردة جميلة عالية الجودة.

## الميزات

- 🌹 صورة وردة جديدة كل يوم من Unsplash
- 📱 حفظ الصورة كخلفية للهاتف
- 🔗 مشاركة مع الأصدقاء
- ⏰ إشعار صباحي يومي قابل للتخصيص
- 🌸 تصميم عربي جميل مع أنيميشنات سلسة

## البدء السريع

### 1. تثبيت المتطلبات

```bash
# تثبيت Expo CLI
npm install -g expo-cli eas-cli

# تسجيل الدخول إلى Expo
expo login

# تثبيت المتطلبات
cd rose-morning-app
npm install
```

### 2. تشغيل التطبيق محلياً

```bash
npx expo start
```

امسح الكود QR من تطبيق **Expo Go** على هاتفك.

### 3. بناء التطبيق (للمتاجر)

```bash
# بناء Android (APK للاختبار)
eas build --platform android --profile preview

# بناء Android (AAB للنشر على Google Play)
eas build --platform android --profile production

# بناء iOS
eas build --platform ios --profile production
```

---

## 📲 النشر على Google Play

### الخطوة 1: إنشاء حساب مطور
1. اذهب إلى [Google Play Console](https://play.google.com/console)
2. ادفع رسوم التسجيل الواحدة ($25)
3. أكمل ملف المطور

### الخطوة 2: إنشاء التطبيق
1. اضغط **Create app**
2. املأ البيانات:
   - **اسم التطبيق**: صباح الورد
   - **الوصف**: تطبيق يرسل لك كل يوم صورة وردة جميلة
   - **التصنيف**: Lifestyle / Personalization
   - **الSupportedContent**: Arabic, English

### الخطوة 3: بناء AAB
```bash
eas build --platform android --profile production
```

### الخطوة 4: الرفع
```bash
eas submit --platform android
```

### الخطوة 5: إكمال المتطلبات
- 📸 Screenshots (على الأقل 2)
- 🎨 أيقونة التطبيق (512x512)
- 📝 سياسة الخصوصية
- 🏷️ تصنيف المحتوى

---

## 🍎 النشر على App Store

### الخطوة 1: Apple Developer Program
1. سجل في [Apple Developer](https://developer.apple.com/) ($99/سنة)
2. أنشئ App ID في [Certificates, Identifiers & Profiles](https://developer.apple.com/account/)

### الخطوة 2: App Store Connect
1. اذهب إلى [App Store Connect](https://appstoreconnect.apple.com/)
2. اضغط **My Apps → New App**
3. املأ البيانات:
   - **Name**: صباح الورد
   - **Primary Language**: Arabic
   - **Bundle ID**: com.rosemorning.app
   - **SKU**: rose-morning-2024

### الخطوة 3: بناء IPA
```bash
eas build --platform ios --profile production
```

### الخطوة 4: الرفع
```bash
eas submit --platform ios
```

### الخطوة 5: إكمال المتطلبات
- 📸 Screenshots لكل حجم شاشة
- 📝 وصف التطبيق (عربي وإنجليزي)
- 🔗 رابط سياسة الخصوصية
- 🏷️ تصنيف وعمر مناسب

---

## ⚙️ تخصيص Unsplash API (اختياري)

للحصول على صور أكثر تنوعاً:

1. سجل على [Unsplash Developers](https://unsplash.com/developers)
2. أنشئ تطبيق جديد وانسخ **Access Key**
3. افتح `services/unsplash.js` واستبدل:
```javascript
const UNSPLASH_ACCESS_KEY = 'YOUR_KEY_HERE';
```

> بدون المفتاح، التطبيق يستخدم مجموعة مختارة من الصور — يعمل بشكل ممتاز!

---

## 📁 هيكل المشروع

```
rose-morning-app/
├── App.js                    ← نقطة البداية
├── app.json                  ← إعدادات Expo
├── eas.json                  ← إعدادات البناء
├── package.json              ← المتطلبات
├── babel.config.js
├── screens/
│   ├── HomeScreen.js         ← الشاشة الرئيسية
│   └── SettingsScreen.js     ← الإعدادات
├── services/
│   ├── unsplash.js           ← جلب الصور
│   └── notifications.js      ← الإشعارات
└── assets/                   ← الأيقونات والصور
    ├── icon.png              (1024x1024)
    ├── adaptive-icon.png     (1024x1024)
    ├── splash.png            (1284x2778)
    └── favicon.png           (48x48)
```

---

## 📸 مطلوب منك قبل النشر

| الملف | الحجم | الوصف |
|-------|-------|-------|
| `icon.png` | 1024×1024 | أيقونة التطبيق |
| `adaptive-icon.png` | 1024×1024 | أيقونة أندرويد (بدون خلفية) |
| `splash.png` | 1284×2778 | شاشة البداية |
| `favicon.png` | 48×48 | أيقونة الويب |

يمكنك إنشاؤها بـ **Figma** أو **Canva** بسهولة — استخدم أيقونة 🌹 على خلفية وردية.

---

## 💰 التكاليف

| الخدمة | التكلفة |
|--------|---------|
| Expo/EAS | مجاني (للمشاريع الصغيرة) |
| Google Play Developer | $25 (مرة واحدة) |
| Apple Developer | $99/سنة |
| Unsplash API | مجاني |

---

## الدعم

للأسئلة والمشاكل: افتح Issue على الـ Repository.

**صباح الورد** 🌹 — وردة جميلة كل يوم
