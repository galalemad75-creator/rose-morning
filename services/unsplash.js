// services/unsplash.js
// ═══════════════════════════════════════════════════
// خدمة جلب صور الورود من Unsplash
// ═══════════════════════════════════════════════════
//
// ⚠️ للحصول على مفتاح Unsplash API مجاني:
// 1. سجّل على https://unsplash.com/developers
// 2. أنشئ تطبيق جديد (New Application)
// 3. انسخ Access Key والصقه أدناه
//
// ═══════════════════════════════════════════════════

const UNSPLASH_ACCESS_KEY = 'YOUR_UNSPLASH_ACCESS_KEY_HERE';

// صور ورود مختارة مسبقاً (تستخدم كاحتياطي أو بدون API)
const CURATED_ROSES = [
  {
    id: 'photo-1490750967868-88aa4f44baee',
    photographer: 'Annie Spratt',
    color: '#f5e6e8',
  },
  {
    id: 'photo-1455659817273-f96807779a8a',
    photographer: 'Annie Spratt',
    color: '#f0d4d8',
  },
  {
    id: 'photo-1518882461567-80586e96de89',
    photographer: 'Igor Savelev',
    color: '#e8c8cc',
  },
  {
    id: 'photo-1494972308805-463bc619d34e',
    photographer: 'J Lee',
    color: '#f2e0e3',
  },
  {
    id: 'photo-1562690868-60bbe7293e94',
    photographer: 'Diana Akhmetianova',
    color: '#edd5d9',
  },
  {
    id: 'photo-1563241527-3004b7be0ffd',
    photographer: 'Jez Timms',
    color: '#e5ccd1',
  },
  {
    id: 'photo-1526047932273-341f2a7631f9',
    photographer: 'Paolo Nicolello',
    color: '#f0d8dc',
  },
  {
    id: 'photo-1508610048659-a06b669e3321',
    photographer: 'Ricardo Gomez Angel',
    color: '#e8d0d5',
  },
  {
    id: 'photo-1559563458-527698bf5295',
    photographer: 'Rafaelle Caira',
    color: '#f5e2e5',
  },
  {
    id: 'photo-1590377975644-65be0403b0c3',
    photographer: 'Kelly Sikkema',
    color: '#edcdd3',
  },
  {
    id: 'photo-1444021465936-c6ca81d39b84',
    photographer: 'Kier In Sight',
    color: '#e0c4ca',
  },
  {
    id: 'photo-1457089328109-e5d9bd499191',
    photographer: 'Aranxa Esteve',
    color: '#f3dde0',
  },
  {
    id: 'photo-1495231916356-a86217efff12',
    photographer: 'Sandy Millar',
    color: '#eed8dc',
  },
  {
    id: 'photo-1530092285049-1c42085fd395',
    photographer: 'Element5 Digital',
    color: '#e6ced3',
  },
  {
    id: 'photo-1468327768560-75b778cbb551',
    photographer: 'Sandy Millar',
    color: '#f0d6da',
  },
  {
    id: 'photo-1519378058457-4c29a0a2efac',
    photographer: 'Kelly Sikkema',
    color: '#e8cdd2',
  },
  {
    id: 'photo-1487530811176-3780de880c2d',
    photographer: 'Annie Spratt',
    color: '#f2dce0',
  },
  {
    id: 'photo-1528728719372-3f0e09e04665',
    photographer: 'Pawel Czerwinski',
    color: '#edcfd4',
  },
  {
    id: 'photo-1572726729207-a78d6feb18d7',
    photographer: 'Stephanie Harvey',
    color: '#f0d4d9',
  },
  {
    id: 'photo-1579783902614-a3fb3927b6a5',
    photographer: 'Florian Klauer',
    color: '#e4c8ce',
  },
  {
    id: 'photo-1490750967868-88aa4f44baee',
    photographer: 'Annie Spratt',
    color: '#f5e6e8',
  },
  {
    id: 'photo-1595044235954-1d5ac5c44e2e',
    photographer: 'Evie S.',
    color: '#eed2d7',
  },
  {
    id: 'photo-1468276311594-df7cb65d8df6',
    photographer: 'Birmingham Museums Trust',
    color: '#e0c0c6',
  },
  {
    id: 'photo-1578393098337-5574e6284906',
    photographer: 'Hanna Peras',
    color: '#f3dde1',
  },
  {
    id: 'photo-1567696153798-9111f9cd3d09',
    photographer: 'Jessica Delp',
    color: '#eaced3',
  },
  {
    id: 'photo-1518621736915-f3b1c41bfd00',
    photographer: 'Annie Spratt',
    color: '#edced4',
  },
  {
    id: 'photo-1474557157379-8aa74a6ef541',
    photographer: 'Joanna Kosinska',
    color: '#f0d6db',
  },
  {
    id: 'photo-1494256997604-768d1f608cac',
    photographer: 'Karly Santiago',
    color: '#e8ced3',
  },
  {
    id: 'photo-1522335789203-aabd1fc54bc9',
    photographer: 'Kelly Sikkema',
    color: '#f2dade',
  },
  {
    id: 'photo-1560717789-0ac7c58ac90a',
    photographer: 'Jamie Street',
    color: '#eaced2',
  },
];

/**
 * بناء رابط الصورة من معرف Unsplash
 */
function buildImageUrl(photoId, width = 800) {
  return `https://images.unsplash.com/${photoId}?w=${width}&q=80&auto=format&fit=crop`;
}

/**
 * جلب وردة عشوائية من Unsplash API
 * إذا فشل، يعود للصور المختارة مسبقاً
 */
export const getDailyRose = async () => {
  // محاولة استخدام Unsplash API أولاً
  if (UNSPLASH_ACCESS_KEY && UNSPLASH_ACCESS_KEY !== 'YOUR_UNSPLASH_ACCESS_KEY_HERE') {
    try {
      const response = await fetch(
        'https://api.unsplash.com/photos/random?query=rose&orientation=portrait&content_filter=high',
        {
          headers: {
            Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}`,
            'Accept-Version': 'v1',
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        return {
          id: data.id,
          imageUrl: data.urls.full,
          thumbUrl: data.urls.regular,
          photographer: data.user.name,
          photographerUrl: data.user.links.html,
          color: data.color || '#f0d4d8',
          source: 'unsplash-api',
        };
      }
    } catch (error) {
      console.log('Unsplash API غير متاح، استخدام الصور المختارة:', error.message);
    }
  }

  // fallback: استخدام الصور المختارة مسبقاً
  return getRandomCuratedRose();
};

/**
 * الحصول على وردة عشوائية من المجموعة المختارة
 */
export const getRandomCuratedRose = () => {
  const index = Math.floor(Math.random() * CURATED_ROSES.length);
  const photo = CURATED_ROSES[index];

  return {
    id: photo.id,
    imageUrl: buildImageUrl(photo.id, 1200),
    thumbUrl: buildImageUrl(photo.id, 800),
    photographer: photo.photographer,
    photographerUrl: `https://unsplash.com/@${photo.photographer.toLowerCase().replace(' ', '')}`,
    color: photo.color,
    source: 'curated',
  };
};

/**
 * الحصول على وردة حسب اليوم (نفس الصورة طوال اليوم)
 */
export const getDailyRoseByDate = () => {
  const today = new Date();
  const dayOfYear = Math.floor(
    (today - new Date(today.getFullYear(), 0, 0)) / 86400000
  );
  const index = dayOfYear % CURATED_ROSES.length;
  const photo = CURATED_ROSES[index];

  return {
    id: photo.id,
    imageUrl: buildImageUrl(photo.id, 1200),
    thumbUrl: buildImageUrl(photo.id, 800),
    photographer: photo.photographer,
    photographerUrl: `https://unsplash.com/@${photo.photographer.toLowerCase().replace(' ', '')}`,
    color: photo.color,
    source: 'daily',
  };
};

/**
 * الصور المختارة (للاستخدام المباشر)
 */
export { CURATED_ROSES, buildImageUrl };
