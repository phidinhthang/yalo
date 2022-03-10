import { useTranslation } from 'react-i18next';

import { Paths } from '../types/util-types';
import translations from '../locales/en/translation.json';

type TranslationKeys = Paths<typeof translations>;

interface DateTranslationType {
  time?: Date;
  date?: Date;
}

export const useTypeSafeTranslation = () => {
  const { t, i18n } = useTranslation();
  t('fdasf', {});
  return {
    t: (s: TranslationKeys, f?: DateTranslationType) => t(s, f),
    i18n,
  };
};
