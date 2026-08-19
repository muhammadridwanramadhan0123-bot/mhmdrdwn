import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import uiTranslations from "../i18n/uiTranslations";


const LanguageContext =
  createContext(null);


const LANGUAGE_STORAGE_KEY =
  "jmt-language";

const DEFAULT_LANGUAGE =
  "id";

const SUPPORTED_LANGUAGES = [
  "id",
  "en",
];


function normalizeLanguage(value) {
  const language =
    String(value || "")
      .trim()
      .toLowerCase();

  return SUPPORTED_LANGUAGES.includes(
    language
  )
    ? language
    : DEFAULT_LANGUAGE;
}


function getInitialLanguage() {
  if (
    typeof window ===
    "undefined"
  ) {
    return DEFAULT_LANGUAGE;
  }

  try {
    const saved =
      window.localStorage.getItem(
        LANGUAGE_STORAGE_KEY
      );

    if (saved) {
      return normalizeLanguage(
        saved
      );
    }
  } catch (error) {
    console.warn(
      "Bahasa tersimpan tidak dapat dibaca:",
      error
    );
  }

  return DEFAULT_LANGUAGE;
}


/*
 * Membaca nested translation:
 *
 * t("nav.home")
 * t("contactPage.heroTitle")
 * t("contactPage.services.simrs")
 */
function getTranslationValue(
  dictionary,
  key
) {
  if (
    !dictionary ||
    !key
  ) {
    return undefined;
  }

  return String(key)
    .split(".")
    .reduce(
      (
        current,
        part
      ) => {
        if (
          current ===
            undefined ||
          current ===
            null
        ) {
          return undefined;
        }

        return current[part];
      },
      dictionary
    );
}


export function LanguageProvider({
  children,
}) {
  const [
    language,
    setLanguageState,
  ] = useState(
    getInitialLanguage
  );


  /*
   * ====================================================
   * SET LANGUAGE
   * ====================================================
   */
  const setLanguage =
    useCallback(
      (nextLanguage) => {
        setLanguageState(
          normalizeLanguage(
            nextLanguage
          )
        );
      },
      []
    );


  /*
   * ====================================================
   * TOGGLE LANGUAGE
   * ====================================================
   */
  const toggleLanguage =
    useCallback(
      () => {
        setLanguageState(
          (current) =>
            current === "id"
              ? "en"
              : "id"
        );
      },
      []
    );


  /*
   * ====================================================
   * TRANSLATE
   * ====================================================
   */
  const t =
    useCallback(
      (
        key,
        fallback = ""
      ) => {
        const activeDictionary =
          uiTranslations?.[
            language
          ] || {};

        const activeValue =
          getTranslationValue(
            activeDictionary,
            key
          );

        /*
         * Translation ditemukan
         * pada bahasa aktif.
         */
        if (
          activeValue !==
            undefined &&
          activeValue !== null
        ) {
          return activeValue;
        }


        /*
         * Development warning.
         *
         * Membantu mengetahui
         * key EN/ID yang belum dibuat.
         */
        if (
          import.meta.env.DEV
        ) {
          console.warn(
            `[i18n] Missing translation "${key}" for language "${language}".`
          );
        }


        /*
         * Jika bahasa Indonesia aktif,
         * fallback ke parameter fallback.
         */
        if (
          language === "id"
        ) {
          const indonesiaValue =
            getTranslationValue(
              uiTranslations?.id,
              key
            );

          return (
            indonesiaValue ??
            fallback ??
            key
          );
        }


        /*
         * Untuk English:
         *
         * Jangan otomatis mengambil
         * Bahasa Indonesia dari dictionary
         * sebelum fallback.
         *
         * Tetapi solusi utamanya tetap:
         * semua key EN harus tersedia
         * di uiTranslations.en.
         */
        if (fallback) {
          return fallback;
        }


        const indonesiaValue =
          getTranslationValue(
            uiTranslations?.id,
            key
          );

        return (
          indonesiaValue ??
          key
        );
      },
      [language]
    );


  /*
   * ====================================================
   * SAVE LANGUAGE
   * ====================================================
   */
  useEffect(() => {
    if (
      typeof window ===
      "undefined"
    ) {
      return;
    }

    try {
      window.localStorage.setItem(
        LANGUAGE_STORAGE_KEY,
        language
      );
    } catch (error) {
      console.warn(
        "Pilihan bahasa tidak dapat disimpan:",
        error
      );
    }

    document.documentElement.lang =
      language;
  }, [language]);


  /*
   * ====================================================
   * SYNC LANGUAGE ANTAR TAB
   * ====================================================
   */
  useEffect(() => {
    if (
      typeof window ===
      "undefined"
    ) {
      return undefined;
    }

    function handleStorage(
      event
    ) {
      if (
        event.key !==
        LANGUAGE_STORAGE_KEY
      ) {
        return;
      }

      setLanguageState(
        normalizeLanguage(
          event.newValue
        )
      );
    }

    window.addEventListener(
      "storage",
      handleStorage
    );

    return () => {
      window.removeEventListener(
        "storage",
        handleStorage
      );
    };
  }, []);


  /*
   * ====================================================
   * CONTEXT VALUE
   * ====================================================
   */
  const value =
    useMemo(
      () => ({
        language,

        locale:
          language,

        isIndonesian:
          language === "id",

        isEnglish:
          language === "en",

        setLanguage,

        toggleLanguage,

        t,
      }),
      [
        language,
        setLanguage,
        toggleLanguage,
        t,
      ]
    );


  return (
    <LanguageContext.Provider
      value={value}
    >
      {children}
    </LanguageContext.Provider>
  );
}


export function useLanguage() {
  const context =
    useContext(
      LanguageContext
    );

  if (!context) {
    throw new Error(
      "useLanguage harus digunakan di dalam LanguageProvider."
    );
  }

  return context;
}