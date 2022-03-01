import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import translationVi from '../locales/vi/translation.json';
import translationEn from '../locales/en/translation.json';
import { isDate, formatDistanceToNow, formatDistance } from 'date-fns';
import { enUS, vi } from 'date-fns/locale';

const locales = { en: enUS, vi };

const DETECTION_OPTIONS = {
  order: ['localStorage', 'navigator'],
};

function createDateFormatOptions(format: string): Intl.DateTimeFormatOptions {
  switch (format) {
    case 'intlDate': {
      // EN returns 3/16/2021, 5:45 PM
      return {
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
      };
    }
    case 'intlTime': {
      // EN returns 05:45 PM
      return {
        hour: 'numeric',
        minute: 'numeric',
      };
    }
    default: {
      // EN returns Tuesday, March 16, 2021, 5:45 PM
      return {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
      };
    }
  }
}

export const initI18next = () => {
  i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
      detection: DETECTION_OPTIONS,
      resources: {
        vi: {
          translation: translationVi,
        },
        en: {
          translation: translationEn,
        },
      },
      fallbackLng: 'vi',
      interpolation: {
        escapeValue: false,
        format: (value, format, lng) => {
          if (format === 'ago') {
            return formatDistance(value, new Date(), {
              locale: locales[lng as keyof typeof locales],
              addSuffix: true,
            });
          }

          return isDate(value) && format
            ? new Intl.DateTimeFormat(lng, createDateFormatOptions(format))
                .format(value)
                .toString()
            : value;
        },
      },
    });
};
