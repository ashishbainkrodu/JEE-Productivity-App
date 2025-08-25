export const isWeb = typeof window !== 'undefined';
export const isMobile = !isWeb;
export const isProduction = process.env.NODE_ENV === 'production';

export const getPlatform = () => {
  if (isWeb) return 'web';
  if (typeof navigator !== 'undefined') {
    if (/Android/i.test(navigator.userAgent)) return 'android';
    if (/iPhone|iPad|iPod/i.test(navigator.userAgent)) return 'ios';
  }
  return 'unknown';
};

export const getStorage = () => {
  if (isWeb) {
    return {
      getItem: (key: string) => localStorage.getItem(key),
      setItem: (key: string, value: string) => localStorage.setItem(key, value),
      removeItem: (key: string) => localStorage.removeItem(key),
      clear: () => localStorage.clear(),
    };
  }
  return null;
};
