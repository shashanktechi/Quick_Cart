import React from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { setLanguage } from '../app/uiSlice';
import { Globe } from 'lucide-react';

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();
  const dispatch = useDispatch();
  const currentLang = useSelector((state) => state.ui.language);

  const changeLanguage = (lang) => {
    i18n.changeLanguage(lang);
    dispatch(setLanguage(lang));
  };

  return (
    <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 rounded-full p-1 border border-gray-200/55 dark:border-gray-700/50">
      <div className="p-1.5 text-gray-500 dark:text-gray-400">
        <Globe size={16} />
      </div>
      <button
        onClick={() => changeLanguage('en')}
        className={`px-3 py-1 text-xs font-semibold rounded-full transition-all duration-200 ${
          currentLang === 'en'
            ? 'bg-teal text-white shadow-sm'
            : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
        }`}
      >
        EN
      </button>
      <button
        onClick={() => changeLanguage('te')}
        className={`px-3 py-1 text-xs font-semibold rounded-full transition-all duration-200 ${
          currentLang === 'te'
            ? 'bg-teal text-white shadow-sm'
            : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
        }`}
      >
        తె
      </button>
      <button
        onClick={() => changeLanguage('hi')}
        className={`px-3 py-1 text-xs font-semibold rounded-full transition-all duration-200 ${
          currentLang === 'hi'
            ? 'bg-teal text-white shadow-sm'
            : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
        }`}
      >
        हिं
      </button>
    </div>
  );
};

export default LanguageSwitcher;
