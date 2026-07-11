export interface StoreSettings {
  whatsapp: string;
  email: string;
  facebook: string;
  tiktok: string;
  instagram: string;
  phone: string;
  fbPixelId: string;
  tiktokPixelId: string;
}

const STORAGE_KEYS = {
  WHATSAPP: 'elbat_setting_whatsapp',
  EMAIL: 'elbat_setting_email',
  FACEBOOK: 'elbat_setting_facebook',
  TIKTOK: 'elbat_setting_tiktok',
  INSTAGRAM: 'elbat_setting_instagram',
  PHONE: 'elbat_setting_phone',
  FB_PIXEL: 'elbat_fb_pixel_id',
  TIKTOK_PIXEL: 'elbat_tiktok_pixel_id',
};

const DEFAULT_SETTINGS: StoreSettings = {
  whatsapp: '201065613067',
  email: 'elbattshop@gmail.com',
  facebook: 'https://www.facebook.com/profile.php?id=61590457508222',
  tiktok: 'https://www.tiktok.com/@elbat1327?lang=en',
  instagram: 'https://www.instagram.com/elbat_shop/',
  phone: '+20 10 65613067',
  fbPixelId: '1404279981755342',
  tiktokPixelId: '',
};

export const getStoreSettings = (): StoreSettings => {
  return {
    whatsapp: localStorage.getItem(STORAGE_KEYS.WHATSAPP) || DEFAULT_SETTINGS.whatsapp,
    email: localStorage.getItem(STORAGE_KEYS.EMAIL) || DEFAULT_SETTINGS.email,
    facebook: localStorage.getItem(STORAGE_KEYS.FACEBOOK) || DEFAULT_SETTINGS.facebook,
    tiktok: localStorage.getItem(STORAGE_KEYS.TIKTOK) || DEFAULT_SETTINGS.tiktok,
    instagram: localStorage.getItem(STORAGE_KEYS.INSTAGRAM) || DEFAULT_SETTINGS.instagram,
    phone: localStorage.getItem(STORAGE_KEYS.PHONE) || DEFAULT_SETTINGS.phone,
    fbPixelId: localStorage.getItem(STORAGE_KEYS.FB_PIXEL) || DEFAULT_SETTINGS.fbPixelId,
    tiktokPixelId: localStorage.getItem(STORAGE_KEYS.TIKTOK_PIXEL) || DEFAULT_SETTINGS.tiktokPixelId,
  };
};

export const saveStoreSettings = (settings: Partial<StoreSettings>) => {
  if (settings.whatsapp !== undefined) localStorage.setItem(STORAGE_KEYS.WHATSAPP, settings.whatsapp.trim());
  if (settings.email !== undefined) localStorage.setItem(STORAGE_KEYS.EMAIL, settings.email.trim());
  if (settings.facebook !== undefined) localStorage.setItem(STORAGE_KEYS.FACEBOOK, settings.facebook.trim());
  if (settings.tiktok !== undefined) localStorage.setItem(STORAGE_KEYS.TIKTOK, settings.tiktok.trim());
  if (settings.instagram !== undefined) localStorage.setItem(STORAGE_KEYS.INSTAGRAM, settings.instagram.trim());
  if (settings.phone !== undefined) localStorage.setItem(STORAGE_KEYS.PHONE, settings.phone.trim());
  if (settings.fbPixelId !== undefined) localStorage.setItem(STORAGE_KEYS.FB_PIXEL, settings.fbPixelId.trim());
  if (settings.tiktokPixelId !== undefined) localStorage.setItem(STORAGE_KEYS.TIKTOK_PIXEL, settings.tiktokPixelId.trim());
};
