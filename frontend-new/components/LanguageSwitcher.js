'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useLanguage } from '../lib/contexts/LanguageContext';
import './LanguageSwitcher.css';

const LanguageSwitcher = ({ variant = 'default' }) => {
  const { language, changeLanguage, t, isRTL } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLanguageChange = (newLanguage) => {
    changeLanguage(newLanguage);
    setIsOpen(false);
  };

  const getCurrentLanguageFlag = () => {
    return language === 'ar' ? '🇸🇦' : '🇺🇸';
  };

  const getCurrentLanguageName = () => {
    return language === 'ar' ? t('arabic') : t('english');
  };

  const variants = {
    default: {
      container: 'language-switcher-default',
      button: 'language-button-default',
      dropdown: 'language-dropdown-default',
      item: 'language-item-default'
    },
    compact: {
      container: 'language-switcher-compact',
      button: 'language-button-compact',
      dropdown: 'language-dropdown-compact',
      item: 'language-item-compact'
    },
    admin: {
      container: 'language-switcher-admin',
      button: 'language-button-admin',
      dropdown: 'language-dropdown-admin',
      item: 'language-item-admin'
    }
  };

  const currentVariant = variants[variant] || variants.default;

  return (
    <div className={`language-switcher ${currentVariant.container}`} ref={dropdownRef}>
      <button
        className={`language-button ${currentVariant.button}`}
        onClick={() => setIsOpen(!isOpen)}
        aria-label={t('language')}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <span className="language-flag">{getCurrentLanguageFlag()}</span>
        <span className="language-name">{getCurrentLanguageName()}</span>
        <span className={`language-arrow ${isOpen ? 'open' : ''}`}>
          <svg width="12" height="8" viewBox="0 0 12 8" fill="none">
            <path
              d="M1 1.5L6 6.5L11 1.5"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      </button>

      {isOpen && (
        <div className={`language-dropdown ${currentVariant.dropdown}`}>
          <div className="language-dropdown-content">
            <button
              className={`language-item ${currentVariant.item} ${language === 'en' ? 'active' : ''}`}
              onClick={() => handleLanguageChange('en')}
            >
              <span className="language-flag">🇺🇸</span>
              <span className="language-name">{t('english')}</span>
              {language === 'en' && (
                <span className="language-check">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path
                      d="M13.5 4.5L6 12L2.5 8.5"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
              )}
            </button>

            <button
              className={`language-item ${currentVariant.item} ${language === 'ar' ? 'active' : ''}`}
              onClick={() => handleLanguageChange('ar')}
            >
              <span className="language-flag">🇸🇦</span>
              <span className="language-name">{t('arabic')}</span>
              {language === 'ar' && (
                <span className="language-check">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path
                      d="M13.5 4.5L6 12L2.5 8.5"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default LanguageSwitcher;
