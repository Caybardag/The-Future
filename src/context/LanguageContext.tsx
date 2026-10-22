import React, { createContext, useContext, useState, useEffect } from "react";
import { LanguageCode } from "../types";
import { getUITranslation } from "../utils/translations";

interface LanguageContextType {
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
  t: (key: string) => string;
}

const SUPPORTED_LANGUAGES: LanguageCode[] = ["tr", "en", "es", "de", "fr", "zh", "ja"];

const detectBrowserLanguage = (): LanguageCode => {
  if (typeof navigator === "undefined") return "tr";
  const browserLangs = navigator.languages ? Array.from(navigator.languages) : [navigator.language];
  for (const l of browserLangs) {
    if (!l) continue;
    const code = l.split("-")[0].toLowerCase() as LanguageCode;
    if (SUPPORTED_LANGUAGES.includes(code)) {
      return code;
    }
  }
  return "tr";
};

const LanguageContext = createContext<LanguageContextType>({
  language: "tr",
  setLanguage: () => {},
  t: (key: string) => key,
});

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<LanguageCode>("tr");

  const setLanguage = (lang: LanguageCode) => {
    setLanguageState(lang);
  };

  const t = (key: string) => getUITranslation(language, key);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
