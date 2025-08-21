"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

const I18nContext = createContext(null);

const MESSAGES = {
  "zh-CN": {
    reset: "重置",
    timer_title: "番茄时钟",
    start: "开始",
    pause: "暂停",
    mute: "静音",
    unmute: "取消静音",
    language: "语言",
  },
  "zh-TW": {
    reset: "重置",
    timer_title: "番茄時鐘",
    start: "開始",
    pause: "暫停",
    mute: "靜音",
    unmute: "取消靜音",
    language: "語言",
  },
  en: {
    reset: "Reset",
    timer_title: "Pomodoro",
    start: "Start",
    pause: "Pause",
    mute: "Mute",
    unmute: "Unmute",
    language: "Language",
  },
  ja: {
    reset: "リセット",
    timer_title: "ポモドーロ",
    start: "開始",
    pause: "一時停止",
    mute: "ミュート",
    unmute: "ミュート解除",
    language: "言語",
  },
};

const getBrowserLocale = () => {
  try {
    const stored = window.localStorage.getItem("engrossed.locale");
    if (stored && MESSAGES[stored]) return stored;
    const nav = navigator.language || navigator.userLanguage || "zh-CN";
    const base = nav.toLowerCase();
    if (base.startsWith("zh-cn") || base.startsWith("zh-hans")) return "zh-CN";
    if (base.startsWith("zh-tw") || base.startsWith("zh-hant")) return "zh-TW";
    if (base.startsWith("ja")) return "ja";
    return "en";
  } catch {
    return "zh-CN";
  }
};

export function I18nProvider({ children }) {
  // 确保 SSR 与 CSR 初始值一致，避免水合不匹配
  const [locale, setLocale] = useState("zh-CN");

  // 挂载后再根据浏览器与本地存储更新语言
  useEffect(() => {
    const detected = getBrowserLocale();
    if (detected && detected !== locale) {
      setLocale(detected);
    }
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem("engrossed.locale", locale);
    } catch {}
  }, [locale]);

  const t = useMemo(() => {
    const dict = MESSAGES[locale] || MESSAGES["en"];
    return (key) => dict[key] ?? key;
  }, [locale]);

  const value = useMemo(
    () => ({
      locale,
      setLocale,
      t,
      messages: MESSAGES,
      availableLocales: Object.keys(MESSAGES),
    }),
    [locale, t]
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
}
